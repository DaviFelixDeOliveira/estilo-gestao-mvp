# Banco de Dados — Estilo e Gestão

## Objetivo

Este documento explica como o banco de dados do **Estilo e Gestão** deverá funcionar na aplicação real.

Ele serve como tradução técnica do arquivo `BANCO_EXEMPLO.sql` para a implementação com PostgreSQL e Supabase.

O arquivo SQL mostra tabelas, colunas e tipos.

Este documento explica:

- responsabilidade de cada tabela;
- relacionamentos;
- isolamento entre barbearias;
- funcionamento do estoque;
- histórico financeiro;
- snapshots;
- transações;
- RLS;
- leitura pública da Vitrine;
- integração com Supabase Auth e Storage.

Não repete todos os campos do SQL.

---

# 1. Tecnologia

O banco oficial será:

```text
PostgreSQL
```

hospedado através do:

```text
Supabase
```

O projeto não utilizará Prisma no MVP.

A aplicação acessará o banco através da integração do Supabase com Next.js e, quando necessário, funções server-side ou funções SQL/RPC.

---

# 2. Fonte de identidade

As contas de autenticação serão mantidas pelo:

```text
Supabase Auth
```

O Supabase possui internamente:

```text
auth.users
```

Essa estrutura será responsável por:

- identificador da conta;
- e-mail;
- credenciais;
- autenticação.

A aplicação não criará uma coluna própria de senha.

---

# 3. Perfil da aplicação

A tabela:

```text
perfis
```

liga:

```text
auth.users
```

a:

```text
barbearias
```

Fluxo:

```text
auth.users
    │
    ▼
perfis
    │
    ▼
barbearias
```

No MVP:

```text
1 usuário
    ↓
1 barbearia
```

Não haverá equipe de vários barbeiros no mesmo tenant.

---

# 4. Tenant

A entidade principal de isolamento é:

```text
barbearia
```

Cada barbearia representa um tenant do SaaS.

Dados administrativos deverão estar associados a:

```text
barbearia_id
```

Exemplos:

- serviços;
- categorias;
- produtos;
- vendas;
- despesas;
- movimentações;
- Portfólio;
- horários.

---

# 5. Por que utilizar `barbearia_id`

Mesmo que exista apenas um usuário por barbearia no MVP, associar dados à barbearia evita vincular toda a estrutura permanentemente à conta de login.

Exemplo:

```text
Barbearia A
├── Serviço A
├── Produto A
└── Venda A

Barbearia B
├── Serviço B
├── Produto B
└── Venda B
```

A Barbearia A não pode acessar registros da Barbearia B.

---

# 6. Estrutura conceitual

```text
auth.users
    │
    ▼
perfis
    │
    ▼
barbearias
    │
    ├── servicos
    │
    ├── categorias_produto
    │       └── produtos
    │
    ├── vendas
    │       └── venda_itens
    │
    ├── despesas
    │
    ├── movimentacoes_estoque
    │
    ├── portfolio
    │
    └── horarios_funcionamento
```

---

# 7. Tabela `barbearias`

Responsável pelas informações gerais da barbearia.

Também concentra configurações simples da Vitrine no MVP.

Exemplos de informação:

- nome;
- descrição;
- contatos;
- endereço;
- slug;
- publicação;
- atendimento domiciliar;
- logo;
- capa;
- habilitação da IA.

---

# 8. Por que não existe tabela `vitrine`

No escopo atual, criar uma tabela separada apenas para a Vitrine não traz benefício suficiente.

Informações básicas da Vitrine pertencem naturalmente à própria barbearia.

Outras informações já possuem tabelas próprias:

```text
servicos
produtos
portfolio
horarios_funcionamento
```

Se a Vitrine crescer significativamente no futuro, sua estrutura poderá ser separada.

---

# 9. Tabela `perfis`

Guarda dados da aplicação relacionados ao usuário autenticado.

Não guarda:

- senha;
- hash manual;
- token permanente.

Também poderá guardar o progresso do Onboarding.

Isso permite:

```text
Entrou
 ↓
Onboarding incompleto?
 ↓ sim
Retomar etapa
```

---

