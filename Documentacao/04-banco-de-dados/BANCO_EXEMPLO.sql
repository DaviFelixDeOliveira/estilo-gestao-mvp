-- ============================================================
-- ESTILO E GESTÃO
-- BANCO DE DADOS — EXEMPLO DIDÁTICO
-- ============================================================
--
-- OBJETIVO
--
-- Mostrar de forma técnica e visual as principais tabelas,
-- colunas, tipos, enums, relacionamentos e constraints previstos
-- para o MVP do Estilo e Gestão.
--
-- ESTE ARQUIVO NÃO É A MIGRATION FINAL DE PRODUÇÃO.
--
-- O banco real será PostgreSQL hospedado no Supabase.
--
-- Antes de utilizar este SQL em produção será necessário revisar:
--
-- - migrations;
-- - RLS;
-- - policies;
-- - autorização BARBEIRO/ADMIN;
-- - funções transacionais;
-- - concorrência;
-- - operações automáticas de estoque/financeiro;
-- - geração de despesas recorrentes;
-- - leitura pública da Vitrine;
-- - Storage;
-- - exclusão e retenção de dados.
--
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
-- ============================================================
-- 1. BARBEARIAS
-- ============================================================
-- Durante o Onboarding, alguns campos obrigatórios para o uso normal
-- podem permanecer null até a etapa correspondente ser salva.
-- Ao concluir o Onboarding, o backend deverá validar que todos os
-- dados obrigatórios das 6 etapas foram preenchidos.
-- Isso permite salvar cada etapa individualmente sem valores fictícios.
create table public.barbearias (
  id uuid
    primary key
    default gen_random_uuid(),
  -- Nome obrigatório da barbearia
  nome_marca text
    null,
  -- Nome profissional do barbeiro, quando informado
  nome_profissional text
    null,
  -- Texto público da Vitrine
  descricao_publica text
    null,
  -- URL pública da Vitrine.
  -- Pode permanecer null enquanto a Vitrine ainda não foi criada.
  slug text
    unique
    null,
  vitrine_publicada boolean
    not null
    default false,
  -- Define o comportamento público de produtos sem estoque
  produto_sem_estoque_vitrine public.produto_sem_estoque_vitrine
    not null
    default 'INDISPONIVEL',
  -- Contatos
  whatsapp text
    null,
  instagram_url text
    null,
  -- Atendimento externo
  atende_domicilio boolean
    null,
  -- Endereço
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
  -- Mídia
  logo_path text
    null,
  capa_path text
    null,
  -- Assistente IA
  assistente_ia_ativo boolean
    not null
    default false,
  created_at timestamptz
    not null
    default now(),
  updated_at timestamptz
    not null
    default now(),
  constraint barbearias_nome_check
    check (
      nome_marca is null
      or length(trim(nome_marca)) > 0
    ),
  constraint barbearias_cep_check
    check (cep ~ '^[0-9]{8}$'),
  constraint barbearias_uf_check
    check (uf ~ '^[A-Za-z]{2}$'),
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
        and length(trim(numero_endereco)) > 0
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
    )
);
-- ============================================================
-- 2. PERFIS
-- ============================================================
--
-- A identidade, e-mail e senha pertencem ao Supabase Auth.
--
-- Esta tabela contém somente informações da aplicação.
--
-- BARBEIRO:
--   possui barbearia_id.
--
-- ADMIN:
--   não representa uma barbearia e pode possuir barbearia_id null.
--
-- ============================================================
create table public.perfis (
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
  -- Permite retomar o Onboarding interrompido.
  -- O fluxo atual possui 6 etapas:
  -- 1. Dados da barbearia
  -- 2. Endereço
  -- 3. Horários de funcionamento
  -- 4. Serviços
  -- 5. Produtos e formas de pagamento
  -- 6. Aparência e conclusão
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
-- MVP:
-- uma barbearia possui somente um BARBEIRO responsável.
create unique index perfis_barbearia_unica
  on public.perfis(barbearia_id)
  where barbearia_id is not null;
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
  -- Materiais diretamente consumidos durante o atendimento.
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
    check (length(trim(nome)) > 0),
  -- Permite FK composta quando necessário para garantir tenant.
  unique (id, barbearia_id)
);
-- ============================================================
-- 4. CATEGORIAS DE PRODUTO
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

  -- Imagem padrão opcional da categoria.
  --
  -- Categorias sugeridas pelo Estilo e Gestão poderão apontar
  -- para arquivos oficiais compartilhados do sistema, por exemplo:
  --
  -- sistema/categorias/pomada.webp
  --
  -- Categorias personalizadas criadas pelo barbeiro começam com null.
  --
  -- O arquivo não é duplicado por tenant. Várias categorias de
  -- barbearias diferentes podem apontar para o mesmo recurso oficial.
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
    check (length(trim(nome)) > 0),
  unique (id, barbearia_id)
);
-- Evita no mesmo tenant:
--
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
  -- Imagem personalizada do produto.
  --
  -- Quando preenchida, possui prioridade sobre a imagem padrão
  -- configurada na categoria.
  imagem_path text
    null,

  -- Quando não existe imagem personalizada, define se o produto
  -- pode utilizar a imagem padrão de sua categoria.
  --
  -- true:
  --   imagem_path preenchida
  --     -> usa imagem personalizada
  --
  --   imagem_path null + categoria com imagem_padrao_path
  --     -> usa imagem padrão da categoria
  --
  --   imagem_path null + categoria sem imagem_padrao_path
  --     -> fica sem imagem efetiva e a interface usa placeholder
  --
  -- false:
  --   imagem_path null
  --     -> fica sem imagem, mesmo que a categoria possua padrão
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
    check (length(trim(nome)) > 0),
  constraint produtos_categoria_tenant_fk
    foreign key (categoria_id, barbearia_id)
    references public.categorias_produto(id, barbearia_id)
    on delete restrict,
  unique (id, barbearia_id)
);

