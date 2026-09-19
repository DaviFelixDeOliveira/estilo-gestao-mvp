-- ============================================================
-- SISTEMA DE GESTÃO PARA BARBEARIAS
-- MIGRATION INICIAL
-- Estrutura base da versão inicial
-- ============================================================

-- ============================================================
-- EXTENSÕES
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- ENUMS
-- ============================================================

create type public.tipo_usuario as enum (
  'BARBEIRO',
  'ADMIN'
);

create type public.tema_sistema as enum (
  'CLARO',
  'ESCURO',
  'SISTEMA'
);

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

create type public.produto_sem_estoque_vitrine as enum (
  'OCULTAR',
  'INDISPONIVEL'
);

create type public.categoria_despesa as enum (
  'ALUGUEL',
  'AGUA',
  'ENERGIA',
  'INTERNET',
  'EQUIPAMENTOS',
  'MATERIAIS_CONSUMO',
  'MANUTENCAO',
  'MARKETING',
  'IMPOSTOS_TAXAS',
  'ESTOQUE',
  'OUTROS'
);

create type public.origem_despesa as enum (
  'MANUAL',
  'DESPESA_RECORRENTE'
);

create type public.frequencia_despesa_recorrente as enum (
  'MENSAL'
);

create type public.status_ocorrencia_despesa as enum (
  'PENDENTE',
  'PAGA',
  'IGNORADA'
);

create type public.status_conta as enum (
  'ATIVA',
  'SUSPENSA'
);


-- ============================================================
-- BARBEARIAS
-- ============================================================

create table public.barbearias (
  id uuid
    primary key
    default gen_random_uuid(),

  -- Identificador amigável interno, por exemplo BAR-4TK8QW.
  -- Não depende do nome comercial do sistema.
  codigo text
    not null
    unique,

  -- Dados principais.
  -- Alguns permanecem nulos enquanto o onboarding não terminar.
  nome_marca text
    null,

  nome_profissional text
    null,

  descricao_publica text
    null,

  -- URL pública da Vitrine.
  slug text
    unique
    null,

  vitrine_publicada boolean
    not null
    default false,

  produto_sem_estoque_vitrine public.produto_sem_estoque_vitrine
    not null
    default 'INDISPONIVEL',

  -- Contato.
  whatsapp text
    null,

  instagram_url text
    null,

  atende_domicilio boolean
    null,

  -- Endereço.
  cep varchar(8)
    null,

  logradouro text
    null,

  tem_numero boolean
    null,

  numero_endereco text
    null,

  bairro text
    null,

  cidade text
    null,

  uf varchar(2)
    null,

  complemento text
    null,

  -- Mídia.
  logo_path text
    null,

  capa_path text
    null,


  -- Estado administrativo da conta.
  status_conta public.status_conta
    not null
    default 'ATIVA',

  suspensa_em timestamptz
    null,

  motivo_suspensao text
    null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  -- Formato:
  -- BAR-XXXXXX
  --
  -- Caracteres removidos para evitar confusão visual:
  -- 0, O, 1 e I.
  constraint barbearias_codigo_formato_check
    check (
      codigo ~ '^BAR-[2-9A-HJ-NP-Z]{6}$'
    ),

  constraint barbearias_nome_check
    check (
      nome_marca is null
      or char_length(trim(nome_marca)) > 0
    ),

  constraint barbearias_cep_check
    check (
      cep is null
      or cep ~ '^[0-9]{8}$'
    ),

  constraint barbearias_uf_check
    check (
      uf is null
      or uf ~ '^[A-Za-z]{2}$'
    ),

  constraint barbearias_numero_check
    check (
      (
        tem_numero is null
        and numero_endereco is null
      )
      or
      (
        tem_numero = true
        and numero_endereco is not null
        and char_length(trim(numero_endereco)) > 0
      )
      or
      (
        tem_numero = false
        and numero_endereco is null
      )
    ),

  constraint barbearias_slug_check
    check (
      slug is null
      or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  constraint barbearias_vitrine_slug_check
    check (
      vitrine_publicada = false
      or slug is not null
    ),

  constraint barbearias_suspensao_check
    check (
      (
        status_conta = 'ATIVA'
        and suspensa_em is null
      )
      or
      (
        status_conta = 'SUSPENSA'
        and suspensa_em is not null
      )
    )
);


-- ============================================================
-- PERFIS
-- ============================================================

create table public.perfis (
  -- Mesmo UUID do Supabase Auth.
  user_id uuid
    primary key
    references auth.users(id)
    on delete cascade,

  barbearia_id uuid
    null
    references public.barbearias(id)
    on delete restrict,

  nome text
    null,

  tipo public.tipo_usuario
    not null
    default 'BARBEIRO',

  tema public.tema_sistema
    not null
    default 'SISTEMA',

  -- Onboarding atual possui 6 etapas.
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

  constraint perfis_nome_check
    check (
      nome is null
      or char_length(trim(nome)) > 0
    ),

  constraint perfis_tipo_barbearia_check
    check (
      (
        tipo = 'BARBEIRO'
        and barbearia_id is not null
      )
      or
      (
        tipo = 'ADMIN'
        and barbearia_id is null
      )
    ),

  constraint perfis_onboarding_etapa_check
    check (
      onboarding_etapa between 1 and 6
    )
);


-- Na versão inicial, uma barbearia possui somente
-- um perfil BARBEIRO responsável.
create unique index perfis_barbearia_unica
  on public.perfis(barbearia_id)
  where barbearia_id is not null;

-- ============================================================
-- SERVIÇOS
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
    check (preco >= 0),

  -- Custo estimado dos materiais consumidos no serviço.
  custo_estimado numeric(12,2)
    null
    check (
      custo_estimado is null
      or custo_estimado >= 0
    ),

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
    default now(),

  constraint servicos_nome_check
    check (
      char_length(trim(nome)) > 0
    ),

  -- Necessário para relacionamentos que também validam o tenant.
  unique (id, barbearia_id)
);