# 10. Tabela `servicos`

Representa serviços oferecidos.

Exemplos:

```text
Corte
Barba
Sobrancelha
Corte + Barba
```

Um serviço pode estar:

- ativo;
- inativo;
- visível na Vitrine;
- oculto da Vitrine.

Esses conceitos são diferentes.

---

# 11. Serviço inativo

Quando:

```text
ativo = false
```

não deverá ser utilizado em novas vendas.

O histórico não será apagado.

---

# 12. Visibilidade do serviço

Quando:

```text
visivel_vitrine = false
```

o serviço poderá continuar sendo utilizado internamente, mas não aparecerá na página pública.

---

# 13. Custo estimado do serviço

O campo é opcional.

Exemplo:

```text
Preço: R$ 40
Custo estimado: R$ 2
```

O custo representa materiais diretamente consumidos naquele atendimento.

Se não for preenchido:

```text
custo considerado = R$ 0
```

As regras funcionais completas pertencem ao documento de fluxo.

---

# 14. Categorias de produtos

Categorias pertencem à barbearia.

Exemplo:

```text
Bebida
Pomada
Shampoo
Acessórios
```

Não utilizar enum SQL fixo porque o barbeiro pode criar categorias próprias.

---

# 15. Categorias sugeridas

Sugestões podem existir no código da aplicação.

Exemplo:

```ts
[
  "Bebida",
  "Pomada",
  "Shampoo",
  "Cera",
  "Acessórios"
]
```

Isso não significa que todas essas categorias existirão no banco de todas as barbearias.

---

# 16. Primeiro uso de categoria sugerida

Exemplo:

```text
Usuário seleciona "Bebida"
          ↓
Categoria já existe?
      ┌───┴───┐
     Sim     Não
      │        │
 utilizar   criar
      └───┬────┘
          ▼
     vincular produto
```

---

# 17. Categoria personalizada

Exemplo:

```text
Usuário cria "Bonés"
        ↓
categorias_produto
        ↓
produto
```

Depois de criada, uma categoria personalizada funciona igual a uma categoria originada das sugestões.

O banco não precisa manter duas estruturas diferentes.

---

# 18. Tabela `produtos`

Representa produtos físicos vendidos e controlados pelo estoque.

Exemplos:

- Coca-Cola;
- água;
- pomada;
- shampoo;
- boné.

Cada produto pertence a:

```text
1 barbearia
```

e:

```text
1 categoria
```

---

# 19. Produto e categoria precisam pertencer ao mesmo tenant

Não será válido:

```text
Produto da Barbearia A
        ↓
Categoria da Barbearia B
```

O backend deverá validar essa relação.

Na migration definitiva, também poderá ser utilizada constraint relacional adicional para reforçar essa regra no banco.

---

# 20. Estoque atual

A tabela `produtos` mantém:

```text
estoque_atual
```

para permitir consulta rápida.

Porém esse número não será a única fonte de auditoria.

---

# 21. Histórico do estoque

Toda alteração relevante deverá gerar registro em:

```text
movimentacoes_estoque
```

Assim é possível responder:

```text
Por que havia 10 unidades e agora existem 6?
```

---

# 22. Tipos de movimentação

O MVP possui:

```text
REPOSICAO
VENDA
AJUSTE
PERDA
REVERSAO_VENDA
```

---

# 23. Exemplo de venda

Antes:

```text
estoque = 10
```

Venda de 2:

```text
quantidade_delta = -2
saldo_anterior = 10
saldo_posterior = 8
tipo = VENDA
```

---

# 24. Exemplo de reposição

Antes:

```text
estoque = 8
```

Reposição de 10:

```text
quantidade_delta = +10
saldo_anterior = 8
saldo_posterior = 18
tipo = REPOSICAO
```

---

# 25. Estoque mínimo

`estoque_minimo` é opcional.

Quando preenchido:

```text
estoque_atual <= estoque_minimo
```

significa:

```text
estoque baixo
```

Essa condição poderá ser calculada.

Não é necessária uma coluna:

```text
estoque_baixo
```

porque ela duplicaria uma informação derivável.

---

# 26. Tabela `vendas`

