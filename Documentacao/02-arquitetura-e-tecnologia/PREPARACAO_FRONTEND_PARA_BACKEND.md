**# Preparação do Frontend para o Backend — Estilo e Gestão**

**## Objetivo**

Este documento define como o frontend do **\*\*Estilo e Gestão\*\*** deverá ser desenvolvido inicialmente com dados simulados sem ficar dependente deles.

A interface poderá utilizar mocks para visualizar e validar o sistema antes do banco real estar conectado, mas sua estrutura deverá estar preparada para substituir esses mocks pelo backend sem reescrever as telas.

Este documento também define como o frontend deverá tratar:

\- autenticação;

\- tipos de usuário;

\- autorização;

\- área da barbearia;

\- área administrativa do SaaS;

\- dados públicos;

\- dados privados;

\- operações críticas.

As regras completas de cada funcionalidade pertencem ao documento **\*\*Fluxo Técnico do Barbeiro e do Cliente\*\***.

A estrutura do banco pertence aos documentos **\*\*Banco Exemplo\*\*** e **\*\*Banco de Dados\*\***.

\---

**# 1. Princípio principal**

O frontend não deverá tratar dados simulados como se fossem a fonte definitiva do sistema.

Durante a prototipação:

\`\`\`text

Tela

 ↓

Camada de dados

 ↓

Mock

\`\`\`

Depois da integração:

\`\`\`text

Tela

 ↓

Camada de dados

 ↓

Backend

 ↓

Supabase/PostgreSQL

\`\`\`

A tela deverá mudar o mínimo possível entre essas duas fases.

\---

**# 2. Objetivo dos dados mock**

Mocks serão utilizados para:

\- visualizar telas antes do backend;

\- validar layout;

\- testar estados da interface;

\- testar responsividade;

\- simular listas;

\- simular Dashboard;

\- simular PDV;

\- simular estoque;

\- simular despesas;

\- simular despesas recorrentes;

\- simular histórico;

\- simular Vitrine;

\- simular Painel Administrativo;

\- validar fluxos antes da integração.

Mocks não serão utilizados como banco de produção.

\---

**# 3. O que não usar como banco**

Não utilizar como persistência definitiva:

\- arrays escritos diretamente dentro de componentes;

\- *\`localStorage\`*;

\- *\`sessionStorage\`*;

\- arquivos JSON editados manualmente;

\- Base64 salvo no navegador.

Essas ferramentas poderão ser utilizadas temporariamente quando houver finalidade clara de prototipação.

Nunca deverão se tornar a fonte oficial dos dados.

\---

**# 4. Estrutura recomendada**

Uma estrutura possível:

\`\`\`text

src/

├── app/
│   ├── (auth)/
│   ├── (painel)/
│   │   ├── dashboard/
│   │   ├── pdv/
│   │   │   └── historico/
│   │   ├── operacao/
│   │   │   ├── servicos/
│   │   │   ├── produtos/
│   │   │   └── estoque/
│   │   └── configuracoes/
│   │       ├── financeiro/
│   │       ├── relatorios/
│   │       ├── vitrine/
│   │       │   └── portfolio/
│   │       ├── barbearia/
│   ├── conta/
│   │   ├── perfil/
│   │   ├── aparencia/
│   │   ├── alterar-senha/
│   │   └── zona-de-perigo/
│   ├── (admin)/
│   ├── [slug]/
│   └── api/
│
├── components/
│   ├── navigation/
│   │   ├── app-sidebar/
│   │   ├── bottom-navigation/
│   │   ├── account-menu/
│   │   └── secondary-navigation/
│   └── ...
│
├── features/
│   ├── auth/
│   ├── onboarding/
│   ├── dashboard/
│   ├── servicos/
│   ├── produtos/
│   ├── estoque/
│   ├── pdv/
│   ├── financeiro/
│   ├── despesas-recorrentes/
│   ├── vitrine/
│   ├── portfolio/
│   ├── conta/
│   └── admin/
│
├── lib/
│   ├── supabase/
│   ├── validation/
│   ├── formatting/
│   └── integrations/
│
├── server/
│   ├── services/
│   ├── repositories/
│   └── authorization/
│
├── mocks/
│
└── types/

\`\`\`

Os nomes poderão ser ajustados durante a implementação.

A hierarquia de navegação não obriga a juntar toda a lógica de domínio na mesma pasta.

Exemplo:

\`\`\`text

Operação
├── Serviços
├── Produtos
└── Estoque
\`\`\`

pode existir visualmente como um único módulo de navegação, enquanto:

\`\`\`text

features/servicos
features/produtos
features/estoque
\`\`\`

continuam separados no código.

O importante é separar:

\- interface;

\- navegação;

\- tipos;

\- validação;

\- dados simulados;

\- acesso ao backend;

\- autorização;

\- regras executadas no servidor.

A rota pública da Vitrine deverá seguir o formato definido funcionalmente:

\`\`\`text

/{slug}

\`\`\`

\---

**# 5. Tipos de domínio**

Os componentes não deverão utilizar objetos sem estrutura definida.

Criar tipos ou interfaces para os principais dados.

Exemplo:

\`\`\`ts

export type TipoUsuario = "BARBEIRO" | "ADMIN"

export type TemaSistema =
  | "CLARO"
  | "ESCURO"
  | "SISTEMA"

export type FormaPagamento =
  | "PIX"
  | "DINHEIRO"
  | "DEBITO"
  | "CREDITO"
  | "OUTRO"

export type FormaPagamentoAceita = {
  barbeariaId: string
  formaPagamento: FormaPagamento
}

export type Servico = {
  id: string
  nome: string
  descricao: string | null
  preco: number
  custoEstimado: number | null
  ativo: boolean
  visivelVitrine: boolean
}

export type CategoriaProduto = {
  id: string
  barbeariaId: string
  nome: string
  imagemPadraoPath: string | null
  ativo: boolean
}

export type Produto = {
  id: string
  barbeariaId: string
  categoriaId: string
  nome: string
  descricao: string | null
  estoqueAtual: number
  estoqueMinimo: number | null
  precoCusto: number
  precoVenda: number
  imagemPath: string | null
  usarImagemCategoria: boolean
  ativo: boolean
  visivelVitrine: boolean
}

\`\`\`

A categoria poderá possuir uma imagem padrão oficial do sistema através de:

\`\`\`text

imagemPadraoPath

\`\`\`

O produto poderá possuir uma imagem personalizada através de:

\`\`\`text

imagemPath

\`\`\`

e controlar o fallback através de:

\`\`\`text

usarImagemCategoria

\`\`\`

Esses campos representam conceitos diferentes e não deverão ser tratados como uma única imagem.

Também deverão existir estruturas equivalentes para:

\- Barbearia;

\- Perfil;

\- Venda;

\- VendaItem;

\- Despesa;

\- DespesaRecorrente;

\- OcorrenciaDespesaRecorrente;

\- MovimentacaoEstoque;

\- PortfolioItem;

\- HorarioFuncionamento;

\- FormaPagamentoAceita;

\- VitrinePublica;

\- dados do Operador do SaaS.

O formato final deverá acompanhar o backend real.

\---

**# 6. Tipo do usuário**

O frontend deverá conhecer os dois tipos previstos no MVP:

\`\`\`ts

export type TipoUsuario =

  | "BARBEIRO"

  | "ADMIN"

\`\`\`

O valor padrão de novos cadastros é:

\`\`\`text

BARBEIRO

\`\`\`

O frontend não deverá permitir que o usuário escolha:

\`\`\`text

ADMIN

\`\`\`

durante o cadastro.

Também não deverá existir no perfil comum um controle como:

\`\`\`text

Tipo da conta:

[BARBEIRO ▼]

\`\`\`

capaz de alterar essa permissão.

Na versão inicial, a promoção para *\`ADMIN\`* será feita somente por operação interna protegida, migration ou rotina com credencial de servidor. Nunca por formulário público ou mutação autorizada ao próprio usuário.

\---

**# 7. Mock deve seguir o mesmo contrato**

Exemplo incorreto:

\`\`\`ts

const servicos = [

  {

    title: "Corte",

    value: "35 reais",

  },

]

\`\`\`

se o backend utilizar:

\`\`\`ts

{

  id,

  nome,

  preco

}

\`\`\`

O mock deverá utilizar o contrato planejado:

\`\`\`ts

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

\`\`\`

Assim a substituição futura ocorre na origem dos dados, não nos componentes.

\---

**# 8. Mock de perfil**

Os mocks também deverão representar corretamente o tipo de usuário.

Exemplo de barbeiro:

\`\`\`ts

const perfilBarbeiroMock = {

  userId: "usuario-1",

  barbeariaId: "barbearia-1",

  nome: "Carlos",

  tipo: "BARBEIRO",

  tema: "ESCURO",

  onboardingEtapa: 6,

  onboardingConcluido: true,

}

\`\`\`

Exemplo de operador:

\`\`\`ts

const perfilAdminMock = {

  userId: "usuario-admin-1",

  tipo: "ADMIN",

}

\`\`\`

Esses mocks servem apenas para prototipação e testes.

Eles não concedem autorização real.

\---

**# 9. IDs**

Todo registro deverá possuir identificador.

Durante mocks poderão ser utilizados:

\`\`\`text

servico-1

produto-1

venda-1

barbearia-1

\`\`\`

No banco real serão utilizados identificadores definidos pelo backend.

A interface deverá tratar o ID como valor opaco.

Não criar regras como:

\`\`\`ts

if (id > 10)

\`\`\`

ou:

\`\`\`ts

const tipo = id.substring(0, 2)

\`\`\`

O ID identifica o registro e nada além disso.

\---

**# 10. Separar componentes de acesso a dados**

Evitar:

\`\`\`tsx

function ListaProdutos() {

  const produtos = produtosMock

}

\`\`\`

espalhado em diferentes telas.

Preferir uma camada intermediária:

\`\`\`ts

async function listarProdutos() {

  return produtosMock

}

\`\`\`

Durante a integração:

\`\`\`text

Tela

 ↓

listarProdutos()

 ↓

Mock

\`\`\`

Depois:

\`\`\`text

Tela

 ↓

listarProdutos()

 ↓

Backend

\`\`\`

\---

**# 11. Camada de servidor**

Operações sensíveis não deverão ser realizadas diretamente pelo componente do navegador.

Exemplos:

\- finalizar venda;

\- registrar despesa;

\- marcar despesa recorrente como paga;

\- registrar reposição;

\- registrar perda;

\- alterar estoque;

\- criar movimentação;

\- criar e publicar Vitrine;

\- despublicar Vitrine;

\- consultar dados privados;

\- salvar etapas do Onboarding;

\- atualizar formas de pagamento aceitas pela barbearia;

\- alterar configurações sensíveis;

\- executar ações administrativas;

\- chamar Gemini;

\- utilizar chave administrativa.

Fluxo esperado:

\`\`\`text

Componente

 ↓

Server Action / Route Handler / função server-side

 ↓

Validação

 ↓

Autorização

 ↓

Regra de negócio

 ↓

Banco

\`\`\`

\---

**# 12. Autenticação e autorização**

São conceitos diferentes.

\`\`\`text

Autenticação

→ Quem é o usuário?

Autorização

→ O que esse usuário pode fazer?

\`\`\`

O Supabase Auth confirma a identidade.

Depois disso, o backend deverá consultar as informações necessárias para decidir o acesso.

Exemplo:

\`\`\`text

Supabase Auth

 ↓

Usuário autenticado

 ↓

Perfil

 ↓

tipo

 ↓

BARBEIRO ou ADMIN

\`\`\`

O frontend poderá utilizar essa informação para montar a interface correta.

A autorização real continua sendo responsabilidade do servidor e do banco.

\---

**# 13. Fluxo após Login**

Depois da autenticação:

\`\`\`text

Login válido

 ↓

Backend localiza perfil

 ↓

Verifica tipo

\`\`\`

Se:

\`\`\`text

tipo = ADMIN

\`\`\`

direcionar para:

\`\`\`text

Painel Administrativo

\`\`\`

Se:

\`\`\`text

tipo = BARBEIRO

\`\`\`

verificar:

\`\`\`text

Onboarding concluído?

\`\`\`

Se não:

\`\`\`text

Etapa pendente do Onboarding

\`\`\`

Se sim:

\`\`\`text

Dashboard

\`\`\`

O frontend não deverá decidir o tipo da conta com base em:

\- e-mail;

\- URL;

\- *\`localStorage\`*;

\- parâmetro;

\- variável criada manualmente no navegador.

**## 13.1 Onboarding no frontend**

O Onboarding atual possui 6 etapas:

\`\`\`text

1. Dados da barbearia

2. Endereço

3. Horários de funcionamento

4. Serviços

5. Produtos e formas de pagamento

6. Aparência e conclusão

\`\`\`

Cada etapa deverá ser persistida separadamente pelo backend.

O frontend poderá manter o estado temporário da etapa atual, mas a fonte oficial do progresso será o perfil salvo no backend.

Ao retomar o fluxo, utilizar:

\- *\`onboardingEtapa\`*;

\- *\`onboardingConcluido\`*.

Na Etapa 5, se a barbearia vender produtos ou bebidas, o Onboarding deverá coletar inicialmente as categorias ou tipos comercializados. O cadastro detalhado de cada produto poderá ser feito depois na área de Produtos.

Categorias sugeridas pelo sistema poderão possuir uma imagem padrão oficial.

Exemplo:

\`\`\`text

Pomada
→ imagem padrão oficial de Pomada

Bebida
→ imagem padrão oficial de Bebida

Outros
→ imagem padrão neutra

\`\`\`

Quando o barbeiro selecionar uma categoria sugerida, o backend poderá criar o registro já associado ao respectivo:

\`\`\`text

imagemPadraoPath

\`\`\`

Categorias personalizadas criadas pelo barbeiro deverão começar com:

\`\`\`text

imagemPadraoPath = null

\`\`\`

As formas de pagamento aceitas deverão ser tratadas como configuração da barbearia e não como forma de pagamento de uma venda específica.

Na Etapa 6, a escolha de tema deverá ser salva no perfil do usuário.

Ao selecionar **\*\*Concluir configuração\*\***, o backend deverá validar o estado necessário, marcar o Onboarding como concluído e somente então permitir o redirecionamento para o Dashboard.

\---

**# 14. Rotas por tipo de usuário**

As rotas da barbearia exigem:

```text
usuário autenticado
+
tipo = BARBEIRO
+
acesso à própria barbearia
```

Rotas conceituais:

```text
/dashboard

