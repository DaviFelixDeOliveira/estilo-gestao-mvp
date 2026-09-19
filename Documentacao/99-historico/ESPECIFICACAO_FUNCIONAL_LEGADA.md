> [!WARNING]
> **DOCUMENTO ARQUIVADO.** Este arquivo foi substituído e não deve orientar implementação, prototipação ou testes. Consulte a documentação atual e o `README.md` desta pasta.

# Especificação Funcional do Sistema

**Status:** Base detalhada para prototipação e implementação.  
**Regra:** qualquer comportamento ainda marcado como `DECISÃO PENDENTE` deve ser resolvido antes da implementação daquela parte.

---

# 1. Autenticação

## 1.1 Tela: Login

### Dados usados

- e-mail;
- senha.

### Campos

- E-mail — obrigatório.
- Senha — obrigatória.

### Ações

- Entrar.
- Criar conta.
- Esqueci minha senha.

### Validações

- e-mail em formato válido;
- senha não vazia e conforme os requisitos definidos para autenticação;
- mensagens de autenticação não devem revelar informações desnecessárias sobre contas existentes.

### Loading

- botão **Entrar** desabilitado;
- indicador de processamento;
- impedir múltiplos envios.

### Erros

- credenciais inválidas;
- conta suspensa;
- conexão indisponível;
- erro inesperado.

### Sucesso

- redirecionar ao Dashboard;
- se o onboarding obrigatório ainda não estiver concluído, redirecionar primeiro ao fluxo de configuração inicial.

### Estado autenticado

- usuário autenticado não deve permanecer na tela de Login.

### Modo Web

- card centralizado;
- largura limitada;
- navegação por teclado;
- links de criar conta e recuperar senha claramente identificados.

### Modo Mobile

- formulário em coluna única;
- campos e botões com área confortável para toque;
- teclado adequado ao tipo e-mail;
- evitar rolagem desnecessária.

---

## 1.2 Tela: Criar Conta

### Objetivo

Criar a conta administrativa inicial da barbearia.

### Dados usados

- nome do responsável;
- e-mail;
- senha;
- confirmação de senha.

A senha é gerenciada pelo Supabase Auth e não deve ser armazenada em tabela própria da aplicação.

### Campos

- Nome — obrigatório.
- E-mail — obrigatório.
- Senha — obrigatória.
- Confirmar senha — obrigatória.

### Ações

- Criar conta.
- Voltar para Entrar.

### Validações

- nome não vazio;
- e-mail em formato válido;
- senha conforme os requisitos definidos para autenticação;
- confirmação igual à senha;
- impedir múltiplos envios.

### Fluxo principal

1. Usuário acessa **Criar conta**.
2. Preenche os campos.
3. Frontend realiza validações para feedback imediato.
4. A solicitação é enviada ao Supabase Auth.
5. A conta de autenticação é criada.
6. Caso a confirmação de e-mail esteja habilitada, o usuário recebe as instruções necessárias.
7. Após autenticação válida, o sistema cria/vincula de forma controlada o perfil interno e a barbearia.
8. O usuário é direcionado ao onboarding inicial.

### Segurança

- o navegador não deve decidir sozinho qual `barbearia_id` será vinculado;
- criação de perfil/barbearia deve ser idempotente;
- não armazenar senha fora do serviço de autenticação.

### Erros

- e-mail inválido;
- e-mail já utilizado, quando apropriado informar;
- senha fora dos requisitos;
- confirmação diferente;
- falha de conexão;
- erro ao criar conta;
- conta criada no Auth, mas falha na criação do perfil/barbearia.

Caso o Auth seja criado mas a configuração interna falhe, uma nova tentativa não deve criar duas barbearias.

### Sucesso

- informar que a conta foi criada;
- encaminhar para confirmação de e-mail quando aplicável;
- continuar para onboarding após autenticação válida.

### Modo Web

- formulário centralizado;
- requisitos da senha próximos ao campo.

### Modo Mobile

- formulário em coluna única;
- teclado adequado;
- botão principal acessível;
- não usar modal estreito para o cadastro completo.

---

## 1.3 Onboarding Inicial

