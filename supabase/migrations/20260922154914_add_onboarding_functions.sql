-- ============================================================
-- FUNCOES DO ONBOARDING
-- Salvamento server-side e avanço seguro entre as 6 etapas
-- ============================================================


-- ============================================================
-- CONTEXTO DO ONBOARDING
-- Retorna a barbearia do usuário autenticado e impede que
-- ADMINs, usuários sem perfil ou onboardings já concluídos
-- utilizem as funções de configuração inicial.
-- ============================================================

create or replace function public.current_onboarding_barbearia_id()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_barbearia_id uuid;
  v_tipo public.tipo_usuario;
  v_concluido boolean;
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
    v_concluido
  from public.perfis p
  where p.user_id = auth.uid();

  if not found then
    raise exception 'Perfil da aplicação não encontrado.';
  end if;

  if v_tipo <> 'BARBEIRO'::public.tipo_usuario then
    raise exception 'Somente barbeiros possuem onboarding.';
  end if;

  if v_barbearia_id is null then
    raise exception 'Barbearia não encontrada para o usuário.';
  end if;

  if v_concluido then
    raise exception 'O onboarding já foi concluído.';
  end if;

  return v_barbearia_id;
end;
$$;

revoke all on function public.current_onboarding_barbearia_id() from public;
grant execute on function public.current_onboarding_barbearia_id() to authenticated;


-- ============================================================
-- ETAPA 1
-- Dados da barbearia
-- ============================================================

create or replace function public.save_onboarding_step_1(
  p_nome_marca text,
  p_nome_profissional text,
  p_whatsapp text,
  p_instagram_url text,
  p_logo_path text,
  p_atende_domicilio boolean
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
  v_etapa smallint;
begin
  v_barbearia_id := public.current_onboarding_barbearia_id();

  v_nome_marca := nullif(btrim(p_nome_marca), '');
  v_nome_profissional := nullif(btrim(p_nome_profissional), '');
  v_whatsapp := nullif(btrim(p_whatsapp), '');
  v_instagram_url := nullif(btrim(p_instagram_url), '');
  v_logo_path := nullif(btrim(p_logo_path), '');

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
    atende_domicilio = p_atende_domicilio
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
  boolean
) from public;

grant execute on function public.save_onboarding_step_1(
  text,
  text,
  text,
  text,
  text,
  boolean
) to authenticated;

-- ============================================================
-- ETAPA 2
-- Endereco da barbearia
-- ============================================================

create or replace function public.save_onboarding_step_2(
  p_cep text,
  p_logradouro text,
  p_tem_numero boolean,
  p_numero_endereco text,
  p_complemento text,
  p_bairro text,
  p_cidade text,
  p_uf text
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
  text
) from public;

grant execute on function public.save_onboarding_step_2(
  text,
  text,
  boolean,
  text,
  text,
  text,
  text,
  text
) to authenticated;

-- ============================================================
-- ETAPA 3
-- Horarios de funcionamento
-- ============================================================

