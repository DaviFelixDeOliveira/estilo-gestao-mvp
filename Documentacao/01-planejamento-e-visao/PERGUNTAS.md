# Perguntas para Validação com o Barbeiro

## Objetivo

Registrar somente dúvidas de produto que precisam ser respondidas pelo barbeiro antes de determinadas decisões do sistema serem consideradas fechadas.

Perguntas técnicas que não dependem do barbeiro não pertencem a este documento.

Quando uma pergunta for respondida, a decisão deverá ser registrada no documento responsável pelo assunto e poderá ser removida desta lista.

---

# 1. Produtos e categorias

## P01 — Categorias sugeridas

Quais categorias você considera úteis para aparecer prontas ao cadastrar um produto?

Sugestões atuais:

- Bebida;
- Pomada;
- Shampoo;
- Cera;
- Óleo/Balm para barba;
- Acessórios;
- Outros.

Além dessas, existe alguma categoria que você utiliza com frequência?

---

## P02 — Produto sem estoque na Vitrine

Quando um produto acabar, como você prefere que ele apareça na Vitrine?

**Opção A:** continuar aparecendo com indicação **Indisponível**.

**Opção B:** desaparecer da Vitrine até ocorrer uma reposição.

---

# 2. Serviços

## P03 — Custo estimado de insumos

Você gostaria de informar, opcionalmente, quanto aproximadamente gasta de material em cada serviço?

Exemplo:

- Corte: R$ 40,00;
- materiais utilizados: aproximadamente R$ 2,00;
- resultado estimado antes das outras despesas: R$ 38,00.

Esse campo seria opcional e serviria apenas para deixar os relatórios mais precisos.

**Resposta esperada:** Sim ou Não.

---

# 3. Despesas

## P04 — Categorias de despesas

Quais despesas você gostaria de encontrar prontas no sistema?

Sugestões atuais:

- Aluguel;
- Água;
- Energia;
- Internet;
- Equipamentos;
- Manutenção;
- Compra de estoque;
- Outros.

Existe alguma despesa frequente da barbearia que deveria aparecer nessa lista?

---

# 4. Estoque e reposição

## P05 — Registrar compra de estoque no Financeiro — RESOLVIDA

**Decisão aprovada:** a reposição altera o estoque e registra a movimentação, mas **não cria despesa ou saída financeira automaticamente**.

Quando houver gasto que deva aparecer no Financeiro, o barbeiro registra uma despesa separadamente. Uma referência opcional entre a despesa manual e a reposição pode ser usada para rastreabilidade, sem acoplar as duas operações.

---

# 5. Vitrine Digital

## P06 — Informações que devem aparecer

Quais destas informações você deseja mostrar na sua Vitrine?

- nome da barbearia;
- seu nome profissional;
- logo;
- foto de capa;
- descrição sobre o trabalho;
- serviços;
- preços dos serviços;
- produtos;
- preços dos produtos;
- Portfólio;
- endereço;
- horários;
- WhatsApp;
- Instagram;
- informação de atendimento a domicílio.

Existe mais alguma informação que considera importante?

---

## P07 — Atendimento a domicílio

Caso você atenda clientes a domicílio, como prefere informar isso?

**Opção A:** mostrar apenas a frase **Atendimento a domicílio disponível**.

**Opção B:** informar também bairros ou regiões atendidas.

**Opção C:** não mostrar essa informação na Vitrine.

---

## P08 — Endereço público

Você deseja que o endereço completo da barbearia fique visível na Vitrine?

Os dados possíveis são:

- rua;
- número;
- bairro;
- cidade;
- estado;
- complemento.

**Resposta esperada:** Sim ou Não.

---

# 6. PDV e pagamentos

## P09 — Formas de pagamento

Quais formas de pagamento você utiliza atualmente?

Opções previstas:

- Pix;
- Dinheiro;
- Débito;
- Crédito;
- Outro.

Existe alguma forma que deveria ser adicionada?

---

## P10 — Forma de pagamento obrigatória

Ao finalizar uma venda, você prefere que informar a forma de pagamento seja:

**Opção A:** obrigatório.

**Opção B:** opcional, permitindo registrar rapidamente sem selecionar uma forma.

---

# 7. Relatórios

## P11 — Informações principais

Quais números você considera mais importantes para visualizar rapidamente no Dashboard?

Atualmente estão previstos:

- faturamento;
- despesas;
- entradas;
- saídas;
- resultado estimado;
- total recebido com serviços;
- total recebido com bebidas;
- total recebido com outros produtos;
- produtos com estoque baixo.

Existe algum indicador que você utiliza no dia a dia e que não está nessa lista?

---

## P12 — Períodos

Quais filtros você realmente utiliza para analisar o negócio?

Opções previstas:

- Hoje;
- Semana;
- Mês;
- Ano;
- Período personalizado.

---

## P13 — Exportar relatório

Você gostaria de baixar um relatório para guardar ou enviar?

**Opção A:** PDF.

**Opção B:** imagem.

**Opção C:** PDF e imagem.

**Opção D:** não preciso dessa função no MVP.

---

# 8. Portfólio

## P14 — Informação nas fotos

Ao publicar uma foto de um trabalho, você gostaria de adicionar:

- somente a foto;
- foto e descrição;
- foto e serviço relacionado;
- foto, descrição e serviço relacionado.

---

# 9. Validação do protótipo

## P15 — Uso pelo celular

Quando o protótipo estiver pronto, validar com o barbeiro:

- se consegue registrar uma venda rapidamente;
- se os botões principais estão fáceis de encontrar;
- se os valores importantes do Dashboard são claros;
- se cadastrar produto é simples;
- se realizar reposição é simples;
- se editar a Vitrine é compreensível;
- se a Vitrine pública apresenta as informações que ele considera importantes.

---

# Perguntas que não pertencem a este arquivo

Não perguntar ao barbeiro decisões exclusivamente técnicas, como:

- estrutura de tabelas;
- RLS;
- índices;
- bibliotecas;
- organização do código;
- timeout da API;
- formato interno dos IDs;
- estratégia de transação do banco;
- configuração de deploy.

Essas decisões pertencem aos documentos técnicos e devem ser tomadas com base em requisitos, segurança e arquitetura.