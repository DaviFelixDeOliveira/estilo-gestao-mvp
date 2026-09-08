# Ideias Futuras — Estilo e Gestão

## Objetivo

Registrar funcionalidades e melhorias que podem ser avaliadas depois do MVP.

Itens deste documento **não fazem parte do escopo atual**.

Uma ideia somente deverá ser removida daqui e adicionada aos documentos oficiais quando sua implementação for realmente aprovada.

---

# 1. Agendamento

Criar sistema de agendamento online.

Possibilidades futuras:

- calendário;
- horários disponíveis;
- escolha de serviço;
- confirmação;
- cancelamento;
- bloqueio de horários.

Essa funcionalidade não faz parte do MVP.

---

# 2. Cadastro de clientes

Permitir registrar clientes da barbearia.

Possíveis dados:

- nome;
- telefone;
- histórico;
- observações permitidas.

A necessidade real deverá ser validada antes da implementação.

---

# 3. Histórico individual de clientes

Caso exista cadastro de clientes futuramente, permitir visualizar:

- serviços realizados;
- datas;
- valores;
- produtos adquiridos.

Essa funcionalidade depende diretamente do cadastro de clientes.

---

# 4. Lembrete de retorno

Permitir identificar clientes que não retornam há determinado período.

Exemplo:

```text
Último corte
↓
30 dias
↓
lembrete
```

A regra de tempo deverá ser configurável ou validada com profissionais.

---

# 5. WhatsApp automático

Possível integração futura para enviar mensagens automaticamente.

Exemplos:

- lembrete de retorno;
- confirmação de agendamento;
- avisos permitidos;
- campanhas autorizadas.

Antes de implementar será necessário analisar:

- API oficial;
- custos;
- templates;
- consentimento;
- regras da Meta;
- LGPD.

---

# 6. Fidelidade

Criar programa de fidelização.

Possibilidades:

- pontos;
- quantidade de serviços;
- recompensas;
- descontos.

A regra deverá ser simples para não transformar a operação em um sistema de CRM complexo.

---

# 7. Multi-barbeiro

Permitir que uma barbearia possua vários profissionais.

Isso exigirá alteração relevante na estrutura atual de:

```text
1 usuário
→ 1 barbearia
```

Poderá exigir:

- usuários adicionais;
- permissões;
- agenda individual;
- vendas por profissional;
- relatórios por barbeiro.

---

# 8. Permissões de equipe

Caso o sistema passe a possuir funcionários, poderão existir perfis como:

- proprietário;
- barbeiro;
- atendente;
- gerente.

Cada perfil poderá possuir permissões diferentes.

Não implementar RBAC complexo antes de existir necessidade real.

---

# 9. Comissão

Permitir calcular comissão de profissionais.

Exemplos:

- percentual por serviço;
- valor fixo;
- comissão por produto.

Essa funcionalidade depende de multi-barbeiro.

---

# 10. Metas

Permitir criar metas de:

- faturamento;
- vendas;
- serviços;
- produtos.

O Dashboard poderia acompanhar o progresso.

As metas deverão ser definidas pelo próprio estabelecimento.

Não utilizar percentuais ou objetivos financeiros arbitrários definidos pelo sistema.

---

# 11. Relatórios e indicadores financeiros avançados

O MVP deverá manter os indicadores financeiros simples.

Futuramente poderão ser avaliadas análises mais detalhadas.

Possibilidades:

- comparação entre períodos;
- produtos mais vendidos;
- serviços mais vendidos;
- evolução do faturamento;
- tendências;
- receita por categoria;
- custos diretos por categoria;
- margem de contribuição;
- participação percentual de cada tipo de receita;
- comparação entre serviços e produtos;
- análise de desempenho de bebidas;
- análise de desempenho de produtos de revenda.

Exemplo de separação:

```text
Serviços
→ receita
→ custos diretos estimados
→ resultado estimado

Bebidas
→ receita
→ custo dos itens vendidos
→ resultado estimado

Produtos
→ receita
→ custo dos itens vendidos
→ resultado estimado
```

A nomenclatura deverá continuar alinhada às regras financeiras oficiais do sistema.

Não apresentar automaticamente cálculos simplificados como:

```text
Lucro Líquido Contábil
```

sem que exista estrutura contábil suficiente para sustentar essa informação.

---

# 12. Gestão de caixa avançada

O MVP registra vendas, despesas e movimentações necessárias à gestão básica.

Futuramente poderá existir uma gestão de caixa mais detalhada.

Possibilidades:

