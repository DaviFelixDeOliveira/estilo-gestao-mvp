# Banco de Dados — Estilo & Gestão

> Documento de arquitetura e funcionamento do banco de dados do MVP.

## 1. Para que este documento existe

Este arquivo responde à pergunta:

> **Qual é o banco de dados do Estilo & Gestão e como ele funciona?**

Ele foi pensado para:

- novos desenvolvedores que entrarem no projeto;
- IAs usadas no desenvolvimento;
- apresentações técnicas;
- manutenção futura;
- consulta rápida sobre regras e relacionamentos.

Este documento não substitui as migrations SQL nem o `BANCO_EXEMPLO.sql`.

A função dele é explicar:

- tecnologias utilizadas;
- ambientes do banco;
- autenticação;
- isolamento entre barbearias;
- tabelas existentes;
- o que cada tabela guarda;
- relacionamentos principais;
- regras de negócio que afetam o banco;
- RLS;
- Storage;
- migrations;
- seeds;
- funcionamento da Vitrine, PDV, estoque, financeiro e planos.

Quando este documento falar em "campos documentados", significa os campos e conceitos já aprovados no projeto. A lista técnica definitiva de colunas, tipos, nulabilidade e constraints deve continuar sincronizada com as migrations e com o SQL de referência.

---

# 2. Tecnologias utilizadas

## 2.1 Banco principal

O banco oficial utiliza:

```text
PostgreSQL
```

hospedado através do:

```text
Supabase
```

## 2.2 Autenticação

A autenticação utiliza:

```text
Supabase Auth
```

O Supabase mantém internamente:

```text
auth.users
```

`auth.users` guarda informações como:

- identificador da conta;
- e-mail;
- autenticação;
- credenciais;
- sessão.

A aplicação não deve criar colunas próprias para:

- senha;
- hash de senha;
- token permanente de autenticação.

## 2.3 Arquivos e imagens

Os arquivos utilizam:

```text
Supabase Storage
```

O PostgreSQL guarda somente a referência ou caminho do arquivo.

Exemplo:

```text
PostgreSQL
└── portfolio.imagem_path

Supabase Storage
└── arquivo real
```

Esse princípio vale para:

- logo;
- capa;
- produtos;
- Portfólio.

Não armazenar imagens como Base64 ou BLOB no PostgreSQL sem necessidade.

## 2.4 Aplicação

A aplicação usa Next.js e a integração com Supabase.

O MVP não utiliza Prisma.

Operações críticas podem utilizar:

- código server-side;
- Route Handlers;
- funções SQL/RPC;
- transações do PostgreSQL.

Operações críticas não devem depender somente do navegador.

---

# 3. Os três ambientes do banco

O Estilo & Gestão utiliza **três ambientes separados do mesmo banco**:

```text
DEV
STAGING
PROD
```

Os três devem utilizar PostgreSQL + Supabase e seguir o mesmo schema aprovado.

Eles não são três modelos de banco diferentes.

São três ambientes com finalidades diferentes.

## 3.1 DEV

Ambiente de desenvolvimento.

Utilizado enquanto o sistema está sendo construído.

Pode conter:

- barbearias fictícias;
- contas de teste;
- serviços fictícios;
- produtos fictícios;
- vendas fictícias;
- despesas fictícias;
- dados que podem ser apagados.

Pode ser resetado quando necessário.

As novas migrations devem ser testadas primeiro no DEV.

## 3.2 STAGING

Ambiente de homologação e testes finais.

É usado antes de uma versão chegar ao ambiente oficial.

Deve possuir:

- o mesmo schema esperado para produção;
- dados falsos, porém realistas;
- testes de fluxos completos;
- RLS equivalente à produção.

STAGING não deve utilizar dados reais de clientes de produção.

## 3.3 PROD

Ambiente oficial.

Guarda os dados reais dos clientes quando o sistema estiver publicado.

Não deve receber:

- seeds de demonstração;
- testes destrutivos;
- registros fictícios de desenvolvimento;
- alterações estruturais improvisadas.

Mudanças estruturais devem chegar por migrations revisadas.

## 3.4 Regra de sincronização

O schema não deve ser mantido manualmente três vezes.

Fluxo:

```text
Migration
   ↓
DEV
   ↓
STAGING
   ↓
PROD
```

Cada ambiente utiliza seu próprio projeto Supabase e suas próprias variáveis de ambiente.

Não criar tabelas `dev_*`, `staging_*` ou `prod_*` dentro de um único banco de produção.

---

# 4. Visão geral da arquitetura

## 4.1 Usuário e barbearia

Fluxo principal:

```text
auth.users
   ↓
perfis
   ↓
barbearias
```

No MVP:

```text
1 BARBEIRO
   ↓
1 BARBEARIA
```

Não existe equipe com vários barbeiros utilizando a mesma barbearia nesta versão.

## 4.2 Tipos de usuário

Existem:

```text
BARBEIRO
ADMIN
```

### BARBEIRO

É o usuário comum da plataforma.

Deve possuir uma barbearia vinculada.

### ADMIN

Representa o Operador do SaaS.

Não precisa possuir barbearia.

O cadastro público sempre cria:

```text
tipo = BARBEIRO
```

O usuário não pode transformar a própria conta em `ADMIN` pelo frontend.

## 4.3 Tenant

Cada barbearia representa um tenant.

A maior parte dos dados operacionais possui:

```text
barbearia_id
```

Exemplo:

```text
Barbearia A
├── serviços
├── produtos
├── vendas
└── despesas

Barbearia B
├── serviços
├── produtos
├── vendas
└── despesas
```

A Barbearia A não pode acessar os dados privados da Barbearia B.

---

# 5. Quantidade de tabelas

O MVP possui atualmente **24 tabelas próprias da aplicação**.

Além delas existe `auth.users`, mantida pelo Supabase Auth.

## 5.1 Tabelas operacionais — 16

```text
barbearias
perfis
servicos
categorias_produto
produtos
vendas
venda_itens
venda_contadores
venda_pagamentos
despesas
despesas_recorrentes
ocorrencias_despesas_recorrentes
movimentacoes_estoque
portfolio
horarios_funcionamento
barbearia_formas_pagamento
```

## 5.2 Tabelas comerciais e administrativas — 8

```text
planos
assinaturas
pagamentos_assinatura
historico_administrativo
configuracoes_sistema
codigos_reservados
retencoes_contas_excluidas
aceites_legais
```

Total:

```text
16 + 8 = 24 tabelas próprias
```

---
# 6. Mapa simplificado dos relacionamentos

```text
auth.users
   |
   v
perfis
   |
   +-- ADMIN
   |   \-- Painel Administrativo
   |
   \-- BARBEIRO
       |
       v
    barbearias
       |
       +-- servicos
       +-- categorias_produto
       |   \-- produtos
       +-- vendas
       |   +-- venda_itens
       |   \-- venda_pagamentos
       +-- venda_contadores
       +-- despesas
       +-- despesas_recorrentes
       |   \-- ocorrencias_despesas_recorrentes
       +-- movimentacoes_estoque
       +-- portfolio
       +-- horarios_funcionamento
       +-- barbearia_formas_pagamento
       \-- assinaturas
           \-- planos

Administração do SaaS
+-- pagamentos_assinatura
+-- historico_administrativo
+-- configuracoes_sistema
+-- codigos_reservados
+-- retencoes_contas_excluidas
\-- aceites_legais
```

