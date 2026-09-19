# FLUXO_BARBEIRO — Estilo e Gestão


## Objetivo

Este documento é a fonte funcional principal para todas as regras e fluxos referentes ao **barbeiro autenticado** no Estilo e Gestão. Regras públicas do visitante pertencem ao `FLUXO_CLIENTE.md`, e regras administrativas pertencem ao `FLUXO_ADMIN.md`.

O documento cobre dados utilizados, campos, ações, sequência dos fluxos, validações, estados de interface, comportamento esperado do frontend e do backend, diferenças entre Desktop e Mobile, planos, assinatura, estados globais e situações excepcionais que afetam o barbeiro.

Quando uma regra ainda não estiver definida, ela deve ser registrada explicitamente como pendência. Não substituir decisões ausentes por termos vagos.

---

# 1. Ator e identidade do barbeiro

O barbeiro é o usuário autenticado responsável pela própria barbearia. O perfil comum criado pelo cadastro público possui:

```text
tipo = BARBEIRO
```

O cadastro público nunca deve permitir escolher `ADMIN`. O tipo de usuário é validado pelo backend e não pode ser alterado livremente pelo frontend ou pelo próprio usuário.

A navegação principal aprovada possui quatro módulos:

```text
Dashboard
PDV
Operação
Configurações
```

Organização:

```text
Dashboard

PDV
├── Nova venda
└── Histórico de vendas

Operação
├── Serviços
├── Produtos
│   └── Categorias
└── Estoque

Configurações
├── Negócio
│   ├── Financeiro
│   ├── Relatórios
│   └── Vitrine Digital
│       └── Portfólio
└── Barbearia
    ├── Dados da barbearia
    ├── Endereço
    ├── Horários
    └── Formas de pagamento

Sua conta
├── Perfil
├── Aparência
├── Alterar senha
├── Minha assinatura
└── Zona de perigo
```

Categorias pertence a Produtos e não é item independente da navegação principal. **Sua conta** é separada de Configurações. O Logout pertence ao menu da conta.

O Assistente IA permanece no contexto da Vitrine quando o Plano Com IA estiver vigente, o recurso estiver ativo e houver cota disponível.

---

# 2. Regra para decisões não definidas

Nunca substituir uma decisão ausente por termos vagos como:

- valor válido;

- senha segura;

- arquivo grande;

- endereço completo;

- limite adequado;

- timeout adequado.

Quando uma regra funcional ainda não tiver sido definida, ela deverá ser identificada explicitamente para decisão posterior.

---


# 3. Regras globais do barbeiro

## 3.1 Tipo de usuário

Os tipos disponíveis no MVP são:

- `BARBEIRO`;

- `ADMIN`.

Todo novo cadastro realizado pela aplicação recebe:

`tipo = BARBEIRO`

A permissão `ADMIN` deverá ser atribuída manualmente no banco de dados no MVP.

O campo responsável pelo tipo de usuário:

- não deve ser editável pelo próprio usuário;

- não deve ser enviado livremente pelo frontend durante o cadastro;

- deverá ser validado pelo backend antes de liberar áreas administrativas.

---

## 3.2 Identificação da barbearia

Todo dado administrativo do barbeiro deverá estar associado à barbearia correta.

O frontend não deve possuir autoridade para decidir livremente o `barbearia_id`.

O backend deverá identificar a barbearia através da sessão autenticada.

Usuários `ADMIN` não devem receber acesso aos dados de uma barbearia como se fossem proprietários dela.

---

## 3.3 Senha

A senha deverá:

- possuir no mínimo 8 caracteres;

- possuir pelo menos 1 letra;

- possuir pelo menos 1 número.

Não será obrigatório:

- caractere especial;

- letra maiúscula;

- combinação específica de maiúsculas e minúsculas.

A senha será gerenciada pelo Supabase Auth e não deverá ser armazenada em tabelas próprias da aplicação.

---

## 3.4 E-mail

O e-mail:

- é obrigatório nos fluxos de autenticação;

- não pode estar vazio;

- deve possuir formato de e-mail;

- não deve possuir espaços internos.

Exemplo:

`barbeiro\@exemplo.com`

---

## 3.5 Valores monetários

Na interface:

`R$ 35,00`

No banco:

o tipo monetário exato será definido na documentação de banco de dados.

Valores de:

- preço;

- custo;

- despesa;

não podem ser negativos.

Preço de venda de serviço ou produto deverá ser maior que `R$ 0,00`.

---

## 3.6 Quantidade de produto

A quantidade:

- deve ser número inteiro;

- pode ser zero quando a operação permitir;

- não pode ser negativa.

---

## 3.7 Endereço

Os dados do endereço são:

### CEP

- obrigatório;

- 8 números;

- máscara visual `00000-000`;

- consulta automática ao ViaCEP quando possível.

### Rua/Logradouro

- obrigatório.

### Número

O sistema deverá perguntar:

****O endereço tem número?****

O usuário poderá selecionar ****Sim**** ou ****Não****.

#### Se selecionar Sim

- o campo ****Número**** será exibido;

- o preenchimento será obrigatório;

- registrar `temNumero = true`;

- `numero` deverá armazenar o valor informado.

#### Se selecionar Não

- o campo ****Número**** não precisará ser preenchido;

- registrar `temNumero = false`;

- `numero` deverá ser armazenado como `null`.

Na interface, quando necessário exibir o endereço completo, o sistema poderá apresentar ****Sem número****.

Não armazenar `"S/N"` no campo `numero`.

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

## 3.8 ViaCEP

Ao informar um CEP:

1\. frontend normaliza o valor;

2\. verifica se existem 8 números;

3\. consulta o ViaCEP;

4\. se encontrado, preenche:

   - rua/logradouro;

   - bairro;

   - cidade;

   - estado;

5\. número continua manual;

6\. complemento continua manual;

7\. usuário poderá corrigir informações preenchidas.

Se o ViaCEP estiver indisponível:

- não impedir definitivamente o cadastro;

- permitir preenchimento manual.

---

## 3.9 Horários

Permitir configurar os horários de:

- Segunda-feira;

- Terça-feira;

- Quarta-feira;

- Quinta-feira;

- Sexta-feira;

- Sábado;

- Domingo.

O usuário poderá configurar dias individualmente ou aplicar o mesmo horário a vários dias selecionados.

Para cada dia:

- Aberto;

- ou Fechado.

Se aberto:

- horário de abertura obrigatório;

- horário de fechamento obrigatório;

- formato `HH:MM`;

- fechamento posterior à abertura;

- permitir no máximo 2 intervalos de atendimento no mesmo dia.

Exemplo:

```text

08:00 às 12:00

14:00 às 18:00

```

Os intervalos do mesmo dia não podem se sobrepor.

Se fechado:

- não exigir horários.

---

## 3.10 Formas de pagamento aceitas

A barbearia deverá informar quais formas de pagamento aceita normalmente.

Opções previstas:

- Pix;

- Dinheiro;

- Débito;

- Crédito;

- Outro.

Essa configuração pertence à barbearia e deverá poder ser alterada posteriormente nas Configurações da Barbearia.

As formas selecionadas poderão ser utilizadas para:

- facilitar a escolha da forma de pagamento no PDV;

- informar os meios aceitos na Vitrine Digital;

- responder perguntas públicas através do Assistente IA quando o recurso estiver disponível.

A configuração das formas aceitas não substitui o registro da forma de pagamento de cada venda.

Uma venda continua armazenando, quando informada, a forma efetivamente utilizada naquela operação.

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

*> Alterações salvas com sucesso.*

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

*> Não foi possível concluir esta operação. Tente novamente.*

---

## Sem conexão

Mensagem:

*> Não foi possível conectar ao sistema. Verifique sua internet e tente novamente.*

---

## Sessão expirada

Mensagem:

*> Sua sessão expirou. Entre novamente para continuar.*

---

## Sem permissão

Mensagem:

*> Você não possui permissão para acessar este recurso.*

---


# 5. Responsividade e navegação

A regra funcional deverá permanecer equivalente entre Mobile e Desktop.

A navegação, porém, utilizará padrões diferentes conforme o espaço disponível.

## Desktop

A área autenticada do barbeiro deverá utilizar uma sidebar recolhível com quatro módulos principais:

```text

Dashboard

PDV

Operação

Configurações
```

No estado expandido, a sidebar poderá apresentar:

- logo;

- ícones;

- nomes dos módulos;

- submenus;

- conta do usuário.

No estado recolhido, deverá priorizar:

- ícones;

- estado ativo;

- acesso à conta;

- aproveitamento da área principal.

## Mobile

A navegação principal deverá utilizar barra inferior fixa com:

```text

Dashboard

PDV

Operação

Configurações
```

Priorizar:

- uma coluna;

- botões adequados para toque;

- campos ocupando largura disponível;

- ações principais facilmente acessíveis;

