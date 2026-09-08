# Preparação do Frontend para o Backend — Estilo e Gestão

## Objetivo

Este documento define como o frontend do **Estilo e Gestão** deverá ser desenvolvido inicialmente com dados simulados sem ficar dependente deles.

A interface poderá utilizar mocks para visualizar e validar o sistema antes do banco real estar conectado, mas sua estrutura deverá estar preparada para substituir esses mocks pelo backend sem reescrever as telas.

As regras completas de cada funcionalidade pertencem ao documento **Fluxo Técnico do Barbeiro e do Cliente**.

A estrutura do banco pertence aos documentos **Banco Exemplo** e **Banco de Dados**.

---

# 1. Princípio principal

O frontend não deverá tratar dados simulados como se fossem a fonte definitiva do sistema.

Durante a prototipação:

```text
Tela
 ↓
Camada de dados
 ↓
Mock
```

Depois da integração:

```text
Tela
 ↓
Camada de dados
 ↓
Backend
 ↓
Supabase/PostgreSQL
```

A tela deverá mudar o mínimo possível entre essas duas fases.

---

# 2. Objetivo dos dados mock

Mocks serão utilizados para:

- visualizar telas antes do backend;
- validar o layout;
- testar estados da interface;
- testar responsividade;
- simular listas;
- simular Dashboard;
- simular PDV;
- simular estoque;
- simular histórico;
- simular Vitrine;
- validar o fluxo com o barbeiro.

Mocks não serão utilizados como banco de produção.

---

# 3. O que não usar como banco

Não utilizar como persistência definitiva:

- arrays escritos dentro de componentes;
- `localStorage`;
- `sessionStorage`;
- arquivos JSON editados manualmente;
- Base64 salvo no navegador.

Essas ferramentas podem ser utilizadas temporariamente quando existir motivo de prototipação, mas nunca devem virar a fonte oficial dos dados.

---

# 4. Estrutura recomendada

Uma estrutura possível para o projeto é:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (painel)/
│   ├── b/
│   └── api/
│
├── components/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── servicos/
│   ├── produtos/
│   ├── estoque/
│   ├── pdv/
│   ├── financeiro/
│   ├── vitrine/
│   └── portfolio/
│
├── lib/
│   ├── supabase/
│   ├── validation/
│   ├── formatting/
│   └── integrations/
│
├── server/
│   ├── services/
│   └── repositories/
│
├── mocks/
│
└── types/
```

Os nomes podem ser ajustados durante a implementação.

O importante é separar:

- interface;
- tipos;
- validação;
- dados simulados;
- acesso ao backend;
- regras executadas no servidor.

---

# 5. Tipos de domínio

Os componentes não deverão utilizar objetos sem estrutura definida.

Criar tipos ou interfaces para os principais dados.

Exemplo conceitual:

```ts
export type Servico = {
  id: string
  nome: string
  descricao: string | null
  preco: number
  custoEstimado: number | null
  ativo: boolean
  visivelVitrine: boolean
}
```

Também deverão existir estruturas equivalentes para:

- Barbearia;
- Perfil;
- CategoriaProduto;
- Produto;
- Venda;
- VendaItem;
- Despesa;
- MovimentacaoEstoque;
- PortfolioItem;
- HorarioFuncionamento.

O formato final deverá acompanhar o backend real.

---

# 6. Mock deve seguir o mesmo contrato

Exemplo incorreto:

```ts
const servicos = [
  {
    title: "Corte",
    value: "35 reais",
  },
]
```

se o backend futuro utilizar:

```ts
{
  id,
  nome,
  preco
}
```

O mock deverá usar o contrato planejado:

```ts
const servicosMock: Servico[] = [
  {
    id: "servico-1",
    nome: "Corte",
    descricao: "Corte masculino",
    preco: 35,
    custoEstimado: null,
    ativo: true,
    visivelVitrine: true,
  },
]
```

Assim a substituição futura ocorre na origem dos dados, não em todos os componentes.

---

# 7. IDs

Todo registro deverá possuir identificador.

Durante mocks podem ser utilizados IDs como:

```text
servico-1
produto-1
venda-1
```

No banco real serão utilizados UUIDs.

A interface deverá tratar o ID como um valor opaco.

Não criar regras como:

```ts
if (id > 10)
```

ou:

```ts
const tipo = id.substring(0, 2)
```

O ID identifica o registro e nada além disso.

---

# 8. Separar componentes de acesso a dados

Evitar:

```tsx
function ListaProdutos() {
  const produtos = produtosMock
}
```

espalhado em várias telas.

Preferir uma função intermediária:

```ts
async function listarProdutos() {
  return produtosMock
}
```

Durante a integração, essa função poderá passar a consultar o backend.

Conceito:

```text
Tela
 ↓
