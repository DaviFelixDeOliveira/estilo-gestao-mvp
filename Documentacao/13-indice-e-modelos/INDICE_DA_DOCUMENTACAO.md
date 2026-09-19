# Índice da Documentação — Estilo e Gestão

## Objetivo

Este documento organiza todos os arquivos de documentação do **Estilo e Gestão**, informando onde cada um está localizado e qual é sua finalidade.

Ele funciona como ponto central de navegação.

Não contém regras detalhadas do sistema. Cada assunto deve ser consultado em seu documento responsável.

---

# 1. Estrutura geral

```text
Documentação/
│
├── 01-planejamento-e-visao/
│   ├── DOCUMENTO_VISAO.md
│   └── PERGUNTAS.md
│
├── 02-arquitetura-e-tecnologia/
│   ├── DECISOES_TECNOLOGICAS.md
│   ├── ENV_SETUP.md
│   └── PREPARACAO_FRONTEND_PARA_BACKEND.md
│
├── 03-fluxos-de-uso/
│   ├── FLUXO_BARBEIRO.md
│   ├── FLUXO_CLIENTE.md
│   └── FLUXO_ADMIN.md
│
├── 04-banco-de-dados/
│   ├── BANCO_DE_DADOS.md
│   └── BANCO_EXEMPLO.sql
│
├── 05-seguranca-privacidade-juridico/
│   ├── DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md
│   ├── POLITICA_DE_PRIVACIDADE.md
│   ├── PREPARACAO_REVISAO_JURIDICA.md
│   └── TERMOS_DE_USO.md
│
├── 06-design-e-interface/
│   ├── DESIGN_SYSTEM.md
│   ├── ESQUEMA_DE_CORES.md
│   ├── RESPONSIVIDADE.md
│   └── GUIA_PROTOTIPACAO_IA.md
│
├── 07-gestao-do-projeto/
│   └── CHECKLIST_MESTRE.md
│
├── 08-manual-do-usuario/
│   ├── assets/
│   └── MANUAL_DO_USUARIO.md
│
├── 09-ideias-futuras/
│   └── IDEIAS_FUTURAS.md
│
├── 10-skills/
│   ├── DESIGN.md
│   ├── FINANCEIRO_PDV.md
│   ├── RESPONSIVIDADE.md
│   ├── SEGURANCA_IMPLEMENTACAO.md
│   ├── BANCO_DE_DADOS.md
│   ├── FRONTEND_BACKEND.md
│   ├── VITRINE_E_IA.md
│   ├── TESTES_E_QUALIDADE.md
│   ├── INFRAESTRUTURA_PERFORMANCE.md
│   └── ESCOPO_E_DOCUMENTACAO.md
│
├── 11-modelo-de-negocio/
│   └── MODELO_DE_NEGOCIO.md
│
├── 12-testes-e-qualidade/
│   └── PLANO_DE_TESTES.md
│
├── 13-indice-e-modelos/
│   ├── INDICE_DA_DOCUMENTACAO.md
│   └── ESTRUTURA_DOS_DOCUMENTOS.md
│
└── 99-historico/
    ├── README.md
    └── arquivos substituídos (não canônicos)
```
> **Histórico:** arquivos substituídos ficam em `99-historico/` apenas para consulta histórica e **não são fonte oficial de verdade**.


Na raiz do projeto:

```text
README.md
```

---

# 2. Planejamento e Visão

## Documento de Visão

**Arquivo:**

[`../01-planejamento-e-visao/DOCUMENTO_VISAO.md`](../01-planejamento-e-visao/DOCUMENTO_VISAO.md)

**Finalidade:**

Apresentar uma visão geral do Estilo e Gestão.

Contém, de forma resumida:

- problema;
- público-alvo;
- solução;
- tecnologias;
- requisitos;
- identidade;
- modelo de negócio;
- testes;
- privacidade.

É utilizado principalmente para compreensão geral e apresentação do projeto.

---

## Perguntas

**Arquivo:**

[`../01-planejamento-e-visao/PERGUNTAS.md`](../01-planejamento-e-visao/PERGUNTAS.md)

**Finalidade:**

Registrar dúvidas de produto que ainda precisam ser validadas com o barbeiro.

Não deve conter dúvidas exclusivamente técnicas.

Quando uma questão for respondida, a decisão deve ser atualizada no documento responsável.

---

# 3. Arquitetura e Tecnologia

## Decisões Tecnológicas

**Arquivo:**

[`../02-arquitetura-e-tecnologia/DECISOES_TECNOLOGICAS.md`](../02-arquitetura-e-tecnologia/DECISOES_TECNOLOGICAS.md)

