-- ============================================================
-- MOVE "FORMATO DE ATENDIMENTO" (atende_domicilio) DA ETAPA 1
-- PARA A ETAPA 2 DO ONBOARDING.
--
-- Antes: save_onboarding_step_1 validava e gravava o campo
--        atende_domicilio.
-- Depois: a etapa 1 deixa de tratar o campo e a etapa 2 passa a
--        ser a responsavel por ele.
--
-- Nenhuma tabela ou coluna e alterada (public.barbearias.
-- atende_domicilio ja existe). Apenas as definicoes das funcoes
-- sao substituidas com create or replace, preservando os dados.
-- ============================================================

-- ------------------------------------------------------------
-- ETAPA 1: remove o parametro p_atende_domicilio.
-- A assinatura antiga era (text, text, text, text, text,
-- boolean, text). A troca exige drop da versao anterior.
-- ------------------------------------------------------------
drop function if exists public.save_onboarding_step_1(
  text,
  text,
  text,
  text,
  text,
  boolean,
  text
);

create or replace function public.save_onboarding_step_1(
  p_nome_marca text,
  p_nome_profissional text,
  p_whatsapp text,
  p_instagram_url text,
  p_logo_path text,
  p_descricao_publica text default null
)
returns smallint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_barbearia_id uuid;
  v_nome_marca text;
  v_nome_profissional text;
  v_whatsapp text;
  v_instagram_url text;
  v_logo_path text;
  v_descricao_publica text;
  v_etapa smallint;
begin
  v_barbearia_id := public.current_onboarding_barbearia_id();

  v_nome_marca := nullif(btrim(p_nome_marca), '');
  v_nome_profissional := nullif(btrim(p_nome_profissional), '');
  v_whatsapp := nullif(btrim(p_whatsapp), '');
  v_instagram_url := nullif(btrim(p_instagram_url), '');
  v_logo_path := nullif(btrim(p_logo_path), '');
  v_descricao_publica := nullif(btrim(p_descricao_publica), '');

  if v_nome_marca is null then
    raise exception 'Nome da barbearia é obrigatório.';
  end if;

  if char_length(v_nome_marca) > 100 then
    raise exception 'Nome da barbearia deve possuir no máximo 100 caracteres.';
  end if;

  if v_nome_profissional is not null
     and char_length(v_nome_profissional) > 100 then
    raise exception 'Nome profissional deve possuir no máximo 100 caracteres.';
  end if;

  if v_whatsapp is null then
    raise exception 'WhatsApp é obrigatório.';
  end if;

  -- +55 + DDD + número com 8 ou 9 dígitos.
  if v_whatsapp !~ '^\+55[1-9][0-9][0-9]{8,9}$' then
    raise exception 'WhatsApp deve estar no formato brasileiro com +55 e DDD.';
  end if;

  if v_descricao_publica is not null
     and char_length(v_descricao_publica) > 200 then
    raise exception 'Descrição pública deve possuir no máximo 200 caracteres.';
  end if;

  if v_logo_path is not null
     and v_logo_path !~ (
       '^barbearias/'
       || v_barbearia_id::text
       || '/logo/'
     ) then
    raise exception 'Caminho da logo inválido.';
  end if;

  -- O campo atende_domicilio não é mais tratado nesta etapa.
  update public.barbearias
  set
    nome_marca = v_nome_marca,
    nome_profissional = v_nome_profissional,
    whatsapp = v_whatsapp,
    instagram_url = v_instagram_url,
    logo_path = v_logo_path,
    descricao_publica = v_descricao_publica
  where id = v_barbearia_id;

  -- Nunca retrocede uma etapa caso o usuário volte para editar.
  update public.perfis
  set onboarding_etapa = greatest(onboarding_etapa, 2)
  where user_id = auth.uid()
  returning onboarding_etapa into v_etapa;

  return v_etapa;
end;
$$;

revoke all on function public.save_onboarding_step_1(
  text,
  text,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.save_onboarding_step_1(
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

-- ------------------------------------------------------------
-- ETAPA 2: adiciona o parametro p_atende_domicilio.
-- A assinatura antiga era (text, text, boolean, text, text,
-- text, text, text). A troca exige drop da versao anterior.
-- ------------------------------------------------------------
drop function if exists public.save_onboarding_step_2(
  text,
  text,
  boolean,
  text,
  text,
  text,
  text,
  text
);

create or replace function public.save_onboarding_step_2(
  p_cep text,
  p_logradouro text,
  p_tem_numero boolean,
  p_numero_endereco text,
  p_complemento text,
  p_bairro text,
  p_cidade text,
  p_uf text,
  p_atende_domicilio boolean default null
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

  v_cep text;
  v_logradouro text;
  v_numero_endereco text;
  v_complemento text;
  v_bairro text;
  v_cidade text;
  v_uf text;
begin
  v_barbearia_id := public.current_onboarding_barbearia_id();

  select p.onboarding_etapa
  into v_etapa_atual
  from public.perfis p
  where p.user_id = auth.uid();

  if v_etapa_atual < 2 then
    raise exception 'Conclua a etapa 1 antes de preencher o endereço.';
  end if;

  -- Aceita tanto 11730000 quanto 11730-000 e persiste apenas dígitos.
  v_cep := regexp_replace(
    coalesce(p_cep, ''),
    '[^0-9]',
    '',
    'g'
  );

  v_logradouro := nullif(btrim(p_logradouro), '');
  v_numero_endereco := nullif(btrim(p_numero_endereco), '');
  v_complemento := nullif(btrim(p_complemento), '');
  v_bairro := nullif(btrim(p_bairro), '');
  v_cidade := nullif(btrim(p_cidade), '');
  v_uf := upper(nullif(btrim(p_uf), ''));

  if v_cep !~ '^[0-9]{8}$' then
    raise exception 'CEP deve possuir 8 dígitos.';
  end if;

  if v_logradouro is null then
    raise exception 'Logradouro é obrigatório.';
  end if;

  if p_tem_numero is null then
    raise exception 'Informe se o endereço possui número.';
  end if;

  if p_tem_numero = true and v_numero_endereco is null then
    raise exception 'Número do endereço é obrigatório.';
  end if;

  if p_tem_numero = false then
    v_numero_endereco := null;
  end if;

  if v_bairro is null then
    raise exception 'Bairro é obrigatório.';
  end if;

  if v_cidade is null then
    raise exception 'Cidade é obrigatória.';
  end if;

  if v_uf is null or v_uf !~ '^[A-Z]{2}$' then
    raise exception 'UF deve possuir 2 letras.';
  end if;

  if p_atende_domicilio is null then
    raise exception 'Informe se atende em domicílio.';
  end if;

  update public.barbearias
  set
    cep = v_cep,
    logradouro = v_logradouro,
    tem_numero = p_tem_numero,
    numero_endereco = v_numero_endereco,
    complemento = v_complemento,
    bairro = v_bairro,
    cidade = v_cidade,
    uf = v_uf,
    atende_domicilio = p_atende_domicilio
  where id = v_barbearia_id;

  update public.perfis
  set onboarding_etapa = greatest(onboarding_etapa, 3)
  where user_id = auth.uid()
  returning onboarding_etapa into v_etapa;

  return v_etapa;
end;
$$;

revoke all on function public.save_onboarding_step_2(
  text,
  text,
  boolean,
  text,
  text,
  text,
  text,
  text,
  boolean
) from public;

grant execute on function public.save_onboarding_step_2(
  text,
  text,
  boolean,
  text,
  text,
  text,
  text,
  text,
  boolean
) to authenticated;
