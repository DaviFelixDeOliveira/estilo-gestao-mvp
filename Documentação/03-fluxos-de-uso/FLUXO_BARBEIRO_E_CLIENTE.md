# Fluxo Técnico do Barbeiro e do Cliente — Estilo e Gestão

## Objetivo

Este documento define como barbeiro, visitante e operador do SaaS interagem com o Estilo e Gestão.

Ele é uma referência técnica para desenvolvimento e deve explicar:

- dados utilizados;
- campos;
- ações;
- sequência dos fluxos;
- validações;
- estados de carregamento;
- mensagens;
- comportamento esperado do frontend;
- comportamento resumido do backend;
- diferenças entre Web e Mobile.

Detalhes de banco, RLS, segurança profunda e arquitetura pertencem aos documentos específicos e não serão repetidos aqui.

---

# 1. Regra para decisões não definidas

Quando uma regra necessária ainda não tiver sido definida, utilizar:

`DECISÃO PENDENTE`

Nunca substituir uma decisão ausente por termos vagos como:

- valor válido;
- senha segura;
- arquivo grande;
- endereço completo;
- limite adequado;
- timeout adequado.

O ponto pendente deverá ser resolvido antes da implementação daquela regra.

---

# 2. Atores

## 2.1 Barbeiro

Usuário autenticado responsável pela própria barbearia.

Pode acessar:

- Dashboard;
- PDV;
- serviços;
- categorias;
- produtos;
- estoque;
- vendas;
- despesas;
- relatórios;
- configurações;
- Vitrine;
- Portfólio;
- Assistente IA quando liberado.

---

## 2.2 Visitante

Pessoa que acessa a Vitrine sem autenticação.

Pode acessar somente informações públicas.

---

## 2.3 Operador do SaaS

Responsável por operações administrativas mínimas.

As permissões definitivas ainda dependem da implementação do painel administrativo.

---

# 3. Regras globais

## 3.1 Identificação da barbearia

Todo dado administrativo deverá estar associado à barbearia correta.

O frontend não deve possuir autoridade para decidir livremente o `barbearia_id`.

O backend deverá identificar a barbearia através da sessão autenticada.

---

## 3.2 Senha

A senha deverá:

- possuir no mínimo 8 caracteres;
- possuir pelo menos 1 letra;
- possuir pelo menos 1 número.

Não será obrigatório:

- caractere especial;
- letra maiúscula;
- combinação específica de maiúsculas e minúsculas.

A senha será gerenciada pelo Supabase Auth e não deverá ser armazenada em tabelas próprias.

---

## 3.3 E-mail

O e-mail:

- é obrigatório nos fluxos de autenticação;
- não pode estar vazio;
- deve possuir formato de e-mail;
- não deve possuir espaços internos.

Exemplo:

`barbeiro@exemplo.com`

---

## 3.4 Valores monetários

Na interface:

`R$ 35,00`

No banco:

tipo monetário exato definido na documentação de banco.

Valores de:

- preço;
- custo;
- despesa;

não podem ser negativos.

Preço de venda de serviço ou produto deverá ser maior que `R$ 0,00`.

---

## 3.5 Quantidade de produto

A quantidade:

- deve ser número inteiro;
- pode ser zero;
- não pode ser negativa.

---

## 3.6 Endereço

Os dados do endereço são:

### CEP

- obrigatório;
- 8 números;
- máscara visual `00000-000`;
- consulta automática ao ViaCEP quando possível.

### Rua/Logradouro

- obrigatório.

### Número

O sistema deverá perguntar se o endereço possui número.

Se possuir:

- informar Número.

Se não possuir:

- comportamento definitivo de armazenamento: `DECISÃO PENDENTE`.

A interface poderá apresentar **Sem número**.

### Bairro

- obrigatório.

### Cidade

- obrigatória.

### Estado

- obrigatório;
- sigla de duas letras;
- seleção em lista.

### Complemento

- opcional.

---

## 3.7 ViaCEP

Ao informar um CEP:

