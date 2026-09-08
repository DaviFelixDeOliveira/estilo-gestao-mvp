# Documento Visão


## Objetivo

Apresentar de forma resumida o problema, público, proposta, escopo e principais características do **Estilo e Gestão**.

Detalhes de implementação, validações, segurança e fluxos completos pertencem aos documentos técnicos específicos.

---

# Resumo

O **Estilo e Gestão** é um SaaS web responsivo voltado principalmente para barbeiros autônomos e pequenas barbearias.

O projeto busca facilitar tarefas que normalmente são controladas de forma manual ou separada, principalmente vendas, serviços, produtos, estoque, despesas, resultados financeiros e divulgação do trabalho.

Durante o levantamento inicial do projeto, foi conversado com um profissional da área de barbearia, que relatou necessidades relacionadas ao controle financeiro, venda de produtos e bebidas, registro rápido dos atendimentos e divulgação dos trabalhos realizados.

A proposta prioriza uma ferramenta simples, rápida e adequada à rotina de uma operação pequena, evitando funções complexas que não sejam necessárias no MVP.

O projeto propõe o desenvolvimento de uma aplicação digital capaz de **centralizar a gestão básica da barbearia, registrar vendas, acompanhar estoque e resultados e disponibilizar uma Vitrine Digital pública para apresentação do negócio e dos trabalhos do profissional**.

---

# Palavras-chave

SaaS; barbearia; gestão; PDV; estoque; financeiro; vendas; Vitrine Digital; Portfólio; inteligência artificial.

---

# Sumário

> Em Markdown, a navegação é feita por links internos. A numeração de páginas deverá ser gerada somente quando o documento for convertido para PDF.

