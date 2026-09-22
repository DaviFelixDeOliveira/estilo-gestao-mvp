**# Documento Visão**

\---

**## Objetivo**

Este documento apresenta a visão geral do **\*\*Estilo e Gestão\*\***, incluindo:

\- objetivo do produto;

\- público-alvo;

\- problema identificado;

\- solução proposta;

\- tecnologias utilizadas;

\- principais funcionalidades;

\- requisitos funcionais;

\- requisitos não funcionais;

\- visão resumida do uso do sistema.

Os detalhes específicos de fluxos, validações, banco de dados, segurança, interface e implementação pertencem aos documentos próprios do projeto.

\---

**## Resumo**

O **\*\*Estilo e Gestão\*\*** é um SaaS (Software como Serviço) web responsivo voltado principalmente para barbeiros autônomos e pequenas barbearias.

O projeto busca facilitar tarefas que normalmente são controladas de forma manual ou separada, principalmente vendas, serviços, produtos, estoque, despesas, resultados financeiros e divulgação do trabalho.

Durante o levantamento inicial do projeto, foi conversado com um profissional da área de barbearia, que relatou necessidades relacionadas ao controle financeiro, venda de produtos e bebidas, registro rápido dos atendimentos e divulgação dos trabalhos realizados.

A proposta prioriza uma ferramenta simples, rápida e adequada à rotina de uma operação pequena, evitando funções complexas ou etapas desnecessárias.

O sistema contará com uma área privada para gestão da barbearia, uma Vitrine Digital pública para divulgação e uma área administrativa separada destinada ao Operador do SaaS.

\---

**## Palavras-chave**

SaaS; barbearia; gestão; PDV; estoque; financeiro; vendas; Vitrine Digital; Portfólio.

\---

**## Sumário**

