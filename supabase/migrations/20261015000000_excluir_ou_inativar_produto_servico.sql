-- ============================================================
-- Task F: excluir ou inativar produto/serviço preservando histórico
-- ============================================================
-- Produto/serviço COM histórico (venda_itens, movimentacoes_estoque,
-- portfolio) é INATIVADO (ativo = false). SEM histórico, é EXCLUÍDO.
-- Nenhum registro com vínculo histórico é apagado.

-- ------------------------------------------------------------
-- 1. excluir_ou_inativar_produto
-- ------------------------------------------------------------
create or replace function public.excluir_ou_inativar_produto(
  p_produto_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_existe boolean;
  v_tem_historico boolean;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_produto_id is null then
    raise exception 'ID do produto nao informado.';
  end if;

  select exists (
    select 1 from public.produtos
    where id = p_produto_id
      and barbearia_id = v_barbearia_id
  )
  into v_existe;

  if not v_existe then
    raise exception 'Produto nao encontrado.';
  end if;

  select exists (
    select 1 from public.venda_itens
    where produto_id = p_produto_id
      and barbearia_id = v_barbearia_id
    union all
    select 1 from public.movimentacoes_estoque
    where produto_id = p_produto_id
      and barbearia_id = v_barbearia_id
  )
  into v_tem_historico;

  if v_tem_historico then
    update public.produtos
    set ativo = false
    where id = p_produto_id
      and barbearia_id = v_barbearia_id;

    return jsonb_build_object(
      'sucesso', true,
      'acao', 'inativado',
      'id', p_produto_id
    );
  end if;

  delete from public.produtos
  where id = p_produto_id
    and barbearia_id = v_barbearia_id;

  return jsonb_build_object(
    'sucesso', true,
    'acao', 'excluido',
    'id', p_produto_id
  );
end;
$$;

comment on function public.excluir_ou_inativar_produto(uuid) is
  'Exclui produto sem historico ou inativa (ativo=false) quando possui vendas/movimentacoes.';

grant execute
  on function public.excluir_ou_inativar_produto(uuid)
  to authenticated;

-- ------------------------------------------------------------
-- 2. excluir_ou_inativar_servico
-- ------------------------------------------------------------
create or replace function public.excluir_ou_inativar_servico(
  p_servico_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_existe boolean;
  v_tem_historico boolean;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_servico_id is null then
    raise exception 'ID do servico nao informado.';
  end if;

  select exists (
    select 1 from public.servicos
    where id = p_servico_id
      and barbearia_id = v_barbearia_id
  )
  into v_existe;

  if not v_existe then
    raise exception 'Servico nao encontrado.';
  end if;

  select exists (
    select 1 from public.venda_itens
    where servico_id = p_servico_id
      and barbearia_id = v_barbearia_id
    union all
    select 1 from public.portfolio
    where servico_id = p_servico_id
      and barbearia_id = v_barbearia_id
  )
  into v_tem_historico;

  if v_tem_historico then
    update public.servicos
    set ativo = false
    where id = p_servico_id
      and barbearia_id = v_barbearia_id;

    return jsonb_build_object(
      'sucesso', true,
      'acao', 'inativado',
      'id', p_servico_id
    );
  end if;

  delete from public.servicos
  where id = p_servico_id
    and barbearia_id = v_barbearia_id;

  return jsonb_build_object(
    'sucesso', true,
    'acao', 'excluido',
    'id', p_servico_id
  );
end;
$$;

comment on function public.excluir_ou_inativar_servico(uuid) is
  'Exclui servico sem historico ou inativa (ativo=false) quando possui vendas/portfolio.';

grant execute
  on function public.excluir_ou_inativar_servico(uuid)
  to authenticated;
