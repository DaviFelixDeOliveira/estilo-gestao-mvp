-- Migration: strengthen_products_categories_integrity
-- 1. Garante unicidade estrita de nomes para produtos por barbearia
-- 2. Refina unicidade estrita de nomes para categorias por barbearia (normalizacao de espacos e barras)
-- 3. Protege estoque_atual contra insercao e atualizacao direta pelo papel authenticated via Data API

-- ============================================================
-- 1. VERIFICACAO DE COLISOES EM PRODUTOS
-- ============================================================

do $$
declare
  v_colisoes integer;
begin
  select count(*)
  into v_colisoes
  from (
    select
      barbearia_id,
      lower(
        regexp_replace(
          regexp_replace(
            btrim(nome),
            '\s+',
            ' ',
            'g'
          ),
          '\s*/\s*',
          '/',
          'g'
        )
      ) as nome_norm
    from public.produtos
    group by
      barbearia_id,
      lower(
        regexp_replace(
          regexp_replace(
            btrim(nome),
            '\s+',
            ' ',
            'g'
          ),
          '\s*/\s*',
          '/',
          'g'
        )
      )
    having count(*) > 1
  ) colisoes;

  if v_colisoes > 0 then
    raise exception 'Existem % produtos com nomes colidentes sob a nova regra de normalizacao.', v_colisoes;
  end if;
end $$;

drop index if exists public.produtos_barbearia_nome_normalizado_uidx;

create unique index produtos_barbearia_nome_normalizado_uidx
on public.produtos (
  barbearia_id,
  lower(
    regexp_replace(
      regexp_replace(
        btrim(nome),
        '\s+',
        ' ',
        'g'
      ),
      '\s*/\s*',
      '/',
      'g'
    )
  )
);

-- ============================================================
-- 2. VERIFICACAO DE COLISOES E REFINAMENTO EM CATEGORIAS
-- ============================================================

do $$
declare
  v_colisoes integer;
begin
  select count(*)
  into v_colisoes
  from (
    select
      barbearia_id,
      lower(
        regexp_replace(
          regexp_replace(
            btrim(nome),
            '\s+',
            ' ',
            'g'
          ),
          '\s*/\s*',
          '/',
          'g'
        )
      ) as nome_norm
    from public.categorias_produto
    group by
      barbearia_id,
      lower(
        regexp_replace(
          regexp_replace(
            btrim(nome),
            '\s+',
            ' ',
            'g'
          ),
          '\s*/\s*',
          '/',
          'g'
        )
      )
    having count(*) > 1
  ) colisoes;

  if v_colisoes > 0 then
    raise exception 'Existem % categorias com nomes colidentes sob a nova regra de normalizacao.', v_colisoes;
  end if;
end $$;

drop index if exists public.categorias_produto_nome_unico;
drop index if exists public.categorias_produto_barbearia_nome_normalizado_uidx;

create unique index categorias_produto_barbearia_nome_normalizado_uidx
on public.categorias_produto (
  barbearia_id,
  lower(
    regexp_replace(
      regexp_replace(
        btrim(nome),
        '\s+',
        ' ',
        'g'
      ),
      '\s*/\s*',
      '/',
      'g'
    )
  )
);

-- ============================================================
-- 3. PROTECAO DE estoque_atual (PRIVILEGIOS DE COLUNA)
-- ============================================================
-- Revoga permissoes genericas de INSERT e UPDATE na tabela produtos
-- e concede apenas para as colunas cadastrais permitidas.
-- O campo estoque_atual nao recebe grant, impedindo mutacao direta
-- pelo usuario autenticado via Data API.

revoke insert, update on table public.produtos from authenticated;

grant insert (
  id,
  barbearia_id,
  categoria_id,
  nome,
  descricao,
  estoque_minimo,
  preco_custo,
  preco_venda,
  imagem_path,
  usar_imagem_categoria,
  ativo,
  visivel_vitrine
) on table public.produtos to authenticated;

grant update (
  categoria_id,
  nome,
  descricao,
  estoque_minimo,
  preco_custo,
  preco_venda,
  imagem_path,
  usar_imagem_categoria,
  ativo,
  visivel_vitrine
) on table public.produtos to authenticated;
