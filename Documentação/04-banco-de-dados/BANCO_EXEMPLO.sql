-- ============================================================
-- ESTILO E GESTÃO
-- BANCO DE DADOS — EXEMPLO DIDÁTICO
-- ============================================================
--
-- OBJETIVO
-- Mostrar, de forma visual, quais tabelas e colunas o MVP pode
-- possuir, incluindo tipos, nulabilidade e relacionamentos.
--
-- ESTE ARQUIVO NÃO É A MIGRATION FINAL.
--
-- O banco real será PostgreSQL hospedado no Supabase.
--
-- Antes de utilizar este SQL em produção será necessário revisar:
-- - migrations;
-- - constraints;
-- - índices;
-- - RLS;
-- - policies;
-- - funções transacionais;
-- - concorrência;
-- - leitura pública da Vitrine;
-- - permissões do Operador SaaS.
-- ============================================================


-- ============================================================
-- EXTENSÕES
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- ENUMS
-- ============================================================

create type public.forma_pagamento as enum (
  'PIX',
  'DINHEIRO',
  'DEBITO',
  'CREDITO',
  'OUTRO'
);

create type public.status_venda as enum (
  'CONCLUIDA',
  'CANCELADA'
);

create type public.tipo_item_venda as enum (
  'SERVICO',
  'PRODUTO'
);

create type public.tipo_movimento_estoque as enum (
  'REPOSICAO',
  'VENDA',
  'AJUSTE',
  'PERDA',
  'REVERSAO_VENDA'
);


-- ============================================================
-- 1. BARBEARIAS
-- ============================================================

create table public.barbearias (

  -- Identificador interno
  id uuid
    primary key
    default gen_random_uuid(),

  -- Nome obrigatório da barbearia
  nome_marca text
    not null,

  -- Nome profissional do barbeiro, quando informado
  nome_profissional text
    null,

  -- Descrição exibida publicamente
  descricao_publica text
    null,

  -- Identificador usado na URL pública
  slug text
    unique
    null,

  -- Controla acesso público à Vitrine
  vitrine_publicada boolean
    not null
    default false,

  -- Contatos
  whatsapp text
    not null,

  telefone text
    null,

  instagram_url text
    null,

  -- Atendimento externo
  atende_domicilio boolean
    not null
    default false,

  -- Endereço
  cep varchar(8)
    not null,

  logradouro text
    not null,

  numero_endereco text
    null,

  sem_numero boolean
    not null
    default false,

  bairro text
    not null,

  cidade text
    not null,

  uf varchar(2)
    not null,

  complemento text
    null,

  -- Mídia
  logo_path text
    null,

  capa_path text
    null,

  -- Assistente IA
  assistente_ia_liberado boolean
    not null
    default false,

  assistente_ia_ativo boolean
    not null
    default false,

  -- Estado da conta
  ativo boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint barbearias_cep_check
    check (cep ~ '^[0-9]{8}$'),

  constraint barbearias_uf_check
    check (char_length(uf) = 2),

  constraint barbearias_numero_check
    check (
      (sem_numero = true and numero_endereco is null)
      or
      (sem_numero = false and numero_endereco is not null)
    ),

  constraint barbearias_ia_check
    check (
      assistente_ia_ativo = false
      or assistente_ia_liberado = true
    )
);


-- ============================================================
-- 2. PERFIS
-- ============================================================
--
-- A identidade e a senha ficam em auth.users, gerenciada pelo
-- Supabase Auth.
--
-- Esta tabela guarda apenas informações internas da aplicação.
-- ============================================================

create table public.perfis (

  user_id uuid
    primary key
    references auth.users(id)
    on delete cascade,

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete cascade,

  nome text
    null,

  -- Permite retomar onboarding interrompido
  onboarding_etapa smallint
    not null
    default 1,

  onboarding_concluido boolean
    not null
    default false,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  -- MVP: um barbeiro por barbearia
  unique (barbearia_id),

  constraint perfis_onboarding_etapa_check
    check (onboarding_etapa between 1 and 5)
);


-- ============================================================
-- 3. SERVIÇOS
-- ============================================================