\- [1. Introdução]\(*#1-introdução*)

\- [2. Nicho de mercado do projeto]\(*#2-nicho-de-mercado-do-projeto*)

  - [2.1 Público-alvo]\(*#21-público-alvo*)

  - [2.2 Problema do cliente]\(*#22-problema-do-cliente*)

  - [2.3 Solução proposta]\(*#23-solução-proposta*)

\- [3. Tecnologias utilizadas]\(*#3-tecnologias-utilizadas*)

  - [3.1 Desenvolvimento]\(*#31-desenvolvimento*)

  - [3.2 Frontend]\(*#32-frontend*)

  - [3.3 Backend e dados]\(*#33-backend-e-dados*)

  - [3.4 Integrações]\(*#34-integrações*)

  - [3.5 Hospedagem]\(*#35-hospedagem*)

\- [4. Empresa]\(*#4-empresa*)

\- [5. Análise do sistema]\(*#5-análise-do-sistema*)

  - [5.1 Nome do software]\(*#51-nome-do-software*)

  - [5.2 Descrição geral]\(*#52-descrição-geral*)

  - [5.3 Requisitos funcionais]\(*#53-requisitos-funcionais*)

  - [5.4 Requisitos não funcionais]\(*#54-requisitos-não-funcionais*)

  - [5.5 Esquema de cores]\(*#55-esquema-de-cores*)

  - [5.6 Wireframes das telas]\(*#56-wireframes-das-telas*)

\- [6. Manual do Usuário]\(*#6-manual-do-usuário*)

\- [7. Modelo de negócio]\(*#7-modelo-de-negócio*)

\- [8. Plano de testes]\(*#8-plano-de-testes*)

\- [9. Apêndices]\(*#9-apêndices*)

\- [10. Referências bibliográficas]\(*#10-referências-bibliográficas*)

\- [11. Conclusão]\(*#11-conclusão*)

\---

**# 1. Introdução**

Nas últimas décadas, o avanço da tecnologia tem transformado profundamente a forma como informações são produzidas, armazenadas e utilizadas em empresas de diferentes tamanhos.

Mesmo pequenos estabelecimentos podem utilizar sistemas digitais para reduzir tarefas manuais, organizar informações e entender melhor o funcionamento do próprio negócio.

Na rotina de uma barbearia, informações sobre serviços realizados, produtos vendidos, estoque, despesas e faturamento podem acabar espalhadas entre anotações, memória, calculadoras ou aplicativos que não se comunicam.

Além da dificuldade de gestão, o profissional também precisa divulgar seu trabalho e permitir que potenciais clientes encontrem informações básicas sobre a barbearia.

Diante dessa realidade, o presente projeto surgiu da necessidade de oferecer uma ferramenta simples que una gestão interna e divulgação digital em um único sistema.

Assim, este projeto tem como objetivo desenvolver uma aplicação digital voltada à gestão de barbearias, permitindo registrar vendas, organizar serviços e produtos, controlar estoque, registrar despesas, consultar resultados e manter uma página pública de divulgação.

O sistema foi planejado principalmente para barbeiros autônomos e pequenas barbearias que precisam de uma solução direta, responsiva e simples de utilizar durante a rotina de trabalho.

\---

**# 2. Nicho de mercado do projeto**

O projeto pertence ao segmento de tecnologia para gestão de pequenos negócios, com foco específico no setor de barbearias.

**## 2.1 Público-alvo**

O público inicial é composto por:

\- barbeiros autônomos;

\- pequenas barbearias com operação simples.

O projeto tende a ser mais útil em estabelecimentos nos quais uma única pessoa administra grande parte da operação.

A estrutura principal considera:

\- 1 usuário responsável;

\- 1 barbearia vinculada a esse usuário.

O sistema é especialmente adequado ao uso pelo celular, já que o profissional poderá precisar registrar vendas e consultar informações durante o próprio expediente.

Também haverá responsividade para dispositivos maiores, como:

\- tablets;

\- notebooks;

\- computadores.

\---

**## 2.2 Problema do cliente**

Pequenas barbearias podem possuir dificuldades para centralizar informações básicas da operação.

Entre os problemas identificados estão:

\- registro manual das vendas;

\- dificuldade para saber quanto foi recebido em determinado período;

\- dificuldade para separar resultados de serviços, bebidas e produtos;

\- despesas registradas sem organização;

\- necessidade de repetir manualmente o cadastro de despesas frequentes;

\- falta de controle claro da quantidade de produtos disponíveis;

\- ausência de alerta para estoque baixo;

\- necessidade de calcular manualmente o total de uma comanda;

\- dificuldade para manter serviços e produtos organizados;

\- divulgação dos trabalhos dependente apenas de redes sociais ou mensagens;

\- ausência de um link público próprio com informações da barbearia.

O sistema busca resolver esses pontos sem exigir uma operação complexa, pois adicionar etapas desnecessárias durante um atendimento pode tornar a ferramenta lenta para o uso diário.

\---

**## 2.3 Solução proposta**

O Estilo e Gestão propõe centralizar as principais tarefas do barbeiro em uma aplicação web responsiva.

A área privada da barbearia permitirá:

\- cadastrar serviços;

\- cadastrar categorias de produtos;

\- cadastrar produtos e bebidas;

\- controlar estoque;

\- registrar reposições;

\- registrar ajustes;

\- registrar perdas;

\- utilizar uma comanda rápida;

\- registrar vendas;


\- registrar despesas avulsas;

\- configurar despesas recorrentes;

\- acompanhar indicadores;

\- consultar relatórios;

\- exportar relatórios;

\- administrar informações da barbearia;

\- configurar formas de pagamento aceitas;

\- gerenciar a Vitrine Digital;

\- gerenciar o Portfólio.

O sistema também oferecerá uma **\*\*Vitrine Digital\*\***, que será a página pública da barbearia.

Ela poderá apresentar:

\- identidade do estabelecimento;

\- descrição;

\- serviços;

\- preços;

\- produtos divulgados;

\- Portfólio;

\- horários;

\- localização;

\- atendimento a domicílio;

\- formas de pagamento aceitas;

\- WhatsApp;

\- Instagram.

A Vitrine Digital não realizará vendas ou agendamentos no projeto inicial.

O Assistente IA não faz parte da versão inicial. Seu planejamento futuro está documentado em `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

Também existirá uma área separada para o **\*\*Operador do SaaS\*\***, destinada apenas às funções administrativas necessárias para operação do Estilo e Gestão.

\---

**# 3. Tecnologias utilizadas**

**## 3.1 Desenvolvimento**

**### GitHub**

Utilizado para hospedar o repositório e manter o código-fonte centralizado.

**### Stitch**

Utilizado para criação e validação dos protótipos das interfaces.

A documentação do projeto permanece como fonte oficial dos requisitos.

\---

**## 3.2 Frontend**

**### Next.js**

Framework principal da aplicação web, responsável pelas páginas públicas, privadas e recursos executados no servidor.

**### React**

Utilizado para criação dos componentes e interfaces do sistema.

**### TypeScript**

Utilizado para tipagem e maior segurança na manipulação dos dados.

**### Tailwind CSS**

Utilizado para estilização e responsividade das interfaces.

**### Lucide React**

Biblioteca padrão de ícones da aplicação.

**### Zod**

Utilizado para estruturar e validar dados recebidos por formulários e operações do sistema.

\---

**## 3.3 Backend e dados**

**### PostgreSQL**

Banco relacional utilizado para armazenar os dados estruturados do sistema.

**### Supabase**

Plataforma utilizada para fornecer banco PostgreSQL, autenticação, armazenamento e recursos de segurança.

**### Supabase Auth**

Responsável por:

\- cadastro;

\- Login;

\- sessões;

\- confirmação de e-mail quando configurada;

\- recuperação de senha.

**### Supabase Storage**

Responsável pelo armazenamento das imagens utilizadas no sistema.

**### Supabase RLS**

Utilizado para auxiliar no controle de acesso e isolamento dos dados entre barbearias.

\---

**## 3.4 Integrações**

**### ViaCEP**

Utilizado para auxiliar o preenchimento dos dados de endereço através do CEP.

**### Assistente IA — recurso futuro**

Nenhuma integração de IA faz parte da versão inicial. Quando esse módulo entrar no escopo, seguir `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

\---

**## 3.5 Hospedagem**

**### Vercel**

Utilizada para implantação e hospedagem da aplicação Next.js.

**### Supabase Cloud**

Utilizado para hospedar:

\- banco;

\- autenticação;

\- arquivos.

\---

**# 4. Empresa**

O Estilo e Gestão é atualmente um projeto desenvolvido de forma independente.

As informações institucionais de uma futura empresa responsável pelo produto ainda não foram definidas.

**## Nome da empresa**

**\*\*INDEFINIDO\*\***

**## Missão**

**\*\*INDEFINIDA\*\***

**## Visão**

**\*\*INDEFINIDA\*\***

**## Valores**

**\*\*INDEFINIDOS\*\***

**## Logo da empresa**

**\*\*INDEFINIDA\*\***

**## Slogan da empresa**

**\*\*INDEFINIDO\*\***

**## Slogan do produto**

**\*\*INDEFINIDO\*\***

\---

**# 5. Análise do sistema**

**## 5.1 Nome do software**

**\*\*Estilo e Gestão\*\***

\---

**## 5.2 Descrição geral**

O Estilo e Gestão tem o objetivo de simplificar a administração de pequenas barbearias.

O sistema possui três contextos principais:

\- área privada da barbearia;

\- Vitrine Digital pública;

\- área administrativa do Operador do SaaS.

**### Área privada da barbearia**

É utilizada pelo usuário do tipo:

*\`BARBEIRO\`*

Nela será possível administrar:

\- serviços;

\- produtos;

\- categorias;

\- estoque;

\- vendas;

\- despesas;

\- relatórios;

\- configurações;

\- formas de pagamento aceitas;

\- Vitrine Digital;

\- Portfólio;


O PDV permitirá montar uma comanda contendo serviços e produtos e calcular automaticamente o valor da venda.

Produtos vendidos terão o estoque atualizado através das movimentações correspondentes.

**### Vitrine Digital**

É a área pública utilizada para divulgação da barbearia.

Poderá apresentar informações autorizadas pelo barbeiro, como:

\- serviços;

\- preços;

\- produtos;

\- Portfólio;

\- horários;

\- localização;

\- contatos;

\- atendimento a domicílio;

\- formas de pagamento aceitas.

O barbeiro poderá visualizar uma prévia e gerar uma URL pública própria para a Vitrine.

**### Operador do SaaS**

O Operador do SaaS utiliza uma conta com:

*\`tipo = ADMIN\`*

O Login utiliza o mesmo Supabase Auth das demais contas.

Após a autenticação, o sistema verifica o tipo da conta:

\- *\`BARBEIRO\`* → área da barbearia;

\- *\`ADMIN\`* → Painel Administrativo do SaaS.

Todo novo cadastro público recebe *\`BARBEIRO\`* por padrão.

No sistema inicial, a permissão *\`ADMIN\`* será atribuída manualmente no banco de dados.

O usuário não poderá alterar o próprio tipo pela aplicação.

**### Assistente IA — recurso futuro**

O Assistente IA não faz parte da versão inicial do sistema.

Não criar integração, chat, plano comercial, cota ou configuração de IA nesta etapa.

A implementação futura deverá seguir `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

\---
**# 5.3 Requisitos funcionais**

**## RF01 — Cadastrar conta**

**\*\*Descrição:\*\*** Permitir que um novo barbeiro crie uma conta para utilização do sistema.

**\*\*Dados usados:\*\***

\- nome profissional, quando informado;

\- e-mail;

\- senha gerenciada pelo serviço de autenticação;

\- tipo de usuário.

**\*\*Regras principais:\*\***

\- todo cadastro público recebe *\`BARBEIRO\`*;

\- não permitir selecionar *\`ADMIN\`* durante o cadastro;

\- o próprio usuário não pode alterar seu tipo pela aplicação.

\---

**## RF02 — Autenticar usuário**

**\*\*Descrição:\*\*** Permitir que usuários cadastrados acessem o sistema através das próprias credenciais.

**\*\*Dados usados:\*\***

\- e-mail;

\- senha;

\- sessão;

\- identificador do usuário;

\- tipo do usuário.

Após autenticar:

\- *\`BARBEIRO\`* deverá seguir para o fluxo da própria barbearia;

\- *\`ADMIN\`* deverá seguir para o Painel Administrativo do SaaS.

\---

**## RF03 — Recuperar acesso**

**\*\*Descrição:\*\*** Permitir solicitar recuperação e definir uma nova senha quando o usuário perder acesso à conta.

**\*\*Dados usados:\*\***

\- e-mail;

\- código numérico de verificação;

\- nova senha.

\---

**## RF04 — Configurar barbearia**

**\*\*Descrição:\*\*** Permitir cadastrar e alterar as informações principais do estabelecimento.

**\*\*Dados usados:\*\***

\- nome da marca;

\- nome profissional;

\- descrição;

\- WhatsApp;

\- Instagram;

\- CEP;

\- rua/logradouro;

\- número ou indicação de endereço sem número;

\- bairro;

\- cidade;

\- estado;

\- complemento;

\- atendimento a domicílio;

\- horários;

\- formas de pagamento aceitas;

\- logo;

\- imagem de capa.

\---

**## RF05 — Gerenciar serviços**

**\*\*Descrição:\*\*** Permitir cadastrar, editar, ativar, inativar e controlar a exibição pública dos serviços.

**\*\*Dados usados:\*\***

\- nome;

\- descrição;

\- preço;

\- custo estimado de insumos;

\- status;

\- visibilidade pública.

\---

**## RF06 — Gerenciar categorias de produtos**

**\*\*Descrição:\*\*** Permitir utilizar categorias sugeridas e criar categorias próprias para organizar os produtos da barbearia.

**\*\*Dados usados:\*\***

\- nome da categoria;

\- status;

\- barbearia responsável.

\---

**## RF07 — Gerenciar produtos**

**\*\*Descrição:\*\*** Permitir cadastrar e atualizar produtos e bebidas vendidos pela barbearia.

**\*\*Dados usados:\*\***

\- nome;

\- categoria;

\- descrição;

\- estoque;

\- estoque mínimo;

\- preço de custo;

\- preço de venda;

\- imagem;

\- status;

\- visibilidade pública.

\---

**## RF08 — Controlar estoque**

**\*\*Descrição:\*\*** Permitir registrar movimentações que alteram a quantidade dos produtos.

**\*\*Dados usados:\*\***

\- produto;

\- quantidade;

\- saldo anterior;

\- saldo posterior;

\- tipo da movimentação;

\- data e hora;

\- motivo.

Movimentações previstas:

\- reposição;

\- venda;

\- ajuste;

\- perda;

\- reversão de venda.

\---

**## RF09 — Registrar venda**

**\*\*Descrição:\*\*** Permitir montar uma comanda contendo serviços e produtos e registrar a venda concluída.

**\*\*Dados usados:\*\***

\- itens;

\- quantidades dos produtos;

\- preços cobrados no momento da venda;

\- custos no momento da venda;

\- subtotais;

\- total;

\- forma de pagamento, quando informada;

\- observação, quando informada;

\- data e hora;

\- status.

Serviços poderão ser adicionados somente uma vez por comanda.

Produtos poderão utilizar quantidade maior que uma unidade conforme disponibilidade de estoque.

A forma de pagamento registrada em uma venda representa como aquela venda específica foi paga e é diferente da lista de formas de pagamento normalmente aceitas pela barbearia.

\---

**## RF10 — Representar vendas canceladas**

**\*\*Descrição:\*\*** Permitir que o histórico represente corretamente vendas com status `CANCELADA`, preservando os dados necessários para rastreabilidade.

O protótipo e a versão inicial **não devem oferecer botão Cancelar venda/Estornar venda enquanto o fluxo de cancelamento não estiver aprovado** com regras completas de estoque, financeiro, confirmação e rastreabilidade.

A existência do status `CANCELADA` no modelo não autoriza, por si só, a criação da ação na interface.

\---

**## RF11 — Gerenciar despesas**

**\*\*Descrição:\*\*** Permitir registrar e administrar despesas da barbearia.

As despesas poderão ser:

\- avulsas;

\- recorrentes.

**\*\*Dados usados:\*\***

\- nome;

\- descrição;

\- categoria;

\- valor;

\- data.

Para despesas recorrentes também poderão ser utilizados:

\- valor previsto;

\- frequência;

\- dia do vencimento;

\- status da ocorrência;

\- valor efetivamente pago;

\- data de pagamento;

\- status da recorrência.

Uma ocorrência recorrente somente deverá virar saída financeira quando for marcada como paga.

\---

**## RF12 — Mostrar Dashboard**

**\*\*Descrição:\*\*** Mostrar os principais indicadores da operação no período selecionado.

**\*\*Dados usados:\*\***

\- vendas;

\- despesas;

\- custos;

\- perdas de estoque;

\- categorias;

\- período.

Poderá apresentar:

\- faturamento;

\- entradas;

\- saídas;

\- resultado estimado;

\- indicadores operacionais;

\- alertas de estoque;

\- gráficos resumidos.

\---

**## RF13 — Mostrar relatórios**

**\*\*Descrição:\*\*** Mostrar informações financeiras e operacionais por diferentes períodos.

**\*\*Dados usados:\*\***

\- faturamento;

\- entradas;

\- despesas;

\- custos;

\- perdas;

\- serviços;

\- produtos;

\- bebidas;

\- período.

Filtros previstos:

\- diário;

\- semanal;

\- mensal;

\- anual;

\- personalizado.

Permitir exportação nos formatos:

\- PDF;

\- PNG.

\---

**## RF14 — Configurar e publicar Vitrine Digital**

**\*\*Descrição:\*\*** Permitir configurar e publicar a página pública da barbearia.

**\*\*Dados usados:\*\***

\- slug;

\- status da Vitrine;

\- informações públicas;

\- serviços públicos;

\- produtos públicos;

\- horários;

\- endereço;

\- contatos;

\- formas de pagamento aceitas;

\- configuração de produtos sem estoque.

O barbeiro deverá poder:

\- configurar informações;

\- visualizar uma prévia;

\- gerar a URL;

\- publicar;

\- despublicar;

\- copiar o link;

\- visualizar a página pública.

Antes de gerar a URL, o sistema poderá informar quais informações opcionais não cadastradas deixarão de ser exibidas.

\---

**## RF15 — Gerenciar Portfólio**

**\*\*Descrição:\*\*** Permitir adicionar, publicar, ocultar e remover imagens dos trabalhos realizados.

**\*\*Dados usados:\*\***

\- imagem;

\- descrição;

\- serviço relacionado;

\- status de publicação;

\- data.

\---

**## RF16 — Disponibilizar contato público**

**\*\*Descrição:\*\*** Permitir que visitantes utilizem os canais de contato e localização disponibilizados pela barbearia.

**\*\*Dados usados:\*\***

\- WhatsApp;

\- Instagram;

\- endereço.

A Vitrine poderá disponibilizar ações como:

\- abrir WhatsApp;

\- abrir Instagram;

\- abrir endereço no Google Maps.

\---

**## RF17 — Assistente IA (recurso futuro)**

**\*\*Status:\*\*** Fora do escopo da versão inicial.

Não implementar chat, endpoints, cotas ou integração com provedor de IA nesta etapa.

Quando o recurso for aprovado, utilizar `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md` como ponto oficial de retomada.

\---
**## RF18 — Administrar recursos básicos do SaaS**

**\*\*Descrição:\*\*** Permitir que usuários autorizados com *\`tipo = ADMIN\`* realizem operações administrativas necessárias ao funcionamento do SaaS.

**\*\*Dados usados:\*\***

\- conta do operador;

\- tipo do usuário;

\- identificador da barbearia;

\- plano, validade e situação da conta;

\- pagamentos e histórico administrativo permitido.

O Operador poderá:

\- localizar barbearias;

\- visualizar informações necessárias para suporte;

\- confirmar pagamento e conceder cortesia;

\- confirmar pagamento, conceder cortesia ou cancelar assinatura;

\- suspender ou reativar contas;


\- realizar suporte operacional permitido.

O Operador não deverá, por padrão:

\- realizar vendas em nome do barbeiro;

\- alterar estoque;

\- cadastrar despesas;

\- acessar senhas;

\- acessar segredos;

\- agir como proprietário da barbearia.

\---

**## RF19 — Gerenciar Perfil e Conta**

**\*\*Descrição:\*\*** Permitir que o usuário consulte e administre informações relacionadas à própria conta.

**\*\*Dados usados:\*\***

\- e-mail;

\- tipo da conta;

\- sessão.

Permitir:

\- consultar informações da conta;

\- alterar senha;

\- sair;

\- solicitar exclusão da conta.

O usuário não poderá alterar seu próprio tipo.

\---

**## RF20 — Selecionar tema do sistema**

**\*\*Descrição:\*\*** Permitir escolher a aparência geral da interface privada.

Opções:

\- Tema Claro;

\- Tema Escuro;

\- Padrão do Sistema.

Quando selecionado **\*\*Padrão do Sistema\*\***, a aplicação deverá acompanhar a preferência de tema do dispositivo.

A escolha deverá ser armazenada como preferência do usuário e permanecer aplicada nos acessos seguintes.

A preferência padrão será **\*\*Padrão do Sistema\*\*** enquanto o usuário não escolher outra opção.

\---

**# 5.4 Requisitos não funcionais**

**## RNF01 — Adaptar interface**

**\*\*Descrição:\*\*** Adaptar o sistema para celulares pequenos e grandes, tablets, notebooks e computadores.

**\*\*Dados usados:\*\***

\- dimensões da tela;

\- componentes da interface;

\- pontos de quebra responsivos.

\---

**## RNF02 — Priorizar uso mobile**

**\*\*Descrição:\*\*** Priorizar operações rápidas pelo celular, principalmente no PDV.

**\*\*Dados usados:\*\***

\- dimensões da tela;

\- tamanho dos elementos;

\- navegação;

\- ações frequentes.

\---

**## RNF03 — Proteger acesso aos dados**

**\*\*Descrição:\*\*** Restringir cada barbearia aos próprios dados e impedir exposição indevida de informações administrativas.

**\*\*Dados usados:\*\***

\- usuário autenticado;

\- sessão;

\- identificador da barbearia;

\- tipo do usuário;

\- políticas de acesso.

O sistema deverá diferenciar autorização de:

\- *\`BARBEIRO\`*;

\- *\`ADMIN\`*.

\---

**## RNF04 — Validar autorização administrativa**

**\*\*Descrição:\*\*** Garantir que apenas contas autorizadas como *\`ADMIN\`* acessem funções do Painel Administrativo.

A autorização não poderá depender somente de:

\- menu oculto;

\- rota conhecida;

\- estado do frontend;

\- dado armazenado no navegador.

O backend deverá validar a permissão.

\---

**## RNF05 — Validar dados no servidor**

**\*\*Descrição:\*\*** Validar no servidor os dados importantes antes de alterar banco, estoque ou financeiro.

**\*\*Dados usados:\*\***

\- dados recebidos;

\- sessão;

\- perfil;

\- registros atuais do banco.

\---

**## RNF06 — Garantir integridade da venda**

**\*\*Descrição:\*\*** Executar venda, itens, baixa de estoque e movimentações como uma operação consistente.

**\*\*Dados usados:\*\***

\- venda;

\- itens;

\- estoque;

\- movimentações.

\---

**## RNF07 — Manter desempenho adequado**

**\*\*Descrição:\*\*** Evitar consultas, imagens e carregamentos desnecessários que prejudiquem o uso diário.

**\*\*Dados usados:\*\***

\- consultas;

\- imagens;

\- componentes;

\- recursos carregados.

\---

**## RNF08 — Aplicar acessibilidade básica**

**\*\*Descrição:\*\*** Utilizar contraste adequado, foco visível, labels, textos alternativos quando necessários e controles utilizáveis por toque e teclado.

**\*\*Dados usados:\*\***

\- elementos da interface;

\- textos;

\- imagens;

\- estados de foco.

\---

**## RNF09 — Tratar indisponibilidade**

**\*\*Descrição:\*\*** Informar problemas de conexão ou manutenção sem permitir que operações críticas sejam registradas parcialmente.

**\*\*Dados usados:\*\***

\- estado da conexão;

\- estado da sessão;

\- modo de manutenção.

\---

**## RNF10 — Assistente IA (requisito futuro)**

**\*\*Status:\*\*** Fora do escopo da versão inicial.

As regras de segurança específicas de IA serão definidas e validadas quando o módulo entrar no escopo, conforme `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

\---
**## RNF11 — Aplicar esquema visual consistente**

**\*\*Descrição:\*\*** Utilizar uma identidade visual consistente baseada na marca do Estilo e Gestão.

**\*\*Dados usados:\*\***

\- tokens de cor;

\- estados dos componentes;

\- contraste;

\- tema selecionado.

O detalhamento completo pertence ao Design System.

\---

**# 5.5 Esquema de cores**

A identidade atual do produto utiliza principalmente tons neutros relacionados à marca.

**## Cores base**

\- Grafite principal: *\`#2F2F2D\`*

\- Grafite secundário: *\`#3A3A38\`*

\- Cinza: *\`#666662\`*

\- Cinza claro: *\`#E9E9E4\`*

\- Fundo claro: *\`#F4F4F0\`*

\- Branco: *\`#FFFFFF\`*

**## Cor de ação**

\- Verde profundo: *\`#2F6B4F\`*

Estados de:

\- sucesso;

\- aviso;

\- erro;

\- informação;

terão cores semânticas próprias definidas no Design System e no Esquema de Cores.

A aplicação também deverá considerar os temas:

\- Claro;

\- Escuro;

\- Padrão do Sistema.

Os valores específicos de cada tema pertencem aos documentos de design.

\---

**## 5.6 Wireframes das telas**

Seção reservada para inserção dos wireframes após a etapa de prototipação.

A ferramenta oficial de prototipação atual é o **\*\*Stitch\*\***.

Os protótipos devem seguir os documentos oficiais do projeto e não constituem uma nova fonte independente de requisitos.

\---

**# 6. Manual do Usuário**

Esta seção apresenta apenas um resumo do uso do sistema.

O conteúdo detalhado pertence ao documento **\*\*Manual do Usuário\*\***.

\---

**## 6.1 Criar conta**

Na tela de criação de conta, o usuário poderá iniciar seu cadastro informando os dados solicitados.

Entre eles:

\- nome profissional, quando informado;

\- e-mail;

\- senha;

\- confirmação da senha.

Todo cadastro público será criado como:

*\`BARBEIRO\`*

Não existirá opção pública para criar uma conta *\`ADMIN\`*.

Após a criação, poderá ser necessário confirmar o e-mail conforme a configuração do Supabase Auth.

Depois disso, o barbeiro será direcionado para a configuração inicial da barbearia.

\---

**## 6.2 Entrar no sistema**

Na tela de Login, o usuário deverá informar:

\- e-mail;

\- senha.

Após a autenticação, o sistema verificará o tipo da conta.

Se:

*\`BARBEIRO\`*

o usuário será encaminhado para:

\- Onboarding pendente;

\- ou Dashboard.

Se:

*\`ADMIN\`*

será encaminhado para o Painel Administrativo do SaaS.

\---

**## 6.3 Recuperar senha**

Caso esqueça a senha, o usuário poderá iniciar a recuperação através da tela de Login.

O fluxo utilizará um código numérico de 6 dígitos enviado ao e-mail cadastrado.

Após validar o código, o usuário poderá definir uma nova senha.

\---

**## 6.4 Configuração inicial da barbearia**

No primeiro acesso, o barbeiro deverá concluir o Onboarding antes de utilizar normalmente o painel.

O fluxo será dividido em 6 etapas:

1\. **\*\*Dados da barbearia\*\***;

2\. **\*\*Endereço\*\***;

3\. **\*\*Horários de funcionamento\*\***;

4\. **\*\*Serviços\*\***;

5\. **\*\*Produtos e formas de pagamento\*\***;

6\. **\*\*Aparência e conclusão\*\***.

**### Etapa 1 — Dados da barbearia**

Poderá solicitar:

\- nome da barbearia;

\- nome profissional;

\- WhatsApp;

\- Instagram opcional;

\- logo opcional;

\- confirmação se realiza atendimento a domicílio.

**### Etapa 2 — Endereço**

Poderá solicitar:

\- CEP;

\- rua/logradouro;

\- confirmação se o endereço possui número;

\- número quando aplicável;

\- bairro;

\- cidade;

\- estado;

\- complemento opcional.

Quando o endereço não possuir número, o sistema deverá representar essa condição sem armazenar *\`"S/N"\`* como número.

**### Etapa 3 — Horários de funcionamento**

O barbeiro poderá informar:

\- dias em que a barbearia funciona;

\- dias em que permanece fechada;

\- horário de abertura e fechamento;

\- segundo intervalo opcional no mesmo dia.

Esses horários representam funcionamento público e não constituem agenda ou agendamento de clientes.

**### Etapa 4 — Serviços**

O barbeiro poderá cadastrar os serviços iniciais e respectivos preços para deixar o sistema pronto para utilização do PDV.

Poderão ser utilizados:

\- nome;

\- descrição opcional;

\- preço;

\- custo estimado de insumos opcional;

\- visibilidade na Vitrine.

**### Etapa 5 — Produtos e formas de pagamento**

O sistema deverá perguntar se a barbearia vende produtos ou bebidas.

Se a barbearia não vender produtos ou bebidas:

- não exigir categorias;
- não exigir cadastro de produtos;
- seguir para a configuração das formas de pagamento.

Se a barbearia vender produtos ou bebidas, o barbeiro deverá indicar as categorias que comercializa.

O sistema poderá oferecer categorias sugeridas, como:

- Bebida;
- Pomada;
- Shampoo;
- Cera;
- Óleo/Balm para barba;
- Acessórios;
- Outros.

O barbeiro também poderá criar categorias próprias quando necessário.

Categorias sugeridas poderão possuir uma imagem padrão oficial do sistema.

Categorias personalizadas deverão iniciar sem imagem padrão oficial.

Após selecionar ou criar as categorias, o barbeiro deverá cadastrar os produtos iniciais comercializados pela barbearia.

Se informou que vende produtos ou bebidas, deverá existir pelo menos 1 produto cadastrado antes de concluir a etapa.

Para cada produto deverão ser informados:

- categoria;
- nome;
- preço de custo;
- preço de venda;
- imagem própria opcional.

Quando o produto não possuir imagem própria, poderá utilizar a imagem padrão da categoria correspondente.

A imagem própria do produto não deverá alterar ou substituir a imagem padrão oficial da categoria.

O Onboarding não deverá solicitar:

- estoque atual;
- estoque mínimo;
- reposições;
- ajustes;
- perdas;
- movimentações de estoque.

Produtos cadastrados durante o Onboarding deverão iniciar com estoque `0`.

A configuração e movimentação do estoque serão realizadas posteriormente na área própria do sistema.

Nessa etapa também deverão ser informadas as formas de pagamento normalmente aceitas pela barbearia, como:

- Pix;
- Dinheiro;
- Cartão de débito;
- Cartão de crédito;
- Outro, quando aplicável.

Deverá existir pelo menos uma forma de pagamento selecionada antes de concluir a etapa.

Essa configuração representa os meios aceitos pelo estabelecimento e não substitui o registro da forma utilizada em cada venda.

Após o Onboarding, categorias, produtos e formas de pagamento poderão ser alterados nas áreas correspondentes do sistema.

**### Etapa 6 — Aparência e conclusão**

O barbeiro poderá selecionar:

\- Tema Claro;

\- Tema Escuro;

\- Padrão do Sistema.

A escolha pertence ao usuário e deverá permanecer salva para os acessos seguintes.

Antes de concluir, a interface poderá apresentar um resumo das principais configurações preenchidas.

Ao finalizar o Onboarding, o usuário será encaminhado ao Dashboard.

Cada etapa deverá ser salva individualmente para permitir retomada caso o usuário interrompa o processo.

As informações públicas configuradas poderão posteriormente ser utilizadas na Vitrine Digital.

\---

**## 6.5 Dashboard**

O Dashboard será a principal visão resumida da operação.

Poderá apresentar:

\- faturamento;

\- entradas;

\- saídas;

\- resultado estimado;

\- quantidade de serviços;

\- produtos vendidos;

\- alertas de estoque;

\- gráficos resumidos.

O usuário poderá alterar o período analisado.

\---

**## 6.6 Serviços**

Na área de Serviços, o barbeiro poderá:

\- cadastrar;

\- informar descrição;

\- definir preço;

\- informar custo direto estimado;

\- ativar;

\- inativar;

\- definir exibição pública;

\- editar.

Serviços ativos poderão ser utilizados no PDV.

\---

**## 6.7 Produtos**

Na área de Produtos, o usuário poderá administrar itens vendidos pela barbearia.

Entre as informações estarão:

\- nome;

\- categoria;

\- descrição;

\- preço de custo;

\- preço de venda;

\- estoque;

\- estoque mínimo;

\- imagem;

\- status;

\- visibilidade pública.

\---

**## 6.8 Categorias de produtos**

O sistema permitirá organizar produtos através de categorias.

Poderão existir sugestões como:

\- Bebida;

\- Pomada;

\- Shampoo;

\- Cera;

\- Óleo/Balm para barba;

\- Acessórios.

O barbeiro também poderá criar categorias próprias.

\---

**## 6.9 Estoque**

Na área de Estoque, será possível acompanhar a quantidade disponível de cada produto.

O estoque será alterado através de:

\- reposição;

\- venda;

\- ajuste;

\- perda;

\- reversão de venda.

Quando houver estoque mínimo configurado, o sistema poderá gerar alerta de estoque baixo.

\---

**## 6.10 Reposição de estoque**

Ao receber novas unidades, o barbeiro poderá registrar uma reposição.

Informações:

\- produto;

\- quantidade;

\- custo unitário;

\- observação, quando necessária.

O sistema poderá calcular o valor total da reposição como referência operacional quando houver custo informado.

A reposição:

\- aumentará o estoque;

\- poderá atualizar o custo atual do produto para vendas futuras;

\- registrará movimentação de estoque;

\- **não criará despesa ou saída financeira automaticamente**.

Quando a compra precisar aparecer no Financeiro, o barbeiro deverá registrar uma despesa separada. Os dois registros podem possuir referência opcional entre si, mas permanecem independentes.

\---

**## 6.11 Ajuste e perda de estoque**

O ajuste poderá ser utilizado quando o saldo registrado for diferente da quantidade física real.

A perda poderá ser utilizada para registrar produtos:

\- danificados;

\- vencidos;

\- quebrados;

\- desaparecidos.

A perda:

\- reduz o estoque;

\- gera movimentação;

\- afeta o resultado estimado;

\- não cria uma nova saída de caixa.

\---

**## 6.12 PDV / Comanda**

O PDV será utilizado para registrar rapidamente uma venda.

O barbeiro poderá:

1\. localizar serviços ou produtos;

2\. adicionar itens;

3\. alterar quantidade de produtos;

4\. remover itens;

5\. acompanhar subtotal e total;

6\. informar forma de pagamento quando desejar;

7\. finalizar a venda.

Cada serviço poderá aparecer apenas uma vez na mesma comanda.

A comanda permanece temporária até a finalização.

\---

**## 6.13 Finalizar venda**

Ao finalizar uma venda, o sistema deverá:

\- validar os itens;

\- buscar preços e custos atuais;

\- calcular os valores no servidor;

\- registrar a venda;

\- registrar os itens;

\- atualizar estoque;

\- registrar movimentações;

\- preservar os valores utilizados naquele momento.

Após confirmação, a venda aparecerá nos históricos e relatórios.

\---

**## 6.14 Histórico de vendas**

O usuário poderá consultar vendas realizadas.

Informações poderão incluir:

\- data;

\- horário;

\- itens;

\- quantidades;

\- valor total;

\- forma de pagamento;

\- status.

Também será possível acessar os detalhes da venda.

\---

**## 6.15 Vendas canceladas**

O sistema deverá saber representar vendas com status `CANCELADA` no histórico.

Na versão inicial atual, **não criar ação de Cancelar venda ou Estornar venda na interface** até existir um fluxo funcional aprovado que defina confirmação, impacto em estoque, impacto financeiro e rastreabilidade.

Quando esse fluxo for aprovado futuramente, esta seção e os documentos funcionais deverão ser atualizados antes da implementação.

\---

**## 6.16 Despesas**

O barbeiro poderá registrar despesas avulsas.

Campos principais:

\- nome;

\- descrição;

\- categoria;

\- valor;

\- data.

Categorias serão predefinidas.

\---

**## 6.17 Despesas recorrentes**

O barbeiro poderá configurar despesas que costumam se repetir.

Exemplos:

\- aluguel;

\- internet;

\- água;

\- energia.

Uma despesa recorrente gera uma ocorrência prevista com status **\*\*Pendente\*\***.

A saída financeira somente será registrada quando o barbeiro selecionar:

**\*\*Marcar como paga\*\***

Também será possível:

\- alterar o valor realmente pago;

\- informar a data de pagamento;

\- ignorar apenas uma ocorrência;

\- editar a recorrência para períodos futuros;

\- desativar a recorrência.

\---

**## 6.18 Financeiro**

A área Financeira permitirá acompanhar:

\- faturamento;

\- entradas;

\- saídas;

\- custos diretos;

\- despesas;

\- perdas;

\- resultado estimado.

Os valores possuem finalidade gerencial e não substituem contabilidade profissional.

\---

**## 6.19 Relatórios**

Os relatórios poderão ser filtrados por:

\- dia;

\- semana;

\- mês;

\- ano;

\- período personalizado.

Poderão apresentar:

\- vendas;

\- faturamento;

\- entradas;

\- saídas;

\- despesas;

\- custos;

\- perdas;

\- resultado estimado;

\- produtos;

\- serviços.

O usuário poderá exportar relatórios em:

\- PDF;

\- PNG.

\---

**## 6.20 Vitrine Digital**

A Vitrine Digital será a página pública da barbearia.

Poderá conter:

\- nome;

\- nome profissional;

\- descrição;

\- logo;

\- capa;

\- serviços;

\- preços;

\- produtos;

\- Portfólio;

\- endereço;

\- horários;

\- WhatsApp;

\- Instagram;

\- atendimento a domicílio;

\- formas de pagamento aceitas.

\---

**## 6.21 Criar e publicar a Vitrine**

A Vitrine não precisa ser criada automaticamente durante o Onboarding.

Na área própria da Vitrine, o barbeiro poderá:

1\. revisar as informações;

2\. visualizar uma prévia;

3\. selecionar **\*\*Gerar URL\*\***;

4\. receber aviso caso informações opcionais não estejam cadastradas;

5\. voltar para preencher ou continuar;

6\. aguardar o estado **\*\*Criando sua Vitrine...\*\***;

7\. receber a URL pública após a criação.

Depois da criação poderá:

\- copiar a URL;

\- visualizar a Vitrine;

\- despublicar;

\- publicar novamente.

Despublicar não deverá alterar a URL existente.

\---

**## 6.22 Portfólio**

O barbeiro poderá:

\- adicionar imagem;

\- adicionar descrição opcional;

\- relacionar a um serviço;

\- publicar;

\- ocultar;

\- excluir.

Somente itens publicados aparecerão na Vitrine.

\---

**## 6.23 Assistente IA — recurso futuro**

O Assistente IA não está disponível na versão inicial.

Seu planejamento técnico e funcional está separado em `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

\---
**## 6.24 Configurações da barbearia**

O barbeiro poderá editar informações do estabelecimento, como:

\- nome;

\- descrição;

\- contatos;

\- endereço;

\- horários;

\- formas de pagamento aceitas;

\- logo;

\- capa;

\- dados públicos.

As configurações da barbearia são diferentes das configurações da conta do usuário.

\---

**## 6.25 Perfil e Conta**

Na área de Perfil e Conta, o usuário poderá:

\- visualizar e-mail;

\- alterar senha;

\- sair;

\- solicitar exclusão da conta.

O tipo da conta não poderá ser alterado pelo próprio usuário.

\---

**## 6.26 Tema do sistema**

O barbeiro poderá escolher:

\- Tema Claro;

\- Tema Escuro;

\- Padrão do Sistema.

No modo **\*\*Padrão do Sistema\*\***, a aplicação acompanhará automaticamente o tema configurado no dispositivo.

A preferência escolhida deverá permanecer salva na conta do usuário e poderá ser alterada posteriormente nas configurações da interface.

\---

**## 6.27 Exclusão da conta**

O sistema deverá disponibilizar um fluxo de exclusão da conta.

Antes da confirmação, deverá informar as consequências.

A definição final de:

\- exclusão;

\- retenção;

\- anonimização;

\- preservação de históricos;

deverá permanecer alinhada à Política de Privacidade, Termos de Uso e revisão jurídica.

\---

**## 6.28 Operador do SaaS**

O Operador do SaaS utiliza o mesmo Login do sistema.

A conta deverá possuir:

*\`tipo = ADMIN\`*

No sistema inicial, a permissão será atribuída manualmente no banco de dados.

Após o Login, o operador será direcionado ao Painel Administrativo.

Poderá executar operações autorizadas, como:

\- localizar barbearias;

\- visualizar informações necessárias para suporte;

\- consultar planos, validades e pagamentos de assinatura;

\- confirmar pagamento, aplicar cortesia ou cancelar assinatura;

\- suspender ou reativar contas;


O operador não deverá possuir acesso irrestrito à operação interna da barbearia.

\---

**## 6.29 Funcionamento em caso de erro ou indisponibilidade**

Quando uma operação não puder ser concluída, o sistema deverá apresentar mensagens simples e compreensíveis.

Em caso de perda de conexão:

\- operações críticas de gravação poderão ser bloqueadas;

\- o PDV não deverá registrar venda offline.

O sistema também poderá apresentar uma página de manutenção quando necessário.

\---

**# 7. Modelo de negócio**

A proposta aprovada possui três níveis comerciais:

**## Plano Grátis — R$ 0,00**

Mantém Vitrine Digital, Portfólio, serviços e produtos para divulgação. Dados de recursos pagos usados anteriormente permanecem em somente leitura.

**## Plano Normal — R$ 49,90 por mês**

Inclui o núcleo completo de gestão da versão inicial: Dashboard, PDV, estoque, financeiro, relatórios, exportações, Vitrine Digital, Portfólio e configurações.

**## Assistente IA — planejamento futuro**

Não existe plano comercial de IA na versão inicial. A versão atual trabalha somente com os planos Grátis e Normal.

Qualquer plano futuro associado à IA deverá ser definido quando o recurso voltar ao escopo, seguindo `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

A cobrança inicial do Plano Normal é feita por Pix com confirmação manual. As regras completas de validade, cancelamento e cortesia estão consolidadas na seção de decisões aprovadas deste documento.

\---
**# 8. Plano de testes**

Antes do lançamento, o sistema deverá ser validado através de diferentes tipos de testes.

Entre eles:

\- testes de regras financeiras;

\- testes do PDV;

\- testes de estoque;

\- testes de despesas recorrentes;

\- testes de autenticação;

\- testes de autorização *\`BARBEIRO/ADMIN\`*;

\- testes de banco e RLS;

\- testes de integração;

\- testes de componentes;

\- testes E2E;

\- testes de responsividade;

\- testes de usabilidade;

\- testes de acessibilidade;

\- testes de desempenho;

\- testes de segurança;


\- testes da Vitrine;

\- testes de exportação de relatórios.

Os testes deverão registrar:

\- o que foi testado;

\- quando foi testado;

\- ferramenta utilizada;

\- resultado esperado;

\- resultado obtido;

\- status;

\- falhas encontradas;

\- correções realizadas quando aplicável.

O detalhamento completo pertence ao documento **\*\*Plano de Testes\*\***.

\---

**# 9. Apêndices**

**## APÊNDICE A — Política de Proteção de Dados Pessoais e Privacidade**

*> Este apêndice apresenta apenas a estrutura conceitual. A Política de Privacidade completa será mantida em documento próprio e deverá passar por revisão antes do lançamento comercial.*

**### 1. Objetivo**

Apresentar diretrizes para tratamento de dados pessoais em conformidade com a legislação aplicável e orientar medidas voltadas à proteção da privacidade.

**### 2. Conteúdo**

Organizar as regras relacionadas à coleta, utilização, armazenamento, compartilhamento, segurança e eliminação dos dados tratados pelo Estilo e Gestão.

**### 3. Abrangência**

Aplicar as diretrizes aos dados tratados durante:

\- cadastro;

\- autenticação;

\- uso administrativo;

\- Vitrine;


\- suporte;

\- operação do SaaS;

\- demais funcionalidades que utilizem dados pessoais.

**### 4. Base regulamentar**

Considerar principalmente:

\- Lei Federal nº 13.709, de 14 de agosto de 2018 — Lei Geral de Proteção de Dados Pessoais;

\- Lei Federal nº 13.853, de 8 de julho de 2019;

\- regulamentações e orientações publicadas pela Autoridade Nacional de Proteção de Dados.

**### 5. Definições**

Definir conceitos utilizados, como:

\- dado pessoal;

\- titular;

\- tratamento;

\- controlador;

\- operador;

\- consentimento;

\- anonimização;

\- incidente de segurança.

**### 6. Âmbito de aplicação**

Definir quais pessoas, processos, fornecedores e ambientes devem seguir as diretrizes.

**### 7. Princípios de observância obrigatória**

Considerar os princípios previstos pela LGPD durante o tratamento dos dados.

**### 8. Bases legais para tratamento**

Identificar a base legal aplicável para cada finalidade antes da utilização comercial definitiva.

A base legal não deverá ser inventada apenas para preencher a documentação.

**### 9. Término do tratamento**

Definir procedimentos para encerramento de finalidade, eliminação, anonimização ou manutenção de dados quando houver justificativa legal aplicável.

**### 10. Direitos do titular**

Prever meios adequados para exercício dos direitos garantidos pela LGPD.

**### 11. Tipos de dados pessoais coletados**

O inventário final deverá considerar os dados efetivamente utilizados.

Entre os dados previstos estão:

\- nome;

\- e-mail;

\- telefone/WhatsApp;

\- informações profissionais;

\- endereço quando relacionado a pessoa física ou estabelecimento;

\- imagens publicadas;

\- informações de suporte;


O inventário deverá ser atualizado conforme a implementação real.

**### 12. Compartilhamento de dados**

Documentar quais fornecedores recebem dados para prestar serviços ao sistema.

Exemplos previstos:

\- Supabase;

\- Vercel;


Somente dados necessários deverão ser compartilhados.

**### 13. Controlador e operador**

Identificar corretamente os papéis exercidos pelo responsável pelo Estilo e Gestão e pelos fornecedores utilizados.

A definição jurídica final deverá ser revisada profissionalmente.

**### 14. Incidentes de segurança**

Definir procedimento para:

\- identificação;

\- contenção;

\- análise;

\- registro;

\- correção;

\- avaliação de comunicação necessária.

**### 15. Transferência internacional**

Verificar onde os fornecedores processam e armazenam dados e documentar eventual transferência internacional.

**### 16. Aperfeiçoamento contínuo**

Revisar periodicamente práticas de segurança, documentação e fornecedores.

**### 17. Boas práticas de segurança e governança**

Adotar medidas adequadas ao risco, incluindo:

\- controle de acesso;

\- autenticação;

\- autorização;

\- proteção de segredos;

\- atualizações;

\- backups;

\- logs seguros;

\- testes;

\- resposta a incidentes.

**### 18. Alçada**

Definir quem poderá autorizar decisões relacionadas à proteção de dados.

**### 19. Responsabilidades**

Definir responsabilidades do responsável pelo projeto, fornecedores e demais envolvidos.

**### 20. Disposições transitórias**

Registrar regras temporárias aplicáveis durante desenvolvimento, piloto ou transição para operação comercial.

**### 21. Disposições finais**

Definir revisão, atualização e aprovação da política.

\---

**# 10. Referências bibliográficas**

**## Proteção de dados e segurança**

BRASIL. **\*\*Lei nº 13.709, de 14 de agosto de 2018.\*\*** Lei Geral de Proteção de Dados Pessoais — LGPD.

BRASIL. **\*\*Lei nº 13.853, de 8 de julho de 2019.\*\*** Altera a Lei nº 13.709/2018 e dispõe sobre a Autoridade Nacional de Proteção de Dados.

AUTORIDADE NACIONAL DE PROTEÇÃO DE DADOS — ANPD. **\*\*Guia Orientativo sobre Segurança da Informação para Agentes de Tratamento de Pequeno Porte.\*\***

AUTORIDADE NACIONAL DE PROTEÇÃO DE DADOS — ANPD. **\*\*Guia Orientativo para Definições dos Agentes de Tratamento de Dados Pessoais e do Encarregado.\*\***

\---

**# 11. Conclusão**

O Estilo e Gestão foi planejado para resolver necessidades práticas de pequenas barbearias sem transformar o sistema em um software excessivamente complexo.

A proposta central combina gestão e divulgação:

\- a área privada permite ao barbeiro administrar a operação;

\- a Vitrine Digital apresenta a barbearia ao público;


\- o Painel Administrativo permite ao Operador do SaaS executar apenas as funções necessárias para administração do serviço.

O cadastro público deverá criar usuários *\`BARBEIRO\`* por padrão.

Contas *\`ADMIN\`* serão atribuídas internamente e terão acesso a uma área separada, com autorização validada pelo sistema.

O desenvolvimento deverá permanecer alinhado às necessidades reais do público-alvo, à documentação aprovada e às funcionalidades definidas, evitando a inclusão antecipada de recursos sem validação.

---

# Decisões comerciais e operacionais aprovadas

Esta seção consolida as decisões dos oito blocos concluídos em 18/09/2026. Em caso de conflito com uma regra anterior deste documento, prevalece esta seção e os documentos técnicos específicos.

## Planos

O sistema possui dois planos na versão inicial:

| Plano | Preço mensal | Escopo atual |
| --- | ---: | --- |
| Grátis | R$ 0,00 | Vitrine Digital, Portfólio, serviços e produtos para divulgação; consulta aos dados históricos pagos em somente leitura |
| Normal | R$ 49,90 | Todos os recursos de gestão da versão inicial: Dashboard, PDV, vendas, estoque, financeiro, relatórios, exportações e configurações |

Os recursos são organizados em camadas e verificados centralmente no código. O Plano Grátis permanece funcional para divulgação. Recursos pagos continuam visíveis, mas apresentam um componente reutilizável explicando o bloqueio e o benefício do Plano Normal.

Ao terminar um período pago, a conta volta imediatamente ao Grátis. Os dados não são apagados: as áreas pagas e o histórico permanecem consultáveis em somente leitura, sem criação, edição, exclusão, movimentação ou exportação.

## Assinaturas e pagamentos

A cobrança inicial é manual por Pix. Um pagamento real é confirmado pelo ADMIN com data do pagamento e valor efetivamente recebido. A validade utiliza a data real do pagamento, mesmo que a confirmação administrativa aconteça depois.

Cada pagamento libera um ciclo mensal. O sistema mantém o dia-base original; quando esse dia não existe no mês seguinte, utiliza o último dia do mês e volta ao dia-base assim que possível. Pagamentos antecipados estendem a validade sem eliminar dias restantes. Pagamentos após o vencimento iniciam um novo ciclo na data do novo pagamento.

Não existe tolerância após o vencimento. Cancelar uma assinatura paga mantém os recursos até o final do período e pode ser desfeito antes dessa data. No vencimento, a conta retorna ao Grátis. Cancelar assinatura não exclui a conta.

O primeiro barbeiro recebe um ciclo mensal do Plano Normal como cortesia administrativa. A cortesia começa quando o sistema pronto é enviado para uso real, não gera pagamento fictício e termina na data correspondente do mês seguinte.

## Identificação da barbearia

Cada barbearia possui um identificador técnico interno e um código amigável imutável no formato `BAR-XXXXXX`, gerado pelo servidor com letras e números não ambíguos. O código é único, não é público, pode ser copiado pelo barbeiro e pode ser pesquisado pelo ADMIN.

Um código utilizado nunca será atribuído a outra barbearia. Após o fim da retenção de uma conta excluída, poderá permanecer somente uma impressão técnica anônima e não reversível para impedir reutilização.

## Administração do SaaS

O painel ADMIN possui inicialmente Dashboard e Barbearias. O Dashboard mostra quantidade de barbearias por plano, receita de assinaturas recebida no mês e próximos vencimentos. Ele nunca usa dados privados de faturamento, despesas, estoque ou relatórios das barbearias.

A lista de barbearias permite pesquisa por nome ou código e filtros por plano e status. A tela de detalhes concentra dados administrativos, pagamentos, assinatura e ações como confirmação de pagamento, cancelamento, cortesia, suspensão e reativação.

Plano e status são conceitos independentes. A conta pode estar `ATIVA` ou `SUSPENSA` em qualquer plano. A suspensão é administrativa, preserva dados, bloqueia a área autenticada e retira a Vitrine do ar até a reativação.

O papel do usuário vem do perfil (`BARBEIRO` ou `ADMIN`), nunca do endereço de e-mail. O cadastro público sempre cria `BARBEIRO`; a promoção para `ADMIN` é interna e protegida.

## Exclusão e retenção

Excluir conta é diferente de cancelar assinatura e diferente de suspender conta. O barbeiro inicia a exclusão em `Sua conta → Zona de perigo`, informa a senha atual e digita exatamente `EXCLUIR MINHA CONTA`. A exclusão é imediata e irreversível, sem período de recuperação.

São removidos do sistema ativo o usuário de autenticação e todos os dados operacionais da barbearia, incluindo perfil, serviços, produtos, categorias, estoque, vendas, despesas, financeiro, Portfólio, Vitrine, configurações, assinatura ativa e arquivos do Storage. A Vitrine sai do ar imediatamente.

Se ainda existir período pago, o acesso termina no momento da exclusão e não há reembolso automático, salvo direito legal aplicável. A interface deverá avisar que cancelar a assinatura é a alternativa para continuar usando o período restante.

Pagamentos reais e ações administrativas essenciais podem ser mantidos por cinco anos após a exclusão, em estrutura separada e sem dados operacionais. A identificação retida limita-se a código da barbearia, nome e e-mail, além dos campos indispensáveis dos pagamentos e ações. Ao fim de cinco anos, esses registros identificáveis são apagados completamente, salvo obrigação legal superveniente que exija prazo maior.

Dados apagados do ambiente ativo podem permanecer temporariamente em backups automáticos até a expiração normal desses backups. Eles não poderão ser usados intencionalmente para reconstruir uma conta excluída.

O ADMIN não possui botão comum de exclusão. Uma exclusão administrativa somente pode ocorrer em situação excepcional, com justificativa e confirmação reforçada no formato `EXCLUIR BAR-XXXXXX`. Em fraude, abuso ou conteúdo ilegal, a regra é suspender primeiro, preservar apenas a evidência necessária e excluir após análise.

Contas excluídas desaparecem da lista normal do ADMIN e não podem ser restauradas. Registros mínimos retidos ficam fora dessa lista, com consulta técnica restrita e registrada somente quando necessária.

## Assistente IA

O Assistente IA é um recurso futuro e não faz parte da versão inicial do sistema.

Nenhuma funcionalidade, tabela, integração, plano comercial ou configuração relacionada à IA deverá ser implementada nesta etapa.

A arquitetura deverá permanecer preparada para inclusão futura por meio de novas migrations e novos componentes, conforme `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.
## Preparação para o primeiro uso real

O primeiro barbeiro participa de um uso assistido com dados reais. Todo o núcleo do Plano Normal deve estar funcional antes dessa etapa. Recursos futuros, incluindo o Assistente IA, não fazem parte dos requisitos para o primeiro uso real. Pequenos defeitos visuais podem ser corrigidos durante o acompanhamento, mas não podem existir falhas críticas, operacionais, de segurança, isolamento, cálculo ou risco de perda de dados.

Antes do primeiro uso deverão existir Termos de Uso e Política de Privacidade publicados, com aceite registrado, backup automático diário e teste de restauração do banco e dos arquivos. O suporte inicial será feito pelo WhatsApp e cada problema será registrado internamente.

O primeiro uso poderá ocorrer no endereço temporário da Vercel. Antes da divulgação pública, deverão estar concluídos: validação técnica, validação pelo primeiro barbeiro, testes de assinaturas e cancelamentos, revisão jurídica, domínio próprio com HTTPS e ausência de falhas críticas ou operacionais pendentes.

Em falha crítica durante o uso real, o sistema entra em manutenção, o barbeiro é avisado pelo WhatsApp e o acesso só é reaberto após correção e validação.
