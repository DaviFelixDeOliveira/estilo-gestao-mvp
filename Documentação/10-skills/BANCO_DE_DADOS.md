# Skill — Banco de Dados

## Objetivo

Orientar alterações e consultas no PostgreSQL/Supabase sem quebrar integridade, histórico ou isolamento entre barbearias.

As referências completas são:

- `BANCO_DE_DADOS.md`;
- `BANCO_EXEMPLO.sql`.

---

# Banco oficial

Utilizar:

```text
PostgreSQL
+
Supabase
```

Não utilizar Prisma no MVP.

---

# Tenant

A entidade de isolamento é:

```text
barbearia
```

Dados administrativos devem possuir relação com a barbearia correspondente.

---

# Identidade

```text
auth.users
    ↓
perfis
    ↓
barbearias
```

Não criar tabela própria de senha.

---

# IDs

Utilizar UUIDs.

IDs devem ser tratados como identificadores opacos.

---

# Valores financeiros

Utilizar tipo exato:

```sql
numeric(12,2)
```

Não utilizar `float` ou `real` para valores monetários.

---

# Histórico

Não destruir histórico porque um cadastro mudou.

Utilizar snapshots em itens de venda.

---

# Estoque

`produtos.estoque_atual` representa o saldo atual.

`movimentacoes_estoque` representa o histórico.

Os dois devem permanecer consistentes.

---

# Relações entre tenants

Sempre garantir que entidades relacionadas pertençam à mesma barbearia.

Exemplo inválido:

```text
Produto A
→ Categoria da Barbearia B
```

---

# RLS

Ativar RLS nas tabelas privadas.

Policies devem ser testadas para:

- SELECT;
- INSERT;
- UPDATE;
- DELETE;

quando a operação estiver disponível.

---

# Migration

Não alterar produção manualmente sem histórico.

Mudança estrutural deve ser registrada em migration.

---

# Venda

Venda e baixa de estoque são operação transacional.

---

# Cancelamento

Não usar DELETE.

Utilizar status:

```text
CANCELADA
```

e registrar reversões necessárias.

---

# Vitrine

Não liberar acesso público a tabelas administrativas inteiras.

Criar projeção pública com campos explicitamente permitidos.

---

# Storage

Banco armazena referência.

Arquivo fica no Supabase Storage.

Não armazenar imagem em Base64 no PostgreSQL.

---

# YAGNI

Não criar tabelas futuras para:

- clientes;
- agendamentos;
- fidelidade;
- comissões;
- funcionários;
- billing automático;

enquanto essas funções permanecerem fora do MVP.