`venda_contadores` pertence diretamente à barbearia e controla a numeração sequencial das vendas daquele tenant.

`venda_pagamentos` pertence a uma venda e permite registrar um ou mais meios de pagamento para a mesma venda.

---
# 7. Catálogo das tabelas

A quantidade mostrada em cada tabela abaixo representa os **campos de negócio documentados atualmente**.

Campos puramente técnicos, como timestamps adicionais, podem existir na migration definitiva mesmo quando não forem detalhados aqui.

---

## 7.1 `barbearias`

### Função

Guarda as informações principais de cada estabelecimento.

Também concentra configurações simples usadas pela Vitrine Digital.

### Campos documentados principais

| Campo | O que guarda |
|---|---|
| `id` | Identificador interno da barbearia. |
| `codigo` | Código único e imutável no formato `BAR-XXXXXX`. |
| `nome_marca` | Nome comercial da barbearia. |
| `nome_profissional` | Nome profissional opcional do barbeiro. |
| `descricao_publica` | Texto curto apresentado publicamente. |
| `whatsapp` | Número usado para contato público. |
| `instagram_url` | Usuário ou referência do Instagram. |
| `tem_numero` | Informa se o endereço possui número. |
| `numero_endereco` | Número do endereço quando existir. |
| `atende_domicilio` | Informa se a barbearia realiza atendimento externo. |
| `slug` | Identificador da URL pública da Vitrine. |
| `vitrine_publicada` | Define se a Vitrine está publicada. |
| `produto_sem_estoque_vitrine` | Define como produtos sem estoque aparecem na Vitrine. |
| `logo_path` | Caminho da logo no Storage. |
| `capa_path` | Caminho da foto de capa no Storage. |
| `status_conta` | Estado da conta: `ATIVA` ou `SUSPENSA`. |
| `motivo_suspensao` | Motivo da suspensão quando aplicável. |
| `data_suspensao` | Data/hora da suspensão quando aplicável. |

**Campos de negócio documentados:** 18 principais.

O endereço possui outros dados civis necessários, como rua, bairro, cidade, estado e CEP. A decomposição técnica definitiva desses campos deve permanecer sincronizada com o SQL/migrations.

### Regras importantes

A descrição pública utiliza no banco:

```text
TEXT
```

No MVP, a aplicação limita o conteúdo a:

```text
200 caracteres
```

Esse limite fica na regra da aplicação, não em um `VARCHAR(200)` obrigatório.

A Vitrine Digital utiliza os mesmos dados da barbearia.

Não criar uma segunda cópia de:

- nome;
- nome profissional;
- descrição;
- WhatsApp;
- Instagram;
- logo;
- capa;
- atendimento a domicílio.

### Slug

Exemplo:

```text
barbearia-imperial-a7k9
```

O slug:

- é único;
- usa letras minúsculas;
- pode usar números;
- pode usar hífens;
- não deve ter espaços ou acentos;
- evita palavras reservadas.

Depois de criado, mudar o nome da barbearia não altera automaticamente o slug.

Ao despublicar a Vitrine, o slug continua salvo.

---

## 7.2 `perfis`

### Função

Representa o usuário dentro das regras do Estilo & Gestão.

A autenticação continua em `auth.users`.

### Campos documentados

| Campo | O que guarda |
|---|---|
| `user_id` | Referência para `auth.users`. |
| `barbearia_id` | Barbearia vinculada ao BARBEIRO. Pode ser nulo para ADMIN. |
| `nome` | Nome do usuário. |
| `tipo` | `BARBEIRO` ou `ADMIN`. |
| `tema` | `CLARO`, `ESCURO` ou `SISTEMA`. |
| `onboarding_etapa` | Última etapa salva do Onboarding. |
| `onboarding_concluido` | Informa se o Onboarding foi concluído. |
| `created_at` | Data de criação. |
| `updated_at` | Data de atualização. |

**Campos documentados:** 9.

### Regras

Cadastro público:

```text
tipo = BARBEIRO
```

BARBEIRO:

```text
barbearia_id obrigatório
```

ADMIN:

```text
barbearia_id pode ser nulo
```

O tema pertence ao usuário, não à barbearia.

---

## 7.3 `servicos`

### Função

Guarda os serviços oferecidos pela barbearia.

### Campos documentados principais

| Campo | O que guarda |
|---|---|
| `id` | Identificador do serviço. |
| `barbearia_id` | Barbearia proprietária. |
| `nome` | Nome do serviço. |
| `descricao` | Descrição opcional. |
| `preco` | Preço cobrado. |
| `custo_estimado` | Estimativa de materiais consumidos no atendimento. |
| `ativo` | Define se pode ser usado em novas vendas. |
| `visivel_vitrine` | Define se aparece na Vitrine. |

**Campos de negócio documentados:** 8 principais.

### Regra entre ativo e Vitrine

```text
ativo = true
visivel_vitrine = true
```

Pode ser usado no PDV e exibido publicamente.

```text
ativo = true
visivel_vitrine = false
```

Pode ser usado no PDV, mas não aparece publicamente.

```text
ativo = false
```

Não entra em novas vendas e não aparece na Vitrine.

O histórico antigo continua preservado.

---

## 7.4 `categorias_produto`

### Função

Organiza os produtos por categoria.

Categorias pertencem à barbearia.

### Campos documentados

| Campo | O que guarda |
|---|---|
| `id` | Identificador da categoria. |
| `barbearia_id` | Barbearia proprietária. |
| `nome` | Nome da categoria. |
| `ativo` | Estado atual da categoria. |
| `imagem_padrao_path` | Caminho opcional de uma imagem padrão oficial do sistema. |

**Campos de negócio documentados:** 5.

### Categorias sugeridas

Exemplos:

```text
Bebida
Pomada
Shampoo
Cera
Óleo/Balm para barba
Acessórios
Outros
```

Uma sugestão só precisa virar registro quando realmente utilizada.

Imagens padrão podem apontar para arquivos compartilhados como:

```text
sistema/categorias/pomada.webp
```

Esses arquivos pertencem ao Estilo & Gestão, não à barbearia.

### Categoria personalizada

Categoria criada manualmente começa com:

```text
imagem_padrao_path = null
```

Não criar tabela separada para categoria padrão e personalizada.

---

## 7.5 `produtos`

### Função

Guarda produtos físicos vendidos e controlados em estoque.

### Campos documentados principais