/pdv
/pdv/historico

/operacao/servicos
/operacao/produtos
/operacao/produtos/categorias
/operacao/estoque

/configuracoes/financeiro
/configuracoes/relatorios
/configuracoes/vitrine
/configuracoes/vitrine/portfolio
/configuracoes/barbearia
/configuracoes/barbearia/endereco
/configuracoes/barbearia/horarios
/configuracoes/barbearia/formas-pagamento

/conta
/conta/perfil
/conta/aparencia
/conta/alterar-senha
/conta/zona-de-perigo
```

O caminho definitivo poderá ser ajustado durante a implementação, mas a hierarquia funcional deverá permanecer equivalente.

**Sua conta** é separada de **Configurações**.

Não criar destinos principais independentes na navegação para Serviços, Produtos, Estoque, Financeiro, Relatórios, Vitrine ou Conta.

As rotas administrativas exigem:

```text
usuário autenticado
+
tipo = ADMIN
```

Exemplos conceituais:

```text
/admin
/admin/barbearias
/admin/barbearias/{id}
```

---

**# 15. Tentativa de acesso indevido**

Se um *\`BARBEIRO\`* tentar acessar diretamente:

\`\`\`text

/admin

\`\`\`

o backend deverá impedir.

Da mesma forma, possuir *\`ADMIN\`* não significa automaticamente agir como proprietário de qualquer barbearia.

O operador deverá utilizar somente as funções administrativas especificamente permitidas.

Ocultar uma opção do menu melhora a interface.

Não é uma proteção de segurança.

\---

**# 15.1 Layout autenticado do BARBEIRO**

A área autenticada deverá possuir um layout compartilhado para evitar duplicação entre páginas.

Esse layout deverá controlar:

\- navegação principal;

\- estado da sidebar no Desktop;

\- barra inferior no Mobile;

\- cabeçalho;

\- menu rápido da conta;

\- área principal de conteúdo;

\- comportamento responsivo.

Conceitualmente:

\`\`\`text

AppLayout
├── Navegação
├── Cabeçalho
├── Conteúdo
└── Conta

\`\`\`

O layout não deverá conhecer regras específicas de:

\- vendas;

\- estoque;

\- financeiro;

\- Vitrine.

Ele organiza a aplicação, não executa a lógica de negócio.

\---

**# 15.2 Navegação Desktop**

No Desktop, utilizar sidebar recolhível.

Itens principais:

```text
Dashboard
PDV
Operação
Configurações
```

Operação:

```text
Serviços
Produtos
Estoque
```

Categorias permanece dentro de Produtos.

Configurações:

```text
Negócio
├── Financeiro
├── Relatórios
└── Vitrine Digital