- evitar tabelas horizontais;

- utilizar cards ou listas;

- não depender de hover;

- respeitar teclado virtual;

- reservar espaço para a barra inferior;

- respeitar safe areas.

## Estrutura interna

No Mobile, áreas agrupadas poderão utilizar:

- tabs;

- segmented control;

- listas;

- cards;

- páginas internas.

No Desktop, poderão utilizar submenus e navegação secundária.

A decisão visual detalhada pertence ao Design System e ao documento de Responsividade.

---


# 6. Navegação principal da área autenticada

A navegação do barbeiro possui quatro destinos principais:

```text
Dashboard
PDV
Operação
Configurações
```

Não criar itens principais independentes para Serviços, Produtos, Estoque, Financeiro, Relatórios, Vitrine ou Perfil.

## Operação

```text
Serviços
Produtos
Estoque
```

Categorias pertence a Produtos e é acessada dentro dessa área.

## Configurações

```text
NEGÓCIO
├── Financeiro
├── Relatórios
└── Vitrine Digital
    └── Portfólio

BARBEARIA
├── Dados da barbearia
├── Endereço
├── Horários
└── Formas de pagamento
```

Não existe grupo **Pessoal** dentro de Configurações.

## Sua conta

```text
Perfil
Aparência
Alterar senha
Minha assinatura
Zona de perigo
```

A exclusão da conta pertence a:

```text
Sua conta
→ Zona de perigo
```

## Menu rápido da conta

Pode oferecer:

```text
Minha conta
Aparência
Alterar senha
Sair
```

Não colocar Excluir conta diretamente nesse menu.

---


# 7. Criar conta

## Ator

Barbeiro.

O cadastro público não cria operadores do SaaS.

## Pré-condições

- não estar autenticado;

- possuir acesso à internet;

- possuir e-mail;

- não possuir conta para aquele e-mail.

## Campos

- Nome - opcional;

  - máximo de 50 caracteres;

  - utilizado como nome profissional quando informado.

- E-mail - obrigatório;

  - seguir regra global de e-mail.

- Senha - obrigatória;

  - seguir regra global de senha.

- Confirmar senha - obrigatória;

  - exatamente igual à senha.

## Ações

- Criar conta;

- Já tenho uma conta.

## Fluxo

1\. usuário abre ****Criar conta****;

2\. preenche os campos;

3\. frontend valida;

4\. usuário seleciona ****Criar conta****;

5\. botão entra em Loading;

6\. solicitação é enviada ao Supabase Auth;

7\. Auth cria o usuário;

8\. backend cria o perfil interno;

9\. perfil recebe automaticamente `tipo = BARBEIRO`;

10\. backend cria a barbearia vinculada;

11\. operação deverá evitar a criação de duas barbearias para o mesmo usuário;

12\. se confirmação de e-mail estiver habilitada, seguir para confirmação;

13\. caso contrário, seguir para Onboarding.

## Backend

O backend:

- não deve aceitar do navegador um `barbearia_id` escolhido arbitrariamente;

- não deve aceitar `tipo = ADMIN` pelo cadastro público;

- deverá criar novos perfis como `BARBEIRO`.

## Erros

### E-mail inválido

*> Informe um e-mail válido.*

### E-mail já utilizado

*> Este e-mail já está associado a uma conta.*

### Senha curta

*> A senha deve possuir pelo menos 8 caracteres.*

### Sem letra

*> A senha deve possuir pelo menos 1 letra.*

### Sem número

*> A senha deve possuir pelo menos 1 número.*

### Confirmação diferente

*> As senhas informadas não são iguais.*

---


# 8. Confirmação de e-mail

A confirmação de e-mail é utilizada somente durante a criação de uma nova conta quando essa exigência estiver habilitada.

O usuário receberá um código numérico de 6 dígitos no e-mail cadastrado.

## Fluxo

1\. usuário cria a conta;

2\. Supabase Auth envia o código para o e-mail;

3\. sistema informa que o código foi enviado;

4\. usuário informa os 6 dígitos;

5\. Supabase Auth valida o código;

6\. se válido, o e-mail é confirmado;

7\. usuário segue para o Onboarding.

## Código

- exatamente 6 números;

- aceitar somente caracteres numéricos;

- permitir colar o código completo;

- distribuir automaticamente os números entre as posições;

- avançar automaticamente após digitar cada número;

- ao apagar, permitir retornar à posição anterior.

## Reenvio

- disponível;

- após solicitar um novo código, iniciar intervalo mínimo de `30 segundos`;

- apresentar contagem regressiva até permitir novo reenvio.

---


# 9. Onboarding

## Objetivo

Configurar as informações essenciais da barbearia antes do primeiro uso normal do painel.

O Onboarding possui 6 etapas:

1\. Dados da barbearia;

2\. Endereço;

3\. Horários de funcionamento;

4\. Serviços;

5\. Produtos e formas de pagamento;

6\. Aparência e conclusão.

O objetivo é deixar o sistema utilizável sem obrigar o barbeiro a configurar recursos avançados antes de acessar o Dashboard.

Não fazem parte do Onboarding inicial:

- descrição pública da Vitrine;

- imagem de capa;

- Portfólio;

- criação do slug;

- publicação da Vitrine;

- comportamento de produtos sem estoque na Vitrine;

- Assistente IA;

- despesas;

- estoque detalhado de produtos.

Essas configurações poderão ser realizadas posteriormente nas áreas correspondentes.

---

## Etapa 1 — Dados da barbearia

Coletar:

- Nome da barbearia - obrigatório.

- Nome do profissional - opcional.

- WhatsApp - obrigatório;

  - deve possuir DDD;

  - trabalhar apenas com números brasileiros `+55`.

- Instagram - opcional;

  - utilizado como contato na Vitrine Digital quando informado.

- Logo da barbearia - opcional.

- Atende a domicílio - obrigatório;

  - Sim;

  - Não.

O atendimento a domicílio pertence às informações gerais da barbearia e poderá ser exibido posteriormente na Vitrine Digital.

A ausência de logo não deverá impedir a conclusão da etapa.

---

## Etapa 2 — Endereço

Solicitar:

- CEP;

- Rua/Logradouro;

- pergunta ****O endereço tem número?****;

- Número quando a resposta for ****Sim****;

- Bairro;

- Cidade;

- Estado;

- Complemento - opcional.

Aplicar as regras globais de endereço e ViaCEP.

Quando o endereço possuir número:

`temNumero = true`

O campo Número deverá ser obrigatório.

Quando o endereço não possuir número:

`temNumero = false`

e:

`numero = null`

A interface poderá apresentar ****Sem número**** quando necessário.

Não armazenar `"S/N"` como número.

---

## Etapa 3 — Horários de funcionamento

Configurar Segunda-feira a Domingo conforme as regras globais de horários.

Para cada dia, permitir:

- Aberto;

- Fechado.

Quando aberto:

- primeiro intervalo obrigatório;

- segundo intervalo opcional;

- impedir intervalos inválidos ou sobrepostos.

Exemplo:

```text
08:00 às 12:00
14:00 às 18:00
```

Esta etapa representa horários de funcionamento públicos da barbearia.

Não representa agenda, reserva ou disponibilidade para agendamento.

---

## Etapa 4 — Serviços

Permitir cadastrar os serviços iniciais oferecidos pela barbearia.

Dados por serviço:

- Nome - obrigatório.

- Descrição - opcional.

- Preço - obrigatório.

- Custo estimado de insumos - opcional;

  - representa materiais consumidos diretamente durante o serviço.

- Ativo;

  - padrão: Sim.

- Exibir na Vitrine;

  - padrão: Sim.

Exemplos:

- Corte;

- Barba;

- Sobrancelha;

- Corte + Barba.

Os serviços cadastrados nesta etapa deverão ficar disponíveis posteriormente no PDV conforme suas regras de status.

---

## Etapa 5 — Produtos e formas de pagamento

Esta etapa reúne duas configurações comerciais iniciais:

- tipos de produtos ou bebidas comercializados;

- formas de pagamento aceitas pela barbearia.

### Produtos e bebidas

O sistema deverá perguntar:

****A barbearia vende produtos ou bebidas?****

O usuário poderá selecionar ****Sim**** ou ****Não****.

#### Se selecionar Não

- não exigir categorias de produto;

- não exigir cadastro de produtos;

- permitir continuar para a configuração das formas de pagamento.

#### Se selecionar Sim

Perguntar quais tipos de produtos ou bebidas a barbearia comercializa.

Apresentar categorias sugeridas, como:

- Bebida;

- Pomada;

- Shampoo;

- Cera;

- Óleo/Balm para barba;

- Acessórios;

- Outros.

As categorias sugeridas poderão possuir uma imagem padrão oficial do Estilo e Gestão.

Exemplos:

