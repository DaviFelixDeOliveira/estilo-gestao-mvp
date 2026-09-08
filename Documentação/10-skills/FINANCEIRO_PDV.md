# Skill — Financeiro e PDV

## Objetivo

Orientar a implementação de vendas, estoque e cálculos financeiros sem gerar valores inconsistentes.

A referência funcional completa está em `FLUXO_BARBEIRO_E_CLIENTE.md`.

---

# 1. Faturamento

Faturamento é a soma das vendas válidas.

Vendas canceladas não entram no faturamento válido.

---

# 2. Fluxo de caixa

Fluxo de caixa representa:

```text
Entradas reais
-
Saídas reais
```

Compra de estoque é uma saída de caixa.

---

# 3. Resultado estimado

Não chamar qualquer resultado de **lucro líquido**.

O sistema trabalha com resultado estimado gerencial.

Ele pode considerar:

- faturamento;
- custos diretos congelados;
- despesas aplicáveis.

---

# 4. Serviço

Sem custo estimado:

```text
resultado_item = preço
```

Com custo:

```text
resultado_item = preço - custo_estimado
```

O custo estimado representa insumos diretamente consumidos.

Não representa:

- aluguel;
- energia;
- internet;
- salário.

---

# 5. Produto

```text
resultado_item =
(preço_snapshot - custo_snapshot)
× quantidade
```

---

# 6. Compra de estoque

Uma compra:

- aumenta estoque;
- representa saída de caixa;
- pode atualizar o custo atual do produto.

O custo do produto também é congelado quando ocorrer a venda.

Não descontar a mesma compra duas vezes no mesmo indicador.

---

# 7. Comanda

Antes da finalização:

```text
comanda != venda
```

Ela existe apenas como estado temporário do frontend.

Não:

- criar venda pendente;
- alterar estoque;
- alterar financeiro.

---

# 8. Finalização

O frontend envia principalmente:

- IDs;
- tipos;
- quantidades;
- forma de pagamento quando informada.

O backend deve:

1. buscar registros atuais;
2. validar propriedade;
3. validar status;
4. validar estoque;
5. buscar preços;
6. buscar custos;
7. recalcular;
8. criar snapshots;
9. registrar venda;
10. alterar estoque.

---

# 9. Regra crítica

O total calculado pelo frontend é apenas visual.

O backend recalcula o valor final.

---

# 10. Snapshot

Venda antiga nunca muda porque:

- serviço mudou de preço;
- produto mudou de preço;
- produto mudou de custo;
- cadastro foi inativado.

Preservar:

- nome;
- preço;
- custo;
- quantidade;
- subtotal;
- resultado.

---

# 11. Cancelamento

Cancelar venda:

- não apaga a venda;
- altera status;
- restaura estoque dos produtos;
- cria reversão;
- remove venda dos agregados válidos;
- preserva histórico.

---

# 12. Estoque

Nunca permitir:

```text
estoque < 0
```

A verificação definitiva ocorre no backend/banco.

---

# 13. Concorrência

Duas requisições simultâneas não podem vender a mesma última unidade.

Utilizar transação e controle adequado do PostgreSQL.

---

# 14. Operação atômica

Venda deve resultar em:

```text
TUDO CERTO
→ COMMIT
```

ou:

```text
QUALQUER ERRO
→ ROLLBACK
```

Nunca deixar venda parcialmente registrada.