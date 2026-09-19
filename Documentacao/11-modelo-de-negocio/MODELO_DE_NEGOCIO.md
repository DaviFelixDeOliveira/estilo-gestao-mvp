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

A versão inicial possui dois planos:

1. Plano Grátis;
2. Plano Normal.

O Assistente IA permanece como possibilidade futura e não possui plano comercial ativo nesta etapa.

---

# 8. Plano Grátis

## Objetivo

Permitir que a barbearia mantenha sua presença pública e seus dados históricos mesmo sem uma assinatura paga ativa.

## Recursos previstos

- Vitrine Digital;
- Portfólio;
- serviços e produtos para divulgação;
- consulta de histórico criado durante períodos pagos, em modo somente leitura quando aplicável.

## Preço

```text
R$ 0,00
```

---

# 9. Plano Normal

## Objetivo

Atender o barbeiro que deseja o núcleo completo de gestão e divulgação.

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
- contatos públicos;
- exportações previstas para o plano pago.

## Preço inicial

```text
R$ 49,90 por ciclo mensal
```

---

# 10. Comparação dos planos

| Recurso | Grátis | Normal |
|---|:---:|:---:|
| Vitrine Digital | ✓ | ✓ |
| Portfólio | ✓ | ✓ |
| Serviços e produtos para divulgação | ✓ | ✓ |
| Histórico pago em somente leitura | ✓ | ✓ |
| Dashboard completo |  | ✓ |
| PDV/Comanda |  | ✓ |
| Estoque e movimentações |  | ✓ |
| Financeiro |  | ✓ |
| Relatórios completos |  | ✓ |
| Exportações |  | ✓ |

O Assistente IA não faz parte da matriz comercial da versão inicial. Seu planejamento permanece separado em `ASSISTENTE_IA_FUTURO.md`.

---

# 11. Fonte de receita

A principal receita da versão inicial será a assinatura recorrente do Plano Normal.

Exemplo conceitual:

```text
Receita mensal = clientes ativos no Plano Normal × R$ 49,90
```

O Plano Grátis não gera receita direta de assinatura.

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

# 16. Custos de recursos futuros

O Assistente IA não gera custo operacional na versão inicial porque não está implementado. Caso o recurso seja retomado, custos de provedor, limites de uso, margem e preço deverão ser reavaliados antes da oferta comercial.

---

# 17. Margem bruta

A margem do Plano Normal deve considerar os custos reais de infraestrutura, armazenamento, autenticação, domínio, suporte, impostos e demais fornecedores utilizados pela versão inicial.

---

# 18. Formação de preço

O preço inicial do Plano Normal é R$ 49,90 por ciclo mensal. A sustentabilidade desse valor deverá ser acompanhada durante o uso real, considerando custos e esforço de suporte.

---

# 19. Expansões comerciais futuras

Novos planos ou recursos pagos somente deverão ser criados quando houver problema validado, demanda real e custo conhecido. O Assistente IA permanece como uma dessas possibilidades futuras.

---

# 20. Limites de IA — futuro

Não há limites de IA ativos na versão inicial. Qualquer definição futura deverá seguir `ASSISTENTE_IA_FUTURO.md`.

---

# 21. Validação inicial

O projeto deverá ser validado primeiro com profissionais reais.

A validação deverá observar:

- facilidade de uso;
- utilidade do PDV;
- utilidade do estoque;
- compreensão dos relatórios;
- valor percebido da Vitrine;
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

O foco deve ser o problema resolvido, não a tecnologia utilizada.

---

# 25. Argumento do Plano Normal

Exemplo conceitual:

> Organize vendas, estoque e financeiro e tenha uma página própria para divulgar sua barbearia.

---

# 26. Assistente IA — oportunidade futura

Não faz parte da oferta comercial inicial. A proposta só deverá ser apresentada a clientes quando houver implementação validada, custos conhecidos e decisão explícita de retorno ao escopo.

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

Acompanhar a distribuição entre Grátis e Normal.

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

Não serão consideradas receita da versão inicial enquanto não forem aprovadas.

---

# 33. Decisões pendentes

Antes do lançamento comercial deverão ser definidos:

- [ ] nome comercial dos planos;
- [x] preço inicial do Plano Normal: R$ 49,90 por ciclo mensal;
- [x] periodicidade mensal por ciclo de validade;
- [x] cobrança inicial manual por Pix;
- [ ] data de vencimento;
- [x] política inicial de cancelamento definida;
- [x] sem tolerância após vencimento; retorno ao Grátis quando aplicável;
- [ ] período gratuito, caso exista;
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