```text

Bebida
→ imagem genérica de bebida

Pomada
→ imagem genérica de pomada

Outros
→ imagem neutra, sem representar um produto específico

```

O barbeiro poderá:

- selecionar uma ou mais categorias sugeridas;

- criar categoria própria quando necessário.

A seleção poderá criar as categorias iniciais da barbearia.

Quando uma categoria sugerida for criada para a barbearia, ela deverá manter a referência da imagem padrão correspondente.

Uma categoria personalizada criada pelo barbeiro deverá começar sem imagem padrão.

O Onboarding não deverá obrigar o barbeiro a cadastrar neste momento:

- nome de cada produto;

- preço de custo;

- preço de venda;

- estoque atual;

- estoque mínimo;

- imagem.

O cadastro detalhado dos produtos poderá ser realizado posteriormente na área de Produtos.

### Formas de pagamento aceitas

Perguntar:

****Quais formas de pagamento sua barbearia aceita?****

Permitir selecionar:

- Pix;

- Dinheiro;

- Débito;

- Crédito;

- Outro.

As formas selecionadas deverão ser salvas como configuração da barbearia.

Elas poderão ser utilizadas posteriormente:

- como opções preferenciais no PDV;

- na Vitrine Digital;

- pelo Assistente IA dentro do contexto público permitido.

Essa configuração é diferente da forma de pagamento registrada em uma venda específica.

Exemplo:

```text
Barbearia aceita:
Pix, Dinheiro, Débito e Crédito

Venda 001:
forma utilizada = PIX
```

O barbeiro poderá alterar as formas aceitas posteriormente nas Configurações da Barbearia.

---

## Etapa 6 — Aparência e conclusão

Permitir selecionar a aparência da interface privada:

- Tema Claro;

- Tema Escuro;

- Padrão do Sistema.

A preferência pertence ao usuário autenticado e deverá permanecer salva nos acessos seguintes.

### Padrão do Sistema

Utilizar automaticamente o tema definido no dispositivo ou navegador.

Quando a preferência do dispositivo mudar, o sistema deverá acompanhar a alteração quando tecnicamente suportado.

A escolha de tema da área privada não altera automaticamente a aparência pública da Vitrine Digital.

### Revisão final

Antes de concluir, a interface poderá apresentar um resumo das configurações principais já salvas, por exemplo:

- nome da barbearia;

- endereço;

- horários;

- quantidade de serviços cadastrados;

- categorias de produtos selecionadas, quando existirem;

- formas de pagamento aceitas;

- tema escolhido.

A revisão não deverá exigir que o usuário repita os dados.

Ação principal:

****Concluir configuração****

Após sucesso:

1\. marcar o Onboarding como concluído;

2\. preservar a preferência de tema escolhida;

3\. redirecionar para o Dashboard.

---

## Salvamento

Cada etapa deverá ser salva individualmente.

O progresso deverá permitir retomar o Onboarding sem repetir etapas concluídas.

Se o usuário sair antes de concluir:

- manter etapas já salvas;

- manter a etapa pendente;

- retomar essa etapa no próximo Login.

O usuário somente deverá ser direcionado normalmente ao Dashboard depois que o Onboarding estiver concluído.

---


# 10. Login

## Campos

- E-mail;

- Senha.

## Ações

- Entrar;

- Criar conta;

- Esqueci minha senha.

## Fluxo

1\. usuário informa o E-mail;

2\. informa a Senha;

3\. seleciona ****Entrar****;

4\. frontend valida os campos;

5\. Supabase Auth valida as credenciais;

6\. backend localiza o perfil;

7\. backend verifica o `tipo` da conta;

8\. se `tipo = ADMIN`:

   - validar permissão administrativa;

   - direcionar para o Painel Administrativo do SaaS;

9\. se `tipo = BARBEIRO`:

   - localizar a barbearia;

   - verificar status da conta;

   - verificar o Onboarding;

10\. Onboarding incompleto:

   - redirecionar para a etapa pendente;

11\. Onboarding concluído:

   - redirecionar para Dashboard.

O tipo do usuário não deve ser definido pelo frontend durante o Login.

## Erros

### Credenciais inválidas

*> E-mail ou senha incorretos.*

### Conta suspensa

Redirecionar para a página dedicada **Conta suspensa**, sem montar os módulos autenticados. Informar o canal de suporte e não sugerir que os dados foram apagados.

### Sem permissão administrativa

*> Você não possui permissão para acessar esta área.*

---


# 11. Recuperação de senha

## Etapa 1 — Solicitar código

### Campo

- E-mail.

### Ação

- Enviar código.

### Fluxo

1\. usuário informa o e-mail;

2\. sistema solicita recuperação ao Supabase;

3\. caso exista uma conta associada ao e-mail, é enviado um código numérico de 6 dígitos;

4\. sistema apresenta resposta neutra, independentemente de o e-mail estar ou não cadastrado.

Mensagem:

*> Se existir uma conta associada a este e-mail, enviaremos um código de recuperação.*

### Validade do código

- validade de 15 minutos a partir da geração;

- após 15 minutos, não poderá mais ser utilizado;

- se um novo código for solicitado, o anterior será invalidado imediatamente;

- somente o código mais recente será válido;

- o novo código inicia uma nova validade de 15 minutos.

Exemplo:

```text

13:00 → código 123456 enviado

13:00 até 13:15 → código válido

13:05 → usuário solicita novo código

13:05 → código 123456 é invalidado

13:05 → código 654321 é enviado

13:05 até 13:20 → código 654321 é válido

```

### Reenvio do código

Ao acessar a tela de verificação, o botão ****Reenviar código**** deverá estar disponível.

Quando solicitado:

- gerar novo código de 6 dígitos;

- enviar para o e-mail;

- invalidar imediatamente o código anterior;

- novo código terá validade de 15 minutos;

- botão ****Reenviar código**** ficará indisponível por 1 minuto;

- apresentar contagem regressiva;

- após 1 minuto, habilitar novamente.

Exemplo:

*> Reenviar código em 00:59*

Depois:

*> Reenviar código*

---

## Etapa 2 — Verificar código

- Código - obrigatório;

  - exatamente 6 números.

Ações:

- Verificar;

- Reenviar código.

Fluxo:

1\. usuário informa o código;

2\. Supabase Auth verifica;

3\. se válido, autoriza redefinição;

4\. abrir tela de Nova Senha.

Máximo de tentativas consecutivas:

`3`

Após atingir o limite, impedir novas tentativas naquele código e orientar o usuário a solicitar outro.

---

## Etapa 3 — Nova senha

- Nova senha - obrigatória;

  - aplicar regra global.

- Confirmar nova senha - obrigatória;

  - deve ser igual à nova senha.

Após sucesso:

*> Senha redefinida com sucesso.*

O acesso posterior deverá seguir normalmente o fluxo de Login e considerar o tipo da conta.

---


# 12. Logout

1\. usuário seleciona ****Sair****;

2\. Supabase Auth encerra a sessão;

3\. dados privados mantidos somente em memória são descartados;

4\. redirecionar para Login.

Voltar no histórico do navegador não deve recuperar acesso autenticado.

---


# 13. Dashboard

## Objetivo

Apresentar uma visão rápida da situação da barbearia sem substituir Relatórios.

## Primeiro acesso

Quando a barbearia ainda não possui movimentações, o Dashboard poderá apresentar:

- orientação de que a configuração foi concluída;
- acesso para Nova venda;
- atalhos para Cadastrar despesa, Gerenciar estoque e Configurar Vitrine Digital.

Esse conteúdo é um estado de primeiro acesso. Ele não deverá aparecer apenas porque um período selecionado ficou sem movimentações.

## Filtro global de período

Opções:

- Hoje;
- Semana;
- Mês;
- Ano;
- Personalizado.

## Indicadores financeiros

**Faturamento**

Valor das vendas concluídas no período.

**Entradas**

Valores registrados como recebimentos/entradas no período.

**Saídas**

Despesas e outras saídas financeiras efetivamente registradas no período.

Uma reposição de estoque, por si só, não cria saída financeira automática.

**Resultado estimado**

```text
Resultado estimado = Entradas - Saídas
```

É uma estimativa operacional e não deverá ser apresentada como lucro líquido contábil.

## Indicadores operacionais

- Serviços realizados;
- Bebidas vendidas;
- Outros produtos vendidos;
- Produtos com estoque baixo.

## Evolução no período

O Dashboard poderá apresentar gráfico de evolução da métrica selecionada no período atual.

Não criar bloco obrigatório de **Detalhamento gerencial** com análise por origem, forma de pagamento ou despesas. Essas análises pertencem a Relatórios.

## Situação do estoque

Pode mostrar quais produtos exigem atenção.

Exemplo:

```text
Pomada Modeladora
2 un. • mínimo 5

[Ver estoque]
```

Diferenciar:

```text
Nenhum produto cadastrado
```

de:

```text
Nenhum produto com estoque baixo
```

## Estados

Prever Loading, dados disponíveis, sem dados no período e erro.

---


# 14. Serviços

Serviços pertence ao módulo:

```text

Operação
→ Serviços

```

## Campos

- Nome - obrigatório.

- Descrição - opcional.

- Preço - obrigatório;

  - maior que R$ 0,00.

- Custo estimado de insumos - opcional;

  - maior ou igual a R$ 0,00;

  - representa materiais consumidos diretamente durante o serviço.

Não representa:

- aluguel;

- energia;

- internet;

- salário;

- demais despesas gerais.

- Ativo - padrão Sim.

- Exibir na Vitrine - padrão Sim.

---

## Cadastrar

1\. abrir Serviços;

2\. selecionar ****Novo Serviço****;

3\. preencher os campos;

4\. salvar;

5\. backend valida barbearia e campos;

6\. criar registro;

7\. atualizar lista.

---

## Editar

Alterações afetam somente usos futuros.

Vendas anteriores permanecem com os valores registrados no momento em que ocorreram.

---

## Inativar

Ao inativar:

- não disponibilizar em novas vendas;

- não exibir na Vitrine;

- manter os dados históricos.

---

## Excluir

Se o serviço nunca tiver sido utilizado em nenhuma venda:

- poderá ser excluído.

Se já tiver sido utilizado:

- preferir inativação em vez de exclusão.

Em qualquer situação:

- vendas anteriores devem permanecer preservadas;

- faturamento e resultados históricos não podem ser alterados;

- deixar de oferecer um serviço não remove os resultados obtidos anteriormente com ele.

---


# 15. Categorias de produto

Categorias de produto pertencem à área:

```text

Operação
→ Produtos
→ Categorias

```

Não são um módulo principal independente.

## Categorias iniciais

- Bebida;

- Pomada;

- Shampoo;

- Cera;

- Óleo/Balm para barba;

- Acessórios;

- Outros.

O barbeiro também poderá criar categorias personalizadas.

---

## Imagens padrão das categorias sugeridas

As categorias sugeridas pelo Estilo e Gestão poderão possuir uma imagem padrão oficial.

Exemplos conceituais:

```text

Bebida
→ imagem genérica de garrafa, lata ou bebida

Pomada
→ imagem genérica de pomada

Shampoo
→ imagem genérica de shampoo

Cera
→ imagem genérica relacionada à categoria

Óleo/Balm para barba
→ imagem genérica relacionada à categoria

Acessórios
→ imagem genérica de acessórios

Outros
→ imagem neutra, sem representar um produto específico

```

Essas imagens:

- pertencem ao Estilo e Gestão;

- funcionam como fallback visual para produtos;

- não pertencem a uma barbearia específica;

- não podem ser alteradas ou excluídas pelo barbeiro como se fossem arquivos próprios;

- poderão ser reutilizadas por várias barbearias.

O barbeiro não precisa enviar uma imagem para utilizar uma categoria sugerida.

---

## Categoria personalizada

- Nome - obrigatório.

Uma categoria criada manualmente pelo barbeiro deverá começar:

```text

sem imagem padrão

```

No MVP, não atribuir automaticamente uma imagem genérica a categorias personalizadas.

Para detectar duplicidade, considerar equivalentes:

- `bebida`;

- `Bebida`;

- ` BEBIDA `.

Remover espaços externos e ignorar diferenças entre maiúsculas e minúsculas na comparação.

---

## Fluxo com categoria sugerida

1\. usuário seleciona categoria sugerida;

2\. se ainda não existir para aquela barbearia, backend cria;

3\. backend associa a imagem padrão oficial daquela categoria quando existir;

4\. categoria fica disponível para os produtos da barbearia;

5\. produto pode utilizar essa imagem como fallback.

Exemplo:

```text

Categoria selecionada:
Pomada

Imagem padrão:
imagem oficial de Pomada do Estilo e Gestão

Produto cadastrado sem imagem própria:
Pomada Matte

Resultado:
→ produto poderá exibir a imagem padrão de Pomada

```

---

## Fluxo com categoria personalizada

1\. selecionar ****Criar Categoria****;

2\. informar nome;

3\. validar duplicidade;

4\. criar;

5\. categoria começa sem imagem padrão;

6\. selecionar automaticamente quando o fluxo exigir.

Exemplo:

```text

Categoria criada:
Perfumes

Imagem padrão:
nenhuma

```

---

## Mensagens

Nome vazio:

*> Informe o nome da categoria.*

Duplicada:

*> Já existe uma categoria cadastrada com este nome.*

Categoria utilizada por produtos deverá preferencialmente ser inativada em vez de excluída.

---


# 16. Produto

Produtos pertence ao módulo:

```text

Operação
→ Produtos

```

## Campos

- Nome - obrigatório.

- Categoria - obrigatória;

  - deve pertencer à mesma barbearia.

- Descrição - opcional.

- Quantidade inicial - obrigatória;

  - inteiro;

  - mínimo 0.

- Estoque mínimo - opcional;

  - inteiro;

  - mínimo 0;

  - vazio significa ausência de alerta mínimo.

- Preço de custo - obrigatório;

  - maior ou igual a R$ 0,00.

- Preço de venda - obrigatório;

  - maior que R$ 0,00.

- Imagem personalizada - opcional;

  - JPG/JPEG;

  - PNG;

  - WebP;

  - máximo 10 MB.

- Usar imagem padrão da categoria quando não houver imagem personalizada;

  - padrão: Sim.

- Ativo - Sim por padrão.

- Exibir na Vitrine - Sim por padrão.

---

## Imagem inicial do produto

Ao cadastrar um produto sem enviar imagem personalizada:

```text

categoria possui imagem padrão
+
usar imagem padrão da categoria = Sim
↓
mostrar imagem padrão da categoria

```

Exemplo:

```text

Categoria:
Bebida

Produto:
Coca-Cola 350 ml

Imagem personalizada:
nenhuma

Resultado:
→ exibir a imagem padrão de Bebida

```

Se a categoria não possuir imagem padrão:

```text

Produto sem imagem personalizada
+
Categoria sem imagem padrão
↓
produto sem imagem

```

Nesse caso, a interface poderá utilizar o placeholder neutro definido pelo Design System.

---

## Adicionar imagem personalizada

O barbeiro poderá substituir visualmente a imagem padrão da categoria por uma imagem própria do produto.

Fluxo:

1\. selecionar ****Adicionar imagem****;

2\. escolher arquivo;

3\. validar formato e tamanho;

4\. mostrar preview;

5\. enviar para o Storage;

6\. salvar a referência;

7\. passar a exibir a imagem personalizada.

Exemplo:

```text

Categoria:
Bebida

Imagem padrão:
imagem genérica de bebida

Produto:
Coca-Cola 350 ml

Imagem personalizada:
foto enviada da Coca-Cola

Resultado:
→ exibir a foto personalizada da Coca-Cola

```

A imagem padrão da categoria não será apagada quando uma imagem personalizada for adicionada.

Ela continuará disponível como fallback.

---

## Prioridade da imagem

A interface deverá resolver a imagem do produto nesta ordem:

```text

1. Imagem personalizada do produto

2. Imagem padrão da categoria,
   quando o produto estiver configurado para utilizá-la

3. Sem imagem / placeholder neutro

```

Não copiar a imagem padrão da categoria para o cadastro do produto.

Ela continua sendo um recurso da categoria.

---

## Trocar imagem personalizada

Quando já existir uma imagem personalizada:

1\. selecionar ****Trocar imagem****;

2\. escolher novo arquivo;

3\. validar;

4\. mostrar preview;

5\. enviar;

6\. atualizar a referência do produto;

7\. remover o arquivo anterior do Storage quando o fluxo de upload confirmar a substituição com sucesso.

A troca não deverá afetar a imagem padrão da categoria.

---

## Remover imagem personalizada

Ao selecionar ****Remover imagem****, se a categoria possuir imagem padrão, oferecer:

```text

O que deseja exibir no produto?

(●) Usar imagem padrão da categoria
( ) Ficar sem imagem

[Cancelar] [Remover imagem]

```

Se escolher:

****Usar imagem padrão da categoria****

o produto deverá:

- remover a referência da imagem personalizada;

- voltar a utilizar a imagem padrão da categoria.

Se escolher:

****Ficar sem imagem****

o produto deverá:

- remover a referência da imagem personalizada;

- não utilizar a imagem padrão da categoria;

- apresentar estado sem imagem ou placeholder neutro na interface.

Se a categoria não possuir imagem padrão, não é necessário oferecer a opção de voltar para uma imagem inexistente. Nesse caso, após remover a personalizada, o produto fica sem imagem.

---

## Alteração da categoria do produto

Se o produto não possuir imagem personalizada e estiver configurado para utilizar a imagem padrão da categoria, mudar a categoria deverá alterar automaticamente o fallback visual.

