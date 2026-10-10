alter table public.vendas
  add column if not exists motivo_cancelamento text;

alter table public.vendas
  drop constraint if exists vendas_motivo_cancelamento_check;

alter table public.vendas
  add constraint vendas_motivo_cancelamento_check
  check (
    motivo_cancelamento is null
    or char_length(motivo_cancelamento) <= 200
  );


drop function if exists public.cancelar_venda(uuid);


create or replace function public.cancelar_venda(
  p_venda_id uuid,
  p_motivo text default null
)
returns table (
  venda_id uuid,
  numero_venda bigint,
  canceled_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_barbearia_id uuid;

  v_status public.status_venda;
  v_numero_venda bigint;
  v_canceled_at timestamptz;
  v_motivo_cancelamento text;

  v_produto record;

  v_saldo_anterior integer;
  v_saldo_posterior integer;
begin

  -- ==========================================================
  -- AUTENTICACAO E TENANT
  -- ==========================================================

  v_user_id := auth.uid();


  if v_user_id is null then
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
    where p.user_id = v_user_id
      and p.barbearia_id = v_barbearia_id
      and p.tipo::text = 'BARBEIRO'
      and p.onboarding_concluido = true
  ) then

    raise exception
      'Usuario nao esta autorizado a cancelar vendas';

  end if;


  -- ==========================================================
  -- NORMALIZAR MOTIVO
  -- ==========================================================

  v_motivo_cancelamento :=
    nullif(btrim(p_motivo), '');


  -- ==========================================================
  -- BLOQUEAR VENDA
  -- ==========================================================
  --
  -- FOR UPDATE impede que duas solicitacoes cancelem
  -- a mesma venda simultaneamente.
  -- ==========================================================

  select
    v.status,
    v.numero_venda

  into
    v_status,
    v_numero_venda

  from public.vendas v

  where v.id = p_venda_id
    and v.barbearia_id = v_barbearia_id

  for update;


  if not found then
    raise exception 'Venda nao encontrada';
  end if;


  if v_status = 'CANCELADA' then
    raise exception 'Venda ja esta cancelada';
  end if;


  if v_status <> 'CONCLUIDA' then
    raise exception 'Somente vendas concluidas podem ser canceladas';
  end if;


  -- ==========================================================
  -- PROTECAO CONTRA REVERSAO DUPLICADA
  -- ==========================================================

  if exists (
    select 1
    from public.movimentacoes_estoque me
    where me.barbearia_id = v_barbearia_id
      and me.venda_id = p_venda_id
      and me.tipo = 'REVERSAO_VENDA'
  ) then

    raise exception
      'Venda ja possui reversao de estoque registrada';

  end if;


  -- ==========================================================
  -- BLOQUEAR PRODUTOS DA VENDA
  -- ==========================================================
  --
  -- Ordem por UUID para manter bloqueio deterministico.
  -- ==========================================================

  for v_produto in

    select
      vi.produto_id,
      sum(vi.quantidade)::integer as quantidade

    from public.venda_itens vi

    where vi.barbearia_id = v_barbearia_id
      and vi.venda_id = p_venda_id
      and vi.tipo = 'PRODUTO'

    group by vi.produto_id

    order by vi.produto_id

  loop

    perform 1
    from public.produtos p
    where p.id = v_produto.produto_id
      and p.barbearia_id = v_barbearia_id
    for update;


    if not found then
      raise exception
        'Produto da venda nao foi encontrado: %',
        v_produto.produto_id;
    end if;

  end loop;


  -- ==========================================================
  -- RESTAURAR ESTOQUE
  -- ==========================================================

  for v_produto in

    select
      vi.produto_id,
      sum(vi.quantidade)::integer as quantidade

    from public.venda_itens vi

    where vi.barbearia_id = v_barbearia_id
      and vi.venda_id = p_venda_id
      and vi.tipo = 'PRODUTO'

    group by vi.produto_id

    order by vi.produto_id

  loop

    select p.estoque_atual

    into v_saldo_anterior

    from public.produtos p

    where p.id = v_produto.produto_id
      and p.barbearia_id = v_barbearia_id;


    update public.produtos

    set estoque_atual =
      estoque_atual + v_produto.quantidade

    where id = v_produto.produto_id
      and barbearia_id = v_barbearia_id

    returning estoque_atual
    into v_saldo_posterior;


    insert into public.movimentacoes_estoque (
      barbearia_id,
      produto_id,
      tipo,
      quantidade_delta,
      saldo_anterior,
      saldo_posterior,
      venda_id,
      motivo,
      custo_unitario_snapshot,
      valor_total_snapshot
    )
    values (
      v_barbearia_id,
      v_produto.produto_id,
      'REVERSAO_VENDA',
      v_produto.quantidade,
      v_saldo_anterior,
      v_saldo_posterior,
      p_venda_id,
      v_motivo_cancelamento,
      null,
      null
    );

  end loop;


  -- ==========================================================
  -- CANCELAR VENDA
  -- ==========================================================

  v_canceled_at :=
    clock_timestamp();


  update public.vendas

  set
    status = 'CANCELADA',
    canceled_at = v_canceled_at,
    motivo_cancelamento = v_motivo_cancelamento

  where id = p_venda_id
    and barbearia_id = v_barbearia_id;


  -- ==========================================================
  -- RETORNO
  -- ==========================================================

  return query
  select
    p_venda_id,
    v_numero_venda,
    v_canceled_at;

end;
$$;


revoke all
on function public.cancelar_venda(uuid, text)
from public;


revoke all
on function public.cancelar_venda(uuid, text)
from anon;


grant execute
on function public.cancelar_venda(uuid, text)
to authenticated;


comment on function public.cancelar_venda(uuid, text) is
  'Cancela uma venda concluida preservando seu historico, salvando motivo opcional e restaurando atomicamente o estoque dos produtos.';


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

      'motivo_cancelamento',
      v.motivo_cancelamento,

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


