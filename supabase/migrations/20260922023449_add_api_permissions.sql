-- ============================================================
-- PERMISSÕES DA DATA API
-- A RLS decide quais linhas podem ser acessadas.
-- Estes GRANTs permitem que o papel authenticated tente
-- executar as operações autorizadas pelas policies.
-- ============================================================

grant usage on schema public to authenticated;

-- Somente leitura direta
grant select on table
  public.barbearias,
  public.perfis,
  public.vendas,
  public.venda_itens,
  public.movimentacoes_estoque,
  public.despesas,
  public.despesas_recorrentes,
  public.ocorrencias_despesas_recorrentes,
  public.planos,
  public.assinaturas,
  public.retencoes_contas_excluidas,
  public.pagamentos_assinatura,
  public.historico_administrativo,
  public.configuracoes_sistema
to authenticated;

-- CRUD direto permitido pelas policies atuais
grant select, insert, update, delete on table
  public.servicos,
  public.categorias_produto,
  public.produtos,
  public.portfolio,
  public.horarios_funcionamento
to authenticated;

-- Formas de pagamento não possuem update direto
grant select, insert, delete on table
  public.barbearia_formas_pagamento
to authenticated;

-- Aceites legais pertencem ao próprio usuário
grant select, insert on table
  public.aceites_legais
to authenticated;