Exemplo:

```text

Antes:
Categoria = Pomada
→ imagem padrão de Pomada

Depois:
Categoria = Shampoo
→ imagem padrão de Shampoo

```

Se o produto possuir imagem personalizada, mudar a categoria não deverá substituir automaticamente essa imagem.

---

## Venda abaixo do custo

Permitida com aviso:

*> O preço de venda está abaixo do preço de custo. Deseja continuar?*

---

## Estoque baixo

Se houver estoque mínimo definido e:

`estoque_atual <= estoque_minimo`

mostrar:

****Estoque baixo****

Se:

`estoque_atual = 0`

mostrar:

****Sem estoque****

---

## Editar

A quantidade atual não deverá ser alterada pela edição comum do produto.

Utilizar:

- Reposição;

- Ajuste;

- Perda;

- Venda;

- Reversão de venda.

A edição comum poderá alterar:

- dados textuais;

- categoria;

- preços;

- estoque mínimo;

- imagem personalizada;

- preferência de uso da imagem padrão da categoria;

- status;

- visibilidade pública.

---

## Inativar

Produto inativo:

- não aparece no PDV;

- não aparece publicamente;

- permanece no histórico.

---


# 17. Adicionar estoque / REPOSICAO

Esta funcionalidade pertence a:

```text
Operação
→ Estoque
```

Na interface, apresentar a ação como **Adicionar estoque** ou **Repor** quando o contexto indicar necessidade de reposição.

## Campos

- Produto;
- Quantidade adicionada;
- Custo unitário opcional;
- Observação opcional.

Quantidade:

- inteira;
- maior que 0.

## Comportamento

1. mostrar estoque atual;
2. usuário informa a quantidade adicionada;
3. se informar custo unitário, calcular apenas a referência de custo da reposição;
4. mostrar o novo estoque previsto;
5. confirmar em **Registrar movimentação**;
6. backend valida e registra `REPOSICAO`;
7. estoque é atualizado;
8. histórico é atualizado.

A reposição **não cria despesa ou saída financeira automaticamente**.

Caso a compra de estoque precise ser considerada no Financeiro, o usuário registra uma despesa separadamente.

---


# 18. Corrigir contagem / AJUSTE

Usar quando o estoque físico não coincide com o saldo do sistema.

## Campos

- Produto;
- Direção: Entrada (+) ou Saída (-);
- Quantidade da diferença;
- Observação opcional.

A quantidade informada é a diferença a corrigir, e não o novo saldo absoluto.

Exemplo:

```text
Estoque do sistema: 12
Contagem física: 10
Direção: Saída
Quantidade: 2
Novo estoque: 10
```

Regras:

- quantidade maior que 0;
- saída não pode tornar estoque negativo;
- registrar `AJUSTE` no histórico;
- não criar saída financeira automática.

---


# 19. Registrar perda / PERDA

Usar quando unidades deixam de estar disponíveis para venda por dano, descarte, quebra ou situação equivalente.

## Campos

- Produto;
- Quantidade perdida;
- Observação opcional.

Regras:

- quantidade inteira e maior que 0;
- não pode ultrapassar estoque disponível;
- reduzir estoque;
- registrar `PERDA`;
- não criar despesa financeira automática.

A compra do item e a perda física são eventos distintos. A perda não deve criar uma segunda saída de caixa.

---


# 20. Histórico de estoque

A área de Estoque deverá permitir consultar movimentações.

Tipos internos previstos:

- `REPOSICAO`;
- `VENDA`;
- `AJUSTE`;
- `PERDA`;
- `REVERSAO_VENDA`.

A interface poderá usar rótulos mais simples:

- Adição de estoque;
- Venda;
- Correção de contagem;
- Perda;
- Reversão de venda.

Cada registro poderá apresentar:

- produto;
- data e horário;
- tipo;
- quantidade;
- saldo resultante quando útil;
- observação quando existir.

A tela principal deverá permitir busca e filtros por situação, tipo e categoria, além de abrir detalhes do produto ao clicar no item.

---


# 21. PDV — Comanda

O módulo **PDV** possui duas áreas principais:

```text

Nova venda

Histórico de vendas

```

A comanda abaixo representa a área **Nova venda**.

## Estado inicial

- comanda vazia;

- botão ****Finalizar**** desabilitado.

---

## Adicionar serviço

Ao selecionar:

- adicionar o serviço à comanda;

- cada serviço poderá aparecer somente uma vez na mesma comanda;

- serviços não possuem controle de quantidade;

- se já estiver presente, não adicionar novamente.

---

## Adicionar produto

- começa com quantidade 1;

- permitir aumentar a quantidade;

- não permitir ultrapassar o estoque disponível.

---

## Quantidade de produto

`+` aumenta.

`-` reduz.

Quantidade zero remove o produto da comanda.

---

## Remover

Remove apenas da comanda temporária.

Nenhuma alteração de banco ocorre antes da finalização da venda.

---

## Subtotal de produto

`quantidade × preço`

Para serviços, utilizar o preço do serviço uma única vez.

---

## Total

Soma dos subtotais.

---

## Forma de pagamento

Opcional.

Valores suportados:

- Pix;

- Dinheiro;

- Débito;

- Crédito;

- Outro.

Na interface do PDV, as formas configuradas como aceitas pela barbearia deverão ser priorizadas para agilizar o registro.

A forma registrada na venda representa o meio efetivamente utilizado naquela operação e não altera, por si só, a configuração geral das formas aceitas pela barbearia.

---

## Observação

- opcional;

- máximo de 200 caracteres.

---


# 22. Finalizar venda

A ação **Finalizar venda** significa que a comanda terminou de ser montada e o barbeiro deseja seguir para a etapa de confirmação.

Ela não deverá gravar a venda imediatamente.

Fluxo:

```text
Comanda com itens
→ Finalizar venda
→ escolher forma de pagamento
→ Confirmar venda
→ backend valida
→ venda CONCLUIDA
→ movimentações de estoque dos produtos
→ feedback de sucesso
```

A seleção da forma de pagamento pode aparecer em modal, drawer ou bottom sheet conforme o dispositivo.

Formas previstas:

- Pix;
- Dinheiro;
- Débito;
- Crédito;
- Outro.

O backend recalcula os valores e valida o estoque antes de concluir.

---


# 23. Histórico de vendas

O Histórico pertence a:

```text
PDV
→ Histórico de vendas
```

## Objetivo

Consultar vendas registradas sem transformar essa tela em relatório financeiro.

## Busca e filtros

Permitir:

- buscar venda;
- Hoje, Semana, Mês, Ano e Personalizado;
- Todas, Concluídas e Canceladas;
- filtro de forma de pagamento quando útil.

## Listagem

Cada venda deverá mostrar, no mínimo:

- referência da venda;
- data e horário;
- itens principais;
- forma de pagamento;
- status;
- total.

## Detalhes

Ao selecionar uma venda, abrir painel, drawer ou bottom sheet com:

- referência;
- data e horário;
- status;
- forma de pagamento;
- itens;
- quantidade;
- preço unitário registrado na venda;
- subtotal;
- total.

Não mostrar:

- custo interno do produto;
- lucro por item;
- operador de caixa não existente no MVP;
- comprovante fiscal eletrônico;
- webhook fiscal;
- descontos/cupons não definidos;
- acréscimos não definidos.

---


# 24. Vendas canceladas no histórico

O sistema possui o status `CANCELADA`, portanto vendas canceladas podem permanecer visíveis e consultáveis no Histórico.

O protótipo atual não apresenta botão **Cancelar venda** ou **Estornar venda**.

Não criar essa ação na interface até existir um fluxo de cancelamento aprovado que defina:

- quem pode cancelar;
- confirmação;
- impacto no estoque;
- criação de `REVERSAO_VENDA`;
- impacto financeiro;
- rastreabilidade.

Enquanto isso, a tela deve apenas saber representar o status Cancelada quando um registro com esse estado existir.

---


# 25. Financeiro e despesas

Despesas pertence à área:

```text

Configurações
→ Financeiro

```

O módulo de Despesas registra as saídas financeiras da barbearia.

As despesas podem ser:

- avulsas;

- recorrentes.

---

## Campos da despesa avulsa

- Nome - obrigatório;

  - identifica a despesa;

  - se a categoria for Outros, deve deixar claro qual foi o gasto.

- Descrição - opcional.

- Categoria - obrigatória;

  - Aluguel;

  - Água;

  - Energia;

  - Internet;

  - Equipamentos;

  - Materiais de consumo;

  - Manutenção;

  - Marketing;

  - Impostos e taxas;

  - Estoque;

  - Outros.

- Valor - obrigatório;

  - maior que R$ 0,00.

- Data - obrigatória;

  - padrão: data atual;

  - permite data anterior;

  - não permite data futura.

---