Representa apenas vendas efetivamente registradas.

Uma comanda em edição não existe nesta tabela.

Fluxo:

```text
Comanda temporária
       ↓
Finalizar venda
       ↓
Backend valida
       ↓
vendas
```

---

# 27. Status da venda

O MVP possui somente:

```text
CONCLUIDA
CANCELADA
```

Não existe:

```text
PENDENTE
```

para a comanda em edição.

---

# 28. Tabela `venda_itens`

Uma venda pode possuir vários itens.

Exemplo:

```text
Venda 001
├── Corte
├── Barba
└── Coca-Cola x2
```

O cabeçalho fica em:

```text
vendas
```

e os itens em:

```text
venda_itens
```

---

# 29. Snapshot

`venda_itens` armazena cópias dos dados financeiros usados na venda.

Exemplo:

Hoje:

```text
Corte = R$ 40
```

Venda registrada:

```text
preco_snapshot = 40
```

No mês seguinte:

```text
Corte = R$ 45
```

A venda antiga continua mostrando:

```text
R$ 40
```

---

# 30. Dados congelados

O item poderá preservar:

- nome;
- quantidade;
- preço unitário;
- custo unitário;
- subtotal;
- resultado estimado.

Isso protege o histórico.

---

# 31. Por que manter IDs junto com snapshots

O snapshot responde:

```text
o que foi vendido?
```

O ID ajuda a responder:

```text
qual cadastro originou esse item?
```

Se o cadastro for removido posteriormente, o snapshot continua preservando o histórico.

---

# 32. Cancelamento

Uma venda cancelada não será apagada.

Fluxo:

```text
CONCLUIDA
    ↓
cancelamento
    ↓
CANCELADA
```

Também deverá ocorrer:

```text
produtos vendidos
       ↓
retorno ao estoque
       ↓
REVERSAO_VENDA
```

---

# 33. Transação do PDV

Finalizar venda é uma operação crítica.

Não executar etapas independentes como:

```text
criar venda
   ✓

criar item
   ✓

baixar estoque
   ERRO
```

Isso deixaria o banco inconsistente.

---

# 34. Operação atômica

O resultado deve ser:

```text
Tudo funciona
     ↓
COMMIT
```

ou:

```text
Algo falha
     ↓
ROLLBACK
```

Conceitualmente:

```text
BEGIN

criar venda
criar itens
validar estoque
atualizar estoque
criar movimentações

COMMIT
```

Caso qualquer etapa falhe:

```text
ROLLBACK
```

---

# 35. Concorrência de estoque

Considere:

```text
estoque = 1
```

Duas requisições chegam praticamente juntas.

Ambas não podem conseguir vender a mesma última unidade.

A implementação deverá utilizar mecanismo transacional adequado do PostgreSQL.

A solução exata será definida durante a implementação.

O requisito é:

```text
estoque nunca pode ficar negativo por concorrência
```

---

# 36. Tabela `despesas`

Armazena saídas registradas pelo barbeiro.

Exemplos:

- água;
- energia;
- aluguel;
- internet;
- compra de estoque.

---

# 37. Compra de estoque

Uma compra de estoque representa:

```text
saída de caixa
```

Ao mesmo tempo, os produtos vendidos carregam:

```text
custo_snapshot
```

Essas informações servem a cálculos diferentes.

O sistema não deverá subtrair a mesma compra duas vezes dentro do mesmo indicador.

A definição financeira completa pertence ao fluxo técnico e à skill financeira.

---

# 38. Tabela `portfolio`

Guarda metadados das imagens do Portfólio.

A imagem em si fica no:

```text
Supabase Storage
```

O banco mantém:

```text
imagem_path
```

ou referência equivalente.

---

# 39. Por que não salvar imagem no banco

Evitar:

- Base64;
- BLOB sem necessidade;
- duplicação de arquivo.

Fluxo esperado:

```text
Imagem
 ↓
Supabase Storage
 ↓
Path
 ↓
portfolio
```

---

# 40. Tabela `horarios_funcionamento`

Guarda os horários públicos.

Não é agenda.

Não existe:

- horário reservado;
- cliente;
- agendamento.

Exemplo:

