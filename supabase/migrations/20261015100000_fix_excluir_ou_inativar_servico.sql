-- ============================================================
-- CORREÇÃO: RPC excluir_ou_inativar_servico
-- ============================================================
-- A coluna portfolio.servico_id não existe mais no MVP
-- (removida em 20261006193000_update_portfolio.sql).
-- Passa a considerar histórico apenas por venda_itens.servico_id.
-- ============================================================

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
  'Exclui servico sem historico ou inativa (ativo=false) quando possui vendas (venda_itens).';

grant execute
  on function public.excluir_ou_inativar_servico(uuid)
  to authenticated;
