-- Customer job-invoice payment flow
-- Customers submit against the public invoice token; owner/admin reviews the job_payments record.
-- The job_invoices/job_payments tables are the authoritative customer invoice/payment workflow.

create or replace function public.submit_customer_job_payment(
  p_token uuid,p_amount numeric,p_method text,p_reference text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_invoice public.job_invoices%rowtype;
  v_paid numeric;
  v_payment_id uuid;
  v_method text;
begin
  if p_token is null then raise exception 'Invoice token is required'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Enter a valid payment amount'; end if;
  if p_reference is null or length(btrim(p_reference)) < 2 or length(p_reference) > 120 then
    raise exception 'Enter a valid payment reference';
  end if;
  v_method:=btrim(coalesce(p_method,''));
  if v_method not in ('Cash App','Venmo','Check') then raise exception 'Choose a supported payment method'; end if;

  select * into v_invoice from public.job_invoices where public_token=p_token for update;
  if not found then raise exception 'Invoice link is invalid'; end if;
  if v_invoice.status in ('draft','void','paid') then raise exception 'This invoice is not accepting payments'; end if;

  select coalesce(sum(amount),0) into v_paid
  from public.job_payments where invoice_id=v_invoice.id and status='recorded';

  if exists(select 1 from public.job_payments where invoice_id=v_invoice.id and status='pending') then
    raise exception 'A payment submission is already awaiting DASH verification';
  end if;
  if p_amount > greatest(v_invoice.amount-v_paid,0) then
    raise exception 'Payment amount exceeds the remaining invoice balance';
  end if;

  insert into public.job_payments(invoice_id,job_id,customer_id,amount,status,method,processor_reference,notes)
  values(v_invoice.id,v_invoice.job_id,v_invoice.customer_id,p_amount,'pending',v_method,btrim(p_reference),
    'Customer submitted payment details through the secure invoice portal; awaiting DASH verification.')
  returning id into v_payment_id;

  return jsonb_build_object('payment_id',v_payment_id,'invoice_number',v_invoice.invoice_number,
    'amount_submitted',p_amount,'status','pending');
end;
$$;

create or replace function public.get_job_payment_review_data()
returns table(
  payment_id uuid,invoice_id uuid,invoice_number text,amount numeric,method text,payment_status text,
  transaction_reference text,created_at timestamptz,customer_name text,customer_email text,service_name text
)
language plpgsql security definer set search_path = '' as $$
begin
  if not (public.dispatch_is_owner() or public.dispatch_is_admin()) then
    raise exception 'Owner or administrator access required';
  end if;
  return query
  select p.id,p.invoice_id,i.invoice_number,p.amount,p.method,p.status,p.processor_reference,p.created_at,
    c.name,c.email,j.service_name
  from public.job_payments p
  join public.job_invoices i on i.id=p.invoice_id
  join public.business_jobs j on j.id=p.job_id
  left join public.customers c on c.id=p.customer_id
  order by p.created_at desc limit 100;
end;
$$;

create or replace function public.get_job_invoice_admin_data()
returns table(
  invoice_id uuid,invoice_number text,amount numeric,invoice_status text,due_at timestamptz,
  created_at timestamptz,customer_name text,service_name text,paid_total numeric
)
language plpgsql security definer set search_path = '' as $$
begin
  if not (public.dispatch_is_owner() or public.dispatch_is_admin()) then
    raise exception 'Owner or administrator access required';
  end if;
  return query
  select i.id,i.invoice_number,i.amount,i.status,i.due_at,i.created_at,c.name,j.service_name,
    coalesce((select sum(p.amount) from public.job_payments p where p.invoice_id=i.id and p.status='recorded'),0)
  from public.job_invoices i
  join public.business_jobs j on j.id=i.job_id
  left join public.customers c on c.id=i.customer_id
  where i.status<>'void'
  order by i.created_at desc limit 100;
end;
$$;

create or replace function public.set_job_payment_verification(
  p_payment_id uuid,p_status text,p_notes text default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_payment public.job_payments%rowtype;
  v_paid numeric;
  v_invoice_amount numeric;
  v_invoice_status text;
begin
  if not (public.dispatch_is_owner() or public.dispatch_is_admin()) then
    raise exception 'Only a DASH owner or administrator can verify customer payments';
  end if;
  if p_status not in ('verified','not_received','payment_issue') then raise exception 'Invalid verification status'; end if;

  select * into v_payment from public.job_payments where id=p_payment_id for update;
  if not found then raise exception 'Payment submission not found'; end if;
  if v_payment.status<>'pending' then raise exception 'This payment submission has already been reviewed'; end if;

  update public.job_payments
  set status=case when p_status='verified' then 'recorded' else 'failed' end,
      paid_at=case when p_status='verified' then now() else null end,
      notes=concat_ws(E'\\n',nullif(notes,''),nullif(p_notes,''),
        case when p_status='verified' then 'Verified by DASH.' else 'Marked not received / payment issue by DASH.' end)
  where id=p_payment_id;

  select coalesce(sum(amount),0) into v_paid
  from public.job_payments where invoice_id=v_payment.invoice_id and status='recorded';
  select amount,status into v_invoice_amount,v_invoice_status
  from public.job_invoices where id=v_payment.invoice_id;

  if v_invoice_status<>'void' then
    update public.job_invoices set status=case
      when v_paid<=0 then 'sent'
      when v_paid>=v_invoice_amount and v_invoice_amount>0 then 'paid'
      else 'partially_paid' end,updated_at=now()
    where id=v_payment.invoice_id;
  end if;

  update public.business_jobs set payment_status=case
    when v_paid<=0 then 'unpaid'
    when v_invoice_amount>0 and v_paid>=v_invoice_amount then 'paid'
    else 'partially_paid' end
  where id=v_payment.job_id;

  return jsonb_build_object('payment_id',p_payment_id,'status',p_status,'invoice_id',v_payment.invoice_id,
    'job_id',v_payment.job_id,'verified_total',v_paid,'invoice_total',v_invoice_amount);
end;
$$;

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

-- No direct anonymous table access: customers submit only through the invoice-token RPC.
revoke all on function public.submit_customer_job_payment(uuid,numeric,text,text) from public,authenticated;
grant execute on function public.submit_customer_job_payment(uuid,numeric,text,text) to anon,authenticated;
revoke all on function public.get_job_payment_review_data() from public,anon;
grant execute on function public.get_job_payment_review_data() to authenticated;
revoke all on function public.get_job_invoice_admin_data() from public,anon;
grant execute on function public.get_job_invoice_admin_data() to authenticated;
revoke all on function public.set_job_payment_verification(uuid,text,text) from public,anon;
grant execute on function public.set_job_payment_verification(uuid,text,text) to authenticated;
