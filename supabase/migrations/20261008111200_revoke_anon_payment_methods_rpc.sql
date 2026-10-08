revoke all on function public.update_barbershop_payment_methods(jsonb) from public;
revoke all on function public.update_barbershop_payment_methods(jsonb) from anon;
revoke all on function public.update_barbershop_payment_methods(jsonb) from authenticated;

grant execute on function public.update_barbershop_payment_methods(jsonb) to authenticated;