### Objetivo

Coletar e configurar as informações necessárias para o barbeiro começar a utilizar o sistema.

O onboarding deve ser dividido em etapas curtas, evitando um formulário enorme.

### Dados iniciais definidos

- nome da marca/barbearia;
- WhatsApp comercial;
- serviços;
- produtos, quando a barbearia comercializar produtos/bebidas;
- endereço completo:
  - CEP;
  - rua/logradouro;
  - número;
  - bairro;
  - cidade;
  - estado;
  - complemento opcional;
- horários de funcionamento.

Podem ser preenchidos posteriormente:

- nome profissional, quando diferente;
- descrição/Sobre;
- Portfólio;
- logo/capa;
- Instagram;
- configuração do Assistente IA;
- outras informações públicas.

### Fluxo sugerido

1. Usuário entra pela primeira vez.
2. Sistema detecta onboarding pendente.
3. Etapa 1 — Dados da barbearia.
4. Etapa 2 — Endereço e horários.
5. Etapa 3 — Serviços.
6. Etapa 4 — Produtos/bebidas, com possibilidade de indicar que não vende produtos.
7. Usuário conclui.
8. Backend valida e salva cada etapa de forma segura.
9. Sistema marca onboarding como concluído.
10. Redireciona ao Dashboard.

### Abandono

- progresso já salvo não deve ser perdido;
- no próximo login, o sistema retoma a etapa pendente.

### Erros

- dados obrigatórios ausentes;
- CEP/endereço inválido quando houver validação;
- preço inválido;
- falha de conexão;
- falha ao salvar uma etapa.

### Modo Mobile

- uma etapa por tela;
- botões **Continuar** e **Voltar**;
- progresso visível;
- evitar tabelas.

### Modo Web

- wizard/etapas;
- resumo lateral opcional;
- manter sequência equivalente ao mobile.

---

## 1.4 Tela: Esqueci Minha Senha

### Objetivo

Permitir recuperação da conta utilizando um código de uso único enviado ao e-mail.

### Dados usados

- e-mail.

### Campos

- E-mail — obrigatório.

### Ações

- Enviar código.
- Voltar para Entrar.

### Validações

- e-mail em formato válido;
- impedir solicitações repetidas em curto intervalo;
- aplicar limites do serviço de autenticação.

### Fluxo principal

1. Usuário seleciona **Esqueci minha senha**.
2. Informa o e-mail.
3. Sistema solicita ao Supabase Auth o envio da recuperação.
4. O template de recuperação é configurado para apresentar o OTP de 6 dígitos.
5. Interface exibe resposta neutra.
6. Usuário é encaminhado para a tela **Verificar código**.

### Mensagem após solicitação

> Se existir uma conta associada a este e-mail, enviaremos um código de recuperação.

Isso evita revelar se determinado endereço possui conta.

### Loading

- botão desabilitado durante a solicitação;
- indicador de processamento;
- impedir múltiplos envios.

### Erros

- e-mail inválido;
- conexão indisponível;
- limite temporário de solicitações;
- erro inesperado.

---

## 1.5 Tela: Verificar Código de Recuperação

### Dados usados

- e-mail da etapa anterior;
- código OTP de 6 dígitos.

### Campos

- Código — obrigatório, 6 dígitos.

### Ações

- Verificar código.
- Reenviar código.
- Voltar para Login.

### Fluxo

1. Usuário informa o código recebido.
2. Sistema envia o código para verificação como OTP de recuperação.
3. Se válido, o usuário recebe o contexto/sessão necessário para redefinir a senha.
4. Sistema direciona para **Redefinir Senha**.

### Validações

- exatamente 6 dígitos;
- código não vazio;
- código correspondente ao fluxo de recuperação;
- impedir múltiplas tentativas abusivas.

### Erros

- código incorreto;
- código expirado;
- código já utilizado;
- limite de tentativas;
- conexão indisponível;
- erro inesperado.

### Código expirado

Disponibilizar **Reenviar código**.

---

## 1.6 Tela: Redefinir Senha

### Pré-condição

O código de recuperação foi validado e existe contexto autorizado para alteração da senha.

