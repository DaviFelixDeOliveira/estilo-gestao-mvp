-- ============================================================
-- RLS E POLICIES
-- Isolamento entre barbearias e acesso administrativo mínimo
-- ============================================================

create or replace function public.current_barbearia_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.barbearia_id
  from public.perfis p
  where p.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_user_type()
returns public.tipo_usuario
language sql
stable
security definer
set search_path = public
as $$
  select p.tipo
  from public.perfis p
  where p.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_type() = 'ADMIN'::public.tipo_usuario, false);
$$;

revoke all on function public.current_barbearia_id() from public;
revoke all on function public.current_user_type() from public;
revoke all on function public.is_admin() from public;

grant execute on function public.current_barbearia_id() to authenticated;
grant execute on function public.current_user_type() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.barbearias enable row level security;
alter table public.perfis enable row level security;
alter table public.servicos enable row level security;
alter table public.categorias_produto enable row level security;
alter table public.produtos enable row level security;
alter table public.vendas enable row level security;
alter table public.venda_itens enable row level security;
alter table public.movimentacoes_estoque enable row level security;
alter table public.despesas enable row level security;
alter table public.despesas_recorrentes enable row level security;
alter table public.ocorrencias_despesas_recorrentes enable row level security;
alter table public.portfolio enable row level security;
alter table public.horarios_funcionamento enable row level security;
alter table public.barbearia_formas_pagamento enable row level security;
alter table public.planos enable row level security;
alter table public.assinaturas enable row level security;
alter table public.retencoes_contas_excluidas enable row level security;
alter table public.pagamentos_assinatura enable row level security;
alter table public.historico_administrativo enable row level security;
alter table public.configuracoes_sistema enable row level security;
alter table public.codigos_reservados enable row level security;
alter table public.aceites_legais enable row level security;

-- BARBEARIAS
create policy barbearias_select_propria on public.barbearias
for select to authenticated
using (id = public.current_barbearia_id());

create policy barbearias_select_admin on public.barbearias
for select to authenticated
using (public.is_admin());

-- PERFIS
create policy perfis_select_proprio on public.perfis
for select to authenticated
using (user_id = auth.uid());

create policy perfis_select_admin on public.perfis
for select to authenticated
using (public.is_admin());

-- SERVICOS
create policy servicos_select_proprios on public.servicos
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy servicos_insert_proprios on public.servicos
for insert to authenticated
with check (barbearia_id = public.current_barbearia_id());
create policy servicos_update_proprios on public.servicos
for update to authenticated
using (barbearia_id = public.current_barbearia_id())
with check (barbearia_id = public.current_barbearia_id());
create policy servicos_delete_proprios on public.servicos
for delete to authenticated
using (barbearia_id = public.current_barbearia_id());

-- CATEGORIAS
create policy categorias_produto_select_proprias on public.categorias_produto
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy categorias_produto_insert_proprias on public.categorias_produto
for insert to authenticated
with check (barbearia_id = public.current_barbearia_id());
create policy categorias_produto_update_proprias on public.categorias_produto
for update to authenticated
using (barbearia_id = public.current_barbearia_id())
with check (barbearia_id = public.current_barbearia_id());
create policy categorias_produto_delete_proprias on public.categorias_produto
for delete to authenticated
using (barbearia_id = public.current_barbearia_id());

-- PRODUTOS
create policy produtos_select_proprios on public.produtos
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy produtos_insert_proprios on public.produtos
for insert to authenticated
with check (barbearia_id = public.current_barbearia_id());
create policy produtos_update_proprios on public.produtos
for update to authenticated
using (barbearia_id = public.current_barbearia_id())
with check (barbearia_id = public.current_barbearia_id());
create policy produtos_delete_proprios on public.produtos
for delete to authenticated
using (barbearia_id = public.current_barbearia_id());

-- PORTFOLIO
create policy portfolio_select_proprio on public.portfolio
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy portfolio_insert_proprio on public.portfolio
for insert to authenticated
with check (barbearia_id = public.current_barbearia_id());
create policy portfolio_update_proprio on public.portfolio
for update to authenticated
using (barbearia_id = public.current_barbearia_id())
with check (barbearia_id = public.current_barbearia_id());
create policy portfolio_delete_proprio on public.portfolio
for delete to authenticated
using (barbearia_id = public.current_barbearia_id());

-- HORARIOS
create policy horarios_select_proprios on public.horarios_funcionamento
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy horarios_insert_proprios on public.horarios_funcionamento
for insert to authenticated
with check (barbearia_id = public.current_barbearia_id());
create policy horarios_update_proprios on public.horarios_funcionamento
for update to authenticated
using (barbearia_id = public.current_barbearia_id())
with check (barbearia_id = public.current_barbearia_id());
create policy horarios_delete_proprios on public.horarios_funcionamento
for delete to authenticated
using (barbearia_id = public.current_barbearia_id());

-- FORMAS DE PAGAMENTO
create policy formas_pagamento_select_proprias on public.barbearia_formas_pagamento
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy formas_pagamento_insert_proprias on public.barbearia_formas_pagamento
for insert to authenticated
with check (barbearia_id = public.current_barbearia_id());
create policy formas_pagamento_delete_proprias on public.barbearia_formas_pagamento
for delete to authenticated
using (barbearia_id = public.current_barbearia_id());

-- DADOS OPERACIONAIS: leitura própria; escrita virá por RPC transacional.
create policy vendas_select_proprias on public.vendas
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy venda_itens_select_proprios on public.venda_itens
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy movimentacoes_estoque_select_proprias on public.movimentacoes_estoque
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy despesas_select_proprias on public.despesas
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy despesas_recorrentes_select_proprias on public.despesas_recorrentes
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy ocorrencias_despesas_select_proprias on public.ocorrencias_despesas_recorrentes
for select to authenticated
using (barbearia_id = public.current_barbearia_id());

-- PLANOS E ASSINATURAS
create policy planos_select_authenticated on public.planos
for select to authenticated
using (true);

create policy assinaturas_select_propria on public.assinaturas
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy assinaturas_select_admin on public.assinaturas
for select to authenticated
using (public.is_admin());

create policy pagamentos_select_proprios on public.pagamentos_assinatura
for select to authenticated
using (barbearia_id = public.current_barbearia_id());
create policy pagamentos_select_admin on public.pagamentos_assinatura
for select to authenticated
using (public.is_admin());

-- ADMINISTRACAO
create policy retencoes_select_admin on public.retencoes_contas_excluidas
for select to authenticated
using (public.is_admin());
create policy historico_select_admin on public.historico_administrativo
for select to authenticated
using (public.is_admin());
create policy configuracoes_select_admin on public.configuracoes_sistema
for select to authenticated
using (public.is_admin());

-- CÓDIGOS RESERVADOS: sem policy de cliente; uso server-side/security definer.

-- ACEITES LEGAIS
create policy aceites_select_proprios on public.aceites_legais
for select to authenticated
using (perfil_id = auth.uid());
create policy aceites_insert_proprios on public.aceites_legais
for insert to authenticated
with check (perfil_id = auth.uid());
create policy aceites_select_admin on public.aceites_legais
for select to authenticated
using (public.is_admin());

-- Observações:
-- 1. Não há policies anon aqui. A Vitrine pública terá função/view segura separada.
-- 2. Criação de barbearia + perfil + assinatura será feita por função transacional.
-- 3. Vendas, estoque e financeiro terão RPCs transacionais.
-- 4. Ações ADMIN sensíveis terão funções específicas.
