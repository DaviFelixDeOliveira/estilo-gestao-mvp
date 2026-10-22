-- Sistema Estilo e Gestao | Compras de estoque: pagas, pendentes, gratuitas e custo desconhecido
-- MIGRACAO NOVA. Nao editar migrations antigas.
-- Preparado para revisao; NAO execute antes de validar e autorizar a aplicacao.
-- Historico anterior preservado: somente NOVAS reposicoes usam esta estrutura.

-- 1. Uma compra corresponde exatamente a uma movimentacao de reposicao nova.
-- Os valores previstos e pagos ficam separados para nao inventar saidas de caixa.
create table public.compras_estoque (
  id uuid primary key default gen_random_uuid(),
  barbearia_id uuid not null references public.barbearias(id) on delete restrict,
  movimentacao_estoque_id uuid not null unique,
  produto_id uuid not null,
  situacao text not null check (situacao in ('PAGA', 'PENDENTE', 'GRATUITA', 'CUSTO_DESCONHECIDO')),
  valor_previsto numeric(12,2) null,
  valor_pago numeric(12,2) null,
  data_vencimento date null,
  data_pagamento date null,
  despesa_id uuid null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compras_estoque_movimentacao_tenant_fk
    foreign key (movimentacao_estoque_id, barbearia_id)
    references public.movimentacoes_estoque(id, barbearia_id) on delete restrict,
  constraint compras_estoque_produto_tenant_fk
    foreign key (produto_id, barbearia_id)
    references public.produtos(id, barbearia_id) on delete restrict,
  constraint compras_estoque_despesa_tenant_fk
    foreign key (despesa_id, barbearia_id)
    references public.despesas(id, barbearia_id) on delete restrict,
  constraint compras_estoque_valores_check check (
    (situacao = 'PENDENTE' and valor_previsto > 0 and valor_pago is null
      and data_pagamento is null and despesa_id is null)
    or
    (situacao = 'PAGA' and valor_previsto > 0 and valor_pago > 0
      and data_pagamento is not null)
    or
    (situacao = 'GRATUITA' and valor_previsto = 0 and valor_pago is null
      and data_pagamento is null and despesa_id is null and data_vencimento is null)
    or
    (situacao = 'CUSTO_DESCONHECIDO' and valor_previsto is null and valor_pago is null
      and data_pagamento is null and despesa_id is null and data_vencimento is null)
  )
);

create index compras_estoque_pendentes_idx
  on public.compras_estoque (barbearia_id, created_at desc)
  where situacao = 'PENDENTE';

comment on table public.compras_estoque is
  'Historico das compras ligadas a reposicoes NOVAS. Pendentes nao sao saidas. Historico anterior nao e migrado.';

-- A tabela so sera acessivel por RPCs autenticadas, com filtro de barbearia.
-- Nenhuma policy e criada para acesso direto pelo navegador.
alter table public.compras_estoque enable row level security;
revoke all on table public.compras_estoque from public, anon, authenticated;

-- 2. Evitar que uma despesa paga por este fluxo seja editada ou excluida
-- isoladamente, deixando a compra marcada paga sem a saida correspondente.
create or replace function public.proteger_despesa_compra_estoque()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    if exists (
      select 1 from public.compras_estoque c where c.despesa_id = old.id
    ) then
      raise exception 'Despesa ligada a compra de estoque: alteracao direta bloqueada para proteger o historico.';
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    if new.movimentacao_estoque_id is not null and exists (
      select 1 from public.compras_estoque c
      where c.movimentacao_estoque_id = new.movimentacao_estoque_id
        and (
          c.situacao <> 'PAGA'
          or (c.despesa_id is not null and c.despesa_id <> new.id)
        )
    ) then
      raise exception 'Esta reposicao e gerenciada pelo controle de compras e nao aceita despesa manual vinculada.';
    end if;
    return new;
  end if;
  return old;
end;
$$;

create trigger proteger_despesa_compra_estoque_trg
before insert or update or delete on public.despesas
for each row execute function public.proteger_despesa_compra_estoque();

