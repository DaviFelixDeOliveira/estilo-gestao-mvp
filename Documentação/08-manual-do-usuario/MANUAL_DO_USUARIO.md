# Manual do Usuário — Estilo e Gestão

## Objetivo

Este manual ensina como utilizar o **Estilo e Gestão** no dia a dia.

O conteúdo é voltado ao barbeiro e explica somente como utilizar as telas e funcionalidades do sistema.

Regras técnicas, validações, mensagens de erro, banco de dados e funcionamento interno não fazem parte deste documento.

As imagens utilizadas neste manual deverão ser armazenadas em:

`./assets/`

---

# 1. Criar uma conta

![Criar Conta](./assets/01-criar-conta.png)

Para começar a utilizar o Estilo e Gestão:

1. Acesse a página inicial do sistema.
2. Clique em **Criar conta**.
3. Informe seu e-mail.
4. Informe sua senha.
5. Digite novamente a senha no campo de confirmação.
6. Preencha seu nome caso queira utilizá-lo nas informações públicas da barbearia.
7. Clique em **Criar conta**.
8. Continue para a configuração inicial da barbearia.

---

# 2. Configuração inicial

A configuração inicial será apresentada no primeiro acesso.

Ela é dividida em etapas para evitar um formulário muito grande.

---

## 2.1 Dados da barbearia

![Dados da Barbearia](./assets/02-onboarding-barbearia.png)

Informe:

- nome da barbearia;
- WhatsApp comercial;
- se realiza atendimento a domicílio.

Clique em **Continuar**.

---

## 2.2 Endereço

![Endereço](./assets/03-onboarding-endereco.png)

Informe o CEP.

Quando o CEP for encontrado, o sistema poderá preencher automaticamente:

- rua;
- bairro;
- cidade;
- estado.

Depois informe:

- número;
- complemento, caso exista.

Confira os dados e clique em **Continuar**.

---

## 2.3 Horários de funcionamento

![Horários](./assets/04-onboarding-horarios.png)

Configure cada dia da semana.

Para cada dia:

1. Marque se a barbearia estará **Aberta** ou **Fechada**.
2. Se estiver aberta, informe o horário de abertura.
3. Informe o horário de fechamento.

Repita para:

- segunda-feira;
- terça-feira;
- quarta-feira;
- quinta-feira;
- sexta-feira;
- sábado;
- domingo.

Depois clique em **Continuar**.

---

## 2.4 Serviços

![Serviços no Onboarding](./assets/05-onboarding-servicos.png)

Cadastre os principais serviços oferecidos.

Exemplos:

- Corte;
- Barba;
- Sobrancelha;
- Corte + Barba.

Para adicionar um serviço:

1. Clique em **Adicionar serviço**.
2. Informe o nome.
3. Informe o preço.
4. Preencha as outras informações desejadas.
5. Salve.

Depois de cadastrar os serviços iniciais, clique em **Continuar**.

---

## 2.5 Produtos e bebidas

![Produtos no Onboarding](./assets/06-onboarding-produtos.png)

Caso venda produtos ou bebidas:

1. Clique em **Adicionar produto**.
2. Informe os dados solicitados.
3. Escolha uma categoria.
4. Salve.

Caso não venda produtos ou bebidas, utilize a opção correspondente para continuar sem cadastrar produtos.

Ao finalizar, o sistema abrirá o Dashboard.

---

# 3. Entrar no sistema

![Login](./assets/07-login.png)

Para acessar uma conta já criada:

1. Abra o Estilo e Gestão.
2. Informe seu e-mail.
3. Informe sua senha.
4. Clique em **Entrar**.

Após o acesso, o sistema abrirá o Dashboard.

---

# 4. Recuperar a senha

![Esqueci Minha Senha](./assets/08-recuperar-senha.png)

Caso esqueça sua senha:

1. Na tela de Login, clique em **Esqueci minha senha**.
2. Informe seu e-mail.
3. Clique em **Enviar código**.
4. Consulte o e-mail recebido.
5. Digite o código de 6 números no sistema.
6. Continue para a redefinição da senha.
7. Informe a nova senha.
8. Confirme a nova senha.
9. Salve.