create table public.servicos (

  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete cascade,

  nome text
    not null,

  descricao text
    null,

  preco numeric(12,2)
    not null
    check (preco > 0),

  -- Materiais diretamente consumidos no atendimento
  custo_estimado numeric(12,2)
    null
    check (custo_estimado >= 0),

  ativo boolean
    not null
    default true,

  visivel_vitrine boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- ============================================================
-- 4. CATEGORIAS DE PRODUTO
-- ============================================================
--
-- Sugestões como Bebida, Pomada e Shampoo podem existir no
-- código da aplicação.
--
-- A categoria somente precisa ser criada aqui quando a
-- barbearia realmente utilizá-la.
-- ============================================================

create table public.categorias_produto (

  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete cascade,

  nome text
    not null,

  ativo boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- Evita, no mesmo tenant:
-- Bebida
-- bebida
-- " Bebida "
create unique index categorias_produto_nome_unico
  on public.categorias_produto (
    barbearia_id,
    lower(trim(nome))
  );


-- ============================================================
-- 5. PRODUTOS
-- ============================================================

create table public.produtos (

  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete cascade,

  categoria_id uuid
    not null
    references public.categorias_produto(id)
    on delete restrict,

  nome text
    not null,

  descricao text
    null,

  estoque_atual integer
    not null
    default 0
    check (estoque_atual >= 0),

  estoque_minimo integer
    null
    check (estoque_minimo >= 0),

  preco_custo numeric(12,2)
    not null
    check (preco_custo >= 0),

  preco_venda numeric(12,2)
    not null
    check (preco_venda > 0),

  imagem_path text
    null,

  ativo boolean
    not null
    default true,

  visivel_vitrine boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- ============================================================
-- 6. VENDAS
-- ============================================================

create table public.vendas (

  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete restrict,

  status public.status_venda
    not null
    default 'CONCLUIDA',

  -- Opcional conforme escopo atual
  forma_pagamento public.forma_pagamento
    null,

  total_bruto numeric(12,2)
    not null
    check (total_bruto >= 0),

  total_custo_snapshot numeric(12,2)
    not null
    default 0
    check (total_custo_snapshot >= 0),

  resultado_estimado_snapshot numeric(12,2)
    not null,

  observacao text
    null,

  created_at timestamptz
    not null
    default now(),

  canceled_at timestamptz
    null,

  constraint vendas_cancelamento_check
    check (
      (
        status = 'CONCLUIDA'
        and canceled_at is null
      )
      or
      (
        status = 'CANCELADA'
        and canceled_at is not null
      )
    )
);


-- A comanda que ainda está sendo montada NÃO é uma venda.
-- Portanto não existe status PENDENTE no MVP.


-- ============================================================
-- 7. ITENS DA VENDA
-- ============================================================

create table public.venda_itens (

  id uuid
    primary key
    default gen_random_uuid(),

  venda_id uuid
    not null
    references public.vendas(id)
    on delete restrict,

  tipo public.tipo_item_venda
    not null,

  servico_id uuid
    null
    references public.servicos(id)
    on delete set null,

  produto_id uuid
    null
    references public.produtos(id)
    on delete set null,

  -- Snapshot evita que alterações futuras mudem vendas antigas
  nome_snapshot text
    not null,

  quantidade integer
    not null
    check (quantidade > 0),

  preco_unitario_snapshot numeric(12,2)
    not null
    check (preco_unitario_snapshot >= 0),

  custo_unitario_snapshot numeric(12,2)
    not null
    default 0
    check (custo_unitario_snapshot >= 0),

  subtotal_snapshot numeric(12,2)
    not null
    check (subtotal_snapshot >= 0),

  resultado_item_snapshot numeric(12,2)
    not null,

  created_at timestamptz
    not null
    default now(),

  constraint venda_item_referencia_check
    check (
      (
        tipo = 'SERVICO'
        and servico_id is not null
        and produto_id is null
      )
      or
      (
        tipo = 'PRODUTO'
        and produto_id is not null
        and servico_id is null
      )
    )
);


-- ============================================================
-- 8. DESPESAS
-- ============================================================
--
-- Categoria permanece texto porque o modelo definitivo de
-- categorias personalizadas de despesas ainda é uma decisão.
-- ============================================================

create table public.despesas (

  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete restrict,

  nome text
    not null,

  descricao text
    null,

  categoria text
    not null,

  valor numeric(12,2)
    not null
    check (valor > 0),

  data_despesa date
    not null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- ============================================================
-- 9. MOVIMENTAÇÕES DE ESTOQUE
-- ============================================================

create table public.movimentacoes_estoque (

  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete restrict,

  produto_id uuid
    not null
    references public.produtos(id)
    on delete restrict,

  tipo public.tipo_movimento_estoque
    not null,

  -- Pode ser positivo ou negativo
  quantidade_delta integer
    not null,

  saldo_anterior integer
    not null
    check (saldo_anterior >= 0),

  saldo_posterior integer
    not null
    check (saldo_posterior >= 0),

  venda_id uuid
    null
    references public.vendas(id)
    on delete set null,

  motivo text
    null,

  created_at timestamptz
    not null
    default now()
);


-- ============================================================
-- 10. PORTFÓLIO
-- ============================================================

create table public.portfolio (

  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete cascade,

  imagem_path text
    not null,

  descricao text
    null,

  servico_id uuid
    null
    references public.servicos(id)
    on delete set null,

  publicado boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- ============================================================
-- 11. HORÁRIOS DE FUNCIONAMENTO
-- ============================================================

create table public.horarios_funcionamento (

  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete cascade,

  -- 0 = domingo
  -- 1 = segunda
  -- 2 = terça
  -- 3 = quarta
  -- 4 = quinta
  -- 5 = sexta
  -- 6 = sábado
  dia_semana smallint
    not null
    check (dia_semana between 0 and 6),

  fechado boolean
    not null
    default false,

  abre time
    null,

  fecha time
    null,

  unique (
    barbearia_id,
    dia_semana
  ),

  constraint horario_funcionamento_check
    check (
      (
        fechado = true
        and abre is null
        and fecha is null
      )
      or
      (
        fechado = false
        and abre is not null
        and fecha is not null
        and abre < fecha
      )
    )
);


-- ============================================================
-- ÍNDICES INICIAIS
-- ============================================================

create index idx_servicos_barbearia
  on public.servicos(barbearia_id);

create index idx_categorias_produto_barbearia
  on public.categorias_produto(barbearia_id);

create index idx_produtos_barbearia
  on public.produtos(barbearia_id);

create index idx_produtos_categoria
  on public.produtos(categoria_id);

create index idx_vendas_barbearia_created
  on public.vendas(
    barbearia_id,
    created_at desc
  );

create index idx_despesas_barbearia_data
  on public.despesas(
    barbearia_id,
    data_despesa desc
  );

create index idx_movimentacoes_produto_created
  on public.movimentacoes_estoque(
    produto_id,
    created_at desc
  );

create index idx_portfolio_barbearia_publicado
  on public.portfolio(
    barbearia_id,
    publicado
  );


-- ============================================================
-- RLS
-- ============================================================
--
-- O arquivo demonstra apenas que RLS deverá existir.
--
-- As policies definitivas pertencem à implementação e às
-- Diretrizes de Segurança.
--
-- Não copiar uma política genérica para todas as tabelas.
-- ============================================================

alter table public.barbearias
  enable row level security;

alter table public.perfis
  enable row level security;

alter table public.servicos
  enable row level security;

alter table public.categorias_produto
  enable row level security;

alter table public.produtos
  enable row level security;

alter table public.vendas
  enable row level security;

alter table public.venda_itens
  enable row level security;

alter table public.despesas
  enable row level security;

alter table public.movimentacoes_estoque
  enable row level security;

alter table public.portfolio
  enable row level security;

alter table public.horarios_funcionamento
  enable row level security;


-- ============================================================
-- IMPORTANTE
-- ============================================================
--
-- A migration real também deverá garantir que relacionamentos
-- como Produto -> Categoria pertencem à mesma barbearia.
--
-- Venda + Itens + Baixa de Estoque + Movimentações deverão ser
-- executados em uma operação transacional segura.
--
-- A Vitrine não deverá ser implementada simplesmente liberando
-- SELECT público irrestrito nas tabelas administrativas.
--
-- O painel do Operador SaaS ainda depende de decisão de
-- autenticação e autorização e, portanto, não possui tabela ou
-- role própria neste exemplo.
--
-- ============================================================