**Finalidade:**

Registrar todas as tecnologias realmente utilizadas no projeto e explicar sua função.

É a fonte principal para decisões de stack.

---

## ENV Setup

**Arquivo:**

[`../02-arquitetura-e-tecnologia/ENV_SETUP.md`](../02-arquitetura-e-tecnologia/ENV_SETUP.md)

**Finalidade:**

Explicar:

- variáveis de ambiente;
- função de cada uma;
- onde obtê-las;
- onde configurá-las;
- quais são públicas ou privadas.

---

## Preparação Frontend para Backend

**Arquivo:**

[`../02-arquitetura-e-tecnologia/PREPARACAO_FRONTEND_PARA_BACKEND.md`](../02-arquitetura-e-tecnologia/PREPARACAO_FRONTEND_PARA_BACKEND.md)

**Finalidade:**

Explicar como desenvolver inicialmente com mocks sem acoplar o frontend a dados simulados.

Também orienta a futura troca dos mocks pelo backend real.

---

# 4. Fluxos de Uso

Os fluxos funcionais são separados por ator para evitar duplicação e conflitos de responsabilidade.

## Fluxo do Barbeiro

**Arquivo:**

[`../03-fluxos-de-uso/FLUXO_BARBEIRO.md`](../03-fluxos-de-uso/FLUXO_BARBEIRO.md)

**Finalidade:**

Ser a referência funcional principal da área autenticada da barbearia: autenticação, onboarding, Dashboard, PDV, serviços, produtos, estoque, financeiro, relatórios, administração da Vitrine, conta, assinatura e estados que afetam o barbeiro.

## Fluxo do Cliente

**Arquivo:**

[`../03-fluxos-de-uso/FLUXO_CLIENTE.md`](../03-fluxos-de-uso/FLUXO_CLIENTE.md)

**Finalidade:**

Ser a referência funcional principal da experiência pública: Vitrine, serviços, produtos, Portfólio, contatos, Assistente IA e estados públicos.

## Fluxo do ADMIN

**Arquivo:**

[`../03-fluxos-de-uso/FLUXO_ADMIN.md`](../03-fluxos-de-uso/FLUXO_ADMIN.md)

**Finalidade:**

Ser a referência funcional principal do Operador do SaaS: Dashboard administrativo, lista e detalhes de barbearias, pagamentos, planos, suspensão, manutenção, histórico administrativo e limites de acesso.

Os três documentos detalham campos, regras, validações, mensagens, ações, sequências e estados do ator correspondente.

---

# 5. Banco de Dados

## Banco de Dados

**Arquivo:**

[`../04-banco-de-dados/BANCO_DE_DADOS.md`](../04-banco-de-dados/BANCO_DE_DADOS.md)

**Finalidade:**

Explicar conceitualmente e tecnicamente:

- tabelas;
- relacionamentos;
- tenant;
- snapshots;
- estoque;
- vendas;
- RLS;
- Storage;
- transações.

---

## Banco Exemplo

**Arquivo:**

[`../04-banco-de-dados/BANCO_EXEMPLO.sql`](../04-banco-de-dados/BANCO_EXEMPLO.sql)

**Finalidade:**

Mostrar de forma prática:

- tabelas;
- colunas;
- tipos;
- nulabilidade;
- enums;
- relacionamentos;
- índices iniciais.

Não deve ser tratado como migration final de produção.

---

# 6. Segurança, Privacidade e Jurídico

## Diretrizes de Segurança e Proteção de Dados

**Arquivo:**

[`../05-seguranca-privacidade-juridico/DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md`](../05-seguranca-privacidade-juridico/DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md)

**Finalidade:**

Definir requisitos técnicos mínimos de:

- segurança;
- privacidade;
- proteção de dados;
- desenvolvimento seguro;
- operação.

É um documento interno.

---

## Política de Privacidade

**Arquivo:**

[`../05-seguranca-privacidade-juridico/POLITICA_DE_PRIVACIDADE.md`](../05-seguranca-privacidade-juridico/POLITICA_DE_PRIVACIDADE.md)

**Finalidade:**

Explicar ao titular:

- quais dados são tratados;
- para quê;
- com quem são compartilhados;
- direitos;
- contatos;
- práticas gerais de privacidade.

A versão atual é uma minuta para revisão jurídica.

---

## Preparação para Revisão Jurídica

**Arquivo:**

[`../05-seguranca-privacidade-juridico/PREPARACAO_REVISAO_JURIDICA.md`](../05-seguranca-privacidade-juridico/PREPARACAO_REVISAO_JURIDICA.md)

**Finalidade:**

Organizar tudo que deverá ser apresentado a um profissional jurídico antes do lançamento comercial.