| Campo | O que guarda |
|---|---|
| `id` | Identificador do produto. |
| `barbearia_id` | Barbearia proprietária. |
| `categoria_id` | Categoria do produto. |
| `nome` | Nome do produto. |
| `descricao` | Descrição do produto quando existir. |
| `preco_venda` | Preço de venda atual. |
| `estoque_atual` | Saldo atual disponível. |
| `estoque_minimo` | Limite opcional para alerta de estoque baixo. |
| `ativo` | Define se o produto pode ser usado em novas vendas. |
| `visivel_vitrine` | Define se aparece na Vitrine. |
| `imagem_path` | Imagem personalizada do produto no Storage. |
| `usar_imagem_categoria` | Permite usar a imagem padrão da categoria como fallback. |

**Campos de negócio documentados:** 12 principais.

O modelo também precisa preservar o custo atual necessário às operações de estoque e aos snapshots. O nome técnico definitivo desse campo deve seguir o SQL/migration oficial.

### Prioridade de imagem

```text
1. imagem personalizada do produto
2. imagem padrão da categoria, quando habilitada
3. placeholder neutro
```

Se o barbeiro remover a imagem personalizada, pode escolher:

```text
usar imagem da categoria
```

ou:

```text
ficar sem imagem
```

Não copiar a imagem da categoria fisicamente para o produto.

### Estoque mínimo

Quando:

```text
estoque_atual <= estoque_minimo
```

o produto está com estoque baixo.

Se:

```text
estoque_minimo = null
```

não existe alerta de mínimo.

---

## 7.6 `vendas`

### Função

Guarda vendas efetivamente finalizadas.

Uma comanda ainda em edição não existe nesta tabela.

### Campos

| Campo | O que guarda |
|---|---|
| `id` | Identificador da venda. |
| `barbearia_id` | Barbearia responsável pela venda. |
| `status` | Estado da venda: `CONCLUIDA` ou `CANCELADA`. |
| `total_bruto` | Soma dos itens antes do desconto. |
| `total_custo_snapshot` | Custo total preservado no momento da venda. |
| `resultado_estimado_snapshot` | Resultado estimado preservado historicamente. |
| `observacao` | Observação opcional da venda, limitada a 200 caracteres. |
| `created_at` | Momento em que o registro foi criado no banco. |
| `canceled_at` | Momento do cancelamento. Fica nulo enquanto a venda não estiver cancelada. |
| `ocorrida_em` | Data e hora em que a venda aconteceu para fins de negócio e relatórios. |
| `numero_venda` | Número sequencial da venda dentro da própria barbearia. |
| `desconto_tipo` | Tipo do desconto: `VALOR`, `PERCENTUAL` ou nulo quando não existe desconto. |
| `desconto_valor_informado` | Valor ou percentual informado pelo usuário. |
| `desconto_total_snapshot` | Valor monetário final do desconto preservado na venda. |
| `total_liquido` | Total final após o desconto. |

**Campos documentados:** 15.

### Número da venda

O número da venda é único dentro de cada barbearia.

Exemplo:

```text
Barbearia A
Venda 1
Venda 2
Venda 3

Barbearia B
Venda 1
Venda 2
```

A tabela `venda_contadores` auxilia no controle desse número.

### Desconto

O banco preserva:

```text
tipo informado
valor informado
valor monetário final aplicado
```

Isso permite manter o histórico mesmo quando o desconto foi percentual.

O banco também garante:

```text
total_liquido = total_bruto - desconto_total_snapshot
```

### Pagamentos

A forma de pagamento não fica mais diretamente na tabela `vendas`.

Os pagamentos pertencem à tabela:

```text
venda_pagamentos
```

Isso permite registrar pagamento único ou pagamento dividido entre mais de uma forma.

---
## 7.7 `venda_itens`

### Função

Guarda os itens que formam uma venda.

### Campos documentados principais

| Campo | O que guarda |
|---|---|
| `id` | Identificador do item. |
| `venda_id` | Venda à qual pertence. |
| `tipo` | Informa se o item veio de serviço ou produto. |
| `servico_id` / `produto_id` | Referência para o cadastro original quando aplicável. |
| `nome_snapshot` | Nome preservado no momento da venda. |
| `quantidade` | Quantidade vendida. |
| `preco_unitario_snapshot` | Preço usado na venda. |
| `custo_snapshot` | Custo considerado no momento da venda. |
| `subtotal` | Total daquele item. |
| `resultado_estimado` | Resultado estimado preservado historicamente. |

**Campos de negócio documentados:** 10 principais.

### Snapshot

Se um Corte custa R$ 40 hoje e depois passa para R$ 50, a venda antiga continua mostrando R$ 40.

O snapshot responde:

```text
O que foi vendido e por qual valor?
```

O ID responde:

```text
Qual cadastro originou esse item?
```

### Quantidade de serviço

Serviços usam:

```text
quantidade = 1
```

Produtos podem usar quantidade maior conforme estoque.

---

## 7.8 `venda_contadores`

### Função

Controla a numeração sequencial das vendas de cada barbearia.

Ela é uma tabela de apoio do PDV e não representa uma venda.

### Campos

| Campo | O que guarda |
|---|---|
| `barbearia_id` | Barbearia à qual o contador pertence. Também é a chave primária da tabela. |
| `ultimo_numero` | Último número de venda utilizado pela barbearia. Começa em `0`. |

**Campos documentados:** 2.

### Regra principal

Cada barbearia possui seu próprio contador.

```text
Barbearia A → ultimo_numero = 153
Barbearia B → ultimo_numero = 27
```

O banco não usa uma sequência global compartilhada entre todas as barbearias.

`ultimo_numero` nunca pode ser negativo.

---

## 7.9 `venda_pagamentos`

### Função

Guarda as formas de pagamento e os valores associados a uma venda.

Essa separação permite que uma venda tenha pagamento único ou pagamento dividido.

### Campos

| Campo | O que guarda |
|---|---|
| `id` | Identificador do pagamento. |
| `barbearia_id` | Barbearia proprietária da venda e do pagamento. |
| `venda_id` | Venda à qual o pagamento pertence. |
| `forma_pagamento` | Forma de pagamento utilizada. |
| `valor` | Valor pago naquela forma. Deve ser maior que zero. |
| `created_at` | Momento em que o registro de pagamento foi criado. |

**Campos documentados:** 6.

### Pagamento dividido

Exemplo:

```text
Venda: R$ 100

PIX      → R$ 60
DINHEIRO → R$ 40
```

Nesse caso existem dois registros em `venda_pagamentos`, ligados à mesma venda.

### Regras do banco

A mesma forma de pagamento não pode aparecer duas vezes na mesma venda.

Exemplo inválido:

```text
PIX → R$ 30
PIX → R$ 20
```

Nesse caso os valores devem formar um único registro:

```text
PIX → R$ 50
```

O relacionamento também garante que a venda e o pagamento pertençam à mesma barbearia.

---
## 7.10 `despesas`
### Função

Guarda saídas financeiras efetivamente realizadas.

### Campos documentados principais

| Campo | O que guarda |
|---|---|
| `id` | Identificador da despesa. |
| `barbearia_id` | Barbearia proprietária. |
| `nome` | Nome que explica o gasto. |
| `categoria` | Categoria financeira. |
| `valor` | Valor efetivamente gasto. |
| `data` | Data civil da despesa. |
| `origem` | `MANUAL` ou `DESPESA_RECORRENTE`. |
| `movimentacao_estoque_id` | Referência opcional a uma reposição para rastreabilidade. |
| `ocorrencia_recorrente_id` | Referência quando a despesa nasceu de uma ocorrência paga. |