1. frontend normaliza o valor;
2. verifica se existem 8 números;
3. consulta o ViaCEP;
4. se encontrado, preenche:
   - rua/logradouro;
   - bairro;
   - cidade;
   - estado;
5. número continua manual;
6. complemento continua manual;
7. usuário poderá corrigir informações preenchidas.

Se o ViaCEP estiver indisponível:

- não impedir definitivamente o cadastro;
- permitir preenchimento manual.

---

## 3.8 Horários

Configurar individualmente:

- Segunda-feira;
- Terça-feira;
- Quarta-feira;
- Quinta-feira;
- Sexta-feira;
- Sábado;
- Domingo.

Para cada dia:

- Aberto;
- ou Fechado.

Se aberto:

- horário de abertura obrigatório;
- horário de fechamento obrigatório;
- formato `HH:MM`;
- fechamento posterior à abertura.

Se fechado:

- não exigir horários.

Mais de um intervalo no mesmo dia:

`DECISÃO PENDENTE`

---

# 4. Estados globais da interface

## Loading

Quando uma operação estiver em andamento:

- desabilitar o botão responsável;
- impedir múltiplos envios;
- indicar processamento;
- não apagar dados antes da confirmação do servidor.

---

## Sucesso

Após confirmação:

- atualizar interface;
- exibir mensagem curta;
- manter o usuário no contexto adequado.

Mensagem padrão:

> Alterações salvas com sucesso.

---

## Erro

Erros técnicos nunca devem mostrar:

- SQL;
- stack trace;
- token;
- segredo;
- caminho interno;
- chave de API.

Mensagem padrão:

> Não foi possível concluir esta operação. Tente novamente.

---

## Sem conexão

Mensagem:

> Não foi possível conectar ao sistema. Verifique sua internet e tente novamente.

---

## Sessão expirada

Mensagem:

> Sua sessão expirou. Entre novamente para continuar.

---

## Sem permissão

Mensagem:

> Você não possui permissão para acessar este recurso.

---

# 5. Responsividade global

## Mobile

Priorizar:

- uma coluna;
- botões adequados para toque;
- campos ocupando largura disponível;
- ações principais facilmente acessíveis;
- evitar tabelas horizontais;
- utilizar cards ou listas;
- não depender de hover;
- respeitar teclado virtual.

---

## Web

Pode utilizar:

- sidebar;
- tabelas;
- painéis lado a lado;
- maior quantidade de informações simultâneas;
- navegação por teclado.

O fluxo funcional deverá permanecer equivalente entre Mobile e Web.

---

# 6. Criar conta

## Ator

Barbeiro.

## Pré-condições

- não estar autenticado;
- possuir acesso à internet;
- possuir e-mail;
- não possuir conta para aquele e-mail.

## Campos

### Nome

- opcional;
- máximo de 50 caracteres;
- utilizado como nome profissional quando informado.

### E-mail

- obrigatório;
- seguir regra global de e-mail.

### Senha

- obrigatória;
- seguir regra global de senha.

### Confirmar senha

- obrigatória;
- exatamente igual à senha.

## Ações

- Criar conta;
- Já tenho uma conta.

## Fluxo

1. Usuário abre **Criar conta**.
2. Preenche os campos.
3. Frontend valida.
4. Usuário clica em **Criar conta**.
5. Botão entra em Loading.
6. Solicitação é enviada ao Supabase Auth.
7. Auth cria o usuário.
8. Backend cria o perfil interno.
9. Backend cria a barbearia vinculada.
10. Operação deverá evitar a criação de duas barbearias para o mesmo usuário.
11. Se confirmação de e-mail estiver habilitada, continuar para confirmação.
12. Caso contrário, continuar para Onboarding.

## Backend

Não aceitar do navegador um `barbearia_id` escolhido arbitrariamente.

## Erros

### E-mail inválido

> Informe um e-mail válido.

### E-mail já utilizado

> Este e-mail já está associado a uma conta.

### Senha curta

> A senha deve possuir pelo menos 8 caracteres.

### Sem letra

