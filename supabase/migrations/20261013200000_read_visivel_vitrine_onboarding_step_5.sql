-- ============================================================
-- ETAPA 5 DO ONBOARDING: PASSA A LER visivel_vitrine DO PRODUTO.
--
-- Antes: save_onboarding_step_5 gravava visivel_vitrine dos
--        produtos SEMPRE como true.
-- Depois: o campo passa a ser lido de cada produto do payload.
--        Se o produto não trouxer a chave visivel_vitrine, usa
--        true por compatibilidade com chamadas antigas.
--
-- Nenhuma tabela ou coluna e alterada (public.produtos.
-- visivel_vitrine ja existe). Apenas a definicao da funcao e
-- substituida com create or replace, preservando os dados.
-- ============================================================

drop function if exists public.save_onboarding_step_5(
  boolean,
  jsonb,
  jsonb,
  jsonb
);

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

  v_visivel_vitrine boolean;

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

      -- Visibilidade na vitrine: lida do payload. Quando a chave
      -- não vier, assume true para manter compatibilidade.
      if v_item ? 'visivel_vitrine' then
        v_visivel_vitrine := (v_item ->> 'visivel_vitrine')::boolean;
      else
        v_visivel_vitrine := true;
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
        v_visivel_vitrine
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
