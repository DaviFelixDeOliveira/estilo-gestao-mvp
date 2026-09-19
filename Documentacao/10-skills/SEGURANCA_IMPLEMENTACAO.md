# Skill — Segurança de Implementação

## Objetivo

Orientar decisões técnicas de segurança durante o desenvolvimento.

A referência completa é `DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md`.

---

# Antes de qualquer mutação

Verificar:

1. usuário está autenticado?
2. registro pertence à barbearia?
3. entrada foi validada no servidor?
4. valor crítico foi recalculado?
5. operação precisa de transação?
6. erro pode vazar informação?

---

# Nunca confiar no cliente

Não confiar em dados enviados pelo navegador para determinar:

- `user_id`;
- `barbearia_id`;
- preço;
- custo;
- total;
- estoque final;
- permissão.

---

# Proibido

- salvar senha;
- expor Secret Key;
- expor Gemini API Key;
- utilizar `NEXT_PUBLIC_` em segredo;
- desativar RLS para fazer a aplicação funcionar;
- utilizar chave administrativa em operação comum;
- retornar stack trace;
- retornar SQL;
- consultar dados de outro tenant;
- armazenar imagens Base64 como solução de produção.

---

# Auth

Utilizar Supabase Auth.

A aplicação não implementa autenticação própria.

---

# RLS

Tabelas privadas devem possuir políticas adequadas.

Testar explicitamente:

```text
Barbearia A não acessa Barbearia B.
```

---

# PDV

Sempre:

- buscar item atual;
- validar tenant;
- verificar ativo;
- verificar estoque;
- recalcular valores;
- gerar snapshot;
- executar transação.

---

# IA

Sempre:

- chamar no servidor;
- usar allowlist pública;
- limitar entrada;
- aplicar rate limit;
- aplicar timeout;
- possuir fallback.

---

# Upload

Sempre validar:

- tipo;
- tamanho;
- propriedade;
- caminho;
- policy de Storage.

---

# Erros públicos

Nunca mostrar:

- token;
- segredo;
- caminho interno;
- stack;
- SQL;
- detalhes da infraestrutura.

---

# Logs

Não registrar:

- senha;
- API Key;
- Authorization header;
- token completo;
- conteúdo privado sem necessidade.