> A senha deve possuir pelo menos 1 letra.

### Sem número

> A senha deve possuir pelo menos 1 número.

### Confirmação diferente

> As senhas informadas não são iguais.

---

# 7. Confirmação de e-mail

Utilização obrigatória no MVP:

`DECISÃO PENDENTE`

Caso habilitada:

1. conta é criada;
2. Supabase envia confirmação;
3. sistema informa o envio;
4. usuário confirma;
5. sistema valida;
6. usuário segue para Onboarding.

Reenvio:

- disponível;
- intervalo mínimo: `DECISÃO PENDENTE`.

---

# 8. Onboarding

## Objetivo

Configurar a barbearia antes do primeiro uso normal do painel.

## Etapa 1 — Dados da barbearia

### Nome da barbearia

- obrigatório.

### WhatsApp

- obrigatório;
- deve possuir DDD.

Regra de país:

`DECISÃO PENDENTE`

### Atende a domicílio

- Sim;
- Não.

Caso Sim, regiões atendidas:

`DECISÃO PENDENTE`

---

## Etapa 2 — Endereço

Solicitar:

- CEP;
- Rua/Logradouro;
- Número ou opção sem número;
- Bairro;
- Cidade;
- Estado;
- Complemento opcional.

Aplicar regras globais de endereço e ViaCEP.

---

## Etapa 3 — Horários

Configurar Segunda-feira a Domingo conforme regras globais.

---

## Etapa 4 — Serviços

Permitir cadastrar os serviços iniciais.

Dados por serviço:

- Nome;
- Descrição opcional;
- Preço;
- Custo estimado opcional;
- Ativo;
- Exibir na Vitrine.

---

## Etapa 5 — Produtos

Permitir:

- cadastrar produtos;
- ou marcar que a barbearia não vende produtos/bebidas.

---

## Salvamento

Cada etapa deverá ser salva individualmente.

Se o usuário sair:

- manter etapas já salvas;
- retomar etapa pendente no próximo Login.

---

# 9. Login

## Campos

- E-mail;
- Senha.

## Ações

- Entrar;
- Criar conta;
- Esqueci minha senha.

## Fluxo

1. usuário preenche E-mail;
2. preenche Senha;
3. clica em Entrar;
4. frontend valida campos;
5. Supabase Auth valida credenciais;
6. backend localiza perfil;
7. localiza barbearia;
8. verifica status da conta;
9. verifica Onboarding;
10. Onboarding incompleto → redirecionar para etapa pendente;
11. Onboarding concluído → Dashboard.

## Erros

### Credenciais inválidas

> E-mail ou senha incorretos.

### Conta inativa

> Sua conta está inativa. Entre em contato com o suporte.

---

# 10. Recuperação de senha

## Etapa 1 — Solicitar código

Campo:

- E-mail.

Ação:

- Enviar código.

Fluxo:

1. usuário informa e-mail;
2. sistema solicita recuperação ao Supabase;
3. e-mail apresenta código numérico de 6 dígitos;
4. sistema mostra resposta neutra.

Mensagem:

> Se existir uma conta associada a este e-mail, enviaremos um código de recuperação.

Validade do código:

`DECISÃO PENDENTE`

Intervalo para reenvio:

`DECISÃO PENDENTE`

---

## Etapa 2 — Verificar código

Campo:

- Código;
- exatamente 6 números.

Ações:

- Verificar;
- Reenviar.

Fluxo:

1. usuário informa código;
2. backend/Auth verifica;
3. se válido, autoriza redefinição;
4. abre tela de Nova Senha.

Máximo de tentativas:

`DECISÃO PENDENTE`

---

## Etapa 3 — Nova senha

Campos:

- Nova senha;
- Confirmar nova senha.

Aplicar regra global de senha.

Após sucesso:

> Senha redefinida com sucesso.

Destino recomendado:

- Login.

---

# 11. Logout

1. usuário seleciona **Sair**;
2. Auth encerra sessão;
3. dados privados mantidos em memória são descartados;
4. redirecionar para Login.

