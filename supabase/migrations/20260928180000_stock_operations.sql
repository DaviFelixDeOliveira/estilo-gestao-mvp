-- Migration: stock_operations
-- Cria as RPCs atomicas de movimentacao manual de estoque:
-- 1. repor_estoque
-- 2. ajustar_estoque
-- 3. registrar_perda

-- ============================================================
-- 1. REPOR ESTOQUE
-- ============================================================

create or replace function public.repor_estoque(
  p_produto_id uuid,
  p_quantidade integer,
  p_custo_unitario numeric default null,
  p_motivo text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_saldo_anterior integer;
  v_saldo_posterior integer;
  v_preco_custo_padrao numeric(12,2);
  v_custo_snapshot numeric(12,2);
  v_valor_total_snapshot numeric(12,2);
  v_ativo boolean;
  v_nome text;
  v_movimentacao_id uuid;
begin
  -- 1. Validar autenticacao e tenant
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  -- 2. Validar quantidade
  if p_quantidade is null or p_quantidade <= 0 then
    raise exception 'A quantidade de reposicao deve ser maior que zero.';
  end if;

  if p_custo_unitario is not null and p_custo_unitario < 0 then
    raise exception 'O custo unitario nao pode ser negativo.';
  end if;

  -- 3. Bloquear produto para concorrencia
  select
    p.estoque_atual,
    p.preco_custo,
    p.ativo,
    p.nome
  into
    v_saldo_anterior,
    v_preco_custo_padrao,
    v_ativo,
    v_nome
  from public.produtos p
  where p.id = p_produto_id
    and p.barbearia_id = v_barbearia_id
  for update;

  if not found then
    raise exception 'Produto nao encontrado.';
  end if;

  -- 4. Validar se o produto esta ativo
  if not v_ativo then
    raise exception 'Nao e possivel repor estoque de um produto inativo ("%"). Reative o produto antes de realizar compras/reposicao.', v_nome;
  end if;

  -- 5. Calcular snapshots e saldo
  v_custo_snapshot := coalesce(p_custo_unitario, v_preco_custo_padrao);
  v_valor_total_snapshot := round(v_custo_snapshot * p_quantidade, 2);
  v_saldo_posterior := v_saldo_anterior + p_quantidade;

  -- 6. Atualizar estoque_atual do produto
  update public.produtos
  set estoque_atual = v_saldo_posterior
  where id = p_produto_id
    and barbearia_id = v_barbearia_id;

  -- 7. Registrar movimentacao
  insert into public.movimentacoes_estoque (
    barbearia_id,
    produto_id,
    tipo,
    quantidade_delta,
    saldo_anterior,
    saldo_posterior,
    venda_id,
    motivo,
    custo_unitario_snapshot,
    valor_total_snapshot
  )
  values (
    v_barbearia_id,
    p_produto_id,
    'REPOSICAO',
    p_quantidade,
    v_saldo_anterior,
    v_saldo_posterior,
    null,
    nullif(trim(p_motivo), ''),
    v_custo_snapshot,
    v_valor_total_snapshot
  )
  returning id into v_movimentacao_id;

  return jsonb_build_object(
    'movimentacao_id', v_movimentacao_id,
    'produto_id', p_produto_id,
    'tipo', 'REPOSICAO',
    'quantidade_delta', p_quantidade,
    'saldo_anterior', v_saldo_anterior,
    'saldo_posterior', v_saldo_posterior
  );
end;
$$;

comment on function public.repor_estoque(uuid, integer, numeric, text) is
  'Registra uma adicao/reposicao de estoque com custo unitario snapshot e bloqueio concorrencial.';

-- ============================================================
-- 2. AJUSTAR ESTOQUE
-- ============================================================

create or replace function public.ajustar_estoque(
  p_produto_id uuid,
  p_quantidade_delta integer,
  p_motivo text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_saldo_anterior integer;
  v_saldo_posterior integer;
  v_nome text;
  v_movimentacao_id uuid;
begin
  -- 1. Validar autenticacao e tenant
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  -- 2. Validar delta
  if p_quantidade_delta is null or p_quantidade_delta = 0 then
    raise exception 'A quantidade de ajuste nao pode ser zero.';
  end if;

  -- 3. Bloquear produto para concorrencia
  select
    p.estoque_atual,
    p.nome
  into
    v_saldo_anterior,
    v_nome
  from public.produtos p
  where p.id = p_produto_id
    and p.barbearia_id = v_barbearia_id
  for update;

  if not found then
    raise exception 'Produto nao encontrado.';
  end if;

  -- 4. Validar saldo posterior nao negativo
  v_saldo_posterior := v_saldo_anterior + p_quantidade_delta;
  if v_saldo_posterior < 0 then
    raise exception 'Ajuste resultaria em estoque negativo para o produto "%" (Disponivel: %, ajuste solicitado: %).', v_nome, v_saldo_anterior, p_quantidade_delta;
  end if;

  -- 5. Atualizar produto
  update public.produtos
  set estoque_atual = v_saldo_posterior
  where id = p_produto_id
    and barbearia_id = v_barbearia_id;

  -- 6. Inserir movimentacao
  insert into public.movimentacoes_estoque (
    barbearia_id,
    produto_id,
    tipo,
    quantidade_delta,
    saldo_anterior,
    saldo_posterior,
    venda_id,
    motivo,
    custo_unitario_snapshot,
    valor_total_snapshot
  )
  values (
    v_barbearia_id,
    p_produto_id,
    'AJUSTE',
    p_quantidade_delta,
    v_saldo_anterior,
    v_saldo_posterior,
    null,
    nullif(trim(p_motivo), ''),
    null,
    null
  )
  returning id into v_movimentacao_id;

  return jsonb_build_object(
    'movimentacao_id', v_movimentacao_id,
    'produto_id', p_produto_id,
    'tipo', 'AJUSTE',
    'quantidade_delta', p_quantidade_delta,
    'saldo_anterior', v_saldo_anterior,
    'saldo_posterior', v_saldo_posterior
  );
end;
$$;

comment on function public.ajustar_estoque(uuid, integer, text) is
  'Registra uma correcao de contagem de inventario (positiva ou negativa) com validacao de nao negatividade.';

-- ============================================================
-- 3. REGISTRAR PERDA
-- ============================================================

create or replace function public.registrar_perda(
  p_produto_id uuid,
  p_quantidade integer,
  p_motivo text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_saldo_anterior integer;
  v_saldo_posterior integer;
  v_preco_custo numeric(12,2);
  v_valor_total_snapshot numeric(12,2);
  v_nome text;
  v_movimentacao_id uuid;
begin
  -- 1. Validar autenticacao e tenant
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  -- 2. Validar quantidade
  if p_quantidade is null or p_quantidade <= 0 then
    raise exception 'A quantidade de perda deve ser maior que zero.';
  end if;

  -- 3. Bloquear produto para concorrencia
  select
    p.estoque_atual,
    p.preco_custo,
    p.nome
  into
    v_saldo_anterior,
    v_preco_custo,
    v_nome
  from public.produtos p
  where p.id = p_produto_id
    and p.barbearia_id = v_barbearia_id
  for update;

  if not found then
    raise exception 'Produto nao encontrado.';
  end if;

  -- 4. Validar se a quantidade de perda nao excede o estoque existente
  if p_quantidade > v_saldo_anterior then
    raise exception 'Estoque insuficiente para registrar perda no produto "%" (Disponivel: %, perda informada: %).', v_nome, v_saldo_anterior, p_quantidade;
  end if;

  -- 5. Calcular snapshots e saldo
  v_saldo_posterior := v_saldo_anterior - p_quantidade;
  v_valor_total_snapshot := round(v_preco_custo * p_quantidade, 2);

  -- 6. Atualizar produto
  update public.produtos
  set estoque_atual = v_saldo_posterior
  where id = p_produto_id
    and barbearia_id = v_barbearia_id;

  -- 7. Registrar movimentacao
  insert into public.movimentacoes_estoque (
    barbearia_id,
    produto_id,
    tipo,
    quantidade_delta,
    saldo_anterior,
    saldo_posterior,
    venda_id,
    motivo,
    custo_unitario_snapshot,
    valor_total_snapshot
  )
  values (
    v_barbearia_id,
    p_produto_id,
    'PERDA',
    -p_quantidade,
    v_saldo_anterior,
    v_saldo_posterior,
    null,
    nullif(trim(p_motivo), ''),
    v_preco_custo,
    v_valor_total_snapshot
  )
  returning id into v_movimentacao_id;

  return jsonb_build_object(
    'movimentacao_id', v_movimentacao_id,
    'produto_id', p_produto_id,
    'tipo', 'PERDA',
    'quantidade_delta', -p_quantidade,
    'saldo_anterior', v_saldo_anterior,
    'saldo_posterior', v_saldo_posterior
  );
end;
$$;

comment on function public.registrar_perda(uuid, integer, text) is
  'Registra baixa por avaria/perda fisica de estoque com snapshots de custo e reducao atomica.';

-- ============================================================
-- 4. PERMISSOES
-- ============================================================

grant execute on function public.repor_estoque(uuid, integer, numeric, text) to authenticated;
grant execute on function public.ajustar_estoque(uuid, integer, text) to authenticated;
grant execute on function public.registrar_perda(uuid, integer, text) to authenticated;