- abertura de caixa;
- fechamento de caixa;
- saldo inicial;
- saldo final;
- conferência por forma de pagamento;
- aporte do proprietário;
- retirada do proprietário;
- sangria;
- suprimento;
- divergência de caixa;
- histórico de fechamento.

Isso poderá ajudar a separar melhor:

```text
dinheiro da barbearia
```

de:

```text
dinheiro pessoal do proprietário
```

A funcionalidade deverá evitar tratar retirada pessoal como despesa operacional comum quando isso distorcer os relatórios.

As regras financeiras definitivas deverão ser definidas antes da implementação.

---

# 13. Ponto de equilíbrio

Futuramente poderá ser criado um indicador de ponto de equilíbrio.

O objetivo seria estimar quanto o negócio precisa gerar para cobrir determinados custos.

Conceito geral:

```text
Ponto de equilíbrio
=
Custos fixos
÷
Margem de contribuição
```

O cálculo poderá ser realizado:

- para o negócio como um todo;
- por categoria;
- em análises específicas de produtos.

Essa funcionalidade somente deverá ser implementada após definir corretamente:

- custos fixos;
- custos variáveis;
- margem de contribuição;
- tratamento dos serviços;
- período de análise.

Não utilizar uma fórmula simplificada de produto isolado como se representasse automaticamente o ponto de equilíbrio completo da barbearia.

---

# 14. Analytics da Vitrine

Possível acompanhamento de:

- visitas;
- cliques no WhatsApp;
- cliques no Instagram;
- serviços mais visualizados;
- produtos mais visualizados.

Antes de implementar deverão ser avaliados:

- privacidade;
- cookies;
- ferramentas utilizadas;
- necessidade de consentimento.

---

# 15. Integração com Perfil da Empresa no Google

Possível integração automática futura com o Perfil da Empresa no Google.

Exemplos:

- atualizar informações;
- sincronizar horários;
- divulgar link da Vitrine.

No MVP, o barbeiro poderá apenas inserir manualmente o link da Vitrine no perfil do Google.

---

# 16. Publicação em redes sociais

Possibilidade futura de auxiliar na divulgação de trabalhos publicados no Portfólio.

Exemplo:

```text
Adicionar ao Portfólio
↓
Compartilhar no Instagram
```

Publicação automática dependerá das APIs e permissões das plataformas.

---

# 17. QR Code da Vitrine

Gerar QR Code para o endereço público da Vitrine.

Poderá ser utilizado em:

- cartão;
- balcão;
- espelho;
- material impresso;
- redes sociais.

É uma funcionalidade simples que pode ser avaliada após o MVP.

---

# 18. Personalização avançada da Vitrine

Permitir opções adicionais de identidade visual.

Exemplos:

- cor de destaque;
- escolha entre poucos modelos;
- organização de seções.

Evitar transformar o sistema em um construtor completo de sites.

---

# 19. Domínio personalizado

Possibilidade de plano futuro permitir endereço próprio.

Exemplo:

```text
www.barbeariadojoao.com.br
```

em vez de:

```text
estiloegestao.com/b/barbearia-do-joao
```

Será necessário avaliar configuração técnica e modelo comercial.

---

# 20. Pagamentos online

Possível integração futura para:

- assinatura do SaaS;
- pagamento de agendamentos;
- sinal;
- venda online.

Essa funcionalidade exigirá gateway de pagamento e revisão jurídica.

---

# 21. Cobrança automática do SaaS

O MVP poderá iniciar com controle comercial manual.

No futuro poderá existir:

- assinatura automática;
- cartão;
- Pix;
- emissão de cobrança;
- alteração de plano;
- cancelamento;
- inadimplência.

---

# 22. Gestão de planos

Criar sistema interno para administrar:

- plano contratado;
- recursos liberados;
- limites;
- vencimento;
- status da assinatura.

A implementação deverá ocorrer apenas quando a quantidade de clientes justificar.

---

# 23. Período gratuito

Possível período de teste antes da contratação.

Exemplos conceituais:

- dias gratuitos;
- acesso limitado;
- demonstração.

Prazo e regras comerciais ainda não foram definidos.

---

# 24. Cupons e descontos

Possibilidade de criar:

- cupom promocional;
- desconto de lançamento;
- parceria;
- indicação.

Não necessário para validação inicial.

---

# 25. Indicação

Possível programa de indicação entre barbeiros.

Exemplo:

```text
Barbeiro A indica Barbeiro B
↓
benefício comercial
```

As regras dependerão do modelo de negócio.

---

# 26. Estoque avançado

O MVP continuará utilizando controle simples de estoque.