Voltar no histórico do navegador não deve recuperar acesso autenticado.

---

# 12. Dashboard

## Filtros

- Hoje;
- Semana;
- Mês;
- Ano;
- Período personalizado.

Período personalizado:

- Data inicial;
- Data final.

Data final não pode ser anterior à inicial.

## Indicadores

- Faturamento;
- Entradas;
- Saídas;
- Resultado estimado;
- Serviços;
- Bebidas;
- Outros produtos;
- Estoque baixo.

## Fluxo

1. usuário abre Dashboard;
2. frontend solicita os dados;
3. backend considera somente dados da barbearia autenticada;
4. vendas canceladas não entram nos totais válidos;
5. despesas do período são consideradas;
6. frontend apresenta resultados.

## Estado vazio

> Nenhuma movimentação encontrada neste período.

---

# 13. Serviços

## Campos

### Nome

- obrigatório.

### Descrição

- opcional.

### Preço

- obrigatório;
- maior que R$ 0,00.

### Custo estimado de insumos

- opcional;
- maior ou igual a R$ 0,00.

Representa materiais consumidos diretamente durante o serviço.

Não representa:

- aluguel;
- energia;
- internet;
- salário.

### Ativo

- padrão Sim.

### Exibir na Vitrine

- padrão Sim.

---

## Cadastrar

1. abrir Serviços;
2. clicar em Novo Serviço;
3. preencher;
4. salvar;
5. backend valida tenant e campos;
6. criar registro;
7. atualizar lista.

---

## Editar

Alterações afetam somente usos futuros.

Vendas antigas permanecem com snapshots históricos.

---

## Inativar

Ao inativar:

- não oferecer em novas vendas;
- não exibir na Vitrine;
- manter histórico.

Exclusão física de serviço nunca utilizado:

`DECISÃO PENDENTE`

---

# 14. Categorias de produto

## Sugestões iniciais

- Bebida;
- Pomada;
- Shampoo;
- Cera;
- Óleo/Balm para barba;
- Acessórios;
- Outros.

Lista final:

`DECISÃO PENDENTE`

## Categoria personalizada

Campo:

- Nome obrigatório.

Para detectar duplicidade, tratar como equivalentes:

- `Bebida`;
- `bebida`;
- ` BEBIDA `.

Remover espaços externos e ignorar diferença entre maiúsculas e minúsculas para comparação.

## Fluxo

1. usuário seleciona categoria sugerida;
2. se ainda não existir para aquela barbearia, backend cria;
3. produto é vinculado.

Ou:

1. clicar em Criar Categoria;
2. informar nome;
3. validar duplicidade;
4. criar;
5. selecionar automaticamente.

## Mensagens

Nome vazio:

> Informe o nome da categoria.

Duplicada:

> Já existe uma categoria cadastrada com este nome.

Categoria utilizada por produto deverá preferencialmente ser inativada.

---

# 15. Produto

## Campos

### Nome

- obrigatório.

### Categoria

- obrigatória;
- da mesma barbearia.

### Descrição

- opcional.

### Quantidade inicial

- obrigatória;
- inteiro;
- mínimo 0.

### Estoque mínimo

- opcional;
- inteiro;
- mínimo 0.

Se vazio:

- sem alerta mínimo.

### Preço de custo

- obrigatório;
- maior ou igual a R$ 0,00.

### Preço de venda

- obrigatório;
- maior que R$ 0,00.

### Imagem

- opcional;
- JPG/JPEG;
- PNG;
- WebP.

Tamanho máximo:

`DECISÃO PENDENTE`

### Ativo

- Sim por padrão.

### Exibir na Vitrine

- Sim por padrão.

---

## Venda abaixo do custo

Permitida com aviso:

> O preço de venda está abaixo do preço de custo. Deseja continuar?

---

## Estoque baixo

Se:

`estoque_atual <= estoque_minimo`

mostrar:

**Estoque baixo**

Se:

`estoque_atual = 0`

mostrar:

**Sem estoque**

---

## Editar