-- ============================================================
-- CATEGORIAS DE PRODUTOS
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

  -- Imagem padrão opcional fornecida pelo próprio sistema.
  -- Categorias personalizadas normalmente terão null.
  imagem_padrao_path text
    null,

  ativo boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint categorias_produto_nome_check
    check (
      char_length(trim(nome)) > 0
    ),

  unique (id, barbearia_id)
);


-- Evita, dentro da mesma barbearia:
-- Bebida
-- bebida
-- " Bebida "
create unique index categorias_produto_nome_unico
  on public.categorias_produto (
    barbearia_id,
    lower(trim(nome))
  );


-- ============================================================
-- PRODUTOS
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
    not null,

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
    check (
      estoque_minimo is null
      or estoque_minimo >= 0
    ),

  preco_custo numeric(12,2)
    not null
    check (preco_custo >= 0),

  preco_venda numeric(12,2)
    not null
    check (preco_venda > 0),

  -- Imagem personalizada enviada pela barbearia.
  imagem_path text
    null,

  -- Se não existir imagem personalizada, permite utilizar
  -- a imagem padrão da categoria como fallback.
  usar_imagem_categoria boolean
    not null
    default true,

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
    default now(),

  constraint produtos_nome_check
    check (
      char_length(trim(nome)) > 0
    ),

  -- Impede um produto da Barbearia A de utilizar
  -- uma categoria pertencente à Barbearia B.
  constraint produtos_categoria_tenant_fk
    foreign key (
      categoria_id,
      barbearia_id
    )
    references public.categorias_produto(
      id,
      barbearia_id
    )
    on delete restrict,

  unique (id, barbearia_id)
);

-- ============================================================
-- VENDAS
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

  -- Forma utilizada nesta venda específica.
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

  constraint vendas_observacao_check
    check (
      observacao is null
      or char_length(observacao) <= 200
    ),

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
    ),

  -- Permite relacionamentos que validam também o tenant.
  unique (id, barbearia_id)
);


-- CANCELADA permanece prevista no modelo histórico.
-- A versão inicial da interface não oferece ação de
-- cancelar ou estornar vendas até o fluxo ser aprovado.


-- ============================================================
-- ITENS DA VENDA
-- ============================================================

create table public.venda_itens (
  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null,

  venda_id uuid
    not null,

  tipo public.tipo_item_venda
    not null,

  servico_id uuid
    null,

  produto_id uuid
    null,

  -- Snapshots preservam o histórico caso os cadastros
  -- sejam alterados posteriormente.
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

  -- O item precisa pertencer a uma venda da mesma barbearia.
  constraint venda_itens_venda_tenant_fk
    foreign key (
      venda_id,
      barbearia_id
    )
    references public.vendas(
      id,
      barbearia_id
    )
    on delete restrict,

  -- Quando for serviço, ele também precisa pertencer
  -- à mesma barbearia.
  constraint venda_itens_servico_tenant_fk
    foreign key (
      servico_id,
      barbearia_id
    )
    references public.servicos(
      id,
      barbearia_id
    )
    on delete restrict,

  -- Quando for produto, ele também precisa pertencer
  -- à mesma barbearia.
  constraint venda_itens_produto_tenant_fk
    foreign key (
      produto_id,
      barbearia_id
    )
    references public.produtos(
      id,
      barbearia_id
    )
    on delete restrict,

  constraint venda_itens_nome_snapshot_check
    check (
      char_length(trim(nome_snapshot)) > 0
    ),

  constraint venda_itens_referencia_check
    check (
      (
        tipo = 'SERVICO'
        and servico_id is not null
        and produto_id is null
        and quantidade = 1
      )
      or
      (
        tipo = 'PRODUTO'
        and produto_id is not null
        and servico_id is null
        and quantidade >= 1
      )
    )
);