-- Regra conceitual de imagem efetiva do produto:
--
-- 1. produtos.imagem_path não é null
--      -> usar imagem personalizada
--
-- 2. produtos.imagem_path é null
--    e produtos.usar_imagem_categoria = true
--    e categorias_produto.imagem_padrao_path não é null
--      -> usar imagem padrão da categoria
--
-- 3. demais casos
--      -> produto sem imagem; interface poderá usar placeholder
--
-- Ao remover uma imagem personalizada:
--
-- - "Usar imagem padrão da categoria":
--     imagem_path = null
--     usar_imagem_categoria = true
--
-- - "Ficar sem imagem":
--     imagem_path = null
--     usar_imagem_categoria = false
--
-- A imagem padrão da categoria nunca deve ser copiada para
-- produtos.imagem_path. Ela continua pertencendo à categoria.
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
  -- Forma de pagamento é opcional no fluxo atual.
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
  unique (id, barbearia_id)
);
-- A comanda em edição NÃO existe nesta tabela.
--
-- Portanto, não existe status PENDENTE para vendas.
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
  -- Snapshot mantém o histórico mesmo após alterações futuras.
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
-- ============================================================
-- 8. DESPESAS
-- ============================================================
--
-- Representa somente saídas financeiras efetivamente realizadas.
--
-- Uma despesa PENDENTE de recorrência não entra nesta tabela
-- até ser marcada como paga.
--
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
  -- Referência opcional informada pelo usuário quando uma despesa
  -- manual representa a compra registrada em uma reposição.
  movimentacao_estoque_id uuid
    null,
  created_at timestamptz
    not null
    default now(),
  updated_at timestamptz
    not null
    default now(),
  constraint despesas_nome_check
    check (length(trim(nome)) > 0),
  constraint despesas_reposicao_opcional_check
    check (
      movimentacao_estoque_id is null
      or (
        origem = 'MANUAL'
        and categoria = 'ESTOQUE'
      )
    ),
  unique (id, barbearia_id)
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
    not null,
  tipo public.tipo_movimento_estoque
    not null,
  -- Positivo ou negativo conforme o tipo.
  quantidade_delta integer
    not null
    check (quantidade_delta <> 0),
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
  -- Utilizados principalmente em REPOSICAO e PERDA.
  --
  -- Preservam o custo no momento da movimentação.
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
    foreign key (produto_id, barbearia_id)
    references public.produtos(id, barbearia_id)
    on delete restrict,
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
        tipo = 'PERDA'
        and quantidade_delta < 0
      )
      or
      (
        tipo = 'REVERSAO_VENDA'
        and quantidade_delta > 0
      )
      or
      (
        tipo = 'AJUSTE'
        and quantidade_delta <> 0
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
    )
);
-- Referência opcional entre uma despesa manual e uma reposição.
-- Registrar reposição não cria despesa automaticamente.
alter table public.despesas
  add constraint despesas_movimentacao_estoque_fk
  foreign key (movimentacao_estoque_id)
  references public.movimentacoes_estoque(id)
  on delete restrict;