Inclui:

- dados;
- fornecedores;
- dúvidas;
- processos;
- documentos;
- decisões pendentes.

---

## Termos de Uso

**Arquivo:**

[`../05-seguranca-privacidade-juridico/TERMOS_DE_USO.md`](../05-seguranca-privacidade-juridico/TERMOS_DE_USO.md)

**Finalidade:**

Definir as regras de utilização do Estilo e Gestão.

A versão atual é uma minuta e deverá ser validada juridicamente.

---

# 7. Design e Interface

## Design System

**Arquivo:**

[`../06-design-e-interface/DESIGN_SYSTEM.md`](../06-design-e-interface/DESIGN_SYSTEM.md)

**Finalidade:**

Definir como elementos visuais devem ser utilizados na implementação.

Inclui:

- cores;
- botões;
- inputs;
- cards;
- estados;
- ícones;
- tipografia;
- espaçamento;
- acessibilidade.

---

## Esquema de Cores

**Arquivo:**

[`../06-design-e-interface/ESQUEMA_DE_CORES.md`](../06-design-e-interface/ESQUEMA_DE_CORES.md)

**Finalidade:**

Explicar por que as cores foram escolhidas e qual conceito visual representam.

Não substitui as regras de implementação do Design System.

---

## Responsividade

**Arquivo:**

[`../06-design-e-interface/RESPONSIVIDADE.md`](../06-design-e-interface/RESPONSIVIDADE.md)

**Finalidade:**

Definir como as interfaces deverão se adaptar entre:

- celular;
- tablet;
- notebook;
- desktop.

É um documento adicional criado para evitar sobrecarregar o Design System.

---

## Guia de Prototipação para IA

**Arquivo:**

[`../06-design-e-interface/GUIA_PROTOTIPACAO_IA.md`](../06-design-e-interface/GUIA_PROTOTIPACAO_IA.md)

**Finalidade:**

Orientar a criação e revisão de protótipos com base nos documentos oficiais, definindo arquivos-base por ator, hierarquia de fontes e limites de escopo.

---

# 8. Gestão do Projeto

## Checklist Mestre

**Arquivo:**

[`../07-gestao-do-projeto/CHECKLIST_MESTRE.md`](../07-gestao-do-projeto/CHECKLIST_MESTRE.md)

**Finalidade:**

Acompanhar:

- decisões tomadas;
- decisões pendentes;
- documentos concluídos;
- tarefas restantes.

Não contém detalhamento funcional.

---

# 9. Manual do Usuário

## Manual do Usuário

**Arquivo:**

[`../08-manual-do-usuario/MANUAL_DO_USUARIO.md`](../08-manual-do-usuario/MANUAL_DO_USUARIO.md)

**Finalidade:**

Ensinar o barbeiro a utilizar o sistema através de instruções simples e imagens.

Não contém:

- arquitetura;
- SQL;
- mensagens técnicas;
- regras internas.

---

## Assets do Manual

**Pasta:**

```text
../08-manual-do-usuario/assets/
```

**Finalidade:**

Armazenar as imagens utilizadas no Manual do Usuário.

A pasta permanecerá vazia até existirem telas reais para captura.

---

# 10. Ideias Futuras

## Ideias Futuras

**Arquivo:**

[`../09-ideias-futuras/IDEIAS_FUTURAS.md`](../09-ideias-futuras/IDEIAS_FUTURAS.md)

**Finalidade:**

Manter funcionalidades que foram consideradas, mas não fazem parte do MVP atual.

Enquanto uma funcionalidade estiver nesse documento, ela não deverá ser implementada como parte do escopo atual.

---

# 11. Skills para IA Desenvolvedora

## Design

**Arquivo:**

[`../10-skills/DESIGN.md`](../10-skills/DESIGN.md)

Orienta decisões rápidas de interface.

---

## Financeiro e PDV

**Arquivo:**

[`../10-skills/FINANCEIRO_PDV.md`](../10-skills/FINANCEIRO_PDV.md)

Orienta cálculos, snapshots, estoque e transações de venda.

---

## Responsividade

**Arquivo:**

[`../10-skills/RESPONSIVIDADE.md`](../10-skills/RESPONSIVIDADE.md)

Resume as regras mais importantes de adaptação de interface.

---

## Segurança de Implementação

**Arquivo:**

[`../10-skills/SEGURANCA_IMPLEMENTACAO.md`](../10-skills/SEGURANCA_IMPLEMENTACAO.md)

Resume controles obrigatórios durante o desenvolvimento.

---

## Banco de Dados

**Arquivo:**

