-- ============================================================
-- SALES CORE
-- ============================================================
--
-- Estrutura central do modulo de vendas:
-- - data/hora real da venda;
-- - numero sequencial por barbearia;
-- - desconto manual;
-- - total liquido;
-- - pagamentos simples, divididos ou nao informados.
-- ============================================================



-- ============================================================
-- 2. NUMERO SEQUENCIAL DA VENDA
-- ============================================================

alter table public.vendas
  add column numero_venda bigint;


with vendas_numeradas as (
  select
    id,
    row_number() over (
      partition by barbearia_id
      order by ocorrida_em asc, created_at asc, id asc
    )::bigint as numero
  from public.vendas
)
update public.vendas as v
set numero_venda = vn.numero
from vendas_numeradas as vn
where vn.id = v.id;


alter table public.vendas
  alter column numero_venda set not null;


alter table public.vendas
  add constraint vendas_numero_venda_check
  check (numero_venda > 0);


alter table public.vendas
  add constraint vendas_barbearia_numero_venda_key
  unique (barbearia_id, numero_venda);


-- ============================================================
-- 3. CONTADOR SEQUENCIAL POR BARBEARIA
-- ============================================================

create table public.venda_contadores (
  barbearia_id uuid primary key
    references public.barbearias(id)
    on delete cascade,

  ultimo_numero bigint not null default 0,

  constraint venda_contadores_ultimo_numero_check
    check (ultimo_numero >= 0)
);


insert into public.venda_contadores (
  barbearia_id,
  ultimo_numero
)
select
  barbearia_id,
  max(numero_venda)
from public.vendas
group by barbearia_id;


alter table public.venda_contadores
  enable row level security;


revoke all
on table public.venda_contadores
from anon, authenticated;


create or replace function public.atribuir_numero_venda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proximo_numero bigint;
begin
  if new.numero_venda is not null then
    raise exception 'numero_venda e gerado automaticamente';
  end if;

  insert into public.venda_contadores (
    barbearia_id,
    ultimo_numero
  )
  values (
    new.barbearia_id,
    1
  )
  on conflict (barbearia_id)
  do update
    set ultimo_numero =
      public.venda_contadores.ultimo_numero + 1
  returning ultimo_numero
  into v_proximo_numero;

  new.numero_venda := v_proximo_numero;

  return new;
end;
$$;


create trigger trg_vendas_atribuir_numero
before insert
on public.vendas
for each row
execute function public.atribuir_numero_venda();


create or replace function public.proteger_numero_venda()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.numero_venda is distinct from old.numero_venda then
    raise exception 'numero_venda nao pode ser alterado';
  end if;

  return new;
end;
$$;


create trigger trg_vendas_proteger_numero
before update of numero_venda
on public.vendas
for each row
execute function public.proteger_numero_venda();


comment on column public.vendas.numero_venda is
  'Numero sequencial da venda dentro da barbearia. Gerado automaticamente e nunca reutilizado.';


comment on table public.venda_contadores is
  'Controle interno do ultimo numero de venda utilizado por cada barbearia.';


-- ============================================================
-- 4. DESCONTO DA VENDA
-- ============================================================

create type public.tipo_desconto_venda as enum (
  'VALOR',
  'PERCENTUAL'
);


alter table public.vendas
  add column desconto_tipo public.tipo_desconto_venda,
  add column desconto_valor_informado numeric(12,2),
  add column desconto_total_snapshot numeric(12,2) not null default 0,
  add column total_liquido numeric(12,2);


update public.vendas
set total_liquido = total_bruto
where total_liquido is null;


alter table public.vendas
  alter column total_liquido set not null;


alter table public.vendas
  add constraint vendas_desconto_total_snapshot_check
  check (
    desconto_total_snapshot >= 0
    and desconto_total_snapshot <= total_bruto
  );


alter table public.vendas
  add constraint vendas_total_liquido_check
  check (
    total_liquido >= 0
    and total_liquido = total_bruto - desconto_total_snapshot
  );