-- Uma reposição pode ser relacionada a no máximo uma despesa manual.
create unique index despesas_movimentacao_estoque_unica
  on public.despesas(movimentacao_estoque_id)
  where movimentacao_estoque_id is not null;
-- ============================================================
-- 10. DESPESAS RECORRENTES
-- ============================================================
--
-- Representa a CONFIGURAÇÃO da recorrência.
--
-- Não significa que dinheiro já saiu do caixa.
--
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
    check (dia_vencimento between 1 and 31),
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
    check (length(trim(nome)) > 0),
  unique (id, barbearia_id)
);
-- ============================================================
-- 11. OCORRÊNCIAS DE DESPESAS RECORRENTES
-- ============================================================
--
-- Cada ocorrência representa um mês específico da recorrência.
--
-- PENDENTE:
--   ainda não representa saída financeira.
--
-- PAGA:
--   gera uma despesa efetiva.
--
-- IGNORADA:
--   permanece no histórico, mas não gera saída.
--
-- ============================================================
create table public.ocorrencias_despesas_recorrentes (
  id uuid
    primary key
    default gen_random_uuid(),
  barbearia_id uuid
    not null
    references public.barbearias(id)
    on delete restrict,
  despesa_recorrente_id uuid
    not null,
  -- Primeiro dia do mês de referência.
  --
  -- Exemplo:
  -- competência de outubro/2026 = 2026-10-01
  competencia date
    not null,
  data_vencimento date
    not null,
  -- Snapshots preservam o histórico mesmo que a configuração
  -- da recorrência seja alterada posteriormente.
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
  -- Preenchido somente quando a ocorrência for marcada como paga.
  despesa_id uuid
    null,
  created_at timestamptz
    not null
    default now(),
  updated_at timestamptz
    not null
    default now(),
  constraint ocorrencias_recorrencia_tenant_fk
    foreign key (despesa_recorrente_id, barbearia_id)
    references public.despesas_recorrentes(id, barbearia_id)
    on delete restrict,
  constraint ocorrencias_despesa_fk
    foreign key (despesa_id, barbearia_id)
    references public.despesas(id, barbearia_id)
    on delete restrict,
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
  unique (
    despesa_recorrente_id,
    competencia
  ),
  unique (despesa_id)
);
-- ============================================================
-- 12. PORTFÓLIO
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
  constraint portfolio_servico_tenant_fk
    foreign key (servico_id, barbearia_id)
    references public.servicos(id, barbearia_id)
    on delete set null
);
-- ============================================================
-- 13. HORÁRIOS DE FUNCIONAMENTO
-- ============================================================
--
-- Cada dia poderá possuir:
--
-- - 1 intervalo obrigatório quando aberto;
-- - 1 segundo intervalo opcional.
--
-- Exemplo:
--
-- 08:00 - 12:00
-- 14:00 - 18:00
--
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
  abre_1 time
    null,
  fecha_1 time
    null,
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
        -- Primeiro intervalo obrigatório
        and abre_1 is not null
        and fecha_1 is not null
        and abre_1 < fecha_1
        -- Segundo intervalo:
        -- ou os dois campos são nulos,
        -- ou os dois são preenchidos.
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
            -- Segundo período deve começar
            -- depois do primeiro terminar.
            and fecha_1 <= abre_2
          )
        )
      )
    )
);
-- ============================================================
-- 14. FORMAS DE PAGAMENTO ACEITAS PELA BARBEARIA
-- ============================================================
--
-- Esta tabela representa as formas que a barbearia declara aceitar
-- normalmente e que poderão ser exibidas na Vitrine Digital.
--
-- Isso é diferente de vendas.forma_pagamento, que registra a forma
-- efetivamente utilizada em uma venda específica.
--
-- Uma barbearia pode aceitar várias formas de pagamento.
-- A combinação barbearia + forma não pode se repetir.
--
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
-- ÍNDICES INICIAIS
-- ============================================================
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
create index idx_despesas_recorrentes_barbearia
  on public.despesas_recorrentes(
    barbearia_id,
    ativa
  );