## Categorias

As categorias são predefinidas pelo sistema.

No MVP, não será permitido criar categorias personalizadas de despesas.

### Outros

Utilizar quando o gasto não se encaixar nas demais categorias.

Exemplo:

```text

Nome: Compra de lâmpadas

Categoria: Outros

```

Não é necessário criar outro campo apenas para explicar a categoria.

### Estoque

Pode ser utilizada para despesas de compra de estoque quando o usuário registrar esse gasto manualmente no Financeiro.

Quando uma reposição ocorrer:

- atualizar estoque;

- calcular valor total;

- não registrar saída financeira automaticamente apenas porque houve uma reposição;

- quando houver gasto financeiro, registrar a despesa separadamente no Financeiro.

---

## Cadastrar despesa avulsa

1\. usuário abre Financeiro;

2\. seleciona ****Nova Despesa****;

3\. preenche os campos;

4\. confirma;

5\. backend valida;

6\. registra a despesa;

7\. atualiza indicadores financeiros.

---

## Editar despesa

Permite corrigir uma despesa já cadastrada.

Exemplo:

```text

Valor informado: R$ 200,00

Valor correto: R$ 100,00

```

Permitir alterar:

- Nome;

- Descrição;

- Categoria;

- Valor;

- Data.

Aplicar novamente as validações.

Após salvar:

- atualizar indicadores financeiros.

Uma despesa registrada manualmente para representar uma compra de estoque continua sendo um lançamento financeiro independente da reposição. Corrigir a reposição não altera automaticamente essa despesa.

---

## Excluir despesa

Utilizada quando uma despesa foi cadastrada por engano.

Exemplo:

- lançamento duplicado.

Antes de excluir:

- solicitar confirmação;

- informar que será removida dos cálculos financeiros.

Após confirmar:

- remover dos cálculos;

- atualizar indicadores.

Uma despesa manual relacionada a uma compra de estoque pode ser corrigida ou excluída pelo fluxo normal do Financeiro, sem alterar automaticamente a movimentação de reposição.

---

## 24.1 Despesas recorrentes

Permitem configurar gastos que costumam se repetir.

Exemplos:

- aluguel;

- internet;

- água;

- energia;

- assinaturas;

- outros gastos recorrentes.

### Campos

- Nome - obrigatório.

- Categoria - obrigatória;

  - utilizar as mesmas categorias das despesas.

- Valor previsto - obrigatório;

  - maior que R$ 0,00.

- Frequência - obrigatória;

  - Mensal no MVP.

- Dia do vencimento - obrigatório;

  - aceitar valores de 1 a 31.

- Descrição - opcional.

- Ativa;

  - Sim por padrão.

### Vencimentos em meses menores

Se o dia configurado não existir naquele mês, utilizar o último dia disponível.

Exemplos:

```text

Vencimento configurado: dia 31

Janeiro → 31/01

Fevereiro → 28/02 ou 29/02

Abril → 30/04

Maio → 31/05

```

---

## Funcionamento

A despesa recorrente representa uma previsão.

Ela não deve ser considerada dinheiro efetivamente gasto antes da confirmação do pagamento.

A cada período, gerar uma ocorrência:

`PENDENTE`

Exemplo:

```text

Nome: Internet

Valor previsto: R$ 100,00

Vencimento: 10/10/2026

Status: Pendente

```

A saída financeira somente será registrada quando o usuário confirmar o pagamento.

---

## Marcar como paga

Ao selecionar:

****Marcar como paga****

permitir:

- confirmar ou alterar o valor efetivamente pago;

- informar a data de pagamento;

- não permitir data futura.

Após confirmar:

- status passa para `PAGA`;

- registrar o valor efetivamente pago como saída;

- manter o valor previsto para referência.

Exemplo:

```text

Valor previsto: R$ 100,00

Valor pago: R$ 105,37

Vencimento: 10/10/2026

Pagamento: 12/10/2026

Status: Paga

```

---

## Ignorar neste mês

Permite ignorar somente uma ocorrência.

Ao confirmar:

- não gerar saída financeira para aquela ocorrência;

- status passa para `IGNORADA`;

- manter recorrência ativa;

- próximas ocorrências continuam normalmente.

---

## Editar despesa recorrente

Permitir alterar para os próximos períodos:

- Nome;

- Categoria;

- Valor previsto;

- Dia do vencimento;

- Descrição.

Alterações não modificam períodos anteriores.

---

## Desativar despesa recorrente

Ao desativar:

- não gerar novas ocorrências;

- manter ocorrências anteriores;

- permitir reativação posteriormente.

---


# 26. Relatórios

Relatórios pertence à área:

```text

Configurações
→ Relatórios

```

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

---

## Serviço

Sem custo estimado:

`resultado estimado = preço cobrado`

Com custo:

`resultado estimado = preço cobrado - custo estimado no momento da venda`

---

## Produto

`resultado = (preço cobrado no momento da venda - custo do item no momento da venda) × quantidade`

---

## Compra de estoque

A compra de estoque afeta a saída de caixa somente quando o gasto correspondente for registrado no Financeiro.

Uma movimentação `REPOSICAO` isolada não cria esse lançamento automaticamente.

---

## Perda de estoque

A perda:

- não cria nova saída de caixa;
- permanece registrada no histórico de estoque;
- poderá aparecer em relatórios operacionais quando aplicável;
- não altera diretamente o card financeiro `Resultado estimado = Entradas - Saídas` sem um lançamento financeiro correspondente.

---

## Exportação

O relatório poderá ser exportado em:

- PDF;

- PNG.

### PDF

O PDF deve apresentar um relatório completo e organizado do período selecionado.

Conteúdo:

- nome da barbearia;

- período selecionado;

- data de geração;

- faturamento;

- entradas;

- saídas;

- resultado estimado;

- quantidade de serviços realizados;

- quantidade de bebidas vendidas;

- quantidade de outros produtos vendidos;

- despesas agrupadas por categoria;

- resumo dos resultados por origem.

O PDF deverá utilizar somente os dados correspondentes aos filtros aplicados.

### PNG

A exportação em PNG deverá gerar uma versão resumida e visual do relatório, adequada para visualização rápida e compartilhamento.

Conteúdo:

- nome da barbearia;

- período selecionado;

- faturamento;

- entradas;

- saídas;

- resultado estimado;

- principais indicadores;

- gráficos utilizados no resumo.

Informações excessivamente detalhadas não precisam aparecer na imagem.

Dados financeiros e internos nunca devem aparecer em conteúdos públicos ou na Vitrine Digital.

---


# 27. Configurações da barbearia

Esta área pertence a:

```text

Configurações
→ Barbearia

```

As Configurações da Barbearia representam informações do estabelecimento e não da conta de autenticação do usuário.

## Campos

- Nome da marca;

- Nome profissional;

- Descrição;

- WhatsApp;

- Instagram;

- Atende a domicílio;

- Formas de pagamento aceitas;

- CEP;

- Rua/Logradouro;

- Número ou opção sem número;

- Bairro;

- Cidade;

- Estado;

- Complemento;

- Horários de atendimento;

- Logo;

- Capa.

Dados utilizados publicamente deverão ser identificados claramente na interface.

Alterações nesses dados poderão refletir na Vitrine, quando a informação correspondente estiver sendo exibida publicamente.

As formas de pagamento aceitas deverão poder ser alteradas nessa área. A alteração afeta as opções atuais da barbearia, mas não modifica a forma de pagamento registrada em vendas anteriores.

Alterar o nome da barbearia não deve alterar automaticamente uma URL pública da Vitrine já criada.

---


# 28. Perfil e conta

A área pessoal do usuário é **Sua conta** e não pertence a Configurações.

Acesso conceitual:

```text
Menu da conta
→ Minha conta
```

Conteúdo:

```text
Perfil
Aparência
Alterar senha
Minha assinatura
Zona de perigo
```

O Logout permanece disponível no menu rápido da conta.

## Perfil

Permitir alterar dados pessoais/profissionais previstos pelo modelo atual, sem permitir mudar o tipo `BARBEIRO | ADMIN`.

## Aparência

Permitir:

- Claro;
- Escuro;
- Padrão do Sistema.

## Alterar senha

Utilizar fluxo seguro apropriado ao Supabase Auth.

## Zona de perigo

A exclusão da conta fica visualmente separada e não aparece como ação direta no menu rápido.

---


# 29. Administração da Vitrine Digital

A administração da Vitrine pertence à área:

```text

Configurações
→ Vitrine Digital

```

O Portfólio permanece como parte da Vitrine e não como módulo principal independente.

## Definição

A Vitrine Digital é o perfil público da barbearia.

Ela existe para:

- divulgar o trabalho;

- apresentar serviços;

- apresentar produtos;

- mostrar Portfólio;

- informar localização e horários;

- informar formas de pagamento aceitas;

- facilitar contato.