Quantidade de estoque não deve ser alterada pela edição comum.

Utilizar:

- Reposição;
- Ajuste;
- Perda;
- Venda;
- Reversão.

---

## Inativar

Produto inativo:

- não aparece no PDV;
- não aparece publicamente;
- permanece no histórico.

---

# 16. Reposição de estoque

## Campos

### Produto

- obrigatório.

### Quantidade

- obrigatória;
- inteiro;
- mínimo 1.

### Custo unitário

- obrigatório;
- mínimo R$ 0,00.

### Data

- obrigatória;
- padrão: data atual.

Permitir data anterior:

`DECISÃO PENDENTE`

### Observação

- opcional.

### Registrar no Financeiro

- Sim;
- Não.

Valor padrão:

`DECISÃO PENDENTE`

## Cálculo

`custo total = quantidade × custo unitário`

## Fluxo

1. usuário informa os dados;
2. frontend mostra custo total;
3. confirma;
4. backend valida;
5. estoque aumenta;
6. custo atual do produto é atualizado para vendas futuras;
7. cria movimentação;
8. se marcado, cria despesa de Compra de Estoque;
9. confirma.

---

# 17. Ajuste de estoque

## Campos

- Produto;
- Quantidade física correta;
- Motivo.

Quantidade correta:

- inteiro;
- mínimo 0.

Fluxo:

1. mostrar saldo atual;
2. usuário informa saldo correto;
3. sistema calcula diferença;
4. usuário informa motivo;
5. backend atualiza;
6. registra saldo anterior;
7. registra saldo posterior;
8. registra diferença.

---

# 18. Perda de estoque

## Campos

- Produto;
- Quantidade perdida;
- Motivo;
- Data.

Quantidade:

- inteiro;
- mínimo 1;
- não pode ultrapassar estoque disponível.

Ao confirmar:

- reduzir estoque;
- registrar movimento `PERDA`.

Impacto financeiro automático:

`DECISÃO PENDENTE`

---

# 19. Histórico de estoque

Exibir:

- data;
- hora;
- produto;
- tipo;
- quantidade alterada;
- saldo anterior;
- saldo posterior;
- motivo;
- venda relacionada quando existir.

---

# 20. PDV — Comanda

## Estado inicial

- vazia;
- botão Finalizar desabilitado.

## Adicionar serviço

Ao selecionar:

- adicionar à comanda.

Quantidade maior que 1 para o mesmo serviço:

`DECISÃO PENDENTE`

## Adicionar produto

- começa com quantidade 1;
- não permitir ultrapassar estoque.

## Quantidade

`+` aumenta.

`-` reduz.

Quantidade zero remove o item.

## Remover

Remove apenas da comanda temporária.

Nenhuma alteração de banco ocorre antes da finalização.

## Subtotal

`quantidade × preço`

## Total

Soma dos subtotais.

## Forma de pagamento

Opcional.

Valores:

- Pix;
- Dinheiro;
- Débito;
- Crédito;
- Outro.

## Observação

- opcional.

Tamanho máximo:

`DECISÃO PENDENTE`

---

# 21. Finalizar venda

## Dados enviados pelo frontend

- ID do item;
- tipo;
- quantidade;
- forma de pagamento quando informada;
- observação quando informada.

Não confiar em preço ou total calculados pelo navegador.

## Backend

1. validar sessão;
2. identificar barbearia;
3. buscar itens;
4. verificar que pertencem à barbearia;
5. verificar status ativo;
6. verificar estoque;
7. buscar preços atuais;
8. buscar custos atuais;
9. recalcular subtotais;
10. calcular total;
11. iniciar operação atômica;
12. criar venda `CONCLUIDA`;
13. criar itens com snapshots;
14. baixar estoque;
15. criar movimentações;
16. confirmar operação;
17. retornar sucesso.

## Falha

Nenhuma parte da venda deve permanecer registrada isoladamente.

## Estoque insuficiente

> Não há estoque suficiente de {produto}. Disponível: {quantidade}.

## Item inativo