create index idx_ocorrencias_recorrentes_barbearia_vencimento
  on public.ocorrencias_despesas_recorrentes(
    barbearia_id,
    data_vencimento
  );
create index idx_ocorrencias_recorrentes_status
  on public.ocorrencias_despesas_recorrentes(
    barbearia_id,
    status
  );
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
create index idx_portfolio_barbearia_publicado
  on public.portfolio(
    barbearia_id,
    publicado
  );
-- slug já possui UNIQUE, que também cria estrutura útil
-- para busca pela URL pública.
-- ============================================================
-- RLS
-- ============================================================
--
-- Este arquivo demonstra apenas que RLS deverá existir.
--
-- As policies definitivas deverão ser implementadas e testadas
-- separadamente.
--
-- IMPORTANTE:
--
-- Não criar uma policy genérica:
--
--   "se ADMIN então pode tudo"
--
-- O Operador do SaaS deve possuir apenas acesso às operações
-- administrativas especificamente permitidas.
--
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
alter table public.despesas_recorrentes
  enable row level security;
alter table public.ocorrencias_despesas_recorrentes
  enable row level security;
alter table public.portfolio
  enable row level security;
alter table public.horarios_funcionamento
  enable row level security;
alter table public.barbearia_formas_pagamento
  enable row level security;