**Campos de negócio documentados:** 9 principais.

### Categorias do MVP

```text
Aluguel
Água
Energia
Internet
Equipamentos
Materiais de consumo
Manutenção
Marketing
Impostos e taxas
Estoque
Outros
```

Não existem categorias personalizadas de despesa no MVP.

### Estoque e Financeiro

Reposição de estoque e despesa são registros independentes.

Registrar uma reposição:

```text
não cria despesa automaticamente
```

Se a compra também precisar aparecer no Financeiro, o barbeiro cadastra a despesa separadamente.

---

## 7.11 `despesas_recorrentes`
### Função

Guarda a configuração de despesas que se repetem.

Ela não representa uma saída de caixa já paga.

### Campos documentados

| Campo | O que guarda |
|---|---|
| `id` | Identificador da recorrência. |
| `barbearia_id` | Barbearia proprietária. |
| `nome` | Nome da despesa recorrente. |
| `categoria` | Categoria financeira. |
| `valor_previsto` | Valor esperado. |
| `frequencia` | No MVP: `MENSAL`. |
| `dia_vencimento` | Dia configurado, de 1 a 31. |
| `descricao` | Observação opcional. |
| `ativa` | Define se novas ocorrências devem continuar sendo geradas. |
| `created_at` | Criação da configuração. |
| `updated_at` | Última atualização. |

**Campos documentados:** 11.

Se o dia configurado não existir naquele mês, usar o último dia disponível.

---

## 7.12 `ocorrencias_despesas_recorrentes`
### Função

Representa cada ocorrência concreta gerada a partir de uma despesa recorrente.

### Campos documentados principais

| Campo | O que guarda |
|---|---|
| `id` | Identificador da ocorrência. |
| `despesa_recorrente_id` | Configuração que originou a ocorrência. |
| `barbearia_id` | Barbearia proprietária. |
| `status` | `PENDENTE`, `PAGA` ou `IGNORADA`. |
| `valor_previsto` | Valor esperado naquele período. |
| `valor_pago` | Valor realmente pago quando aplicável. |
| `vencimento` | Data de vencimento. |
| `data_pagamento` | Data efetiva de pagamento. |
| `despesa_id` | Despesa efetiva criada quando a ocorrência é paga. |

**Campos de negócio documentados:** 9 principais.

### PENDENTE

É somente previsão.

Não entra como saída efetiva.

### PAGA

Gera a saída correspondente em `despesas`.

### IGNORADA

Permanece no histórico, mas não gera saída e não encerra a recorrência.

Editar a recorrência afeta o futuro, não reescreve ocorrências históricas.

---

## 7.13 `movimentacoes_estoque`
### Função

Guarda o histórico de alterações de estoque.

### Campos documentados principais

| Campo | O que guarda |
|---|---|
| `id` | Identificador da movimentação. |
| `barbearia_id` | Barbearia proprietária. |
| `produto_id` | Produto alterado. |
| `tipo` | Motivo técnico da movimentação. |
| `quantidade_delta` | Diferença positiva ou negativa. |
| `saldo_anterior` | Estoque antes da alteração. |
| `saldo_posterior` | Estoque depois da alteração. |
| `data_hora` | Momento da movimentação. |
| `motivo` | Explicação adicional quando necessária. |
| `venda_id` | Venda relacionada quando aplicável. |
| `custo_snapshot` | Custo histórico relevante para perda/reposição. |
| `valor_total_snapshot` | Valor histórico total quando aplicável. |

**Campos de negócio documentados:** 12 principais.

### Tipos

```text
REPOSICAO
VENDA
AJUSTE
PERDA
REVERSAO_VENDA
```

### Exemplo

```text
estoque anterior = 10
venda = 2
quantidade_delta = -2
saldo posterior = 8
```

### Perda

Uma perda reduz estoque e preserva o custo daquele momento.

Ela representa prejuízo de estoque, mas não cria uma segunda saída de caixa.

---

## 7.14 `portfolio`
### Função

Guarda os metadados das fotos apresentadas no Portfólio da Vitrine.

O arquivo real fica no Supabase Storage.

### Campos aprovados

| Campo | O que guarda |
|---|---|
| `id` | Identificador da foto. |
| `barbearia_id` | Barbearia proprietária. |
| `imagem_path` | Caminho da imagem no Storage. |
| `titulo` | Título opcional. |
| `descricao` | Descrição opcional. |
| `ordem` | Posição da imagem no Portfólio. |
| `visivel_vitrine` | Define se a foto aparece publicamente. |
| `created_at` | Data original de criação. |
| `updated_at` | Última atualização. |

**Campos documentados:** 9.

### Não existem no MVP

```text
categoria
serviço relacionado
foto destaque
```

### Limites por plano

```text
GRATIS = 5 fotos
NORMAL = 10 fotos
```

Esses limites pertencem ao verificador central de recursos da aplicação.

Não criar:

```text
barbearias.limite_portfolio
```

### Downgrade

Exemplo:

```text
NORMAL
10 fotos

↓ downgrade

GRATIS
limite 5
```

O sistema não apaga nem oculta automaticamente as fotos excedentes.

Enquanto o total estiver acima do limite:

Permitido:

- visualizar;
- ampliar;
- excluir.

Bloqueado:

- adicionar;
- editar;
- trocar imagem;
- alterar título;
- alterar descrição.

Fotos ocultas também contam para o limite.

---

## 7.15 `horarios_funcionamento`
### Função

Guarda os horários públicos de funcionamento.

Não representa agenda.

### Campos documentados principais

| Campo | O que guarda |
|---|---|
| `id` | Identificador do registro. |
| `barbearia_id` | Barbearia proprietária. |
| `dia_semana` | Dia da semana, entre 0 e 6. |
| `fechado` | Informa se a barbearia não abre naquele dia. |
| `abertura_1` | Início do primeiro intervalo. |
| `fechamento_1` | Fim do primeiro intervalo. |
| `abertura_2` | Início opcional do segundo intervalo. |
| `fechamento_2` | Fim opcional do segundo intervalo. |

**Campos de negócio documentados:** 8 principais.

### Regras

Se o dia estiver aberto:

- primeiro intervalo obrigatório;
- segundo intervalo opcional;
- abertura anterior ao fechamento;
- intervalos não podem se sobrepor.

Exemplo válido:

```text
08:00–12:00
14:00–18:00
```

Dia fechado não deve manter intervalos ativos.

---

## 7.16 `barbearia_formas_pagamento`
### Função

Registra as formas de pagamento que a barbearia informa aceitar normalmente.

### Campos documentados

| Campo | O que guarda |
|---|---|
| `barbearia_id` | Barbearia proprietária. |
| `forma_pagamento` | Forma aceita. |

**Campos de negócio documentados:** 2.

Valores:

```text
PIX
DINHEIRO
DEBITO
CREDITO
OUTRO
```

A combinação entre barbearia e forma deve ser única.

Não criar colunas separadas como:

```text
aceita_pix
aceita_dinheiro
aceita_debito
aceita_credito
```

---

## 7.17 `planos`
### Função

Catálogo comercial dos planos do Estilo & Gestão.

### Campos mínimos aprovados

| Campo | O que guarda |
|---|---|
| `id` | Identificador do plano. |
| `codigo` | `GRATIS` ou `NORMAL`. |
| `nome` | Nome apresentado comercialmente. |
| `preco_mensal` | Preço mensal atual. |
| `ativo` | Define se o plano está comercialmente disponível. |
| `created_at` | Data de criação. |
| `updated_at` | Data de atualização. |

**Campos documentados:** 7.

Valores atuais:

```text
GRATIS = R$ 0,00
NORMAL = R$ 49,90
```

As permissões não ficam duplicadas em dezenas de colunas nesta tabela.

O código da aplicação possui um verificador central de recursos.

Exemplo conhecido:

```text
portfolioPhotos
GRATIS = 5
NORMAL = 10
```

---

## 7.18 `assinaturas`
### Função

Guarda o estado comercial atual do plano de cada barbearia.

Existe um registro atual por barbearia, inclusive para o plano Grátis.

### Campos mínimos aprovados

| Campo | O que guarda |
|---|---|
| `barbearia_id` | Barbearia da assinatura. Deve ser único. |
| `plano_atual_id` | Plano registrado atualmente. |
| `inicio_periodo` | Início do período pago ou cortesia. |
| `fim_periodo` | Fim do período pago ou cortesia. |
| `dia_base` | Dia de referência usado pelo fluxo comercial. |
| `origem_periodo` | `GRATIS`, `PAGAMENTO` ou `CORTESIA`. |
| `proximo_plano_id` | Plano futuro quando houver mudança agendada. |
| `mudanca_agendada_para` | Data da mudança programada. |
| `cancelamento_agendado` | Informa se existe cancelamento/downgrade programado. |
| `created_at` | Criação do registro. |
| `updated_at` | Última atualização. |

**Campos documentados:** 11.

### Regra de validade

O plano efetivo deve considerar a validade do período.

Período encerrado equivale ao Grátis quando não houver novo pagamento ou cortesia válida.

### Importante

A existência desta tabela não significa que o MVP já possui cobrança automática de cartão.

O MVP possui controle de assinatura/plano.

O MVP não exige inicialmente:

- cobrança automática mensal;
- tentativa automática de pagamento;
- integração recorrente completa com gateway.

---

## 7.19 `pagamentos_assinatura`
### Função

Guarda cada pagamento real relacionado ao plano.

É um histórico financeiro/comercial.

### Campos mínimos documentados

| Campo | O que guarda |
|---|---|
| `barbearia_id` / referência de retenção | Conta à qual o pagamento pertence. |
| `plano_id` | Plano adquirido. |
| `plano_nome_snapshot` | Nome do plano no momento do pagamento. |
| `preco_oficial_snapshot` | Preço oficial do plano naquele momento. |
| `valor_recebido` | Valor realmente recebido. |
| `data_pagamento` | Data real do pagamento. |
| `confirmado_em` | Data/hora da confirmação. |
| `admin_id` | ADMIN que confirmou quando aplicável. |
| `metodo_pagamento` | Meio usado no pagamento. |
| `status` | Estado do pagamento. |
| `identificador_externo` | Referência externa quando existir. |

**Campos de negócio documentados:** 11 principais.

Cortesia não gera pagamento.

---

## 7.20 `historico_administrativo`
### Função

Registra eventos administrativos importantes e permanentes.

### Campos documentados principais

| Campo | O que guarda |
|---|---|
| `ator` | `BARBEIRO`, `ADMIN` ou `SISTEMA`. |
| `data_hora` | Momento do evento. |
| `tipo_evento` | Tipo da ação administrativa. |
| `estado_anterior` | Snapshot JSON controlado do estado anterior quando necessário. |
| `estado_posterior` | Snapshot JSON controlado do estado posterior quando necessário. |

**Campos de negócio explicitamente documentados:** 5 principais.

Eventos possíveis incluem:

- mudança de plano;
- confirmação de pagamento;
- cortesia;
- suspensão;
- reativação;
- manutenção excepcional;
- exclusão administrativa.

O vínculo técnico com a entidade afetada deve ser definido no SQL/migration oficial.

Esse histórico não concede ao ADMIN acesso aos dados operacionais privados da barbearia.

---

## 7.21 `configuracoes_sistema`
### Função

Guarda configurações globais do SaaS.

É pensada como um registro único do sistema.

### Campos documentados

| Campo | O que guarda |
|---|---|
| `manutencao_ativa` | Informa se o sistema está em manutenção. |
| `motivo_interno` | Motivo administrativo da manutenção. |
| `mensagem_publica` | Texto opcional mostrado aos usuários. |
| `exibir_motivo` | Define se o motivo deve ser mostrado. |
| `previsao_retorno` | Previsão opcional de retorno. |
| `admin_responsavel` | ADMIN que realizou a alteração. |

**Campos de negócio documentados:** 6.

Motivos de interface podem incluir:

```text
Melhorias no sistema
Correção de bugs
Privacidade corrompida
Outro
```

A previsão pode ser informada ou ficar como tempo indeterminado.

---

## 7.22 `codigos_reservados`
### Função

Impede reutilização do código público de uma barbearia.

Formato:

```text
BAR-XXXXXX
```

### Dados conceituais documentados

Durante a existência da conta ou retenção:

- código legível pode permanecer reservado.

Depois da eliminação final:

- manter somente uma impressão criptográfica não reversível suficiente para rejeitar nova geração igual.

A estrutura exata das colunas ainda deve ser refletida pelo SQL/migration oficial.

Não transformar esse registro em uma forma de restaurar a conta excluída.

---

## 7.23 `retencoes_contas_excluidas`
### Função

Guarda somente os dados mínimos permitidos após exclusão de uma conta.

Não contém dados operacionais restauráveis.

### Campos mínimos aprovados

| Campo | O que guarda |
|---|---|
| `id` | Identificador próprio da retenção. |
| `codigo` | Código retido da conta. |
| `nome` | Nome mínimo retido. |
| `email` | E-mail mínimo retido. |
| `data_exclusao` | Quando a conta foi excluída. |
| `data_eliminacao_programada` | Data planejada para eliminação da retenção. |
| `data_eliminacao_efetiva` | Quando a retenção foi efetivamente eliminada. |

**Campos documentados:** 7.

A regra atual documentada prevê eliminação programada cinco anos depois.

Pagamentos e ações essenciais podem apontar para a retenção após a exclusão.

---

## 7.24 `aceites_legais`
### Função

Registra o aceite de documentos legais.

### Campos documentados

| Campo | O que guarda |
|---|---|
| `perfil_id` | Usuário que realizou o aceite. |
| `tipo_documento` | Termos de Uso ou Política de Privacidade. |
| `versao` | Versão aceita. |
| `aceito_em` | Data/hora do aceite. |