> Um dos itens desta venda não está mais disponível. Atualize a comanda.

## Sucesso

> Venda registrada com sucesso.

Somente após sucesso:

- limpar comanda.

Proteção contra envio duplicado deverá existir no frontend e backend.

---

# 22. Histórico de vendas

## Lista

- Data;
- Hora;
- Total;
- Forma de pagamento;
- Status.

Status:

- Concluída;
- Cancelada.

## Detalhes

- Itens;
- Quantidades;
- Preços congelados;
- Subtotais;
- Total;
- Data;
- Hora;
- Forma de pagamento;
- Observação.

Exibir custos internos no detalhe:

`DECISÃO PENDENTE`

---

# 23. Cancelar venda

## Pré-condição

Status `CONCLUIDA`.

## Confirmação

> Tem certeza de que deseja cancelar esta venda de R$ {valor}? Os produtos vinculados retornarão ao estoque e a venda deixará de ser considerada nos resultados válidos.

## Backend

1. validar venda;
2. iniciar transação;
3. alterar para `CANCELADA`;
4. registrar data/hora;
5. restaurar produtos;
6. criar movimentos `REVERSAO_VENDA`;
7. confirmar.

Após cancelar:

- manter no histórico;
- impedir novo cancelamento;
- retirar dos totais válidos.

---

# 24. Despesas

## Campos

### Nome

- obrigatório.

### Descrição

- opcional.

### Categoria

- obrigatória.

Sugestões:

- Aluguel;
- Água;
- Energia;
- Internet;
- Equipamentos;
- Manutenção;
- Compra de estoque;
- Outros.

Lista final:

`DECISÃO PENDENTE`

Categorias personalizadas:

`DECISÃO PENDENTE`

### Valor

- obrigatório;
- maior que R$ 0,00.

### Data

- obrigatória.

Data futura:

`DECISÃO PENDENTE`

## Fluxo

1. usuário abre Financeiro;
2. Nova Despesa;
3. preenche;
4. salva;
5. backend valida;
6. grava;
7. atualiza indicadores.

Editar despesa:

`DECISÃO PENDENTE`

Excluir despesa:

`DECISÃO PENDENTE`

---

# 25. Relatórios

## Filtros

- Diário;
- Semanal;
- Mensal;
- Anual;
- Personalizado.

## Mostrar

- faturamento;
- entradas;
- serviços;
- bebidas;
- outros produtos;
- saídas;
- despesas por categoria;
- resultado estimado.

## Serviço

Sem custo estimado:

`resultado estimado = preço`

Com custo:

`resultado estimado = preço - custo estimado`

## Produto

`resultado = preço congelado - custo congelado`

multiplicado pela quantidade.

## Compra de estoque

Afeta saída de caixa.

Não descontar a mesma compra novamente em um indicador que já considera custo dos produtos vendidos.

## Exportação

PDF previsto.

Conteúdo final do PDF:

`DECISÃO PENDENTE`

Imagem:

`DECISÃO PENDENTE`

---

# 26. Configurações da barbearia

Campos:

- Nome da marca;
- Nome profissional;
- Descrição;
- Telefone;
- WhatsApp;
- Instagram;
- Atende a domicílio;
- CEP;
- Rua/Logradouro;
- Número;
- Bairro;
- Cidade;
- Estado;
- Complemento;
- Horários;
- Logo;
- Capa.

Dados públicos devem ser identificados claramente.

---

# 27. Vitrine Digital

## Definição

Página pública completa da barbearia.

## Administração

Permitir:

- Publicar;
- Despublicar;
- Copiar link;
- Editar dados;
- Selecionar seções;
- Controlar serviços públicos;
- Controlar produtos públicos;
- Gerenciar Portfólio;
- Visualizar prévia;
- Configurar Assistente IA.

## Slug

Proposta:

`/b/{slug}`

Regras:

- minúsculas;
- números;
- hífen;
- sem espaços;
- sem acentos;
- único.

Tamanho:

`DECISÃO PENDENTE`

## Produto sem estoque

`DECISÃO PENDENTE`