-- ============================================================
-- REGRAS IMPORTANTES PARA A IMPLEMENTAÇÃO
-- ============================================================
-- ============================================================
-- CADASTRO DE USUÁRIO
-- ============================================================
--
-- Todo cadastro público deverá criar:
--
--   tipo = 'BARBEIRO'
--
-- O navegador não deverá conseguir solicitar:
--
--   tipo = 'ADMIN'
--
-- A atribuição de ADMIN será realizada manualmente no banco
-- durante o MVP.
--
-- O usuário não deverá conseguir alterar seu próprio tipo.
-- ============================================================
-- ============================================================
-- ONBOARDING
-- ============================================================
--
-- O Onboarding possui 6 etapas:
--
-- 1. Dados da barbearia
-- 2. Endereço
-- 3. Horários de funcionamento
-- 4. Serviços
-- 5. Produtos e formas de pagamento
-- 6. Aparência e conclusão
--
-- Cada etapa deverá ser salva individualmente.
--
-- Alguns campos de barbearias podem permanecer null enquanto o
-- Onboarding estiver incompleto. Ao concluir, o backend deverá validar
-- todos os campos obrigatórios antes de definir:
--
--   onboarding_concluido = true
--
-- O tema escolhido na etapa 6 é salvo em perfis.tema.
--
-- As formas de pagamento aceitas são salvas em
-- barbearia_formas_pagamento e não devem ser confundidas com
-- vendas.forma_pagamento.
--
-- ============================================================
-- ============================================================
-- BARBEIRO x ADMIN
-- ============================================================
--
-- BARBEIRO:
--
--   auth.users
--       ↓
--   perfis
--       ↓
--   barbearia_id
--       ↓
--   dados da própria barbearia
--
--
-- ADMIN:
--
--   auth.users
--       ↓
--   perfis.tipo = ADMIN
--       ↓
--   endpoints administrativos autorizados
--
--
-- ADMIN não deverá ser tratado como proprietário automático
-- de todas as barbearias.
-- ============================================================
-- ============================================================
-- PDV
-- ============================================================
--
-- Venda + Itens + Baixa de Estoque + Movimentações deverão ser
-- executados em uma única operação transacional.
--
-- Exemplo:
--
-- BEGIN
--
-- validar sessão
-- validar barbearia
-- validar itens
-- validar estoque
-- buscar preços
-- buscar custos
-- criar venda
-- criar itens
-- baixar estoque
-- criar movimentações
--
-- COMMIT
--
-- Em qualquer falha:
--
-- ROLLBACK
--
-- O estoque nunca deverá ficar negativo por concorrência.
-- ============================================================
-- ============================================================
-- REPOSIÇÃO DE ESTOQUE
-- ============================================================
--
-- Toda reposição deverá executar de forma consistente:
--
-- 1. aumentar estoque;
-- 2. atualizar o custo atual do produto;
-- 3. criar movimento REPOSICAO;
-- 4. preservar custo_unitario_snapshot;
-- 5. preservar valor_total_snapshot;
--
-- A reposição NÃO cria despesa automaticamente.
-- Se a compra precisar aparecer no Financeiro, o usuário cadastra
-- uma despesa manual na categoria ESTOQUE e pode relacioná-la
-- opcionalmente à movimentação.
-- ============================================================
-- ============================================================
-- PERDA DE ESTOQUE
-- ============================================================
--
-- PERDA:
--
-- - reduz estoque;
-- - registra custo no momento da perda;
-- - registra valor total da perda;
-- - afeta o resultado estimado;
-- - NÃO cria uma nova despesa.
--
-- Isso evita contabilizar novamente o dinheiro que já saiu
-- durante a compra/reposição do produto.
-- ============================================================
-- ============================================================
-- DESPESAS RECORRENTES
-- ============================================================
--
-- despesas_recorrentes:
--
--   configuração
--
-- ocorrencias_despesas_recorrentes:
--
--   previsão mensal
--
-- despesas:
--
--   saída financeira efetiva
--
--
-- Fluxo:
--
-- recorrência
--     ↓
-- ocorrência PENDENTE
--     ↓
-- usuário marca como paga
--     ↓
-- cria despesa
--     ↓
-- ocorrência PAGA
--
--
-- Uma ocorrência IGNORADA:
--
-- - permanece no histórico;
-- - não gera despesa;
-- - não desativa a recorrência.
--
--
-- Se o vencimento configurado for dia 31 e o mês não possuir
-- esse dia, a aplicação deverá utilizar o último dia do mês.
-- ============================================================
-- ============================================================
-- FORMAS DE PAGAMENTO ACEITAS
-- ============================================================
--
-- barbearia_formas_pagamento:
--   configura o que a barbearia aceita normalmente.
--
-- vendas.forma_pagamento:
--   registra como uma venda específica foi paga.
--
-- Exemplo:
--
-- A barbearia aceita:
--   PIX, DINHEIRO, DEBITO e CREDITO
--
-- Uma venda específica pode registrar:
--   forma_pagamento = PIX
--
-- O Onboarding deverá exigir pelo menos uma forma aceita antes da
-- conclusão. Essa regra é funcional e será validada pelo backend.
--
-- ============================================================
-- ============================================================
-- VITRINE
-- ============================================================
--
-- A Vitrine não deverá existir através de SELECT público
-- irrestrito nas tabelas administrativas.
--
-- A implementação pública deverá utilizar allowlist.
--
-- Nunca enviar ao visitante:
--
-- - preço de custo;
-- - custo de serviço;
-- - estoque numérico;
-- - estoque mínimo;
-- - despesas;
-- - faturamento;
-- - vendas privadas;
-- - IDs internos desnecessários;
-- - dados de outra barbearia.
--
-- A leitura pública poderá incluir as formas de pagamento aceitas
-- cadastradas em barbearia_formas_pagamento.
--
--
-- O slug:
--
-- - é criado quando o usuário gera a URL;
-- - deve ser único;
-- - deve permanecer estável depois da criação;
-- - não muda automaticamente quando nome_marca for alterado.
--
--
-- Ao despublicar:
--
--   vitrine_publicada = false
--
-- O slug continua armazenado.
-- ============================================================
-- ============================================================
-- ASSISTENTE IA
-- ============================================================
--
-- O banco não armazena o conteúdo das conversas.
-- Ele existe somente durante a conversa atual.
--
-- O contexto público permitido poderá incluir as formas de pagamento
-- aceitas pela barbearia, além dos demais dados públicos autorizados.
--
-- A IA poderá ficar pública somente quando:
--
--   o plano efetivo incluir ASSISTENTE_IA
--   assistente_ia_ativo = true
--   a conta estiver ATIVA
--   houver cota mensal disponível
--
--
-- Rate limit, conversa, cota e timeout:
--
-- - 10 mensagens por minuto por visitante;
-- - 20 mensagens por conversa;
-- - 1.000 respostas por ciclo mensal da barbearia;
-- - timeout de 15 segundos.
--
-- Rate limit e timeout podem permanecer na aplicação. O uso mensal
-- é persistido em uso_ia_mensal. O conteúdo não é persistido.
-- ============================================================
-- ============================================================
-- STORAGE
-- ============================================================
--
-- Imagens devem ficar no Supabase Storage.
--
-- O PostgreSQL mantém somente caminhos ou referências.
--
-- Estrutura conceitual:
--
-- sistema/
--   categorias/
--     bebida.webp
--     pomada.webp
--     shampoo.webp
--     cera.webp
--     oleo-balm.webp
--     acessorios.webp
--     outros.webp
--
-- barbearias/
--   {barbeariaId}/
--     logo/
--     capa/
--     produtos/
--     portfolio/
--
-- "sistema/categorias/" contém arquivos oficiais compartilhados
-- usados como imagens padrão das categorias sugeridas.
--
-- Esses arquivos:
--
-- - não pertencem a um tenant específico;
-- - podem ser reutilizados por várias barbearias;
-- - não devem ser alterados ou excluídos pelo barbeiro.
--
-- "barbearias/{barbeariaId}/" contém os arquivos personalizados
-- pertencentes ao tenant.
--
-- As policies do Storage deverão proteger os arquivos de cada tenant
-- e impedir alterações indevidas nos recursos oficiais do sistema.
-- ============================================================
-- ============================================================
-- ESTRUTURAS ATUAIS DO MVP
-- ============================================================
--
-- Tabelas da aplicação:
--
-- 1.  barbearias
-- 2.  perfis
-- 3.  servicos
-- 4.  categorias_produto
-- 5.  produtos
-- 6.  vendas
-- 7.  venda_itens
-- 8.  despesas
-- 9.  movimentacoes_estoque
-- 10. despesas_recorrentes
-- 11. ocorrencias_despesas_recorrentes
-- 12. portfolio
-- 13. horarios_funcionamento
-- 14. barbearia_formas_pagamento
--
-- Além de auth.users, gerenciado pelo Supabase Auth.
--
-- ============================================================
-- ============================================================
-- ESTRUTURAS QUE NÃO EXISTEM NO MVP
-- ============================================================
--
-- Não criar antecipadamente tabelas para:
--
-- - clientes;
-- - agendamentos;
-- - lembretes;
-- - fidelidade;
-- - comissões;
-- - funcionários;
-- - equipes;
-- - pagamentos online;
-- - cobrança automática de assinaturas por gateway;
-- - campanhas.
--
-- A modelagem será revisada caso alguma dessas funcionalidades
-- seja aprovada futuramente.
-- ============================================================
-- ============================================================
-- IMPORTANTE
-- ============================================================
--
-- Este SQL é uma referência de modelagem.
--
-- A migration real ainda deverá implementar e testar:
--
-- - criação segura do perfil;
-- - salvamento e retomada das 6 etapas do Onboarding;
-- - validação dos campos obrigatórios ao concluir o Onboarding;
-- - persistência das formas de pagamento aceitas;
-- - imagens padrão das categorias sugeridas;
-- - categorias personalizadas iniciando sem imagem padrão;
-- - imagem personalizada de produto;
-- - fallback de imagem do produto pela categoria;
-- - remoção da imagem personalizada com escolha entre
--   voltar à imagem padrão ou permanecer sem imagem;
-- - proteção dos arquivos oficiais do sistema no Storage;
-- - BARBEIRO como tipo padrão;
-- - atribuição controlada de ADMIN;
-- - RLS e policies;
-- - rotas e funções administrativas;
-- - operações transacionais do PDV;
-- - concorrência de estoque;
-- - independência entre reposição e despesa manual relacionada;
-- - criação/pagamento de despesas recorrentes;
-- - geração mensal de ocorrências;
-- - cancelamento de vendas;
-- - leitura pública da Vitrine;
-- - geração segura de slug;
-- - upload e exclusão no Storage;
-- - exclusão/retenção de conta;
-- - índices e constraints definitivas.
--
-- ============================================================