**Campos de negócio documentados:** 4.

Essa tabela não deve ser usada como justificativa automática para conservar dados além das regras jurídicas aprovadas.

---

# 8. Onboarding

O Onboarding possui seis etapas:

```text
1. Dados da barbearia
2. Endereço
3. Horários de funcionamento
4. Serviços
5. Produtos e formas de pagamento
6. Aparência e conclusão
```

O progresso fica no perfil.

Fluxo:

```text
Login
  ↓
Onboarding concluído?
  ↓ não
Retomar etapa salva
```

A etapa 6 salva a preferência de tema.

Ao concluir:

```text
onboarding_concluido = true
```

---

## 8.1 Dados da barbearia após o Onboarding

Depois que o Onboarding é concluído, os dados principais da barbearia podem ser alterados pela RPC:

```text
update_barbershop_profile(...)
```

Ela permite alterar somente:

- `nome_marca`;
- `nome_profissional`;
- `whatsapp`;
- `instagram_url`;
- `descricao_publica`;
- `logo_path`;
- `capa_path`;
- `atende_domicilio`.

Regras principais:

- somente usuário autenticado do tipo `BARBEIRO`;
- exige `onboarding_concluido = true`;
- identifica a barbearia pelo perfil do usuário autenticado;
- não recebe `barbearia_id` informado pelo cliente;
- `nome_marca` é obrigatório e aceita no máximo 100 caracteres;
- `nome_profissional` aceita no máximo 100 caracteres;
- `whatsapp` deve usar o formato brasileiro com `+55` e DDD;
- `descricao_publica` aceita no máximo 200 caracteres;
- `logo_path`, quando informado, deve ficar em `barbearias/{barbearia_id}/logo/`;
- `capa_path`, quando informado, deve ficar em `barbearias/{barbearia_id}/capa/`.

A tabela `barbearias` não possui policy comum de `UPDATE` para o BARBEIRO.

A edição pós-Onboarding acontece por essa RPC com `SECURITY DEFINER`, mantendo o `UPDATE` direto bloqueado pelo RLS.

A RPC não permite alterar campos administrativos ou de publicação, como:

- `codigo`;
- `slug`;
- `vitrine_publicada`;
- `status_conta`;
- outros campos internos não listados na assinatura da função.

---


## 8.2 Endereço da barbearia após o Onboarding

Depois que o Onboarding é concluído, o endereço da barbearia pode ser alterado pela RPC:

```text
update_barbershop_address(...)
```

Ela permite alterar somente os campos de endereço da tabela `barbearias`:

- `cep`;
- `logradouro`;
- `tem_numero`;
- `numero_endereco`;
- `complemento`;
- `bairro`;
- `cidade`;
- `uf`.

Regras principais:

- somente usuário autenticado do tipo `BARBEIRO`;
- exige `onboarding_concluido = true`;
- identifica a barbearia pelo perfil do usuário autenticado;
- não recebe `barbearia_id` informado pelo cliente;
- aceita CEP com ou sem máscara, mas salva apenas os 8 dígitos;
- `logradouro`, `bairro`, `cidade` e `uf` são obrigatórios;
- `uf` é salva em maiúsculo;
- se `tem_numero = true`, `numero_endereco` é obrigatório;
- se `tem_numero = false`, `numero_endereco` é salvo como `null`;
- não salva `S/N`; quando o endereço não possui número, deve ser usado `tem_numero = false`.

A tabela `barbearias` não possui policy comum de `UPDATE` para o BARBEIRO.

A edição pós-Onboarding do endereço acontece por essa RPC com `SECURITY DEFINER`, mantendo o `UPDATE` direto bloqueado pelo RLS.

Essa RPC não altera dados administrativos ou de publicação, como:

- `codigo`;
- `slug`;
- `vitrine_publicada`;
- `status_conta`;
- `motivo_suspensao`;
- `suspensa_em`;
- `nome_marca`;
- `whatsapp`;
- `instagram_url`;
- `logo_path`;
- `capa_path`.

# 9. Vitrine Digital
A Vitrine não possui tabela própria no MVP.

Ela é montada com dados já existentes em:

```text
barbearias
servicos
produtos
portfolio
horarios_funcionamento
barbearia_formas_pagamento
```

## 9.1 Contrato público

Visitantes não podem receber `SELECT *` de tabelas administrativas.

A leitura pública deve usar uma allowlist.

Pode ser implementada com:

- view segura;
- função SQL/RPC;
- Route Handler;
- consulta server-side com colunas explícitas.

## 9.2 Produto público

Pode conter:

- nome;
- descrição;
- categoria;
- preço de venda;
- imagem efetiva;
- disponibilidade pública.

Não deve conter:

- preço de custo;
- estoque mínimo;
- estoque numérico;
- movimentações;
- informações financeiras.

## 9.3 Serviço público

Pode conter:

- nome;
- descrição;
- preço.

Não pode expor custo estimado.

## 9.4 Dados públicos da barbearia

Podem incluir:

- nome;
- nome profissional;
- descrição;
- logo;
- capa;
- WhatsApp;
- Instagram;
- endereço;
- horários;
- atendimento a domicílio;
- formas de pagamento.

## 9.5 Informações que não viram campos no MVP

Não criar campos específicos para afirmações de protótipo como:

- Wi-Fi;
- café;
- ambiente climatizado;
- atendimento personalizado;
- pontualidade.

Essas informações não fazem parte da modelagem aprovada.

---

# 10. Estoque

`produtos.estoque_atual` mantém o saldo atual para consulta rápida.

O histórico fica em `movimentacoes_estoque`.

Após o cadastro inicial, o estoque não deve ser alterado livremente pela tela normal do produto.

As alterações acontecem por movimentos específicos.

## 10.1 Reposição

Exemplo:

```text
estoque anterior = 8
entrada = 10
estoque posterior = 18
tipo = REPOSICAO
```

Uma reposição pode receber quantidade e custo unitário.

Exemplo:

```text
10 unidades × R$ 15,00
= R$ 150,00
```

A movimentação de estoque não cria uma despesa automaticamente.

## 10.2 Venda

Venda reduz o estoque.

## 10.3 Perda

Perda reduz o estoque e preserva o custo histórico daquele momento.

Exemplo:

```text
custo = R$ 20,00
quantidade perdida = 2
valor histórico da perda = R$ 40,00
```

A perda representa prejuízo de estoque.

Ela não cria uma nova saída de caixa se a compra já foi paga anteriormente.

## 10.4 Ajuste

Serve para corrigir diferença entre o saldo registrado e a quantidade física correta.

Deve guardar motivo.

Não deve substituir reposição ou perda conhecida.

## 10.5 Cancelamento

Quando uma venda é cancelada, produtos retornam ao estoque por:

```text
REVERSAO_VENDA
```

---

# 11. PDV e transações

Uma comanda em edição fica no frontend.

Ela só entra em `vendas` quando for finalizada.

Fluxo:

```text
Comanda
   ↓
Finalizar
   ↓
Backend valida
   ↓
Venda + itens + estoque
```

A finalização precisa ser atômica.

Exemplo conceitual:

```text
BEGIN

validar venda
validar estoque
criar venda
criar itens
atualizar estoque
criar movimentações

COMMIT
```

Se algo falhar:

```text
ROLLBACK
```

Não pode acontecer:

```text
venda criada
+
itens criados
+
estoque não baixado
```

## 11.1 Concorrência

Se existe uma unidade em estoque, duas requisições simultâneas não podem vender a mesma última unidade.

O estoque não pode ficar negativo por concorrência.

---

# 12. Financeiro

## 12.1 Despesas reais

`despesas` representa saídas efetivamente realizadas.

## 12.2 Recorrências

`despesas_recorrentes` representa configuração futura.

`ocorrencias_despesas_recorrentes` representa cada mês/período.

## 12.3 Ocorrência paga

Quando uma ocorrência é marcada como `PAGA`:

```text
ocorrência
   ↓
despesa efetiva
```

A ligação entre os dois registros deve ser preservada.

## 12.4 Evitar dupla contagem

Compra de estoque e custo histórico dos produtos vendidos servem para análises diferentes.

O sistema não deve subtrair a mesma compra duas vezes dentro do mesmo indicador financeiro.

---

# 13. Planos e permissões

O banco guarda:

- catálogo de planos;
- plano atual;
- período;
- pagamentos;
- cortesias;
- histórico administrativo.

As permissões detalhadas ficam no verificador central de recursos da aplicação.

Não criar dezenas de colunas como:

```text
pode_portfolio
pode_relatorios
pode_x
pode_y
```

sem necessidade.

Exemplo aprovado:

```text
portfolioPhotos
GRATIS = 5
NORMAL = 10
```

Quando um novo recurso for aprovado, a matriz de permissões pode crescer no código sem exigir uma nova coluna em cada barbearia.

---

# 14. RLS

RLS significa:

```text
Row Level Security
```

Ela restringe quais linhas um usuário autenticado pode acessar.

## 14.1 BARBEIRO

Fluxo conceitual:

```text
auth.uid()
   ↓
perfis
   ↓
barbearia_id
   ↓
dados daquela barbearia
```

## 14.2 ADMIN

Não usar uma policy genérica:

```text
ADMIN → pode tudo
```

Ações administrativas devem passar por fluxo controlado.

Exemplo:

```text
requisição
   ↓
servidor
   ↓
validar sessão
   ↓
validar ADMIN
   ↓
validar ação
   ↓
executar somente o necessário
```

ADMIN pode ter acesso a informações administrativas necessárias, como:

- plano;
- validade;
- pagamento;
- suspensão;
- cortesia;
- histórico administrativo.

Isso não significa acesso automático a:

- vendas completas;
- despesas;
- estoque;
- operações de PDV.

## 14.3 RLS e backend

RLS não substitui backend.

Backend também não substitui RLS.

Os dois trabalham juntos.

---

# 15. Storage

Os arquivos de imagem ficam no Supabase Storage.

O PostgreSQL não guarda a imagem inteira. Ele guarda somente o caminho ou a referência necessária para localizar o arquivo.

Exemplo:

```text
PostgreSQL
\-- portfolio.imagem_path

Supabase Storage
\-- arquivo real
```

## 15.1 Bucket atual

O bucket público usado pelas mídias das barbearias é:

```text
midia-publica
```

Configuração atual confirmada:

```text
public = true
file_size_limit = 10 MiB
file_size_limit em bytes = 10485760
```

Tipos de arquivo permitidos pelo bucket:

```text
image/jpeg
image/png
image/webp
```

Na prática, isso cobre:

```text
JPG/JPEG
PNG
WebP
```

O limite de 10 MiB é uma regra do próprio bucket `midia-publica`.

## 15.2 Organização por barbearia

Estrutura conceitual:

```text
barbearias/
  {barbeariaId}/
    logo/
    capa/
    produtos/
    portfolio/
```

Cada arquivo de uma barbearia deve ficar dentro da pasta do próprio `barbearia_id`.

## 15.3 Segurança do Storage

O bucket é público para leitura por URL.

Isso é necessário porque logo, capa, produtos e Portfólio podem aparecer na Vitrine pública.

As operações autenticadas de leitura pela API, upload, atualização e exclusão usam policies que verificam o tenant pelo caminho do arquivo.

A estrutura protegida começa por:

```text
barbearias/{barbearia_id}/...
```

Uma barbearia não deve conseguir enviar, alterar ou excluir arquivos de outra barbearia.

As policies atuais usam `current_barbearia_id()` para comparar o tenant autenticado com o caminho do objeto.

## 15.4 Imagens oficiais do sistema

Imagens padrão mantidas pelo próprio sistema não devem ser tratadas como arquivos editáveis de uma barbearia.

Exemplo conceitual:

```text
sistema/
  categorias/
    bebida.webp
    pomada.webp
    shampoo.webp
    cera.webp
    oleo-balm.webp
    acessorios.webp
    outros.webp
```

Arquivos oficiais do sistema não podem ser alterados ou apagados por barbeiros.

## 15.5 Regra de armazenamento

Não armazenar imagens como Base64 ou BLOB no PostgreSQL sem necessidade.

A regra do MVP é:

```text
arquivo real -> Supabase Storage
path/referência -> PostgreSQL
```

---
# 16. Dados monetários e datas

## 16.1 Dinheiro

Utilizar:

```sql
numeric(12,2)
```

Não utilizar `float` ou `real` como representação financeira principal.

## 16.2 Eventos

Utilizar:

```text
timestamptz
```

para eventos como:

- criação;
- atualização;
- venda;
- cancelamento;
- movimentação;
- confirmação administrativa.

## 16.3 Datas civis

Utilizar `date` quando horário exato não for necessário.

Exemplos:

- data de despesa;
- vencimento;
- data de pagamento.

---

# 17. Histórico e snapshots

O histórico não deve mudar porque o cadastro atual mudou.

Exemplos:

- preço novo não altera venda antiga;
- custo novo não altera venda antiga;
- produto inativo não apaga histórico;
- serviço inativo não apaga histórico;
- venda cancelada permanece registrada;
- perda preserva o custo do momento;
- recorrência alterada não muda ocorrências passadas.

Quando um produto ou serviço já possui uso histórico, preferir inativação em vez de exclusão física.

---

# 18. Exclusão de conta

A exclusão deve ser uma operação controlada no servidor.

Fluxo aprovado:

1. reautenticar o usuário;
2. validar a frase de confirmação;
3. retirar a Vitrine do ar;
4. invalidar acesso;
5. criar retenção mínima;
6. transferir somente registros essenciais permitidos;
7. apagar dados operacionais;
8. apagar objetos do Storage;
9. apagar o usuário do Auth;
10. reservar tecnicamente o código;
11. impedir restauração funcional da conta.

A retenção não deve servir como backup restaurável.

---

# 19. Índices

Índices devem ser usados em consultas frequentes.