-- Um mesmo serviço aparece no máximo uma vez em cada venda.
create unique index venda_itens_servico_unico
  on public.venda_itens (
    venda_id,
    servico_id
  )
  where tipo = 'SERVICO';


-- ============================================================
-- MOVIMENTAÇÕES DE ESTOQUE
-- ============================================================

create table public.movimentacoes_estoque (
  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null,

  produto_id uuid
    not null,

  tipo public.tipo_movimento_estoque
    not null,

  -- Positivo para entrada e negativo para saída.
  quantidade_delta integer
    not null
    check (quantidade_delta <> 0),

  saldo_anterior integer
    not null
    check (saldo_anterior >= 0),

  saldo_posterior integer
    not null
    check (saldo_posterior >= 0),

  -- Preenchido quando a movimentação tiver origem
  -- em uma venda ou reversão de venda.
  venda_id uuid
    null,

  motivo text
    null,

  -- Utilizados principalmente em REPOSICAO e PERDA
  -- para preservar valores históricos.
  custo_unitario_snapshot numeric(12,2)
    null
    check (
      custo_unitario_snapshot is null
      or custo_unitario_snapshot >= 0
    ),

  valor_total_snapshot numeric(12,2)
    null
    check (
      valor_total_snapshot is null
      or valor_total_snapshot >= 0
    ),

  created_at timestamptz
    not null
    default now(),

  constraint movimentacoes_produto_tenant_fk
    foreign key (
      produto_id,
      barbearia_id
    )
    references public.produtos(
      id,
      barbearia_id
    )
    on delete restrict,

  constraint movimentacoes_venda_tenant_fk
    foreign key (
      venda_id,
      barbearia_id
    )
    references public.vendas(
      id,
      barbearia_id
    )
    on delete restrict,

  constraint movimentacoes_saldo_check
    check (
      saldo_posterior = saldo_anterior + quantidade_delta
    ),

  constraint movimentacoes_delta_tipo_check
    check (
      (
        tipo = 'REPOSICAO'
        and quantidade_delta > 0
      )
      or
      (
        tipo = 'VENDA'
        and quantidade_delta < 0
      )
      or
      (
        tipo = 'AJUSTE'
        and quantidade_delta <> 0
      )
      or
      (
        tipo = 'PERDA'
        and quantidade_delta < 0
      )
      or
      (
        tipo = 'REVERSAO_VENDA'
        and quantidade_delta > 0
      )
    ),

  constraint movimentacoes_venda_check
    check (
      (
        tipo in ('VENDA', 'REVERSAO_VENDA')
        and venda_id is not null
      )
      or
      (
        tipo not in ('VENDA', 'REVERSAO_VENDA')
        and venda_id is null
      )
    ),

  constraint movimentacoes_snapshot_check
    check (
      (
        tipo in ('REPOSICAO', 'PERDA')
        and custo_unitario_snapshot is not null
        and valor_total_snapshot is not null
      )
      or
      (
        tipo not in ('REPOSICAO', 'PERDA')
        and custo_unitario_snapshot is null
        and valor_total_snapshot is null
      )
    ),

  constraint movimentacoes_id_barbearia_unique
    unique (id, barbearia_id)
);

-- ============================================================
-- DESPESAS
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

  categoria public.categoria_despesa
    not null,

  valor numeric(12,2)
    not null
    check (valor > 0),

  data_despesa date
    not null,

  origem public.origem_despesa
    not null
    default 'MANUAL',

  -- Referência opcional a uma movimentação de reposição.
  -- A reposição NÃO cria despesa automaticamente.
  movimentacao_estoque_id uuid
    null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint despesas_nome_check
    check (
      char_length(trim(nome)) > 0
    ),

  -- Uma referência de estoque somente faz sentido para
  -- uma despesa manual da categoria ESTOQUE.
  constraint despesas_movimentacao_check
    check (
      movimentacao_estoque_id is null
      or (
        origem = 'MANUAL'
        and categoria = 'ESTOQUE'
      )
    ),

  -- Impede relacionar uma despesa da Barbearia A
  -- com uma movimentação da Barbearia B.
  constraint despesas_movimentacao_tenant_fk
    foreign key (
      movimentacao_estoque_id,
      barbearia_id
    )
    references public.movimentacoes_estoque(
      id,
      barbearia_id
    )
    on delete restrict,

  unique (id, barbearia_id)
);


