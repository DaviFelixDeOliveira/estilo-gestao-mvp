-- ============================================================
-- SALES OPERATIONS
-- ============================================================
--
-- Operacoes transacionais do modulo de vendas.
--
-- Este arquivo concentrara:
-- - finalizacao de venda;
-- - cancelamento;
-- - reversao de estoque.
-- ============================================================


-- ============================================================
-- 1. FINALIZAR VENDA
-- ============================================================

create or replace function public.finalizar_venda(
  p_itens jsonb,
  p_desconto_tipo text default null,
  p_desconto_valor numeric default null,
  p_pagamentos jsonb default '[]'::jsonb,
  p_ocorrida_em timestamptz default null,
  p_observacao text default null
)
returns table (
  venda_id uuid,
  numero_venda bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_barbearia_id uuid;

  v_item jsonb;
  v_pagamento jsonb;

  v_tipo text;
  v_id_text text;
  v_ref_id uuid;

  v_quantidade_num numeric;
  v_quantidade integer;

  v_itens_vistos text[] := '{}'::text[];
  v_chave_item text;

  v_nome text;
  v_preco numeric(12,2);
  v_custo numeric(12,2);
  v_ativo boolean;
  v_estoque integer;

  v_subtotal_item numeric(12,2);

  v_total_bruto numeric(12,2) := 0;
  v_total_custo numeric(12,2) := 0;
  v_total_liquido numeric(12,2) := 0;

  v_desconto_tipo_text text;
  v_desconto_tipo public.tipo_desconto_venda;
  v_desconto_total numeric(12,2) := 0;

  v_pagamentos jsonb;
  v_forma_text text;
  v_forma public.forma_pagamento;
  v_formas_vistas text[] := '{}'::text[];
  v_valor_pagamento numeric;
  v_total_pagamentos numeric(12,2) := 0;

  v_observacao text;
  v_ocorrida_em timestamptz;

  v_venda_id uuid;
  v_numero_venda bigint;

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


  v_barbearia_id := public.current_barbearia_id();

  if v_barbearia_id is null then
    raise exception 'Barbearia nao encontrada para o usuario autenticado';
  end if;


  if not exists (
    select 1
    from public.perfis p
    where p.user_id = v_user_id
      and p.barbearia_id = v_barbearia_id
      and p.tipo::text = 'BARBEIRO'
      and p.onboarding_concluido = true
  ) then
    raise exception 'Usuario nao esta autorizado a finalizar vendas';
  end if;


  -- ==========================================================
  -- ITENS
  -- ==========================================================

  if p_itens is null
     or jsonb_typeof(p_itens) <> 'array'
     or jsonb_array_length(p_itens) = 0 then

    raise exception 'A venda deve possuir pelo menos um item';

  end if;


  -- Primeira passagem:
  -- validar estrutura antes de bloquear registros.

  for v_item in
    select value
    from jsonb_array_elements(p_itens)
  loop

    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Item da venda invalido';
    end if;


    v_tipo :=
      upper(
        trim(
          coalesce(v_item ->> 'tipo', '')
        )
      );


    if v_tipo not in ('SERVICO', 'PRODUTO') then
      raise exception 'Tipo de item invalido: %', v_tipo;
    end if;


    v_id_text :=
      trim(
        coalesce(v_item ->> 'id', '')
      );


    if v_id_text = '' then
      raise exception 'Item da venda sem identificador';
    end if;


    begin
      v_ref_id := v_id_text::uuid;
    exception
      when invalid_text_representation then
        raise exception 'Identificador de item invalido';
    end;


    if not (v_item ? 'quantidade')
       or jsonb_typeof(v_item -> 'quantidade') <> 'number' then

      raise exception 'Quantidade invalida para o item %', v_ref_id;

    end if;


    v_quantidade_num :=
      (v_item ->> 'quantidade')::numeric;


    if v_quantidade_num <= 0
       or v_quantidade_num <> trunc(v_quantidade_num)
       or v_quantidade_num > 2147483647 then

      raise exception 'Quantidade invalida para o item %', v_ref_id;

    end if;


    v_quantidade := v_quantidade_num::integer;


    if v_tipo = 'SERVICO'
       and v_quantidade <> 1 then

      raise exception 'Servicos devem possuir quantidade igual a 1';

    end if;


    v_chave_item :=
      v_tipo || ':' || v_ref_id::text;


    if array_position(
      v_itens_vistos,
      v_chave_item
    ) is not null then

      raise exception 'Item duplicado na venda: %', v_ref_id;

    end if;


    v_itens_vistos :=
      array_append(
        v_itens_vistos,
        v_chave_item
      );

  end loop;


  -- ==========================================================
  -- BLOQUEAR SERVICOS REFERENCIADOS
  -- ==========================================================
  --
  -- Mantem preco/custo estaveis durante toda a transacao.
  -- A ordem deterministica reduz risco de deadlock.
  -- ==========================================================

  for v_ref_id in

    select distinct
      (item ->> 'id')::uuid

    from jsonb_array_elements(p_itens) as item

    where upper(
      trim(item ->> 'tipo')
    ) = 'SERVICO'

    order by 1

  loop

    perform 1
    from public.servicos s
    where s.id = v_ref_id
      and s.barbearia_id = v_barbearia_id
    for update;


    if not found then
      raise exception 'Servico nao encontrado: %', v_ref_id;
    end if;

  end loop;


  -- ==========================================================
  -- BLOQUEAR PRODUTOS REFERENCIADOS
  -- ==========================================================

  for v_ref_id in

    select distinct
      (item ->> 'id')::uuid

    from jsonb_array_elements(p_itens) as item

    where upper(
      trim(item ->> 'tipo')
    ) = 'PRODUTO'

    order by 1

  loop

    perform 1
    from public.produtos p
    where p.id = v_ref_id
      and p.barbearia_id = v_barbearia_id
    for update;


    if not found then
      raise exception 'Produto nao encontrado: %', v_ref_id;
    end if;

  end loop;


  -- ==========================================================
  -- CALCULAR TOTAIS NO SERVIDOR
  -- ==========================================================

  for v_item in
    select value
    from jsonb_array_elements(p_itens)
  loop

    v_tipo :=
      upper(
        trim(v_item ->> 'tipo')
      );

    v_ref_id :=
      (v_item ->> 'id')::uuid;

    v_quantidade :=
      (v_item ->> 'quantidade')::integer;


    if v_tipo = 'SERVICO' then

      select
        s.nome,
        s.preco,
        coalesce(s.custo_estimado, 0),
        s.ativo

      into
        v_nome,
        v_preco,
        v_custo,
        v_ativo

      from public.servicos s

      where s.id = v_ref_id
        and s.barbearia_id = v_barbearia_id;


      if not v_ativo then
        raise exception 'Servico inativo: %', v_nome;
      end if;


    else

      select
        p.nome,
        p.preco_venda,
        p.preco_custo,
        p.ativo,
        p.estoque_atual

      into
        v_nome,
        v_preco,
        v_custo,
        v_ativo,
        v_estoque

      from public.produtos p

      where p.id = v_ref_id
        and p.barbearia_id = v_barbearia_id;


      if not v_ativo then
        raise exception 'Produto inativo: %', v_nome;
      end if;


      if v_estoque < v_quantidade then
        raise exception
          'Estoque insuficiente para o produto %. Disponivel: %, solicitado: %',
          v_nome,
          v_estoque,
          v_quantidade;
      end if;

    end if;


    v_subtotal_item :=
      round(
        v_preco * v_quantidade,
        2
      );


    v_total_bruto :=
      v_total_bruto
      + v_subtotal_item;


    v_total_custo :=
      v_total_custo
      + round(
          v_custo * v_quantidade,
          2
        );

  end loop;


  -- ==========================================================
  -- DESCONTO
  -- ==========================================================

  v_desconto_tipo_text :=
    upper(
      trim(
        coalesce(p_desconto_tipo, '')
      )
    );


  if v_desconto_tipo_text = '' then

    if p_desconto_valor is not null then
      raise exception 'Valor de desconto informado sem tipo de desconto';
    end if;

    v_desconto_tipo := null;
    v_desconto_total := 0;


  else

    if v_desconto_tipo_text not in (
      'VALOR',
      'PERCENTUAL'
    ) then

      raise exception 'Tipo de desconto invalido';

    end if;


    if p_desconto_valor is null
       or p_desconto_valor <= 0 then

      raise exception 'Valor de desconto invalido';

    end if;


    if round(p_desconto_valor, 2)
       <> p_desconto_valor then

      raise exception 'Desconto deve possuir no maximo duas casas decimais';

    end if;


    v_desconto_tipo :=
      v_desconto_tipo_text::public.tipo_desconto_venda;


    if v_desconto_tipo = 'VALOR' then

      if p_desconto_valor > v_total_bruto then
        raise exception 'Desconto nao pode superar o subtotal da venda';
      end if;

      v_desconto_total :=
        p_desconto_valor;


    else

      if p_desconto_valor > 100 then
        raise exception 'Desconto percentual nao pode superar 100';
      end if;

      v_desconto_total :=
        round(
          (
            v_total_bruto
            * p_desconto_valor
          ) / 100,
          2
        );

    end if;

  end if;


  v_total_liquido :=
    v_total_bruto
    - v_desconto_total;


  -- ==========================================================
  -- DATA E OBSERVACAO
  -- ==========================================================

  v_ocorrida_em :=
    coalesce(
      p_ocorrida_em,
      clock_timestamp()
    );


  if v_ocorrida_em > clock_timestamp() then
    raise exception 'Data da venda nao pode estar no futuro';
  end if;


  v_observacao :=
    nullif(
      trim(p_observacao),
      ''
    );


  if v_observacao is not null
     and char_length(v_observacao) > 200 then

    raise exception 'Observacao deve possuir no maximo 200 caracteres';

  end if;


  -- ==========================================================
  -- PAGAMENTOS
  -- ==========================================================

  v_pagamentos :=
    coalesce(
      p_pagamentos,
      '[]'::jsonb
    );


  if jsonb_typeof(v_pagamentos) <> 'array' then
    raise exception 'Pagamentos devem ser enviados como uma lista';
  end if;


  for v_pagamento in
    select value
    from jsonb_array_elements(v_pagamentos)
  loop

    if jsonb_typeof(v_pagamento) <> 'object' then
      raise exception 'Pagamento invalido';
    end if;


    v_forma_text :=
      upper(
        trim(
          coalesce(
            v_pagamento ->> 'forma_pagamento',
            ''
          )
        )
      );


    if v_forma_text = '' then
      raise exception 'Forma de pagamento nao informada';
    end if;


    begin
      v_forma :=
        v_forma_text::public.forma_pagamento;

    exception
      when invalid_text_representation then
        raise exception 'Forma de pagamento invalida: %', v_forma_text;
    end;


    if array_position(
      v_formas_vistas,
      v_forma_text
    ) is not null then

      raise exception
        'Forma de pagamento duplicada: %',
        v_forma_text;

    end if;


    v_formas_vistas :=
      array_append(
        v_formas_vistas,
        v_forma_text
      );


    if not exists (
      select 1
      from public.barbearia_formas_pagamento bfp
      where bfp.barbearia_id = v_barbearia_id
        and bfp.forma_pagamento = v_forma
    ) then

      raise exception
        'Forma de pagamento nao habilitada para a barbearia: %',
        v_forma_text;

    end if;


    if not (v_pagamento ? 'valor')
       or jsonb_typeof(
         v_pagamento -> 'valor'
       ) <> 'number' then

      raise exception
        'Valor de pagamento invalido para %',
        v_forma_text;

    end if;


    v_valor_pagamento :=
      (v_pagamento ->> 'valor')::numeric;


    if v_valor_pagamento <= 0 then
      raise exception
        'Valor de pagamento deve ser maior que zero';
    end if;


    if round(v_valor_pagamento, 2)
       <> v_valor_pagamento then

      raise exception
        'Pagamento deve possuir no maximo duas casas decimais';

    end if;


    v_total_pagamentos :=
      v_total_pagamentos
      + v_valor_pagamento;

  end loop;


  -- Nenhum pagamento e permitido:
  -- significa "forma de pagamento nao informada".
  --
  -- Se houver ao menos um, a soma deve ser exata.

  if jsonb_array_length(v_pagamentos) > 0
     and v_total_pagamentos <> v_total_liquido then

    raise exception
      'Soma dos pagamentos (%) deve ser igual ao total da venda (%)',
      v_total_pagamentos,
      v_total_liquido;

  end if;


  -- ==========================================================
  -- CRIAR VENDA
  -- ==========================================================

  insert into public.vendas (
    barbearia_id,
    status,
    total_bruto,
    total_custo_snapshot,
    resultado_estimado_snapshot,
    observacao,
    ocorrida_em,
    desconto_tipo,
    desconto_valor_informado,
    desconto_total_snapshot,
    total_liquido
  )
  values (
    v_barbearia_id,
    'CONCLUIDA',
    v_total_bruto,
    v_total_custo,
    v_total_liquido - v_total_custo,
    v_observacao,
    v_ocorrida_em,
    v_desconto_tipo,
    p_desconto_valor,
    v_desconto_total,
    v_total_liquido
  )
  returning
    id,
    public.vendas.numero_venda

  into
    v_venda_id,
    v_numero_venda;


  -- ==========================================================
  -- CRIAR SNAPSHOTS DOS ITENS E BAIXAR ESTOQUE
  -- ==========================================================

  for v_item in
    select value
    from jsonb_array_elements(p_itens)
  loop

    v_tipo :=
      upper(
        trim(v_item ->> 'tipo')
      );

    v_ref_id :=
      (v_item ->> 'id')::uuid;

    v_quantidade :=
      (v_item ->> 'quantidade')::integer;


    if v_tipo = 'SERVICO' then

      select
        s.nome,
        s.preco,
        coalesce(s.custo_estimado, 0)

      into
        v_nome,
        v_preco,
        v_custo

      from public.servicos s

      where s.id = v_ref_id
        and s.barbearia_id = v_barbearia_id;


      v_subtotal_item :=
        round(
          v_preco * v_quantidade,
          2
        );


      insert into public.venda_itens (
        barbearia_id,
        venda_id,
        tipo,
        servico_id,
        produto_id,
        nome_snapshot,
        quantidade,
        preco_unitario_snapshot,
        custo_unitario_snapshot,
        subtotal_snapshot,
        resultado_item_snapshot
      )
      values (
        v_barbearia_id,
        v_venda_id,
        'SERVICO',
        v_ref_id,
        null,
        v_nome,
        v_quantidade,
        v_preco,
        v_custo,
        v_subtotal_item,
        v_subtotal_item
          - round(
              v_custo * v_quantidade,
              2
            )
      );


    else

      select
        p.nome,
        p.preco_venda,
        p.preco_custo,
        p.estoque_atual

      into
        v_nome,
        v_preco,
        v_custo,
        v_saldo_anterior

      from public.produtos p

      where p.id = v_ref_id
        and p.barbearia_id = v_barbearia_id;


      v_subtotal_item :=
        round(
          v_preco * v_quantidade,
          2
        );


      insert into public.venda_itens (
        barbearia_id,
        venda_id,
        tipo,
        servico_id,
        produto_id,
        nome_snapshot,
        quantidade,
        preco_unitario_snapshot,
        custo_unitario_snapshot,
        subtotal_snapshot,
        resultado_item_snapshot
      )
      values (
        v_barbearia_id,
        v_venda_id,
        'PRODUTO',
        null,
        v_ref_id,
        v_nome,
        v_quantidade,
        v_preco,
        v_custo,
        v_subtotal_item,
        v_subtotal_item
          - round(
              v_custo * v_quantidade,
              2
            )
      );


      update public.produtos
      set estoque_atual =
        estoque_atual - v_quantidade

      where id = v_ref_id
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
        v_ref_id,
        'VENDA',
        -v_quantidade,
        v_saldo_anterior,
        v_saldo_posterior,
        v_venda_id,
        null,
        null,
        null
      );

    end if;

  end loop;


  -- ==========================================================
  -- CRIAR PAGAMENTOS
  -- ==========================================================

  for v_pagamento in
    select value
    from jsonb_array_elements(v_pagamentos)
  loop

    v_forma :=
      upper(
        trim(
          v_pagamento ->> 'forma_pagamento'
        )
      )::public.forma_pagamento;


    v_valor_pagamento :=
      (v_pagamento ->> 'valor')::numeric;


    insert into public.venda_pagamentos (
      barbearia_id,
      venda_id,
      forma_pagamento,
      valor
    )
    values (
      v_barbearia_id,
      v_venda_id,
      v_forma,
      v_valor_pagamento
    );

  end loop;


  -- ==========================================================
  -- RETORNO
  -- ==========================================================

  return query
  select
    v_venda_id,
    v_numero_venda;

