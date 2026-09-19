**# Manual do Usuário — Estilo e Gestão**

**## Objetivo**

Este manual ensina como utilizar o **\*\*Estilo e Gestão\*\*** no dia a dia.

O conteúdo é voltado ao barbeiro e explica somente como utilizar as telas e funcionalidades do sistema.

Regras técnicas, validações, mensagens de erro, banco de dados e funcionamento interno não fazem parte deste documento.

As imagens utilizadas neste manual deverão ser armazenadas em:

*\`./assets/\`*

\---

**# 1. Criar uma conta**

![Criar Conta]\(./assets/01-criar-conta.png)

Para começar a utilizar o Estilo e Gestão:

1\. Acesse a página inicial do sistema.

2\. Clique em **\*\*Criar conta\*\***.

3\. Informe seu e-mail.

4\. Informe sua senha.

5\. Digite novamente a senha no campo de confirmação.

6\. Preencha seu nome caso queira utilizá-lo nas informações públicas da barbearia.

7\. Clique em **\*\*Criar conta\*\***.

8\. Continue para a configuração inicial da barbearia.

\---

**# 2. Configuração inicial**

A configuração inicial será apresentada no primeiro acesso.

Ela é dividida em **6 etapas** para deixar o sistema pronto para uso sem exigir a configuração de todos os recursos de uma vez.

Se você sair antes de terminar, as etapas já salvas serão mantidas e o sistema continuará da etapa pendente no próximo acesso.

---

**## 2.1 Dados da barbearia**

![Dados da Barbearia](./assets/02-onboarding-barbearia.png)

Informe:

- nome da barbearia;
- nome profissional, caso queira informar;
- WhatsApp comercial;
- Instagram, caso possua;
- logo da barbearia, caso queira adicionar;
- se realiza atendimento a domicílio.

A logo é opcional e poderá ser adicionada ou alterada posteriormente.

Clique em **Continuar**.

---

**## 2.2 Endereço**

![Endereço](./assets/03-onboarding-endereco.png)

Informe o CEP.

Quando o CEP for encontrado, o sistema poderá preencher automaticamente:

- rua;
- bairro;
- cidade;
- estado.

O sistema também perguntará:

**O endereço tem número?**

Se selecionar **Sim**:

1. informe o número;
2. preencha o complemento, caso exista.

Se selecionar **Não**:

- não será necessário informar número;
- o endereço poderá ser apresentado como **Sem número** quando necessário.

Confira os dados e clique em **Continuar**.

---

**## 2.3 Horários de funcionamento**

![Horários](./assets/04-onboarding-horarios.png)

Configure cada dia da semana.

Para cada dia:

1. marque se a barbearia estará **Aberta** ou **Fechada**;
2. se estiver aberta, informe o primeiro horário de abertura e fechamento;
3. adicione um segundo intervalo caso trabalhe em dois períodos no mesmo dia.

Exemplo:

```text
08:00 às 12:00
14:00 às 18:00
```

Repita para:

- segunda-feira;
- terça-feira;
- quarta-feira;
- quinta-feira;
- sexta-feira;
- sábado;
- domingo.

Esses horários representam o funcionamento da barbearia. Eles não criam agenda ou horários de reserva.

Depois clique em **Continuar**.

---

**## 2.4 Serviços**

![Serviços no Onboarding](./assets/05-onboarding-servicos.png)

Cadastre os principais serviços oferecidos.

Exemplos:

- Corte;
- Barba;
- Sobrancelha;
- Corte + Barba.

Para adicionar um serviço:

1. clique em **Adicionar serviço**;
2. informe o nome;
3. informe o preço;
4. adicione uma descrição, caso queira;
5. informe o custo estimado de materiais, caso utilize essa função;
6. escolha se o serviço será exibido na Vitrine;
7. salve.

Depois clique em **Continuar**.

---

**## 2.5 Produtos e formas de pagamento**

![Produtos e Pagamentos no Onboarding](./assets/06-onboarding-produtos.png)

O sistema perguntará se a barbearia vende produtos ou bebidas.

**### Se não vende produtos ou bebidas**

Selecione **Não** e continue para as formas de pagamento.

**### Se vende produtos ou bebidas**

Selecione **Sim** e informe quais tipos costuma vender.

Entre as categorias sugeridas poderão aparecer:

- Bebida;
- Pomada;
- Shampoo;
- Cera;
- Óleo/Balm para barba;
- Acessórios;
- Outros.

As categorias sugeridas poderão utilizar uma imagem padrão do próprio Estilo e Gestão.

Exemplos:

- **Bebida** → imagem genérica relacionada a bebidas;
- **Pomada** → imagem genérica de pomada;
- **Outros** → imagem neutra, sem representar um item específico.

Também será possível criar uma categoria própria.

Categorias criadas manualmente por você começam sem imagem padrão.

Nesta etapa não será necessário cadastrar todos os produtos, preços, imagens ou quantidades em estoque. O cadastro detalhado poderá ser feito depois na área de **Produtos**.

**### Formas de pagamento aceitas**

Selecione as formas que a barbearia aceita, como:

- Pix;
- Dinheiro;
- Débito;
- Crédito;
- Outro.

Essas opções poderão ser utilizadas no PDV e apresentadas na Vitrine Digital.

A forma aceita pela barbearia é diferente da forma utilizada em uma venda específica.

Depois clique em **Continuar**.

---

**## 2.6 Aparência e conclusão**

![Aparência no Onboarding](./assets/07-onboarding-aparencia.png)

Escolha como deseja utilizar a interface do Estilo e Gestão:

- **Claro**;
- **Escuro**;
- **Padrão do Sistema**.

Ao selecionar **Padrão do Sistema**, o Estilo e Gestão acompanha a preferência de aparência do dispositivo ou navegador.

A escolha ficará salva na sua conta para os próximos acessos.

Antes de finalizar, o sistema poderá apresentar um resumo das principais configurações informadas durante o onboarding.

Confira os dados e clique em **Concluir configuração**.

Depois da conclusão, o sistema abrirá o **Dashboard**.

---

**# 3. Entrar no sistema**

![Login]\(./assets/08-login.png)

Para acessar uma conta já criada:

1\. Abra o Estilo e Gestão.

2\. Informe seu e-mail.

3\. Informe sua senha.

4\. Clique em **\*\*Entrar\*\***.

Após o acesso, o sistema abrirá o Dashboard quando a configuração inicial já estiver concluída. Se ainda houver uma etapa pendente do onboarding, o sistema continuará dessa etapa.

\---

**# 4. Recuperar a senha**

![Esqueci Minha Senha]\(./assets/09-recuperar-senha.png)

Caso esqueça sua senha:

1\. Na tela de Login, clique em **\*\*Esqueci minha senha\*\***.

2\. Informe seu e-mail.

3\. Clique em **\*\*Enviar código\*\***.

4\. Consulte o e-mail recebido.

5\. Digite o código de 6 números no sistema.

6\. Continue para a redefinição da senha.

7\. Informe a nova senha.

8\. Confirme a nova senha.

9\. Clique em **Salvar nova senha**.

10\. Após a confirmação de sucesso, clique em **Ir para o login**.

Depois, entre normalmente utilizando a nova senha.

\---

**# 4.1 Navegação principal**

Depois de entrar no sistema e concluir a configuração inicial, a área do barbeiro possui quatro módulos principais:

```text
Dashboard
PDV
Operação
Configurações
```

## No computador

A navegação aparece em uma sidebar recolhível.

Os módulos principais são:

- **Dashboard**;
- **PDV**;
- **Operação**;
- **Configurações**.

A área **Sua conta** é separada de Configurações e fica acessível pela identidade do usuário no rodapé da sidebar.

## No celular

A navegação principal aparece na barra inferior fixa:

- **Dashboard** para acompanhar o resumo da barbearia;
- **PDV** para registrar e consultar vendas;
- **Operação** para Serviços, Produtos e Estoque;
- **Configurações** para Financeiro, Relatórios, Vitrine Digital e dados da barbearia.

O acesso à conta aparece no cabeçalho ou em local equivalente e não ocupa um quinto item da barra inferior.

---

## 4.2 Operação

Dentro de **Operação** estão:

```text
Serviços
Produtos
Estoque
```

As categorias de produtos são administradas dentro da área de **Produtos**, por meio do acesso **Categorias**. Elas não aparecem como item independente da sidebar nem da barra inferior.

---

## 4.3 Configurações

A área **Configurações** reúne configurações do negócio e da barbearia.

**Negócio**

- Financeiro;
- Relatórios;
- Vitrine Digital.

**Barbearia**

- Dados da barbearia;
- Endereço;
- Horários;
- Formas de pagamento.

O Portfólio fica dentro da **Vitrine Digital**.

As opções pessoais da conta não ficam dentro de Configurações.

---

## 4.4 Sua conta

A área **Sua conta** reúne:

- Perfil;
- Aparência;
- Alterar senha;
- Minha assinatura;
- Zona de perigo.

A exclusão da conta fica em:

```text
Sua conta
→ Zona de perigo
```

Ela não aparece diretamente no menu rápido da conta.

---

## 4.5 Menu rápido da conta

No computador, o acesso à conta aparece no rodapé da sidebar. No celular, aparece no cabeçalho ou em local equivalente.

O menu rápido pode oferecer atalhos como:

- Minha conta;
- Aparência;
- Alterar senha;
- Sair.

**Minha conta** leva à área completa **Sua conta**. O menu rápido é apenas um atalho e não duplica essas opções dentro de Configurações.

---

**# 5. Dashboard**

![Dashboard](./assets/10-dashboard.png)

O Dashboard apresenta um resumo rápido da barbearia sem substituir a área de Relatórios.

No primeiro acesso, enquanto ainda não houver movimentações, poderá aparecer uma orientação inicial com atalhos para começar a operar. Esse conteúdo deixa de ser necessário quando a barbearia já possui movimentações.

Os indicadores principais são:

- faturamento;
- entradas;
- saídas;
- resultado estimado;
- serviços realizados;
- bebidas vendidas;
- outros produtos vendidos;
- produtos com estoque baixo.

A área **Situação do estoque** poderá mostrar quais produtos exigem atenção, incluindo nome, quantidade atual e referência do estoque mínimo.

O Dashboard também pode apresentar a **Evolução no período**, utilizando dados reais do intervalo selecionado.

---

## 5.1 Alterar período

Utilize o seletor de período para visualizar informações de:

- hoje;
- semana;
- mês;
- ano;
- período personalizado.

No período personalizado, escolha uma data inicial e uma data final.

Se não houver dados no período selecionado, o sistema deverá informar isso sem fingir que a barbearia está em primeiro acesso.

---

**# 6. Serviços**

![Lista de Serviços]\(./assets/11-servicos.png)

A área **\*\*Serviços\*\*** apresenta os serviços cadastrados na barbearia.

Para acessá-la:

\`\`\`text

Operação
→ Serviços

\`\`\`

\---

**## 6.1 Cadastrar serviço**

![Novo Serviço]\(./assets/12-novo-servico.png)

1\. Abra **Operação → Serviços**.

2\. Clique em **\*\*Novo serviço\*\***.

3\. Informe o nome.

4\. Informe uma descrição caso queira.

5\. Informe o preço.

6\. Informe o custo estimado de materiais caso utilize essa função.

7\. Escolha se o serviço será exibido na Vitrine.

8\. Clique em **\*\*Salvar\*\***.

\---

**## 6.2 Editar serviço**

1\. Abra a lista de serviços.

2\. Selecione o serviço desejado.

3\. Clique em **\*\*Editar\*\***.

4\. Altere as informações.

5\. Clique em **\*\*Salvar\*\***.

\---

**## 6.3 Inativar serviço**

Caso não ofereça mais um serviço:

1\. Abra o serviço.

2\. Selecione **\*\*Inativar\*\***.

3\. Confirme a ação.

O serviço deixa de ser utilizado em novas vendas, mas o histórico antigo permanece disponível.

\---

**## 6.4 Exibir ou ocultar da Vitrine**

Um serviço pode continuar cadastrado no sistema sem aparecer publicamente.

Utilize a opção **\*\*Exibir na Vitrine\*\*** para controlar essa informação.

\---

**# 7. Categorias de produtos**

As categorias são administradas dentro da área de Produtos:

\`\`\`text

Operação
→ Produtos
→ Categorias

\`\`\`

![Categorias]\(./assets/13-categorias.png)

As categorias servem para organizar os produtos.

Exemplos:

\- Bebida;

\- Pomada;

\- Shampoo;

\- Cera;

\- Óleo/Balm para barba;

\- Acessórios;

\- Outros.

\---

**## 7.1 Utilizar uma categoria sugerida**

Durante o cadastro de um produto:

1\. Abra o campo **\*\*Categoria\*\***.

2\. Escolha uma das sugestões.

3\. Continue o cadastro normalmente.

As categorias sugeridas poderão possuir uma imagem padrão do próprio Estilo e Gestão.

Exemplo:

\`\`\`text

Categoria:
Pomada

Imagem padrão:
imagem genérica de pomada

\`\`\`

Essa imagem poderá ser utilizada automaticamente pelos produtos da categoria quando eles não possuírem uma foto própria.

\---

**## 7.2 Criar uma categoria**

Caso a categoria desejada não exista:

1\. Clique em **\*\*Criar categoria\*\***.

2\. Informe o nome.

3\. Clique em **\*\*Adicionar\*\***.

A nova categoria ficará disponível para os produtos da sua barbearia.

Categorias criadas manualmente começam sem imagem padrão.

Exemplo:

\`\`\`text

Categoria:
Perfumes

Imagem padrão:
nenhuma

\`\`\`

\---

**# 8. Produtos e bebidas**

Para acessar produtos e bebidas:

\`\`\`text

Operação
→ Produtos

\`\`\`

![Produtos]\(./assets/14-produtos.png)

A tela de Produtos apresenta os itens vendidos pela barbearia.

Cada produto pode:

\- utilizar uma imagem própria;

\- utilizar a imagem padrão da categoria;

\- ou permanecer sem imagem.

\---

**## 8.1 Cadastrar produto**

![Novo Produto]\(./assets/15-novo-produto.png)

1\. Clique em **\*\*Novo produto\*\***.

2\. Informe o nome.

3\. Escolha a categoria.

4\. Informe uma descrição caso queira.

5\. Informe a quantidade inicial.

6\. Informe o estoque mínimo caso queira receber o alerta visual.

7\. Informe o preço de custo.

8\. Informe o preço de venda.

9\. Adicione uma imagem personalizada caso queira.

10\. Escolha se o produto será exibido na Vitrine.

11\. Clique em **\*\*Salvar\*\***.

Se você não adicionar uma imagem e a categoria possuir uma imagem padrão, o produto poderá utilizar essa imagem automaticamente.

Exemplo:

\`\`\`text

Categoria:
Pomada

Produto:
Pomada Matte

Imagem personalizada:
nenhuma

Resultado:
→ imagem padrão de Pomada

\`\`\`

\---

**## 8.2 Adicionar uma imagem personalizada**

Você poderá adicionar uma foto própria do produto.

Exemplo:

\`\`\`text

Produto:
Coca-Cola 350 ml

Categoria:
Bebida

Imagem padrão:
imagem genérica de bebida

Imagem personalizada:
foto da Coca-Cola enviada por você

Resultado:
→ a foto personalizada será exibida

\`\`\`

A imagem personalizada possui prioridade sobre a imagem padrão da categoria.

Adicionar uma foto própria não apaga a imagem padrão da categoria.

\---

**## 8.3 Trocar a imagem do produto**

Se o produto já possuir uma imagem personalizada:

1\. Abra **\*\*Produtos\*\***.

2\. Selecione o produto.

3\. Clique em **\*\*Editar\*\***.

4\. Escolha **\*\*Trocar imagem\*\***.

5\. Selecione a nova imagem.

6\. Confira a prévia.

7\. Salve.

Depois da alteração, a nova imagem personalizada será utilizada.

\---

**## 8.4 Remover a imagem personalizada**

Se o produto possuir uma foto personalizada, você poderá removê-la.

Quando a categoria possuir uma imagem padrão, o sistema poderá perguntar o que deseja fazer:

\`\`\`text

Usar imagem padrão da categoria

ou

Ficar sem imagem

\`\`\`

**### Usar imagem padrão da categoria**

A foto personalizada será removida e o produto voltará a utilizar a imagem da categoria.

Exemplo:

\`\`\`text

Produto:
Pomada Matte

Foto personalizada:
removida

Categoria:
Pomada

Resultado:
→ imagem padrão de Pomada

\`\`\`

**### Ficar sem imagem**

A foto personalizada será removida e a imagem padrão da categoria não será utilizada.

O produto ficará sem imagem e a interface poderá mostrar um espaço ou ícone neutro.

Se a categoria não possuir uma imagem padrão, remover a foto personalizada fará o produto ficar sem imagem.

\---

**## 8.5 Trocar a categoria do produto**

Se o produto não possuir uma foto personalizada e estiver utilizando a imagem padrão da categoria, trocar a categoria também poderá trocar automaticamente a imagem exibida.

Exemplo:

\`\`\`text

Antes:
Categoria = Pomada
→ imagem padrão de Pomada

Depois:
Categoria = Shampoo
→ imagem padrão de Shampoo

\`\`\`

Se o produto possuir uma foto personalizada, trocar a categoria não substitui essa foto.

\---

**## 8.6 Editar produto**

1\. Abra **\*\*Produtos\*\***.

2\. Selecione o produto.

3\. Clique em **\*\*Editar\*\***.

4\. Altere as informações desejadas.

5\. Salve.

A quantidade em estoque deve ser alterada pelas funções próprias de estoque.

\---

**## 8.7 Inativar produto**

1\. Abra o produto.

2\. Selecione **\*\*Inativar\*\***.

3\. Confirme.

O produto deixa de aparecer para novas vendas.

\---

**# 9. Estoque**

Para acessar o Estoque:

```text
Operação
→ Estoque
```

![Estoque](./assets/16-estoque.png)

A área de Estoque é usada para conferir quantidades e registrar alterações no estoque sem editar diretamente o número armazenado no produto.

Na tela principal você poderá:

- buscar um produto;
- filtrar por situação, tipo ou categoria;
- visualizar estoque atual e mínimo;
- identificar produtos regulares, que precisam de reposição ou que estão sem estoque;
- clicar em um produto para abrir seus detalhes;
- utilizar **Atualizar** para registrar uma alteração;
- abrir o histórico de movimentações.

---

## 9.1 Estoque mínimo

O estoque mínimo é a referência usada para avisar quando um produto está acabando.

Exemplo:

```text
Estoque atual: 2 un.
Estoque mínimo: 5 un.
Situação: Precisa repor
```

O estoque mínimo é configurado no cadastro do produto. O valor do estoque atual é alterado por movimentações de estoque.

---

## 9.2 Adicionar estoque

Use **Adicionar estoque** quando novas unidades realmente entrarem na barbearia.

1. Abra **Operação → Estoque**.
2. Localize o produto.
3. Clique em **Repor** ou **Atualizar**.
4. Escolha **Adicionar estoque**.
5. Informe a quantidade adicionada.
6. Se desejar, informe o custo unitário apenas como referência da reposição.
7. Confira o estoque atual e o novo estoque calculado.
8. Clique em **Registrar movimentação**.

A reposição altera o estoque e o histórico de movimentações.

**Ela não cria uma despesa financeira automaticamente.** Caso a compra precise aparecer no Financeiro, a despesa é registrada separadamente na área Financeiro.

---

## 9.3 Corrigir contagem

Use **Corrigir contagem** quando a quantidade física não bater com a quantidade apresentada pelo sistema.

1. Escolha o produto.
2. Clique em **Atualizar**.
3. Escolha **Corrigir contagem**.
4. Informe se a correção é de **Entrada (+)** ou **Saída (-)**.
5. Informe a quantidade da diferença.
6. Adicione uma observação caso ajude a explicar o ajuste.
7. Confira o resumo do impacto.
8. Clique em **Registrar movimentação**.

Exemplo:

```text
Sistema: 12 un.
Contagem física: 10 un.
Correção: Saída (-2)
Novo estoque: 10 un.
```

---

## 9.4 Registrar perda

Use **Registrar perda** quando uma unidade deixa de estar disponível para venda por dano, descarte, quebra ou situação semelhante.

1. Escolha o produto.
2. Clique em **Atualizar**.
3. Escolha **Registrar perda**.
4. Informe a quantidade perdida.
5. Adicione uma observação caso queira.
6. Confira o novo estoque.
7. Clique em **Registrar movimentação**.

A quantidade perdida não pode ser maior que o estoque disponível.

Registrar uma perda não cria uma nova despesa financeira automaticamente.

---

## 9.5 Histórico de estoque

![Histórico de Estoque](./assets/19-historico-estoque.png)

Utilize **Ver histórico** para consultar movimentações como:

- adição de estoque;
- vendas;
- correções de contagem;
- perdas;
- reversões de venda quando existirem no histórico.

Na interface, os nomes podem ser apresentados de forma simples para o usuário. Internamente, o sistema poderá manter os tipos técnicos correspondentes de movimentação.

---

**# 10. PDV / Comanda**

![PDV](./assets/20-pdv.png)

O PDV é utilizado para registrar rapidamente serviços, bebidas e outros produtos em uma venda.

Dentro do PDV ficam:

```text
Nova venda
Histórico de vendas
```

A tela **Nova venda** permite buscar itens, filtrar o catálogo e montar a comanda atual.

---

## 10.1 Adicionar serviço

1. Abra **PDV → Nova venda**.
2. Localize o serviço.
3. Clique ou toque em **Adicionar**.
4. O serviço será incluído na comanda.

Serviços permanecem com quantidade 1 na comanda.

---

## 10.2 Adicionar produto ou bebida

1. Abra **PDV → Nova venda**.
2. Localize o produto ou bebida.
3. Clique ou toque em **Adicionar**.
4. O item será incluído na comanda.

Itens sem estoque não poderão ser adicionados normalmente.

---

## 10.3 Alterar quantidade

Para produtos e bebidas adicionados:

- utilize **+** para aumentar;
- utilize **-** para reduzir;
- utilize a ação de remover para retirar o item.

A quantidade não poderá ultrapassar o estoque disponível.

O total da comanda é atualizado automaticamente.

---

## 10.4 Finalizar venda

![Finalizar Venda](./assets/21-finalizar-venda.png)

1. Confira os itens e o total da comanda.
2. Clique em **Finalizar venda**.
3. O sistema abrirá a etapa de finalização da própria venda, em modal, drawer ou bottom sheet conforme o dispositivo.
4. Selecione a forma de pagamento utilizada.
5. Confira o total.
6. Clique em **Confirmar venda**.
7. Aguarde a confirmação.

Somente depois da confirmação a venda é registrada oficialmente e o estoque dos produtos vendidos é atualizado.

---

**# 11. Histórico de vendas**

![Histórico de Vendas](./assets/22-historico-vendas.png)

A tela de Histórico permite consultar vendas registradas no PDV.

Para acessá-la:

```text
PDV
→ Histórico de vendas
```

Ela permite buscar e filtrar vendas por período, status e forma de pagamento.

Cada venda pode apresentar:

- identificador da venda;
- data e horário;
- itens principais;
- forma de pagamento;
- status;
- total.

Vendas concluídas e canceladas permanecem identificadas pelo respectivo status.

---

## 11.1 Visualizar uma venda

1. Abra **PDV → Histórico de vendas**.
2. Selecione uma venda.
3. Consulte os detalhes no painel, drawer ou bottom sheet correspondente.

Os detalhes podem mostrar:

- data e horário;
- status;
- forma de pagamento;
- itens;
- quantidades;
- preços registrados no momento da venda;
- total.

O Histórico atual é uma área de consulta. Não apresentar recursos fiscais, comprovante fiscal eletrônico, operador de caixa ou ações não definidas no MVP.

---

**# 12. Financeiro e despesas**

![Financeiro]\(./assets/24-financeiro.png)

A área Financeira permite acompanhar entradas, saídas e resultados da barbearia.

Para acessá-la:

\`\`\`text

Configurações
→ Negócio
→ Financeiro

\`\`\`

\---

**## 12.1 Registrar despesa**

![Nova Despesa]\(./assets/25-nova-despesa.png)

1\. Abra **Configurações → Financeiro**.

2\. Clique em **\*\*Nova despesa\*\***.

3\. Informe o nome.

4\. Escolha a categoria.

5\. Informe o valor.

6\. Informe a data.

7\. Adicione uma observação caso queira.

8\. Salve.

\---

**## 12.2 Consultar resultados**

Utilize os filtros disponíveis para consultar:

\- faturamento;

\- entradas;

\- saídas;

\- despesas;

\- resultado estimado;

\- resultados separados por origem.

\---

**# 13. Relatórios**

![Relatórios]\(./assets/26-relatorios.png)

Utilize a área de Relatórios para analisar períodos específicos.

Para acessá-la:

\`\`\`text

Configurações
→ Negócio
→ Relatórios

\`\`\`

Escolha entre:

\- dia;

\- semana;

\- mês;

\- ano;

\- período personalizado.

Quando a exportação estiver disponível, utilize o botão correspondente para gerar o relatório.

\---

**# 14. Informações da Barbearia**

![Configurações]\(./assets/27-configuracoes.png)

Para acessar os dados da barbearia:

\`\`\`text

Configurações
→ Barbearia

\`\`\`

Nesta área podem ser alteradas informações como:

\- nome da barbearia;

\- nome profissional;

\- descrição;

\- telefone;

\- WhatsApp;

\- Instagram;

\- atendimento a domicílio;

\- endereço;

\- horários;

\- formas de pagamento aceitas;

\- logo;

\- capa.

Depois de alterar os dados, clique em **\*\*Salvar\*\***.

\---

**# 15. Vitrine Digital**

![Vitrine Administrativa]\(./assets/28-vitrine-admin.png)

A Vitrine Digital é a página pública da barbearia.

Para administrá-la:

\`\`\`text

Configurações
→ Negócio
→ Vitrine Digital

\`\`\`

Ela pode apresentar:

\- informações do estabelecimento;

\- serviços;

\- produtos;

\- Portfólio;

\- horários;

\- localização;

\- formas de pagamento aceitas;

\- contatos;

\- Assistente IA.

\---

**## 15.1 Visualizar a Vitrine**

Na área administrativa:

1\. Abra **\*\*Vitrine\*\***.

2\. Clique em **\*\*Visualizar Vitrine\*\***.

3\. Confira como a página aparecerá para visitantes.

\---

**## 15.2 Copiar o link**

1\. Abra **\*\*Vitrine\*\***.

2\. Localize a URL pública.

3\. Clique em **\*\*Copiar link\*\***.

O link poderá ser utilizado no:

\- Instagram;

\- WhatsApp;

\- Perfil da Empresa no Google;

\- materiais de divulgação.

\---

**## 15.3 Publicar**

1\. Confira as informações públicas.

2\. Visualize a prévia.

3\. Clique em **\*\*Publicar\*\***.

A página ficará disponível pelo endereço público.

\---

**## 15.4 Despublicar**

1\. Abra a configuração da Vitrine.

2\. Clique em **\*\*Despublicar\*\***.

3\. Confirme.

As informações continuarão cadastradas, mas a página deixará de ficar disponível ao público.

\---

**# 16. Portfólio**

O Portfólio faz parte da Vitrine Digital.

Para acessá-lo:

\`\`\`text

Configurações
→ Negócio
→ Vitrine Digital
→ Portfólio

\`\`\`

![Portfólio Administrativo]\(./assets/29-portfolio.png)

O Portfólio é a área utilizada para divulgar os trabalhos realizados.

\---

**## 16.1 Adicionar trabalho**

![Adicionar ao Portfólio]\(./assets/30-adicionar-portfolio.png)

1\. Abra **\*\*Portfólio\*\***.

2\. Clique em **\*\*Adicionar trabalho\*\***.

3\. Escolha uma imagem.

4\. Adicione uma descrição caso queira.

5\. Relacione um serviço caso queira.

6\. Escolha se deseja publicar.

7\. Salve.

\---

**## 16.2 Ocultar trabalho**

1\. Abra o item.

2\. Desative a opção de publicação.

3\. Salve.

A imagem permanecerá no painel, mas não será exibida publicamente.

\---

**## 16.3 Publicar novamente**

1\. Abra um item oculto.

2\. Ative a publicação.

3\. Salve.

\---

**## 16.4 Excluir trabalho**

1\. Abra o item.

2\. Clique em **\*\*Excluir\*\***.

3\. Confirme.

\---

**# 17. Assistente IA**

![Assistente IA]\(./assets/31-assistente-ia.png)

O Assistente IA é um recurso opcional da Vitrine.

Quando estiver liberado para a barbearia:

1\. Abra **\*\*Vitrine\*\***.

2\. Acesse a configuração do Assistente IA.

3\. Ative ou desative o recurso.

Quando ativo, visitantes poderão perguntar sobre informações públicas da barbearia.

O Assistente não realiza agendamentos.

\---

**# 18. Vitrine vista pelo visitante**

![Vitrine Pública]\(./assets/32-vitrine-publica.png)

O visitante poderá acessar a página através do link da barbearia.

Dependendo das informações publicadas, ele poderá consultar:

\- nome da barbearia;

\- descrição;

\- serviços;

\- preços;

\- produtos;

\- imagens dos produtos, sejam personalizadas ou padrões das categorias quando aplicável;

\- Portfólio;

\- horários;

\- localização;

\- formas de pagamento aceitas;

\- WhatsApp;

\- Instagram;

\- Assistente IA.

\---

**# 19. Aparência do sistema**

Para alterar a aparência depois do onboarding:

```text
Sua conta
→ Aparência
```

Também pode existir um atalho **Aparência** no menu rápido da conta.

As opções disponíveis são:

- **Claro**;
- **Escuro**;
- **Padrão do Sistema**.

Ao utilizar **Padrão do Sistema**, a interface acompanha o modo claro ou escuro definido no dispositivo ou navegador.

A preferência de aparência pertence à sua conta e não altera automaticamente a aparência pública da Vitrine Digital.

---

**# 20. Encerrar sessão**

Para sair da conta:

1. Abra o menu da conta.
2. Clique em **Sair**.
3. O sistema retornará para a tela de Login.

A ação **Sair** pertence à conta do usuário e não precisa ser duplicada dentro de Configurações.

---

**# 21. Atualização deste manual**

Este manual deverá ser atualizado sempre que uma alteração visual ou funcional mudar a forma como o usuário utiliza o sistema.

Ao atualizar uma tela:

1\. substituir a imagem antiga;

2\. atualizar o nome dos botões;

3\. atualizar os passos correspondentes;

4\. remover instruções que não existem mais;

5\. revisar exemplos de imagens padrão, imagens personalizadas e estados sem imagem quando o fluxo de produtos for alterado.

O manual deverá representar somente a versão atual do Estilo e Gestão.

---

# 23. Planos do Estilo e Gestão

O sistema possui três planos:

- **Grátis:** Vitrine Digital, Portfólio, serviços e produtos para divulgação;
- **Normal — R$ 49,90/mês:** todos os recursos de gestão;
- **Com IA — R$ 79,90/mês:** todos os recursos do Normal e Assistente IA na Vitrine.

Se um período pago terminar, sua conta volta ao Grátis. Seus dados não são apagados. Vendas, estoque, financeiro e relatórios anteriores continuam disponíveis para consulta, mas não podem ser alterados ou exportados enquanto o plano estiver Grátis.

Ao abrir um recurso pago, o sistema explicará o bloqueio e mostrará a opção **Conhecer Plano Normal**.

# 24. Minha assinatura

Acesse:

```text
Sua conta → Minha assinatura
```

Nessa área você pode consultar:

- plano atual;
- data de vencimento;
- alteração agendada;
- cancelamento agendado;
- histórico de pagamentos reais.

Use **Alterar plano** para conhecer Grátis, Normal e Com IA.

## Cancelar assinatura

Cancelar uma assinatura paga não exclui sua conta. Você continua usando o plano até o vencimento e pode desfazer o cancelamento antes dessa data. Depois, a conta volta ao Grátis.

## Downgrade

Uma mudança do Com IA para o Normal acontece no vencimento. Sem novo pagamento confirmado, a conta volta ao Grátis.

# 25. Código da barbearia

Em **Dados da barbearia**, você encontrará um código semelhante a:

```text
EG-7K2M9Q
```

Use **Copiar código** quando o suporte solicitar. O código não aparece na Vitrine e não pode ser alterado.

# 26. Recurso bloqueado no Grátis

Recursos como PDV, gestão de estoque, financeiro e exportações permanecem visíveis. Ao selecioná-los, você verá por que o recurso está bloqueado e o que o Plano Normal oferece.

Os dados antigos podem ser consultados. Para criar ou alterar registros, será necessário ativar novamente um plano pago.

# 27. Conta suspensa

Uma suspensão é um bloqueio administrativo temporário e não apaga seus dados. Durante a suspensão, a área interna e a Vitrine ficam indisponíveis.

Se acreditar que houve engano, entre em contato com o suporte pelo canal informado na página.

# 28. Manutenção, falta de conexão e página inexistente

- **Manutenção:** aguarde a previsão exibida e tente novamente mais tarde.
- **Sem conexão:** verifique sua internet e use **Tentar novamente**.
- **Página não encontrada:** use **Voltar** ou **Ir para o início**.

Quando a conexão voltar, o sistema tentará retornar à tela em que você estava.

# 29. Excluir definitivamente a conta

Excluir conta é diferente de cancelar assinatura.

Acesse:

```text
Sua conta → Zona de perigo → Excluir conta
```

Para confirmar:

1. leia os avisos;
2. informe sua senha atual;
3. digite exatamente `EXCLUIR MINHA CONTA`;
4. confirme a exclusão definitiva.

A exclusão é imediata, não pode ser desfeita e retira a Vitrine do ar. Dados operacionais e arquivos são apagados. Se ainda houver período pago, o acesso termina naquele momento e não existe reembolso automático, salvo direito legal aplicável.

Se você deseja apenas parar de renovar e continuar usando o período atual, escolha **Cancelar assinatura**, não **Excluir conta**.

Pagamentos reais e ações administrativas essenciais podem permanecer por cinco anos para obrigações legais e defesa de direitos. Esse registro limitado não permite restaurar sua conta.

# 30. Assistente IA

Quando contratado, o Assistente IA aparece na Vitrine. O conteúdo da conversa não é guardado no banco e existe somente durante a conversa atual.

O limite inicial é de 1.000 respostas por ciclo da assinatura e 20 mensagens por conversa. Ao atingir o limite, novas respostas ficam indisponíveis até o próximo ciclo ou uma extensão administrativa.

# 31. Primeiro barbeiro parceiro

O primeiro uso será acompanhado pelo WhatsApp. O ciclo gratuito do Plano Normal começa quando o link do sistema pronto for enviado. Erros encontrados deverão ser descritos com a tela, ação realizada e resultado observado para facilitar a correção.