- [1. Introdução](#1-introdução)
- [2. Nicho de mercado do projeto](#2-nicho-de-mercado-do-projeto)
  - [2.1 Público-alvo](#21-público-alvo)
  - [2.2 Problema do cliente](#22-problema-do-cliente)
  - [2.3 Solução proposta](#23-solução-proposta)
- [3. Tecnologias utilizadas](#3-tecnologias-utilizadas)
  - [3.1 Desenvolvimento](#31-desenvolvimento)
  - [3.2 Frontend](#32-frontend)
  - [3.3 Backend e dados](#33-backend-e-dados)
  - [3.4 Integrações](#34-integrações)
  - [3.5 Hospedagem](#35-hospedagem)
- [4. Empresa](#4-empresa)
- [5. Análise do sistema](#5-análise-do-sistema)
  - [5.1 Nome do software](#51-nome-do-software)
  - [5.2 Descrição geral](#52-descrição-geral)
  - [5.3 Requisitos funcionais](#53-requisitos-funcionais)
  - [5.4 Requisitos não funcionais](#54-requisitos-não-funcionais)
  - [5.5 Esquema de cores](#55-esquema-de-cores)
  - [5.6 Wireframes das telas](#56-wireframes-das-telas)
- [6. Manual do usuário](#6-manual-do-usuário)
- [7. Modelo de negócio](#7-modelo-de-negócio)
- [8. Plano de testes](#8-plano-de-testes)
- [9. Apêndices](#9-apêndices)
- [10. Referências bibliográficas](#10-referências-bibliográficas)
- [11. Conclusão](#11-conclusão)

---

# 1. Introdução

Nas últimas décadas, o avanço da tecnologia tem transformado profundamente a forma como informações são produzidas, armazenadas e utilizadas em empresas de diferentes tamanhos.

Mesmo pequenos estabelecimentos podem utilizar sistemas digitais para reduzir tarefas manuais, organizar informações e entender melhor o funcionamento do próprio negócio.

Na rotina de uma barbearia pequena, informações sobre serviços realizados, produtos vendidos, estoque, despesas e faturamento podem acabar espalhadas entre anotações, memória, calculadoras ou aplicativos que não se comunicam.

Além da dificuldade de gestão, o profissional também precisa divulgar seu trabalho e permitir que novos clientes encontrem informações básicas sobre a barbearia.

Diante dessa realidade, o presente projeto surgiu da necessidade de oferecer uma ferramenta simples que una gestão interna e divulgação digital em um único sistema.

Assim, este projeto tem como objetivo desenvolver uma aplicação digital voltada à gestão de barbearias, permitindo registrar vendas, organizar serviços e produtos, controlar estoque, registrar despesas, consultar resultados e manter uma página pública de divulgação.

Portanto, o sistema resultante foi planejado para atender principalmente barbeiros autônomos e pequenas barbearias que precisam de uma solução direta, responsiva e simples de utilizar durante a rotina de trabalho.

---

# 2. Nicho de mercado do projeto

O projeto pertence ao segmento de tecnologia para gestão de pequenos negócios, com foco específico no setor de barbearias.

## 2.1 Público-alvo

O público inicial é composto por:

- barbeiros autônomos;
- barbeiros que trabalham sozinhos;
- pequenas barbearias com operação simples.

O MVP prioriza estabelecimentos nos quais uma única pessoa administra grande parte da operação.

O sistema deverá ser especialmente adequado ao uso pelo celular, já que o profissional poderá precisar registrar vendas e consultar informações durante o próprio expediente.

A proposta não é concorrer inicialmente com grandes ERPs ou sistemas completos para redes de barbearias.

---

## 2.2 Problema do cliente

Pequenas barbearias podem possuir dificuldades para centralizar informações básicas da operação.

Entre os problemas identificados estão:

- registro manual ou disperso das vendas;
- dificuldade para saber quanto foi recebido em determinado período;
- dificuldade para separar resultados de serviços, bebidas e produtos;
- despesas registradas sem organização;
- falta de controle claro da quantidade de produtos disponível;
- ausência de alerta para estoque baixo;
- necessidade de calcular manualmente o total de uma comanda;
- dificuldade para manter serviços e produtos organizados;
- divulgação dos trabalhos dependente apenas de redes sociais ou mensagens;
- ausência de um link próprio com informações da barbearia.

O sistema precisa resolver esses pontos sem exigir uma operação complexa, pois adicionar etapas desnecessárias durante um atendimento pode tornar a ferramenta lenta para o uso diário.

---

## 2.3 Solução proposta

O Estilo e Gestão propõe centralizar as principais tarefas do barbeiro em uma aplicação web responsiva.

A área administrativa permitirá:

- cadastrar serviços;
- cadastrar categorias de produtos;
- cadastrar produtos e bebidas;
- controlar estoque;
- registrar reposições e ajustes;
- utilizar uma comanda rápida;
- registrar vendas;
- registrar despesas;
- acompanhar indicadores;
- consultar relatórios;
- administrar as informações públicas da barbearia;
- gerenciar o Portfólio.

O sistema também oferecerá uma **Vitrine Digital**, que será a página pública da barbearia.

Ela poderá apresentar:

- identidade do estabelecimento;
- descrição;
- serviços;
- preços;
- produtos divulgados;
- Portfólio;
- horários;
- localização;
- WhatsApp;
- Instagram.

Como adicional opcional, a Vitrine poderá possuir um **Assistente IA**, utilizado para responder perguntas sobre informações públicas já cadastradas no sistema.

O MVP não possui agendamento online.

---

# 3. Tecnologias utilizadas

Este capítulo apresenta apenas uma visão resumida. A função detalhada de cada tecnologia está no documento **Decisões Tecnológicas**.

## 3.1 Desenvolvimento

### Git

Utilizado para controle de versão e histórico das alterações do projeto.

### GitHub

Utilizado para hospedar o repositório e manter o código-fonte centralizado.

### Figma

Utilizado para criação e validação dos protótipos das interfaces.

### Node.js e npm

Utilizados para executar o ambiente de desenvolvimento e gerenciar as dependências do projeto.

---

## 3.2 Frontend

### Next.js

Framework principal da aplicação web, responsável pelas páginas públicas, administrativas e recursos de servidor.

### React

Utilizado para criação dos componentes e interfaces do sistema.

### TypeScript

Utilizado para tipagem e maior segurança na manipulação dos dados do sistema.

### Tailwind CSS

Utilizado para estilização e responsividade das interfaces.

### Lucide React

Biblioteca padrão de ícones da aplicação.

### Zod

Utilizado para estruturar e validar dados recebidos por formulários e operações do sistema.

---

## 3.3 Backend e dados

### PostgreSQL

Banco relacional utilizado para armazenar os dados estruturados do sistema.

### Supabase

Plataforma utilizada para fornecer banco PostgreSQL, autenticação, armazenamento e recursos de segurança.

### Supabase Auth

Responsável pelo cadastro, login, sessões e recuperação de acesso das contas.

### Supabase Storage

Responsável pelo armazenamento das imagens utilizadas no sistema.

### Row Level Security

Utilizado para limitar o acesso de cada barbearia aos seus próprios registros.

---

## 3.4 Integrações

### ViaCEP

Utilizado para auxiliar o preenchimento dos dados de endereço através do CEP.

### Gemini API

Utilizada no Assistente IA opcional da Vitrine Digital.

---

## 3.5 Hospedagem

### Vercel

Utilizada para implantação e hospedagem da aplicação Next.js.

### Supabase Cloud

Utilizado para hospedar banco, autenticação e arquivos.

---

# 4. Empresa

O Estilo e Gestão é atualmente um projeto desenvolvido de forma independente.

As informações institucionais de uma futura empresa responsável pelo produto ainda não foram definidas.

## Nome da empresa

**INDEFINIDO**

## Missão

**INDEFINIDA**

## Visão

**INDEFINIDA**

## Valores

**INDEFINIDOS**

## Logo da empresa

**INDEFINIDA**

> A identidade visual do produto Estilo e Gestão não deve ser confundida com uma futura identidade da empresa responsável.

## Slogan da empresa

**INDEFINIDO**

## Slogan do produto

**INDEFINIDO**

---

# 5. Análise do sistema

## 5.1 Nome do software

**Estilo e Gestão**

---

## 5.2 Descrição geral

O desenvolvedor responsável pelo projeto desenvolve o software **Estilo e Gestão** com o objetivo de simplificar a administração de pequenas barbearias.

O sistema possui uma área privada para gestão e uma área pública para divulgação.

Na área privada, o barbeiro poderá administrar serviços, produtos, estoque, vendas, despesas e informações financeiras.

O PDV permitirá montar uma comanda com serviços e produtos e calcular automaticamente o valor da venda.

Os produtos vendidos terão o estoque atualizado de acordo com as movimentações registradas.

Na área pública, a Vitrine Digital apresentará informações autorizadas pelo barbeiro, incluindo serviços, Portfólio, produtos, horários, localização e contato.

O Assistente IA será um recurso opcional da Vitrine e terá acesso somente ao contexto público autorizado.

O MVP será voltado inicialmente para uma operação simples, sem agendamento, cadastro de clientes ou gestão de funcionários.

---

# 5.3 Requisitos funcionais

## RF01 — Cadastrar conta

**Descrição:** Permitir criar uma conta administrativa para utilização do sistema.

**Dados usados:**
- nome do responsável;
- e-mail;
- senha gerenciada pelo serviço de autenticação.

---

## RF02 — Autenticar barbeiro

**Descrição:** Permitir que o barbeiro acesse sua área privada através das credenciais cadastradas.

**Dados usados:**
- e-mail;
- senha;
- sessão;
- identificador do usuário.

---

## RF03 — Recuperar acesso

**Descrição:** Permitir solicitar recuperação e definir uma nova senha quando o usuário perder acesso à conta.

**Dados usados:**
- e-mail;
- código ou contexto de recuperação;
- nova senha.

---

## RF04 — Configurar barbearia

**Descrição:** Permitir cadastrar e alterar as informações principais do estabelecimento.

**Dados usados:**
- nome da marca;
- nome profissional;
- WhatsApp;
- telefone;
- Instagram;
- CEP;
- rua/logradouro;
- número;
- bairro;
- cidade;
- estado;
- complemento;
- atendimento a domicílio;
- horários.

---

## RF05 — Gerenciar serviços

**Descrição:** Permitir cadastrar, editar, ativar, inativar e controlar a exibição pública dos serviços.

**Dados usados:**
- nome;
- descrição;
- preço;
- custo estimado de insumos;
- status;
- visibilidade pública.

---

## RF06 — Gerenciar categorias de produtos

**Descrição:** Permitir utilizar categorias sugeridas e criar categorias próprias para organizar os produtos da barbearia.

**Dados usados:**
- nome da categoria;
- status;
- barbearia responsável.

---

## RF07 — Gerenciar produtos

**Descrição:** Permitir cadastrar e atualizar produtos e bebidas vendidos pela barbearia.

**Dados usados:**
- nome;
- categoria;
- descrição;
- estoque;
- estoque mínimo;
- preço de custo;
- preço de venda;
- imagem;
- status;
- visibilidade pública.

---

## RF08 — Controlar estoque

**Descrição:** Permitir registrar as movimentações que alteram a quantidade dos produtos.

**Dados usados:**
- produto;
- quantidade;
- saldo anterior;
- saldo posterior;
- tipo da movimentação;
- data;
- motivo.

---

## RF09 — Registrar venda

**Descrição:** Permitir montar uma comanda contendo serviços e produtos e registrar a venda concluída.

**Dados usados:**
- itens;
- quantidades;
- preços;
- custos;
- subtotais;
- total;
- forma de pagamento, quando informada;
- data e hora;
- status.

---

## RF10 — Cancelar venda

**Descrição:** Permitir cancelar uma venda registrada e reverter os efeitos necessários no estoque.

**Dados usados:**
- venda;
- status;
- itens;
- produtos;
- movimentações;
- data de cancelamento.

---

## RF11 — Registrar despesas

**Descrição:** Permitir registrar as saídas financeiras da barbearia.

**Dados usados:**
- nome;
- descrição;
- categoria;
- valor;
- data.

---

## RF12 — Mostrar Dashboard

**Descrição:** Mostrar os principais indicadores da operação no período selecionado.

**Dados usados:**
- vendas;
- despesas;
- custos;
- categorias;
- período.

---

## RF13 — Mostrar relatórios

**Descrição:** Mostrar informações financeiras por períodos e origens diferentes.

**Dados usados:**
- faturamento;
- entradas;
- despesas;
- custos;
- serviços;
- produtos;
- bebidas;
- período.

---

## RF14 — Configurar Vitrine Digital

**Descrição:** Permitir definir quais informações da barbearia serão apresentadas publicamente.

**Dados usados:**
- slug;
- status da Vitrine;
- informações públicas;
- serviços públicos;
- produtos públicos;
- horários;
- endereço;
- contatos.

---

## RF15 — Gerenciar Portfólio

**Descrição:** Permitir adicionar, ocultar e remover imagens dos trabalhos realizados.

**Dados usados:**
- imagem;
- descrição;
- serviço relacionado;
- status de publicação;
- data.

---

## RF16 — Disponibilizar contato

**Descrição:** Permitir que visitantes utilizem os canais públicos cadastrados pela barbearia.

**Dados usados:**
- WhatsApp;
- telefone;
- Instagram;
- endereço.

---

## RF17 — Responder através do Assistente IA

**Descrição:** Permitir que visitantes façam perguntas ao Assistente IA quando o recurso estiver liberado e ativado.

**Dados usados:**
- mensagem do visitante;
- nome público;
- descrição pública;
- serviços públicos;
- produtos públicos;
- preços públicos;
- horários;
- endereço;
- contatos.

---

## RF18 — Administrar recursos básicos do SaaS

**Descrição:** Permitir ao operador responsável realizar apenas as operações administrativas necessárias para manter o serviço durante o MVP.

**Dados usados:**
- identificador da barbearia;
- status da conta;
- liberação do Assistente IA.

A implementação e as permissões desse painel ainda deverão ser definidas tecnicamente.

---

# 5.4 Requisitos não funcionais

## RNF01 — Adaptar interface

**Descrição:** Adaptar o sistema para celulares pequenos e grandes, tablets, notebooks e computadores.

**Dados usados:**
- dimensões da tela;
- componentes da interface;
- pontos de quebra responsivos.

---

## RNF02 — Priorizar uso mobile

**Descrição:** Priorizar operações rápidas pelo celular, principalmente no PDV.

**Dados usados:**
- dimensões da tela;
- tamanho dos elementos;
- navegação;
- ações frequentes.

---

## RNF03 — Proteger acesso aos dados

**Descrição:** Restringir cada barbearia aos seus próprios dados e impedir exposição indevida de informações administrativas.

**Dados usados:**
- usuário autenticado;
- sessão;
- identificador da barbearia;
- políticas de acesso.

---

## RNF04 — Validar dados no servidor

**Descrição:** Validar no servidor os dados importantes antes de alterar banco, estoque ou financeiro.

**Dados usados:**
- dados recebidos;
- sessão;
- registros atuais do banco.

---

## RNF05 — Garantir integridade da venda

**Descrição:** Executar venda, itens, baixa de estoque e movimentações como uma operação consistente.

**Dados usados:**
- venda;
- itens;
- estoque;
- movimentações.

---

## RNF06 — Manter desempenho adequado

**Descrição:** Evitar consultas, imagens e carregamentos desnecessários que prejudiquem o uso diário.

**Dados usados:**
- consultas;
- imagens;
- componentes;
- recursos carregados.

---

## RNF07 — Aplicar acessibilidade básica

**Descrição:** Utilizar contraste adequado, foco visível, labels, textos alternativos quando necessários e controles utilizáveis por toque e teclado.

**Dados usados:**
- elementos da interface;
- textos;
- imagens;
- estados de foco.

---

## RNF08 — Tratar indisponibilidade

**Descrição:** Informar problemas de conexão ou manutenção sem permitir que operações críticas sejam registradas parcialmente.

**Dados usados:**
- estado da conexão;
- estado da sessão;
- modo de manutenção.

---

## RNF09 — Proteger o Assistente IA

**Descrição:** Limitar o Assistente IA aos dados públicos autorizados e impedir acesso aos dados administrativos.

**Dados usados:**
- mensagem;
- informações públicas;
- configuração do recurso.

---

## RNF10 — Aplicar esquema de cores consistente

**Descrição:** Utilizar uma identidade visual consistente baseada na marca do Estilo e Gestão.

**Dados usados:**
- tokens de cor;
- estados dos componentes;
- contraste.

O detalhamento completo pertence ao **Design System**.

---

# 5.5 Esquema de cores

A identidade atual do produto utiliza principalmente tons neutros relacionados à logo.

## Cores base

- Grafite principal: `#2F2F2D`
- Grafite secundário: `#3A3A38`
- Cinza: `#666662`
- Cinza claro: `#E9E9E4`
- Fundo claro: `#F4F4F0`
- Branco: `#FFFFFF`

## Cor de ação proposta

- Verde profundo: `#2F6B4F`

A cor de ação ainda deverá ser validada durante a prototipação.

Estados de:

- sucesso;
- aviso;
- erro;
- informação;

terão cores semânticas próprias definidas no documento **Design System**.

---

# 5.6 Wireframes das telas

> Seção reservada para inserção dos wireframes após a etapa de prototipação.

---

# 6. Manual do usuário

O Manual do Usuário será criado em documento separado.

Seu objetivo será ensinar o barbeiro a utilizar as funcionalidades do sistema através de instruções simples e imagens reais das telas.

Entre os assuntos previstos estão:

- criar conta;
- acessar o sistema;
- configurar a barbearia;
- cadastrar serviços;
- cadastrar produtos;
- registrar vendas;
- controlar estoque;
- registrar despesas;
- consultar relatórios;
- configurar Vitrine;
- gerenciar Portfólio;
- utilizar o Assistente IA.

O manual não deverá explicar arquitetura, banco ou regras internas de programação.

---

# 7. Modelo de negócio

O Estilo e Gestão será oferecido como SaaS.

A proposta inicial possui dois níveis comerciais:

## Plano padrão

Inclui as funcionalidades principais de gestão e Vitrine Digital.

## Plano com Assistente IA

Inclui as funcionalidades do plano padrão e o Assistente IA público, apresentado como um recurso semelhante a um **funcionário virtual disponível 24 horas** para responder dúvidas básicas dos visitantes.

Os valores, limites, cobrança e condições comerciais ainda serão definidos.

O modelo completo será documentado no arquivo **Modelo de Negócio**.

---

# 8. Plano de testes

Antes do lançamento, o sistema deverá ser validado através de diferentes tipos de testes.

Entre eles:

- testes de regras financeiras;
- testes do PDV;
- testes de estoque;
- testes de autenticação;
- testes de banco e RLS;
- testes de integração;
- testes de componentes;
- testes de responsividade;
- testes de usabilidade;
- testes de desempenho;
- testes de segurança;
- testes do Assistente IA.

Os testes deverão registrar:

- o que foi testado;
- quando foi testado;
- ferramenta utilizada;
- resultado;
- falhas encontradas;
- correções realizadas.

As ferramentas e procedimentos serão detalhados no documento **Plano de Testes**.

---

# 9. Apêndices

# APÊNDICE A — Política de Proteção de Dados Pessoais e Privacidade

> Este apêndice apresenta apenas a estrutura conceitual. A Política de Privacidade completa será mantida em documento próprio e deverá passar por revisão antes do lançamento comercial.

## 1. Objetivo

Apresentar diretrizes para tratamento de dados pessoais em conformidade com a legislação aplicável e orientar medidas voltadas à proteção da privacidade.

## 2. Conteúdo

Organizar as regras relacionadas à coleta, utilização, armazenamento, compartilhamento, segurança e eliminação dos dados tratados pelo Estilo e Gestão.

## 3. Abrangência

Aplicar as diretrizes aos dados tratados durante cadastro, autenticação, uso administrativo, Vitrine, suporte e demais funcionalidades que utilizem dados pessoais.

## 4. Base regulamentar

Considerar principalmente:

- Lei Federal nº 13.709, de 14 de agosto de 2018 — Lei Geral de Proteção de Dados Pessoais;
- Lei Federal nº 13.853, de 8 de julho de 2019;
- regulamentações e orientações publicadas pela Autoridade Nacional de Proteção de Dados.

## 5. Definições

Definir os principais conceitos utilizados, como:

- dado pessoal;
- titular;
- tratamento;
- controlador;
- operador;
- consentimento;
- anonimização;
- incidente de segurança.

## 6. Âmbito de aplicação

Definir quais pessoas, processos, fornecedores e ambientes devem seguir as diretrizes.

## 7. Princípios de observância obrigatória

Considerar os princípios previstos pela LGPD durante o tratamento dos dados.

## 8. Bases legais para tratamento

Identificar a base legal aplicável para cada finalidade antes da utilização comercial definitiva.

A base legal não deverá ser inventada apenas para preencher a documentação.

## 9. Término do tratamento

Definir procedimentos para encerramento de finalidade, eliminação, anonimização ou manutenção de dados quando houver justificativa legal aplicável.

## 10. Direitos do titular

Prever meios adequados para exercício dos direitos garantidos pela LGPD.

## 11. Tipos de dados pessoais coletados

O inventário final deverá considerar os dados efetivamente utilizados pelo sistema.

Entre os dados já previstos estão:

- nome;
- e-mail;
- telefone/WhatsApp;
- informações da barbearia;
- endereço quando relacionado a pessoa física ou estabelecimento.

O inventário deverá ser atualizado conforme a implementação real.

## 12. Compartilhamento de dados

Documentar quais fornecedores recebem dados para prestar serviços ao sistema.

Exemplos previstos:

- Supabase;
- Vercel;
- Google, quando utilizado o Assistente IA.

Somente dados necessários deverão ser compartilhados.

## 13. Controlador e operador

Identificar corretamente os papéis exercidos pelo responsável pelo Estilo e Gestão e pelos fornecedores contratados.

A definição jurídica final deverá ser revisada profissionalmente.

## 14. Incidentes de segurança

Definir procedimento para:

- identificação;
- contenção;
- análise;
- registro;
- correção;
- avaliação de comunicação necessária.

## 15. Transferência internacional

Verificar onde os fornecedores processam e armazenam dados e documentar eventual transferência internacional.

## 16. Aperfeiçoamento contínuo

Revisar periodicamente práticas de segurança, documentação e fornecedores.

## 17. Boas práticas de segurança e governança

Adotar medidas adequadas ao risco, incluindo:

- controle de acesso;
- autenticação;
- proteção de segredos;
- atualizações;
- backups;
- logs seguros;
- testes;
- resposta a incidentes.

## 18. Alçada

Definir quem poderá autorizar decisões relacionadas à proteção de dados.

## 19. Responsabilidades

Definir responsabilidades do responsável pelo projeto, fornecedores e demais envolvidos.

## 20. Disposições transitórias

Registrar regras temporárias aplicáveis durante desenvolvimento, piloto ou transição para operação comercial.

## 21. Disposições finais

Definir revisão, atualização e aprovação da política.

---

# 10. Referências bibliográficas

## Proteção de dados e segurança

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018.** Lei Geral de Proteção de Dados Pessoais — LGPD.

BRASIL. **Lei nº 13.853, de 8 de julho de 2019.** Altera a Lei nº 13.709/2018 e dispõe sobre a Autoridade Nacional de Proteção de Dados.

AUTORIDADE NACIONAL DE PROTEÇÃO DE DADOS — ANPD. **Guia Orientativo sobre Segurança da Informação para Agentes de Tratamento de Pequeno Porte.**

AUTORIDADE NACIONAL DE PROTEÇÃO DE DADOS — ANPD. **Guia Orientativo para Definições dos Agentes de Tratamento de Dados Pessoais e do Encarregado.**

## Tecnologias

NEXT.JS. **Documentação oficial do Next.js.**

SUPABASE. **Documentação oficial do Supabase, Auth, Storage e Row Level Security.**

VERCEL. **Documentação oficial da plataforma Vercel.**

GOOGLE. **Documentação oficial da Gemini API.**

VIACEP. **Documentação oficial do Webservice ViaCEP.**

GITHUB. **Documentação oficial do GitHub e Git.**

TAILWIND CSS. **Documentação oficial do Tailwind CSS.**

---

# 11. Conclusão

O Estilo e Gestão foi planejado para resolver necessidades práticas de pequenas barbearias sem transformar o MVP em um sistema excessivamente complexo.

A proposta central combina gestão e divulgação:

- a área administrativa organiza a operação;
- a Vitrine Digital apresenta o negócio ao público;
- o Assistente IA pode complementar o atendimento quando contratado.

O desenvolvimento deverá permanecer alinhado às necessidades reais do barbeiro e evitar a inclusão antecipada de funcionalidades sem validação.

As regras detalhadas de cada funcionalidade, arquitetura, dados, segurança e testes serão mantidas nos documentos específicos do projeto para evitar duplicidade e inconsistência.