-- IMPORTANTE:
-- A FK garante o tenant, mas não verifica se a movimentação
-- relacionada é especificamente do tipo REPOSICAO.
-- Essa validação ficará na operação server-side/transacional.


-- ============================================================
-- DESPESAS RECORRENTES
-- ============================================================

create table public.despesas_recorrentes (
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

  categoria public.categoria_despesa
    not null,

  valor_previsto numeric(12,2)
    not null
    check (valor_previsto > 0),

  frequencia public.frequencia_despesa_recorrente
    not null
    default 'MENSAL',

  dia_vencimento smallint
    not null
    check (
      dia_vencimento between 1 and 31
    ),

  ativa boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint despesas_recorrentes_nome_check
    check (
      char_length(trim(nome)) > 0
    ),

  unique (id, barbearia_id)
);


-- ============================================================
-- OCORRÊNCIAS DE DESPESAS RECORRENTES
-- ============================================================

create table public.ocorrencias_despesas_recorrentes (
  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null,

  despesa_recorrente_id uuid
    not null,

  -- Sempre representa o primeiro dia do mês da competência.
  -- Exemplo: setembro/2026 = 2026-09-01.
  competencia date
    not null,

  data_vencimento date
    not null,

  -- Snapshots preservam o histórico caso a recorrência
  -- seja alterada futuramente.
  nome_snapshot text
    not null,

  categoria_snapshot public.categoria_despesa
    not null,

  valor_previsto numeric(12,2)
    not null
    check (valor_previsto > 0),

  valor_pago numeric(12,2)
    null
    check (
      valor_pago is null
      or valor_pago > 0
    ),

  data_pagamento date
    null,

  status public.status_ocorrencia_despesa
    not null
    default 'PENDENTE',

  -- Quando uma ocorrência é paga, ela gera uma
  -- despesa financeira efetiva.
  despesa_id uuid
    null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint ocorrencias_recorrencia_tenant_fk
    foreign key (
      despesa_recorrente_id,
      barbearia_id
    )
    references public.despesas_recorrentes(
      id,
      barbearia_id
    )
    on delete restrict,

  constraint ocorrencias_despesa_tenant_fk
    foreign key (
      despesa_id,
      barbearia_id
    )
    references public.despesas(
      id,
      barbearia_id
    )
    on delete restrict,

  constraint ocorrencias_nome_snapshot_check
    check (
      char_length(trim(nome_snapshot)) > 0
    ),

  -- A competência sempre utiliza o primeiro dia do mês.
  constraint ocorrencias_competencia_check
    check (
      extract(day from competencia) = 1
    ),

  constraint ocorrencias_status_check
    check (
      (
        status = 'PENDENTE'
        and valor_pago is null
        and data_pagamento is null
        and despesa_id is null
      )
      or
      (
        status = 'IGNORADA'
        and valor_pago is null
        and data_pagamento is null
        and despesa_id is null
      )
      or
      (
        status = 'PAGA'
        and valor_pago is not null
        and data_pagamento is not null
        and despesa_id is not null
      )
    ),

  -- Uma recorrência só pode possuir uma ocorrência
  -- para cada mês.
  unique (
    despesa_recorrente_id,
    competencia
  ),

  -- Uma despesa efetiva não pode pagar duas ocorrências.
  unique (despesa_id)
);

-- ============================================================
-- PORTFÓLIO
-- ============================================================

create table public.portfolio (
  id uuid
    primary key
    default gen_random_uuid(),

  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete cascade,

  -- A imagem fica no Supabase Storage.
  -- O banco guarda somente o caminho do arquivo.
  imagem_path text
    not null,

  descricao text
    null,

  -- Serviço relacionado opcionalmente ao trabalho publicado.
  servico_id uuid
    null,

  publicado boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint portfolio_imagem_path_check
    check (
      char_length(trim(imagem_path)) > 0
    ),

  -- Impede relacionar um trabalho da Barbearia A
  -- com um serviço pertencente à Barbearia B.
  constraint portfolio_servico_tenant_fk
    foreign key (
      servico_id,
      barbearia_id
    )
    references public.servicos(
      id,
      barbearia_id
    )
    on delete restrict
);