```text
Segunda
09:00 → 19:00

Terça
09:00 → 19:00

Domingo
Fechado
```

---

# 41. Um intervalo por dia

O SQL inicial trabalha com:

```text
1 abertura
1 fechamento
```

por dia.

Suporte a dois períodos, como:

```text
09:00–12:00
14:00–19:00
```

é uma decisão pendente.

Se for aprovado posteriormente, a modelagem poderá mudar.

---

# 42. Assistente IA

O banco não armazena conversa completa por padrão no MVP.

A tabela `barbearias` controla:

```text
assistente_ia_liberado
assistente_ia_ativo
```

---

# 43. Liberado e ativo

São conceitos diferentes.

```text
liberado = false
ativo = false
```

Recurso não contratado/liberado.

```text
liberado = true
ativo = false
```

Barbearia possui acesso, mas deixou desligado.

```text
liberado = true
ativo = true
```

Assistente disponível.

Não permitir:

```text
liberado = false
ativo = true
```

---

# 44. Vitrine pública

Não abrir as tabelas administrativas inteiras para visitantes.

Exemplo incorreto:

```text
SELECT * FROM produtos
```

e esconder:

```text
preco_custo
```

no frontend.

O dado privado já teria sido enviado.

---

# 45. Contrato público

A leitura pública deverá devolver somente informações autorizadas.

Exemplo de produto:

```text
nome
descricao
categoria
preco_venda
imagem
```

Sem:

```text
preco_custo
estoque_minimo
estoque_atual
barbearia_id interno
```

---

# 46. Estratégia de leitura pública

A implementação poderá utilizar:

- view segura;
- função SQL/RPC;
- Route Handler server-side;
- consulta com colunas explicitamente selecionadas.

A opção definitiva será escolhida durante a implementação.

Princípio obrigatório:

```text
allowlist
```

e não:

```text
buscar tudo e esconder depois
```

---

# 47. RLS

RLS significa:

```text
Row Level Security
```

Ela controla quais linhas um usuário pode acessar.

Será habilitada nas tabelas privadas.

---

# 48. Regra conceitual de acesso

Usuário autenticado:

```text
auth.uid()
    ↓
perfis
    ↓
barbearia_id
    ↓
dados da própria barbearia
```

---

# 49. Exemplo conceitual

Se:

```text
Usuário A → Barbearia A
```

ele poderá acessar:

```text
produtos onde barbearia_id = A
```

e não:

```text
barbearia_id = B
```

---

# 50. RLS não substitui backend

RLS é uma camada adicional.

O backend também deverá:

- validar sessão;
- validar propriedade;
- validar dados;
- aplicar regras de negócio.

---

# 51. Backend não substitui RLS

Também não confiar apenas no backend.

Se uma consulta ao Supabase for feita de forma incorreta, RLS deve continuar limitando acesso quando aplicável.

Segurança utiliza camadas.

---

# 52. Secret Key

Operações normais do barbeiro não devem utilizar Secret Key administrativa.

A Secret Key possui privilégios elevados e pode ignorar RLS.

Uso, se necessário:

- somente servidor;
- operações administrativas específicas.

---

# 53. Operador do SaaS

Existe intenção de painel administrativo mínimo.

Porém a forma de autenticação/autorização ainda não foi decidida.

Por isso o SQL atual não cria:

- enum de SUPER_ADMIN;
- role global complexa;
- tabela de permissões.

Essas estruturas só deverão ser adicionadas depois da decisão.

---

# 54. Índices

Índices ajudam consultas frequentes.

Exemplos importantes:

```text
vendas por barbearia + data
despesas por barbearia + data
produtos por barbearia
movimentações por produto + data
```

Não criar índice em toda coluna automaticamente.

Índices também possuem custo de escrita e armazenamento.

---

# 55. Constraints

O banco deverá proteger regras simples sempre que adequado.

Exemplos:

```text
preço > 0
estoque >= 0
dia entre 0 e 6
```

Mas regras de negócio complexas continuarão no backend.

---

# 56. `ON DELETE`

Existem três comportamentos principais.

## CASCADE

Ao remover registro pai, filhos também são removidos.