-- 3. Registrar reposicao e compra na MESMA transacao.
-- Para paga/pendente, o usuario informa o valor TOTAL real ou combinado.
-- NUNCA deduzimos um pagamento a partir do preco cadastrado no produto.
-- Para custo desconhecido, a movimentacao usa snapshot tecnico 0 porque
-- o esquema antigo obriga snapshot nao nulo; o estado explicita o desconhecido.
-- Nao atualizar preco_custo do catalogo automaticamente.
create or replace function public.registrar_reposicao_com_compra(
  p_produto_id uuid,
  p_quantidade integer,
  p_situacao text,
  p_valor_total numeric default null,
  p_data_pagamento date default null,
  p_data_vencimento date default null,
  p_motivo text default null
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_tenant uuid;
  v_produto_nome text;
  v_valor numeric(12,2);
  v_custo_unitario numeric(12,2);
  v_resultado_reposicao jsonb;
  v_movimentacao_id uuid;
  v_compra_id uuid;
  v_despesa_id uuid;
  v_data_pagamento date;
begin
  v_tenant := public.current_barbearia_id();
  if v_tenant is null then
    raise exception 'Usuario nao autenticado ou sem barbearia.';
  end if;
  if p_produto_id is null or p_quantidade is null or p_quantidade <= 0 then
    raise exception 'Informe um produto e uma quantidade maior que zero.';
  end if;
  if p_situacao is null or p_situacao not in ('PAGA', 'PENDENTE', 'GRATUITA', 'CUSTO_DESCONHECIDO') then
    raise exception 'Escolha o tipo da reposicao: paga, pendente, gratuita ou custo desconhecido.';
  end if;
  if p_valor_total is not null and (p_valor_total < 0 or p_valor_total > 9999999999.99) then
    raise exception 'Valor total invalido.';
  end if;
  if p_situacao in ('PAGA', 'PENDENTE') then
    if p_valor_total is null or p_valor_total <= 0 or p_valor_total <> round(p_valor_total, 2) then
      raise exception 'Informe o valor total da compra, maior que zero e com ate duas casas decimais.';
    end if;
    v_valor := p_valor_total;
    v_custo_unitario := round(v_valor / p_quantidade, 2);
  elsif p_situacao = 'GRATUITA' then
    if p_valor_total is not null and p_valor_total <> 0 then
      raise exception 'Produto gratuito nao pode ter valor de compra.';
    end if;
    v_valor := 0;
    v_custo_unitario := 0;
  else
    if p_valor_total is not null then
      raise exception 'Para custo desconhecido, deixe o valor total vazio.';
    end if;
    v_valor := null;
    v_custo_unitario := 0;
  end if;

  if p_situacao = 'PENDENTE' and p_data_pagamento is not null then
    raise exception 'Compra pendente nao deve informar data de pagamento.';
  end if;
  if p_situacao <> 'PENDENTE' and p_data_vencimento is not null then
    raise exception 'Vencimento so e permitido para compras pendentes.';
  end if;
  if p_situacao not in ('PAGA', 'PENDENTE') and p_data_pagamento is not null then
    raise exception 'Produto gratuito ou custo desconhecido nao tem data de pagamento.';
  end if;
  v_data_pagamento := case when p_situacao = 'PAGA' then
    coalesce(p_data_pagamento, (now() at time zone 'America/Sao_Paulo')::date)
    else null end;

  select p.nome into v_produto_nome from public.produtos p
  where p.id = p_produto_id and p.barbearia_id = v_tenant;
  if not found then
    raise exception 'Produto nao encontrado nesta barbearia.';
  end if;

  -- A RPC existente protege o saldo, autentica, bloqueia o produto,
  -- atualiza estoque e cria a movimentacao. Caso uma etapa posterior falhe,
  -- TODA a operacao e desfeita automaticamente pelo PostgreSQL.
  select public.repor_estoque(
    p_produto_id, p_quantidade, v_custo_unitario, p_motivo
  ) into v_resultado_reposicao;
  v_movimentacao_id := (v_resultado_reposicao ->> 'movimentacao_id')::uuid;
  if v_movimentacao_id is null then
    raise exception 'Nao foi possivel confirmar a movimentacao de estoque.';
  end if;

  -- Preservar o total da compra exatamente como informado (incluindo arredondamento).
  -- Para custo desconhecido o snapshot tecnico e zero, nao uma despesa.
  update public.movimentacoes_estoque
  set valor_total_snapshot = coalesce(v_valor, 0)
  where id = v_movimentacao_id and barbearia_id = v_tenant;

  insert into public.compras_estoque (
    barbearia_id, movimentacao_estoque_id, produto_id,
    situacao, valor_previsto, valor_pago, data_vencimento, data_pagamento
  ) values (
    v_tenant, v_movimentacao_id, p_produto_id,
    p_situacao, v_valor,
    case when p_situacao = 'PAGA' then v_valor else null end,
    p_data_vencimento, v_data_pagamento
  ) returning id into v_compra_id;

  if p_situacao = 'PAGA' then
    insert into public.despesas (
      barbearia_id, nome, descricao, categoria, valor, data_despesa,
      origem, movimentacao_estoque_id
    ) values (
      v_tenant, 'Compra de estoque: ' || v_produto_nome,
      nullif(btrim(coalesce(p_motivo, '')), ''), 'ESTOQUE'::public.categoria_despesa,
      v_valor, v_data_pagamento, 'MANUAL'::public.origem_despesa,
      v_movimentacao_id
    ) returning id into v_despesa_id;

    update public.compras_estoque
      set despesa_id = v_despesa_id, updated_at = now()
      where id = v_compra_id and barbearia_id = v_tenant;
  end if;

  return jsonb_build_object(
    'compra_id', v_compra_id,
    'movimentacao_id', v_movimentacao_id,
    'situacao', p_situacao,
    'despesa_id', v_despesa_id,
    'valor_previsto', v_valor
  );
end;
$$;

-- 4. Somente pendencias: ler por RPC, sem acesso direto a tabela.
create or replace function public.listar_compras_estoque_pendentes(p_limite integer default 100)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_tenant uuid;
  v_total integer;
  v_itens jsonb;
begin
  v_tenant := public.current_barbearia_id();
  if v_tenant is null then
    raise exception 'Usuario nao autenticado ou sem barbearia.';
  end if;
  if p_limite is null or p_limite < 1 or p_limite > 100 then
    raise exception 'Limite deve ser de 1 a 100.';
  end if;
  select count(*) into v_total from public.compras_estoque c
    where c.barbearia_id = v_tenant and c.situacao = 'PENDENTE';

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', x.id,
    'produto_nome', x.produto_nome,
    'quantidade', x.quantidade,
    'valor_previsto', x.valor_previsto,
    'data_vencimento', x.data_vencimento,
    'created_at', x.created_at
  ) order by x.created_at desc), '[]'::jsonb)
  into v_itens from (
    select c.id, p.nome as produto_nome, m.quantidade_delta as quantidade,
      c.valor_previsto, c.data_vencimento, c.created_at
    from public.compras_estoque c
    join public.produtos p on p.id = c.produto_id and p.barbearia_id = c.barbearia_id
    join public.movimentacoes_estoque m on m.id = c.movimentacao_estoque_id
      and m.barbearia_id = c.barbearia_id
    where c.barbearia_id = v_tenant and c.situacao = 'PENDENTE'
    order by c.created_at desc
    limit p_limite
  ) x;
  return jsonb_build_object('total', v_total, 'itens', v_itens);
