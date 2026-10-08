-- ============================================================
-- EDICAO DOS DADOS DE ENDERECO DA BARBEARIA
-- Permite ao BARBEIRO atualizar o endereco depois do onboarding
-- sem permitir update direto em campos administrativos.
-- ============================================================

create or replace function public.update_barbershop_address(
  p_cep text,
  p_logradouro text,
  p_tem_numero boolean,
  p_numero_endereco text,
  p_complemento text,
  p_bairro text,
  p_cidade text,
  p_uf text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_barbearia_id uuid;
  v_tipo public.tipo_usuario;
  v_onboarding_concluido boolean;

  v_cep text;
  v_logradouro text;
  v_numero_endereco text;
  v_complemento text;
  v_bairro text;
  v_cidade text;
  v_uf text;
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
    raise exception 'Somente barbeiros podem editar o endereço da barbearia.';
  end if;

  if v_barbearia_id is null then
    raise exception 'Barbearia não encontrada para o usuário.';
  end if;

  if not v_onboarding_concluido then
    raise exception 'Conclua o onboarding antes de editar o endereço por esta tela.';
  end if;

  -- Aceita tanto 11730000 quanto 11730-000 e salva apenas os dígitos.
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

  -- Regra oficial do MVP:
  -- nunca salvar "S/N".
  -- Se o endereço não possui número, o correto é tem_numero=false e numero_endereco=null.
  if p_tem_numero = true
     and v_numero_endereco ~* '^(s\s*/?\s*n|sem\s+n[uú]mero)$' then
    raise exception 'Não use S/N. Se o endereço não possui número, selecione Não.';
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

  update public.barbearias
  set
    cep = v_cep,
    logradouro = v_logradouro,
    tem_numero = p_tem_numero,
    numero_endereco = v_numero_endereco,
    complemento = v_complemento,
    bairro = v_bairro,
    cidade = v_cidade,
    uf = v_uf
  where id = v_barbearia_id;
end;
$$;

revoke all on function public.update_barbershop_address(
  text,
  text,
  boolean,
  text,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.update_barbershop_address(
  text,
  text,
  boolean,
  text,
  text,
  text,
  text,
  text
) to authenticated;
