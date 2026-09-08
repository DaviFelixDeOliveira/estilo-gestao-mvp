# Estrutura dos Documentos — Estilo e Gestão

## Objetivo

Este documento registra como cada tipo de documentação do **Estilo e Gestão** é organizado.

Ele serve como modelo para criação de documentação semelhante em projetos futuros.

Este arquivo explica a **estrutura**, não copia o conteúdo atual de cada documento.

---

# 1. Regra global

Todos os documentos devem:

1. começar com título;
2. apresentar o objetivo logo no início;
3. utilizar linguagem simples e direta;
4. evitar explicações repetidas;
5. possuir uma responsabilidade clara;
6. referenciar outro documento quando o assunto já estiver detalhado;
7. marcar decisões realmente não definidas;
8. evitar inventar valores;
9. utilizar exemplos apenas quando ajudarem a compreensão;
10. permanecer sincronizados com o projeto real.

---

# 2. Regra de fonte única

Cada assunto deverá possuir um documento principal.

Exemplo:

```text
Tecnologia
→ Decisões Tecnológicas

Fluxo funcional
→ Fluxo do Barbeiro e Cliente

Banco
→ Banco de Dados

Segurança
→ Diretrizes de Segurança

Interface
→ Design System

Testes
→ Plano de Testes
```

Outros documentos podem mencionar o assunto resumidamente, mas não devem reproduzir todo o detalhamento.

---

# 3. Decisões Tecnológicas

## Finalidade

Registrar as tecnologias realmente adotadas.

## Estrutura recomendada

```text
# Decisões Tecnológicas

## Objetivo

# Tecnologias utilizadas

## Desenvolvimento
### Tecnologia
- o que é;
- onde é utilizada;
- motivo da utilização.

## Frontend
### Tecnologia

## Backend e dados
### Tecnologia

## Integrações
### Tecnologia

## Hospedagem
### Tecnologia

## Arquitetura resumida

## Princípio de simplicidade
```

## Não incluir

- tecnologias apenas consideradas;
- ferramentas futuras;
- funcionalidades;
- tutorial completo de configuração.

---

# 4. Documento de Visão

## Finalidade

Apresentar o projeto para alguém que precisa entender o todo sem ler a documentação técnica inteira.

## Estrutura recomendada

```text
# Documento de Visão

## Objetivo

# Resumo

# Palavras-chave

# Sumário

# 1. Introdução

# 2. Nicho de mercado
## Público-alvo
## Problema
## Solução

# 3. Tecnologias utilizadas
Resumo apenas.

# 4. Empresa

# 5. Análise do sistema
## Nome
## Descrição geral
## Requisitos funcionais
## Requisitos não funcionais
## Esquema de cores
## Wireframes

# 6. Manual do usuário
Resumo.

# 7. Modelo de negócio
Resumo.

# 8. Plano de testes
Resumo.

# 9. Apêndices

# 10. Referências

# 11. Conclusão
```

## Regra

Assuntos que possuem documento próprio devem aparecer apenas de forma resumida.

---

# 5. Perguntas

## Finalidade

Registrar dúvidas reais que dependem de uma pessoa externa ao desenvolvimento.

## Estrutura

```text
# Perguntas

## Objetivo

# Categoria

## P01 — Pergunta

Contexto curto.

Opções quando aplicável.

Resposta esperada.
```

## Regra

Ao obter resposta:

1. atualizar documento responsável;
2. remover ou marcar pergunta como resolvida.

Não transformar este arquivo em backlog técnico.

---

# 6. Manual do Usuário

## Finalidade

Ensinar o usuário final a operar o sistema.

## Estrutura

```text
# Manual do Usuário

## Objetivo

# 1. Tela/Função

![Imagem](./assets/imagem.png)

1. passo;
2. passo;
3. passo.

# 2. Próxima função
...
```

## Deve conter

- nome real das telas;
- botões;
- passos;
- imagens.

## Não deve conter

- SQL;
- arquitetura;
- erro técnico;
- RLS;
- regras internas de implementação.

---

# 7. Fluxo Técnico de Usuários

## Finalidade

Explicar detalhadamente como cada funcionalidade deve funcionar.

## Estrutura recomendada

```text
# Fluxo Técnico

## Objetivo

# Atores

# Regras globais

# Estados globais

# Funcionalidade

## Ator
## Pré-condições
## Campos
## Validações
## Ações
## Fluxo
## Backend resumido
## Erros
## Resultado
```

## Regra

Esse documento é a fonte principal para:

- campos;
- validações;
- mensagens;
- sequências;
- comportamento funcional.

---

# 8. ENV Setup

## Finalidade

Ensinar como configurar variáveis de ambiente.

## Estrutura

```text
# ENV Setup

## Objetivo

# Arquivos de ambiente

# VARIAVEL

```env
VARIAVEL=
```

## Função
## Onde encontrar
## Pode ir ao navegador?
## Observações

# .env.example

# Vercel

# Checklist
```

## Regra

Nunca inserir segredo real.