Barbearia
├── Dados da barbearia
├── Endereço
├── Horários
└── Formas de pagamento
```

Não criar grupo Pessoal dentro de Configurações.

A identidade da conta no rodapé abre o menu rápido e a área **Sua conta**.

No estado recolhido, a marca compacta E&G ocupa a mesma área do controle de expansão: ao passar o mouse ou focar, a marca é substituída pelo ícone de expandir; não exibir ambos lado a lado.

---

**# 15.3 Navegação Mobile**

No Mobile, utilizar barra inferior fixa com quatro destinos:

\`\`\`text

Dashboard

PDV

Operação

Configurações

\`\`\`

A barra deverá:

\- respeitar safe area;

\- reservar espaço no conteúdo;

\- possuir área adequada para toque;

\- destacar o item ativo;

\- não depender somente de cor;

\- funcionar com Tema Claro e Escuro.

Não utilizar a sidebar Desktop comprimida no Mobile.

Dentro de Operação e Configurações, utilizar navegação secundária apropriada, como:

\- tabs;

\- segmented control;

\- lista;

\- cards;

\- páginas internas.

A escolha visual poderá variar conforme a área.

\---

**# 15.4 Configuração central da navegação**

Evitar espalhar nomes, rotas e ícones da navegação em componentes diferentes.

Preferir configuração central equivalente a:

\`\`\`ts

type NavigationItem = {
  label: string
  href: string
  icon: React.ComponentType
}

export const mainNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
  },
  {
    label: "PDV",
    href: "/pdv",
    icon: PdvIcon,
  },
  {
    label: "Operação",
    href: "/operacao",
    icon: OperationIcon,
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: SettingsIcon,
  },
]

\`\`\`

Os nomes dos ícones são apenas conceituais.

Na implementação, utilizar a biblioteca de ícones definida pelo projeto.

A mesma configuração poderá alimentar Desktop e Mobile quando isso não prejudicar a experiência.

\---

**# 15.5 Menu rápido da conta**

O avatar ou identidade do usuário poderá abrir:

```text
Minha conta
Aparência
Alterar senha
Sair
```

**Minha conta** leva à área separada **Sua conta**.

A ação **Excluir conta** não aparece diretamente no menu rápido. Ela pertence a:

```text
Sua conta
→ Zona de perigo
```

---

**# 15.6 Itens internos**

Algumas funcionalidades continuam existindo sem virar destinos principais:

```text
Histórico de vendas
→ PDV

Categorias de produto
→ Operação > Produtos

Portfólio
→ Configurações > Negócio > Vitrine Digital

Despesas e despesas recorrentes
→ Configurações > Negócio > Financeiro