### Campos

- Nova senha — obrigatória.
- Confirmar nova senha — obrigatória.

### Ações

- Salvar nova senha.

### Validações

- nova senha conforme requisitos mínimos;
- confirmação igual à nova senha;
- contexto de recuperação válido.

### Fluxo

1. Usuário informa a nova senha.
2. Sistema valida os campos.
3. Supabase Auth atualiza a credencial.
4. Sistema informa sucesso.
5. Usuário é direcionado ao Login ou mantém a sessão conforme o comportamento seguro adotado na implementação.

### Erros

- senhas não coincidem;
- senha inválida;
- contexto de recuperação inválido/expirado;
- conexão indisponível;
- erro inesperado.

---

## 1.7 Confirmação de E-mail

### Aplicação

Somente quando a confirmação de e-mail estiver habilitada.

### Fluxo

1. Conta é criada.
2. Usuário recebe o e-mail de confirmação.
3. Realiza a confirmação pelo fluxo configurado no Auth.
4. Sistema valida.
5. Informa sucesso.
6. Usuário continua para Login/onboarding.

### Erros

- confirmação inválida;
- confirmação expirada;
- conta já confirmada.

### Ação

Permitir reenvio quando necessário, respeitando proteção contra abuso.

---

## 1.8 Logout

### Fluxo

1. Usuário seleciona **Sair**.
2. Sistema encerra a sessão.
3. Dados administrativos em memória são descartados quando aplicável.
4. Usuário é redirecionado ao Login.

### Segurança

Após logout, o botão voltar do navegador não deve permitir carregar ou alterar dados privados sem nova sessão válida.

---

## 1.9 Sessão Expirada

Quando uma operação identificar sessão inválida/expirada:

- interromper a operação;
- não realizar alteração parcialmente;
- informar o usuário;
- direcionar para nova autenticação quando necessário.

### Mensagem sugerida

> Sua sessão expirou. Entre novamente para continuar.

---

# 2. Dashboard

## Objetivo

Mostrar a situação da barbearia sem obrigar o barbeiro a interpretar relatórios e gráficos complexos.

### Dados usados

- vendas válidas;
- itens vendidos;
- despesas;
- custos congelados;
- movimentações de estoque;
- período selecionado.

### Filtros

- Hoje;
- Semana;
- Mês;
- Ano;
- período personalizado.

### Indicadores

- Faturamento.
- Entradas de caixa.
- Saídas de caixa.
- Resultado estimado.
- Faturamento com serviços.
- Faturamento com bebidas.
- Faturamento com demais produtos.
- Estoque baixo.

### Estado vazio

> Nenhuma venda registrada neste período.

Não exibir gráfico vazio como se existisse informação.

### Erros

- falha ao carregar Dashboard;
- oferecer ação de tentar novamente.

### Mobile

- cards em uma coluna ou grade compacta;
- informações prioritárias no topo;
- tabelas substituídas por listas/cards quando necessário.

### Web

- cards em grade;
- espaço para gráficos úteis, sem obrigatoriedade.

---

# 3. Serviços

## Tela: Lista de Serviços

### Exibe

- nome;
- preço;
- custo estimado de insumos, se utilizado;
- ativo/inativo;
- visível na Vitrine.

### Ações

- Novo serviço;
- Editar;
- Ativar/Inativar;
- Configurar visibilidade pública.

### Estado vazio

> Cadastre seu primeiro serviço para começar a registrar atendimentos.

## Tela/Modal: Novo ou Editar Serviço

### Campos

- Nome — obrigatório.
- Descrição — opcional.
- Preço — obrigatório, maior ou igual a zero conforme regra comercial.
- Custo estimado de insumos — opcional, maior ou igual a zero.
- Ativo — padrão sim.
- Exibir na Vitrine — configurável.

### Custo estimado de insumos

Representa uma estimativa dos materiais consumidos diretamente na realização do serviço.

Exemplos:

- lâmina descartável;
- creme;
- produto aplicado;
- material descartável.

Não representa:

- salário;
- aluguel;
- energia;
- internet;
- despesas gerais.

