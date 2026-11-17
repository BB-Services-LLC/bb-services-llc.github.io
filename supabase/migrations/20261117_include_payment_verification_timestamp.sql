-- Include the actual verification timestamp in owner payment review results.
drop function if exists public.get_job_payment_review_data();
create function public.get_job_payment_review_data()
returns table(
  payment_id uuid,invoice_id uuid,invoice_number text,amount numeric,method text,payment_status text,
  transaction_reference text,created_at timestamptz,paid_at timestamptz,
  customer_name text,customer_email text,service_name text
)
language plpgsql security definer set search_path = '' as $$
begin
  if not (public.dispatch_is_owner() or public.dispatch_is_admin()) then
    raise exception 'Owner or administrator access required';
  end if;
  return query
  select p.id,p.invoice_id,i.invoice_number,p.amount,p.method,p.status,
    p.processor_reference,p.created_at,p.paid_at,c.name,c.email,j.service_name
  from public.job_payments p
  join public.job_invoices i on i.id=p.invoice_id
  join public.business_jobs j on j.id=p.job_id
  left join public.customers c on c.id=p.customer_id
  order by p.created_at desc limit 100;
end;
$$;
revoke all on function public.get_job_payment_review_data() from public,anon;
grant execute on function public.get_job_payment_review_data() to authenticated;