Perfil, Aparência, Alterar senha, Minha assinatura e Zona de perigo
→ Sua conta
```

A organização visual não altera as entidades de banco nem as regras de autorização.

---

**# 16. Server Components**

Quando uma página puder carregar dados no servidor, utilizar recursos server-side do Next.js.

Exemplos:

\- Dashboard;

\- PDV e Histórico de vendas;

\- Operação;

\- lista de serviços;

\- lista de produtos;

\- Estoque;

\- Financeiro;

\- Relatórios;

\- Vitrine administrativa;

\- Configurações;

\- Painel Administrativo.

Não transformar toda leitura em uma API REST sem necessidade.

\---

**# 17. Client Components**

Utilizar Client Components quando houver interação dependente do navegador.

Exemplos:

\- campos;

\- modais;

\- seletores;

\- comanda temporária;

\- upload com preview;

\- filtros;

\- gráficos interativos;

\- chat;

\- confirmações.

Adicionar *\`"use client"\`* somente quando necessário.

\---

**# 18. Validação com Zod**

Criar schemas para dados enviados ao backend.

Exemplos:

\`\`\`text

criarContaSchema

criarServicoSchema

editarServicoSchema

criarProdutoSchema

editarProdutoSchema

removerImagemProdutoSchema

registrarReposicaoSchema

registrarAjusteSchema

registrarPerdaSchema

finalizarVendaSchema

registrarDespesaSchema

criarDespesaRecorrenteSchema

marcarDespesaRecorrenteComoPagaSchema

editarBarbeariaSchema

salvarOnboardingDadosBarbeariaSchema

salvarOnboardingEnderecoSchema

salvarOnboardingHorariosSchema

salvarOnboardingServicosSchema

salvarOnboardingProdutosPagamentosSchema

salvarOnboardingAparenciaSchema

atualizarFormasPagamentoAceitasSchema

criarVitrineSchema

mensagemIaSchema

\`\`\`

Não criar no cadastro público um campo confiável como:

\`\`\`text

tipo

\`\`\`

capaz de definir *\`ADMIN\`*.

Se esse valor for enviado pelo navegador, o backend não deverá confiar nele.

Validação no frontend não substitui validação no servidor.

\---

**# 19. Formulários**

Um formulário deverá possuir:

\- valores iniciais;

\- campos controlados de forma consistente;

\- validações;

\- estado de envio;

\- mensagem de erro;

\- mensagem de sucesso.

Enquanto estiver enviando:

\- botão principal desabilitado;

\- impedir envio duplicado.

Quando ocorrer erro recuperável:

\- preservar os dados já digitados.

\---

**# 20. Estados obrigatórios**

Telas que consultam dados deverão considerar:

**## Loading**

Dados ainda estão sendo buscados.

**## Success**

Dados carregados normalmente.

**## Empty**

Consulta funcionou, mas não existem registros.

**## Error**

Consulta falhou.

Exemplo conceitual:

\`\`\`ts

type RequestState =

  | "loading"

  | "success"

  | "empty"

  | "error"

\`\`\`

Não é obrigatório utilizar esse tipo literalmente.

O comportamento deverá existir.

\---

**# 21. Estado vazio**

Não utilizar dados falsos apenas para impedir que uma tela fique vazia.

Exemplo:

\`\`\`text

Nenhum produto cadastrado.

[Adicionar produto]

\`\`\`

Também deverão existir estados vazios adequados para:

\- serviços;

\- vendas;

\- despesas;

\- despesas recorrentes;

\- Portfólio;

\- resultados de busca administrativa.

\---

**# 22. Erros**

O backend deverá retornar erros interpretáveis pela interface.

Exemplos conceituais:

\`\`\`text

UNAUTHORIZED

FORBIDDEN

VALIDATION\_ERROR

NOT\_FOUND

INSUFFICIENT\_STOCK

CONFLICT

RATE\_LIMITED

ACCOUNT\_INACTIVE

INTERNAL\_ERROR

\`\`\`

A interface transforma o erro técnico em mensagem humana.

Exemplo:

\`\`\`text

INSUFFICIENT\_STOCK

\`\`\`

vira:

*> Não há estoque suficiente para concluir esta venda.*

Textos funcionais específicos pertencem ao documento de Fluxo Técnico.

\---

**# 23. Dinheiro no frontend**

A interface poderá trabalhar com valores numéricos para exibição e cálculos temporários.

Exemplo:

\`\`\`ts

35

\`\`\`

Exibição:

\`\`\`text

R$ 35,00

\`\`\`

Criar função central de formatação.

Exemplo:

\`\`\`ts

formatCurrency(35)

\`\`\`

Evitar repetir lógica de formatação em vários componentes.

\---

**# 24. Total da venda**

O frontend calcula o total para mostrar ao barbeiro.

Exemplo:

\`\`\`text

Corte        R$ 35,00

Coca-Cola     R$ 6,00

Total        R$ 41,00

\`\`\`

Esse total é apenas visual.

Ao finalizar:

\`\`\`text

Frontend

 ↓

IDs + quantidades

 ↓

Backend

 ↓

Busca dados atuais

 ↓

Recalcula

\`\`\`

O backend não deverá confiar em:

\- preço;

\- custo;

\- subtotal;

\- total;

enviados pelo navegador.

\---

**# 25. Comanda**

A comanda em edição pertence ao estado temporário do frontend.

Enquanto não for finalizada:

\- não é uma venda;

\- não precisa existir no banco;

\- não altera estoque;

\- não altera financeiro.

Serviços:

\- podem ser adicionados uma única vez na mesma comanda;

\- não possuem quantidade.

Produtos:

\- possuem quantidade;

\- não podem ultrapassar o estoque disponível.

Somente após confirmação do backend a venda existe oficialmente.

\---

**# 25.1 Imagens de categorias e produtos**

O frontend deverá distinguir:

\`\`\`text

imagem padrão da categoria
≠
imagem personalizada do produto

\`\`\`

A imagem padrão pertence à categoria.

A imagem personalizada pertence ao produto.

**## Categorias sugeridas**

Categorias sugeridas pelo Estilo e Gestão poderão receber:

\`\`\`ts

imagemPadraoPath: string | null

\`\`\`

Exemplo de mock:

\`\`\`ts

const categoriaPomadaMock: CategoriaProduto = {
  id: "categoria-pomada",
  barbeariaId: "barbearia-1",
  nome: "Pomada",
  imagemPadraoPath: "/sistema/categorias/pomada.webp",
  ativo: true,
}

\`\`\`

Categorias personalizadas deverão iniciar com:

\`\`\`ts

imagemPadraoPath: null

\`\`\`

O frontend não deverá inventar automaticamente uma imagem para uma categoria personalizada.

**## Produto**

O contrato deverá possuir:

\`\`\`ts

imagemPath: string | null
usarImagemCategoria: boolean

\`\`\`

No fluxo atual:

\`\`\`text

usarImagemCategoria = true por padrão

\`\`\`

**## Resolver imagem efetiva**

A regra deverá ser centralizada em uma função ou camada de transformação reutilizável.

Evitar repetir a mesma decisão em:

\- Produtos;

\- PDV;

\- Estoque;

\- Vitrine;

\- cards;

\- modais.

Exemplo conceitual:

\`\`\`ts

type ImagemEfetivaProduto =
  | {
      tipo: "PERSONALIZADA"
      src: string
    }
  | {
      tipo: "CATEGORIA"
      src: string
    }
  | {
      tipo: "SEM_IMAGEM"
      src: null
    }

function resolverImagemProduto(
  produto: Produto,
  categoria: CategoriaProduto
): ImagemEfetivaProduto {
  if (produto.imagemPath) {
    return {
      tipo: "PERSONALIZADA",
      src: produto.imagemPath,
    }
  }

  if (
    produto.usarImagemCategoria &&
    categoria.imagemPadraoPath
  ) {
    return {
      tipo: "CATEGORIA",
      src: categoria.imagemPadraoPath,
    }
  }

  return {
    tipo: "SEM_IMAGEM",
    src: null,
  }
}

\`\`\`

O nome da função poderá ser ajustado.

A regra funcional deverá permanecer:

\`\`\`text

1. imagemPath existe
   → usar imagem personalizada

2. imagemPath = null
   + usarImagemCategoria = true
   + imagemPadraoPath existe
   → usar imagem padrão da categoria

3. demais casos
   → sem imagem

\`\`\`

Quando não houver imagem efetiva, o componente poderá usar o placeholder definido pelo Design System.

**## Upload de imagem personalizada**

Fluxo:

\`\`\`text

Selecionar arquivo
↓
Preview local
↓
Validação
↓
Upload para Storage
↓
Receber referência
↓
Salvar produto.imagemPath
↓
Atualizar interface

\`\`\`

Esse fluxo não altera a imagem padrão da categoria.

**## Remover imagem personalizada**

Quando houver imagem padrão na categoria, o frontend deverá permitir escolher:

\`\`\`text

Usar imagem padrão da categoria
ou
Ficar sem imagem

\`\`\`

Se escolher usar a padrão:

\`\`\`ts

imagemPath = null
usarImagemCategoria = true

\`\`\`

Se escolher ficar sem imagem:

\`\`\`ts

imagemPath = null
usarImagemCategoria = false

\`\`\`

Se a categoria não possuir imagem padrão, não oferecer uma opção sem efeito.

**## Troca de categoria**

Quando o produto não possuir imagem personalizada e utilizar fallback da categoria, trocar a categoria deverá atualizar automaticamente a imagem efetiva.

Exemplo:

\`\`\`text

Pomada
→ imagem padrão de Pomada

troca de categoria

Shampoo
→ imagem padrão de Shampoo

\`\`\`

Se existir imagem personalizada, trocar a categoria não deverá substituí-la.

**## Mock de produto com fallback**

\`\`\`ts

const produtoMock: Produto = {
  id: "produto-1",
  barbeariaId: "barbearia-1",
  categoriaId: "categoria-pomada",
  nome: "Pomada Matte",
  descricao: null,
  estoqueAtual: 8,
  estoqueMinimo: 2,
  precoCusto: 18,
  precoVenda: 35,
  imagemPath: null,
  usarImagemCategoria: true,
  ativo: true,
  visivelVitrine: true,
}

\`\`\`

Nesse exemplo, a imagem exibida poderá vir da categoria.

\---

**# 26. Estoque**

O frontend poderá exibir:

- estoque atual;
- estoque mínimo;
- situação do produto;
- busca e filtros;
- histórico de movimentações;
- detalhes do produto.

A lista deve utilizar linguagem simples. Exemplo de ações de interface:

```text
Repor
Atualizar
Ver histórico
```

Ao atualizar um produto, o usuário escolhe:

```text
Adicionar estoque
Corrigir contagem
Registrar perda
```

O frontend nunca deverá alterar o saldo oficial apenas fazendo algo equivalente a:

```ts
produto.estoqueAtual = novoValor
```

A mudança oficial ocorre no servidor através de uma movimentação validada.

---

**# 27. Adicionar estoque / REPOSICAO**

O frontend deverá:

1. receber Produto e Quantidade;
2. aceitar Custo unitário como informação opcional quando a interface utilizar esse campo;
3. calcular visualmente a referência de custo quando preenchida;
4. mostrar Estoque atual → Novo estoque;
5. enviar a movimentação ao backend.

A reposição:

- aumenta o estoque;
- cria histórico de movimentação;
- pode atualizar o custo de referência do produto somente se a regra de backend correspondente estiver definida;
- **não cria uma despesa financeira automaticamente**.

Se a compra precisar aparecer no Financeiro, o lançamento financeiro é registrado separadamente.

Não perguntar "Registrar no Financeiro?" dentro da reposição, porque essa integração automática não faz parte da regra atual.

---

**# 28. Corrigir contagem e registrar perda**

**Corrigir contagem / AJUSTE**

O frontend deverá solicitar:

- produto;
- direção do ajuste: Entrada (+) ou Saída (-);
- quantidade positiva da diferença;
- observação opcional.

O backend registra `AJUSTE` e impede saldo negativo.

**Registrar perda / PERDA**

O frontend deverá solicitar:

- produto;
- quantidade perdida;
- observação opcional.

A quantidade perdida não pode ultrapassar o estoque disponível.

A perda:

- reduz estoque;
- registra histórico;
- não cria nova saída financeira automaticamente.

---

**# 29. Vendas canceladas e reversão de estoque**

O frontend deve conseguir exibir vendas com status `CANCELADA` e movimentações `REVERSAO_VENDA` quando existirem.

O protótipo atual de Histórico de vendas é de consulta e não expõe um botão de cancelamento/estorno.

Não implementar uma ação de cancelar venda apenas porque o enum existe. Um fluxo de cancelamento deverá ser documentado e aprovado antes de ser exposto na interface.

---

**# 30. Despesas**

O frontend deverá diferenciar:

\`\`\`text

Despesa avulsa

\`\`\`

de:

\`\`\`text

Despesa recorrente

\`\`\`

Uma despesa avulsa representa uma saída financeira já registrada.

Uma recorrência representa uma configuração para gastos futuros.

\---

**# 31. Despesas recorrentes**

Uma recorrência poderá gerar ocorrências com status:

\`\`\`text

PENDENTE

PAGA

IGNORADA

\`\`\`

Uma ocorrência *\`PENDENTE\`* não deverá ser tratada como dinheiro já gasto.

A saída financeira ocorre somente ao selecionar:

\`\`\`text

Marcar como paga

\`\`\`

Nesse momento, o frontend poderá solicitar:

\- valor efetivamente pago;

\- data de pagamento.

Também deverá permitir:

\- Ignorar neste mês;

\- editar recorrência para períodos futuros;

\- desativar recorrência.

\---

**# 32. Datas**

Dados de eventos deverão ser enviados ao backend em formato consistente.

Exemplos:

\- venda;

\- criação;

\- cancelamento;

\- movimentação de estoque;

\- pagamento de despesa recorrente.

O banco utilizará timestamps com timezone quando necessário.

A interface converte para apresentação local.

Evitar armazenar:

\`\`\`text

08/09/2026

\`\`\`

como valor estrutural.

Esse formato serve para exibição.

Datas civis, como data de uma despesa, poderão utilizar o formato correspondente definido pelo backend.

\---

**# 33. Enums e opções**

Opções conhecidas não devem existir como textos aleatórios espalhados pelo frontend.

Exemplo:

\`\`\`ts

export const formasPagamento = [

  "PIX",

  "DINHEIRO",

  "DEBITO",

  "CREDITO",

  "OUTRO",

] as const

export type FormaPagamento =

  (typeof formasPagamento)[number]

export const temasSistema = [

  "CLARO",

  "ESCURO",

  "SISTEMA",

] as const

\`\`\`

A mesma enumeração de formas de pagamento poderá ser reutilizada em dois contextos diferentes:

\- formas aceitas pela barbearia;

\- forma registrada em uma venda específica.

Os contratos não deverão confundir esses dois significados.

Também poderá ser utilizado para:

\- tipos de usuário;

\- status de venda;

\- tipos de movimentação;

\- status de ocorrência recorrente;

\- tema do sistema.

Exemplo:

\`\`\`ts

export const tiposUsuario = [

  "BARBEIRO",

  "ADMIN",

] as const

\`\`\`

Categorias de produto não são enum fixo porque podem ser personalizadas.

Categorias de despesas, no MVP, são predefinidas pelo sistema.

\---

**# 34. Dados da sessão**

O frontend poderá saber que existe um usuário autenticado e receber informações necessárias para montar a interface.

Exemplo conceitual:

\`\`\`ts

type SessaoAplicacao = {

  userId: string

  tipo: "BARBEIRO" | "ADMIN"

}

\`\`\`

Para um barbeiro, também poderão ser disponibilizadas informações relacionadas à barbearia quando necessárias.

Mesmo assim, o frontend não deverá decidir sozinho:

\`\`\`text

este usuário pode acessar esta barbearia

\`\`\`

Essa relação deverá ser validada pelo servidor e pelo banco.

\---

**# 35. Menus por tipo**

A interface poderá exibir navegações diferentes conforme o tipo de usuário.

## BARBEIRO

Navegação principal:

```text
Dashboard
PDV
Operação
Configurações
```

Estrutura interna:

```text
PDV
├── Nova venda
└── Histórico de vendas