Opções:

- ocultar;
- mostrar Indisponível.

---

# 28. Publicar Vitrine

1. usuário salva informações;
2. visualiza prévia;
3. seleciona Publicar;
4. backend verifica slug;
5. garante unicidade;
6. marca como publicada;
7. retorna URL.

Dados mínimos necessários:

`DECISÃO PENDENTE`

---

# 29. Despublicar Vitrine

Mensagem:

> Ao despublicar, visitantes não poderão acessar sua Vitrine até que ela seja publicada novamente.

Ao confirmar:

- definir como despublicada;
- manter dados cadastrados;
- bloquear conteúdo público.

---

# 30. Portfólio

## Campos

### Imagem

- obrigatória;
- JPG/JPEG;
- PNG;
- WebP.

Tamanho máximo:

`DECISÃO PENDENTE`

### Descrição

- opcional.

### Serviço relacionado

- opcional;
- da mesma barbearia.

### Publicado

- Sim;
- Não.

## Adicionar

1. selecionar imagem;
2. validar;
3. enviar ao Storage;
4. informar descrição;
5. relacionar serviço quando desejado;
6. escolher publicação;
7. salvar.

## Ocultar

- manter no painel;
- remover da Vitrine.

## Publicar

- tornar público novamente.

## Excluir

- confirmar;
- remover registro;
- remover arquivo quando apropriado.

---

# 31. Visitante — acessar Vitrine

## Pré-condições

- slug existe;
- barbearia ativa;
- Vitrine publicada.

## Cabeçalho

Pode apresentar:

- Logo;
- Capa;
- Nome da marca;
- Nome profissional.

## Sobre

- Descrição pública.

## Serviços

Exibir somente:

- ativos;
- públicos.

Dados:

- Nome;
- Descrição;
- Preço.

Nunca mostrar custo estimado.

## Produtos

Exibir somente:

- ativos;
- públicos.

Dados:

- Imagem;
- Nome;
- Categoria;
- Descrição;
- Preço de venda.

Nunca mostrar:

- preço de custo;
- estoque numérico;
- estoque mínimo.

## Portfólio

Somente publicado.

## Localização

Pode exibir:

- Rua;
- Número;
- Bairro;
- Cidade;
- Estado;
- Complemento.

Exibir CEP:

`DECISÃO PENDENTE`

## Contato

- WhatsApp;
- Instagram quando cadastrado.

---

# 32. Visitante — WhatsApp

1. clicar em WhatsApp;
2. montar link com número público;
3. abrir WhatsApp compatível.

Mensagem pré-preenchida:

`DECISÃO PENDENTE`

---

# 33. Visitante — Instagram

Se cadastrado:

- mostrar botão;
- abrir URL informada.

Se vazio:

- não mostrar botão.

---

# 34. Visitante — rota

Ao selecionar **Como chegar**:

- abrir serviço de mapas com endereço.

Serviço padrão:

`DECISÃO PENDENTE`

---

# 35. Vitrine inexistente

Mensagem:

> Esta Vitrine não foi encontrada.

Não revelar:

- IDs;
- banco;
- detalhes técnicos.

---

# 36. Vitrine despublicada

Mensagem:

> Esta Vitrine não está disponível no momento.

Não carregar conteúdo privado.

---

# 37. Assistente IA

## Condições

Mostrar somente quando:

- Vitrine publicada;
- barbearia ativa;
- IA liberada;
- IA ativa.

## Campo

- Mensagem;
- obrigatória.

Tamanho máximo:

`DECISÃO PENDENTE`

## Contexto permitido

- nome público;
- descrição;
- serviços públicos;
- preços públicos;
- produtos públicos;
- horários;
- endereço;
- atendimento a domicílio;
- contatos.

## Proibido enviar para IA

- custos;
- estoque interno;
- faturamento;
- despesas;
- vendas;
- credenciais;
- e-mail privado;
- IDs internos;
- segredos;
- chaves de API;
- dados de outra barbearia.

## Fluxo

