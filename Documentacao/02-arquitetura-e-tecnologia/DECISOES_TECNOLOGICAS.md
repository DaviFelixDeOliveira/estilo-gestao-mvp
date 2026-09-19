# Decisões Tecnológicas — Estilo e Gestão

## Objetivo

Este documento registra as tecnologias utilizadas no desenvolvimento do **Estilo e Gestão** e explica, de forma simples, a função de cada uma no projeto.

Detalhes de configuração, variáveis de ambiente, banco de dados e segurança serão documentados em arquivos próprios.

---

# Tecnologias utilizadas

## 1. Desenvolvimento

### GitHub

O GitHub será utilizado para hospedar o repositório Git do Estilo e Gestão.

Será o local principal para armazenar o código-fonte e acompanhar o histórico do projeto.

Também poderá ser integrado à Vercel para realizar os deployments da aplicação a partir do repositório.

---

### Stitch

O Stitch será utilizado para criação e validação dos protótipos das telas antes da implementação.

Nele serão planejados:

- estrutura das páginas;
- organização dos componentes;
- versão desktop;
- versão mobile;
- navegação entre telas;
- aplicação da identidade visual.

Os protótipos servirão como referência para desenvolvimento, mas não substituirão a especificação funcional.

---

# 2. Frontend

### Next.js

O Next.js será o framework principal da aplicação.

Ele será responsável tanto pelas páginas administrativas do barbeiro quanto pela Vitrine Digital pública.

O projeto utilizará o **App Router**, permitindo organizar páginas, layouts, componentes, rotas de servidor e carregamento de dados dentro da mesma aplicação.

O uso do Next.js evita a necessidade de criar um projeto frontend e outro backend separados para o MVP.

---

### React

O React será utilizado pelo Next.js para construção da interface.

As telas serão divididas em componentes reutilizáveis, como:

- botões;
- campos;
- cards;
- modais;
- tabelas;
- menus;
- elementos do PDV;
- componentes da Vitrine.

A interface deverá evitar componentes excessivamente grandes ou duplicados.

---

### TypeScript

O TypeScript será utilizado em modo estrito.

Sua função será definir os tipos dos dados utilizados no frontend, backend e integrações.

Isso ajuda a evitar erros como:

- enviar um texto onde deveria existir um número;
- utilizar campos inexistentes;
- tratar dados de uma venda de forma incompatível com o backend.

Os tipos não substituem as validações do servidor.

---

### Tailwind CSS

O Tailwind CSS será utilizado para estilização da interface.

Ele permitirá implementar:

- cores;
- espaçamentos;
- tamanhos;
- grids;
- responsividade;
- estados visuais;
- temas e componentes.

As regras visuais oficiais serão definidas no documento **Design System**.

---

### Lucide React

O Lucide React será utilizado como biblioteca padrão de ícones.

Será usado em ações como:

- editar;
- excluir;
- adicionar;
- pesquisar;
- visualizar;
- estoque;
- financeiro;
- configurações.

O uso de uma única biblioteca evita misturar estilos de ícones diferentes no sistema.

---

### Zod

O Zod será utilizado para definição e validação de estruturas de dados.

Será aplicado principalmente em formulários e entradas recebidas pelo servidor.

Exemplos:

- cadastro;
- login;
- serviços;
- produtos;
- despesas;
- configurações da barbearia.

As mesmas regras importantes deverão ser verificadas no servidor, mesmo quando o frontend já tiver validado os campos.

---

# 3. Backend e dados

### Next.js Server

O próprio Next.js será utilizado para as operações de backend do MVP.

As ações que não podem depender do navegador serão executadas no servidor, como:

- validar usuário;
- registrar vendas;
- alterar estoque;
- registrar despesas;
- acessar informações privadas;
- preparar dados para o Assistente IA;
- executar integrações externas.

O navegador nunca será considerado fonte confiável para valores financeiros ou permissões.

---

### PostgreSQL

O PostgreSQL será o banco de dados relacional do sistema.