Depois, utilize a nova senha para acessar o sistema.

---

# 5. Dashboard

![Dashboard](./assets/09-dashboard.png)

O Dashboard apresenta um resumo da situação da barbearia.

Entre as informações disponíveis podem aparecer:

- faturamento;
- entradas;
- saídas;
- resultado estimado;
- vendas de serviços;
- vendas de bebidas;
- vendas de outros produtos;
- produtos com estoque baixo.

---

## 5.1 Alterar período

Utilize o seletor de período para visualizar informações de:

- hoje;
- semana;
- mês;
- ano;
- período personalizado.

No período personalizado, escolha uma data inicial e uma data final.

---

# 6. Serviços

![Lista de Serviços](./assets/10-servicos.png)

A área **Serviços** apresenta os serviços cadastrados na barbearia.

---

## 6.1 Cadastrar serviço

![Novo Serviço](./assets/11-novo-servico.png)

1. Abra **Serviços**.
2. Clique em **Novo serviço**.
3. Informe o nome.
4. Informe uma descrição caso queira.
5. Informe o preço.
6. Informe o custo estimado de materiais caso utilize essa função.
7. Escolha se o serviço será exibido na Vitrine.
8. Clique em **Salvar**.

---

## 6.2 Editar serviço

1. Abra a lista de serviços.
2. Selecione o serviço desejado.
3. Clique em **Editar**.
4. Altere as informações.
5. Clique em **Salvar**.

---

## 6.3 Inativar serviço

Caso não ofereça mais um serviço:

1. Abra o serviço.
2. Selecione **Inativar**.
3. Confirme a ação.

O serviço deixa de ser utilizado em novas vendas, mas o histórico antigo permanece disponível.

---

## 6.4 Exibir ou ocultar da Vitrine

Um serviço pode continuar cadastrado no sistema sem aparecer publicamente.

Utilize a opção **Exibir na Vitrine** para controlar essa informação.

---

# 7. Categorias de produtos

![Categorias](./assets/12-categorias.png)

As categorias servem para organizar os produtos.

Exemplos:

- Bebida;
- Pomada;
- Shampoo;
- Cera;
- Acessórios.

---

## 7.1 Utilizar uma categoria sugerida

Durante o cadastro de um produto:

1. Abra o campo **Categoria**.
2. Escolha uma das sugestões.
3. Continue o cadastro normalmente.

---

## 7.2 Criar uma categoria

Caso a categoria desejada não exista:

1. Clique em **Criar categoria**.
2. Informe o nome.
3. Clique em **Adicionar**.

A nova categoria ficará disponível para os produtos da sua barbearia.

---

# 8. Produtos e bebidas

![Produtos](./assets/13-produtos.png)

A tela de Produtos apresenta os itens vendidos pela barbearia.

---

## 8.1 Cadastrar produto

![Novo Produto](./assets/14-novo-produto.png)

1. Clique em **Novo produto**.
2. Informe o nome.
3. Escolha a categoria.
4. Informe uma descrição caso queira.
5. Informe a quantidade inicial.
6. Informe o estoque mínimo caso queira receber o alerta visual.
7. Informe o preço de custo.
8. Informe o preço de venda.
9. Adicione uma imagem caso queira.
10. Escolha se o produto será exibido na Vitrine.
11. Clique em **Salvar**.

---

## 8.2 Editar produto

1. Abra **Produtos**.
2. Selecione o produto.
3. Clique em **Editar**.
4. Altere as informações desejadas.
5. Salve.

A quantidade em estoque deve ser alterada pelas funções próprias de estoque.

---

## 8.3 Inativar produto

1. Abra o produto.
2. Selecione **Inativar**.
3. Confirme.

O produto deixa de aparecer para novas vendas.

---

# 9. Estoque

![Estoque](./assets/15-estoque.png)

A área de Estoque mostra as quantidades atuais dos produtos.

---

## 9.1 Estoque mínimo

O estoque mínimo é utilizado para indicar quando um produto está acabando.

Exemplo:

- estoque atual: 5;
- estoque mínimo: 5.

Nesse caso, o produto aparecerá com indicação de estoque baixo.