[`../10-skills/BANCO_DE_DADOS.md`](../10-skills/BANCO_DE_DADOS.md)

Orienta alterações seguras no banco.

---

## Frontend e Backend

**Arquivo:**

[`../10-skills/FRONTEND_BACKEND.md`](../10-skills/FRONTEND_BACKEND.md)

Orienta a separação entre interface, servidor e persistência.

---

## Vitrine e IA

**Arquivo:**

[`../10-skills/VITRINE_E_IA.md`](../10-skills/VITRINE_E_IA.md)

Orienta implementação da área pública e do Assistente IA.

---

## Testes e Qualidade

**Arquivo:**

[`../10-skills/TESTES_E_QUALIDADE.md`](../10-skills/TESTES_E_QUALIDADE.md)

Define verificações essenciais durante desenvolvimento.

---

## Infraestrutura e Performance

**Arquivo:**

[`../10-skills/INFRAESTRUTURA_PERFORMANCE.md`](../10-skills/INFRAESTRUTURA_PERFORMANCE.md)

Resume cuidados de infraestrutura, disponibilidade e desempenho durante a implementação.

---

## Escopo e Documentação

**Arquivo:**

[`../10-skills/ESCOPO_E_DOCUMENTACAO.md`](../10-skills/ESCOPO_E_DOCUMENTACAO.md)

Impede que a IA invente funcionalidades ou altere decisões documentadas sem necessidade.

---

# 12. Modelo de Negócio

## Modelo de Negócio

**Arquivo:**

[`../11-modelo-de-negocio/MODELO_DE_NEGOCIO.md`](../11-modelo-de-negocio/MODELO_DE_NEGOCIO.md)

**Finalidade:**

Explicar:

- público;
- proposta de valor;
- planos;
- receita;
- custos;
- estratégia comercial;
- validação do SaaS.

---

# 13. Testes e Qualidade

## Plano de Testes

**Arquivo:**

[`../12-testes-e-qualidade/PLANO_DE_TESTES.md`](../12-testes-e-qualidade/PLANO_DE_TESTES.md)

**Finalidade:**

Definir:

- tipos de testes;
- ferramentas;
- cenários;
- registros;
- critérios de aprovação;
- histórico de execução.

---

# 14. Índice e Modelos

## Índice da Documentação

**Arquivo:**

`INDICE_DA_DOCUMENTACAO.md`

**Finalidade:**

Este próprio documento.

Serve como mapa de navegação da documentação.

---

## Estrutura dos Documentos

**Arquivo:**

[`ESTRUTURA_DOS_DOCUMENTOS.md`](ESTRUTURA_DOS_DOCUMENTOS.md)

**Finalidade:**

Explicar como cada tipo de documento deve ser estruturado.

Serve como referência para outros projetos.

---

## Histórico não canônico

**Pasta:**

`../99-historico/`

**Finalidade:**

Preservar documentos substituídos apenas para consulta histórica. Arquivos dessa pasta **não são fonte oficial de verdade** e não devem orientar implementação ou prototipação quando houver divergência com a documentação atual.

---

# 15. README do Projeto

**Arquivo na raiz:**

```text
README.md
```

**Finalidade:**

Apresentar o Estilo e Gestão no GitHub de forma simples.

O README é a porta de entrada do repositório.

Ele não substitui a documentação detalhada.

---

# 16. Regra de navegação

Quando surgir uma dúvida:

```text
O que é o projeto?
→ DOCUMENTO_VISAO.md

Qual tecnologia usar?
→ DECISOES_TECNOLOGICAS.md

Como uma funcionalidade do barbeiro funciona?
→ FLUXO_BARBEIRO.md

Como a experiência pública funciona?
→ FLUXO_CLIENTE.md

Como a operação administrativa funciona?
→ FLUXO_ADMIN.md

Como o banco funciona?
→ BANCO_DE_DADOS.md

Qual é a tabela/coluna?
→ BANCO_EXEMPLO.sql

Como proteger?
→ DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md

Como implementar visualmente?
→ DESIGN_SYSTEM.md

Como adaptar ao celular?
→ RESPONSIVIDADE.md

Como configurar ENV?
→ ENV_SETUP.md

Como testar?
→ PLANO_DE_TESTES.md

Como o usuário usa?
→ MANUAL_DO_USUARIO.md

É uma funcionalidade futura?
→ IDEIAS_FUTURAS.md
```

---

# 17. Manutenção

Este índice deverá ser atualizado sempre que:

- um documento for criado;
- um documento for removido;
- um arquivo mudar de pasta;
- um arquivo for renomeado;
- uma nova Skill for criada.

Links quebrados deverão ser corrigidos junto com a alteração correspondente.