-- ============================================================
-- COMPLEMENTO OFICIAL — PLANOS, ADMIN, RETENÇÃO E IA
-- Decisões aprovadas em 18/09/2026.
-- Este bloco continua sendo exemplo didático; policies e funções
-- transacionais devem ser entregues em migrations versionadas.
-- ============================================================

alter table public.barbearias
  add column codigo text not null unique,
  add column status_conta text not null default 'ATIVA',
  add column suspensa_em timestamptz null,
  add column motivo_suspensao text null,
  add constraint barbearias_codigo_formato_check
    check (codigo is null or codigo ~ '^EG-[2-9A-HJ-NP-Z]{6}$'),
  add constraint barbearias_status_conta_check
    check (status_conta in ('ATIVA', 'SUSPENSA')),
  add constraint barbearias_suspensao_check
    check (
      (status_conta = 'ATIVA' and suspensa_em is null)
      or
      (status_conta = 'SUSPENSA' and suspensa_em is not null)
    );

-- Em uma base já existente, fazer backfill antes de aplicar NOT NULL.
-- O código deve ser gerado no servidor e protegido contra UPDATE.

create table public.planos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique
    check (codigo in ('GRATIS', 'NORMAL', 'COM_IA')),
  nome text not null,
  preco_mensal numeric(12,2) not null check (preco_mensal >= 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.planos (codigo, nome, preco_mensal)
values
  ('GRATIS', 'Grátis', 0.00),
  ('NORMAL', 'Normal', 49.90),
  ('COM_IA', 'Com IA', 79.90)
on conflict (codigo) do update
set nome = excluded.nome,
    preco_mensal = excluded.preco_mensal,
    updated_at = now();

create table public.retencoes_contas_excluidas (
  id uuid primary key default gen_random_uuid(),
  codigo_barbearia text not null,
  nome_barbearia text not null,
  email_responsavel text not null,
  excluida_em timestamptz not null default now(),
  eliminar_em timestamptz not null,
  eliminada_em timestamptz null,
  created_at timestamptz not null default now(),
  constraint retencoes_prazo_check
    check (eliminar_em = excluida_em + interval '5 years')
);

create table public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  barbearia_id uuid not null unique
    references public.barbearias(id) on delete cascade,
  plano_atual_id uuid not null references public.planos(id),
  origem_periodo text not null default 'GRATIS'
    check (origem_periodo in ('GRATIS', 'PAGAMENTO', 'CORTESIA')),
  inicio_periodo timestamptz null,
  fim_periodo timestamptz null,
  dia_base smallint null check (dia_base between 1 and 31),
  proximo_plano_id uuid null references public.planos(id),
  mudanca_agendada_para timestamptz null,
  cancelamento_agendado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assinaturas_periodo_check
    check (
      (origem_periodo = 'GRATIS' and inicio_periodo is null and fim_periodo is null)
      or
      (origem_periodo <> 'GRATIS' and inicio_periodo is not null and fim_periodo > inicio_periodo)
    ),
  constraint assinaturas_mudanca_check
    check (
      (proximo_plano_id is null and mudanca_agendada_para is null)
      or
      (proximo_plano_id is not null and mudanca_agendada_para is not null)
    )
);