-- ============================================================
-- HORÁRIOS DE FUNCIONAMENTO
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
  -- 1 = segunda-feira
  -- 2 = terça-feira
  -- 3 = quarta-feira
  -- 4 = quinta-feira
  -- 5 = sexta-feira
  -- 6 = sábado
  dia_semana smallint
    not null
    check (
      dia_semana between 0 and 6
    ),

  fechado boolean
    not null
    default false,

  -- Primeiro intervalo.
  abre_1 time
    null,

  fecha_1 time
    null,

  -- Segundo intervalo opcional.
  abre_2 time
    null,

  fecha_2 time
    null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  -- Uma barbearia possui no máximo uma configuração
  -- para cada dia da semana.
  unique (
    barbearia_id,
    dia_semana
  ),

  constraint horario_funcionamento_check
    check (
      -- Dia fechado:
      (
        fechado = true
        and abre_1 is null
        and fecha_1 is null
        and abre_2 is null
        and fecha_2 is null
      )

      or

      -- Dia aberto:
      (
        fechado = false

        -- Primeiro intervalo obrigatório.
        and abre_1 is not null
        and fecha_1 is not null
        and abre_1 < fecha_1

        -- Segundo intervalo pode não existir.
        and (
          (
            abre_2 is null
            and fecha_2 is null
          )

          or

          (
            abre_2 is not null
            and fecha_2 is not null
            and abre_2 < fecha_2

            -- Evita sobreposição entre os intervalos.
            and fecha_1 <= abre_2
          )
        )
      )
    )
);


-- ============================================================
-- FORMAS DE PAGAMENTO ACEITAS PELA BARBEARIA
-- ============================================================

create table public.barbearia_formas_pagamento (
  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete cascade,

  forma_pagamento public.forma_pagamento
    not null,

  created_at timestamptz
    not null
    default now(),

  primary key (
    barbearia_id,
    forma_pagamento
  )
);

-- ============================================================
-- PLANOS E ASSINATURAS
-- ============================================================

create type public.codigo_plano as enum (
  'GRATIS',
  'NORMAL'
);

create type public.origem_periodo_assinatura as enum (
  'GRATIS',
  'PAGAMENTO',
  'CORTESIA'
);

create type public.status_pagamento_assinatura as enum (
  'CONFIRMADO',
  'ESTORNADO'
);


-- ============================================================
-- PLANOS
-- ============================================================

create table public.planos (
  id uuid
    primary key
    default gen_random_uuid(),

  codigo public.codigo_plano
    not null
    unique,

  nome text
    not null,

  preco_mensal numeric(12,2)
    not null
    check (preco_mensal >= 0),

  -- Permite retirar um plano de novas contratações
  -- sem apagar seu histórico.
  ativo boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint planos_nome_check
    check (
      char_length(trim(nome)) > 0
    )
);


-- ============================================================
-- ASSINATURAS
-- ============================================================

create table public.assinaturas (
  id uuid
    primary key
    default gen_random_uuid(),

  -- Toda barbearia possui exatamente uma assinatura atual,
  -- inclusive quando utiliza o plano Grátis.
  barbearia_id uuid
    not null
    unique
    references public.barbearias(id)
    on delete cascade,

  plano_atual_id uuid
    not null
    references public.planos(id)
    on delete restrict,

  -- Informa de onde veio o período atual.
  -- GRATIS:
  --   plano gratuito, sem período pago.
  --
  -- PAGAMENTO:
  --   período obtido através de pagamento real.
  --
  -- CORTESIA:
  --   período concedido administrativamente, sem pagamento fictício.
  origem_periodo public.origem_periodo_assinatura
    not null
    default 'GRATIS',

  inicio_periodo timestamptz
    null,

  fim_periodo timestamptz
    null,

  -- Dia-base do ciclo mensal (1 a 31). Mantém o dia original do
  -- pagamento/cortesia mesmo quando algum mês possui menos dias.
  dia_base smallint
    null
    check (
      dia_base is null
      or dia_base between 1 and 31
    ),

  -- Utilizado em mudança de plano programada para o fim do período.
  proximo_plano_id uuid
    null
    references public.planos(id)
    on delete restrict,

  mudanca_agendada_para timestamptz
    null,

  -- Cancelar plano pago significa continuar usando
  -- até o fim do período e depois retornar ao Grátis.
  cancelamento_agendado boolean
    not null
    default false,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint assinaturas_periodo_check
    check (
      (
        origem_periodo = 'GRATIS'
        and inicio_periodo is null
        and fim_periodo is null
        and dia_base is null
      )
      or
      (
        origem_periodo in ('PAGAMENTO', 'CORTESIA')
        and inicio_periodo is not null
        and fim_periodo is not null
        and dia_base is not null
        and fim_periodo > inicio_periodo
      )
    ),

  constraint assinaturas_mudanca_agendada_check
    check (
      (
        proximo_plano_id is null
        and mudanca_agendada_para is null
      )
      or
      (
        proximo_plano_id is not null
        and mudanca_agendada_para is not null
      )
    ),

  -- Não pode existir ao mesmo tempo um downgrade
  -- programado e um cancelamento para o Grátis.
  constraint assinaturas_agendamento_unico_check
    check (
      not (
        proximo_plano_id is not null
        and cancelamento_agendado = true
      )
    )
);


