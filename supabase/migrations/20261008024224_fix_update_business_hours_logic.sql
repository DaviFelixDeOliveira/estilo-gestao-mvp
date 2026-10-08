-- ============================================================
-- CORRECAO DA RPC DE HORARIOS
-- ============================================================
-- A tela de configuracoes nao pode usar save_onboarding_step_3,
-- porque essa funcao bloqueia quando o onboarding ja foi concluido.

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

  v_item jsonb;
  v_dia smallint;
  v_fechado boolean;

  v_abre_1 time;
  v_fecha_1 time;
  v_abre_2 time;
  v_fecha_2 time;

  v_abre_1_text text;
  v_fecha_1_text text;
  v_abre_2_text text;
  v_fecha_2_text text;

  v_dias_vistos integer[] := '{}'::integer[];
  v_dias_abertos integer := 0;
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

  if p_horarios is null
     or jsonb_typeof(p_horarios) <> 'array' then
    raise exception 'Horarios devem ser enviados como uma lista.';
  end if;

  if jsonb_array_length(p_horarios) <> 7 then
    raise exception 'Informe os horarios dos 7 dias da semana.';
  end if;

  delete from public.horarios_funcionamento
  where barbearia_id = v_barbearia_id;

  for v_item in
    select value
    from jsonb_array_elements(p_horarios)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Configuracao de horario invalida.';
    end if;

    if coalesce(v_item ->> 'dia_semana', '') !~ '^[0-6]$' then
      raise exception 'Dia da semana invalido.';
    end if;

    v_dia := (v_item ->> 'dia_semana')::smallint;

    if v_dia = any(v_dias_vistos) then
      raise exception 'O dia da semana % foi informado mais de uma vez.', v_dia;
    end if;

    v_dias_vistos := array_append(v_dias_vistos, v_dia);

    if not (v_item ? 'fechado')
       or jsonb_typeof(v_item -> 'fechado') <> 'boolean' then
      raise exception 'Informe se o dia % esta fechado.', v_dia;
    end if;

    v_fechado := (v_item ->> 'fechado')::boolean;

    v_abre_1_text := nullif(btrim(v_item ->> 'abre_1'), '');
    v_fecha_1_text := nullif(btrim(v_item ->> 'fecha_1'), '');
    v_abre_2_text := nullif(btrim(v_item ->> 'abre_2'), '');
    v_fecha_2_text := nullif(btrim(v_item ->> 'fecha_2'), '');

    if v_fechado then
      if v_abre_1_text is not null
         or v_fecha_1_text is not null
         or v_abre_2_text is not null
         or v_fecha_2_text is not null then
        raise exception 'Dia fechado nao pode possuir horarios.';
      end if;

      insert into public.horarios_funcionamento (
        barbearia_id,
        dia_semana,
        fechado
      )
      values (
        v_barbearia_id,
        v_dia,
        true
      );
    else
      v_dias_abertos := v_dias_abertos + 1;

      if v_abre_1_text is null or v_fecha_1_text is null then
        raise exception 'Dia aberto deve possuir horario de abertura e fechamento.';
      end if;

      if v_abre_1_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
         or v_fecha_1_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
        raise exception 'Horario principal invalido no dia %.', v_dia;
      end if;

      if (v_abre_2_text is null) <> (v_fecha_2_text is null) then
        raise exception 'O segundo periodo do dia % deve possuir inicio e fim.', v_dia;
      end if;

      if v_abre_2_text is not null
         and (
           v_abre_2_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
           or v_fecha_2_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
         ) then
        raise exception 'Segundo periodo invalido no dia %.', v_dia;
      end if;

      v_abre_1 := v_abre_1_text::time;
      v_fecha_1 := v_fecha_1_text::time;
      v_abre_2 := v_abre_2_text::time;
      v_fecha_2 := v_fecha_2_text::time;

      if v_abre_1 >= v_fecha_1 then
        raise exception 'A abertura deve ocorrer antes do fechamento no dia %.', v_dia;
      end if;

      if v_abre_2 is not null then
        if v_abre_2 >= v_fecha_2 then
          raise exception 'O segundo periodo possui horarios invalidos no dia %.', v_dia;
        end if;

        if v_fecha_1 > v_abre_2 then
          raise exception 'Os periodos de funcionamento se sobrepoem no dia %.', v_dia;
        end if;
      end if;

      insert into public.horarios_funcionamento (
        barbearia_id,
        dia_semana,
        fechado,
        abre_1,
        fecha_1,
        abre_2,
        fecha_2
      )
      values (
        v_barbearia_id,
        v_dia,
        false,
        v_abre_1,
        v_fecha_1,
        v_abre_2,
        v_fecha_2
      );
    end if;
  end loop;

  if v_dias_abertos = 0 then
    raise exception 'Informe pelo menos um dia de funcionamento.';
  end if;
end;
$$;

revoke all on function public.update_business_hours(jsonb) from public;
grant execute on function public.update_business_hours(jsonb) to authenticated;