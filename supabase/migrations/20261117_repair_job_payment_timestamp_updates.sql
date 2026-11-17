-- Fix trigger/RPC updates that referenced business_jobs.updated_at (column does not exist).
-- Preserve updated_at only on tables that actually define it.

create or replace function public.refresh_job_payment_gate()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_paid numeric; v_invoice_amount numeric;
begin
  select coalesce(sum(p.amount),0) into v_paid
  from public.job_payments p where p.invoice_id=new.invoice_id and p.status='recorded';
  select coalesce(i.amount,0) into v_invoice_amount from public.job_invoices i where i.id=new.invoice_id;
  update public.business_jobs set payment_status=case
    when v_paid<=0 then 'unpaid'
    when v_invoice_amount>0 and v_paid>=v_invoice_amount then 'paid'
    else 'partially_paid' end
  where id=new.job_id;
  return new;
end;
$$;

create or replace function public.update_dispatch_status(
  p_business_job_id uuid,p_status text,p_note text default null
)
returns boolean language plpgsql security definer set search_path='public' as $$
declare v_emp text; old_status text; v_ts timestamptz:=now();
begin
  if not public.dispatch_is_admin() then raise exception 'Not authorized'; end if;
  if p_status not in ('UNASSIGNED','ASSIGNED','ACCEPTED','EN_ROUTE','ON_SITE','WORKING','COMPLETED','CANCELLED') then
    raise exception 'Invalid status';
  end if;
  perform public.ensure_dispatch_job(p_business_job_id);
  select assigned_employee_id,dispatch_status into v_emp,old_status
  from public.dispatch_jobs where business_job_id=p_business_job_id for update;
  update public.dispatch_jobs set dispatch_status=p_status,
    dispatcher_notes=coalesce(p_note,dispatcher_notes),updated_at=v_ts,
    accepted_at=case when p_status='ACCEPTED' then coalesce(accepted_at,v_ts) else accepted_at end,
    en_route_at=case when p_status='EN_ROUTE' then coalesce(en_route_at,v_ts) else en_route_at end,
    on_site_at=case when p_status='ON_SITE' then coalesce(on_site_at,v_ts) else on_site_at end,
    working_at=case when p_status='WORKING' then coalesce(working_at,v_ts) else working_at end,
    completed_at=case when p_status='COMPLETED' then coalesce(completed_at,v_ts) else completed_at end
  where business_job_id=p_business_job_id;
  if v_emp is not null then
    update public.employee_dispatch_status set status=case
      when p_status in ('COMPLETED','CANCELLED') then 'AVAILABLE'
      when p_status in ('ASSIGNED','ACCEPTED') then 'ASSIGNED'
      when p_status in ('EN_ROUTE','ON_SITE','WORKING') then p_status else status end,
      current_job_id=case when p_status in ('COMPLETED','CANCELLED') then null else p_business_job_id end,
      updated_at=v_ts where employee_id=v_emp;
  end if;
  insert into public.dispatch_assignment_history(business_job_id,employee_id,action,from_status,to_status,note,changed_by)
  values(p_business_job_id,v_emp,'STATUS_CHANGE',old_status,p_status,p_note,auth.uid());
  if p_status='COMPLETED' then
    update public.business_jobs set status='completed',completed_at=coalesce(completed_at,v_ts),dispatch_ready=false
    where id=p_business_job_id;
  elsif p_status='CANCELLED' then
    update public.business_jobs set status='cancelled',dispatch_ready=false where id=p_business_job_id;
  end if;
  return true;
end;
$$;

create or replace function public.sync_verified_payment_to_job()
returns trigger language plpgsql security definer set search_path='public' as $$
declare v_job_id uuid; v_invoice_total numeric;
begin
  select job_id into v_job_id from public.invoices where id=new.invoice_id limit 1;
  if v_job_id is null then
    select job_id into v_job_id from public.job_invoices where id=new.invoice_id limit 1;
  end if;
  if v_job_id is null then return new; end if;
  if lower(coalesce(new.payment_status,'')) in ('verified','received') then
    select coalesce(total,0) into v_invoice_total from public.invoices where id=new.invoice_id;
    if not found then
      select coalesce(amount,0) into v_invoice_total from public.job_invoices where id=new.invoice_id;
    end if;
    update public.business_jobs set payment_status=case
      when coalesce(v_invoice_total,0)=0 or new.amount>=v_invoice_total then 'paid'
      else 'partially_paid' end
    where id=v_job_id;
  elsif lower(coalesce(new.payment_status,'')) in ('not_received','reversed_returned','payment_issue','rejected','failed') then
    update public.business_jobs set payment_status='unpaid' where id=v_job_id;
  end if;
  return new;
end;
$$;

create or replace function public.set_payment_verification(
  p_payment_id uuid,p_status text,p_reason text default null,p_notes text default null
)
returns jsonb language plpgsql security definer set search_path='public' as $$
declare p public.payments%rowtype; v_job_id uuid;
begin
  if not (public.dispatch_is_owner() or public.dispatch_is_admin()) then
    raise exception 'Only the DASH owner can verify or reject customer payments';
  end if;
  if p_status not in ('verified','not_received','reversed_returned','payment_issue') then
    raise exception 'Invalid verification status';
  end if;
  select * into p from public.payments where id=p_payment_id for update;
  if not found then raise exception 'Payment not found'; end if;
  update public.payments set payment_status=p_status,verification_reason=p_reason,
    verification_notes=p_notes,verified_by=auth.uid(),verified_at=now() where id=p_payment_id;
  if p.invoice_id is not null then
    select job_id into v_job_id from public.invoices where id=p.invoice_id;
    if p_status='verified' then
      update public.invoices set status='paid',updated_at=now() where id=p.invoice_id;
    elsif p_status in ('not_received','reversed_returned','payment_issue') then
      update public.invoices set status='sent',updated_at=now() where id=p.invoice_id and status<>'paid';
    end if;
  end if;
  if v_job_id is not null then
    update public.business_jobs set payment_status=case when p_status='verified' then 'paid' else 'unpaid' end
    where id=v_job_id;
  end if;
  return jsonb_build_object('payment_id',p_payment_id,'status',p_status,'invoice_id',p.invoice_id,'job_id',v_job_id);
end;
$$;