Exemplos:

```text
vendas por barbearia + data
despesas por barbearia + data
produtos por barbearia
movimentações por produto + data
ocorrências por barbearia + vencimento
barbearias por status
slug público
```

Não criar índice em toda coluna automaticamente.

Índices também possuem custo.

---

# 20. Constraints

O banco deve proteger regras simples quando apropriado.

Exemplos:

```text
preço > 0
estoque >= 0
dia da semana entre 0 e 6
dia de vencimento entre 1 e 31
```

Também deve proteger, quando possível:

- relação BARBEIRO/barbearia;
- unicidade do slug;
- unicidade do código da barbearia;
- produto e categoria do mesmo tenant;
- quantidade de serviço em venda;
- horários válidos;
- estados permitidos por enums;
- formas de pagamento sem duplicidade.

Regras complexas continuam no backend/aplicação.

---

# 21. `ON DELETE`

Cada relacionamento pode exigir um comportamento diferente.

## CASCADE

Filhos são removidos junto com o pai.

Usar somente quando isso realmente fizer sentido.

## RESTRICT

Impede exclusão quando o registro ainda é necessário.

## SET NULL

Remove a relação direta, mas preserva o histórico.

Relacionamentos financeiros e históricos devem priorizar preservação quando necessário.

---

# 22. Migrations

Mudanças estruturais devem ser versionadas.

Exemplo:

```text
001_initial_schema.sql
002_add_user_type.sql
003_add_recurring_expenses.sql
004_update_business_hours.sql
```

Os nomes reais podem variar.

Alterações manuais importantes feitas no Supabase devem ser refletidas em migrations.

O mesmo conjunto aprovado deve chegar aos três ambientes.

---

# 23. Seeds

Atualmente, `supabase/seed.sql` existe como arquivo base, mas ainda não popula dados fictícios.

Os seeds reais de DEV e STAGING ainda precisam ser definidos.

## DEV

Pode ter seed amplo para facilitar desenvolvimento.

Exemplos:

- barbearia fictícia;
- serviços;
- produtos;
- vendas;
- despesas;
- recorrências;
- conta ADMIN de teste.

## STAGING

Pode ter seed realista de homologação.

Serve para testar o sistema quase como produção.

## PROD

Não recebe seed de demonstração automaticamente.

---

# 24. Mock x Seed

Mock:

```text
simula dados no frontend
```

Seed:

```text
popula um banco real de desenvolvimento ou homologação
```

São coisas diferentes.

---

# 25. Backup

Antes de produção deve ser confirmado:

- mecanismo de backup disponível;
- retenção do plano contratado;
- processo de restauração;
- recuperação do banco;
- estratégia de arquivos do Storage.

Não inventar prazos que não tenham sido confirmados com o provedor.

---

# 26. O que não existe no MVP

Não criar tabelas vazias apenas pensando em hipóteses futuras.

Não existem atualmente:

```text
clientes
agendamentos
lembretes
fidelidade
comissoes
funcionarios
equipes de barbeiros
campanhas
```

Também não existe obrigação de cobrança recorrente automatizada por gateway no MVP.

A tabela `assinaturas` existe para controlar o plano e o período comercial.

O Assistente IA também não faz parte da modelagem inicial.

Novos módulos devem entrar através de novas decisões e migrations.

---

# 27. Checklist antes de novas migrations

Antes de criar ou aplicar uma nova migration, revisar:

- lista final de colunas;
- tipos;
- nulabilidade;
- enums;
- constraints;
- índices;
- RLS;
- policies;
- BARBEIRO;
- ADMIN;
- relações entre tenants;
- relação produto/categoria;
- fallback de imagens;
- formas de pagamento;
- Onboarding;
- tema;
- Vitrine pública;
- Portfólio;
- limites de plano;
- downgrade;
- despesas recorrentes;
- ocorrências;
- transação do PDV;
- cancelamento;
- concorrência de estoque;
- horários;
- Storage;
- exclusão e retenção;
- criação da conta;
- planos;
- pagamentos;
- DEV;
- STAGING;
- PROD.

---

# 28. Resumo rápido

## Tecnologia

```text
PostgreSQL
Supabase
Supabase Auth
Supabase Storage
Next.js
```

## ORM

```text
Prisma: não utilizado no MVP
```

## Ambientes

```text
DEV
STAGING
PROD
```

## Tabelas próprias

```text
24
```

## Auth externo à contagem

```text
auth.users
```

## Perfis

```text
BARBEIRO
ADMIN
```

## Relação principal do MVP

```text
1 BARBEIRO
→ 1 BARBEARIA
```

## Planos

```text
GRATIS
NORMAL
```

## Preço atual do Normal

```text
R$ 49,90/mês
```

## Portfólio

```text
GRATIS = 5
NORMAL = 10
```

## Descrição pública

```text
Banco: TEXT
Aplicação: máximo 200 caracteres
```

## Cobrança automática

```text
não obrigatória no MVP
```

## Imagens

```text
arquivo real -> Supabase Storage
bucket atual -> midia-publica
limite do bucket -> 10 MiB (10485760 bytes)
tipos permitidos -> JPG/JPEG, PNG, WebP
path/referência -> PostgreSQL
```

## Segurança

```text
RLS + backend
```

## Mudanças estruturais

```text
Migration
→ DEV
→ STAGING
→ PROD
```

---

# 29. Regra de manutenção deste documento

Sempre que uma decisão funcional aprovada alterar o banco, este arquivo deve ser atualizado junto com o SQL/migration correspondente.

A documentação, o SQL e o comportamento real do sistema não devem evoluir separadamente.

Este arquivo deve continuar sendo o documento de entrada para qualquer pessoa ou IA que precise entender rapidamente:

> **qual é o banco de dados do Estilo & Gestão e como ele funciona.**

## Horarios da barbearia apos o Onboarding

A tela `Configuracoes > Barbearia > Horarios` usa a RPC `public.update_business_hours(p_horarios jsonb)`.

Essa RPC permite que o barbeiro edite os horarios da propria barbearia depois que o onboarding ja foi concluido.

Regras principais:

- Somente usuario autenticado pode chamar.
- Somente perfil `BARBEIRO` pode editar.
- O `barbearia_id` vem do perfil do usuario, nunca do cliente.
- O onboarding precisa estar concluido.
- A lista precisa ter exatamente 7 dias.
- `dia_semana` precisa ser de 0 a 6.
- Nao pode repetir dia da semana.
- Dia fechado nao pode ter horarios.
- Dia aberto precisa ter horario de abertura e fechamento.
- Os horarios precisam estar no formato `HH:MM`.
- O segundo periodo e opcional, mas precisa ter inicio e fim juntos.
- Os periodos nao podem se sobrepor.
- Precisa existir pelo menos 1 dia aberto.

A escrita direta na tabela `public.horarios_funcionamento` fica bloqueada para usuarios comuns.

Permissoes esperadas da tabela:

- `authenticated`: somente `SELECT`
- `anon`: sem permissao direta

A edicao deve sempre passar pela RPC `update_business_hours`.