Utilizar somente quando isso fizer sentido.

## RESTRICT

Impede apagar registro que ainda é necessário para histórico.

## SET NULL

Remove relacionamento, mas preserva o registro histórico.

---

# 57. Histórico financeiro

Venda histórica deve ser preservada.

Por isso:

- produto antigo não deve destruir venda;
- serviço antigo não deve destruir venda;
- alteração de preço não altera histórico;
- cancelamento não apaga venda.

---

# 58. Inativação

Para registros utilizados historicamente, preferir:

```text
ativo = false
```

em vez de exclusão física.

Principalmente:

- serviço;
- produto;
- categoria.

---

# 59. Dados monetários

Utilizar:

```sql
numeric(12,2)
```

para valores.

Não utilizar:

```text
float
real
```

como fonte financeira.

---

# 60. Timestamps

Eventos importantes utilizarão:

```text
timestamptz
```

Exemplos:

- criação;
- atualização;
- venda;
- cancelamento;
- movimentação.

Datas puramente civis poderão utilizar:

```text
date
```

Exemplo:

- data de despesa.

---

# 61. Storage

Arquivos não pertencem ao PostgreSQL.

Fluxo:

```text
Banco
 └── referência

Storage
 └── arquivo
```

As policies do Storage também precisam respeitar a barbearia.

---

# 62. Backup

Antes de produção deverá ser confirmado:

- mecanismo de backup do plano Supabase;
- retenção disponível;
- recuperação do banco;
- estratégia para arquivos do Storage.

Não inventar prazos de retenção na documentação.

---

# 63. Ambientes

Idealmente separar:

```text
DEV
PROD
```

Preview poderá utilizar DEV ou ambiente específico quando necessário.

Não utilizar banco de produção para testar cadastro aleatório durante desenvolvimento.

---

# 64. Migrations

O banco real não deverá ser alterado manualmente sem histórico.

Mudanças estruturais deverão ser registradas por migrations ou mecanismo equivalente.

Exemplo:

```text
001_initial_schema.sql
002_add_field_x.sql
003_create_index_y.sql
```

O nome e ferramenta exatos poderão ser definidos na implementação.

---

# 65. Seed

Poderá existir um seed apenas para desenvolvimento.

Exemplos:

- barbearia fictícia;
- serviços fictícios;
- produtos fictícios;
- vendas fictícias.

Não executar seed de demonstração em produção.

---

# 66. Dados mock e banco

Mock:

```text
serve para frontend
```

Seed:

```text
serve para popular banco de desenvolvimento
```

São conceitos diferentes.

---

# 67. Dados que não existem no MVP

Não criar tabelas apenas para preparar um futuro hipotético.

Não existem atualmente:

```text
clientes
agendamentos
lembretes
fidelidade
comissoes
funcionarios
assinaturas automatizadas
campanhas
```

Quando uma funcionalidade futura for aprovada, a modelagem será revisada.

---

# 68. SQL de referência

O arquivo:

```text
BANCO_EXEMPLO.sql
```

é uma representação inicial.

Ele serve para:

- visualizar tabelas;
- entender tipos;
- entender nulabilidade;
- entender relacionamentos.

Não deve ser executado cegamente em produção.

---

# 69. Antes da primeira migration real

Revisar:

- [ ] todas as decisões pendentes que alteram o schema;
- [ ] nulabilidade;
- [ ] constraints;
- [ ] índices;
- [ ] RLS;
- [ ] policies;
- [ ] relações entre tenant;
- [ ] função transacional do PDV;
- [ ] cancelamento;
- [ ] concorrência;
- [ ] leitura pública;
- [ ] Storage;
- [ ] operador SaaS.

---

# 70. Critério de conclusão

A modelagem estará pronta para produção quando:

- refletir o escopo funcional aprovado;
- todas as tabelas tiverem função clara;
- cada dado privado estiver isolado corretamente;
- RLS estiver implementada e testada;
- relações entre barbearias estiverem protegidas;
- PDV for transacional;
- estoque concorrente estiver protegido;
- Vitrine não expuser campos privados;
- migrations forem versionadas;
- o SQL de referência estiver sincronizado com a estrutura real.