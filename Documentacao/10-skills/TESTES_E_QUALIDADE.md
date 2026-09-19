# Skill — Testes e Qualidade

## Objetivo

Orientar a IA desenvolvedora a testar alterações antes de considerá-las concluídas.

A estratégia completa está em `PLANO_DE_TESTES.md`.

---

# Regra principal

Código compilando não significa funcionalidade correta.

Para cada alteração, verificar:

1. regra funciona;
2. erro funciona;
3. estado vazio funciona;
4. loading funciona;
5. responsividade funciona;
6. permissão funciona;
7. não quebrou fluxo anterior.

---

# Testes unitários

Utilizar principalmente para:

- cálculos;
- normalização;
- validações;
- funções puras;
- regras financeiras.

---

# Componentes

Testar comportamento percebido pelo usuário.

Preferir testar:

```text
usuário clica
→ resultado aparece
```

em vez de detalhes internos da implementação.

---

# Integração

Testar comunicação real entre partes importantes.

Exemplos:

- backend + banco;
- venda + estoque;
- cancelamento + reversão;
- Auth + perfil;
- RLS + tenant.

---

# E2E

Testar fluxos críticos completos.

Prioridades:

- criar conta/login;
- cadastrar serviço;
- cadastrar produto;
- reposição;
- finalizar venda;
- ações futuras de cancelamento de venda, somente após fluxo aprovado;
- despesa;
- Vitrine.

---

# Segurança

Testar explicitamente:

```text
Barbearia A
NÃO acessa
Barbearia B
```

---

# PDV

Testar:

- cálculo;
- snapshots;
- estoque insuficiente;
- envio duplicado;
- cancelamento;
- concorrência.

---

# IA — recurso futuro

Não faz parte da versão inicial. Criar testes específicos somente quando o módulo voltar ao escopo, seguindo `ASSISTENTE_IA_FUTURO.md`.

---

# Antes de concluir tarefa

- testes relevantes passando;
- TypeScript sem erro;
- análise estática revisada;
- nenhuma informação secreta exposta;
- fluxo manual principal verificado.