---

# 9. Preparação Frontend para Backend

## Finalidade

Preparar frontend para troca de mocks por dados reais.

## Estrutura

```text
# Preparação Frontend para Backend

## Objetivo

# Princípio

# Estrutura de pastas

# Tipos

# Mocks

# Camada de dados

# Server-side

# Client-side

# Validação

# Estados

# Dados públicos

# Uploads

# Integrações

# Checklist
```

---

# 10. Banco Exemplo SQL

## Finalidade

Representar visualmente a estrutura do banco.

## Estrutura

```sql
-- OBJETIVO

-- ENUMS

-- TABELA 1

create table ...

-- TABELA 2

create table ...

-- ÍNDICES

-- RLS

-- OBSERVAÇÕES
```

## Regra

Deixar explícito quando o arquivo é apenas referência e não migration de produção.

---

# 11. Banco de Dados

## Finalidade

Explicar como o banco funciona, e não apenas listar colunas.

## Estrutura

```text
# Banco de Dados

## Objetivo

# Tecnologia

# Identidade

# Tenant

# Estrutura conceitual

# Entidades

# Relacionamentos

# Histórico

# Snapshots

# Transações

# Concorrência

# RLS

# Storage

# Migrations

# Checklist
```

---

# 12. Diretrizes de Segurança

## Finalidade

Definir requisitos técnicos obrigatórios de segurança.

## Estrutura

```text
# Diretrizes de Segurança

## Objetivo

# Princípios

# Dados

# Auth

# Sessão

# Autorização

# RLS

# Segredos

# Validação

# Operações críticas

# Uploads

# Dados públicos

# IA

# Logs

# Erros

# Incidentes

# Privacidade desde a concepção

# Checklist
```

---

# 13. Política de Privacidade

## Finalidade

Explicar publicamente o tratamento de dados pessoais.

## Estrutura recomendada

```text
# Política de Privacidade

Status
Versão
Data

## Objetivo

# Responsável

# Serviço

# Titulares

# Dados coletados

# Finalidades

# Bases legais

# Compartilhamento

# Transferência internacional

# Retenção

# Direitos

# Segurança

# Incidentes

# Contato

# Alterações

# Pendências antes da publicação
```

## Regra

Não inventar:

- base legal;
- prazo;
- empresa;
- endereço;
- foro.

Validar profissionalmente.

---

# 14. Preparação para Revisão Jurídica

## Finalidade

Organizar os fatos que um advogado precisa conhecer.

## Estrutura

```text
# Preparação para Revisão Jurídica

## Objetivo

# Resumo do sistema

# Pessoas envolvidas

# Dados

# Fornecedores

# IA

# Vitrine

# Imagens

# Bases legais a validar

# Controlador/operador

# Retenção

# Exclusão

# Incidentes

# Consumidor

# Documentos para revisão

# Perguntas ao advogado

# Checklist
```

---

# 15. Termos de Uso

## Finalidade

Definir regras contratuais de uso do sistema.

## Estrutura

```text
# Termos de Uso

Status
Versão
Data

## Objetivo

# Responsável

# Serviço

# Conta

# Uso permitido

# Uso proibido

# Conteúdo do usuário

# Vitrine

# IA

# Planos

# Cobrança

# Cancelamento

# Suspensão

# Disponibilidade

# Privacidade

# Propriedade intelectual

# Responsabilidades

# Alterações

# Legislação

# Contato

# Pendências
```

---

# 16. Design System

## Finalidade

Definir como implementar visualmente a interface.

## Estrutura

```text
# Design System

## Objetivo

# Princípios

# Cores

# Tipografia

# Espaçamento

# Bordas

# Sombras

# Ícones

# Botões

# Inputs

# Cards

# Tabelas

# Modais

# Estados

# Navegação

# Acessibilidade

# Tokens

# Componentes

# Checklist
```

---

# 17. Esquema de Cores

## Finalidade

Explicar o conceito e motivo das cores.

## Estrutura

```text
# Esquema de Cores

## Objetivo

# Conceito

# Paleta

## Cor
- valor;
- interpretação;
- motivo.

# Cores semânticas

# Contraste

# Hierarquia

# Uso administrativo

# Uso público

# Resumo da paleta

# Decisões pendentes
```

---

# 18. Responsividade

## Finalidade

Explicar adaptação da interface a diferentes espaços.

## Estrutura

```text
# Responsividade

## Objetivo

# Mobile First

# Breakpoints

# Navegação

# Formulários

# Tabelas

# Modais

# Dashboard

# PDV

# Financeiro

# Vitrine

# Portfólio

# Chat

# Imagens

# Performance

# Testes

# Checklist
```

---

# 19. Checklist Mestre

## Finalidade

Acompanhar progresso.

## Estrutura

```text
# Checklist Mestre

## Objetivo

# Documento 1

- [x] Definido
- [ ] Pendente

# Documento 2
...
```

## Regra

Não explicar novamente a funcionalidade.

Somente registrar:

- concluído;
- pendente;
- ação necessária.

---

# 20. Ideias Futuras

## Finalidade

Manter funcionalidades fora do MVP.

## Estrutura

```text
# Ideias Futuras

## Objetivo

# Ideia

Descrição curta.

Possibilidades.

Dependências.

Cuidados.

# Próxima ideia
```

## Regra

Enquanto estiver neste arquivo:

```text
NÃO FAZ PARTE DO MVP
```

---

# 21. Skills

## Finalidade

Fornecer regras curtas para uma IA desenvolvedora.

## Estrutura de uma Skill

```text
# Skill — Tema

## Objetivo

Referência completa:
- documento principal.

# Regras principais

# Sempre fazer

# Nunca fazer

# Checklist
```

## Regra

A Skill resume.

Não deve substituir o documento principal.

---

# 22. Modelo de Negócio

## Finalidade

Explicar como o projeto pretende gerar receita.

## Estrutura

```text
# Modelo de Negócio

## Objetivo

# Modelo

# Público

# Problema

# Proposta de valor

# Planos

# Comparação

# Receita

# Custos

# Formação de preço

# Validação

# Estratégia de venda

# Métricas

# Decisões pendentes
```

---

# 23. Plano de Testes

## Finalidade

Definir e registrar testes.

## Estrutura

```text
# Plano de Testes

## Objetivo

# Tipos de teste

# Ferramentas

# Unitários

# Componentes

# Integração

# Banco

# RLS

# E2E

# Segurança

# Performance

# Usabilidade

# Responsividade

# Acessibilidade

# Registro dos testes

# Status

# Gravidade

# Critério de lançamento
```

---

# 24. Índice da Documentação

## Finalidade

Permitir navegar pela documentação.

## Estrutura

```text
# Índice da Documentação

## Objetivo

# Estrutura geral

# Pasta

## Documento
- link;
- finalidade.

# Próxima pasta

# Regra de navegação

# Manutenção
```

---

# 25. Estrutura dos Documentos

## Finalidade

Registrar os próprios modelos documentais.

Estrutura:

```text
# Estrutura dos Documentos

## Objetivo

# Regra global

# Documento

## Finalidade
## Estrutura
## Regras
```

Este é o formato utilizado pelo próprio documento atual.

---

# 26. README

## Finalidade

Apresentar o projeto para quem acessa o repositório.

## Estrutura recomendada

```text
# Nome

Descrição curta.

# Sobre

# Funcionalidades

# Público

# Tecnologias

# Arquitetura resumida

# Status

# Documentação

# Desenvolvimento

# Avisos
```

## Regra

README deve ser simples.

Não reproduzir:

- banco completo;
- fluxo completo;
- política completa;
- documentação técnica inteira.

Ele direciona para a documentação detalhada.

---

# 27. Nomenclatura

## Pastas

Utilizar:

```text
numero-contexto
```

Exemplo:

```text
04-banco-de-dados
```

## Arquivos

Utilizar:

```text
MAIUSCULAS_COM_UNDERSCORE.md
```

Exemplo:

```text
BANCO_DE_DADOS.md
```

Exceções:

```text
README.md
```

e arquivos cujo padrão técnico recomende outro nome.

---

# 28. Numeração de documentos

A numeração das pastas indica agrupamento e ordem lógica.

Não é necessário criar uma pasta diferente para cada arquivo.

Documentos do mesmo contexto devem permanecer juntos.

---

# 29. Uso de Markdown

Utilizar:

- títulos;
- subtítulos;
- listas;
- tabelas quando úteis;
- blocos de código;
- links relativos;
- checkboxes.

Evitar HTML no Markdown quando não for necessário.

---

# 30. Links relativos

Quando um documento referenciar outro dentro do repositório, preferir links relativos.

Exemplo:

```markdown
[Banco de Dados](../04-banco-de-dados/BANCO_DE_DADOS.md)
```

Isso permite navegar pelo GitHub sem depender de uma URL fixa.

---

# 31. Decisões pendentes

Quando uma informação indispensável ainda não existir:

```text
DECISÃO PENDENTE
```

ou, em documentos jurídicos:

```text
[VALIDAR JURIDICAMENTE]
```

Não substituir ausência de decisão por uma regra inventada.

---

# 32. Atualização

Um documento deve ser atualizado quando sua própria responsabilidade mudar.

Exemplo:

mudou uma coluna:

```text
BANCO_EXEMPLO.sql
BANCO_DE_DADOS.md
```

podem precisar de revisão.

Isso não significa editar automaticamente Documento de Visão, Manual, README e mais dez arquivos se a mudança não os afetar.

---

# 33. Critério de qualidade

Um bom documento deve permitir que a pessoa entenda:

1. por que ele existe;
2. qual assunto ele controla;
3. quais decisões já estão tomadas;
4. quais pontos ainda estão pendentes;
5. onde buscar detalhes de outro assunto.

Se dois documentos explicarem a mesma regra detalhadamente, a estrutura precisa ser revisada.