Se vazio, o custo direto estimado do serviço será considerado R$ 0 naquele cálculo.

### Validações

- nome não vazio;
- valores monetários válidos;
- custo não negativo.

### Observação

Não impor `preço > custo` como regra universal. Pode existir promoção ou venda abaixo do custo.

### Exclusão

Preferir **inativação** para serviços já usados em vendas.

Se nunca utilizado, exclusão física pode ser permitida.

---

# 4. Produtos e Bebidas

## Tela: Produtos

### Exibe

- nome;
- categoria;
- estoque atual;
- estoque mínimo;
- custo;
- preço de venda;
- status;
- visibilidade pública.

## Categorias

O sistema deverá apresentar categorias sugeridas, por exemplo:

- Bebida;
- Pomada;
- Shampoo;
- Cera;
- Óleo/Balm para barba;
- Acessórios;
- Outros.

As sugestões existem para acelerar o cadastro e **não precisam ser gravadas previamente em todas as barbearias**.

Quando uma categoria sugerida for usada pela primeira vez, ela poderá ser cadastrada para aquela barbearia.

O barbeiro também poderá criar uma categoria própria.

### Ação: Criar categoria

Campos:

- Nome — obrigatório.

Validações:

- não permitir nome vazio;
- evitar duplicidade evidente dentro da mesma barbearia;
- normalizar espaços para comparação;
- categoria já utilizada deve preferencialmente ser inativada, não apagada.

### Exemplos

- Coca-Cola → Bebida.
- Pomada Matte → Pomada.
- Boné → Acessórios.

## Cadastro/Edição de Produto

### Campos

- Nome — obrigatório.
- Categoria — obrigatória.
- Descrição — opcional.
- Quantidade inicial — obrigatória na criação.
- Estoque mínimo — opcional.
- Preço de custo — obrigatório.
- Preço de venda — obrigatório.
- Imagem — opcional.
- Ativo.
- Exibir na Vitrine.

### Estoque mínimo

Representa o limite para exibir aviso de reposição.

Regra:

`estoque atual <= estoque mínimo → estoque baixo`

Exemplo:

- estoque atual 6 / mínimo 5 → normal;
- estoque atual 5 / mínimo 5 → estoque baixo;
- estoque atual 2 / mínimo 5 → estoque baixo;
- estoque atual 0 / mínimo 5 → sem estoque.

Se o campo estiver vazio, o sistema não gera alerta de estoque mínimo para o produto.

### Validações

- estoque não negativo;
- estoque mínimo não negativo;
- custo não negativo;
- venda não negativa;
- tipos/tamanho de imagem conforme documento de segurança.

---

# 5. Estoque

## Objetivo

Manter rastreabilidade sem criar um ERP de estoque.

## Tipos de movimentação

- REPOSICAO;
- VENDA;
- AJUSTE;
- PERDA;
- REVERSAO_VENDA.

## Reposição

### Dados

- produto;
- quantidade;
- custo unitário ou custo total;
- data;
- observação opcional.

### Regra

Reposição aumenta o estoque.

### Custo

**Decisão adotada para o MVP:** o produto terá um custo unitário atual. Ao registrar uma reposição, o barbeiro poderá atualizar esse custo para as vendas futuras.

Não implementar custo médio ponderado no MVP.

## Ajuste manual

O usuário informa a quantidade física correta e um motivo.

O sistema registra:

- saldo anterior;
- saldo posterior;
- diferença;
- motivo.

## Venda

Produto vendido reduz estoque automaticamente.

## Estoque insuficiente

Impedir finalização quando quantidade solicitada exceder estoque disponível.

## Cancelamento

Venda cancelada deve restaurar apenas os itens de produto que tiveram baixa.

---

# 6. PDV / Comanda Rápida

## Objetivo

Registrar atendimento/venda com o menor número de interações possível.

## Tela

### Elementos

- busca de itens;
- atalhos de serviços;
- atalhos de produtos/bebidas;
- comanda atual;
- quantidade;
- preço unitário;
- subtotal;
- total;
- forma de pagamento opcional;
- botão **Finalizar venda**.

### Fluxo