Não realiza:

- venda online;

- agendamento;

- pagamento online.

---

## Administração

Permitir:

- Gerar URL quando ainda não existir;

- Publicar;

- Despublicar;

- Copiar link;

- Editar dados públicos;

- selecionar seções;

- controlar serviços públicos;

- controlar produtos públicos;

- gerenciar Portfólio;

- visualizar prévia;

- configurar Assistente IA.

---

## Slug

Formato:

`/{slug}`

O slug deverá ser gerado automaticamente utilizando:

- nome da barbearia normalizado;

- identificador público curto e único.

Exemplo:

```text

Nome: Barbearia Imperial

Identificador público: a7k9

/barbearia-imperial-a7k9

```

Regras:

- letras minúsculas;

- números;

- hífens;

- sem espaços;

- sem acentos;

- sem caracteres especiais;

- único;

- palavras reservadas do sistema não podem ser utilizadas isoladamente.

Exemplos de palavras reservadas:

- login;

- cadastro;

- dashboard;

- admin;

- api.

Não utilizar o UUID interno completo da barbearia na URL pública.

### Alteração do nome da barbearia

Depois que a Vitrine for criada, alterar o nome da barbearia não deve modificar automaticamente o slug existente.

Isso evita quebrar links já divulgados.

---

## Produto sem estoque

O barbeiro deverá escolher uma regra global.

### Ocultar

Quando estoque for 0:

- não exibir o produto.

### Mostrar como Indisponível

Quando estoque for 0:

- manter produto visível;

- exibir indicação ****Indisponível****;

- não aparentar que pode ser comprado.

Padrão:

****Mostrar como Indisponível****

A regra aplica-se somente a produtos com ****Exibir na Vitrine = Sim****.

---


# 30. Criar e publicar Vitrine

## Fluxo

1\. usuário acessa as configurações da Vitrine;

2\. configura as informações desejadas;

3\. visualiza a prévia;

4\. seleciona ****Gerar URL****;

5\. sistema identifica informações opcionais não cadastradas;

6\. se existirem informações ausentes:

   - listar somente as que estiverem faltando;

   - informar que não serão exibidas;

   - perguntar se deseja continuar;

7\. usuário poderá:

   - voltar e preencher;

   - continuar;

8\. ao continuar:

   - mostrar estado ****Criando sua Vitrine...****;

   - backend gera slug;

   - verifica palavras reservadas;

   - garante unicidade;

   - cria a Vitrine;

   - publica;

   - gera URL pública;

9\. após sucesso:

   - informar que está pronta;

   - mostrar URL;

   - permitir copiar;

   - permitir visualizar.

---

## Informações opcionais não cadastradas

Informações opcionais ausentes não impedem a criação.

Exemplo:

*> Algumas informações ainda não foram cadastradas e não serão exibidas na sua Vitrine:*

A lista poderá incluir, quando realmente estiverem ausentes:

- Nome profissional;

- Instagram;

- Logo;

- Imagem de capa;

- Descrição da barbearia;

- Serviços;

- Produtos;

- Portfólio.

Não listar como ausentes informações obrigatórias que já foram validadas no cadastro ou onboarding.

Mensagem:

*> Deseja criar a Vitrine mesmo assim?*

Ações:

- ****Voltar e preencher****;

- ****Continuar****.

---

## Estado de criação

Após confirmar:

*> Criando sua Vitrine...*

Durante o processamento:

- impedir novo envio;

- não permitir múltiplos cliques;

- gerar slug;

- validar slug;

- criar perfil público;

- publicar;

- gerar URL.

---

## Sucesso

Mensagem:

*> Sua Vitrine está pronta!*

Exibir a URL.

Ações:

- ****Copiar URL****;

- ****Visualizar Vitrine****.

---

## Erro

Se não for possível concluir:

*> Não foi possível criar sua Vitrine. Tente novamente.*

Permitir nova tentativa sem perder as configurações preenchidas.

---


# 31. Despublicar Vitrine

Mensagem:

*> Ao despublicar, visitantes não poderão acessar sua Vitrine até que ela seja publicada novamente.*

Ao confirmar:

- definir como despublicada;

- manter dados cadastrados;

- manter slug;

- manter URL reservada;

- bloquear conteúdo público.

Ao publicar novamente:

- utilizar a mesma URL existente.

---


# 32. Portfólio

O Portfólio pertence à área:

```text

Configurações
→ Vitrine Digital
→ Portfólio

```

## Campos

- Imagem - obrigatória;

  - JPG/JPEG;

  - PNG;

  - WebP;

  - máximo 10 MB.

- Descrição - opcional.

- Serviço relacionado - opcional;

  - deve pertencer à mesma barbearia.

- Publicado;

  - Sim;

  - Não.

---

## Adicionar

1\. selecionar imagem;

2\. validar formato e tamanho;

3\. enviar ao Storage;

4\. informar descrição quando desejado;

5\. relacionar serviço quando desejado;

6\. selecionar publicação;

7\. salvar.

---

## Ocultar

- manter no painel;

- remover da Vitrine.

---

## Publicar

- tornar público novamente.

---

## Excluir

- solicitar confirmação;

- remover registro;

- remover arquivo do Storage quando apropriado.

---


# 33. Sem internet

Ao detectar perda de conexão:

*> Você está sem conexão com a internet.*

Bloquear operações críticas de gravação.

No PDV:

- preservar comanda em memória enquanto a página continuar aberta, quando possível;

- não finalizar venda;

- não criar venda offline;

- não realizar sincronização posterior no MVP.

---


# 34. Manutenção

Quando `MAINTENANCE_MODE` estiver ativo:

- exibir página de manutenção;

- bloquear áreas definidas;

- não mostrar detalhes técnicos.

Mensagem:

*> Estamos realizando uma manutenção no sistema.*

Motivo público:

- opcional.

Previsão:

- opcional.

---


# 35. Responsabilidade frontend/backend

## Frontend

Responsável por:

- interface;

- feedback imediato;

- validações de experiência;

- Loading;

- mensagens;

- estado temporário da comanda;

- responsividade.

O frontend não é fonte confiável para:

- preços;

- custos;

- permissões;

- tipo de usuário;

- barbearia;

- estoque final;

- resultado financeiro.

---

## Backend

Responsável por:

- validar sessão;

- verificar tipo de usuário;

- determinar barbearia quando aplicável;

- validar dados;

- buscar valores atuais;

- aplicar regras;

- persistir alterações;

- garantir operações atômicas;

- impedir acesso cruzado;

- validar ações administrativas;

- chamar serviços que utilizem segredos.

A preparação detalhada do frontend será definida no documento próprio ****Preparação Frontend para Backend****.

---


# 36. Planos e permissões

## Plano Grátis

Permite criar e manter Vitrine, Portfólio, serviços e produtos para divulgação. Produto no Grátis não possui quantidade, estoque mínimo, movimentação ou venda pelo PDV.

Quando uma assinatura paga termina, Dashboard, histórico de vendas, estoque, financeiro e relatórios continuam exibindo os dados anteriores em somente leitura. Filtros permanecem disponíveis; criação, edição, exclusão, movimentação e exportação ficam bloqueadas.

Os destinos pagos continuam na navegação com indicação de bloqueio. Ao abrir um deles, usar o componente de recurso bloqueado com texto específico e ação `Conhecer Plano Normal`.

## Plano Normal

Libera todos os recursos de gestão da versão inicial, sem Assistente IA.

## Plano Com IA

Libera tudo do Normal e o Assistente IA na Vitrine Pública.


# 37. Fluxo de assinatura

## Visualização

`Sua conta → Minha assinatura` mostra plano efetivo, validade, mudança futura, cancelamento agendado e pagamentos reais. `Alterar plano` abre modal ou drawer com Grátis, Normal e Com IA.

## Pagamento manual

O barbeiro não confirma o próprio pagamento. O ADMIN informa data real e valor recebido. A validade começa na data do pagamento, preserva o dia-base e não perde dias em renovação antecipada.

## Upgrade

Normal para Com IA é aplicado imediatamente após confirmação administrativa, sem alterar o vencimento.

## Downgrade

Com IA para Normal fica agendado para o vencimento e pode ser cancelado antes. Se não houver novo pagamento confirmado na data, o plano efetivo passa ao Grátis.

## Cancelamento

Cancelar assinatura mantém o plano até o fim do ciclo e pode ser desfeito antes. No vencimento, retorna ao Grátis. Cancelar assinatura nunca exclui conta nem dados.

## Cortesia inicial

O primeiro barbeiro recebe um ciclo do Normal ativado pelo ADMIN no momento em que o link do sistema pronto é enviado. A cortesia aparece como plano ativo, mas não como pagamento.


# 38. Código da barbearia