-- ============================================================
-- RETENÇÃO MÍNIMA DE CONTAS EXCLUÍDAS
-- ============================================================
--
-- Esta estrutura precisa existir antes de pagamentos porque,
-- após exclusão de uma conta, pagamentos históricos não devem
-- continuar apontando para uma barbearia ativa inexistente.
--
-- O prazo de cinco anos segue a regra atual do projeto.
-- A política jurídica definitiva ainda deverá ser revisada.
-- ============================================================

create table public.retencoes_contas_excluidas (
  id uuid
    primary key
    default gen_random_uuid(),

  codigo_barbearia text
    not null
    unique,

  nome_barbearia text
    not null,

  email_responsavel text
    not null,

  excluida_em timestamptz
    not null
    default now(),

  eliminar_em timestamptz
    not null,

  eliminada_em timestamptz
    null,

  created_at timestamptz
    not null
    default now(),

  constraint retencoes_codigo_check
    check (
      codigo_barbearia ~ '^BAR-[2-9A-HJ-NP-Z]{6}$'
    ),

  constraint retencoes_nome_check
    check (
      char_length(trim(nome_barbearia)) > 0
    ),

  constraint retencoes_email_check
    check (
      char_length(trim(email_responsavel)) > 0
    ),

  constraint retencoes_prazo_check
    check (
      eliminar_em = excluida_em + interval '5 years'
    )
);


-- ============================================================
-- PAGAMENTOS DE ASSINATURA
-- ============================================================
--
-- Cada linha representa um pagamento real.
--
-- Cortesias NÃO geram registros nesta tabela.
-- Elas serão registradas no histórico administrativo.
-- ============================================================

create table public.pagamentos_assinatura (
  id uuid
    primary key
    default gen_random_uuid(),

  -- Enquanto a conta existe, o pagamento aponta para ela.
  barbearia_id uuid
    null
    references public.barbearias(id)
    on delete restrict,

  -- Depois da exclusão, o vínculo identificável poderá
  -- ser transferido para a estrutura de retenção.
  retencao_conta_excluida_id uuid
    null
    references public.retencoes_contas_excluidas(id)
    on delete cascade,

  -- Snapshots preservam o que foi efetivamente vendido,
  -- mesmo se nome ou preço do plano mudar futuramente.
  plano_codigo_snapshot public.codigo_plano
    not null,

  plano_nome_snapshot text
    not null,

  preco_oficial_snapshot numeric(12,2)
    not null
    check (preco_oficial_snapshot >= 0),

  valor_recebido numeric(12,2)
    not null
    check (valor_recebido > 0),

  -- Data real em que o pagamento ocorreu.
  data_pagamento date
    not null,

  confirmado_em timestamptz
    not null
    default now(),

  -- ADMIN que confirmou o pagamento.
  -- perfis utiliza user_id como chave primária.
  confirmado_por uuid
    null
    references public.perfis(user_id)
    on delete set null,

  -- Inicialmente o pagamento é manual via PIX.
  metodo text
    not null
    default 'PIX',

  status public.status_pagamento_assinatura
    not null
    default 'CONFIRMADO',

  estornado_em timestamptz
    null,

  -- Campo opcional para referência externa ou comprovante
  -- lógico da transação.
  identificador_transacao text
    null,

  created_at timestamptz
    not null
    default now(),

  constraint pagamentos_plano_nome_check
    check (
      char_length(trim(plano_nome_snapshot)) > 0
    ),

  constraint pagamentos_metodo_check
    check (
      char_length(trim(metodo)) > 0
    ),

  constraint pagamentos_status_check
    check (
      (
        status = 'CONFIRMADO'
        and estornado_em is null
      )
      or
      (
        status = 'ESTORNADO'
        and estornado_em is not null
      )
    ),

  -- O pagamento deve pertencer a uma conta ativa OU
  -- a uma retenção de conta excluída, nunca às duas.
  constraint pagamentos_vinculo_check
    check (
      (
        barbearia_id is not null
        and retencao_conta_excluida_id is null
      )
      or
      (
        barbearia_id is null
        and retencao_conta_excluida_id is not null
      )
    )
);