Operação
├── Serviços
├── Produtos
│   └── Categorias
└── Estoque

Configurações
├── Negócio
│   ├── Financeiro
│   ├── Relatórios
│   └── Vitrine Digital
│       └── Portfólio
└── Barbearia
    ├── Dados da barbearia
    ├── Endereço
    ├── Horários
    └── Formas de pagamento

Sua conta
├── Perfil
├── Aparência
├── Alterar senha
├── Minha assinatura
└── Zona de perigo
```

Desktop utiliza sidebar recolhível. Mobile utiliza barra inferior fixa com quatro destinos.

## ADMIN

A navegação administrativa é própria e não reutiliza automaticamente a navegação do barbeiro.

---

**# 36. Vitrine pública**

A Vitrine deve utilizar um contrato público separado do administrativo.

Exemplo:

\`\`\`ts

type VitrinePublica = {

  nomeMarca: string

  nomeProfissional: string | null

  descricao: string | null

  whatsapp: string | null

  instagram: string | null

  atendeDomicilio: boolean

  formasPagamentoAceitas: FormaPagamento[]

  endereco: EnderecoPublico | null

  horarios: HorarioPublico[]

  servicos: ServicoPublico[]

  produtos: ProdutoPublico[]

  portfolio: PortfolioPublico[]

}

\`\`\`

Não utilizar o objeto administrativo completo e esconder campos com CSS.

As formas de pagamento aceitas poderão ser incluídas no contrato público quando a Vitrine as exibir.

Esse campo representa meios normalmente aceitos pela barbearia e não deve ser derivado das vendas históricas.

\---

**# 37. Produto público**

A Vitrine poderá receber:

\- nome;

\- descrição;

\- categoria;

\- preço de venda;

\- imagem efetiva;

\- estado público de disponibilidade.

O contrato público deverá preferencialmente receber a imagem já resolvida pelo backend ou por uma camada segura de transformação.

Exemplo conceitual:

\`\`\`ts

type ProdutoPublico = {
  nome: string
  descricao: string | null
  categoria: string
  precoVenda: number
  imagemUrl: string | null
  disponibilidade: "DISPONIVEL" | "INDISPONIVEL"
}

\`\`\`

O contrato público não precisa expor:

\`\`\`text

imagemPath
imagemPadraoPath
usarImagemCategoria

\`\`\`

Esses campos são detalhes internos.

A imagem pública deverá respeitar:

\`\`\`text

imagem personalizada
↓
imagem padrão da categoria
↓
sem imagem

\`\`\`

Não deverá receber:

\- preço de custo;

\- estoque mínimo;

\- quantidade interna;

\- movimentações;

\- informações financeiras;

\- caminhos internos desnecessários do Storage.

Quando o estoque for zero, o comportamento seguirá a configuração da Vitrine:

\- Ocultar;

\- Mostrar como Indisponível.

\---

**# 38. Serviço público**

Pode receber:

\- nome;

\- descrição;

\- preço.

Não deverá receber:

\- custo estimado de insumos.

Somente serviços:

\- ativos;

\- marcados para exibição pública;

deverão ser enviados.

\---

**# 39. Criar e publicar Vitrine**

Antes da Vitrine existir publicamente, o frontend deverá permitir:

\- configurar dados;

\- visualizar prévia;

\- selecionar **\*\*Gerar URL\*\***.

Se houver informações opcionais ausentes:

\- mostrar quais não serão exibidas;

\- permitir voltar;

\- permitir continuar.

Após continuar:

\`\`\`text

Criando sua Vitrine...

\`\`\`

Nesse período:

\- bloquear novo envio;

\- aguardar o backend gerar e validar o slug;

\- aguardar criação/publicação;

\- não gerar a URL somente no navegador.

Após sucesso, receber do backend:

\`\`\`text

URL pública

\`\`\`

e permitir:

\- Copiar URL;

\- Visualizar Vitrine.

\---

**# 40. Slug**

O slug é gerado no backend.

O frontend não deverá assumir que transformar o nome da barbearia em texto minúsculo já garante uma URL válida.

O backend deverá:

\- normalizar;

\- adicionar identificador público;

\- impedir palavras reservadas;

\- verificar unicidade.

Depois de criada a Vitrine, alterar o nome da barbearia não deverá alterar automaticamente a URL existente.

\---

**# 41. Uploads**

Durante prototipação, imagem local poderá ser utilizada apenas para demonstrar a interface.

Na implementação real:

\`\`\`text

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

\`\`\`

Não salvar Base64 como solução definitiva.

Uploads pertencentes à barbearia poderão incluir:

\- logo;

\- capa;

\- imagem personalizada de produto;

\- Portfólio.

As imagens padrão das categorias sugeridas são diferentes.

Elas são recursos oficiais do Estilo e Gestão e não são enviadas pelo barbeiro durante o uso normal.

O frontend não deverá permitir que um usuário comum substitua ou exclua essas imagens oficiais.

\---

**# 42. Preview de imagem**

O preview poderá utilizar:

\`\`\`text

URL.createObjectURL()

\`\`\`

ou mecanismo equivalente.

O preview:

\- não representa upload concluído;

\- deverá ser liberado da memória quando não for mais necessário.

\---

**# 43. Supabase Storage**

Separar arquivos por contexto quando apropriado.

Exemplo:

\`\`\`text

sistema/
  categorias/
    bebida.webp
    pomada.webp
    shampoo.webp
    cera.webp
    oleo-balm.webp
    acessorios.webp
    outros.webp

barbearias/
  {barbeariaId}/
    logo/
    capa/
    produtos/
    portfolio/

\`\`\`

A área:

\`\`\`text

sistema/categorias/

\`\`\`

contém arquivos compartilhados e mantidos pelo Estilo e Gestão.

A área:

\`\`\`text

barbearias/{barbeariaId}/

\`\`\`

contém arquivos personalizados do tenant.

As policies deverão:

\- impedir que uma barbearia altere arquivos de outra;

\- impedir que barbeiros modifiquem arquivos oficiais do sistema;

\- permitir somente as operações necessárias em cada contexto.

A estrutura definitiva deverá respeitar as policies.

\---

**# 44. ViaCEP**

O frontend poderá consultar ViaCEP para melhorar a experiência.

Fluxo:

\`\`\`text

CEP

 ↓

ViaCEP

 ↓

Rua

Bairro

Cidade

Estado

\`\`\`

Se a consulta falhar:

\- manter formulário utilizável;

\- permitir preenchimento manual.

Não transformar ViaCEP em requisito obrigatório para salvar o endereço.

\---

**# 45. Tema do sistema**

O frontend deverá considerar três opções:

\`\`\`text

CLARO

ESCURO

SISTEMA

\`\`\`

ou nomes equivalentes definidos na implementação.

A preferência pertence ao usuário e deverá ser persistida no perfil.

Durante o Onboarding, a escolha ocorre na Etapa 6 — Aparência e conclusão.

Depois do Onboarding, o usuário poderá alterar essa preferência na área correspondente de Perfil/Conta ou Configurações, conforme a interface final.

O frontend poderá utilizar um tipo central:

\`\`\`ts

export type TemaSistema =

  | "CLARO"

  | "ESCURO"

  | "SISTEMA"

\`\`\`

No modo:

\`\`\`text

SISTEMA

\`\`\`

a interface deverá acompanhar a preferência do dispositivo.

A troca de tema na interface não deverá depender de *\`localStorage\`* como fonte oficial. Um armazenamento local poderá ser utilizado apenas como otimização visual para evitar flashes, desde que o valor persistido no backend continue sendo a preferência oficial do usuário.

A escolha de tema da área autenticada não altera automaticamente a aparência pública da Vitrine.

A regra visual completa pertence aos documentos de Design.

\---

**# 46. Assistente IA**

O frontend nunca chama Gemini diretamente.

Fluxo:

\`\`\`text

Visitante

 ↓

Frontend

 ↓

Endpoint do Estilo e Gestão

 ↓

Validação

 ↓

Rate limit

 ↓

Contexto público

 ↓

Gemini API

\`\`\`

A chave da API permanece somente no servidor.

\---

**# 47. Contexto da IA**

Não montar contexto utilizando objeto administrativo completo.

Criar função específica.

Exemplo:

\`\`\`ts

getPublicAssistantContext(barbeariaId)

\`\`\`

Essa função deverá retornar somente campos autorizados.

Quando configuradas como informação pública, as formas de pagamento aceitas pela barbearia poderão fazer parte desse contexto.

O frontend nunca deverá possuir uma versão administrativa completa apenas para extrair o contexto da IA.

\---

**# 48. Rate limit e timeout da IA**

O comportamento funcional atual prevê:

\`\`\`text

Máximo de 10 mensagens por minuto por visitante

Máximo de 20 mensagens por conversa

Máximo inicial de 1.000 respostas por ciclo mensal da barbearia

\`\`\`

e:

\`\`\`text

Timeout de 15 segundos

\`\`\`

O frontend deverá tratar respostas correspondentes a:

\- proteção temporária contra abuso;

\- conversa encerrada no limite;

\- aviso de 80% da cota mensal;

\- cota mensal esgotada em 100%;

\- timeout;

\- indisponibilidade;

\- sucesso.

A aplicação não deverá expor detalhes técnicos do fornecedor.

O conteúdo das mensagens existe somente durante a conversa atual e não deverá ser enviado para persistência no banco. Somente contadores e identificadores temporários indispensáveis à proteção podem ser mantidos.

\---

**# 49. Mock do Dashboard**

O mock do Dashboard deve representar os indicadores aprovados sem inventar análises adicionais.

Exemplo conceitual:

```ts
const dashboardMock = {
  faturamento: 1250,
  entradas: 1250,
  saidas: 430,
  resultadoEstimado: 820,
  servicosRealizados: 18,
  bebidasVendidas: 12,
  outrosProdutosVendidos: 5,
  estoqueBaixo: 2,
}
```

Também poderá existir mock separado para:

- evolução no período;
- produtos com estoque baixo;
- estado de primeiro acesso;
- estado sem movimentações no período.

Não criar mock de "Detalhamento gerencial" no Dashboard como requisito obrigatório. Análises detalhadas pertencem a Relatórios.

---

**# 50. Mock de vendas**

Utilizar exemplos próximos da estrutura real.

\`\`\`ts

const vendasMock = [

  {

    id: "venda-1",

    status: "CONCLUIDA",

    formaPagamento: "PIX",

    totalBruto: 41,

    createdAt: "2026-09-08T18:30:00-03:00",

  },

]

\`\`\`

Não adicionar campos fora do MVP como:

\- cliente;

\- agendamento;

\- sinal Pix;

\- comissão;

\- funcionário.

**## Formas de pagamento aceitas**

Manter um mock separado quando a tela precisar representar as formas aceitas pela barbearia:

\`\`\`ts

const formasPagamentoAceitasMock: FormaPagamento[] = [

  "PIX",

  "DINHEIRO",

  "DEBITO",

  "CREDITO",

]

\`\`\`

Não confundir esse conjunto com *\`venda.formaPagamento\`*.

\---

**# 51. Mock de despesas recorrentes**

Durante prototipação:

\`\`\`ts

const despesasRecorrentesMock = [

  {

    id: "recorrencia-1",

    nome: "Internet",

    categoria: "Internet",

    valorPrevisto: 100,

    frequencia: "MENSAL",

    diaVencimento: 10,

    ativa: true,

  },

]

\`\`\`

Uma ocorrência poderá ser representada separadamente:

\`\`\`ts

const ocorrenciaMock = {

  id: "ocorrencia-1",

  recorrenciaId: "recorrencia-1",

  valorPrevisto: 100,

  valorPago: null,

  status: "PENDENTE",

}

\`\`\`

Não confundir uma recorrência com uma saída financeira já realizada.

\---

**# 52. Mock de Vitrine**

Simular apenas dados públicos.

Exemplo conceitual:

\`\`\`ts

const vitrineMock: VitrinePublica = {

  nomeMarca: "Barbearia Imperial",

  nomeProfissional: "Carlos",

  descricao: null,

  whatsapp: "5513999999999",

  instagram: null,

  atendeDomicilio: false,

  formasPagamentoAceitas: [

    "PIX",

    "DINHEIRO",

    "DEBITO",

    "CREDITO",

  ],

  endereco: null,

  horarios: [],

  servicos: [],

  produtos: [],

  portfolio: [],

}

\`\`\`

Isso permite detectar vazamentos conceituais durante a prototipação.

O mock não deverá conter campos privados para depois escondê-los visualmente.

As formas aceitas representam configuração pública da barbearia. Não calcular esse campo analisando as formas utilizadas em vendas anteriores.

\---

**# 53. Mock do Painel Administrativo**

Mocks da área administrativa devem ser separados dos dados da barbearia.

Exemplo conceitual:

\`\`\`ts

const barbeariasAdminMock = [

  {

    id: "barbearia-1",

    nomeMarca: "Barbearia Imperial",

    codigo: "EG-7K2M9Q",

    plano: "NORMAL",

    statusConta: "ATIVA",

    fimPeriodo: "2026-10-18T23:59:59Z",

  },

]

\`\`\`

Não incluir desnecessariamente:

\- vendas completas;

\- despesas;

\- estoque detalhado;

\- segredos;

\- senhas;

\- tokens.

A prototipação do painel administrativo deverá mostrar apenas dados necessários para as funções previstas.

\---

**# 54. Ações administrativas**

O frontend poderá solicitar ações como:

\- localizar barbearia por nome ou código;

\- confirmar pagamento real;

\- conceder cortesia;

\- alterar plano e validade;

\- agendar ou cancelar downgrade;

\- cancelar assinatura paga;

\- suspender ou reativar conta;

\- controlar manutenção global;

\- consultar histórico administrativo permitido.

Fluxo:

\`\`\`text

Painel Administrativo

 ↓

Ação

 ↓

Backend

 ↓

Validar sessão

 ↓

Validar tipo = ADMIN

 ↓

Executar ação permitida

\`\`\`

Nunca:

\`\`\`text

Frontend

 ↓

Atualiza diretamente qualquer tenant

\`\`\`

sem validação administrativa no servidor.

\---

**# 55. Remoção dos mocks**

Quando o backend estiver pronto:

1\. substituir implementação da camada de dados;

2\. manter contratos das telas;

3\. remover imports diretos dos mocks;

4\. verificar estados vazios;

5\. verificar estados de erro;

6\. validar autorização real;

7\. apagar mocks sem utilidade.

Mocks poderão continuar sendo utilizados em:

\- testes;

\- desenvolvimento isolado;

\- ferramentas de componentes, caso adotadas.

\---

**# 56. Não misturar mock e produção**

Evitar:

\`\`\`ts

const produtos =

  process.env.NODE\_ENV === "production"

    ? await supabase...

    : produtosMock

\`\`\`

espalhado pelo projeto.

A origem dos dados deverá ser definida em uma camada central.

\---

**# 57. Repositórios e serviços**

Separação possível:

\`\`\`text

produtoRepository

 ↓

consulta banco

produtoService

 ↓

aplica regra

tela

 ↓

usa serviço/action

\`\`\`

Também poderá existir algo equivalente para autorização:

\`\`\`text

authorizationService

 ↓

verifica perfil e tipo

\`\`\`

Para um MVP pequeno, não é necessário criar dezenas de abstrações.

Criar somente as que possuam função clara.

\---

**# 58. Preparação para paginação**

Listas que podem crescer deverão permitir futura paginação sem reescrever a tela.

Principalmente:

\- vendas;

\- movimentações de estoque;

\- despesas;

\- ocorrências de despesas recorrentes;

\- Portfólio;

\- listagem de barbearias do Painel Administrativo.

Não carregar anos de histórico de uma só vez.

\---

**# 59. Busca e filtros**

Filtros visuais não deverão modificar diretamente o banco.

Fluxo:

\`\`\`text

Filtro

 ↓

Parâmetros

 ↓

Consulta

 ↓

Resultado

\`\`\`

Isso vale também para pesquisas no Painel Administrativo.

\---

**# 60. Variáveis de ambiente**

O frontend nunca deverá conter segredos fixos no código.

Variáveis e chaves estão documentadas em:

*\`ENV\_SETUP.md\`*

Dados como:

\`\`\`text

tipo = ADMIN

\`\`\`

também não devem ser definidos por variável pública ou segredo improvisado para conceder acesso.

\---

**# 61. Critérios antes da integração**

Antes de conectar o backend real, deverão estar preparados:

\- tipos principais;

\- tipo *\`BARBEIRO | ADMIN\`*;

\- tipo *\`CLARO | ESCURO | SISTEMA\`* para tema;

\- tipo central de formas de pagamento;

\- contrato para formas de pagamento aceitas pela barbearia;

\- contratos das 6 etapas do Onboarding;

\- mocks seguindo os tipos;

\- mocks administrativos separados;

\- componentes sem imports de mocks espalhados;

\- schemas Zod;

\- estados Loading;

\- estados Empty;

\- estados Error;

\- formulários com estado de envio;

\- PDV separado da persistência;

\- despesas recorrentes representadas corretamente;

\- dados públicos separados dos administrativos;

\- dados administrativos do SaaS separados dos dados do tenant;

\- uploads sem dependência de Base64;

\- formatação monetária centralizada;

\- datas tratadas de forma consistente;

\- fluxo visual de Login preparado para redirecionamento por tipo;

\- retomada do Onboarding preparada através de *\`onboardingEtapa\`* e *\`onboardingConcluido\`*;

\- preferência de tema preparada para persistência por usuário;

\- formas de pagamento aceitas separadas da forma de pagamento de cada venda;

\- contrato público da Vitrine preparado para expor somente as formas aceitas quando aplicável;

\- rotas da barbearia e rotas administrativas conceitualmente separadas.

\---

**# 62. O que muda ao conectar o backend**

Principalmente:

\`\`\`text

Mock Repository

\`\`\`

será substituído por:

\`\`\`text

Supabase Repository

\`\`\`

As operações de escrita passarão a utilizar funções server-side.

A autenticação real passará a fornecer a identidade através do Supabase Auth.

O backend passará a validar:

\- tipo da conta;

\- progresso e conclusão do Onboarding;

\- preferência de tema salva;

\- formas de pagamento aceitas;

\- imagens padrão das categorias;

\- imagem personalizada e regra de fallback dos produtos;

\- barbearia;

\- propriedade dos registros;

\- permissões administrativas.

As telas não deverão ser reconstruídas apenas porque a origem dos dados mudou.

\---

**# 63. Critério de conclusão**

O frontend estará preparado para o backend quando:

\- a interface não depender diretamente de dados hardcoded;

\- mocks respeitarem os contratos planejados;

\- dados simulados puderem ser substituídos pela camada real;

\- *\`BARBEIRO\`* e *\`ADMIN\`* estiverem representados corretamente;

\- o cadastro não permitir escolher *\`ADMIN\`*;

\- o frontend não possuir autoridade para alterar o próprio tipo;

\- o Login estiver preparado para redirecionar conforme o tipo;

\- as 6 etapas do Onboarding estiverem representadas pelos contratos corretos;

\- a retomada do Onboarding utilizar o progresso persistido;

\- a preferência *\`CLARO | ESCURO | SISTEMA\`* estiver representada e preparada para persistência por usuário;

\- as formas de pagamento aceitas pela barbearia estiverem separadas de *\`vendas.formaPagamento\`*;

\- categorias sugeridas suportarem *\`imagemPadraoPath\`*;

\- categorias personalizadas iniciarem sem imagem padrão;

\- produtos suportarem *\`imagemPath\`* e *\`usarImagemCategoria\`*;

\- a resolução da imagem efetiva estiver centralizada e reutilizável;

\- o contrato público da Vitrine receber somente a imagem necessária para apresentação;

\- arquivos oficiais do sistema estiverem separados dos uploads dos tenants;

\- rotas administrativas estiverem separadas das rotas da barbearia;

\- autorização administrativa estiver prevista para validação no servidor;

\- mutações críticas estiverem preparadas para execução server-side;

\- dados públicos e privados estiverem separados;

\- dados do Painel Administrativo estiverem limitados ao necessário;

\- Loading, Empty e Error existirem;

\- PDV não confiar no navegador para valores finais;

\- reposição atualizar estoque sem gerar saída financeira automática pelo backend;

\- despesas recorrentes não forem tratadas como pagas antes da confirmação;

\- Vitrine utilizar contrato público próprio;

\- o contrato público da Vitrine puder incluir as formas de pagamento aceitas sem expor dados privados;

\- criação da Vitrine depender do backend para gerar e validar o slug;

\- segredos não existirem no frontend;

\- nenhuma funcionalidade fora do MVP tiver sido inserida apenas para preencher telas.

\---

# 59. Contratos de planos e assinatura

```ts
export type PlanoCodigo = "GRATIS" | "NORMAL" | "COM_IA"

