-- Migration: financial_operations
-- Implementa as RPCs transacionais atomicas e seguras do modulo Financeiro:
-- 1. criar_despesa
-- 2. atualizar_despesa
-- 3. excluir_despesa
-- 4. listar_despesas
-- 5. criar_despesa_recorrente
-- 6. atualizar_despesa_recorrente
-- 7. inativar_despesa_recorrente
-- 8. listar_despesas_recorrentes
-- 9. calcular_vencimento_competencia
-- 10. obter_ocorrencias_mes
-- 11. pagar_ocorrencia_recorrente
-- 12. ignorar_ocorrencia_recorrente
-- 13. desfazer_pagamento_ocorrencia
-- 14. desfazer_ignorar_ocorrencia
-- 15. obter_resumo_financeiro

-- ============================================================
-- 1. CRIAR DESPESA MANUAL
-- ============================================================

create or replace function public.criar_despesa(
  p_nome text,
  p_categoria public.categoria_despesa,
  p_valor numeric,
  p_data_despesa date,
  p_descricao text default null,
  p_movimentacao_estoque_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_despesa_id uuid;
  v_tipo_movimentacao public.tipo_movimento_estoque;
  v_mov_barbearia_id uuid;
begin
  -- 1. Validar autenticacao e tenant
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  -- 2. Validar campos
  if p_nome is null or trim(p_nome) = '' then
    raise exception 'O nome da despesa e obrigatorio.';
  end if;

  if p_categoria is null then
    raise exception 'A categoria da despesa e obrigatoria.';
  end if;

  if p_valor is null or p_valor <= 0 then
    raise exception 'O valor da despesa deve ser maior que zero.';
  end if;

  if p_data_despesa is null then
    raise exception 'A data da despesa e obrigatoria.';
  end if;

  -- 3. Validar movimentacao de estoque se informada
  if p_movimentacao_estoque_id is not null then
    if p_categoria <> 'ESTOQUE'::public.categoria_despesa then
      raise exception 'Vinculo com movimentacao de estoque so e permitido para a categoria ESTOQUE.';
    end if;

    select tipo, barbearia_id
    into v_tipo_movimentacao, v_mov_barbearia_id
    from public.movimentacoes_estoque
    where id = p_movimentacao_estoque_id
      and barbearia_id = v_barbearia_id;

    if not found then
      raise exception 'Movimentacao de estoque nao encontrada para esta barbearia.';
    end if;

    if v_tipo_movimentacao <> 'REPOSICAO'::public.tipo_movimento_estoque then
      raise exception 'Apenas movimentacoes do tipo REPOSICAO podem ser vinculadas a despesas.';
    end if;

    if exists (
      select 1 from public.despesas
      where movimentacao_estoque_id = p_movimentacao_estoque_id
    ) then
      raise exception 'Esta movimentacao de estoque ja esta vinculada a outra despesa.';
    end if;
  end if;

  -- 4. Inserir despesa
  insert into public.despesas (
    barbearia_id,
    nome,
    descricao,
    categoria,
    valor,
    data_despesa,
    origem,
    movimentacao_estoque_id
  )
  values (
    v_barbearia_id,
    trim(p_nome),
    nullif(trim(p_descricao), ''),
    p_categoria,
    round(p_valor, 2),
    p_data_despesa,
    'MANUAL',
    p_movimentacao_estoque_id
  )
  returning id into v_despesa_id;

  return jsonb_build_object(
    'id', v_despesa_id,
    'barbearia_id', v_barbearia_id,
    'nome', trim(p_nome),
    'descricao', nullif(trim(p_descricao), ''),
    'categoria', p_categoria,
    'valor', round(p_valor, 2),
    'data_despesa', p_data_despesa,
    'origem', 'MANUAL',
    'movimentacao_estoque_id', p_movimentacao_estoque_id
  );
end;
$$;

comment on function public.criar_despesa(text, public.categoria_despesa, numeric, date, text, uuid) is
  'Cria uma despesa manual paga com validacao estrita de categoria, valor e vinculo opcional com reposicao de estoque.';

-- ============================================================
-- 2. ATUALIZAR DESPESA MANUAL
-- ============================================================

create or replace function public.atualizar_despesa(
  p_despesa_id uuid,
  p_nome text,
  p_categoria public.categoria_despesa,
  p_valor numeric,
  p_data_despesa date,
  p_descricao text default null,
  p_movimentacao_estoque_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_origem public.origem_despesa;
  v_tipo_movimentacao public.tipo_movimento_estoque;
  v_mov_barbearia_id uuid;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_despesa_id is null then
    raise exception 'ID da despesa nao informado.';
  end if;

  -- Verificar se despesa existe e sua origem
  select origem
  into v_origem
  from public.despesas
  where id = p_despesa_id
    and barbearia_id = v_barbearia_id
  for update;

  if not found then
    raise exception 'Despesa nao encontrada.';
  end if;

  if v_origem = 'DESPESA_RECORRENTE'::public.origem_despesa then
    raise exception 'Despesa originada de recorrencia nao pode ser editada diretamente. Use o fluxo de recorrencias.';
  end if;

  if p_nome is null or trim(p_nome) = '' then
    raise exception 'O nome da despesa e obrigatorio.';
  end if;

  if p_categoria is null then
    raise exception 'A categoria da despesa e obrigatoria.';
  end if;

  if p_valor is null or p_valor <= 0 then
    raise exception 'O valor da despesa deve ser maior que zero.';
  end if;

  if p_data_despesa is null then
    raise exception 'A data da despesa e obrigatoria.';
  end if;

  if p_movimentacao_estoque_id is not null then
    if p_categoria <> 'ESTOQUE'::public.categoria_despesa then
      raise exception 'Vinculo com movimentacao de estoque so e permitido para a categoria ESTOQUE.';
    end if;

    select tipo, barbearia_id
    into v_tipo_movimentacao, v_mov_barbearia_id
    from public.movimentacoes_estoque
    where id = p_movimentacao_estoque_id
      and barbearia_id = v_barbearia_id;

    if not found then
      raise exception 'Movimentacao de estoque nao encontrada para esta barbearia.';
    end if;

    if v_tipo_movimentacao <> 'REPOSICAO'::public.tipo_movimento_estoque then
      raise exception 'Apenas movimentacoes do tipo REPOSICAO podem ser vinculadas a despesas.';
    end if;

    if exists (
      select 1 from public.despesas
      where movimentacao_estoque_id = p_movimentacao_estoque_id
        and id <> p_despesa_id
    ) then
      raise exception 'Esta movimentacao de estoque ja esta vinculada a outra despesa.';
    end if;
  end if;

  update public.despesas
  set
    nome = trim(p_nome),
    descricao = nullif(trim(p_descricao), ''),
    categoria = p_categoria,
    valor = round(p_valor, 2),
    data_despesa = p_data_despesa,
    movimentacao_estoque_id = p_movimentacao_estoque_id,
    updated_at = now()
  where id = p_despesa_id
    and barbearia_id = v_barbearia_id;

  return jsonb_build_object(
    'id', p_despesa_id,
    'barbearia_id', v_barbearia_id,
    'nome', trim(p_nome),
    'descricao', nullif(trim(p_descricao), ''),
    'categoria', p_categoria,
    'valor', round(p_valor, 2),
    'data_despesa', p_data_despesa,
    'origem', 'MANUAL',
    'movimentacao_estoque_id', p_movimentacao_estoque_id
  );
end;
$$;

comment on function public.atualizar_despesa(uuid, text, public.categoria_despesa, numeric, date, text, uuid) is
  'Atualiza uma despesa manual existente, bloqueando alteracao de despesas de origem recorrente.';

-- ============================================================
-- 3. EXCLUIR DESPESA MANUAL
-- ============================================================

create or replace function public.excluir_despesa(
  p_despesa_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_origem public.origem_despesa;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_despesa_id is null then
    raise exception 'ID da despesa nao informado.';
  end if;

  select origem
  into v_origem
  from public.despesas
  where id = p_despesa_id
    and barbearia_id = v_barbearia_id
  for update;

  if not found then
    raise exception 'Despesa nao encontrada.';
  end if;

  if v_origem = 'DESPESA_RECORRENTE'::public.origem_despesa or exists (
    select 1 from public.ocorrencias_despesas_recorrentes
    where despesa_id = p_despesa_id
  ) then
    raise exception 'Despesa vinculada a recorrencia nao pode ser excluida diretamente. Desfaca o pagamento da recorrencia.';
  end if;

  delete from public.despesas
  where id = p_despesa_id
    and barbearia_id = v_barbearia_id;

  return jsonb_build_object(
    'sucesso', true,
    'id', p_despesa_id
  );
end;
$$;

comment on function public.excluir_despesa(uuid) is
  'Exclui uma despesa manual, impedindo a remocao direta de despesas de recorrencias.';

-- ============================================================
-- 4. LISTAR DESPESAS
-- ============================================================

create or replace function public.listar_despesas(
  p_inicio date default null,
  p_fim date default null,
  p_categoria text default null,
  p_busca text default null,
  p_pagina integer default 1,
  p_por_pagina integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_offset integer;
  v_total_registros integer;
  v_total_valor numeric(12,2);
  v_itens jsonb;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_pagina is null or p_pagina < 1 then
    p_pagina := 1;
  end if;

  if p_por_pagina is null or p_por_pagina < 1 or p_por_pagina > 100 then
    p_por_pagina := 10;
  end if;

  v_offset := (p_pagina - 1) * p_por_pagina;

  select
    count(*),
    coalesce(sum(d.valor), 0)
  into
    v_total_registros,
    v_total_valor
  from public.despesas d
  where d.barbearia_id = v_barbearia_id
    and (p_inicio is null or d.data_despesa >= p_inicio)
    and (p_fim is null or d.data_despesa <= p_fim)
    and (p_categoria is null or trim(p_categoria) = '' or d.categoria::text = p_categoria)
    and (p_busca is null or trim(p_busca) = '' or d.nome ilike '%' || trim(p_busca) || '%');

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', d.id,
        'nome', d.nome,
        'descricao', d.descricao,
        'categoria', d.categoria,
        'valor', d.valor,
        'data_despesa', d.data_despesa,
        'origem', d.origem,
        'movimentacao_estoque_id', d.movimentacao_estoque_id,
        'created_at', d.created_at
      )
      order by d.data_despesa desc, d.created_at desc
    ),
    '[]'::jsonb
  )
  into v_itens
  from (
    select d.*
    from public.despesas d
    where d.barbearia_id = v_barbearia_id
      and (p_inicio is null or d.data_despesa >= p_inicio)
      and (p_fim is null or d.data_despesa <= p_fim)
      and (p_categoria is null or trim(p_categoria) = '' or d.categoria::text = p_categoria)
      and (p_busca is null or trim(p_busca) = '' or d.nome ilike '%' || trim(p_busca) || '%')
    order by d.data_despesa desc, d.created_at desc
    limit p_por_pagina
    offset v_offset
  ) d;

  return jsonb_build_object(
    'pagina', p_pagina,
    'por_pagina', p_por_pagina,
    'total_registros', v_total_registros,
    'total_paginas', ceil(v_total_registros::numeric / p_por_pagina::numeric),
    'total_valor', v_total_valor,
    'itens', v_itens
  );
end;
$$;

comment on function public.listar_despesas(date, date, text, text, integer, integer) is
  'Consulta paginada e filtrada de despesas para o usuario autenticado.';

-- ============================================================
-- 5. CRIAR DESPESA RECORRENTE
-- ============================================================

create or replace function public.criar_despesa_recorrente(
  p_nome text,
  p_categoria public.categoria_despesa,
  p_valor_previsto numeric,
  p_dia_vencimento integer,
  p_descricao text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_id uuid;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_nome is null or trim(p_nome) = '' then
    raise exception 'O nome da despesa recorrente e obrigatorio.';
  end if;

  if p_categoria is null then
    raise exception 'A categoria e obrigatoria.';
  end if;

  if p_valor_previsto is null or p_valor_previsto <= 0 then
    raise exception 'O valor previsto deve ser maior que zero.';
  end if;

  if p_dia_vencimento is null or p_dia_vencimento < 1 or p_dia_vencimento > 31 then
    raise exception 'O dia de vencimento deve estar entre 1 e 31.';
  end if;

  insert into public.despesas_recorrentes (
    barbearia_id,
    nome,
    descricao,
    categoria,
    valor_previsto,
    frequencia,
    dia_vencimento,
    ativa
  )
  values (
    v_barbearia_id,
    trim(p_nome),
    nullif(trim(p_descricao), ''),
    p_categoria,
    round(p_valor_previsto, 2),
    'MENSAL',
    p_dia_vencimento,
    true
  )
  returning id into v_id;

  return jsonb_build_object(
    'id', v_id,
    'barbearia_id', v_barbearia_id,
    'nome', trim(p_nome),
    'descricao', nullif(trim(p_descricao), ''),
    'categoria', p_categoria,
    'valor_previsto', round(p_valor_previsto, 2),
    'frequencia', 'MENSAL',
    'dia_vencimento', p_dia_vencimento,
    'ativa', true
  );
end;
$$;

comment on function public.criar_despesa_recorrente(text, public.categoria_despesa, numeric, integer, text) is
  'Cria uma nova configuracao de despesa recorrente mensal.';

-- ============================================================
-- 6. ATUALIZAR DESPESA RECORRENTE
-- ============================================================

create or replace function public.atualizar_despesa_recorrente(
  p_recorrencia_id uuid,
  p_nome text,
  p_categoria public.categoria_despesa,
  p_valor_previsto numeric,
  p_dia_vencimento integer,
  p_descricao text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_recorrencia_id is null then
    raise exception 'ID da recorrencia nao informado.';
  end if;

  if p_nome is null or trim(p_nome) = '' then
    raise exception 'O nome da despesa recorrente e obrigatorio.';
  end if;

  if p_categoria is null then
    raise exception 'A categoria e obrigatoria.';
  end if;

  if p_valor_previsto is null or p_valor_previsto <= 0 then
    raise exception 'O valor previsto deve ser maior que zero.';
  end if;

  if p_dia_vencimento is null or p_dia_vencimento < 1 or p_dia_vencimento > 31 then
    raise exception 'O dia de vencimento deve estar entre 1 e 31.';
  end if;

  update public.despesas_recorrentes
  set
    nome = trim(p_nome),
    descricao = nullif(trim(p_descricao), ''),
    categoria = p_categoria,
    valor_previsto = round(p_valor_previsto, 2),
    dia_vencimento = p_dia_vencimento,
    updated_at = now()
  where id = p_recorrencia_id
    and barbearia_id = v_barbearia_id;

  if not found then
    raise exception 'Despesa recorrente nao encontrada.';
  end if;

  return jsonb_build_object(
    'id', p_recorrencia_id,
    'barbearia_id', v_barbearia_id,
    'nome', trim(p_nome),
    'descricao', nullif(trim(p_descricao), ''),
    'categoria', p_categoria,
    'valor_previsto', round(p_valor_previsto, 2),
    'frequencia', 'MENSAL',
    'dia_vencimento', p_dia_vencimento
  );
end;
$$;

comment on function public.atualizar_despesa_recorrente(uuid, text, public.categoria_despesa, numeric, integer, text) is
  'Atualiza uma despesa recorrente sem alterar snapshots de ocorrencias historicas.';

-- ============================================================
-- 7. INATIVAR DESPESA RECORRENTE
-- ============================================================

create or replace function public.inativar_despesa_recorrente(
  p_recorrencia_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_recorrencia_id is null then
    raise exception 'ID da recorrencia nao informado.';
  end if;

  update public.despesas_recorrentes
  set
    ativa = false,
    updated_at = now()
  where id = p_recorrencia_id
    and barbearia_id = v_barbearia_id;

  if not found then
    raise exception 'Despesa recorrente nao encontrada.';
  end if;

  return jsonb_build_object(
    'sucesso', true,
    'id', p_recorrencia_id,
    'ativa', false
  );
end;
$$;

comment on function public.inativar_despesa_recorrente(uuid) is
  'Inativa uma despesa recorrente preservando todas as ocorrencias e historico anteriores.';

-- ============================================================
-- 8. LISTAR DESPESAS RECORRENTES
-- ============================================================

create or replace function public.listar_despesas_recorrentes()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_resultado jsonb;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'nome', r.nome,
        'descricao', r.descricao,
        'categoria', r.categoria,
        'valor_previsto', r.valor_previsto,
        'frequencia', r.frequencia,
        'dia_vencimento', r.dia_vencimento,
        'ativa', r.ativa,
        'created_at', r.created_at,
        'updated_at', r.updated_at
      )
      order by r.ativa desc, r.nome asc
    ),
    '[]'::jsonb
  )
  into v_resultado
  from public.despesas_recorrentes r
  where r.barbearia_id = v_barbearia_id;

  return v_resultado;
end;
$$;

comment on function public.listar_despesas_recorrentes() is
  'Lista todas as configuracoes de despesas recorrentes (ativas e inativas) da barbearia.';

-- ============================================================
-- 9. CALCULAR VENCIMENTO DA COMPETENCIA (REGRA DIAS 29, 30, 31)
-- ============================================================

create or replace function public.calcular_vencimento_competencia(
  p_competencia date,
  p_dia_vencimento integer
)
returns date
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_ultimo_dia_mes integer;
  v_dia_efetivo integer;
  v_ano integer;
  v_mes integer;
begin
  v_ano := extract(year from p_competencia)::integer;
  v_mes := extract(month from p_competencia)::integer;
  v_ultimo_dia_mes := extract(day from (date_trunc('month', p_competencia) + interval '1 month' - interval '1 day'))::integer;
  v_dia_efetivo := least(p_dia_vencimento, v_ultimo_dia_mes);
  return make_date(v_ano, v_mes, v_dia_efetivo);
end;
$$;

comment on function public.calcular_vencimento_competencia(date, integer) is
  'Calcula a data exata de vencimento ajustando dias 29, 30 e 31 para o ultimo dia util do mes quando necessario.';

-- ============================================================
-- 10. OBTER OCORRENCIAS DO MES (COM PROVISIONAMENTO AUTOMATICO)
-- ============================================================

create or replace function public.obter_ocorrencias_mes(
  p_ano integer,
  p_mes integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_competencia date;
  v_rec record;
  v_vencimento date;
  v_resultado jsonb;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_mes is null or p_mes < 1 or p_mes > 12 then
    raise exception 'Mes invalido. Deve estar entre 1 e 12.';
  end if;

  if p_ano is null or p_ano < 2000 or p_ano > 2100 then
    raise exception 'Ano invalido.';
  end if;

  v_competencia := make_date(p_ano, p_mes, 1);

  -- Provisionar ocorrencias para todas as recorrencias ativas que ainda nao possuem registro nesta competencia
  for v_rec in
    select
      r.id,
      r.nome,
      r.categoria,
      r.valor_previsto,
      r.dia_vencimento
    from public.despesas_recorrentes r
    where r.barbearia_id = v_barbearia_id
      and r.ativa = true
      and not exists (
        select 1
        from public.ocorrencias_despesas_recorrentes o
        where o.despesa_recorrente_id = r.id
          and o.competencia = v_competencia
      )
  loop
    v_vencimento := public.calcular_vencimento_competencia(v_competencia, v_rec.dia_vencimento);

    insert into public.ocorrencias_despesas_recorrentes (
      barbearia_id,
      despesa_recorrente_id,
      competencia,
      data_vencimento,
      nome_snapshot,
      categoria_snapshot,
      valor_previsto,
      status
    )
    values (
      v_barbearia_id,
      v_rec.id,
      v_competencia,
      v_vencimento,
      v_rec.nome,
      v_rec.categoria,
      v_rec.valor_previsto,
      'PENDENTE'
    )
    on conflict (despesa_recorrente_id, competencia) do nothing;
  end loop;

  -- Retornar todas as ocorrencias do mes
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', o.id,
        'despesa_recorrente_id', o.despesa_recorrente_id,
        'competencia', o.competencia,
        'data_vencimento', o.data_vencimento,
        'nome_snapshot', o.nome_snapshot,
        'categoria_snapshot', o.categoria_snapshot,
        'valor_previsto', o.valor_previsto,
        'valor_pago', o.valor_pago,
        'data_pagamento', o.data_pagamento,
        'status', o.status,
        'despesa_id', o.despesa_id,
        'recorrencia_ativa', r.ativa,
        'created_at', o.created_at
      )
      order by o.data_vencimento asc, o.nome_snapshot asc
    ),
    '[]'::jsonb
  )
  into v_resultado
  from public.ocorrencias_despesas_recorrentes o
  left join public.despesas_recorrentes r on r.id = o.despesa_recorrente_id
  where o.barbearia_id = v_barbearia_id
    and o.competencia = v_competencia;

  return jsonb_build_object(
    'competencia', v_competencia,
    'ano', p_ano,
    'mes', p_mes,
    'ocorrencias', v_resultado
  );