-- ============================================================
-- HISTÓRICO ADMINISTRATIVO
-- ============================================================
--
-- Registra ações relevantes do sistema, do barbeiro
-- e principalmente do painel ADMIN.
--
-- Exemplos:
-- - pagamento confirmado;
-- - cortesia concedida;
-- - ativação/renovação do Plano Normal;
-- - cancelamento agendado;
-- - suspensão;
-- - reativação.
-- ============================================================

create table public.historico_administrativo (
  id uuid
    primary key
    default gen_random_uuid(),

  -- Enquanto a conta existir, o histórico aponta para ela.
  barbearia_id uuid
    null
    references public.barbearias(id)
    on delete restrict,

  -- Após exclusão, eventos essenciais que precisem ser
  -- mantidos poderão apontar para a retenção.
  retencao_conta_excluida_id uuid
    null
    references public.retencoes_contas_excluidas(id)
    on delete cascade,

  -- Quem originou o evento.
  ator_tipo text
    not null
    check (
      ator_tipo in (
        'BARBEIRO',
        'ADMIN',
        'SISTEMA'
      )
    ),

  -- Quando houver um usuário identificável associado.
  ator_perfil_id uuid
    null
    references public.perfis(user_id)
    on delete set null,

  -- Nome técnico do evento.
  -- Exemplos:
  -- PAGAMENTO_CONFIRMADO
  -- CORTESIA_CONCEDIDA
  -- CONTA_SUSPENSA
  -- CONTA_REATIVADA
  evento text
    not null,

  -- Estado anterior e posterior quando aplicável.
  dados_anteriores jsonb
    null,

  dados_posteriores jsonb
    null,

  ocorrido_em timestamptz
    not null
    default now(),

  -- Identifica registros que devem acompanhar a retenção
  -- após exclusão da conta.
  essencial_pos_exclusao boolean
    not null
    default false,

  constraint historico_evento_check
    check (
      char_length(trim(evento)) > 0
    ),

  -- O histórico pertence à barbearia ativa OU
  -- à retenção da conta excluída.
  constraint historico_vinculo_check
    check (
      (
        barbearia_id is not null
        and retencao_conta_excluida_id is null
      )
      or
      (
        barbearia_id is null
        and retencao_conta_excluida_id is not null
      )
    ));

-- Para eventos BARBEIRO/ADMIN, a aplicação deve preencher ator_perfil_id
-- no momento do registro. A coluna permanece nullable porque ON DELETE
-- SET NULL precisa preservar o histórico após a exclusão do perfil.


-- ============================================================
-- CONFIGURAÇÕES GLOBAIS DO SISTEMA
-- ============================================================
--
-- Esta tabela possui exatamente uma linha.
--
-- É utilizada inicialmente para o modo de manutenção global.
-- ============================================================

create table public.configuracoes_sistema (
  singleton boolean
    primary key
    default true
    check (singleton = true),

  manutencao_ativa boolean
    not null
    default false,

  motivo_codigo text
    null
    check (
      motivo_codigo is null
      or motivo_codigo in (
        'MELHORIAS',
        'BUGS',
        'SEGURANCA_PRIVACIDADE',
        'OUTRO'
      )
    ),

  -- Informação interna para o ADMIN.
  motivo_interno text
    null,

  -- Define se uma justificativa poderá ser mostrada publicamente.
  mostrar_motivo boolean
    not null
    default false,

  mensagem_publica text
    null,

  previsao_retorno timestamptz
    null,

  -- ADMIN responsável pela última alteração, quando existir.
  atualizado_por uuid
    null
    references public.perfis(user_id)
    on delete set null,

  updated_at timestamptz
    not null
    default now(),

  constraint configuracoes_manutencao_check
    check (
      (
        manutencao_ativa = false
        and previsao_retorno is null
      )
      or
      manutencao_ativa = true
    ),

  constraint configuracoes_mostrar_motivo_check
    check (
      mostrar_motivo = false
      or (
        manutencao_ativa = true
        and mensagem_publica is not null
        and char_length(trim(mensagem_publica)) > 0
      )
    )
);


-- Cria a única linha de configuração global.
insert into public.configuracoes_sistema (
  singleton
)
values (
  true
);


-- ============================================================
-- CÓDIGOS RESERVADOS
-- ============================================================
--
-- Impede que um código de barbearia já utilizado seja
-- reutilizado futuramente, inclusive após exclusão da conta.
--
-- Exemplo:
-- BAR-4TK8QW
-- ============================================================