export type Recurso =
  | "VITRINE"
  | "PORTFOLIO"
  | "PDV"
  | "ESTOQUE"
  | "FINANCEIRO"
  | "RELATORIOS"
  | "EXPORTACOES"
  | "ASSISTENTE_IA"

export type AssinaturaAtual = {
  planoEfetivo: PlanoCodigo
  origemPeriodo: "GRATIS" | "PAGAMENTO" | "CORTESIA"
  inicioPeriodo: string | null
  fimPeriodo: string | null
  proximoPlano: PlanoCodigo | null
  mudancaAgendadaPara: string | null
  cancelamentoAgendado: boolean
}
```

As permissões deverão existir em um único mapa no domínio:

```ts
const recursosPorPlano: Record<PlanoCodigo, ReadonlySet<Recurso>> = {
  GRATIS: new Set(["VITRINE", "PORTFOLIO"]),
  NORMAL: new Set([
    "VITRINE", "PORTFOLIO", "PDV", "ESTOQUE",
    "FINANCEIRO", "RELATORIOS", "EXPORTACOES",
  ]),
  COM_IA: new Set([
    "VITRINE", "PORTFOLIO", "PDV", "ESTOQUE",
    "FINANCEIRO", "RELATORIOS", "EXPORTACOES", "ASSISTENTE_IA",
  ]),
}
```

`hasFeature` serve para experiência da interface. A autorização final permanece no servidor e calcula o plano efetivo usando a validade.

# 60. Somente leitura no Grátis

As consultas históricas continuam disponíveis, porém as mutações pagas retornam erro de domínio padronizado. O frontend não deverá esconder dados antigos nem confiar apenas em botões desabilitados.

```ts
export type BloqueioPlano = {
  recurso: Recurso
  planoMinimo: "NORMAL" | "COM_IA"
  titulo: string
  descricao: string
}
```

O mesmo componente deverá funcionar como página, painel ou estado interno conforme a rota.

# 61. Camada de assinatura

Criar contratos separados para:

- buscar assinatura efetiva;
- listar pagamentos reais;
- solicitar cancelamento ou desfazer cancelamento;
- solicitar downgrade ou desfazer downgrade;
- ações administrativas de confirmação e mudança de plano.

Nunca calcular vencimento mensal no componente visual. O backend calcula o ciclo e devolve datas prontas.

# 62. Área administrativa atualizada

Rotas iniciais:

```text
/admin
/admin/barbearias
/admin/barbearias/{id}
```

Não criar `/admin/assinaturas` na versão inicial.

O contrato da lista contém apenas nome, código, plano e status. O contrato de detalhes adiciona responsável, contato, datas, assinatura, pagamentos e histórico administrativo permitido. Ele nunca inclui vendas, despesas, estoque ou relatórios privados.

# 63. Status global e guards

A ordem de decisão antes de montar a área autenticada deverá considerar:

1. sessão válida;
2. manutenção global;
3. papel do usuário;
4. status `ATIVA` ou `SUSPENSA`;
5. plano efetivo e recurso solicitado.

ADMIN atravessa o guard de manutenção para poder encerrá-la. Conta suspensa não monta o shell do barbeiro. Estado offline cobre a interface já montada e preserva a rota para retorno.

# 64. Exclusão definitiva

A exclusão deve ser uma operação única do servidor, nunca uma sequência de `delete` executada pelo navegador.

Contrato mínimo:

```ts
export type ExcluirContaInput = {
  senhaAtual: string
  frase: "EXCLUIR MINHA CONTA"
}
```

O cliente deverá bloquear envios repetidos, invalidar cache e sessão após sucesso e redirecionar para uma confirmação neutra. Não oferecer botão de restaurar.

A exceção administrativa utiliza endpoint distinto, justificativa obrigatória e frase `EXCLUIR EG-XXXXXX`.

# 65. Retenção e privacidade

O frontend comum não possui rota para retenções. Uma consulta eventual é técnica, restrita e auditada. Não reutilizar os tipos completos de `Barbearia` para representar uma retenção.

# 66. Assistente IA

O servidor mantém o histórico da conversa somente em memória/contexto da requisição atual. O banco recebe apenas uso agregado do ciclo.

```ts
export type UsoIa = {
  respostasUsadas: number
  limite: number
  percentual: number
  bloqueado: boolean
}
```

Aplicar máximo de 20 mensagens por conversa, 1.000 respostas por ciclo, aviso em 80%, bloqueio em 100%, rate limit e timeout. Nenhum endpoint administrativo poderá retornar conteúdo de conversa.

# 67. Aceites legais

O cadastro deverá enviar as versões exibidas dos Termos e da Política. O backend registra os aceites e rejeita versões ausentes ou diferentes das publicadas.

# 68. Produção e primeiro uso real

Separar ambientes de desenvolvimento e produção. Antes de usar dados reais, validar Auth, Storage, RLS, isolamento, variáveis, backup diário, restauração e monitoramento de erros.

O endereço temporário da Vercel é permitido para o primeiro barbeiro. Antes da divulgação, configurar domínio definitivo, HTTPS, URLs de redirecionamento do Auth e links públicos da Vitrine.
