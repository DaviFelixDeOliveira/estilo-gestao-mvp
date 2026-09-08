# Skill — Escopo e Documentação

## Objetivo

Impedir que a IA desenvolvedora invente funcionalidades, regras ou arquitetura fora da documentação do Estilo e Gestão.

---

# Fonte de verdade

Antes de implementar uma funcionalidade:

1. identificar documento responsável;
2. consultar regra atual;
3. verificar decisões pendentes;
4. implementar somente o que estiver aprovado.

---

# Decisão pendente

Quando encontrar:

```text
DECISÃO PENDENTE
```

não inventar um valor definitivo.

Se a decisão impedir a implementação, solicitar definição.

---

# MVP

Não adicionar silenciosamente:

- agendamento;
- clientes;
- lembretes;
- fidelidade;
- multi-barbeiro;
- comissão;
- cobrança automática;
- WhatsApp automático;
- pagamento online.

Esses itens pertencem a `IDEIAS_FUTURAS.md`.

---

# Não duplicar documentação

Cada assunto possui documento principal.

Ao precisar mencionar uma regra já documentada:

- resumir;
- referenciar o documento correspondente.

Não criar segunda versão da mesma regra.

---

# Não alterar regra de negócio por conveniência

Se uma implementação parecer mais fácil com comportamento diferente:

- não mudar sozinho;
- identificar conflito;
- propor mudança;
- aguardar decisão quando necessário.

---

# Simplicidade

O projeto é um MVP desenvolvido por uma pessoa.

Evitar:

- microservices;
- arquitetura distribuída;
- filas sem necessidade;
- cache complexo;
- abstrações prematuras;
- infraestrutura que não resolve problema atual.

---

# Compatibilidade documental

Ao mudar uma regra aprovada, verificar quais documentos realmente precisam de atualização.

Exemplo:

```text
Forma de pagamento deixa de ser opcional
```

Atualizar:

- fluxo funcional;
- banco, se necessário;
- testes.

Não copiar a mesma explicação para dez arquivos.

---

# Antes de criar tecnologia

Verificar se ela já está aprovada em:

```text
DECISOES_TECNOLOGICAS.md
```

Se uma nova tecnologia for realmente necessária, documentar a decisão.

---

# Regra final

Não completar lacunas com imaginação.

Implementar o sistema documentado, não um SaaS genérico de barbearia criado pela própria IA.