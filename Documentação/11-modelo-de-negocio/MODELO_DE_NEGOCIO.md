# Modelo de Negócio — Estilo e Gestão

## Objetivo

Este documento explica como o **Estilo e Gestão** pretende gerar receita, quais clientes busca atender e como os planos do SaaS serão estruturados.

Valores de assinatura ainda não foram definidos.

---

# 1. Modelo

O Estilo e Gestão será oferecido como **SaaS por assinatura**.

O barbeiro paga periodicamente para utilizar o sistema sem precisar:

- instalar servidor;
- manter banco próprio;
- desenvolver seu próprio site;
- construir um sistema de gestão.

A receita principal será recorrente.

---

# 2. Público-alvo

O foco inicial são:

- barbeiros autônomos;
- pequenas barbearias;
- operações simples administradas principalmente por uma pessoa.

O projeto não busca inicialmente atender grandes redes.

---

# 3. Problema comercial

Pequenos profissionais podem precisar utilizar diferentes meios para:

- registrar vendas;
- acompanhar despesas;
- controlar estoque;
- visualizar resultados;
- divulgar trabalhos;
- apresentar serviços e preços;
- responder dúvidas frequentes.

O Estilo e Gestão reúne essas necessidades em um único serviço.

---

# 4. Proposta de valor

A proposta central é:

> permitir que o barbeiro administre e divulgue sua barbearia de forma simples, utilizando um único sistema.

O produto combina dois lados:

```text
Gestão interna
+
Divulgação pública
```

---

# 5. Gestão interna

O sistema oferece recursos como:

- PDV/Comanda;
- serviços;
- produtos;
- estoque;
- vendas;
- despesas;
- Dashboard;
- relatórios.

---

# 6. Divulgação

A Vitrine Digital permite apresentar:

- barbearia;
- serviços;
- preços;
- produtos;
- Portfólio;
- endereço;
- horários;
- WhatsApp;
- Instagram.

O barbeiro passa a possuir um link próprio para divulgar seu trabalho.

---

# 7. Estrutura comercial

O modelo inicial terá dois planos:

1. Plano Normal;
2. Plano com IA.

Os nomes comerciais poderão ser alterados futuramente.

---

# 8. Plano Normal

## Objetivo

Atender o barbeiro que deseja gestão e divulgação, mas não precisa do Assistente IA.

## Recursos previstos

- Dashboard;
- serviços;
- categorias;
- produtos;
- estoque;
- PDV/Comanda;
- histórico de vendas;
- despesas;
- relatórios;
- configurações;
- Vitrine Digital;
- Portfólio;
- contatos públicos.

## Preço

```text
DECISÃO PENDENTE
```

---

# 9. Plano com IA

## Objetivo

Oferecer todos os recursos do Plano Normal e adicionar atendimento automatizado na Vitrine.

## Recursos

Inclui tudo do Plano Normal mais:

- Assistente IA público;
- respostas sobre serviços;
- respostas sobre preços;
- respostas sobre produtos;
- respostas sobre horários;
- respostas sobre localização;
- direcionamento para WhatsApp.

## Posicionamento comercial

O Assistente IA poderá ser apresentado de forma simples como um:

> **funcionário virtual disponível 24 horas para responder dúvidas básicas dos visitantes.**

Isso representa a proposta comercial do recurso.

Não significa garantia técnica de disponibilidade ininterrupta, pois serviços digitais podem passar por manutenção ou indisponibilidade.

## Preço

```text
DECISÃO PENDENTE
```

---

# 10. Comparação dos planos

| Recurso | Plano Normal | Plano com IA |
|---|:---:|:---:|
| Dashboard | ✓ | ✓ |
| PDV/Comanda | ✓ | ✓ |
| Serviços | ✓ | ✓ |
| Produtos | ✓ | ✓ |
| Estoque | ✓ | ✓ |
| Financeiro | ✓ | ✓ |
| Relatórios | ✓ | ✓ |
| Vitrine Digital | ✓ | ✓ |
| Portfólio | ✓ | ✓ |
| Assistente IA |  | ✓ |