1. visitante envia mensagem;
2. backend valida;
3. verifica IA;
4. aplica limite de uso;
5. busca contexto público;
6. monta instrução;
7. chama Gemini;
8. devolve resposta.

## Agendamento

Não:

- consultar agenda;
- reservar;
- prometer horário.

Direcionar ao WhatsApp.

## Sem informação

> Não tenho essa informação disponível. Você pode falar diretamente com a barbearia pelo WhatsApp.

## Indisponível

> O assistente está temporariamente indisponível. Você ainda pode falar diretamente com a barbearia pelo WhatsApp.

## Histórico

Não persistir conversas completas por padrão no MVP.

Rate limit:

`DECISÃO PENDENTE`

Timeout:

`DECISÃO PENDENTE`

---

# 38. Sem internet

Ao detectar perda de conexão:

> Você está sem conexão com a internet.

Bloquear operações críticas de gravação.

No PDV:

- preservar comanda em memória enquanto a página continuar aberta quando possível;
- não finalizar venda;
- não criar venda offline;
- não sincronizar posteriormente no MVP.

---

# 39. Manutenção

Quando `MAINTENANCE_MODE` estiver ativo:

- exibir página de manutenção;
- bloquear áreas definidas;
- não mostrar detalhes técnicos.

Mensagem padrão:

> Estamos realizando uma manutenção no sistema.

Motivo público adicional:

- opcional.

Previsão:

- opcional.

---

# 40. Operador do SaaS

## Funções previstas

- localizar barbearia;
- ativar/desativar conta;
- liberar Assistente IA;
- retirar liberação do Assistente IA;
- suporte operacional.

## Não permitido por padrão

- visualizar senha;
- realizar venda em nome do barbeiro;
- alterar despesas;
- consultar segredos;
- impersonar conta;
- desligar RLS genericamente.

## Autenticação

Método definitivo:

`DECISÃO PENDENTE`

## Autorização

Deve ser verificada no servidor.

---

# 41. Responsabilidade frontend/backend

## Frontend

Responsável por:

- interface;
- feedback imediato;
- validação de experiência;
- loading;
- mensagens;
- estado temporário da comanda;
- responsividade.

O frontend não é fonte confiável para:

- preços;
- custos;
- permissões;
- barbearia;
- estoque final;
- resultado financeiro.

## Backend

Responsável por:

- validar sessão;
- determinar barbearia;
- validar dados;
- buscar valores atuais;
- aplicar regras;
- persistir alterações;
- garantir transações;
- impedir acesso cruzado;
- chamar serviços secretos.

A preparação detalhada do frontend será definida no documento próprio **Preparação Frontend para Backend**.

---

# 42. Decisões pendentes identificadas

Antes da implementação final das respectivas áreas, definir:

1. confirmação de e-mail obrigatória;
2. intervalo para reenvio da confirmação;
3. armazenamento do endereço sem número;
4. múltiplos horários no mesmo dia;
5. regra de país do WhatsApp;
6. áreas de atendimento a domicílio;
7. validade do código de recuperação;
8. intervalo de reenvio do código;
9. limite de tentativas;
10. lista final de categorias de produto;
11. exclusão física de serviço nunca utilizado;
12. tamanho máximo das imagens;
13. padrão financeiro da reposição;
14. impacto financeiro das perdas;
15. quantidade de serviços iguais na mesma comanda;
16. tamanho da observação da venda;
17. custos no detalhe da venda;
18. categorias finais de despesas;
19. categorias personalizadas de despesas;
20. edição e exclusão de despesas;
21. conteúdo da exportação;
22. exportação em imagem;
23. tamanho do slug;
24. dados mínimos para publicar a Vitrine;
25. produto sem estoque na Vitrine;
26. exibição pública do CEP;
27. mensagem inicial do WhatsApp;
28. serviço padrão de mapas;
29. tamanho da mensagem para IA;
30. rate limit da IA;
31. timeout da IA;
32. autenticação do Operador SaaS.

Uma decisão pendente deve continuar escrita como pendente até ser efetivamente escolhida.