Será utilizado para armazenar dados estruturados, como:

- barbearias;
- perfis;
- serviços;
- categorias de produtos;
- produtos;
- vendas;
- itens das vendas;
- despesas;
- movimentações de estoque;
- Portfólio;
- horários de funcionamento.

Por possuir relacionamentos entre essas informações, um banco relacional é adequado para o escopo do projeto.

---

### Supabase

O Supabase será a plataforma utilizada para fornecer os principais serviços de backend.

No projeto serão utilizados:

- PostgreSQL;
- autenticação;
- armazenamento de arquivos;
- políticas de segurança no banco.

O Supabase será integrado ao projeto Next.js, evitando a necessidade de manter uma infraestrutura própria de banco e autenticação no MVP.

---

### Supabase Auth

O Supabase Auth será responsável pela autenticação das contas.

Será utilizado para:

- criação de conta;
- login por e-mail e senha;
- gerenciamento da sessão;
- recuperação de senha;
- redefinição de senha;
- logout.

As senhas serão processadas pelo serviço de autenticação e não deverão ser armazenadas nas tabelas próprias do Estilo e Gestão.

---

### Row Level Security — RLS

O Row Level Security do PostgreSQL/Supabase será utilizado para controlar quais registros cada usuário pode acessar.

Cada barbearia deverá acessar somente seus próprios dados.

As regras de RLS deverão proteger, entre outros:

- serviços;
- produtos;
- vendas;
- despesas;
- estoque;
- Portfólio;
- configurações internas.

A Vitrine utilizará somente dados explicitamente liberados para acesso público.

---

### Supabase Storage

O Supabase Storage será utilizado para armazenar arquivos e imagens.

Exemplos:

- logo da barbearia;
- imagem de capa;
- fotos do Portfólio;
- imagens de produtos.

O banco de dados armazenará as referências necessárias aos arquivos, enquanto os arquivos reais permanecerão no Storage.

---

# 4. Integrações externas

### ViaCEP

O ViaCEP será utilizado para auxiliar o preenchimento do endereço da barbearia.

Ao informar um CEP válido, o sistema poderá preencher automaticamente:

- rua/logradouro;
- bairro;
- cidade;
- estado.

O número e o complemento continuarão sendo preenchidos pelo usuário.

O preenchimento automático será apenas uma ajuda. O formulário deverá continuar permitindo correções manuais e não poderá depender exclusivamente da disponibilidade do ViaCEP.

---

### Gemini API

A API Gemini será utilizada exclusivamente no módulo opcional de **Assistente IA** da Vitrine Digital.

O visitante poderá fazer perguntas sobre informações públicas da barbearia, como:

- serviços;
- preços;
- produtos divulgados;
- horários;
- endereço;
- atendimento a domicílio;
- formas de contato.

A API será chamada somente pelo servidor.

A chave da API nunca deverá ser enviada ao navegador.

O modelo utilizado não ficará preso à documentação. Ele será definido por variável de ambiente para permitir atualização sem alterar a arquitetura do sistema.

---

# 5. Hospedagem e implantação

### Vercel

A Vercel será utilizada para hospedar a aplicação Next.js.

Ela será responsável por:

- ambiente de produção;
- previews de desenvolvimento quando utilizados;
- execução das partes de servidor do Next.js;
- configuração das variáveis de ambiente da aplicação;
- integração com o repositório GitHub.

---

### Supabase Cloud

O projeto Supabase hospedará:

- banco PostgreSQL;
- autenticação;
- Storage;
- políticas de acesso.

Os ambientes de desenvolvimento e produção deverão ser separados quando o projeto avançar para uso comercial.

---

# 6. Arquitetura resumida

```text
Usuário
   │
   ▼
Aplicação Next.js
   │
   ├── Interface React + Tailwind
   │
   ├── Validação Zod
   │
   └── Backend Next.js
          │
          ├── Supabase Auth
          ├── PostgreSQL + RLS
          ├── Supabase Storage
          ├── ViaCEP
          └── Gemini API
```