1. Selecionar serviço(s).
2. Selecionar produto(s)/bebida(s), se houver.
3. Ajustar quantidade.
4. Conferir total.
5. Informar forma de pagamento, se desejado.
6. Confirmar.
7. Backend valida tudo novamente.
8. Venda e itens são gravados.
9. Estoque é baixado.
10. Movimentações são registradas.
11. Dados passam a compor os relatórios.
12. UI exibe sucesso.

### Fórmulas

`subtotal = quantidade × preço_unitário`

`total_venda = soma(subtotais)`

### Snapshot financeiro

Cada item da venda armazena:

- nome apresentado no momento;
- preço unitário;
- custo unitário;
- quantidade.

Alterações futuras no cadastro não mudam o histórico.

### Formas de pagamento iniciais

- PIX;
- DINHEIRO;
- DÉBITO;
- CRÉDITO;
- OUTRO.

Como o campo foi definido como opcional, a venda poderá ser finalizada sem informar forma de pagamento.

### Loading

Ao finalizar:

- bloquear novo clique;
- exibir processamento;
- não limpar comanda antes da confirmação do servidor.

### Sucesso

- mensagem de venda registrada;
- limpar comanda;
- permitir iniciar próxima venda.

### Falhas

- estoque insuficiente;
- item inativo;
- item não pertence à barbearia;
- valor inválido;
- sessão expirada;
- conexão;
- erro interno.

A venda não pode ficar registrada pela metade.

### Mobile

- bottom sheet ou resumo fixo da comanda;
- botões grandes;
- poucos níveis de navegação;
- total visível quando possível.

### Web

- catálogo e comanda lado a lado;
- atalhos por teclado podem ser adicionados futuramente.

---

# 7. Histórico de Vendas

## Status da venda

No MVP existem somente dois status persistidos:

### CONCLUÍDA

Venda confirmada e válida.

- participa do faturamento;
- participa dos relatórios;
- altera estoque quando contém produtos.

### CANCELADA

Venda que havia sido concluída e posteriormente foi cancelada.

- permanece no histórico;
- deixa de participar dos agregados de vendas válidas;
- restaura estoque quando necessário;
- gera movimentação de reversão.

### Comanda em andamento

Uma comanda ainda sendo montada no PDV não é persistida como `PENDENTE`.

Ela existe apenas como estado temporário da interface até a finalização.

## Lista

- data/hora;
- total;
- forma de pagamento, se informada;
- status.

## Detalhe

- itens;
- quantidades;
- preços;
- custos;
- total;
- data;
- forma de pagamento, se informada;
- observação, se existir.

## Cancelamento

Ao cancelar:

- marcar status `CANCELADA`;
- reverter estoque de produtos;
- registrar movimentação de reversão;
- excluir do cálculo de vendas válidas;
- manter histórico.

## Confirmação

Cancelamento exige modal de confirmação.

---

# 8. Despesas

## Lista

- data;
- nome;
- descrição opcional;
- categoria;
- valor.

## Cadastro

- Nome — obrigatório.
- Descrição/observação — opcional.
- Valor — obrigatório.
- Data — obrigatória.
- Categoria — obrigatória.

## Categorias iniciais sugeridas

- ALUGUEL;
- AGUA;
- ENERGIA;
- INTERNET;
- EQUIPAMENTOS;
- MANUTENCAO;
- COMPRA_ESTOQUE;
- OUTROS.

As categorias são sugestões operacionais e podem ser ajustadas posteriormente.

## Compra de estoque

Pode ser registrada a partir do fluxo de reposição para evitar dupla digitação.

### Regra financeira

`COMPRA_ESTOQUE` entra no **fluxo de caixa** como saída.

No indicador de **resultado estimado por vendas**, o custo de mercadoria já é considerado através do custo congelado dos produtos vendidos. Portanto, a mesma compra não deve ser abatida duas vezes no mesmo indicador.

---

# 9. Relatórios

## Períodos

- diário;
- semanal;
- mensal;
- anual;
- personalizado.

## Informações

