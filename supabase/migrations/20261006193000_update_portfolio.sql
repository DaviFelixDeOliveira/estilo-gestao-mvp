-- ============================================================
-- ATUALIZAÇÃO DO PORTFÓLIO
-- ============================================================
-- Alinha a estrutura do Portfólio com as regras atuais do MVP.
--
-- Alterações:
-- - remove a relação antiga com serviços;
-- - adiciona título opcional;
-- - adiciona ordem de exibição;
-- - renomeia "publicado" para "visivel_vitrine";
-- - preserva imagens, descrições e datas existentes;
-- - reorganiza o índice utilizado pelo Portfólio.
-- ============================================================

-- A relação entre foto e serviço não faz mais parte do MVP.
alter table public.portfolio
  drop constraint if exists portfolio_servico_tenant_fk;

alter table public.portfolio
  drop column if exists servico_id;

-- Título público opcional.
alter table public.portfolio
  add column if not exists titulo text null;

-- Renomeia o estado antigo para o nome atual.
alter table public.portfolio
  rename column publicado to visivel_vitrine;

-- Adiciona posição de ordenação.
-- Começa como nullable para permitir o preenchimento dos registros existentes.
alter table public.portfolio
  add column ordem integer null;

-- Mantém a ordem atual dos registros existentes de cada barbearia.
with portfolio_ordenado as (
  select
    id,
    row_number() over (
      partition by barbearia_id
      order by created_at asc, id asc
    )::integer as nova_ordem
  from public.portfolio
)
update public.portfolio as p
set ordem = po.nova_ordem
from portfolio_ordenado as po
where p.id = po.id;

-- Depois do preenchimento, todo item deve possuir uma posição.
alter table public.portfolio
  alter column ordem set not null;

-- Evita posições inválidas.
alter table public.portfolio
  add constraint portfolio_ordem_check
  check (ordem > 0);

-- Substitui o índice antigo por índices coerentes com o modelo atual.
drop index if exists public.idx_portfolio_barbearia_publicado;

create index idx_portfolio_barbearia_visivel
  on public.portfolio(
    barbearia_id,
    visivel_vitrine
  );

create index idx_portfolio_barbearia_ordem
  on public.portfolio(
    barbearia_id,
    ordem
  );