create table public.codigos_reservados (
  id uuid
    primary key
    default gen_random_uuid(),

  -- Enquanto permitido, poderá manter o código legível.
  codigo_legivel text
    null
    unique,

  -- Representação derivada utilizada para impedir reutilização
  -- mesmo quando o código legível precisar ser anonimizado.
  codigo_fingerprint text
    not null
    unique,

  reservado_em timestamptz
    not null
    default now(),

  anonimizado_em timestamptz
    null,

  constraint codigos_reservados_codigo_check
    check (
      codigo_legivel is null
      or codigo_legivel ~ '^BAR-[2-9A-HJ-NP-Z]{6}$'
    ),

  constraint codigos_reservados_fingerprint_check
    check (
      char_length(trim(codigo_fingerprint)) > 0
    )
);


-- ============================================================
-- ACEITES LEGAIS
-- ============================================================
--
-- Mantém registro da versão dos documentos aceitos pelo usuário.
--
-- Não guarda senha, IP ou conteúdo integral do documento.
-- ============================================================

create table public.aceites_legais (
  id uuid
    primary key
    default gen_random_uuid(),

  perfil_id uuid
    not null
    references public.perfis(user_id)
    on delete cascade,

  documento text
    not null
    check (
      documento in (
        'TERMOS_USO',
        'POLITICA_PRIVACIDADE'
      )
    ),

  versao text
    not null,

  aceito_em timestamptz
    not null
    default now(),

  constraint aceites_legais_versao_check
    check (
      char_length(trim(versao)) > 0
    ),

  -- Uma mesma versão do documento é registrada
  -- somente uma vez para cada perfil.
  unique (
    perfil_id,
    documento,
    versao
  )
);


-- ============================================================
-- ÍNDICES INICIAIS
-- ============================================================

create index idx_barbearias_status_conta
  on public.barbearias(status_conta);

create index idx_perfis_tipo
  on public.perfis(tipo);

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

create index idx_venda_itens_venda
  on public.venda_itens(venda_id);

create index idx_movimentacoes_produto_created
  on public.movimentacoes_estoque(
    produto_id,
    created_at desc
  );

create index idx_movimentacoes_barbearia_created
  on public.movimentacoes_estoque(
    barbearia_id,
    created_at desc
  );

create unique index despesas_movimentacao_estoque_unica
  on public.despesas(movimentacao_estoque_id)
  where movimentacao_estoque_id is not null;

create index idx_despesas_barbearia_data
  on public.despesas(
    barbearia_id,
    data_despesa desc
  );

create index idx_despesas_barbearia_categoria
  on public.despesas(
    barbearia_id,
    categoria
  );

create index idx_despesas_recorrentes_barbearia_ativa
  on public.despesas_recorrentes(
    barbearia_id,
    ativa
  );

create index idx_ocorrencias_barbearia_vencimento
  on public.ocorrencias_despesas_recorrentes(
    barbearia_id,
    data_vencimento
  );

create index idx_ocorrencias_barbearia_status
  on public.ocorrencias_despesas_recorrentes(
    barbearia_id,
    status
  );

create index idx_portfolio_barbearia_publicado
  on public.portfolio(
    barbearia_id,
    publicado
  );

create index idx_assinaturas_plano_atual
  on public.assinaturas(plano_atual_id);

create index idx_assinaturas_fim_periodo
  on public.assinaturas(fim_periodo)
  where fim_periodo is not null;

create index idx_pagamentos_data_pagamento
  on public.pagamentos_assinatura(data_pagamento desc);

create index idx_historico_barbearia_ocorrido
  on public.historico_administrativo(
    barbearia_id,
    ocorrido_em desc
  );

create index idx_retencoes_eliminar_em
  on public.retencoes_contas_excluidas(eliminar_em)
  where eliminada_em is null;


-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Planos comerciais da versão inicial.
insert into public.planos (
  codigo,
  nome,
  preco_mensal,
  ativo
)
values
  (
    'GRATIS',
    'Grátis',
    0.00,
    true
  ),
  (
    'NORMAL',
    'Normal',
    49.90,
    true
  );


-- ============================================================
-- OBSERVAÇÕES PARA AS PRÓXIMAS MIGRATIONS
-- ============================================================
--
-- Esta migration cria somente a estrutura base.
--
-- Ainda serão implementados separadamente:
--
-- - triggers de updated_at;
-- - geração, reserva e imutabilidade de codigo da barbearia;
-- - criação transacional de barbearia + perfil + assinatura Grátis;
-- - RLS e policies por tenant;
-- - leitura pública segura da Vitrine;
-- - funções transacionais de PDV e estoque;
-- - operações de despesas recorrentes;
-- - regras server-side de assinatura;
-- - buckets e policies do Supabase Storage;
-- - geração e proteção do slug público;
-- - fluxo de exclusão e retenção;
-- - Assistente IA apenas quando voltar ao escopo do produto.
--
-- Não alterar esta migration depois que ela for aplicada.
-- Alterações futuras devem ser feitas em novas migrations.