- faturamento;
- entradas gerais;
- entradas separadas por origem/categoria;
- saídas gerais;
- saídas separadas por categoria;
- resultado estimado;
- serviços;
- bebidas;
- demais produtos;
- despesas por categoria.

## Observação

Os relatórios são gerenciais. Não prometer equivalência a balanço, DRE oficial ou escrituração contábil.

## Exportação

- exportar relatório em PDF;
- exportação como imagem poderá ser disponibilizada quando fizer sentido no layout.

---

# 10. Configurações da Barbearia

### Campos propostos

- nome da marca;
- nome do profissional opcional;
- descrição;
- telefone;
- WhatsApp;
- Instagram;
- atende a domicílio;
- endereço:
  - CEP;
  - rua/logradouro;
  - número;
  - bairro;
  - cidade;
  - estado;
  - complemento;
- horários;
- logo;
- capa opcional.

### Validações

- links e telefone validados/sanitizados;
- CEP/endereço conforme regras de UI definidas;
- campos públicos claramente identificados.

---

# 11. Vitrine Digital

## O que é

A **Vitrine Digital** é o mini-site público completo da barbearia.

Ela não é sinônimo de Portfólio.

Pode reunir:

- identidade da barbearia;
- Sobre;
- serviços e preços;
- produtos/bebidas selecionados;
- Portfólio;
- endereço/localização;
- horários;
- contatos;
- informação de atendimento a domicílio;
- Assistente IA opcional.

## Aba administrativa Vitrine

A aba **Vitrine** deve permitir:

- publicar/despublicar;
- visualizar/copiar URL;
- editar informações públicas;
- controlar seções visíveis;
- acessar/gerenciar itens públicos;
- acessar o Portfólio;
- visualizar prévia;
- configurar Assistente IA quando o Plano Com IA estiver vigente e houver cota disponível.

O Portfólio pode manter tela própria porque upload e organização de imagens possuem fluxo específico.

## URL

Formato conceitual:

`/{slug}` ou `/b/{slug}`

**Decisão recomendada:** `/b/{slug}` para reduzir conflitos com rotas internas.

## Estado

- publicada;
- despublicada.

## Seções

- cabeçalho;
- Sobre;
- serviços;
- Portfólio;
- produtos/bebidas;
- localização;
- horários;
- contato;
- IA opcional.

## Visibilidade

Somente itens:

- ativos;
- marcados como públicos;
- pertencentes à barbearia da Vitrine.

## Produto sem estoque

**Decisão aprovada:** mostrar como **Indisponível** por padrão, preservando a existência do produto na Vitrine. A configuração documentada da barbearia poderá ocultá-lo quando essa opção estiver habilitada.

## Contato

Botões para:

- WhatsApp;
- Instagram;
- rota/mapa.

## Vitrine inexistente/despublicada

Exibir página amigável sem dados privados nem detalhes técnicos.

---

# 12. Portfólio

## Definição

O Portfólio é uma seção da Vitrine destinada à exposição dos trabalhos realizados.

## Lista administrativa

- miniatura;
- descrição;
- status publicado;
- data.

## Upload

- imagem obrigatória;
- descrição opcional;
- serviço relacionado opcional;
- publicar sim/não.

## Estados

- upload em andamento;
- sucesso;
- falha;
- arquivo inválido.

## Exclusão

- confirmar;
- remover referência e arquivo conforme fluxo definido;
- não deixar objetos órfãos quando evitável.

---

# 13. Assistente de IA Opcional

## Estado

- recurso liberado para a barbearia;
- ativado/desativado pelo barbeiro.

## Contexto permitido

- nome comercial;
- descrição pública;
- endereço público;
- horários;
- serviços públicos;
- preços públicos;
- produtos públicos;
- contatos públicos;
- políticas/observações públicas cadastradas;
- informação pública de atendimento a domicílio.

## Contexto proibido

- faturamento;
- despesas;
- custos;
- estoque interno;
- credenciais;
- IDs internos;
- dados de outras barbearias;
- segredos;
- logs.

## Perguntas fora do escopo

O assistente deve informar que só pode responder sobre a barbearia e encaminhar para contato quando apropriado.

## Agendamento

Não consultar disponibilidade e não inventar horários.

