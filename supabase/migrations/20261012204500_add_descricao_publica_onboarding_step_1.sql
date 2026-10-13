-- ============================================================
-- ETAPA 1 DO ONBOARDING
-- Adiciona o parametro descricao_publica ao
-- save_onboarding_step_1 usando a coluna ja existente
-- public.barbearias.descricao_publica.
-- Nenhuma tabela ou coluna e alterada.
-- ============================================================

-- A troca de assinatura exige a remocao da funcao anterior.
drop function if exists public.save_onboarding_step_1(
  text,
  text,
  text,
  text,
  text,
  boolean
);

create or replace function public.save_onboarding_step_1(
  p_nome_marca text,
  p_nome_profissional text,
  p_whatsapp text,
  p_instagram_url text,
  p_logo_path text,
  p_atende_domicilio boolean,
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

  if p_atende_domicilio is null then
    raise exception 'Informe se atende em domicílio.';
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

  update public.barbearias
  set
    nome_marca = v_nome_marca,
    nome_profissional = v_nome_profissional,
    whatsapp = v_whatsapp,
    instagram_url = v_instagram_url,
    logo_path = v_logo_path,
    atende_domicilio = p_atende_domicilio,
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
  boolean,
  text
) from public;

grant execute on function public.save_onboarding_step_1(
  text,
  text,
  text,
  text,
  text,
  boolean,
  text
) to authenticated;