O objetivo é manter apenas uma diferença comercial importante no início.

Isso simplifica:

- venda;
- entendimento;
- suporte;
- desenvolvimento.

---

# 11. Fonte de receita

A principal receita será:

```text
assinatura recorrente
```

Exemplo conceitual:

```text
Receita mensal =
clientes Plano Normal × preço Normal
+
clientes Plano IA × preço IA
```

---

# 12. Receita recorrente mensal

A métrica principal poderá ser o **MRR**, ou Receita Recorrente Mensal.

Fórmula:

```text
MRR =
receita mensal recorrente de todas
as assinaturas ativas
```

Essa métrica ajuda a acompanhar o crescimento do SaaS.

---

# 13. Receita recorrente anual

Também poderá ser acompanhado:

```text
ARR = MRR × 12
```

quando o modelo possuir receita mensal estável.

---

# 14. Custos principais

Os custos podem incluir:

- domínio;
- hospedagem;
- banco de dados;
- armazenamento;
- autenticação;
- utilização da Gemini API;
- serviços de e-mail quando necessários;
- ferramentas comerciais futuras;
- impostos;
- contabilidade, quando aplicável;
- suporte e operação.

Os valores dependem da quantidade de usuários e dos planos dos fornecedores.

---

# 15. Custo do Plano Normal

O custo tende a estar relacionado principalmente a:

- aplicação;
- banco;
- Storage;
- Auth;
- tráfego.

O custo por cliente deverá ser acompanhado conforme o sistema ganhar usuários reais.

---

# 16. Custo do Plano com IA

Além dos custos normais, existe consumo da Gemini API.

Conceito:

```text
Custo Plano IA =
custo base
+
consumo de IA
```

Por isso, o preço do plano com IA deverá possuir margem suficiente para cobrir esse consumo.

---

# 17. Margem bruta

Uma forma simples de acompanhar:

```text
Margem bruta =
Receita
-
Custos variáveis diretamente relacionados
```

O cálculo real deverá considerar o modelo tributário e financeiro adotado.

---

# 18. Formação de preço

O preço não deverá ser escolhido apenas observando quanto concorrentes cobram.

Deverão ser considerados:

1. custo mensal da infraestrutura;
2. custo médio da IA;
3. impostos;
4. suporte;
5. margem desejada;
6. valor percebido pelo barbeiro;
7. preço de alternativas do mercado;
8. capacidade de pagamento do público.

---

# 19. Diferença de preço entre planos

A diferença deverá cobrir:

- consumo da Gemini API;
- risco de variação de uso;
- valor adicional entregue;
- margem adicional necessária.

Não vender o plano com IA pelo mesmo preço do normal apenas para facilitar a aquisição.

---

# 20. Limites da IA

Antes da comercialização deverão ser definidos limites adequados.

Exemplos de decisões:

- quantidade de mensagens;
- limite técnico por período;
- política de abuso.

Esses valores ainda não estão definidos.

---

# 21. Validação inicial

O projeto deverá ser validado primeiro com profissionais reais.

A validação deverá observar:

- facilidade de uso;
- utilidade do PDV;
- utilidade do estoque;
- compreensão dos relatórios;
- valor percebido da Vitrine;
- interesse pelo Assistente IA;
- disposição para pagar.

---

# 22. Cliente piloto

O barbeiro utilizado na validação poderá funcionar como cliente piloto.

O objetivo é descobrir:

- o que realmente utiliza;
- o que não utiliza;
- quais telas geram dificuldade;
- quais informações são importantes;
- quanto valor o sistema entrega.

---

# 23. Estratégia inicial de venda

Como o projeto começa pequeno, a aquisição inicial poderá ocorrer diretamente.