create or replace function public.save_onboarding_step_3(
  p_horarios jsonb
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
  v_barbearia_id := public.current_onboarding_barbearia_id();

  select p.onboarding_etapa
  into v_etapa_atual
  from public.perfis p
  where p.user_id = auth.uid();

  if v_etapa_atual < 3 then
    raise exception 'Conclua a etapa 2 antes de preencher os horários.';
  end if;

  if p_horarios is null
     or jsonb_typeof(p_horarios) <> 'array' then
    raise exception 'Horários devem ser enviados como uma lista.';
  end if;

  if jsonb_array_length(p_horarios) <> 7 then
    raise exception 'Informe os horários dos 7 dias da semana.';
  end if;

  -- A substituição inteira ocorre dentro da mesma transação.
  -- Qualquer erro faz toda a chamada ser revertida.
  delete from public.horarios_funcionamento
  where barbearia_id = v_barbearia_id;

  for v_item in
    select value
    from jsonb_array_elements(p_horarios)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Configuração de horário inválida.';
    end if;

    if coalesce(v_item ->> 'dia_semana', '') !~ '^[0-6]$' then
      raise exception 'Dia da semana inválido.';
    end if;

    v_dia := (v_item ->> 'dia_semana')::smallint;

    if v_dia = any(v_dias_vistos) then
      raise exception 'O dia da semana % foi informado mais de uma vez.', v_dia;
    end if;

    v_dias_vistos := array_append(v_dias_vistos, v_dia);

   if not (v_item ? 'fechado')
   or jsonb_typeof(v_item -> 'fechado') <> 'boolean' then
  raise exception 'Informe se o dia % está fechado.', v_dia;
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
        raise exception 'Dia fechado não pode possuir horários.';
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
        raise exception 'Dia aberto deve possuir horário de abertura e fechamento.';
      end if;

      if v_abre_1_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
         or v_fecha_1_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
        raise exception 'Horário principal inválido no dia %.', v_dia;
      end if;

      if (v_abre_2_text is null) <> (v_fecha_2_text is null) then
        raise exception 'O segundo período do dia % deve possuir início e fim.', v_dia;
      end if;

      if v_abre_2_text is not null
         and (
           v_abre_2_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
           or v_fecha_2_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
         ) then
        raise exception 'Segundo período inválido no dia %.', v_dia;
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
          raise exception 'O segundo período possui horários inválidos no dia %.', v_dia;
        end if;

        if v_fecha_1 > v_abre_2 then
          raise exception 'Os períodos de funcionamento se sobrepõem no dia %.', v_dia;
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

  update public.perfis
  set onboarding_etapa = greatest(onboarding_etapa, 4)
  where user_id = auth.uid()
  returning onboarding_etapa into v_etapa;

  return v_etapa;
end;
$$;

revoke all on function public.save_onboarding_step_3(jsonb) from public;
grant execute on function public.save_onboarding_step_3(jsonb) to authenticated;

-- ============================================================
-- ETAPA 4
-- Servicos iniciais
-- ============================================================

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
      true
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

-- ============================================================
-- ETAPA 5
-- Produtos, categorias e formas de pagamento
-- ============================================================

create or replace function public.save_onboarding_step_5(
  p_vende_produtos boolean,
  p_categorias jsonb,
  p_produtos jsonb,
  p_formas_pagamento jsonb
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

  v_codigo_sugerido text;
  v_nome_categoria text;
  v_nome_categoria_normalizado text;
  v_imagem_padrao_path text;

  v_categorias_normalizadas text[] := '{}'::text[];

  v_categoria_produto text;
  v_categoria_produto_normalizada text;
  v_categoria_id uuid;

  v_nome_produto text;
  v_descricao_produto text;

  v_preco_custo_text text;
  v_preco_custo numeric(12,2);

  v_preco_venda_text text;
  v_preco_venda numeric(12,2);

  v_imagem_path text;

  v_forma_text text;
  v_formas_vistas text[] := '{}'::text[];
begin
  v_barbearia_id := public.current_onboarding_barbearia_id();

  select p.onboarding_etapa
  into v_etapa_atual
  from public.perfis p
  where p.user_id = auth.uid();

  if v_etapa_atual < 5 then
    raise exception 'Conclua a etapa 4 antes de configurar produtos e pagamentos.';
  end if;

  if p_vende_produtos is null then
    raise exception 'Informe se a barbearia vende produtos ou bebidas.';
  end if;

  -- Formas de pagamento são obrigatórias independentemente
  -- de a barbearia vender produtos.
  if p_formas_pagamento is null
     or jsonb_typeof(p_formas_pagamento) <> 'array'
     or jsonb_array_length(p_formas_pagamento) < 1 then
    raise exception 'Selecione pelo menos uma forma de pagamento.';
  end if;

  -- Durante o onboarding esta etapa representa a configuração
  -- inicial completa. Qualquer falha reverte toda a chamada.
  delete from public.produtos
  where barbearia_id = v_barbearia_id;

  delete from public.categorias_produto
  where barbearia_id = v_barbearia_id;

  delete from public.barbearia_formas_pagamento
  where barbearia_id = v_barbearia_id;

  -- ==========================================================
  -- CATEGORIAS E PRODUTOS
  -- ==========================================================

  if p_vende_produtos then
    if p_categorias is null
       or jsonb_typeof(p_categorias) <> 'array'
       or jsonb_array_length(p_categorias) < 1 then
      raise exception 'Selecione ou crie pelo menos uma categoria.';
    end if;

    if p_produtos is null
       or jsonb_typeof(p_produtos) <> 'array'
       or jsonb_array_length(p_produtos) < 1 then
      raise exception 'Cadastre pelo menos um produto.';
    end if;

    for v_item in
      select value
      from jsonb_array_elements(p_categorias)
    loop
      if jsonb_typeof(v_item) <> 'object' then
        raise exception 'Categoria inválida.';
      end if;

      v_codigo_sugerido := upper(
        nullif(btrim(v_item ->> 'codigo_sugerido'), '')
      );

      v_nome_categoria := nullif(
        btrim(v_item ->> 'nome'),
        ''
      );

      v_imagem_padrao_path := null;

      if v_codigo_sugerido is not null then
        if v_nome_categoria is not null then
          raise exception 'Categoria sugerida não deve possuir nome personalizado.';
        end if;

        case v_codigo_sugerido
          when 'BEBIDA' then
            v_nome_categoria := 'Bebida';
            v_imagem_padrao_path := 'sistema/categorias/bebida.webp';

          when 'POMADA' then
            v_nome_categoria := 'Pomada';
            v_imagem_padrao_path := 'sistema/categorias/pomada.webp';

          when 'SHAMPOO' then
            v_nome_categoria := 'Shampoo';
            v_imagem_padrao_path := 'sistema/categorias/shampoo.webp';

          when 'CERA' then
            v_nome_categoria := 'Cera';
            v_imagem_padrao_path := 'sistema/categorias/cera.webp';

          when 'OLEO_BALM_BARBA' then
            v_nome_categoria := 'Óleo/Balm para barba';
            v_imagem_padrao_path := 'sistema/categorias/oleo-balm-barba.webp';

          when 'ACESSORIOS' then
            v_nome_categoria := 'Acessórios';
            v_imagem_padrao_path := 'sistema/categorias/acessorios.webp';

          when 'OUTROS' then
            v_nome_categoria := 'Outros';
            v_imagem_padrao_path := 'sistema/categorias/outros.webp';

          else
            raise exception 'Categoria sugerida inválida.';
        end case;

      elsif v_nome_categoria is null then
        raise exception 'Categoria personalizada deve possuir nome.';
      end if;

      v_nome_categoria_normalizado := lower(
        regexp_replace(
          v_nome_categoria,
          '[[:space:]]+',
          ' ',
          'g'
        )
      );

      if v_nome_categoria_normalizado = any(v_categorias_normalizadas) then
        raise exception 'Não é permitido cadastrar categorias duplicadas.';
      end if;

      v_categorias_normalizadas := array_append(
        v_categorias_normalizadas,
        v_nome_categoria_normalizado
      );

      insert into public.categorias_produto (
        barbearia_id,
        nome,
        imagem_padrao_path,
        ativo
      )
      values (
        v_barbearia_id,
        v_nome_categoria,
        v_imagem_padrao_path,
        true
      );
    end loop;

    for v_item in
      select value
      from jsonb_array_elements(p_produtos)
    loop
      if jsonb_typeof(v_item) <> 'object' then
        raise exception 'Produto inválido.';
      end if;

      v_categoria_produto := nullif(
        btrim(v_item ->> 'categoria_nome'),
        ''
      );

      if v_categoria_produto is null then
        raise exception 'Categoria do produto é obrigatória.';
      end if;

      v_categoria_produto_normalizada := lower(
        regexp_replace(
          v_categoria_produto,
          '[[:space:]]+',
          ' ',
          'g'
        )
      );

      select c.id
      into v_categoria_id
      from public.categorias_produto c
      where c.barbearia_id = v_barbearia_id
        and lower(
          regexp_replace(
            btrim(c.nome),
            '[[:space:]]+',
            ' ',
            'g'
          )
        ) = v_categoria_produto_normalizada
      limit 1;

      if v_categoria_id is null then
        raise exception 'Categoria do produto não encontrada.';
      end if;

      v_nome_produto := nullif(
        btrim(v_item ->> 'nome'),
        ''
      );

      if v_nome_produto is null then
        raise exception 'Nome do produto é obrigatório.';
      end if;

      v_descricao_produto := nullif(
        btrim(v_item ->> 'descricao'),
        ''
      );

      v_preco_custo_text := nullif(
        btrim(v_item ->> 'preco_custo'),
        ''
      );

      if v_preco_custo_text is null then
        raise exception 'Preço de custo é obrigatório.';
      end if;

      if v_preco_custo_text !~ '^[0-9]+([.][0-9]{1,2})?$' then
        raise exception 'Preço de custo inválido.';
      end if;

      begin
        v_preco_custo := v_preco_custo_text::numeric(12,2);
      exception
        when numeric_value_out_of_range then
          raise exception 'Preço de custo é muito alto.';
      end;

      if v_preco_custo < 0 then
        raise exception 'Preço de custo não pode ser negativo.';
      end if;

      v_preco_venda_text := nullif(
        btrim(v_item ->> 'preco_venda'),
        ''
      );

      if v_preco_venda_text is null then
        raise exception 'Preço de venda é obrigatório.';
      end if;

      if v_preco_venda_text !~ '^[0-9]+([.][0-9]{1,2})?$' then
        raise exception 'Preço de venda inválido.';
      end if;

      begin
        v_preco_venda := v_preco_venda_text::numeric(12,2);
      exception
        when numeric_value_out_of_range then
          raise exception 'Preço de venda é muito alto.';
      end;

      if v_preco_venda <= 0 then
        raise exception 'Preço de venda deve ser maior que zero.';
      end if;

      v_imagem_path := nullif(
        btrim(v_item ->> 'imagem_path'),
        ''
      );

      if v_imagem_path is not null
         and v_imagem_path !~ (
           '^barbearias/'
           || v_barbearia_id::text
           || '/produtos/'
         ) then
        raise exception 'Caminho da imagem do produto inválido.';
      end if;

      insert into public.produtos (
        barbearia_id,
        categoria_id,
        nome,
        descricao,
        estoque_atual,
        preco_custo,
        preco_venda,
        imagem_path,
        usar_imagem_categoria,
        ativo,
        visivel_vitrine
      )
      values (
        v_barbearia_id,
        v_categoria_id,
        v_nome_produto,
        v_descricao_produto,
        0,
        v_preco_custo,
        v_preco_venda,
        v_imagem_path,
        v_imagem_path is null,
        true,
        true
      );
    end loop;

  else
    -- Se informou que não vende produtos, não deve existir
    -- configuração contraditória no mesmo payload.
    if p_categorias is not null
       and (
         jsonb_typeof(p_categorias) <> 'array'
         or jsonb_array_length(p_categorias) > 0
       ) then
      raise exception 'Categorias não devem ser enviadas quando não há venda de produtos.';
    end if;

    if p_produtos is not null
       and (
         jsonb_typeof(p_produtos) <> 'array'
         or jsonb_array_length(p_produtos) > 0
       ) then
      raise exception 'Produtos não devem ser enviados quando não há venda de produtos.';
    end if;
  end if;

  -- ==========================================================
  -- FORMAS DE PAGAMENTO
  -- ==========================================================

  for v_item in
    select value
    from jsonb_array_elements(p_formas_pagamento)
  loop
    if jsonb_typeof(v_item) <> 'string' then
      raise exception 'Forma de pagamento inválida.';
    end if;

    v_forma_text := upper(
      btrim(v_item #>> '{}')
    );

    if v_forma_text not in (
      'PIX',
      'DINHEIRO',
      'DEBITO',
      'CREDITO',
      'OUTRO'
    ) then
      raise exception 'Forma de pagamento inválida: %.', v_forma_text;
    end if;

    if v_forma_text = any(v_formas_vistas) then
      raise exception 'Forma de pagamento duplicada: %.', v_forma_text;
    end if;

    v_formas_vistas := array_append(
      v_formas_vistas,
      v_forma_text
    );

    insert into public.barbearia_formas_pagamento (
      barbearia_id,
      forma_pagamento
    )
    values (
      v_barbearia_id,
      v_forma_text::public.forma_pagamento
    );
  end loop;

  update public.perfis
  set onboarding_etapa = greatest(onboarding_etapa, 6)
  where user_id = auth.uid()
  returning onboarding_etapa into v_etapa;

  return v_etapa;
end;
$$;

revoke all on function public.save_onboarding_step_5(
  boolean,
  jsonb,
  jsonb,
  jsonb
) from public;

grant execute on function public.save_onboarding_step_5(
  boolean,
  jsonb,
  jsonb,
  jsonb
) to authenticated;

-- ============================================================
-- ETAPA 6
-- Aparencia, validacao final e conclusao do onboarding
-- ============================================================

create or replace function public.save_onboarding_step_6(
  p_tema public.tema_sistema
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_barbearia_id uuid;
  v_etapa_atual smallint;

  v_barbearia public.barbearias%rowtype;

  v_total_horarios integer;
  v_dias_abertos integer;
  v_total_servicos integer;
  v_servicos_invalidos integer;
  v_total_formas_pagamento integer;
begin
  v_barbearia_id := public.current_onboarding_barbearia_id();

  select p.onboarding_etapa
  into v_etapa_atual
  from public.perfis p
  where p.user_id = auth.uid();

  if v_etapa_atual < 6 then
    raise exception 'Conclua a etapa 5 antes de finalizar o onboarding.';
  end if;

  if p_tema is null then
    raise exception 'Tema é obrigatório.';
  end if;

  -- ==========================================================
  -- ETAPA 1
  -- ==========================================================

  select b.*
  into v_barbearia
  from public.barbearias b
  where b.id = v_barbearia_id;

  if v_barbearia.nome_marca is null
     or btrim(v_barbearia.nome_marca) = '' then
    raise exception 'Nome da barbearia não foi preenchido.';
  end if;

  if v_barbearia.whatsapp is null
     or v_barbearia.whatsapp !~ '^\+55[1-9][0-9][0-9]{8,9}$' then
    raise exception 'WhatsApp da barbearia é inválido.';
  end if;

  if v_barbearia.atende_domicilio is null then
    raise exception 'Atendimento em domicílio não foi informado.';
  end if;

  -- ==========================================================
  -- ETAPA 2
  -- ==========================================================

  if v_barbearia.cep is null
     or v_barbearia.cep !~ '^[0-9]{8}$' then
    raise exception 'CEP não foi preenchido corretamente.';
  end if;

  if v_barbearia.logradouro is null
     or btrim(v_barbearia.logradouro) = '' then
    raise exception 'Logradouro não foi preenchido.';
  end if;

  if v_barbearia.tem_numero is null then
    raise exception 'Informação de número do endereço não foi preenchida.';
  end if;

  if v_barbearia.tem_numero
     and (
       v_barbearia.numero_endereco is null
       or btrim(v_barbearia.numero_endereco) = ''
     ) then
    raise exception 'Número do endereço não foi preenchido.';
  end if;

  if v_barbearia.bairro is null
     or btrim(v_barbearia.bairro) = '' then
    raise exception 'Bairro não foi preenchido.';
  end if;

  if v_barbearia.cidade is null
     or btrim(v_barbearia.cidade) = '' then
    raise exception 'Cidade não foi preenchida.';
  end if;

  if v_barbearia.uf is null
     or v_barbearia.uf !~ '^[A-Za-z]{2}$' then
    raise exception 'UF não foi preenchida corretamente.';
  end if;

  -- ==========================================================
  -- ETAPA 3
  -- ==========================================================

  select
    count(*),
    count(*) filter (where fechado = false)
  into
    v_total_horarios,
    v_dias_abertos
  from public.horarios_funcionamento
  where barbearia_id = v_barbearia_id;

  if v_total_horarios <> 7 then
    raise exception 'Os horários dos 7 dias da semana devem estar configurados.';
  end if;

  if v_dias_abertos < 1 then
    raise exception 'É necessário possuir pelo menos um dia de funcionamento.';
  end if;

  -- ==========================================================
  -- ETAPA 4
  -- ==========================================================

  select count(*)
  into v_total_servicos
  from public.servicos
  where barbearia_id = v_barbearia_id;

  if v_total_servicos < 1 then
    raise exception 'É necessário cadastrar pelo menos um serviço.';
  end if;

  select count(*)
  into v_servicos_invalidos
  from public.servicos
  where barbearia_id = v_barbearia_id
    and preco <= 0;

  if v_servicos_invalidos > 0 then
    raise exception 'Todos os serviços devem possuir preço maior que zero.';
  end if;

  -- ==========================================================
  -- ETAPA 5
  -- ==========================================================

  select count(*)
  into v_total_formas_pagamento
  from public.barbearia_formas_pagamento
  where barbearia_id = v_barbearia_id;

  if v_total_formas_pagamento < 1 then
    raise exception 'Selecione pelo menos uma forma de pagamento.';
  end if;

  -- ==========================================================
  -- CONCLUSAO
  -- ==========================================================

  update public.perfis
  set
    tema = p_tema,
    onboarding_etapa = 6,
    onboarding_concluido = true
  where user_id = auth.uid();

  return true;
end;
$$;

revoke all on function public.save_onboarding_step_6(
  public.tema_sistema
) from public;

grant execute on function public.save_onboarding_step_6(
  public.tema_sistema
) to authenticated;