listarProdutos()
 ↓
Mock
```

Depois:

```text
Tela
 ↓
listarProdutos()
 ↓
Supabase/backend
```

---

# 9. Camada de servidor

Operações sensíveis não deverão ser realizadas diretamente pelo componente do navegador.

Exemplos:

- finalizar venda;
- cancelar venda;
- registrar despesa;
- alterar estoque;
- criar movimentação;
- consultar dados privados;
- chamar Gemini;
- utilizar chave administrativa.

Fluxo esperado:

```text
Componente
 ↓
Server Action / Route Handler / função server-side
 ↓
Validação
 ↓
Regra de negócio
 ↓
Banco
```

---

# 10. Server Components

Quando uma página puder carregar dados no servidor, utilizar os recursos server-side do Next.js.

Exemplos possíveis:

- Dashboard;
- lista de serviços;
- lista de produtos;
- histórico de vendas;
- configurações.

Não transformar toda leitura em uma API REST sem necessidade.

---

# 11. Client Components

Utilizar Client Components quando houver interação que dependa do navegador.

Exemplos:

- campos;
- modais;
- seletor;
- comanda temporária;
- upload com pré-visualização;
- filtros interativos;
- chat.

Adicionar `"use client"` somente quando necessário.

---

# 12. Validação com Zod

Criar schemas para dados enviados ao backend.

Exemplos:

```text
criarContaSchema
criarServicoSchema
editarServicoSchema
criarProdutoSchema
registrarReposicaoSchema
finalizarVendaSchema
registrarDespesaSchema
editarBarbeariaSchema
mensagemIaSchema
```

O schema poderá ser utilizado para melhorar a experiência no frontend.

Entretanto:

**validação no frontend não substitui validação no servidor.**

---

# 13. Formulários

Um formulário deverá possuir:

- valores iniciais;
- campos controlados de forma consistente;
- validações;
- estado de envio;
- mensagem de erro;
- mensagem de sucesso.

Enquanto estiver enviando:

- botão principal desabilitado;
- impedir envio duplicado.

---

# 14. Estados obrigatórios

As telas que consultam dados deverão considerar:

## Loading

Dados ainda estão sendo buscados.

## Success

Dados carregados normalmente.

## Empty

Consulta funcionou, mas não existem registros.

## Error

Consulta falhou.

Exemplo:

```ts
type RequestState =
  | "loading"
  | "success"
  | "empty"
  | "error"
```

Não é obrigatório utilizar esse tipo literalmente.

O comportamento, porém, deverá existir.

---

# 15. Estado vazio

Não utilizar dados falsos apenas para impedir que uma tela fique vazia.

Exemplo correto:

```text
Nenhum produto cadastrado.
[Adicionar produto]
```

Isso também precisa ser validado durante o desenvolvimento.

---

# 16. Erros

O backend deverá retornar erros que possam ser interpretados pela interface.

Exemplos conceituais:

```text
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
INSUFFICIENT_STOCK
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

A interface converte o erro técnico para uma mensagem humana.

Exemplo:

```text
INSUFFICIENT_STOCK
```

vira:

> Não há estoque suficiente para concluir esta venda.

Os textos oficiais pertencem ao documento de fluxo técnico.

---

# 17. Dinheiro no frontend

A interface poderá trabalhar com valores numéricos para exibição e cálculos temporários.

Exemplo:

```ts
35
```

Exibição:

```text
R$ 35,00
```

Criar uma função central de formatação.

Exemplo:

```ts
formatCurrency(35)
```

Não repetir:

```ts
toLocaleString(...)
```

em dezenas de componentes diferentes.

---

# 18. Total da venda

O frontend calcula o total para mostrar ao barbeiro.

Exemplo:

```text
Corte        R$ 35,00
Coca-Cola     R$ 6,00

Total        R$ 41,00
```

Porém esse total é apenas visual.

Ao finalizar:

```text
Frontend
 ↓
IDs + quantidades
 ↓
Backend
 ↓
Busca preço atual
 ↓
Recalcula
```

O banco não deverá confiar no preço ou total enviados pelo navegador.

---

# 19. Comanda

A comanda em edição pertence ao estado temporário do frontend.

Enquanto não for finalizada:

- não é uma venda;
- não precisa existir no banco;
- não altera estoque;
- não altera financeiro.

Somente depois da confirmação do backend a venda passa a existir.

---