Futuramente poderão ser adicionados recursos como:

- fornecedores;
- histórico de compras;
- custo médio;
- lote;
- validade;
- inventário;
- reconciliação física;
- relatórios avançados;
- rotatividade de produtos;
- alertas de estoque excessivo.

---

## Reconciliação física de estoque

Permitir que o barbeiro conte fisicamente os produtos e compare com o saldo registrado no sistema.

Exemplo:

```text
Estoque registrado: 15
Estoque físico: 12

Diferença: -3
```

O sistema poderia permitir registrar a diferença através de movimentação de ajuste.

Possíveis motivos:

- perda;
- quebra;
- furto;
- erro de contagem;
- correção manual.

A relação entre perda de estoque e indicadores financeiros deverá ser definida antes da implementação.

---

## Produto sem rotatividade

Possível alerta quando determinado produto não possuir vendas durante um período relevante.

Exemplo:

```text
Produto sem venda há 30 dias
```

O sistema poderia apenas informar:

```text
Baixa rotatividade
```

em vez de recomendar automaticamente redução de preço.

O período deverá ser configurável ou validado antes da implementação.

---

## Estoque excessivo

Futuramente o sistema poderá identificar itens com quantidade muito acima do padrão de saída.

A análise poderá considerar:

- estoque atual;
- histórico de vendas;
- média de saída;
- período observado.

Evitar regras arbitrárias como:

```text
estoque > mínimo × 2
```

sem considerar o comportamento real do produto.

---

# 27. Cadastro de fornecedores

Permitir associar produtos a fornecedores.

Possibilidades futuras:

- nome;
- contato;
- produtos fornecidos;
- histórico de compras;
- último custo;
- prazo de entrega.

Pode ser útil quando houver necessidade maior de gestão de compras.

---

# 28. Custo médio de estoque

O MVP utiliza o custo atual congelado no momento da venda.

No futuro poderá ser avaliado:

- custo médio ponderado;
- FIFO;
- outro método apropriado.

A necessidade deverá ser validada antes de aumentar a complexidade financeira.

---

# 29. Controle detalhado de insumos por serviço

No MVP, um serviço pode possuir apenas um valor opcional de custo direto estimado.

Exemplo:

```text
Corte
Preço: R$ 40,00
Custo direto estimado: R$ 3,00
```

Futuramente poderá existir um controle mais detalhado.

Exemplo:

```text
Corte

Lâmina
→ R$ 0,50

Pomada
→ R$ 1,50

Produto pós-corte
→ R$ 1,00
```

O sistema poderia calcular automaticamente:

```text
Custo estimado do serviço
=
soma dos insumos
```

Uma evolução ainda mais avançada poderia permitir associar consumo estimado de estoque ao serviço.

Exemplo:

```text
1 corte
→ consome determinada quantidade de lâmina
→ consome determinada quantidade de produto
```

Essa funcionalidade aumentaria consideravelmente a complexidade do estoque e somente deverá ser criada se houver necessidade real.

---

# 30. Controle de validade

Possível para produtos como:

- bebidas;
- cosméticos.

Poderia permitir:

- data de validade;
- alerta de validade próxima;
- produtos vencidos;
- organização por lote.

---

# 31. Importação de dados

Possibilidades:

- importar produtos por CSV;
- importar serviços;
- importar estoque.

Útil principalmente quando o sistema possuir clientes maiores.

---

# 32. Exportação de dados

Possibilidades futuras:

- CSV;
- Excel;
- relatórios completos;
- backup do usuário.

PDF continuará sendo a primeira opção planejada para relatórios.

---

# 33. Aplicativo mobile

O MVP será web responsivo.

No futuro poderá ser avaliado:

- PWA;
- aplicativo Android;
- aplicativo iOS.

Um aplicativo nativo só deverá ser criado se houver benefício real que a aplicação web não consiga oferecer adequadamente.

---

# 34. PWA

Antes de um aplicativo nativo, poderá ser avaliada uma Progressive Web App.

Possibilidades:

- instalação na tela inicial;
- experiência semelhante a aplicativo;
- cache de recursos.

---

# 35. Operação offline

Possibilidade futura de permitir determinadas operações sem internet.

Essa funcionalidade é complexa principalmente para:

- vendas;
- estoque;
- conflitos;
- sincronização.

Não faz parte do MVP.

---

# 36. Sincronização offline de vendas

Caso operação offline seja aprovada futuramente, será necessário resolver:

- IDs temporários;
- conflitos;
- estoque concorrente;
- duplicações;
- sincronização.

Não implementar parcialmente.

---

# 37. Notificações