alter table public.vendas
  add constraint vendas_desconto_consistencia_check
  check (
    (
      desconto_tipo is null
      and desconto_valor_informado is null
      and desconto_total_snapshot = 0
    )

    or

    (
      desconto_tipo = 'VALOR'
      and desconto_valor_informado > 0
      and desconto_valor_informado <= total_bruto
      and desconto_total_snapshot = desconto_valor_informado
    )

    or

    (
      desconto_tipo = 'PERCENTUAL'
      and desconto_valor_informado > 0
      and desconto_valor_informado <= 100
      and desconto_total_snapshot =
        round(
          (total_bruto * desconto_valor_informado) / 100,
          2
        )
    )
  );


comment on column public.vendas.desconto_tipo is
  'Tipo do desconto manual aplicado: VALOR ou PERCENTUAL.';


comment on column public.vendas.desconto_valor_informado is
  'Valor originalmente informado. Reais em VALOR ou percentual em PERCENTUAL.';


comment on column public.vendas.desconto_total_snapshot is
  'Valor monetario efetivamente abatido da venda.';


comment on column public.vendas.total_liquido is
  'Valor final efetivamente cobrado depois do desconto.';


-- ============================================================
-- 5. PAGAMENTOS DA VENDA
-- ============================================================
--
-- Nenhuma linha:
--   forma de pagamento nao informada.
--
-- Uma linha:
--   pagamento simples.
--
-- Duas ou mais linhas:
--   pagamento dividido.
-- ============================================================

create table public.venda_pagamentos (
  id uuid primary key
    default gen_random_uuid(),

  barbearia_id uuid not null,

  venda_id uuid not null,

  forma_pagamento public.forma_pagamento not null,

  valor numeric(12,2) not null,

  created_at timestamptz not null
    default now(),

  constraint venda_pagamentos_valor_check
    check (valor > 0),

  constraint venda_pagamentos_venda_barbearia_fkey
    foreign key (
      venda_id,
      barbearia_id
    )
    references public.vendas (
      id,
      barbearia_id
    )
    on delete cascade,

  constraint venda_pagamentos_forma_unica_key
    unique (
      venda_id,
      forma_pagamento
    )
);


-- ============================================================
-- 6. MIGRAR PAGAMENTOS LEGADOS
-- ============================================================

do $$
begin
  if exists (
    select 1
    from public.vendas
    where forma_pagamento is not null
      and total_liquido <= 0
  ) then
    raise exception
      'Existem vendas com pagamento informado e total zero; revise os dados antes da migration';
  end if;
end;
$$;


insert into public.venda_pagamentos (
  barbearia_id,
  venda_id,
  forma_pagamento,
  valor
)
select
  barbearia_id,
  id,
  forma_pagamento,
  total_liquido
from public.vendas
where forma_pagamento is not null;


alter table public.vendas
  drop column forma_pagamento;


-- ============================================================
-- 7. SEGURANCA DOS PAGAMENTOS
-- ============================================================

alter table public.venda_pagamentos
  enable row level security;


create policy venda_pagamentos_select_proprios
on public.venda_pagamentos
for select
to authenticated
using (
  barbearia_id = public.current_barbearia_id()
);


revoke all
on table public.venda_pagamentos
from anon;


revoke insert, update, delete
on table public.venda_pagamentos
from authenticated;


grant select
on table public.venda_pagamentos
to authenticated;


grant all
on table public.venda_pagamentos
to service_role;


-- ============================================================
-- 8. INDICES
-- ============================================================

create index idx_venda_pagamentos_barbearia_forma
  on public.venda_pagamentos (
    barbearia_id,
    forma_pagamento,
    venda_id
  );


create index idx_venda_pagamentos_venda
  on public.venda_pagamentos (
    venda_id
  );


comment on table public.venda_pagamentos is
  'Pagamentos de uma venda. Permite pagamento simples, dividido ou forma nao informada.';


comment on column public.venda_pagamentos.valor is
  'Valor atribuido a esta forma de pagamento.';