create table public.pagamentos_assinatura (
  id uuid primary key default gen_random_uuid(),
  barbearia_id uuid null
    references public.barbearias(id) on delete restrict,
  retencao_conta_excluida_id uuid null
    references public.retencoes_contas_excluidas(id) on delete cascade,
  plano_codigo_snapshot text not null,
  plano_nome_snapshot text not null,
  preco_oficial_snapshot numeric(12,2) not null check (preco_oficial_snapshot >= 0),
  valor_recebido numeric(12,2) not null check (valor_recebido >= 0),
  data_pagamento date not null,
  confirmado_em timestamptz not null default now(),
  confirmado_por uuid null references public.perfis(id) on delete set null,
  metodo text not null default 'PIX',
  status text not null default 'CONFIRMADO'
    check (status in ('CONFIRMADO', 'ESTORNADO')),
  identificador_transacao text null,
  created_at timestamptz not null default now(),
  constraint pagamentos_vinculo_check
    check (
      (barbearia_id is not null and retencao_conta_excluida_id is null)
      or
      (barbearia_id is null and retencao_conta_excluida_id is not null)
    )
);

create table public.historico_administrativo (
  id uuid primary key default gen_random_uuid(),
  barbearia_id uuid null
    references public.barbearias(id) on delete restrict,
  retencao_conta_excluida_id uuid null
    references public.retencoes_contas_excluidas(id) on delete cascade,
  ator_tipo text not null check (ator_tipo in ('BARBEIRO', 'ADMIN', 'SISTEMA')),
  ator_perfil_id uuid null references public.perfis(id) on delete set null,
  evento text not null,
  dados_anteriores jsonb null,
  dados_posteriores jsonb null,
  ocorrido_em timestamptz not null default now(),
  essencial_pos_exclusao boolean not null default false,
  constraint historico_vinculo_check
    check (
      (barbearia_id is not null and retencao_conta_excluida_id is null)
      or
      (barbearia_id is null and retencao_conta_excluida_id is not null)
    )
);