end;
$$;

-- 5. Somente reposicoes ANTIGAS e nao vinculadas podem receber despesa manual.
-- Reposicoes gerenciadas por compras_estoque nunca aparecem neste seletor.
create or replace function public.listar_reposicoes_manuais_vinculaveis(p_limite integer default 50)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_tenant uuid;
  v_itens jsonb;
begin
  v_tenant := public.current_barbearia_id();
  if v_tenant is null then
    raise exception 'Usuario nao autenticado ou sem barbearia.';
  end if;
  if p_limite is null or p_limite < 1 or p_limite > 100 then
    raise exception 'Limite deve ser de 1 a 100.';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', x.id,
    'tipo', 'REPOSICAO',
    'quantidade_delta', x.quantidade_delta,
    'custo_unitario_snapshot', x.custo_unitario_snapshot,
    'valor_total_snapshot', x.valor_total_snapshot,
    'created_at', x.created_at,
    'produto', jsonb_build_object('id', x.produto_id, 'nome', x.produto_nome)
  ) order by x.created_at desc), '[]'::jsonb)
  into v_itens
  from (
    select m.id, m.quantidade_delta, m.custo_unitario_snapshot,
      m.valor_total_snapshot, m.created_at, p.id as produto_id, p.nome as produto_nome
    from public.movimentacoes_estoque m
    join public.produtos p on p.id = m.produto_id and p.barbearia_id = m.barbearia_id
    where m.barbearia_id = v_tenant and m.tipo = 'REPOSICAO'::public.tipo_movimento_estoque
      and not exists (select 1 from public.compras_estoque c
        where c.movimentacao_estoque_id = m.id)
      and not exists (select 1 from public.despesas d
        where d.movimentacao_estoque_id = m.id)
    order by m.created_at desc
    limit p_limite
  ) x;
  return v_itens;
end;
$$;

