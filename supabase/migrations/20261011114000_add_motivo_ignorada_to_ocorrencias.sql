-- Migration: 20261011114000_add_motivo_ignorada_to_ocorrencias.sql
-- Descricao: Adiciona motivo e data ao ignorar ocorrencia de despesa recorrente,
-- atualizando as RPCs ignorar_ocorrencia_recorrente, desfazer_ignorar_ocorrencia e obter_ocorrencias_mes.

-- 1. Adicionar colunas e constraint em public.ocorrencias_despesas_recorrentes
alter table public.ocorrencias_despesas_recorrentes
  add column if not exists motivo_ignorada text null,
  add column if not exists ignorada_em timestamptz null;

alter table public.ocorrencias_despesas_recorrentes
  drop constraint if exists chk_ocorrencias_motivo_ignorada_tamanho;

alter table public.ocorrencias_despesas_recorrentes
  add constraint chk_ocorrencias_motivo_ignorada_tamanho
  check (motivo_ignorada is null or char_length(motivo_ignorada) <= 200);

comment on column public.ocorrencias_despesas_recorrentes.motivo_ignorada is
  'Motivo obrigatorio preenchido pelo usuario ao ignorar a ocorrencia no mes (maximo 200 caracteres).';

comment on column public.ocorrencias_despesas_recorrentes.ignorada_em is
  'Data e hora em que a ocorrencia foi marcada como ignorada.';

-- 2. Atualizar RPC obter_ocorrencias_mes para retornar motivo_ignorada e ignorada_em
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

  if p_ano is null or p_mes is null or p_mes < 1 or p_mes > 12 then
    raise exception 'Ano ou mes invalido para busca de ocorrencias.';
  end if;

  v_competencia := make_date(p_ano, p_mes, 1);

  -- Provisionamento sob demanda de ocorrencias pendentes para despesas ativas
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
        'motivo_ignorada', o.motivo_ignorada,
        'ignorada_em', o.ignorada_em,
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
  'Obtem e provisiona atomicamente as ocorrencias de despesas recorrentes do mes informado, incluindo motivo caso ignorada.';

-- 3. Dropar assinatura antiga e recriar RPC ignorar_ocorrencia_recorrente com motivo obrigatorio
drop function if exists public.ignorar_ocorrencia_recorrente(uuid);

create or replace function public.ignorar_ocorrencia_recorrente(
  p_ocorrencia_id uuid,
  p_motivo text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_ocorrencia record;
  v_motivo_limpo text;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_ocorrencia_id is null then
    raise exception 'ID da ocorrencia nao informado.';
  end if;

  v_motivo_limpo := trim(coalesce(p_motivo, ''));
  if char_length(v_motivo_limpo) = 0 then
    raise exception 'Informe o motivo para ignorar a ocorrencia.';
  end if;

  if char_length(v_motivo_limpo) > 200 then
    raise exception 'O motivo deve ter no maximo 200 caracteres.';
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
    motivo_ignorada = v_motivo_limpo,
    ignorada_em = now(),
    updated_at = now()
  where id = p_ocorrencia_id
    and barbearia_id = v_barbearia_id;

  return jsonb_build_object(
    'ocorrencia_id', p_ocorrencia_id,
    'status', 'IGNORADA',
    'motivo_ignorada', v_motivo_limpo,
    'ignorada_em', now()
  );
end;
$$;

comment on function public.ignorar_ocorrencia_recorrente(uuid, text) is
  'Marca uma ocorrencia recorrente como IGNORADA no mes mediante motivo obrigatorio de ate 200 caracteres.';

-- 4. Atualizar RPC desfazer_ignorar_ocorrencia para resetar motivo_ignorada e ignorada_em
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
    motivo_ignorada = null,
    ignorada_em = null,
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
  'Restaura uma ocorrencia ignorada de volta para status PENDENTE limpando o motivo.';

-- 5. Revogar e conceder permissoes (acesso somente para authenticated)
revoke execute on function public.obter_ocorrencias_mes(integer, integer) from public, anon;
grant execute on function public.obter_ocorrencias_mes(integer, integer) to authenticated;

revoke execute on function public.ignorar_ocorrencia_recorrente(uuid, text) from public, anon;
grant execute on function public.ignorar_ocorrencia_recorrente(uuid, text) to authenticated;

revoke execute on function public.desfazer_ignorar_ocorrencia(uuid) from public, anon;
grant execute on function public.desfazer_ignorar_ocorrencia(uuid) to authenticated;