---

## 9.2 Registrar reposição

![Reposição](./assets/16-reposicao.png)

Quando comprar novas unidades:

1. Abra **Estoque**.
2. Escolha o produto.
3. Clique em **Repor estoque**.
4. Informe a quantidade comprada.
5. Informe o custo unitário.
6. Confira o valor apresentado.
7. Escolha a opção financeira apresentada pelo sistema.
8. Confirme.

O novo estoque será atualizado.

---

## 9.3 Ajustar estoque

![Ajustar Estoque](./assets/17-ajuste-estoque.png)

Utilize essa função quando a quantidade física for diferente da quantidade apresentada no sistema.

1. Escolha o produto.
2. Clique em **Ajustar estoque**.
3. Informe a quantidade física correta.
4. Informe o motivo.
5. Confirme.

---

## 9.4 Registrar perda

Utilize a opção de perda quando produtos deixarem de estar disponíveis para venda.

1. Escolha o produto.
2. Clique em **Registrar perda**.
3. Informe a quantidade.
4. Informe o motivo.
5. Confirme.

---

## 9.5 Histórico de estoque

![Histórico de Estoque](./assets/18-historico-estoque.png)

Abra o histórico para consultar movimentações como:

- reposições;
- vendas;
- ajustes;
- perdas;
- reversões de vendas.

---

# 10. PDV / Comanda

![PDV](./assets/19-pdv.png)

O PDV é utilizado para registrar rapidamente os serviços e produtos de uma venda.

---

## 10.1 Adicionar serviço

1. Abra **PDV**.
2. Localize o serviço.
3. Toque ou clique sobre ele.
4. O serviço será adicionado à comanda.

---

## 10.2 Adicionar produto

1. Abra a área de produtos do PDV.
2. Localize o produto.
3. Toque ou clique sobre ele.
4. O produto será adicionado à comanda.

---

## 10.3 Alterar quantidade

Nos produtos adicionados:

- utilize **+** para aumentar;
- utilize **-** para reduzir;
- utilize **Remover** para retirar o item.

O total é atualizado automaticamente.

---

## 10.4 Finalizar venda

![Finalizar Venda](./assets/20-finalizar-venda.png)

1. Confira os itens da comanda.
2. Confira as quantidades.
3. Confira o total.
4. Informe a forma de pagamento caso queira registrá-la.
5. Clique em **Finalizar venda**.
6. Aguarde a confirmação.

Depois da confirmação, a comanda será limpa para uma nova venda.

---

# 11. Histórico de vendas

![Histórico de Vendas](./assets/21-historico-vendas.png)

A tela de Histórico permite consultar vendas realizadas.

Cada venda pode apresentar:

- data;
- horário;
- valor;
- forma de pagamento;
- status.

---

## 11.1 Visualizar uma venda

1. Abra **Histórico de vendas**.
2. Selecione uma venda.
3. Consulte os itens e o total.

---

## 11.2 Cancelar uma venda

![Cancelar Venda](./assets/22-cancelar-venda.png)

1. Abra uma venda concluída.
2. Clique em **Cancelar venda**.
3. Leia a confirmação exibida.
4. Confirme.

A venda continuará disponível no histórico com o status **Cancelada**.

---

# 12. Financeiro e despesas

![Financeiro](./assets/23-financeiro.png)

A área Financeira permite acompanhar entradas, saídas e resultados da barbearia.

---

## 12.1 Registrar despesa

![Nova Despesa](./assets/24-nova-despesa.png)

1. Abra **Financeiro**.
2. Clique em **Nova despesa**.
3. Informe o nome.
4. Escolha a categoria.
5. Informe o valor.
6. Informe a data.
7. Adicione uma observação caso queira.
8. Salve.

---

## 12.2 Consultar resultados

Utilize os filtros disponíveis para consultar:

- faturamento;
- entradas;
- saídas;
- despesas;
- resultado estimado;
- resultados separados por origem.

---

# 13. Relatórios

![Relatórios](./assets/25-relatorios.png)

Utilize a área de Relatórios para analisar períodos específicos.

Escolha entre:

- dia;
- semana;
- mês;
- ano;
- período personalizado.