end;
$$;

comment on function public.obter_ocorrencias_mes(integer, integer) is
  'Obtem e provisiona atomicamente as ocorrencias de despesas recorrentes do mes informado.';

-- ============================================================
-- 11. PAGAR OCORRENCIA RECORRENTE
-- ============================================================

create or replace function public.pagar_ocorrencia_recorrente(
  p_ocorrencia_id uuid,
  p_valor_pago numeric default null,
  p_data_pagamento date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_ocorrencia record;
  v_valor_final numeric(12,2);
  v_data_final date;
  v_despesa_id uuid;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_ocorrencia_id is null then
    raise exception 'ID da ocorrencia nao informado.';
  end if;

  select *
  into v_ocorrencia
  from public.ocorrencias_despesas_recorrentes
  where id = p_ocorrencia_id
    and barbearia_id = v_barbearia_id
  for update;

  if not found then
    raise exception 'Ocorrencia nao encontrada.';
  end if;

  if v_ocorrencia.status = 'PAGA'::public.status_ocorrencia_despesa then
    raise exception 'Esta ocorrencia ja esta marcada como paga.';
  end if;

  if v_ocorrencia.status = 'IGNORADA'::public.status_ocorrencia_despesa then
    raise exception 'Esta ocorrencia esta ignorada. Desfaca o status ignorado antes de pagar.';
  end if;

  v_valor_final := coalesce(round(p_valor_pago, 2), v_ocorrencia.valor_previsto);
  if v_valor_final <= 0 then
    raise exception 'O valor pago deve ser maior que zero.';
  end if;

  v_data_final := coalesce(p_data_pagamento, current_date);

  -- 1. Inserir despesa financeira efetiva
  insert into public.despesas (
    barbearia_id,
    nome,
    descricao,
    categoria,
    valor,
    data_despesa,
    origem,
    movimentacao_estoque_id
  )
  values (
    v_barbearia_id,
    v_ocorrencia.nome_snapshot,
    'Pagamento de despesa recorrente',
    v_ocorrencia.categoria_snapshot,
    v_valor_final,
    v_data_final,
    'DESPESA_RECORRENTE',
    null
  )
  returning id into v_despesa_id;

  -- 2. Atualizar ocorrencia
  update public.ocorrencias_despesas_recorrentes
  set
    status = 'PAGA',
    valor_pago = v_valor_final,
    data_pagamento = v_data_final,
    despesa_id = v_despesa_id,
    updated_at = now()
  where id = p_ocorrencia_id
    and barbearia_id = v_barbearia_id;

  return jsonb_build_object(
    'ocorrencia_id', p_ocorrencia_id,
    'despesa_id', v_despesa_id,
    'status', 'PAGA',
    'valor_pago', v_valor_final,
    'data_pagamento', v_data_final
  );
end;
$$;

comment on function public.pagar_ocorrencia_recorrente(uuid, numeric, date) is
  'Marca uma ocorrencia como PAGA gerando atomicamente o lancamento em despesas.';

-- ============================================================
-- 12. IGNORAR OCORRENCIA RECORRENTE
-- ============================================================

create or replace function public.ignorar_ocorrencia_recorrente(
  p_ocorrencia_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_ocorrencia record;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_ocorrencia_id is null then
    raise exception 'ID da ocorrencia nao informado.';
  end if;

  select *
  into v_ocorrencia
  from public.ocorrencias_despesas_recorrentes
  where id = p_ocorrencia_id
    and barbearia_id = v_barbearia_id
  for update;

  if not found then
    raise exception 'Ocorrencia nao encontrada.';
  end if;

  if v_ocorrencia.status = 'PAGA'::public.status_ocorrencia_despesa then
    raise exception 'Nao e possivel ignorar uma ocorrencia ja paga. Desfaca o pagamento primeiro.';
  end if;

  update public.ocorrencias_despesas_recorrentes
  set
    status = 'IGNORADA',
    updated_at = now()
  where id = p_ocorrencia_id
    and barbearia_id = v_barbearia_id;

  return jsonb_build_object(
    'ocorrencia_id', p_ocorrencia_id,
    'status', 'IGNORADA'
  );
end;
$$;

comment on function public.ignorar_ocorrencia_recorrente(uuid) is
  'Marca uma ocorrencia recorrente como IGNORADA no mes.';

-- ============================================================
-- 13. DESFAZER PAGAMENTO DA OCORRENCIA
-- ============================================================

create or replace function public.desfazer_pagamento_ocorrencia(
  p_ocorrencia_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_ocorrencia record;
  v_despesa_id uuid;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_ocorrencia_id is null then
    raise exception 'ID da ocorrencia nao informado.';
  end if;

  select *
  into v_ocorrencia
  from public.ocorrencias_despesas_recorrentes
  where id = p_ocorrencia_id
    and barbearia_id = v_barbearia_id
  for update;

  if not found then
    raise exception 'Ocorrencia nao encontrada.';
  end if;

  if v_ocorrencia.status <> 'PAGA'::public.status_ocorrencia_despesa then
    raise exception 'Apenas ocorrencias com status PAGA podem ter o pagamento desfeito.';
  end if;

  v_despesa_id := v_ocorrencia.despesa_id;

  -- 1. Desvincular e resetar ocorrencia
  update public.ocorrencias_despesas_recorrentes
  set
    status = 'PENDENTE',
    valor_pago = null,
    data_pagamento = null,
    despesa_id = null,
    updated_at = now()
  where id = p_ocorrencia_id
    and barbearia_id = v_barbearia_id;

  -- 2. Excluir despesa financeira gerada pelo pagamento
  if v_despesa_id is not null then
    delete from public.despesas
    where id = v_despesa_id
      and barbearia_id = v_barbearia_id;
  end if;

  return jsonb_build_object(
    'ocorrencia_id', p_ocorrencia_id,
    'status', 'PENDENTE',
    'despesa_excluida_id', v_despesa_id
  );
end;
$$;

comment on function public.desfazer_pagamento_ocorrencia(uuid) is
  'Desfaz atomicamente o pagamento de uma ocorrencia recorrente, excluindo a despesa gerada e retornando para PENDENTE.';

-- ============================================================
-- 14. DESFAZER IGNORAR OCORRENCIA
-- ============================================================

create or replace function public.desfazer_ignorar_ocorrencia(
  p_ocorrencia_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_ocorrencia_id is null then
    raise exception 'ID da ocorrencia nao informado.';
  end if;

  update public.ocorrencias_despesas_recorrentes
  set
    status = 'PENDENTE',
    updated_at = now()
  where id = p_ocorrencia_id
    and barbearia_id = v_barbearia_id
    and status = 'IGNORADA'::public.status_ocorrencia_despesa;

  if not found then
    raise exception 'Ocorrencia nao encontrada ou nao esta ignorada.';
  end if;

  return jsonb_build_object(
    'ocorrencia_id', p_ocorrencia_id,
    'status', 'PENDENTE'
  );
end;
$$;

comment on function public.desfazer_ignorar_ocorrencia(uuid) is
  'Retorna uma ocorrencia ignorada de volta para o status PENDENTE.';

-- ============================================================
-- 15. OBTER RESUMO FINANCEIRO
-- ============================================================

create or replace function public.obter_resumo_financeiro(
  p_inicio date,
  p_fim date
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_total_entradas numeric(12,2);
  v_total_saidas numeric(12,2);
  v_resultado_estimado numeric(12,2);
  v_quantidade_vendas integer;
  v_quantidade_despesas integer;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_inicio is null or p_fim is null then
    raise exception 'As datas de inicio e fim sao obrigatorias.';
  end if;

  if p_inicio > p_fim then
    raise exception 'A data de inicio nao pode ser posterior a data de fim.';
  end if;

  -- 1. Calcular total de entradas das vendas concluidas no periodo
  select
    coalesce(sum(v.total_liquido), 0),
    count(v.id)
  into
    v_total_entradas,
    v_quantidade_vendas
  from public.vendas v
  where v.barbearia_id = v_barbearia_id
    and v.status = 'CONCLUIDA'::public.status_venda
    and v.ocorrida_em::date >= p_inicio
    and v.ocorrida_em::date <= p_fim;

  -- 2. Calcular total de saidas das despesas registradas no periodo
  select
    coalesce(sum(d.valor), 0),
    count(d.id)
  into
    v_total_saidas,
    v_quantidade_despesas
  from public.despesas d
  where d.barbearia_id = v_barbearia_id
    and d.data_despesa >= p_inicio
    and d.data_despesa <= p_fim;

  -- 3. Resultado estimado = Entradas - Saidas
  v_resultado_estimado := v_total_entradas - v_total_saidas;

  return jsonb_build_object(
    'periodo', jsonb_build_object(
      'inicio', p_inicio,
      'fim', p_fim
    ),
    'total_entradas', v_total_entradas,
    'quantidade_vendas', v_quantidade_vendas,
    'total_saidas', v_total_saidas,
    'quantidade_despesas', v_quantidade_despesas,
    'resultado_estimado', v_resultado_estimado
  );
end;
$$;

comment on function public.obter_resumo_financeiro(date, date) is
  'Consolida entradas reais (vendas CONCLUIDAS) e saidas (despesas pagas) calculando o resultado estimado no periodo.';

-- ============================================================
-- 16. PERMISSOES E SEGURANCA DE ACESSO
-- ============================================================

-- Revogar de public e anon
revoke execute on function public.criar_despesa(text, public.categoria_despesa, numeric, date, text, uuid) from public, anon;
revoke execute on function public.atualizar_despesa(uuid, text, public.categoria_despesa, numeric, date, text, uuid) from public, anon;
revoke execute on function public.excluir_despesa(uuid) from public, anon;
revoke execute on function public.listar_despesas(date, date, text, text, integer, integer) from public, anon;

revoke execute on function public.criar_despesa_recorrente(text, public.categoria_despesa, numeric, integer, text) from public, anon;
revoke execute on function public.atualizar_despesa_recorrente(uuid, text, public.categoria_despesa, numeric, integer, text) from public, anon;
revoke execute on function public.inativar_despesa_recorrente(uuid) from public, anon;
revoke execute on function public.listar_despesas_recorrentes() from public, anon;

revoke execute on function public.calcular_vencimento_competencia(date, integer) from public, anon;
revoke execute on function public.obter_ocorrencias_mes(integer, integer) from public, anon;
revoke execute on function public.pagar_ocorrencia_recorrente(uuid, numeric, date) from public, anon;
revoke execute on function public.ignorar_ocorrencia_recorrente(uuid) from public, anon;
revoke execute on function public.desfazer_pagamento_ocorrencia(uuid) from public, anon;
revoke execute on function public.desfazer_ignorar_ocorrencia(uuid) from public, anon;

revoke execute on function public.obter_resumo_financeiro(date, date) from public, anon;

-- Conceder exclusivamente para authenticated
grant execute on function public.criar_despesa(text, public.categoria_despesa, numeric, date, text, uuid) to authenticated;
grant execute on function public.atualizar_despesa(uuid, text, public.categoria_despesa, numeric, date, text, uuid) to authenticated;
grant execute on function public.excluir_despesa(uuid) to authenticated;
grant execute on function public.listar_despesas(date, date, text, text, integer, integer) to authenticated;

grant execute on function public.criar_despesa_recorrente(text, public.categoria_despesa, numeric, integer, text) to authenticated;
grant execute on function public.atualizar_despesa_recorrente(uuid, text, public.categoria_despesa, numeric, integer, text) to authenticated;
grant execute on function public.inativar_despesa_recorrente(uuid) to authenticated;
grant execute on function public.listar_despesas_recorrentes() to authenticated;

grant execute on function public.calcular_vencimento_competencia(date, integer) to authenticated;
grant execute on function public.obter_ocorrencias_mes(integer, integer) to authenticated;
grant execute on function public.pagar_ocorrencia_recorrente(uuid, numeric, date) to authenticated;
grant execute on function public.ignorar_ocorrencia_recorrente(uuid) to authenticated;
grant execute on function public.desfazer_pagamento_ocorrencia(uuid) to authenticated;
grant execute on function public.desfazer_ignorar_ocorrencia(uuid) to authenticated;

grant execute on function public.obter_resumo_financeiro(date, date) to authenticated;