O backend gera `EG-XXXXXX` após a criação da barbearia. O código é imutável, copiável e visível somente ao responsável e ao ADMIN. A pesquisa administrativa aceita nome ou código. Nenhum código antigo é reutilizado.


# 39. Suspensão administrativa e efeito no barbeiro

Suspensão é independente do plano e não apaga dados. Após login, o barbeiro é enviado para `Conta suspensa`; Dashboard e demais módulos não são montados. A Vitrine fica indisponível. A reativação devolve o acesso.


# 40. Exclusão definitiva

## Pelo barbeiro

Fluxo:

```text
Sua conta
→ Zona de perigo
→ Excluir conta
→ informar senha atual
→ digitar EXCLUIR MINHA CONTA
→ confirmar exclusão definitiva
```

Antes de confirmar, exibir:

- remoção imediata da conta, Vitrine, dados operacionais e arquivos;
- impossibilidade de recuperação;
- encerramento imediato do acesso;
- ausência de reembolso automático, salvo direito legal;
- sugestão de cancelar a assinatura caso queira usar o período restante.

Após confirmar, o servidor retira a Vitrine do ar, invalida sessões, preserva somente os registros mínimos autorizados, elimina os dados operacionais e exclui o usuário do Auth.

## Pelo ADMIN

Não existe ação comum de exclusão nos detalhes. A exceção administrativa exige justificativa e confirmação `EXCLUIR EG-XXXXXX`. Para fraude, abuso, conteúdo ilegal ou segurança, suspender primeiro e preservar apenas evidência necessária.

## Depois da exclusão

A conta não aparece na lista de barbearias e não pode ser restaurada. Pagamentos e ações essenciais ficam por cinco anos em área técnica restrita, com código, nome e e-mail. Depois são apagados completamente. Backups antigos aguardam expiração automática e não podem reconstruir intencionalmente a conta.


# 41. Assistente IA — regras que afetam o barbeiro

O conteúdo da conversa existe somente na sessão atual e não é salvo no banco. O backend mantém contador de respostas por ciclo e identificadores temporários de proteção.

Regras iniciais:

- 1.000 respostas por ciclo da assinatura;
- máximo de 20 mensagens por conversa;
- proteção de 10 mensagens por minuto por visitante;
- aviso ao ADMIN em 80%;
- bloqueio em 100%, salvo extensão administrativa;
- timeout funcional de 15 segundos.


# 42. Estados globais finais

## Manutenção

Página sem sidebar ou navegação inferior. Pode mostrar motivo e previsão configurados pelo ADMIN. O ADMIN mantém acesso. Em falha crítica durante uso real, ativar manutenção, avisar o barbeiro, corrigir, validar e somente então reabrir.

## Offline

Estado global que cobre toda a interface, não exibe conteúdo atrás, oferece `Tentar novamente` e restaura a tela anterior quando a conexão voltar.

## 404

Página inexistente oferece `Voltar` e `Ir para o início`. Slug público inexistente usa `Vitrine não encontrada`.


# 43. Primeiro uso real

O barbeiro recebe o link temporário da Vercel, cria a própria conta, aceita os documentos, conclui o Onboarding e utiliza dados reais. O suporte ocorre por WhatsApp.

O sistema só entra nessa etapa com todo o núcleo Normal funcional, documentos publicados, RLS e isolamento aprovados, backup diário e restauração testada. Defeitos visuais pequenos podem ser corrigidos durante o acompanhamento; falhas críticas ou operacionais impedem o início.


# 44. Complementos consolidados do documento de fluxos detalhados

Esta seção preserva detalhes úteis que apareciam no documento complementar e que não contradizem a especificação principal.

## Recuperação de falha no cadastro

Se o usuário já tiver sido criado no Supabase Auth e a criação do perfil interno ou da barbearia falhar, uma nova tentativa deve **retomar/concluir o vínculo existente**, sem criar uma segunda barbearia para o mesmo usuário.

## Feedback e validação em cadastros

Nos fluxos de serviço, produto, categoria, despesa e demais cadastros:

- o frontend pode validar localmente para fornecer feedback rápido;
- o backend deve repetir as validações relevantes;
- a propriedade da barbearia deve ser confirmada pelo backend;
- sessão expirada, falha de rede e falha no servidor devem produzir mensagens seguras, sem detalhes internos.

## Diretrizes específicas de interface

### Serviços

- Desktop: modal, drawer ou página lateral são aceitáveis quando coerentes com o Design System;
- Mobile: preferir tela inteira ou bottom sheet com rolagem confortável.

### Produtos

No Mobile, separar visualmente upload de imagem e campos do produto para evitar formulário excessivamente longo e confuso.

### PDV

No Desktop, catálogo e comanda podem permanecer visíveis simultaneamente. No Mobile, priorizar cards tocáveis, total próximo à ação de concluir e não depender de hover.

### Vitrine

No Desktop, a prévia pode ser exibida lado a lado com a edição quando houver espaço. No Mobile, preferir edição por seções e uma ação clara de pré-visualização.

### Portfólio

Falhas de upload, arquivo inválido, arquivo acima do limite definido ou sessão expirada devem preservar o contexto do usuário e permitir nova tentativa sem expor detalhes técnicos.

## Conflitos antigos já consolidados

O documento complementar possuía duas regras antigas que **não devem prevalecer**:

1. **Cancelar venda:** havia um fluxo completo de cancelamento/estorno. A especificação principal atual determina que o protótipo pode representar o status `CANCELADA`, mas **não deve oferecer botão Cancelar venda/Estornar venda até existir um fluxo aprovado** com impacto em estoque, financeiro e rastreabilidade.
2. **Reposição de estoque e financeiro:** havia a possibilidade de registrar saída de caixa no mesmo fluxo. A regra atual é que uma `REPOSICAO` **não cria despesa ou saída financeira automaticamente**. Se houver gasto, ele deve ser registrado separadamente no Financeiro.

---

# 45. Estados do sistema que afetam o barbeiro

Os estados abaixo devem existir de forma explícita na implementação e na prototipação. Eles não são intercambiáveis.

## 45.1 Recurso bloqueado no Plano Grátis

A conta continua **Ativa**. O bloqueio ocorre apenas porque o recurso pertence ao Plano Normal ou Com IA.

- destinos pagos permanecem visíveis na navegação;
- dados históricos dos módulos pagos permanecem disponíveis em modo somente leitura quando existirem;
- filtros históricos continuam funcionando;
- criação, edição, exclusão, movimentação e exportação ficam bloqueadas conforme a regra do Plano Grátis;
- o componente deve explicar qual plano libera o recurso e oferecer ação para conhecer/alterar o plano;
- não usar linguagem de inadimplência, suspensão ou erro.

## 45.2 Conta suspensa

Após autenticação válida, se a conta estiver suspensa:

- não montar Dashboard, PDV, Operação ou Configurações;
- exibir tela global sem sidebar e sem navegação inferior;
- mostrar a mensagem **“Sua conta está suspensa.”**;
- complementar com **“O acesso ao Estilo e Gestão foi temporariamente bloqueado.”**;
- orientar: **“Se acredita que isso aconteceu por engano, entre em contato com o suporte.”**;
- permitir contato com o suporte pelo canal oficial quando ele estiver definido;
- permitir **Sair da conta**;
- não expor motivo administrativo interno, IDs técnicos ou protocolo inventado;
- a Vitrine pública também fica indisponível enquanto a suspensão durar.

## 45.3 Manutenção

Quando o modo de manutenção estiver ativo para usuários comuns:

- substituir a aplicação por uma tela global;
- não exibir sidebar nem navegação inferior;
- mostrar **“Estamos em manutenção”**;
- explicar **“Estamos realizando melhorias no Estilo e Gestão.”**;
- motivo público é opcional e só aparece se configurado pelo ADMIN;
- previsão de retorno é opcional e pode estar ausente;
- pode oferecer **Tentar novamente**;
- não exibir countdown obrigatório, incident ID, protocolo, detalhes de infraestrutura ou dados da conta;
- o ADMIN mantém acesso à área administrativa.

## 45.4 Offline

Ao detectar perda de conexão:

- cobrir a interface com o estado global Offline;
- não exibir conteúdo autenticado por trás;
- mostrar **“Sem conexão com a internet”**;
- orientar o usuário a verificar a conexão e tentar novamente;
- oferecer **Tentar novamente**;
- quando a conexão voltar, restaurar a tela/contexto anterior sempre que possível;
- não criar venda offline nem sincronização posterior no MVP;
- uma comanda ainda não enviada pode permanecer apenas em memória enquanto a página continuar aberta, quando tecnicamente possível.

## 45.5 404 / Página não encontrada

Para rota inexistente:

- mostrar **“Página não encontrada”**;
- explicar **“O endereço pode estar incorreto ou a página pode não existir.”**;
- oferecer **Voltar** e **Ir para o início**;
- não exibir detalhes técnicos, rota interna, IDs ou stack trace.

---
