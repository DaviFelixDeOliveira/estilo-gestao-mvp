-- ============================================================
-- HORARIOS DA BARBEARIA APOS O ONBOARDING
-- ============================================================

create or replace function public.update_business_hours(
  p_horarios jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_barbearia_id uuid;
  v_tipo text;
  v_onboarding_concluido boolean;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  select
    p.barbearia_id,
    p.tipo,
    p.onboarding_concluido
  into
    v_barbearia_id,
    v_tipo,
    v_onboarding_concluido
  from public.perfis p
  where p.user_id = v_user_id;

  if v_tipo is null then
    raise exception 'Perfil do usuario nao encontrado.';
  end if;

  if v_tipo <> 'BARBEIRO' then
    raise exception 'Somente barbeiros podem editar os horarios da barbearia.';
  end if;

  if v_barbearia_id is null then
    raise exception 'Barbearia do usuario nao encontrada.';
  end if;

  if coalesce(v_onboarding_concluido, false) is not true then
    raise exception 'Conclua o onboarding antes de editar os horarios por esta tela.';
  end if;

  -- Reaproveita a validacao segura ja existente no onboarding:
  -- - lista com 7 dias
  -- - dia_semana de 0 a 6
  -- - sem dias duplicados
  -- - dia fechado sem horarios
  -- - dia aberto com horarios validos
  -- - pelo menos 1 dia aberto
  perform public.save_onboarding_step_3(p_horarios);
end;
$$;

revoke all on function public.update_business_hours(jsonb) from public;
grant execute on function public.update_business_hours(jsonb) to authenticated;

-- A partir de agora, escrita direta fica bloqueada para usuarios comuns.
-- A tela de configuracoes deve usar a RPC update_business_hours(...).
-- A leitura propria continua liberada pela policy horarios_select_proprios.
drop policy if exists horarios_insert_proprios on public.horarios_funcionamento;
drop policy if exists horarios_update_proprios on public.horarios_funcionamento;
drop policy if exists horarios_delete_proprios on public.horarios_funcionamento;

revoke insert, update, delete on table public.horarios_funcionamento from anon, authenticated;
grant select on table public.horarios_funcionamento to authenticated;