Possíveis notificações futuras:

- estoque baixo;
- produto sem rotatividade;
- validade próxima;
- relatório diário;
- lembretes;
- informações da assinatura.

Podem utilizar:

- e-mail;
- push;
- WhatsApp;

dependendo da funcionalidade.

---

# 38. Resumo periódico

Enviar ao responsável um resumo como:

```text
Hoje

Faturamento: R$ X
Despesas: R$ Y
Resultado estimado: R$ Z
```

Pode ser:

- diário;
- semanal;
- mensal.

Canal e frequência dependerão de validação.

---

# 39. Assistente IA interno

Além do Assistente público, poderá ser avaliado um recurso de IA para ajudar o barbeiro a interpretar dados do próprio negócio.

Exemplos:

- resumo financeiro;
- produtos com baixa saída;
- comparação de períodos;
- identificação de tendências.

Essa funcionalidade exigirá controles diferentes do Assistente público porque lidará com dados privados.

---

# 40. Assistente IA com ações

No futuro, a IA poderá executar determinadas ações mediante confirmação.

Exemplo:

```text
"Cadastre uma despesa de R$ 80 de energia."
```

Antes de executar:

1. interpretar;
2. mostrar os dados;
3. pedir confirmação;
4. registrar somente após autorização.

Essa funcionalidade não deverá ser criada enquanto o núcleo do sistema não estiver estável.

---

# 41. Histórico da IA

Se houver necessidade comercial futura, poderá existir histórico de conversas.

Antes disso será necessário definir:

- finalidade;
- retenção;
- exclusão;
- privacidade;
- custos.

---

# 42. Painel administrativo avançado

O MVP prevê somente operações administrativas mínimas.

No futuro poderá existir painel com:

- clientes SaaS;
- planos;
- assinaturas;
- métricas;
- consumo da IA;
- suporte;
- status de serviços.

---

# 43. Métricas do SaaS

Possíveis indicadores futuros:

- usuários ativos;
- barbearias cadastradas;
- conversão;
- churn;
- receita recorrente;
- uso do Assistente IA.

Esses dados são da operação do SaaS, não da gestão financeira de cada barbearia.

---

# 44. Sistema de suporte

Possível área interna para:

- chamados;
- acompanhamento;
- histórico;
- status.

No início, suporte poderá utilizar canal externo simples.

---

# 45. Backup pelo usuário

Possibilidade de permitir que o barbeiro solicite ou gere uma exportação dos próprios dados.

Formato e conteúdo dependerão do escopo futuro.

---

# 46. Autenticação com Google

O MVP utiliza e-mail e senha.

Login com Google poderá ser avaliado futuramente caso:

- facilite significativamente o cadastro;
- exista demanda dos usuários.

Não adicionar apenas porque o Supabase oferece a opção.

---

# 47. Autenticação em dois fatores

Possível melhoria futura para contas administrativas.

Sua necessidade poderá crescer conforme:

- quantidade de clientes;
- valor dos dados;
- painel administrativo.

---

# 48. Temas

Dark Mode ou outros temas poderão ser avaliados futuramente.

Não fazem parte do MVP atual.

---

# 49. Novos nichos

O sistema foi inicialmente pensado para barbearias.

No futuro poderá ser avaliada adaptação para negócios semelhantes.

Exemplos possíveis:

- salão masculino;
- estúdio de estética;
- profissional autônomo.

Isso somente deverá acontecer após validar bem o nicho inicial.

---

# 50. Aplicação das ideias

Toda ideia futura deverá passar por:

1. identificação do problema;
2. validação com usuários;
3. análise de custo;
4. análise técnica;
5. análise jurídica quando aplicável;
6. decisão de prioridade;
7. atualização da documentação;
8. implementação.

Não desenvolver uma funcionalidade apenas porque parece interessante.

---

# 51. Regra de entrada no escopo

Enquanto uma funcionalidade estiver neste documento:

```text
NÃO FAZ PARTE DO MVP
```

Ela não deverá gerar antecipadamente:

- tabela no banco;
- campo;
- endpoint;
- tela;
- botão desativado;
- configuração escondida;
- dependência;
- regra de negócio.

Quando uma ideia for aprovada:

1. remover ou marcar sua saída deste documento;
2. atualizar o `DOCUMENTO_VISAO.md` se alterar o escopo geral;
3. atualizar `FLUXO_BARBEIRO_E_CLIENTE.md`;
4. atualizar banco se necessário;
5. atualizar segurança e privacidade quando aplicável;
6. atualizar o Plano de Testes;
7. somente então implementar.