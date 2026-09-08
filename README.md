# Estilo e Gestão

Sistema web para **gestão e divulgação de pequenas barbearias**.

O Estilo e Gestão foi criado para ajudar barbeiros autônomos e pequenas barbearias a organizar a operação do negócio e divulgar seus serviços através de uma única plataforma.

---

## Sobre o projeto

O projeto surgiu a partir da conversa com um profissional da área de barbearia, que relatou necessidades relacionadas principalmente a:

- registro de vendas;
- controle financeiro;
- controle de produtos e bebidas;
- estoque;
- divulgação dos trabalhos realizados.

A proposta é oferecer uma solução simples, rápida e adequada à rotina de uma pequena barbearia.

---

## Principais funcionalidades

### Gestão

- Dashboard;
- cadastro de serviços;
- cadastro de produtos e bebidas;
- categorias de produtos;
- controle de estoque;
- reposição de estoque;
- ajustes e perdas;
- PDV/Comanda;
- histórico de vendas;
- cancelamento de vendas;
- registro de despesas;
- relatórios financeiros.

### Divulgação

- Vitrine Digital pública;
- serviços e preços;
- produtos selecionados;
- Portfólio;
- horários;
- endereço;
- WhatsApp;
- Instagram.

### Assistente IA

O projeto também prevê um plano opcional com **Assistente IA** na Vitrine.

O recurso poderá responder dúvidas básicas dos visitantes sobre informações públicas da barbearia, como:

- serviços;
- preços;
- produtos;
- horários;
- localização;
- contato.

---

## Público-alvo

O MVP é voltado principalmente para:

- barbeiros autônomos;
- barbeiros que trabalham sozinhos;
- pequenas barbearias com operação simples.

O foco inicial não são grandes redes ou operações com vários funcionários.

---

## Tecnologias

### Frontend e aplicação

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- Zod;
- Lucide React.

### Backend e dados

- Next.js server-side;
- PostgreSQL;
- Supabase;
- Supabase Auth;
- Supabase Storage;
- Row Level Security.

### Integrações

- ViaCEP;
- Gemini API.

### Desenvolvimento e hospedagem

- Git;
- GitHub;
- Node.js;
- npm;
- Vercel.

A explicação completa está em:

[`documentação/02-arquitetura-e-tecnologia/DECISOES_TECNOLOGICAS.md`](documentação/02-arquitetura-e-tecnologia/DECISOES_TECNOLOGICAS.md)

---

## Arquitetura resumida

```text
Usuário
   │
   ▼
Next.js
   │
   ├── React
   ├── Tailwind CSS
   ├── Zod
   │
   └── Backend
          │
          ├── Supabase Auth
          ├── PostgreSQL
          ├── Supabase Storage
          ├── ViaCEP
          └── Gemini API
```

A aplicação será hospedada na Vercel e o código-fonte será versionado através do GitHub.

---

## Estrutura principal

```text
estilo-gestao-mvp/
│
├── aplicação/
│
├── documentação/
│   ├── 01-planejamento-e-visao/
│   ├── 02-arquitetura-e-tecnologia/
│   ├── 03-fluxos-de-uso/
│   ├── 04-banco-de-dados/
│   ├── 05-seguranca-privacidade-juridico/
│   ├── 06-design-e-interface/
│   ├── 07-gestao-do-projeto/
│   ├── 08-manual-do-usuario/
│   ├── 09-ideias-futuras/
│   ├── 10-skills/
│   ├── 11-modelo-de-negocio/
│   ├── 12-testes-e-qualidade/
│   └── 13-indice-e-modelos/
│
└── README.md
```

A estrutura da aplicação deverá acompanhar a implementação real do projeto e não deve ser inventada no README antes de existir.

---

## Documentação

A documentação completa está disponível em:

[`documentação/13-indice-e-modelos/INDICE_DA_DOCUMENTACAO.md`](documentação/13-indice-e-modelos/INDICE_DA_DOCUMENTACAO.md)

O índice explica:

- quais documentos existem;
- onde estão;
- qual é a função de cada um.

---

## Escopo do MVP

O MVP inclui:

- autenticação;
- configuração da barbearia;
- Dashboard;
- serviços;
- produtos;
- categorias;
- estoque;
- PDV;
- vendas;
- despesas;
- relatórios;
- Vitrine;
- Portfólio;
- Assistente IA opcional.

---

## Fora do MVP

Não fazem parte da versão inicial:

- agendamento;
- cadastro de clientes;
- lembretes automáticos;
- fidelidade;
- multi-barbeiro;
- comissões;
- pagamento online;
- WhatsApp automático;
- cobrança automatizada do SaaS.

Essas possibilidades estão registradas em:

[`documentação/09-ideias-futuras/IDEIAS_FUTURAS.md`](documentação/09-ideias-futuras/IDEIAS_FUTURAS.md)

---

## Status do projeto

**Em desenvolvimento.**

O projeto está atualmente em fase de:

- documentação;
- definição do MVP;
- validação de regras;
- preparação da arquitetura;
- desenvolvimento da interface e backend.

Algumas decisões ainda estão sendo validadas antes da implementação definitiva.

---

## Segurança

O projeto utiliza como princípios:

- autenticação através do Supabase Auth;
- isolamento entre barbearias;
- Row Level Security;
- validação no servidor;
- proteção de segredos;
- separação entre dados públicos e privados;
- operações financeiras consistentes;
- proteção do Assistente IA.

As regras completas estão em:

[`documentação/05-seguranca-privacidade-juridico/DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md`](documentação/05-seguranca-privacidade-juridico/DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md)

---

## Banco de dados

O banco utiliza PostgreSQL através do Supabase.

A documentação está em:

[`documentação/04-banco-de-dados/BANCO_DE_DADOS.md`](documentação/04-banco-de-dados/BANCO_DE_DADOS.md)

O SQL didático está em:

[`documentação/04-banco-de-dados/BANCO_EXEMPLO.sql`](documentação/04-banco-de-dados/BANCO_EXEMPLO.sql)

---

## Testes

A estratégia de qualidade contempla:

- testes unitários;
- componentes;
- integração;
- banco;
- RLS;
- End-to-End;
- responsividade;
- acessibilidade;
- usabilidade;
- segurança;
- desempenho;
- análise de qualidade.

Plano completo:

[`documentação/12-testes-e-qualidade/PLANO_DE_TESTES.md`](documentação/12-testes-e-qualidade/PLANO_DE_TESTES.md)

---

## Desenvolvimento local

As instruções completas de variáveis de ambiente estão em:

[`documentação/02-arquitetura-e-tecnologia/ENV_SETUP.md`](documentação/02-arquitetura-e-tecnologia/ENV_SETUP.md)

O projeto utilizará um arquivo:

```text
.env.local
```

para valores reais de desenvolvimento.

Segredos nunca devem ser enviados ao GitHub.

---

## Aviso sobre documentos jurídicos

Os arquivos:

- Política de Privacidade;
- Termos de Uso;
- Preparação para Revisão Jurídica;

são documentos de trabalho.

As versões comerciais deverão passar por revisão jurídica antes do lançamento público definitivo.

---

## Princípio do projeto

O Estilo e Gestão é desenvolvido com foco em uma regra simples:

> resolver primeiro os problemas reais do barbeiro antes de adicionar funcionalidades apenas porque parecem interessantes.

O MVP deve permanecer simples, utilizável e sustentável de manter.