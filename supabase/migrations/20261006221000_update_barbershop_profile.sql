-- ============================================================
-- DADOS DA BARBEARIA POS-ONBOARDING
-- Atualizacao controlada dos dados editaveis pelo BARBEIRO
-- ============================================================

create or replace function public.update_barbershop_profile(
  p_nome_marca text,
  p_nome_profissional text,
  p_whatsapp text,
  p_instagram_url text,
  p_descricao_publica text,
  p_logo_path text,
  p_capa_path text,
  p_atende_domicilio boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_barbearia_id uuid;
  v_tipo public.tipo_usuario;
  v_onboarding_concluido boolean;

  v_nome_marca text;
  v_nome_profissional text;
  v_whatsapp text;
  v_instagram_url text;
  v_descricao_publica text;
  v_logo_path text;
  v_capa_path text;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
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
  where p.user_id = auth.uid();

  if not found then
    raise exception 'Perfil da aplicação não encontrado.';
  end if;

  if v_tipo <> 'BARBEIRO'::public.tipo_usuario then
    raise exception 'Somente barbeiros podem alterar os dados da barbearia.';
  end if;

  if v_barbearia_id is null then
    raise exception 'Barbearia não encontrada para o usuário.';
  end if;

  if not coalesce(v_onboarding_concluido, false) then
    raise exception 'Conclua o onboarding antes de alterar os dados da barbearia.';
  end if;

  v_nome_marca := nullif(btrim(p_nome_marca), '');
  v_nome_profissional := nullif(btrim(p_nome_profissional), '');
  v_whatsapp := nullif(btrim(p_whatsapp), '');
  v_instagram_url := nullif(btrim(p_instagram_url), '');
  v_descricao_publica := nullif(btrim(p_descricao_publica), '');
  v_logo_path := nullif(btrim(p_logo_path), '');
  v_capa_path := nullif(btrim(p_capa_path), '');

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

  if v_capa_path is not null
     and v_capa_path !~ (
       '^barbearias/'
       || v_barbearia_id::text
       || '/capa/'
     ) then
    raise exception 'Caminho da capa inválido.';
  end if;

  update public.barbearias
  set
    nome_marca = v_nome_marca,
    nome_profissional = v_nome_profissional,
    whatsapp = v_whatsapp,
    instagram_url = v_instagram_url,
    descricao_publica = v_descricao_publica,
    logo_path = v_logo_path,
    capa_path = v_capa_path,
    atende_domicilio = p_atende_domicilio
  where id = v_barbearia_id;

  if not found then
    raise exception 'Barbearia não encontrada.';
  end if;

  return true;
end;
$$;

revoke all on function public.update_barbershop_profile(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean
) from public;

grant execute on function public.update_barbershop_profile(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean
) to authenticated;

comment on function public.update_barbershop_profile(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean
) is
  'Atualiza somente os dados editáveis da própria barbearia após a conclusão do onboarding.';