end;
$$;


-- ============================================================
-- PERMISSOES
-- ============================================================

revoke all
on function public.finalizar_venda(
  jsonb,
  text,
  numeric,
  jsonb,
  timestamptz,
  text
)
from public;


revoke all
on function public.finalizar_venda(
  jsonb,
  text,
  numeric,
  jsonb,
  timestamptz,
  text
)
from anon;


grant execute
on function public.finalizar_venda(
  jsonb,
  text,
  numeric,
  jsonb,
  timestamptz,
  text
)
to authenticated;


comment on function public.finalizar_venda(
  jsonb,
  text,
  numeric,
  jsonb,
  timestamptz,
  text
) is
  'Finaliza uma venda de forma atomica, recalculando valores no servidor, criando snapshots, pagamentos e movimentacoes de estoque.';


-- ============================================================
-- 2. CANCELAR VENDA
-- ============================================================
--
-- O cancelamento:
-- - preserva a venda e todo o historico;
-- - altera apenas o status para CANCELADA;
-- - registra canceled_at;
-- - restaura o estoque dos produtos;
-- - registra REVERSAO_VENDA;
-- - nao reutiliza numero_venda;
-- - nao apaga itens nem pagamentos.
-- ============================================================

create or replace function public.cancelar_venda(
  p_venda_id uuid
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
      null,
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
    canceled_at = v_canceled_at

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


-- ============================================================
-- PERMISSOES DE CANCELAMENTO
-- ============================================================

revoke all
on function public.cancelar_venda(uuid)
from public;


revoke all
on function public.cancelar_venda(uuid)
from anon;


grant execute
on function public.cancelar_venda(uuid)
to authenticated;


comment on function public.cancelar_venda(uuid) is
  'Cancela uma venda concluida preservando seu historico e restaurando atomicamente o estoque dos produtos.';