# 20. Estoque

O frontend poderá exibir:

- estoque atual;
- estoque mínimo;
- indicador de estoque baixo.

O frontend não deverá executar sozinho:

```ts
produto.estoqueAtual--
```

como alteração definitiva.

A baixa real ocorre no servidor.

---

# 21. Cancelamento

Ao cancelar uma venda:

```text
Frontend
 ↓
Solicitar cancelamento
 ↓
Backend
 ↓
Validar venda
 ↓
Cancelar
 ↓
Restaurar estoque
 ↓
Retornar resultado
```

O frontend apenas atualiza a interface após a confirmação.

---

# 22. Datas

Dados de eventos deverão ser enviados ao backend em formato consistente.

Exemplos:

- venda;
- criação;
- cancelamento;
- movimentação de estoque.

O banco utilizará timestamps com timezone quando necessário.

A interface converte para apresentação local.

Evitar armazenar datas formatadas como:

```text
08/09/2026
```

como valor estrutural.

Essa representação serve apenas para exibição.

---

# 23. Enums e opções

Opções conhecidas não devem existir como textos aleatórios espalhados pelo frontend.

Exemplo:

```ts
export const formasPagamento = [
  "PIX",
  "DINHEIRO",
  "DEBITO",
  "CREDITO",
  "OUTRO",
] as const
```

O mesmo princípio pode ser utilizado para:

- status de venda;
- tipos de movimentação.

Categorias de produtos não são enum fixo, pois podem ser personalizadas.

---

# 24. Dados da sessão

O frontend poderá saber que existe usuário autenticado.

Porém não deverá decidir sozinho:

```text
este usuário pode acessar esta barbearia
```

O servidor e o banco deverão validar essa relação.

---

# 25. Rotas privadas

Exemplos:

```text
/dashboard
/pdv
/servicos
/produtos
/estoque
/financeiro
/relatorios
/vitrine
/configuracoes
```

Essas páginas exigem autenticação.

A proteção não deverá existir somente no menu.

Ocultar o botão não equivale a autorização.

---

# 26. Vitrine pública

A Vitrine deve utilizar um contrato de dados público separado do administrativo.

Exemplo conceitual:

```ts
type VitrinePublica = {
  nomeMarca: string
  descricao: string | null
  whatsapp: string | null
  endereco: ...
  servicos: ServicoPublico[]
  produtos: ProdutoPublico[]
  portfolio: PortfolioPublico[]
}
```

Não utilizar o objeto administrativo completo e depois esconder campos com CSS.

---

# 27. Produto público

A Vitrine poderá receber:

- nome;
- descrição;
- categoria;
- preço de venda;
- imagem;
- disponibilidade definida pela regra futura.

Não deverá receber:

- preço de custo;
- estoque mínimo;
- quantidade interna;
- dados financeiros.

---

# 28. Serviço público

Pode receber:

- nome;
- descrição;
- preço.

Não deverá receber:

- custo estimado de insumos.

---

# 29. Uploads

Durante prototipação, uma imagem local poderá ser utilizada para demonstrar a interface.

Na implementação real:

```text
Usuário escolhe arquivo
 ↓
Frontend mostra preview
 ↓
Validação básica
 ↓
Upload para Supabase Storage
 ↓
Recebe referência
 ↓
Banco salva referência
```

Não salvar Base64 como solução definitiva.

---

# 30. Preview de imagem

O preview poderá utilizar:

```text
URL.createObjectURL()
```

ou mecanismo equivalente.

O preview:

- não representa upload concluído;
- deverá ser liberado da memória quando não for mais necessário.

---

# 31. Supabase Storage

Separar arquivos por contexto sempre que apropriado.

Estrutura conceitual:

```text
barbearias/
  {barbeariaId}/
    logo/
    capa/
    produtos/
    portfolio/
```

A estrutura definitiva deverá respeitar as policies definidas.

---

# 32. ViaCEP

O frontend poderá consultar ViaCEP para melhorar a experiência.

Fluxo:

```text
CEP
 ↓
ViaCEP
 ↓
Rua
Bairro
Cidade
Estado
```

Se a consulta falhar:

- manter formulário utilizável;
- permitir preenchimento manual.

Não transformar ViaCEP em requisito para salvar uma barbearia.

---

# 33. Assistente IA

O frontend nunca chama Gemini diretamente.

Fluxo:

```text
Visitante
 ↓
Frontend
 ↓
Endpoint do Estilo e Gestão
 ↓
Validação
 ↓
Contexto público
 ↓
Gemini API
```

A chave da API permanece apenas no servidor.