## Falha da IA

- ocultar detalhe técnico;
- exibir mensagem curta;
- manter botão de WhatsApp visível.

## Rate limiting

Obrigatório para endpoint público de IA.

## Registro de conversa

**Decisão aprovada:** não persistir o conteúdo das conversas no banco; mantê-lo somente durante a conversa atual.

Se futuramente houver histórico, isso altera requisitos de privacidade e deve ser documentado antes.

---

# 14. Manutenção e Conectividade

## Manutenção

Quando ativo:

- bloquear o sistema conforme configuração;
- exibir página de manutenção;
- permitir motivo público opcional;
- permitir previsão de retorno opcional;
- não expor erro, stack, fornecedor ou detalhe interno.

## Sem internet

- detectar falha;
- informar usuário;
- impedir confirmação de venda sem servidor;
- preservar a comanda em memória enquanto a página permanecer aberta quando tecnicamente possível;
- não prometer sincronização offline.

---

# 15. Mensagens padrão

As mensagens finais devem ser validadas no design/protótipo.

Princípios:

- dizer o que aconteceu;
- evitar códigos internos;
- indicar o que o usuário pode fazer.

### Sucesso

> Venda registrada com sucesso.

### Estoque

> Não há estoque suficiente para concluir esta venda.

### Conexão

> Não foi possível conectar ao sistema. Verifique sua internet e tente novamente.

### Sessão

> Sua sessão expirou. Entre novamente para continuar.

### Upload

> Não foi possível enviar esta imagem. Verifique o formato e o tamanho.

### IA

> O assistente está temporariamente indisponível. Você ainda pode falar diretamente com a barbearia pelo WhatsApp.

---

# 16. Planos, assinatura e bloqueio de recursos

## 16.1 Planos oficiais

- `GRATIS`: R$ 0,00;
- `NORMAL`: R$ 49,90 por ciclo mensal;
- `COM_IA`: R$ 79,90 por ciclo mensal.

O frontend deverá consultar um verificador central de recursos. Não espalhar comparações de plano por componentes independentes.

## 16.2 Comportamento do Grátis

O Grátis permite manter e editar a Vitrine, o Portfólio, os serviços e os produtos usados para divulgação. Produto no Grátis não possui controle de estoque e não pode ser vendido pelo PDV.

Dados criados durante plano pago permanecem visíveis em somente leitura após o vencimento. Dashboard, histórico, estoque, financeiro e relatórios podem ser consultados e filtrados, mas não alterados nem exportados.

Ao tentar uma ação paga, mostrar o componente reutilizável de recurso bloqueado com:

- nome do recurso;
- explicação curta;
- benefícios do Plano Normal;
- ação `Conhecer Plano Normal`.

## 16.3 Validade efetiva

Em cada acesso protegido, o backend deverá calcular a validade da assinatura. Se o período estiver encerrado, a autorização efetiva será `GRATIS`, mesmo antes de uma tarefa assíncrona atualizar o registro histórico.

O período começa na data real do pagamento registrada pelo ADMIN. Pagamento antecipado preserva os dias restantes. Pagamento após vencimento cria novo ciclo na data do pagamento. O dia-base mensal deve ser preservado, usando o último dia do mês quando necessário.

## 16.4 Mudanças de plano

- upgrade para Com IA: imediato e sem mudar o vencimento;
- downgrade: agendado para o vencimento e cancelável antes dele;
- cancelamento: mantém o plano até o vencimento e depois retorna ao Grátis;
- downgrade sem novo pagamento confirmado: retorna ao Grátis;
- cortesia: período administrativo, sem pagamento fictício.

# 17. Área `Minha assinatura`

A área deverá mostrar:

- plano efetivo atual;
- preço de referência;
- data de início e vencimento;
- mudança futura, quando existir;
- cancelamento agendado, quando existir;
- histórico de pagamentos reais;
- ação `Alterar plano`;
- ações para cancelar downgrade ou cancelamento agendado.

O seletor de planos poderá abrir em modal ou drawer. Não é necessária página pública separada de planos na versão inicial.

# 18. Código da barbearia

