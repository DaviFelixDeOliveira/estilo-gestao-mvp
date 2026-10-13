-- ============================================================
-- ETAPA 4 DO ONBOARDING: PASSA A LER visivel_vitrine DO PAYLOAD.
--
-- Antes: save_onboarding_step_4 gravava visivel_vitrine SEMPRE
--        como true.
-- Depois: o campo passa a ser lido de cada item do payload. Se
--        o item não trouxer a chave visivel_vitrine, usa true
--        por compatibilidade com chamadas antigas.
--
-- Nenhuma tabela ou coluna e alterada (public.servicos.
-- visivel_vitrine ja existe). Apenas a definicao da funcao e
-- substituida com create or replace, preservando os dados.
-- ============================================================

drop function if exists public.save_onboarding_step_4(jsonb);

create or replace function public.save_onboarding_step_4(
  p_servicos jsonb
)
returns smallint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_barbearia_id uuid;
  v_etapa_atual smallint;
  v_etapa smallint;

  v_item jsonb;

  v_nome text;
  v_nome_normalizado text;
  v_descricao text;

  v_preco_text text;
  v_preco numeric(12,2);

  v_custo_text text;
  v_custo numeric(12,2);

  v_visivel_vitrine boolean;

  v_nomes_normalizados text[] := '{}'::text[];
begin
  v_barbearia_id := public.current_onboarding_barbearia_id();

  select p.onboarding_etapa
  into v_etapa_atual
  from public.perfis p
  where p.user_id = auth.uid();

  if v_etapa_atual < 4 then
    raise exception 'Conclua a etapa 3 antes de cadastrar os serviços.';
  end if;

  if p_servicos is null
     or jsonb_typeof(p_servicos) <> 'array' then
    raise exception 'Serviços devem ser enviados como uma lista.';
  end if;

  if jsonb_array_length(p_servicos) < 1 then
    raise exception 'Cadastre pelo menos um serviço.';
  end if;

  -- Durante o onboarding, esta etapa representa a lista completa
  -- de serviços iniciais. Qualquer erro reverte toda a operação.
  delete from public.servicos
  where barbearia_id = v_barbearia_id;

  for v_item in
    select value
    from jsonb_array_elements(p_servicos)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Serviço inválido.';
    end if;

    v_nome := nullif(btrim(v_item ->> 'nome'), '');
    v_descricao := nullif(btrim(v_item ->> 'descricao'), '');

    if v_nome is null then
      raise exception 'Nome do serviço é obrigatório.';
    end if;

    v_nome_normalizado := lower(
      regexp_replace(
        v_nome,
        '[[:space:]]+',
        ' ',
        'g'
      )
    );

    if v_nome_normalizado = any(v_nomes_normalizados) then
      raise exception 'Não é permitido cadastrar serviços com nomes duplicados.';
    end if;

    v_nomes_normalizados := array_append(
      v_nomes_normalizados,
      v_nome_normalizado
    );

    v_preco_text := nullif(btrim(v_item ->> 'preco'), '');

    if v_preco_text is null then
      raise exception 'Preço do serviço é obrigatório.';
    end if;

    if v_preco_text !~ '^[0-9]+([.][0-9]{1,2})?$' then
      raise exception 'Preço do serviço inválido.';
    end if;

    begin
      v_preco := v_preco_text::numeric(12,2);
    exception
      when numeric_value_out_of_range then
        raise exception 'Preço do serviço é muito alto.';
    end;

    if v_preco <= 0 then
      raise exception 'Preço do serviço deve ser maior que zero.';
    end if;

    v_custo_text := nullif(btrim(v_item ->> 'custo_estimado'), '');

    if v_custo_text is null then
      v_custo := null;
    else
      if v_custo_text !~ '^[0-9]+([.][0-9]{1,2})?$' then
        raise exception 'Custo estimado do serviço inválido.';
      end if;

      begin
        v_custo := v_custo_text::numeric(12,2);
      exception
        when numeric_value_out_of_range then
          raise exception 'Custo estimado do serviço é muito alto.';
      end;

      if v_custo < 0 then
        raise exception 'Custo estimado não pode ser negativo.';
      end if;
    end if;

    -- Visibilidade na vitrine: lida do payload. Quando a chave
    -- não vier, assume true para manter compatibilidade.
    if v_item ? 'visivel_vitrine' then
      v_visivel_vitrine := (v_item ->> 'visivel_vitrine')::boolean;
    else
      v_visivel_vitrine := true;
    end if;

    insert into public.servicos (
      barbearia_id,
      nome,
      descricao,
      preco,
      custo_estimado,
      ativo,
      visivel_vitrine
    )
    values (
      v_barbearia_id,
      v_nome,
      v_descricao,
      v_preco,
      v_custo,
      true,
      v_visivel_vitrine
    );
  end loop;

  update public.perfis
  set onboarding_etapa = greatest(onboarding_etapa, 5)
  where user_id = auth.uid()
  returning onboarding_etapa into v_etapa;

  return v_etapa;
end;
$$;

revoke all on function public.save_onboarding_step_4(jsonb) from public;

grant execute on function public.save_onboarding_step_4(jsonb) to authenticated;