---

# 34. Contexto da IA

Não montar contexto utilizando um objeto administrativo completo.

Criar função específica.

Exemplo conceitual:

```ts
getPublicAssistantContext(barbeariaId)
```

Essa função retorna somente campos autorizados.

---

# 35. Mock do Dashboard

Durante prototipação pode existir:

```ts
const dashboardMock = {
  faturamento: 1250,
  entradas: 1250,
  saidas: 430,
  resultadoEstimado: 820,
  servicos: 900,
  bebidas: 150,
  produtos: 200,
  estoqueBaixo: 3,
}
```

Depois deverá ser substituído por dados calculados pelo backend.

A tela não deverá precisar saber como os valores foram calculados.

---

# 36. Mock de vendas

Utilizar exemplos que reproduzam a estrutura real esperada.

Exemplo:

```ts
const vendasMock = [
  {
    id: "venda-1",
    status: "CONCLUIDA",
    formaPagamento: "PIX",
    totalBruto: 41,
    createdAt: "2026-09-08T18:30:00-03:00",
  },
]
```

Não adicionar campos de funcionalidades fora do MVP, como:

- cliente;
- agendamento;
- sinal Pix;
- comissão;
- funcionário.

---

# 37. Mock de Vitrine

Simular apenas dados públicos.

Isso permite detectar vazamentos conceituais ainda durante o desenvolvimento da interface.

---

# 38. Remoção dos mocks

Quando o backend estiver pronto:

1. substituir implementação da camada de dados;
2. manter contratos das telas;
3. remover imports diretos dos mocks;
4. verificar todos os estados vazios;
5. verificar todos os estados de erro;
6. apagar mocks que não tenham mais utilidade.

Mocks poderão continuar sendo usados em:

- testes;
- Storybook, caso seja adotado;
- desenvolvimento isolado de componentes.

---

# 39. Não misturar mock e produção

Evitar código como:

```ts
const produtos =
  process.env.NODE_ENV === "production"
    ? await supabase...
    : produtosMock
```

espalhado pelo projeto.

A origem dos dados deve ser definida em uma camada central.

---

# 40. Repositórios e serviços

Uma separação possível:

```text
produtoRepository
    ↓
consulta banco

produtoService
    ↓
aplica regra

tela
    ↓
usa serviço/action
```

Para um MVP pequeno, não é necessário criar dezenas de abstrações.

Criar somente camadas que tenham função clara.

---

# 41. Preparação para paginação

Listas que podem crescer deverão permitir implementação futura de paginação sem reescrever a tela.

Principalmente:

- vendas;
- movimentações de estoque;
- despesas;
- Portfólio.

Não carregar anos de histórico de uma vez.

---

# 42. Busca e filtros

Filtros visuais não deverão modificar diretamente o banco.

Fluxo:

```text
Filtro
 ↓
Parâmetros
 ↓
Consulta
 ↓
Resultado
```

---

# 43. Variáveis de ambiente

O frontend nunca deverá conter segredos fixos no código.

Variáveis e chaves estão documentadas em:

`ENV_SETUP.md`

---

# 44. O que deve estar pronto antes da integração

Antes de conectar o banco real:

- [ ] tipos principais definidos;
- [ ] mocks seguindo os tipos;
- [ ] componentes sem imports de mocks espalhados;
- [ ] schemas Zod definidos;
- [ ] estados loading implementados;
- [ ] estados vazios implementados;
- [ ] estados de erro implementados;
- [ ] formulários com loading;
- [ ] PDV separando estado temporário de persistência;
- [ ] dados públicos separados dos administrativos;
- [ ] uploads sem dependência de Base64;
- [ ] formatação monetária centralizada;
- [ ] datas tratadas de forma consistente.

---

# 45. O que muda ao conectar o backend

Principalmente:

```text
Mock Repository
```

é substituído por:

```text
Supabase Repository
```

e as operações de escrita passam a utilizar funções server-side.

As telas e componentes não deverão ser reconstruídos apenas porque a fonte dos dados mudou.

---

# 46. Critério de conclusão

O frontend estará preparado para o backend quando:

- a interface não depender diretamente de dados hardcoded;
- mocks respeitarem o contrato planejado;
- dados simulados puderem ser substituídos pela camada real;
- mutações críticas estiverem preparadas para execução no servidor;
- dados públicos e privados estiverem separados;
- loading, empty e error existirem;
- o PDV não confiar no navegador para valores finais;
- segredos não existirem no frontend;
- nenhuma funcionalidade fora do MVP tiver sido inserida apenas para preencher telas.