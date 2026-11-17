-- Managers may schedule approved services regardless of invoice payment status.
-- Payment is collected after service completion.

create or replace function public.get_manager_payment_status()
returns table(
  payment_id uuid,
  invoice_id uuid,
  payment_status text,
  service_schedulable boolean
)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_role text;
begin
  select lower(coalesce(role,''))
  into v_role
  from public.employees
  where auth_user_id=auth.uid()
  limit 1;

  if v_role <> 'manager' then
    raise exception 'Manager access required';
  end if;

  return query
  select p.id,p.invoice_id,p.payment_status,true
  from public.payments p
  order by p.created_at desc
  limit 100;
end;
$$;

comment on function public.get_manager_payment_status() is
  'Returns payment records for manager visibility. service_schedulable is true regardless of payment status because payment is collected after service.';