O código amigável deverá:

- seguir o formato `EG-XXXXXX`;
- ser gerado exclusivamente no servidor;
- ser único, imutável e não público;
- evitar `0`, `O`, `1` e `I`;
- possuir ação `Copiar código`;
- nunca ser reutilizado.

# 19. Painel ADMIN

## 19.1 Dashboard

Exibir total de barbearias, quantidade por plano, receita de assinaturas recebida no mês e próximos vencimentos. Não utilizar dados privados de operação das barbearias.

## 19.2 Barbearias

Exibir nome, código, plano e status. Permitir busca única por nome ou código e filtros por plano e `ATIVA`/`SUSPENSA`.

## 19.3 Detalhes

Exibir somente dados necessários à administração. Permitir confirmar pagamento, alterar plano, conceder cortesia, estender validade excepcionalmente, agendar/cancelar downgrade, cancelar assinatura, suspender e reativar.

Toda ação relevante deverá gerar histórico administrativo imutável com ator, data, estado anterior e estado posterior.

# 20. Estados globais

## Conta suspensa

Após autenticação, uma conta suspensa é direcionada para uma página exclusiva e não acessa módulos internos. A Vitrine também fica indisponível. Suspensão não apaga dados e pode ser revertida.

## Manutenção

O ADMIN pode ativar manutenção global, escolher um motivo, decidir se ele será público e informar previsão de retorno ou tempo indeterminado. ADMIN continua acessando o painel. Usuários comuns veem página sem navegação.

## Offline

Ao perder conexão, um estado global cobre integralmente o aplicativo, oferece `Tentar novamente` e retorna à tela anterior quando a conexão voltar.

## 404

URL inexistente apresenta `Página não encontrada`. Slug público inexistente usa a variação `Vitrine não encontrada`.

# 21. Exclusão de conta

O barbeiro inicia em `Sua conta → Zona de perigo`, informa a senha atual, digita `EXCLUIR MINHA CONTA` e confirma o aviso final. A ação é imediata e irreversível.

O sistema deverá apagar Auth, dados operacionais e arquivos do Storage; retirar a Vitrine do ar; invalidar sessões; e mover somente os registros mínimos permitidos para a estrutura de retenção.

Se existir período pago, informar que o acesso terminará imediatamente e que não existe reembolso automático, salvo direito legal. Sugerir cancelamento da assinatura quando o usuário desejar aproveitar o período restante.

Exclusão administrativa será excepcional e exigirá justificativa e a frase `EXCLUIR EG-XXXXXX`.

# 22. Retenção mínima

Após exclusão, conservar por cinco anos somente:

- código, nome e e-mail da barbearia excluída;
- pagamentos reais indispensáveis;
- ações administrativas essenciais.

Não conservar vendas, despesas, estoque, Portfólio, configurações, conteúdo de IA ou outros dados operacionais. Ao fim do prazo, apagar completamente os registros identificáveis. Acesso técnico aos registros retidos deverá ser restrito e auditado.

# 23. Assistente IA

- 1.000 respostas por ciclo de assinatura;
- alerta ao ADMIN em 80%;
- bloqueio em 100%, salvo extensão administrativa;
- máximo de 20 mensagens por conversa;
- proteção de taxa e abuso;
- nenhuma conversa persistida no banco;
- conteúdo mantido somente durante a conversa atual.

# 24. Aceite legal

Antes de concluir o cadastro, o usuário deverá aceitar Termos de Uso e Política de Privacidade vigentes. Registrar usuário, documento, versão e data/hora do aceite. Uma nova versão material poderá exigir novo aceite.

# 25. Critérios para uso real e divulgação

O primeiro uso real será assistido e poderá aceitar somente defeitos visuais pequenos. Falhas críticas ou operacionais bloqueiam a entrada.

Antes do uso real: núcleo Normal funcional, RLS e isolamento testados, documentos publicados, backup diário e restauração testada.

Antes da divulgação: validação técnica, validação do primeiro barbeiro, assinatura/cancelamento testados, revisão jurídica, domínio próprio com HTTPS e nenhuma falha crítica ou operacional pendente.