Exemplos:

- apresentação pessoal;
- demonstração;
- indicação;
- contato com barbearias locais;
- divulgação do próprio produto.

Não é necessário construir uma operação de marketing complexa antes de validar o produto.

---

# 24. Demonstração

Uma demonstração deverá mostrar rapidamente:

1. Dashboard;
2. registro de venda;
3. estoque;
4. financeiro;
5. Vitrine;
6. Portfólio;
7. Assistente IA no plano correspondente.

O foco deve ser o problema resolvido, não a tecnologia utilizada.

---

# 25. Argumento do Plano Normal

Exemplo conceitual:

> Organize vendas, estoque e financeiro e tenha uma página própria para divulgar sua barbearia.

---

# 26. Argumento do Plano com IA

Exemplo conceitual:

> Além da gestão e da Vitrine, tenha um funcionário virtual para responder dúvidas básicas dos visitantes a qualquer hora.

O texto comercial definitivo poderá ser alterado após testes com clientes.

---

# 27. Cobrança inicial

A automação de assinatura não faz parte do MVP atual.

A cobrança poderá começar de forma manual enquanto houver poucos clientes.

Antes do lançamento deverão ser definidos:

- meio de pagamento;
- periodicidade;
- vencimento;
- emissão de comprovante quando aplicável;
- cancelamento.

---

# 28. Billing automatizado

Quando a quantidade de clientes justificar, poderá ser criada integração específica para:

- assinatura;
- cobrança;
- troca de plano;
- inadimplência;
- cancelamento.

Essa funcionalidade permanece futura.

---

# 29. Indicadores comerciais

Quando houver clientes reais, acompanhar:

## Clientes ativos

Quantidade total de assinantes.

## MRR

Receita recorrente mensal.

## Churn

Quantidade ou percentual de clientes que deixam o serviço.

## Conversão

Quantidade de interessados que se tornam clientes.

## Plano mais utilizado

Normal ou IA.

## Uso da IA

Ajuda a entender custo e valor do plano adicional.

---

# 30. CAC

Quando houver investimento em aquisição, poderá ser calculado o Custo de Aquisição de Cliente.

```text
CAC =
gasto para aquisição
/
novos clientes adquiridos
```

No início, quando a venda for principalmente direta, essa métrica poderá ser simples.

---

# 31. Retenção

Mais importante que conseguir vários testes gratuitos será verificar se os barbeiros continuam utilizando o sistema.

Sinais relevantes:

- vendas continuam sendo registradas;
- estoque continua atualizado;
- Dashboard é consultado;
- Vitrine permanece publicada;
- assinatura permanece ativa.

---

# 32. Expansão futura

Novas fontes de receita poderão ser avaliadas futuramente.

Essas ideias pertencem ao documento:

```text
IDEIAS_FUTURAS.md
```

Não serão consideradas receita do MVP enquanto não forem aprovadas.

---

# 33. Decisões pendentes

Antes do lançamento comercial deverão ser definidos:

- [ ] nome comercial dos planos;
- [ ] preço do Plano Normal;
- [ ] preço do Plano com IA;
- [ ] periodicidade da assinatura;
- [ ] meio de cobrança;
- [ ] data de vencimento;
- [ ] política de cancelamento;
- [ ] política de inadimplência;
- [ ] período gratuito, caso exista;
- [ ] limite de uso da IA;
- [ ] canal de suporte;
- [ ] condições comerciais finais.

---

# 34. Critério de validação do modelo

O modelo estará inicialmente validado quando houver evidência de que profissionais reais:

1. entendem o produto;
2. utilizam as funções principais;
3. percebem valor;
4. aceitam pagar pelo serviço;
5. continuam utilizando após o período inicial.

O objetivo do MVP não é provar que todas as ideias futuras funcionam.

É provar que o núcleo do Estilo e Gestão resolve um problema pelo qual existe disposição para pagar.