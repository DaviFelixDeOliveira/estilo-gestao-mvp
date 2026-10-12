-- Migration: 20261012092000_make_motivo_ignorada_optional.sql
-- Descricao: Torna opcional o motivo ao ignorar ocorrencia de despesa recorrente.

create or replace function public.ignorar_ocorrencia_recorrente(
  p_ocorrencia_id uuid,
  p_motivo text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_status public.status_ocorrencia_despesa;
  v_motivo_limpo text;
begin
  v_barbearia_id := public.current_barbearia_id();

  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_ocorrencia_id is null then
    raise exception 'ID da ocorrencia nao informado.';
  end if;

  v_motivo_limpo := nullif(btrim(coalesce(p_motivo, '')), '');

  if v_motivo_limpo is not null and char_length(v_motivo_limpo) > 200 then
    raise exception 'O motivo deve ter no maximo 200 caracteres.';
  end if;

  select status
  into v_status
  from public.ocorrencias_despesas_recorrentes
  where id = p_ocorrencia_id
    and barbearia_id = v_barbearia_id
  for update;

  if not found then
    raise exception 'Ocorrencia nao encontrada.';
  end if;

  if v_status = 'PAGA'::public.status_ocorrencia_despesa then
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
  'Marca uma ocorrencia recorrente como IGNORADA no mes, com motivo opcional de ate 200 caracteres.';

revoke execute on function public.ignorar_ocorrencia_recorrente(uuid, text) from public, anon;
grant execute on function public.ignorar_ocorrencia_recorrente(uuid, text) to authenticated;
