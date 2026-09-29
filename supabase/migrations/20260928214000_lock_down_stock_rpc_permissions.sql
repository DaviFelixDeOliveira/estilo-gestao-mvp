-- Migration: lock_down_stock_rpc_permissions
-- Revoga permissoes de execucao de public e anon e garante concessao exclusiva para authenticated

revoke execute on function public.repor_estoque(
  uuid,
  integer,
  numeric,
  text
) from public;

revoke execute on function public.ajustar_estoque(
  uuid,
  integer,
  text
) from public;

revoke execute on function public.registrar_perda(
  uuid,
  integer,
  text
) from public;

revoke execute on function public.repor_estoque(
  uuid,
  integer,
  numeric,
  text
) from anon;

revoke execute on function public.ajustar_estoque(
  uuid,
  integer,
  text
) from anon;

revoke execute on function public.registrar_perda(
  uuid,
  integer,
  text
) from anon;

grant execute on function public.repor_estoque(
  uuid,
  integer,
  numeric,
  text
) to authenticated;

grant execute on function public.ajustar_estoque(
  uuid,
  integer,
  text
) to authenticated;

grant execute on function public.registrar_perda(
  uuid,
  integer,
  text
) to authenticated;