Quando a exportação estiver disponível, utilize o botão correspondente para gerar o relatório.

---

# 14. Informações da Barbearia

![Configurações](./assets/26-configuracoes.png)

Nesta área podem ser alteradas informações como:

- nome da barbearia;
- nome profissional;
- descrição;
- telefone;
- WhatsApp;
- Instagram;
- atendimento a domicílio;
- endereço;
- horários;
- logo;
- capa.

Depois de alterar os dados, clique em **Salvar**.

---

# 15. Vitrine Digital

![Vitrine Administrativa](./assets/27-vitrine-admin.png)

A Vitrine Digital é a página pública da barbearia.

Ela pode apresentar:

- informações do estabelecimento;
- serviços;
- produtos;
- Portfólio;
- horários;
- localização;
- contatos;
- Assistente IA.

---

## 15.1 Visualizar a Vitrine

Na área administrativa:

1. Abra **Vitrine**.
2. Clique em **Visualizar Vitrine**.
3. Confira como a página aparecerá para visitantes.

---

## 15.2 Copiar o link

1. Abra **Vitrine**.
2. Localize a URL pública.
3. Clique em **Copiar link**.

O link poderá ser utilizado no:

- Instagram;
- WhatsApp;
- Perfil da Empresa no Google;
- materiais de divulgação.

---

## 15.3 Publicar

1. Confira as informações públicas.
2. Visualize a prévia.
3. Clique em **Publicar**.

A página ficará disponível pelo endereço público.

---

## 15.4 Despublicar

1. Abra a configuração da Vitrine.
2. Clique em **Despublicar**.
3. Confirme.

As informações continuarão cadastradas, mas a página deixará de ficar disponível ao público.

---

# 16. Portfólio

![Portfólio Administrativo](./assets/28-portfolio.png)

O Portfólio é a área utilizada para divulgar os trabalhos realizados.

---

## 16.1 Adicionar trabalho

![Adicionar ao Portfólio](./assets/29-adicionar-portfolio.png)

1. Abra **Portfólio**.
2. Clique em **Adicionar trabalho**.
3. Escolha uma imagem.
4. Adicione uma descrição caso queira.
5. Relacione um serviço caso queira.
6. Escolha se deseja publicar.
7. Salve.

---

## 16.2 Ocultar trabalho

1. Abra o item.
2. Desative a opção de publicação.
3. Salve.

A imagem permanecerá no painel, mas não será exibida publicamente.

---

## 16.3 Publicar novamente

1. Abra um item oculto.
2. Ative a publicação.
3. Salve.

---

## 16.4 Excluir trabalho

1. Abra o item.
2. Clique em **Excluir**.
3. Confirme.

---

# 17. Assistente IA

![Assistente IA](./assets/30-assistente-ia.png)

O Assistente IA é um recurso opcional da Vitrine.

Quando estiver liberado para a barbearia:

1. Abra **Vitrine**.
2. Acesse a configuração do Assistente IA.
3. Ative ou desative o recurso.

Quando ativo, visitantes poderão perguntar sobre informações públicas da barbearia.

O Assistente não realiza agendamentos.

---

# 18. Vitrine vista pelo visitante

![Vitrine Pública](./assets/31-vitrine-publica.png)

O visitante poderá acessar a página através do link da barbearia.

Dependendo das informações publicadas, ele poderá consultar:

- nome da barbearia;
- descrição;
- serviços;
- preços;
- produtos;
- Portfólio;
- horários;
- localização;
- WhatsApp;
- Instagram;
- Assistente IA.

---

# 19. Encerrar sessão

Para sair da conta:

1. Abra o menu da conta ou Configurações.
2. Clique em **Sair**.
3. O sistema retornará para a tela de Login.

---

# 20. Atualização deste manual

Este manual deverá ser atualizado sempre que uma alteração visual ou funcional mudar a forma como o usuário utiliza o sistema.

Ao atualizar uma tela:

1. substituir a imagem antiga;
2. atualizar o nome dos botões;
3. atualizar os passos correspondentes;
4. remover instruções que não existem mais.

O manual deverá representar somente a versão atual do Estilo e Gestão.