-- 5. Pagar uma compra pendente UMA vez; estoque nao muda.
-- Travar a linha evita duas despesas em cliques ou sessoes concorrentes.
create or replace function public.pagar_compra_estoque_pendente(
  p_compra_id uuid,
  p_valor_pago numeric default null,
  p_data_pagamento date default null
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_tenant uuid;
  v_compra public.compras_estoque%rowtype;
  v_produto_nome text;
  v_valor numeric(12,2);
  v_data date;
  v_despesa_id uuid;
begin
  v_tenant := public.current_barbearia_id();
  if v_tenant is null then
    raise exception 'Usuario nao autenticado ou sem barbearia.';
  end if;
  if p_compra_id is null then
    raise exception 'Compra nao informada.';
  end if;
  select * into v_compra from public.compras_estoque c
    where c.id = p_compra_id and c.barbearia_id = v_tenant for update;
  if not found then
    raise exception 'Compra nao encontrada nesta barbearia.';
  end if;
  if v_compra.situacao <> 'PENDENTE' then
    raise exception 'Esta compra nao esta pendente ou ja foi paga.';
  end if;
  if p_valor_pago is not null and p_valor_pago <> round(p_valor_pago, 2) then
    raise exception 'Informe o pagamento com ate duas casas decimais.';
  end if;
  v_valor := coalesce(p_valor_pago, v_compra.valor_previsto);
  if v_valor is null or v_valor <= 0 or v_valor > 9999999999.99 then
    raise exception 'O valor pago deve ser maior que zero.';
  end if;
  v_data := coalesce(p_data_pagamento, (now() at time zone 'America/Sao_Paulo')::date);

  select p.nome into v_produto_nome from public.produtos p
    where p.id = v_compra.produto_id and p.barbearia_id = v_tenant;

  -- Alterar primeiro a situacao para PAGA para que o trigger permita
  -- inserir a despesa automaticamente vinculada a esta compra.
  update public.compras_estoque
    set situacao = 'PAGA', valor_pago = v_valor, data_pagamento = v_data,
        updated_at = now()
    where id = p_compra_id and barbearia_id = v_tenant;

  insert into public.despesas (
    barbearia_id, nome, descricao, categoria, valor, data_despesa,
    origem, movimentacao_estoque_id
  ) values (
    v_tenant, 'Compra de estoque: ' || v_produto_nome,
    'Pagamento de compra de estoque pendente', 'ESTOQUE'::public.categoria_despesa,
    v_valor, v_data, 'MANUAL'::public.origem_despesa,
    v_compra.movimentacao_estoque_id
  ) returning id into v_despesa_id;

  update public.compras_estoque
    set despesa_id = v_despesa_id, updated_at = now()
    where id = p_compra_id and barbearia_id = v_tenant;

  return jsonb_build_object(
    'compra_id', p_compra_id, 'status', 'PAGA',
    'despesa_id', v_despesa_id, 'valor_pago', v_valor,
    'data_pagamento', v_data
  );
end;
$$;

-- RPCs acessiveis somente a usuarios autenticados. Sem acesso anonimo.
revoke execute on function public.registrar_reposicao_com_compra(uuid, integer, text, numeric, date, date, text) from public, anon;
revoke execute on function public.listar_compras_estoque_pendentes(integer) from public, anon;
revoke execute on function public.pagar_compra_estoque_pendente(uuid, numeric, date) from public, anon;
revoke execute on function public.listar_reposicoes_manuais_vinculaveis(integer) from public, anon;
grant execute on function public.registrar_reposicao_com_compra(uuid, integer, text, numeric, date, date, text) to authenticated;
grant execute on function public.listar_compras_estoque_pendentes(integer) to authenticated;
grant execute on function public.pagar_compra_estoque_pendente(uuid, numeric, date) to authenticated;
grant execute on function public.listar_reposicoes_manuais_vinculaveis(integer) to authenticated;

-- Listagem mínima de despesas gerenciadas por compras de estoque.
-- Permite à interface ocultar ações de edição/exclusão que o banco bloqueia.
-- Somente IDs de despesas da barbearia autenticada são retornados.
create or replace function public.listar_ids_despesas_compras()
returns uuid[]
language plpgsql security definer set search_path = ''
as $$
declare
  v_tenant uuid;
  v_ids uuid[];
begin
  v_tenant := public.current_barbearia_id();
  if v_tenant is null then
    raise exception 'Usuario nao autenticado ou sem barbearia.';
  end if;
  select coalesce(array_agg(c.despesa_id), array[]::uuid[])
    into v_ids
  from public.compras_estoque c
  where c.barbearia_id = v_tenant
    and c.despesa_id is not null;
  return v_ids;
end;
$$;
revoke execute on function public.listar_ids_despesas_compras() from public, anon;
grant execute on function public.listar_ids_despesas_compras() to authenticated;
