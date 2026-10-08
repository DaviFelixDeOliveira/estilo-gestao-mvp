-- ============================================================
-- PERMISSOES DA TABELA DE HORARIOS
-- ============================================================

-- Usuario comum nao deve escrever diretamente nessa tabela.
-- A escrita deve acontecer pela RPC update_business_hours(...).
revoke all on table public.horarios_funcionamento from anon, authenticated;

-- Usuario logado pode apenas ler os proprios horarios via RLS.
grant select on table public.horarios_funcionamento to authenticated;