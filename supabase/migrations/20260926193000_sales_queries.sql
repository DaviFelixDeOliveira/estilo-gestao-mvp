-- ============================================================
-- SALES QUERIES
-- ============================================================
--
-- Ultimo bloco estrutural do backend de Vendas / PDV.
--
-- Inclui:
-- - historico paginado;
-- - filtros;
-- - busca por numero;
-- - detalhes completos;
-- - dados necessarios para cancelamento/correcao.
-- ============================================================


-- ============================================================
-- 1. LISTAR VENDAS
-- ============================================================

create or replace function public.listar_vendas(
  p_inicio timestamptz default null,
  p_fim timestamptz default null,
  p_status text default null,
  p_formas_pagamento text[] default null,
  p_numero_venda bigint default null,
  p_pagina integer default 1,
  p_por_pagina integer default 5
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_barbearia_id uuid;

  v_status text;
  v_formas text[];

  v_offset integer;

  v_resultado jsonb;
begin

  -- ==========================================================
  -- AUTENTICACAO E TENANT
  -- ==========================================================

  if auth.uid() is null then
    raise exception 'Usuario nao autenticado';
  end if;


  v_barbearia_id :=
    public.current_barbearia_id();


  if v_barbearia_id is null then
    raise exception
      'Barbearia nao encontrada para o usuario autenticado';
  end if;


  if not exists (
    select 1
    from public.perfis p

    where p.user_id = auth.uid()
      and p.barbearia_id = v_barbearia_id
      and p.tipo::text = 'BARBEIRO'
      and p.onboarding_concluido = true
  ) then

    raise exception
      'Usuario nao esta autorizado a consultar vendas';

  end if;


  -- ==========================================================
  -- PAGINACAO
  -- ==========================================================

  if p_pagina is null
     or p_pagina < 1 then

    raise exception
      'Pagina deve ser maior ou igual a 1';

  end if;


  if p_por_pagina is null
     or p_por_pagina < 1
     or p_por_pagina > 50 then

    raise exception
      'Quantidade por pagina deve estar entre 1 e 50';

  end if;


  v_offset :=
    (p_pagina - 1)
    * p_por_pagina;


  -- ==========================================================
  -- PERIODO
  -- ==========================================================

  if (
    p_inicio is null
    and p_fim is not null
  )
  or (
    p_inicio is not null
    and p_fim is null
  ) then

    raise exception
      'Inicio e fim do periodo devem ser informados juntos';

  end if;


  if p_inicio is not null then

    if p_fim < p_inicio then
      raise exception
        'Fim do periodo nao pode ser anterior ao inicio';
    end if;


    if p_inicio > clock_timestamp()
       or p_fim > clock_timestamp() then

      raise exception
        'Periodo nao pode estar no futuro';

    end if;

  end if;


  -- ==========================================================
  -- STATUS
  -- ==========================================================

  v_status :=
    upper(
      trim(
        coalesce(
          p_status,
          ''
        )
      )
    );


  if v_status in (
    '',
    'TODAS'
  ) then

    v_status := null;


  elsif v_status not in (
    'CONCLUIDA',
    'CANCELADA'
  ) then

    raise exception
      'Status de venda invalido';

  end if;


  -- ==========================================================
  -- FORMAS DE PAGAMENTO
  -- ==========================================================

  select
    coalesce(
      array_agg(
        distinct replace(
          upper(trim(forma)),
          ' ',
          '_'
        )
      ),
      '{}'::text[]
    )

  into v_formas

  from unnest(
    coalesce(
      p_formas_pagamento,
      '{}'::text[]
    )
  ) as forma

  where trim(forma) <> '';


  if exists (
    select 1

    from unnest(v_formas) as forma

    where forma not in (
      'TODAS',
      'PIX',
      'DINHEIRO',
      'DEBITO',
      'CREDITO',
      'OUTRO',
      'NAO_INFORMADO'
    )
  ) then

    raise exception
      'Forma de pagamento invalida';

  end if;


  if 'TODAS' = any(v_formas) then
    v_formas := '{}'::text[];
  end if;


  -- ==========================================================
  -- NUMERO DA VENDA
  -- ==========================================================

  if p_numero_venda is not null
     and p_numero_venda <= 0 then

    raise exception
      'Numero da venda deve ser maior que zero';

  end if;


  -- ==========================================================
  -- CONSULTA
  -- ==========================================================

  with base as (

    select v.*

    from public.vendas v

    where v.barbearia_id = v_barbearia_id


      and (
        p_inicio is null

        or (
          v.ocorrida_em >= p_inicio
          and v.ocorrida_em <= p_fim
        )
      )


      and (
        v_status is null
        or v.status::text = v_status
      )


      and (
        p_numero_venda is null
        or v.numero_venda = p_numero_venda
      )


      and (
        cardinality(v_formas) = 0

        or (

          (
            'NAO_INFORMADO' = any(v_formas)

            and not exists (
              select 1

              from public.venda_pagamentos vp

              where vp.venda_id = v.id
                and vp.barbearia_id = v_barbearia_id
            )
          )

          or

          exists (
            select 1

            from public.venda_pagamentos vp

            where vp.venda_id = v.id
              and vp.barbearia_id = v_barbearia_id
              and vp.forma_pagamento::text = any(v_formas)
          )

        )
      )

  ),


  contagem as (

    select count(*)::bigint as total
    from base

  ),


  pagina as (

    select *

    from base

    order by
      ocorrida_em desc,
      numero_venda desc

    limit p_por_pagina

    offset v_offset

  )


  select
    jsonb_build_object(

      'vendas',

      coalesce(
        (
          select
            jsonb_agg(

              jsonb_build_object(

                'id',
                p.id,

                'numero_venda',
                p.numero_venda,

                'status',
                p.status,

                'ocorrida_em',
                p.ocorrida_em,

                'total_bruto',
                p.total_bruto,

                'desconto_total',
                p.desconto_total_snapshot,

                'total_liquido',
                p.total_liquido,


                'formas_pagamento',

                coalesce(
                  (
                    select
                      jsonb_agg(
                        vp.forma_pagamento
                        order by
                          vp.created_at,
                          vp.id
                      )

                    from public.venda_pagamentos vp

                    where vp.venda_id = p.id
                      and vp.barbearia_id = v_barbearia_id
                  ),

                  '[]'::jsonb
                ),


                'quantidade_itens',

                (
                  select count(*)

                  from public.venda_itens vi

                  where vi.venda_id = p.id
                    and vi.barbearia_id = v_barbearia_id
                )

              )

              order by
                p.ocorrida_em desc,
                p.numero_venda desc
            )

          from pagina p
        ),

        '[]'::jsonb
      ),


      'paginacao',

      jsonb_build_object(

        'pagina',
        p_pagina,

        'por_pagina',
        p_por_pagina,

        'total_registros',
        c.total,

        'total_paginas',

        case

          when c.total = 0 then
            0

          else
            ceil(
              c.total::numeric
              / p_por_pagina
            )::integer

        end

      )

    )

  into v_resultado

  from contagem c;


  return v_resultado;

end;
$$;


-- ============================================================
-- PERMISSOES
-- ============================================================

revoke all
on function public.listar_vendas(
  timestamptz,
  timestamptz,
  text,
  text[],
  bigint,
  integer,
  integer
)
from public;


revoke all
on function public.listar_vendas(
  timestamptz,
  timestamptz,
  text,
  text[],
  bigint,
  integer,
  integer
)
from anon;


grant execute
on function public.listar_vendas(
  timestamptz,
  timestamptz,
  text,
  text[],
  bigint,
  integer,
  integer
)
to authenticated;


comment on function public.listar_vendas(
  timestamptz,
  timestamptz,
  text,
  text[],
  bigint,
  integer,
  integer
) is
  'Lista o historico de vendas da barbearia autenticada com filtros e paginacao.';


-- ============================================================
-- 2. DETALHES DA VENDA
-- ============================================================

create or replace function public.obter_detalhes_venda(
  p_venda_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_barbearia_id uuid;
  v_resultado jsonb;
begin

  -- ==========================================================
  -- AUTENTICACAO E TENANT
  -- ==========================================================

  if auth.uid() is null then
    raise exception 'Usuario nao autenticado';
  end if;


  v_barbearia_id :=
    public.current_barbearia_id();


  if v_barbearia_id is null then
    raise exception
      'Barbearia nao encontrada para o usuario autenticado';
  end if;


  if not exists (
    select 1

    from public.perfis p

    where p.user_id = auth.uid()
      and p.barbearia_id = v_barbearia_id
      and p.tipo::text = 'BARBEIRO'
      and p.onboarding_concluido = true
  ) then

    raise exception
      'Usuario nao esta autorizado a consultar vendas';

  end if;


  -- ==========================================================
  -- DETALHES
  -- ==========================================================

  select
    jsonb_build_object(

      'id',
      v.id,

      'numero_venda',
      v.numero_venda,

      'status',
      v.status,

      'ocorrida_em',
      v.ocorrida_em,

      'created_at',
      v.created_at,

      'canceled_at',
      v.canceled_at,

      'observacao',
      v.observacao,


      'total_bruto',
      v.total_bruto,

      'desconto_tipo',
      v.desconto_tipo,

      'desconto_valor_informado',
      v.desconto_valor_informado,

      'desconto_total',
      v.desconto_total_snapshot,

      'total_liquido',
      v.total_liquido,

      'total_custo',
      v.total_custo_snapshot,

      'resultado_estimado',
      v.resultado_estimado_snapshot,


      'pode_cancelar',
      (
        v.status = 'CONCLUIDA'::public.status_venda
      ),

      'pode_corrigir',
      (
        v.status = 'CONCLUIDA'::public.status_venda
      ),


      'quantidade_itens',

      (
        select count(*)

        from public.venda_itens vi

        where vi.venda_id = v.id
          and vi.barbearia_id = v_barbearia_id
      ),


      'itens',

      coalesce(
        (
          select
            jsonb_agg(

              jsonb_build_object(

                'id',
                vi.id,

                'tipo',
                vi.tipo,

                'servico_id',
                vi.servico_id,

                'produto_id',
                vi.produto_id,

                'nome',
                vi.nome_snapshot,

                'quantidade',
                vi.quantidade,

                'preco_unitario',
                vi.preco_unitario_snapshot,

                'custo_unitario',
                vi.custo_unitario_snapshot,

                'subtotal',
                vi.subtotal_snapshot,

                'resultado_item',
                vi.resultado_item_snapshot

              )

              order by
                vi.created_at,
                vi.id
            )

          from public.venda_itens vi

          where vi.venda_id = v.id
            and vi.barbearia_id = v_barbearia_id
        ),

        '[]'::jsonb
      ),


      'pagamentos',

      coalesce(
        (
          select
            jsonb_agg(

              jsonb_build_object(

                'id',
                vp.id,

                'forma_pagamento',
                vp.forma_pagamento,

                'valor',
                vp.valor

              )

              order by
                vp.created_at,
                vp.id
            )

          from public.venda_pagamentos vp

          where vp.venda_id = v.id
            and vp.barbearia_id = v_barbearia_id
        ),

        '[]'::jsonb
      )

    )

  into v_resultado

  from public.vendas v

  where v.id = p_venda_id
    and v.barbearia_id = v_barbearia_id;


  if v_resultado is null then
    raise exception 'Venda nao encontrada';
  end if;


  return v_resultado;

end;
$$;


-- ============================================================
-- PERMISSOES
-- ============================================================

revoke all
on function public.obter_detalhes_venda(uuid)
from public;


revoke all
on function public.obter_detalhes_venda(uuid)
from anon;


grant execute
on function public.obter_detalhes_venda(uuid)
to authenticated;


comment on function public.obter_detalhes_venda(uuid) is
  'Retorna detalhes completos e snapshots de uma venda da barbearia autenticada.';