create table public.configuracoes_sistema (
  singleton boolean primary key default true check (singleton),
  manutencao_ativa boolean not null default false,
  motivo_codigo text null
    check (motivo_codigo is null or motivo_codigo in ('MELHORIAS', 'BUGS', 'SEGURANCA_PRIVACIDADE', 'OUTRO')),
  motivo_interno text null,
  mostrar_motivo boolean not null default false,
  mensagem_publica text null,
  previsao_retorno timestamptz null,
  atualizado_por uuid null references public.perfis(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.configuracoes_sistema (singleton)
values (true)
on conflict (singleton) do nothing;

create table public.codigos_reservados (
  id uuid primary key default gen_random_uuid(),
  codigo_legivel text null unique,
  codigo_fingerprint text not null unique,
  reservado_em timestamptz not null default now(),
  anonimizado_em timestamptz null
);

create table public.uso_ia_mensal (
  id uuid primary key default gen_random_uuid(),
  barbearia_id uuid not null
    references public.barbearias(id) on delete cascade,
  ciclo_inicio timestamptz not null,
  ciclo_fim timestamptz not null,
  respostas_usadas integer not null default 0 check (respostas_usadas >= 0),
  limite_base integer not null default 1000 check (limite_base > 0),
  extensao_admin integer not null default 0 check (extensao_admin >= 0),
  aviso_80_enviado_em timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (barbearia_id, ciclo_inicio),
  check (ciclo_fim > ciclo_inicio)
);

create table public.aceites_legais (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis(id) on delete cascade,
  documento text not null check (documento in ('TERMOS_USO', 'POLITICA_PRIVACIDADE')),
  versao text not null,
  aceito_em timestamptz not null default now(),
  unique (perfil_id, documento, versao)
);

create index idx_assinaturas_fim_periodo
  on public.assinaturas(fim_periodo);
create index idx_pagamentos_data_pagamento
  on public.pagamentos_assinatura(data_pagamento);
create index idx_historico_barbearia_ocorrido
  on public.historico_administrativo(barbearia_id, ocorrido_em desc);
create index idx_retencoes_eliminar_em
  on public.retencoes_contas_excluidas(eliminar_em)
  where eliminada_em is null;

alter table public.planos enable row level security;
alter table public.assinaturas enable row level security;
alter table public.pagamentos_assinatura enable row level security;
alter table public.historico_administrativo enable row level security;
alter table public.configuracoes_sistema enable row level security;
alter table public.codigos_reservados enable row level security;
alter table public.retencoes_contas_excluidas enable row level security;
alter table public.uso_ia_mensal enable row level security;
alter table public.aceites_legais enable row level security;

-- Não criar policy pública para pagamentos, histórico, retenções ou códigos.
-- A leitura pública da Vitrine continua sendo feita por contrato específico.
-- Conversas da IA não possuem tabela e não são persistidas.
-- ============================================================
