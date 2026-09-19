# Skill — Frontend e Backend

## Objetivo

Orientar a implementação do Next.js para que frontend, backend e mocks permaneçam separados e fáceis de evoluir.

A referência completa é `PREPARACAO_FRONTEND_PARA_BACKEND.md`.

---

# Stack

Utilizar:

- Next.js App Router;
- React;
- TypeScript estrito;
- Tailwind CSS;
- Zod;
- Supabase.

---

# Mocks

Mocks servem para:

- prototipação;
- desenvolvimento visual;
- testes.

Mocks não são banco.

Não espalhar imports de mocks pelas telas.

---

# Contrato de dados

Mocks e backend devem seguir estruturas equivalentes.

Exemplo:

```text
Tela
 ↓
Camada de dados
 ↓
Mock
```

depois:

```text
Tela
 ↓
Camada de dados
 ↓
Backend
```

---

# Server-side

Executar no servidor operações como:

- finalizar venda;
- ações futuras de cancelamento de venda, somente após fluxo aprovado;
- alterar estoque;
- registrar despesa;
- acessar segredo;
- chamar Gemini;
- executar ação administrativa.

---

# Client-side

Utilizar quando houver necessidade de interação no navegador.

Exemplos:

- formulário;
- modal;
- comanda;
- preview;
- chat;
- filtros interativos.

Não adicionar `"use client"` em toda página automaticamente.

---

# Zod

Validar entradas importantes.

Validação do navegador melhora a experiência.

Validação do servidor garante a regra.

Sempre manter a validação do servidor.

---

# Estados

Toda consulta relevante deve considerar:

```text
Loading
Success
Empty
Error
```

---

# Dinheiro

Criar função central para formatação.

Exemplo:

```text
formatCurrency()
```

Não duplicar lógica de moeda em componentes.

---

# Datas

Banco trabalha com formatos estruturados.

Formatação brasileira deve ocorrer na apresentação.

---

# Rotas privadas

Esconder menu não protege rota.

Validar sessão no servidor.

---

# Dados públicos

Criar tipos e consultas próprias para a Vitrine.

Não enviar objeto administrativo completo e esconder campos visualmente.

---

# Simplicidade

Não criar:

- microservices;
- repository pattern excessivo;
- dezenas de abstrações;
- API REST para tudo;

sem necessidade concreta.

A arquitetura deve permanecer simples para um MVP desenvolvido por uma pessoa.