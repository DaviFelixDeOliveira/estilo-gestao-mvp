**# Banco de Dados — Estilo e Gestão**

**## Objetivo**

Este documento explica como o banco de dados do **\*\*Estilo e Gestão\*\*** deverá funcionar na aplicação real.

Ele serve como tradução técnica do arquivo *\`BANCO\_EXEMPLO.sql\`* para a implementação com PostgreSQL e Supabase.

O arquivo SQL apresenta de forma mais direta:

\- tabelas;

\- colunas;

\- tipos;

\- enums;

\- nulabilidade;

\- relacionamentos;

\- constraints iniciais.

Este documento explica principalmente:

\- responsabilidade de cada tabela;

\- integração com Supabase Auth;

\- tipos de usuário;

\- relacionamento entre usuário e barbearia;

\- progresso e persistência do Onboarding;

\- preferência de tema do usuário;

\- formas de pagamento aceitas pela barbearia;

\- imagem padrão opcional em *\`categorias_produto.imagem_padrao_path\`*;

\- imagem personalizada em *\`produtos.imagem_path\`*;

\- preferência de fallback em *\`produtos.usar_imagem_categoria\`*;

\- regra de prioridade entre imagem personalizada, imagem padrão da categoria e ausência de imagem;

\- isolamento entre barbearias;

\- funcionamento do estoque;

\- despesas avulsas e recorrentes;

\- histórico financeiro;

\- snapshots;

\- transações;

\- RLS;

\- autorização do Operador do SaaS;

\- leitura pública da Vitrine;

\- integração com Supabase Storage;

\- imagens padrão de categorias e regras de fallback de imagem dos produtos.

Não é necessário repetir aqui cada coluna existente no SQL.

\---

**# 1. Tecnologia**

O banco oficial será:

\`\`\`text

PostgreSQL

\`\`\`

hospedado através do:

\`\`\`text

Supabase

\`\`\`

O projeto não utilizará Prisma no MVP.

A aplicação poderá acessar o banco através:

\- da integração do Supabase com Next.js;

\- de código executado no servidor;

\- de funções SQL/RPC quando fizer sentido.

Operações críticas não deverão depender somente de alterações feitas pelo navegador.

\---

**# 2. Fonte de identidade**

As contas de autenticação serão mantidas pelo:

\`\`\`text

Supabase Auth

\`\`\`

O Supabase mantém internamente:

\`\`\`text

auth.users

\`\`\`

Essa estrutura será responsável por:

\- identificador da conta;

\- e-mail;

\- credenciais;

\- autenticação;

\- sessão.

A aplicação não deverá criar coluna própria para:

\- senha;

\- hash de senha;

\- token permanente de autenticação.

\---

**# 3. Perfil da aplicação**

A tabela:

\`\`\`text

perfis

\`\`\`

representa o usuário dentro das regras do Estilo e Gestão.

Ela deverá possuir relação com:

\`\`\`text

auth.users

\`\`\`

e armazenar informações próprias da aplicação.

Exemplos:

\- nome;

\- tipo do usuário;

\- barbearia vinculada quando aplicável;

\- progresso do Onboarding;

\- tema escolhido.

\---

**# 4. Tipos de usuário**

O sistema possui dois tipos de usuário no MVP:

\`\`\`text

BARBEIRO

ADMIN

\`\`\`

O tipo deverá ser armazenado no perfil da aplicação.

Exemplo conceitual:

\`\`\`text

auth.users

    │

    ▼

perfis

    │

    ├── tipo = BARBEIRO

    │

    └── tipo = ADMIN

\`\`\`

\---

**# 5. Tipo padrão**

Todo cadastro realizado através do fluxo público deverá gerar:

\`\`\`text

tipo = BARBEIRO

\`\`\`

O frontend não deverá possuir autoridade para criar:

\`\`\`text

tipo = ADMIN

\`\`\`

No MVP, a alteração para *\`ADMIN\`* será realizada manualmente no banco de dados.

O próprio usuário não poderá alterar seu tipo pela aplicação.

\---

**# 6. Relação entre perfil e barbearia**

Para contas do tipo:

\`\`\`text

BARBEIRO

\`\`\`

o perfil deverá estar associado a uma barbearia.

Fluxo:

\`\`\`text

auth.users

    │

    ▼

perfis

    │

    ▼

barbearias

\`\`\`

No MVP:

\`\`\`text

1 BARBEIRO

     ↓

1 barbearia

\`\`\`

Não haverá equipe com vários barbeiros utilizando a mesma barbearia.

\---

**# 7. Perfil ADMIN**

Uma conta:

\`\`\`text

ADMIN

\`\`\`

representa o Operador do SaaS.

Ela não precisa possuir uma barbearia própria.

Portanto, conceitualmente:

\`\`\`text

BARBEIRO

→ barbearia\_id obrigatório

ADMIN

→ barbearia\_id nulo

\`\`\`

A migration deverá possuir uma regra que mantenha essa relação consistente.

Não deve existir:

\`\`\`text

tipo = BARBEIRO

barbearia\_id = null

\`\`\`

em uma conta ativa normalmente configurada.

\---

**# 8. Fluxo de identificação após Login**

Após autenticar pelo Supabase Auth:

\`\`\`text

auth.uid()

   ↓

perfis

   ↓

tipo

\`\`\`

Se:

\`\`\`text

tipo = BARBEIRO

\`\`\`

o sistema deverá:

\- localizar a barbearia;

\- verificar o Onboarding;

\- aplicar as regras do tenant.

Se:

\`\`\`text

tipo = ADMIN

\`\`\`

o sistema deverá:

\- validar a autorização administrativa;

\- utilizar o fluxo do Painel Administrativo.

\---

**# 9. Tema do sistema**

A preferência de tema pertence ao usuário, não à barbearia.

Por isso deverá ficar associada ao perfil através de:

\`\`\`text

perfis.tema

\`\`\`

Valores previstos:

\`\`\`text

CLARO

ESCURO

SISTEMA

\`\`\`

Padrão:

\`\`\`text

SISTEMA

\`\`\`

Quando *\`SISTEMA\`* estiver selecionado, a interface utiliza a preferência do dispositivo.

A escolha realizada durante o Onboarding deverá ser persistida no perfil e continuar aplicada nos acessos seguintes.

O usuário poderá alterar essa preferência posteriormente nas configurações da própria conta.

A escolha de tema da área autenticada não controla automaticamente a aparência pública da Vitrine Digital.

\---

**# 10. Onboarding**

O progresso do Onboarding também pertence ao perfil do barbeiro.

O banco poderá armazenar:

\`\`\`text

onboarding\_etapa

onboarding\_concluido

\`\`\`

Isso permite:

\`\`\`text

Login

 ↓

Onboarding concluído?

 ↓ não

Retomar etapa salva

\`\`\`

O Onboarding deverá considerar as 6 etapas atualmente definidas:

\`\`\`text

1. Dados da barbearia

2. Endereço

3. Horários de funcionamento

4. Serviços

5. Produtos e formas de pagamento

6. Aparência e conclusão

\`\`\`

A etapa 6 deverá salvar a preferência de tema em *\`perfis.tema\`*.

Ao concluir todas as etapas:

\`\`\`text

onboarding_concluido = true

\`\`\`

Enquanto o fluxo não estiver concluído, *\`onboarding_etapa\`* permite retomar a etapa pendente no próximo Login.

\---

**# 11. Tenant**

A entidade principal de isolamento dos dados comerciais é:

\`\`\`text

barbearia

\`\`\`

Cada barbearia representa um tenant do SaaS.

Dados da operação deverão estar associados a:

\`\`\`text

barbearia\_id

\`\`\`

quando aplicável.

\---

**# 12. Dados pertencentes à barbearia**

Exemplos:

\- serviços;

\- categorias de produtos;

\- produtos;

\- vendas;

\- despesas;

\- despesas recorrentes;

\- ocorrências recorrentes;

\- movimentações de estoque;

\- Portfólio;

\- horários de funcionamento;

\- formas de pagamento aceitas pela barbearia.

\---

**# 13. Por que utilizar** *\`barbearia\_id\`*

Mesmo existindo apenas um barbeiro por barbearia no MVP, associar dados ao estabelecimento evita vincular toda a estrutura permanentemente à conta de autenticação.

Exemplo:

\`\`\`text

Barbearia A

├── Serviço A

├── Produto A

└── Venda A

Barbearia B

├── Serviço B

├── Produto B

└── Venda B

\`\`\`

A Barbearia A não pode acessar registros da Barbearia B.

\---

**# 14. Estrutura conceitual**

\`\`\`text

auth.users

    │

    ▼

perfis

    │

    ├── ADMIN

    │     └── Painel Administrativo

    │

    └── BARBEIRO

          │

          ▼

      barbearias

          │

          ├── servicos

          │

          ├── categorias\_produto

          │      └── produtos

          │

          ├── vendas

          │      └── venda\_itens

          │

          ├── despesas

          │

          ├── despesas\_recorrentes

          │      └── ocorrencias\_despesas\_recorrentes

          │

          ├── movimentacoes\_estoque

          │

          ├── portfolio

          │

          ├── horarios\_funcionamento

          │

          └── barbearia\_formas\_pagamento

\`\`\`

\---

**# 15. Tabela** *\`barbearias\`*

Responsável pelas informações gerais do estabelecimento.

Também concentra configurações simples relacionadas à Vitrine Digital.

Exemplos:

\- nome da marca;

\- nome profissional;

\- descrição pública;

\- WhatsApp;

\- Instagram;

\- endereço;

\- atendimento a domicílio;

\- formas de pagamento aceitas, através de estrutura relacionada;

\- slug;

\- publicação da Vitrine;

\- comportamento de produtos sem estoque;

\- logo;

\- capa;



\- estado da conta.

\---

**# 15.1 Tabela** *\`barbearia_formas_pagamento\`*

Responsável por registrar quais formas de pagamento a barbearia informa aceitar normalmente.

Essa informação é diferente da forma de pagamento utilizada em uma venda específica.

Exemplo:

\`\`\`text

Barbearia Imperial
├── PIX
├── DINHEIRO
├── DEBITO
└── CREDITO

\`\`\`

A estrutura deverá relacionar:

\`\`\`text

barbearia_id
forma_pagamento

\`\`\`

Os valores previstos reutilizam o enum de formas de pagamento já utilizado no sistema:

\`\`\`text

PIX
DINHEIRO
DEBITO
CREDITO
OUTRO

\`\`\`

A combinação entre barbearia e forma de pagamento deverá ser única.

A ausência de uma forma nessa relação significa apenas que ela não foi configurada como aceita pela barbearia.

Não criar colunas booleanas separadas como:

\`\`\`text

aceita_pix
aceita_dinheiro
aceita_debito
aceita_credito

\`\`\`

A relação própria mantém a modelagem mais consistente e evita duplicação de estrutura.

As formas configuradas poderão ser utilizadas:

\- durante o Onboarding;

\- nas configurações da barbearia;

\- como opções sugeridas no PDV;

\- na Vitrine Digital pública;


A forma registrada em *\`vendas.forma_pagamento\`* continua representando somente como aquela venda específica foi paga.

\---

**# 16. Endereço**

O endereço deverá representar explicitamente se existe número.

A regra funcional utiliza:

\`\`\`text

tem\_numero = true

\`\`\`

quando houver número.

Nesse caso:

\`\`\`text

numero\_endereco != null

\`\`\`

Quando:

\`\`\`text

tem\_numero = false

\`\`\`

o campo deverá ser:

\`\`\`text

numero\_endereco = null

\`\`\`

Não armazenar:

\`\`\`text

"S/N"

\`\`\`

como número do endereço.

A expressão **\*\*Sem número\*\*** pertence à apresentação da interface.

\---

**# 17. Vitrine na tabela** *\`barbearias\`*

No escopo atual, não é necessária uma tabela exclusiva para a Vitrine.

Informações básicas já pertencem naturalmente à barbearia.

Outros conteúdos possuem estruturas próprias:

\`\`\`text

servicos

produtos

portfolio

horarios\_funcionamento

barbearia\_formas\_pagamento

\`\`\`

Se futuramente a Vitrine ganhar regras muito mais complexas, a modelagem poderá ser separada.

\---

**# 18. Slug da Vitrine**

O slug será utilizado na URL pública:

\`\`\`text

/{slug}

\`\`\`

Ele deverá:

\- ser único;

\- ser gerado automaticamente;

\- utilizar letras minúsculas;

\- permitir números;

\- permitir hífens;

\- não possuir espaços;

\- não possuir acentos;

\- não possuir caracteres especiais;

\- evitar palavras reservadas.

Exemplo:

\`\`\`text

barbearia-imperial-a7k9

\`\`\`

\---

**# 19. Identificador público do slug**

O slug poderá combinar:

\`\`\`text

nome normalizado

\+

identificador público curto

\`\`\`

Exemplo:

\`\`\`text

Barbearia Imperial

\+

a7k9

\=

barbearia-imperial-a7k9

\`\`\`

Não utilizar o UUID interno completo como parte obrigatória da URL pública.

\---

**# 20. Alteração do nome da barbearia**

Depois que o slug tiver sido criado, alterar:

\`\`\`text

nome\_marca

\`\`\`

não deverá alterar automaticamente o slug existente.

Isso evita quebrar links já divulgados.

\---

**# 21. Criação da Vitrine**

A Vitrine não precisa possuir slug desde a criação da barbearia.

Antes de o usuário selecionar:

\`\`\`text

Gerar URL

\`\`\`

o campo poderá permanecer:

\`\`\`text

slug = null

\`\`\`

Ao gerar:

1\. backend monta o slug;

2\. valida palavras reservadas;

3\. verifica unicidade;

4\. salva;

5\. publica a Vitrine.

\---

**# 22. Despublicação da Vitrine**

Ao despublicar:

\`\`\`text

vitrine\_publicada = false

\`\`\`

O slug deverá permanecer armazenado.

Ao publicar novamente:

\- utilizar a mesma URL;

\- não gerar outro slug automaticamente.

\---

**# 23. Produtos sem estoque na Vitrine**

A barbearia deverá armazenar a configuração de apresentação de produtos sem estoque.

Valores:

\`\`\`text

OCULTAR

INDISPONIVEL

\`\`\`

Padrão:

\`\`\`text

INDISPONIVEL

\`\`\`

Essa regra é aplicada somente a produtos:

\`\`\`text

ativo = true

visivel\_vitrine = true

\`\`\`

\---

**# 24. Tabela** *\`perfis\`*

Responsável pelas informações do usuário dentro da aplicação.

Pode armazenar:

\- *\`user\_id\`*;

\- *\`barbearia\_id\`*;

\- nome;

\- tipo;

\- tema;

\- progresso do Onboarding;

\- datas de criação e atualização.

Não guarda:

\- senha;

\- token permanente;

\- Secret Key;

\- credenciais externas.

\---

**# 25. Regra de** *\`tipo\`*

A coluna responsável pelo tipo deverá aceitar somente:

\`\`\`text

BARBEIRO

ADMIN

\`\`\`

Padrão:

\`\`\`text

BARBEIRO

\`\`\`

A aplicação pública não deverá permitir alteração livre desse valor.

\---

**# 26. Tabela** *\`servicos\`*

Representa serviços oferecidos.

Exemplos:

\`\`\`text

Corte

Barba

Sobrancelha

Corte + Barba

\`\`\`

Cada serviço poderá possuir:

\- nome;

\- descrição;

\- preço;

\- custo estimado de insumos;

\- status ativo;

\- visibilidade na Vitrine.

\---

**# 27. Serviço ativo e visível**

São conceitos diferentes.

\`\`\`text

ativo = true

visivel\_vitrine = true

\`\`\`

Pode ser utilizado no PDV e exibido publicamente.

\`\`\`text

ativo = true

visivel\_vitrine = false

\`\`\`

Pode ser utilizado no PDV, mas fica oculto da Vitrine.

\`\`\`text

ativo = false

\`\`\`

Não deverá:

\- ser utilizado em novas vendas;

\- aparecer na Vitrine.

O histórico permanece preservado.

\---

**# 28. Custo estimado do serviço**

O custo é opcional e representa somente materiais diretamente consumidos no atendimento.

Exemplo:

\`\`\`text

Preço cobrado: R$ 40,00

Custo estimado: R$ 2,00

\`\`\`

Não representa automaticamente:

\- aluguel;

\- energia;

\- internet;

\- salário;

\- demais custos indiretos.

Se não existir custo informado:

\`\`\`text

custo considerado = R$ 0,00

\`\`\`

para o cálculo estimado daquele item.

\---

**# 29. Categorias de produtos**

Categorias pertencem à barbearia.

Exemplos:

\`\`\`text

Bebida

Pomada

Shampoo

Cera

Acessórios

\`\`\`

Não utilizar enum SQL fixo porque o barbeiro poderá criar categorias próprias.

Cada categoria poderá possuir:

\- nome;

\- status ativo;

\- imagem padrão opcional.

A referência da imagem padrão deverá ser armazenada conceitualmente em:

\`\`\`text

categorias_produto.imagem_padrao_path

\`\`\`

A imagem padrão não representa uma foto enviada pelo barbeiro.

Ela funciona como um recurso visual fornecido pelo próprio Estilo e Gestão para categorias sugeridas pelo sistema.

Exemplo:

\`\`\`text

Categoria: Pomada

imagem_padrao_path:
sistema/categorias/pomada.webp

\`\`\`

Categorias sem imagem padrão deverão manter:

\`\`\`text

imagem_padrao_path = null

\`\`\`

\---

**# 30. Categorias sugeridas**

Sugestões poderão existir no código.

Exemplo:

\`\`\`ts

[

  "Bebida",

  "Pomada",

  "Shampoo",

  "Cera",

  "Óleo/Balm para barba",

  "Acessórios",

  "Outros"

]

\`\`\`

As categorias sugeridas poderão possuir imagens padrão mantidas pelo próprio sistema.

Exemplos conceituais:

\`\`\`text

Bebida
→ imagem genérica de bebida

Pomada
→ imagem genérica de pomada

Shampoo
→ imagem genérica de shampoo

Cera
→ imagem genérica de cera

Óleo/Balm para barba
→ imagem genérica relacionada à categoria

Acessórios
→ imagem genérica de acessórios

Outros
→ imagem neutra e não específica

\`\`\`

Uma sugestão somente precisa virar registro no banco quando a barbearia realmente utilizá-la.

Ao criar uma categoria a partir de uma sugestão oficial, o backend poderá associar automaticamente o respectivo:

\`\`\`text

imagem_padrao_path

\`\`\`

A imagem padrão deverá apontar para um recurso compartilhado do sistema.

Não é necessário duplicar fisicamente o mesmo arquivo no Storage de cada barbearia.

Exemplo:

\`\`\`text

Barbearia A
└── categoria Pomada
    └── imagem_padrao_path = sistema/categorias/pomada.webp

Barbearia B
└── categoria Pomada
    └── imagem_padrao_path = sistema/categorias/pomada.webp

\`\`\`

As duas categorias podem apontar para o mesmo arquivo oficial do sistema.

\---

**# 30.1 Imagens padrão do sistema**

As imagens padrão das categorias:

\- pertencem ao Estilo e Gestão;

\- não pertencem a uma barbearia específica;

\- são utilizadas apenas como fallback visual;

\- não devem ser modificadas ou excluídas pelo barbeiro;

\- podem ser substituídas visualmente por uma imagem personalizada do produto.

A aplicação deverá tratar esses arquivos como recursos administrados pelo sistema.

O caminho definitivo poderá variar durante a implementação, mas conceitualmente poderá seguir:

\`\`\`text

sistema/
  categorias/
    bebida.webp
    pomada.webp
    shampoo.webp
    cera.webp
    oleo-balm.webp
    acessorios.webp
    outros.webp

\`\`\`

A escolha dos arquivos finais pertence à implementação e ao Design System.

\---

**# 31. Categoria personalizada**

Exemplo:

\`\`\`text

Bonés

\`\`\`

Depois de criada, funciona como qualquer outra categoria.

No MVP, uma categoria criada manualmente pelo barbeiro começa sem imagem padrão:

\`\`\`text

imagem_padrao_path = null

\`\`\`

Não atribuir automaticamente uma imagem genérica a uma categoria personalizada.

O banco não precisa separar:

\`\`\`text

categoria padrão

categoria personalizada

\`\`\`

em tabelas diferentes.

A diferença de comportamento pode ser definida pela origem do cadastro no fluxo da aplicação e pela presença ou ausência de:

\`\`\`text

imagem_padrao_path

\`\`\`

Categorias personalizadas continuam pertencendo normalmente à barbearia.

\---

**# 32. Duplicidade de categoria**

Dentro da mesma barbearia, deverão ser consideradas equivalentes:

\`\`\`text

Bebida

bebida

 BEBIDA 

\`\`\`

A implementação deverá:

\- remover espaços externos;

\- ignorar diferença entre maiúsculas e minúsculas para verificar duplicidade.

Uma categoria sugerida já existente para a barbearia não deverá ser recriada apenas para obter novamente sua imagem padrão.

\---

**# 33. Tabela** *\`produtos\`*

Representa produtos físicos vendidos e controlados pelo estoque.

Exemplos:

\- bebidas;

\- pomadas;

\- shampoos;

\- produtos para barba;

\- acessórios.

Cada produto pertence a:

\`\`\`text

1 barbearia

\`\`\`

e:

\`\`\`text

1 categoria

\`\`\`

Cada produto poderá possuir uma imagem personalizada opcional através de:

\`\`\`text

produtos.imagem_path

\`\`\`

Também deverá existir uma configuração para definir se, na ausência de imagem personalizada, o produto pode utilizar a imagem padrão de sua categoria.

Conceitualmente:

\`\`\`text

produtos.usar_imagem_categoria

\`\`\`

Padrão:

\`\`\`text

true

\`\`\`

Essa configuração somente influencia a apresentação quando:

\`\`\`text

imagem_path = null

\`\`\`

\---

**# 33.1 Regra de imagem do produto**

A imagem exibida para um produto deverá seguir esta prioridade:

\`\`\`text

1. Existe imagem personalizada do produto?
   ↓ sim
   Usar produtos.imagem_path

2. Não existe imagem personalizada
   + usar_imagem_categoria = true
   + categoria possui imagem_padrao_path?
   ↓ sim
   Usar imagem padrão da categoria

3. Nenhuma das condições anteriores
   ↓
   Produto sem imagem
   ou placeholder neutro da interface

\`\`\`

Exemplo:

\`\`\`text

Produto:
Pomada Matte

imagem_path = null
usar_imagem_categoria = true

Categoria:
Pomada

imagem_padrao_path =
sistema/categorias/pomada.webp

Resultado:
→ exibir a imagem padrão de Pomada

\`\`\`

Se o barbeiro enviar uma imagem própria:

\`\`\`text

imagem_path =
barbearias/{barbeariaId}/produtos/{produtoId}.webp

\`\`\`

a imagem personalizada possui prioridade sobre a imagem padrão da categoria.

\---

**# 33.2 Remoção da imagem personalizada**

Ao remover uma imagem personalizada, o usuário deverá poder escolher entre:

\`\`\`text

Usar imagem padrão da categoria

ou

Ficar sem imagem

\`\`\`

Se escolher:

\`\`\`text

Usar imagem padrão da categoria

\`\`\`

o estado deverá ser:

\`\`\`text

imagem_path = null

usar_imagem_categoria = true

\`\`\`

Se escolher:

\`\`\`text

Ficar sem imagem

\`\`\`

o estado deverá ser:

\`\`\`text

imagem_path = null

usar_imagem_categoria = false

\`\`\`

Não copiar a imagem padrão da categoria para:

\`\`\`text

produtos.imagem_path

\`\`\`

A imagem padrão continua pertencendo à categoria e funciona somente como fallback.

Se uma categoria não possuir imagem padrão e:

\`\`\`text

usar_imagem_categoria = true

\`\`\`

o resultado visual será equivalente a não existir uma imagem disponível, devendo a interface utilizar o estado neutro definido pelo Design System.

\---

**# 34. Produto e categoria no mesmo tenant**

Não será válido:

\`\`\`text

Produto da Barbearia A

        ↓

Categoria da Barbearia B

\`\`\`

O backend deverá validar essa relação.

A migration real também deverá reforçar a consistência através de constraints ou estrutura relacional adequada sempre que possível.

\---

**# 35. Estoque atual**

A tabela *\`produtos\`* mantém:

\`\`\`text

estoque\_atual

\`\`\`

para consulta rápida.

Esse campo representa o saldo atual.

O histórico das alterações será mantido separadamente.

\---

**# 36. Estoque mínimo**

*\`estoque\_minimo\`* é opcional.

Quando existir:

\`\`\`text

estoque\_atual <= estoque\_minimo

\`\`\`

significa:

\`\`\`text

estoque baixo

\`\`\`

Quando:

\`\`\`text

estoque\_minimo = null

\`\`\`

o produto não deverá gerar alerta de estoque mínimo.

Não é necessária coluna:

\`\`\`text

estoque\_baixo

\`\`\`

pois esse estado pode ser calculado.

\---

**# 37. Alteração de estoque**

Depois do cadastro inicial, *\`estoque\_atual\`* não deverá ser editado livremente pela tela comum de produto.

Mudanças deverão ocorrer por operações específicas:

\`\`\`text

REPOSICAO

VENDA

AJUSTE

PERDA

REVERSAO\_VENDA

\`\`\`

\---

**# 38. Tabela** *\`movimentacoes\_estoque\`*

Toda alteração relevante de estoque deverá gerar um registro.

Isso permite responder:

\`\`\`text

Por que havia 10 unidades e agora existem 6?

\`\`\`

O histórico deverá preservar:

\- produto;

\- tipo;

\- quantidade alterada;

\- saldo anterior;

\- saldo posterior;

\- data e hora;

\- motivo quando aplicável;

\- venda relacionada quando aplicável;

\- valores históricos necessários quando houver impacto financeiro ou de resultado.

\---

**# 39. Tipos de movimentação**

O MVP possui:

\`\`\`text

REPOSICAO

VENDA

AJUSTE

PERDA

REVERSAO\_VENDA

\`\`\`

\---

**# 40. Exemplo de venda de estoque**

Antes:

\`\`\`text

estoque = 10

\`\`\`

Venda de 2:

\`\`\`text

quantidade\_delta = -2

saldo\_anterior = 10

saldo\_posterior = 8

tipo = VENDA

\`\`\`

\---

**# 41. Exemplo de reposição**

Antes:

\`\`\`text

estoque = 8

\`\`\`

Reposição:

\`\`\`text

quantidade = 10

\`\`\`

Depois:

\`\`\`text

quantidade\_delta = +10

saldo\_anterior = 8

saldo\_posterior = 18

tipo = REPOSICAO

\`\`\`

\---

**# 42. Reposição e custo**

Ao registrar uma reposição, o sistema recebe:

\- produto;

\- quantidade;

\- custo unitário.

O valor total será:

\`\`\`text

quantidade × custo unitário

\`\`\`

Exemplo:

\`\`\`text

10 unidades × R$ 15,00

\=

R$ 150,00

\`\`\`

\---

**# 43. Reposição e Financeiro**

Reposição de estoque e despesa financeira são registros independentes.

Ao registrar uma reposição, o sistema deverá criar somente a movimentação de estoque. Não criar despesa automática.

Quando a compra precisar aparecer no Financeiro, o barbeiro deverá cadastrar uma despesa separadamente, podendo utilizar a categoria `Estoque`.

Essa separação evita assumir que toda reposição representa uma saída paga naquele momento e impede lançamentos financeiros duplicados.

\---

**# 44. Rastreabilidade opcional da compra**

Uma despesa cadastrada manualmente poderá guardar uma referência opcional à movimentação de reposição para facilitar consulta e auditoria.

Essa referência não poderá criar, alterar ou excluir automaticamente nenhum dos dois registros.

\---

**# 45. Correção de reposição**

Corrigir uma reposição afeta apenas o estoque e sua movimentação. Se houver uma despesa manual relacionada, ela deverá ser corrigida separadamente no Financeiro, sempre com confirmação do usuário.

\---

**# 46. Perda de estoque**

Uma perda deverá:

\- reduzir estoque;

\- gerar movimento *\`PERDA\`*;

\- registrar data e hora automaticamente;

\- preservar o custo do produto no momento da perda.

Exemplo:

\`\`\`text

Custo no momento da perda = R$ 20,00

Quantidade perdida = 2

Valor da perda = R$ 40,00

\`\`\`

\---

**# 47. Snapshot financeiro da perda**

O custo utilizado para calcular uma perda histórica não poderá mudar quando o preço de custo do produto for alterado posteriormente.

Por isso, a movimentação deverá preservar informação suficiente para representar:

\`\`\`text

custo no momento da perda

\`\`\`

e:

\`\`\`text

valor total da perda

\`\`\`

quando aplicável.

\---

**# 48. Perda e fluxo de caixa**

A perda não gera uma segunda saída financeira.

Exemplo:

\`\`\`text

Compra do produto

→ R$ 20,00 de saída

Produto perdido posteriormente

→ prejuízo de estoque de R$ 20,00

→ nenhuma nova saída de caixa

\`\`\`

A perda afeta o resultado estimado, não o caixa novamente.

\---

**# 49. Ajuste de estoque**

O ajuste representa uma correção entre:

\`\`\`text

saldo registrado

\`\`\`

e:

\`\`\`text

quantidade física correta

\`\`\`

O movimento deverá preservar:

\- saldo anterior;

\- saldo posterior;

\- diferença;

\- motivo;

\- data e hora.

Não deverá ser utilizado para substituir reposição ou perda conhecida.

\---

**# 50. Tabela** *\`vendas\`*

Representa somente vendas efetivamente registradas.

Uma comanda em edição não existe nessa tabela.

Fluxo:

\`\`\`text

Comanda temporária

       ↓

Finalizar

       ↓

Backend valida

       ↓

vendas

\`\`\`

\---

**# 51. Status da venda**

O MVP possui somente:

\`\`\`text

CONCLUIDA

CANCELADA

\`\`\`

Não existe:

\`\`\`text

PENDENTE

\`\`\`

para representar uma comanda em edição.

A comanda pertence ao frontend até ser finalizada.

\---

**# 52. Forma de pagamento**

A forma de pagamento registrada em uma venda é opcional.

Ela representa como aquela venda específica foi paga e não deve ser confundida com as formas de pagamento que a barbearia aceita normalmente.

As formas aceitas pela barbearia pertencem à relação *\`barbearia_formas_pagamento\`*.

Valores previstos:

\`\`\`text

PIX

DINHEIRO

DEBITO

CREDITO

OUTRO

\`\`\`

Uma venda poderá permanecer sem forma de pagamento informada.

\---

**# 53. Tabela** *\`venda\_itens\`*

Uma venda poderá possuir vários itens.

Exemplo:

\`\`\`text

Venda 001

├── Corte

├── Barba

└── Coca-Cola x2

\`\`\`

O cabeçalho fica em:

\`\`\`text

vendas

\`\`\`

e os itens em:

\`\`\`text

venda\_itens

\`\`\`

\---

**# 54. Quantidade de serviço**

Serviços não possuem quantidade no fluxo atual.

Cada serviço poderá aparecer apenas uma vez por comanda.

Portanto:

\`\`\`text

tipo = SERVICO

→ quantidade = 1

\`\`\`

A migration deverá reforçar essa regra quando possível.

Produtos podem possuir:

\`\`\`text

quantidade > 1

\`\`\`

conforme estoque disponível.

\---

**# 55. Snapshot de venda**

*\`venda\_itens\`* deverá preservar os valores usados no momento da venda.

Exemplo:

Hoje:

\`\`\`text

Corte = R$ 40,00

\`\`\`

Venda realizada:

\`\`\`text

preco\_unitario\_snapshot = 40,00

\`\`\`

Posteriormente:

\`\`\`text

Corte = R$ 50,00

\`\`\`

A venda antiga continua:

\`\`\`text

R$ 40,00

\`\`\`

\---

**# 56. Dados preservados no item da venda**

O item poderá preservar:

\- nome;

\- quantidade;

\- preço cobrado no momento da venda;

\- custo no momento da venda;

\- subtotal;

\- resultado estimado.

Isso impede que alterações futuras modifiquem o histórico.

\---

**# 57. IDs e snapshots**

Os dois possuem funções diferentes.

O snapshot responde:

\`\`\`text

O que foi vendido e por qual valor?

\`\`\`

O ID responde:

\`\`\`text

Qual cadastro originou esse item?

\`\`\`

Mesmo se o produto ou serviço deixar de existir, o histórico financeiro deverá continuar legível através dos snapshots.

\---

**# 58. Exclusão e histórico**

Se serviço ou produto já tiver sido utilizado, preferir:

\`\`\`text

ativo = false

\`\`\`

em vez de exclusão física.

Se um cadastro nunca tiver sido utilizado, sua exclusão poderá ser permitida conforme a regra funcional.

Em qualquer situação:

\- vendas antigas permanecem;

\- resultados históricos permanecem;

\- snapshots não são alterados.

\---

**# 59. Cancelamento**

Uma venda cancelada não será apagada.

Fluxo:

\`\`\`text

CONCLUIDA

    ↓

cancelamento

    ↓

CANCELADA

\`\`\`

Produtos da venda deverão retornar ao estoque.

\---

**# 60. Reversão de estoque**

No cancelamento:

\`\`\`text

produto vendido

      ↓

retorno ao estoque

      ↓

REVERSAO\_VENDA

\`\`\`

A movimentação deverá manter referência à venda quando aplicável.

\---

**# 61. Operação atômica do PDV**

Finalizar venda é uma operação crítica.

Não executar:

\`\`\`text

criar venda

✓

criar itens

✓

baixar estoque

ERRO

\`\`\`

Esse cenário deixaria o banco inconsistente.

\---

**# 62. Transação da venda**

O resultado deverá ser:

\`\`\`text

Tudo funciona

     ↓

COMMIT

\`\`\`

ou:

\`\`\`text

Algo falha

     ↓

ROLLBACK

\`\`\`

Conceitualmente:

\`\`\`text

BEGIN

validar venda

validar estoque

criar venda

criar itens

atualizar estoque

criar movimentações

COMMIT

\`\`\`

Se alguma etapa falhar:

\`\`\`text

ROLLBACK

\`\`\`

\---

**# 63. Concorrência de estoque**

Considere:

\`\`\`text

estoque = 1

\`\`\`

Duas requisições chegam quase ao mesmo tempo.

As duas não podem vender a última unidade.

O requisito é:

\`\`\`text

estoque nunca pode ficar negativo por concorrência

\`\`\`

A implementação deverá utilizar mecanismo transacional adequado do PostgreSQL.

\---

**# 64. Tabela** *\`despesas\`*

Representa saídas financeiras efetivamente realizadas.

Exemplos:

\- aluguel pago;

\- energia paga;

\- internet paga;

\- material comprado;

\- reposição de estoque.

\---

**# 65. Categorias de despesas**

As categorias são fixas no MVP.

Lista:

\`\`\`text

Aluguel

Água

Energia

Internet

Equipamentos

Materiais de consumo

Manutenção

Marketing

Impostos e taxas

Estoque

Outros

\`\`\`

Não criar categorias personalizadas de despesas no MVP.

\---

**# 66. Categoria** *\`Outros\`*

Não é necessária uma coluna adicional para explicar a categoria.

O campo:

\`\`\`text

nome

\`\`\`

deverá deixar claro o gasto.

Exemplo:

\`\`\`text

Nome: Compra de lâmpadas

Categoria: Outros

\`\`\`

\---

**# 67. Origem da despesa**

Uma despesa poderá ter duas origens funcionais:

\`\`\`text

MANUAL

DESPESA\_RECORRENTE

\`\`\`

Compra de estoque é cadastrada como despesa manual quando o barbeiro desejar registrá-la no Financeiro. `REPOSICAO_ESTOQUE` não deve gerar despesa automaticamente e não deve ser usada como origem ativa na versão inicial.

\---

**# 68. Despesas relacionadas ao estoque**

Uma despesa manual poderá apontar opcionalmente para uma reposição para fins de rastreabilidade. Os registros continuam independentes e nenhuma operação em um deles altera o outro automaticamente.

\---

**# 69. Despesas recorrentes**

A configuração da recorrência não deve ser armazenada como uma despesa já paga.

Por isso deverá existir estrutura própria:

\`\`\`text

despesas\_recorrentes

\`\`\`

Ela representa:

\`\`\`text

configuração futura

\`\`\`

e não:

\`\`\`text

saída de caixa

\`\`\`

\---

**# 70. Tabela** *\`despesas\_recorrentes\`*

Responsável pela configuração da cobrança recorrente.

Exemplos de campos conceituais:

\- barbearia;

\- nome;

\- categoria;

\- valor previsto;

\- frequência;

\- dia do vencimento;

\- descrição;

\- ativa;

\- datas de criação e atualização.

No MVP:

\`\`\`text

frequencia = MENSAL

\`\`\`

\---

**# 71. Dia do vencimento**

Poderá aceitar:

\`\`\`text

1 até 31

\`\`\`

Se o dia não existir no mês, utilizar o último dia disponível.

Exemplo:

\`\`\`text

dia configurado = 31

Janeiro → 31

Fevereiro → 28 ou 29

Abril → 30

\`\`\`

\---

**# 72. Ocorrências de despesas recorrentes**

A configuração recorrente deverá gerar ocorrências separadas.

Estrutura conceitual:

\`\`\`text

despesas\_recorrentes

        │

        ▼

ocorrencias\_despesas\_recorrentes

\`\`\`

Isso permite preservar cada mês individualmente.

\---

**# 73. Status da ocorrência recorrente**

Valores:

\`\`\`text

PENDENTE

PAGA

IGNORADA

\`\`\`

\---

**# 74. Ocorrência pendente**

Uma ocorrência:

\`\`\`text

PENDENTE

\`\`\`

representa somente uma previsão.

Não deverá entrar como saída efetiva de caixa.

\---

**# 75. Ocorrência paga**

Ao marcar como paga, deverão ser preservados:

\- valor previsto;

\- valor realmente pago;

\- vencimento;

\- data do pagamento;

\- status.

Exemplo:

\`\`\`text

Previsto: R$ 100,00

Pago: R$ 105,37

Status: PAGA

\`\`\`

\---

**# 76. Ligação da ocorrência com** *\`despesas\`*

Quando uma ocorrência for marcada como:

\`\`\`text

PAGA

\`\`\`

o sistema deverá registrar a saída financeira correspondente em:

\`\`\`text

despesas

\`\`\`

e preservar uma ligação entre a ocorrência e o lançamento financeiro.

Assim:

\`\`\`text

ocorrência recorrente

        ↓

Marcar como paga

        ↓

despesa efetiva

\`\`\`

\---

**# 77. Ocorrência ignorada**

Quando:

\`\`\`text

status = IGNORADA

\`\`\`

a ocorrência:

\- permanece no histórico;

\- não gera saída financeira;

\- não desativa a recorrência;

\- não interfere nos meses futuros.

\---

**# 78. Alteração de recorrência**

Editar uma configuração recorrente deverá afetar somente períodos futuros.

Ocorrências históricas já criadas ou pagas deverão preservar os dados correspondentes ao período.

\---

**# 79. Desativação de recorrência**

Quando:

\`\`\`text

ativa = false

\`\`\`

não deverão ser geradas novas ocorrências.

O histórico anterior deverá continuar armazenado.

A recorrência poderá ser reativada.

\---

**# 80. Compra de estoque e dupla contagem**

Uma compra de estoque representa:

\`\`\`text

saída de caixa

\`\`\`

Os produtos vendidos também preservam:

\`\`\`text

custo no momento da venda

\`\`\`

Essas informações são utilizadas para cálculos diferentes.

O sistema não deve subtrair a mesma compra duas vezes dentro do mesmo indicador financeiro.

\---

**# 81. Tabela** *\`portfolio\`*

Guarda os metadados das imagens do Portfólio.

A imagem em si deverá ficar no:

\`\`\`text

Supabase Storage

\`\`\`

O banco armazena:

\`\`\`text

imagem\_path

\`\`\`

ou referência equivalente.

\---

**# 82. Dados do Portfólio**

Podem incluir:

\- barbearia;

\- caminho da imagem;

\- descrição;

\- serviço relacionado;

\- status de publicação;

\- data de criação;

\- data de atualização.

Somente itens publicados poderão aparecer na Vitrine.

\---

**# 83. Por que não armazenar imagem no PostgreSQL**

Evitar:

\- Base64;

\- BLOB sem necessidade;

\- duplicação de arquivos.

Fluxo:

\`\`\`text

Imagem

 ↓

Supabase Storage

 ↓

Path

 ↓

portfolio

\`\`\`

O mesmo princípio vale para:

\- logo;

\- capa;

\- imagem de produto.

\---

**# 84. Tabela** *\`horarios\_funcionamento\`*

Guarda os horários públicos da barbearia.

Não representa agenda.

Não existe nessa estrutura:

\- cliente;

\- reserva;

\- horário ocupado;

\- agendamento.

\---

**# 85. Até dois intervalos por dia**

A regra funcional atual permite no máximo dois intervalos por dia.

Exemplo:

\`\`\`text

08:00–12:00

14:00–18:00

\`\`\`

Portanto a modelagem deverá suportar:

\`\`\`text

intervalo 1

intervalo 2 opcional

\`\`\`

\---

**# 86. Dia fechado**

Para um dia fechado:

\`\`\`text

fechado = true

\`\`\`

não deverão existir horários de abertura e fechamento ativos naquele dia.

\---

**# 87. Regras dos intervalos**

Se o dia estiver aberto:

\- primeiro intervalo é obrigatório;

\- segundo intervalo é opcional;

\- abertura deve ser anterior ao fechamento;

\- os dois intervalos não podem se sobrepor.

Exemplo válido:

\`\`\`text

08:00–12:00

14:00–18:00

\`\`\`

Exemplo inválido:

\`\`\`text

08:00–15:00

14:00–18:00

\`\`\`

\---

**# 88. Assistente IA — recurso futuro**

O Assistente IA não faz parte da modelagem da versão inicial.

Não criar nesta etapa colunas, tabelas, cotas ou estruturas específicas de IA.

Quando o recurso entrar no escopo, a expansão deverá ocorrer por nova migration conforme `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

\---
**# 91. Vitrine pública**

Visitantes não deverão receber acesso irrestrito às tabelas administrativas.

Não utilizar:

\`\`\`sql

SELECT \*

FROM produtos

\`\`\`

e depois esconder informações no frontend.

Nesse caso, os dados privados já teriam sido enviados.

\---

**# 92. Contrato público de produto**

Poderá conter:

\- nome;

\- descrição;

\- categoria;

\- preço de venda;

\- imagem efetiva para apresentação;

\- disponibilidade pública.

A imagem efetiva deverá respeitar a regra de prioridade:

\`\`\`text

imagem personalizada do produto
↓
imagem padrão da categoria, quando habilitada
↓
sem imagem / placeholder neutro

\`\`\`

O contrato público não precisa expor ao visitante detalhes internos como:

\- `imagem_path`;

\- `imagem_padrao_path`;

\- `usar_imagem_categoria`.

O backend poderá resolver a imagem efetiva e retornar somente a referência pública necessária para apresentação.

Não deverá conter:

\- preço de custo;

\- estoque mínimo;

\- quantidade numérica de estoque;

\- movimentações;

\- informações financeiras.

\---

**# 93. Contrato público de serviço**

Poderá conter:

\- nome;

\- descrição;

\- preço.

Não deverá conter:

\- custo estimado de insumos.

\---

**# 94. Dados públicos da barbearia**

Poderão ser apresentados, conforme configuração:

\- nome da marca;

\- nome profissional;

\- descrição;

\- logo;

\- capa;

\- WhatsApp;

\- Instagram;

\- endereço;

\- horários;

\- atendimento a domicílio;

\- formas de pagamento aceitas.

O fato de um campo existir em *\`barbearias\`* não significa que qualquer endpoint pode expô-lo livremente.

\---

**# 95. Estratégia de leitura pública**

A implementação poderá utilizar:

\- view segura;

\- função SQL/RPC;

\- Route Handler server-side;

\- consulta com colunas explicitamente selecionadas.

O princípio obrigatório é:

\`\`\`text

allowlist

\`\`\`

e não:

\`\`\`text

buscar tudo e esconder depois

\`\`\`

\---

**# 96. RLS**

RLS significa:

\`\`\`text

Row Level Security

\`\`\`

Ela será utilizada para restringir linhas que usuários autenticados podem acessar.

\---

**# 97. RLS do barbeiro**

Regra conceitual:

\`\`\`text

auth.uid()

    ↓

perfis

    ↓

tipo = BARBEIRO

    ↓

barbearia\_id

    ↓

dados daquela barbearia

\`\`\`

\---

**# 98. Exemplo de isolamento**

Se:

\`\`\`text

Usuário A

→ Barbearia A

\`\`\`

ele poderá acessar:

\`\`\`text

produtos onde barbearia\_id = A

\`\`\`

e não:

\`\`\`text

produtos onde barbearia\_id = B

\`\`\`

\---

**# 99. ADMIN e RLS**

O fato de um usuário possuir:

\`\`\`text

tipo = ADMIN

\`\`\`

não significa que todas as policies devem liberar automaticamente todas as tabelas privadas.

O Painel Administrativo deverá possuir um fluxo controlado.

Ações administrativas devem:

1\. validar sessão;

2\. verificar *\`tipo = ADMIN\`*;

3\. validar a ação permitida;

4\. retornar somente as informações necessárias.

\---

**# 100. Acesso administrativo**

O Operador do SaaS poderá realizar ações como:

\- localizar barbearias;

\- visualizar informações necessárias para suporte;

\- consultar plano, validade, pagamentos e histórico permitido;

\- confirmar pagamento e conceder cortesia;

\- cancelar renovação;

\- suspender ou reativar conta;


Isso não significa autorização automática para:

\- consultar vendas completas;

\- consultar despesas;

\- alterar estoque;

\- realizar vendas;

\- agir como barbeiro.

\---

**# 101. Área administrativa separada**

Conceitualmente:

\`\`\`text

BARBEIRO

→ políticas do próprio tenant

ADMIN

→ endpoints/ações administrativas autorizadas

\`\`\`

Evitar criar uma policy genérica como:

\`\`\`text

se ADMIN → pode tudo

\`\`\`

sem necessidade.

\---

**# 102. RLS não substitui backend**

O backend também deverá:

\- validar sessão;

\- validar tipo;

\- validar propriedade;

\- validar dados;

\- aplicar regras de negócio.

RLS é uma camada adicional.

\---

**# 103. Backend não substitui RLS**

Também não confiar somente no backend para operações comuns do barbeiro.

Caso uma consulta seja implementada incorretamente, RLS deverá continuar protegendo o isolamento entre tenants quando aplicável.

\---

**# 104. Secret Key**

Operações normais do barbeiro não deverão utilizar a Secret Key administrativa.

Essa chave possui privilégios elevados.

Se necessária:

\- somente no servidor;

\- somente em operações controladas;

\- nunca no navegador.

\---

**# 105. Operações do ADMIN**

Caso alguma operação administrativa precise utilizar privilégios elevados:

\`\`\`text

requisição

 ↓

servidor

 ↓

validar sessão

 ↓

validar tipo = ADMIN

 ↓

validar ação

 ↓

executar operação necessária

\`\`\`

Nunca confiar apenas na existência da Secret Key no servidor.

\---

**# 106. Índices**

Índices ajudam consultas frequentes.

Exemplos:

\`\`\`text

vendas por barbearia + data

despesas por barbearia + data

produtos por barbearia

movimentações por produto + data

ocorrências recorrentes por barbearia + vencimento

barbearias por status

slug público

\`\`\`

Não criar índice em todas as colunas automaticamente.

Índices também possuem custo.

\---

**# 107. Constraints**

O banco deverá proteger regras simples sempre que adequado.

Exemplos:

\`\`\`text

preço > 0

estoque >= 0

dia da semana entre 0 e 6

dia de vencimento entre 1 e 31

\`\`\`

Também deverá proteger, quando possível:

\- relação entre tipo e barbearia;

\- serviço com quantidade 1 na venda;

\- consistência dos horários;


\- estados das despesas recorrentes.

Regras complexas continuam pertencendo à aplicação/backend.

\---

**# 108.** *\`ON DELETE\`*

Existem comportamentos diferentes.

**## CASCADE**

Ao remover o pai, filhos também são removidos.

Utilizar somente quando isso fizer sentido.

**## RESTRICT**

Impede exclusão quando o registro ainda é necessário.

**## SET NULL**

Remove a relação direta, mas preserva o histórico.

A escolha deverá considerar a necessidade de preservar informações financeiras e operacionais.

\---

**# 109. Histórico financeiro**

Vendas e resultados históricos deverão ser preservados.

Por isso:

\- mudança de preço não altera venda antiga;

\- mudança de custo não altera venda antiga;

\- produto inativo não altera histórico;

\- serviço inativo não altera histórico;

\- venda cancelada não é apagada;

\- perda histórica preserva custo;

\- despesa recorrente antiga não muda quando a recorrência é editada.

\---

**# 110. Dados monetários**

Utilizar:

\`\`\`sql

numeric(12,2)

\`\`\`

para valores monetários.

Não utilizar:

\`\`\`text

float

real

\`\`\`

como representação financeira principal.

\---

**# 111. Timestamps**

Eventos importantes utilizarão:

\`\`\`text

timestamptz

\`\`\`

Exemplos:

\- criação;

\- atualização;

\- venda;

\- cancelamento;

\- movimentação de estoque;

\- criação de ocorrência.

Datas civis poderão utilizar:

\`\`\`text

date

\`\`\`

Exemplos:

\- data da despesa;

\- vencimento;

\- data do pagamento.

\---

**# 112. Storage**

Arquivos não deverão ser armazenados diretamente como conteúdo no PostgreSQL.

Fluxo:

\`\`\`text

Banco

 └── referência

Storage

 └── arquivo

\`\`\`

As policies do Storage também deverão respeitar a barbearia proprietária.

\---

**# 113. Estrutura conceitual do Storage**

Exemplo:

\`\`\`text

barbearias/

  {barbeariaId}/

    logo/

    capa/

    produtos/

    portfolio/

\`\`\`

O nome e organização finais poderão ser ajustados durante implementação.

\---

**# 114. Backup**

Antes da produção deverá ser confirmado:

\- mecanismo de backup disponível;

\- retenção oferecida pelo plano utilizado;

\- processo de restauração;

\- recuperação do banco;

\- estratégia para arquivos do Storage.

Não inventar prazos na documentação.

\---

**# 115. Ambientes**

Idealmente separar:

\`\`\`text

DEV

PROD

\`\`\`

Ambientes de Preview poderão utilizar DEV ou ambiente específico quando necessário.

Não utilizar banco de produção para testes destrutivos ou criação aleatória de dados.

\---

**# 116. Migrations**

Mudanças estruturais deverão possuir histórico.

Exemplo:

\`\`\`text

001\_initial\_schema.sql

002\_add\_user\_type.sql

003\_add\_recurring\_expenses.sql

004\_update\_business\_hours.sql

\`\`\`

Os nomes reais poderão variar.

Alterações manuais importantes no banco deverão posteriormente ser refletidas nas migrations oficiais.

\---

**# 117. Seed**

Poderá existir seed apenas para desenvolvimento.

Exemplos:

\- barbearia fictícia;

\- serviços;

\- produtos;

\- vendas;

\- despesas;

\- despesas recorrentes.

Também poderá existir conta administrativa de teste em ambiente local.

Nunca executar automaticamente seed de demonstração em produção.

\---

**# 118. Mock e seed**

Mock:

\`\`\`text

serve para simular o frontend

\`\`\`

Seed:

\`\`\`text

serve para popular um banco de desenvolvimento

\`\`\`

São conceitos diferentes.

\---

**# 119. Estruturas atuais do banco**

Considerando as funcionalidades atualmente aprovadas, a aplicação deverá possuir conceitualmente 14 tabelas próprias da aplicação:

\`\`\`text

barbearias

perfis

servicos

categorias\_produto

produtos

vendas

venda\_itens

despesas

despesas\_recorrentes

ocorrencias\_despesas\_recorrentes

movimentacoes\_estoque

portfolio

horarios\_funcionamento

barbearia\_formas\_pagamento

\`\`\`

Além de:

\`\`\`text

auth.users

\`\`\`

gerenciado pelo Supabase Auth.

\---

**# 120. Dados que não existem no MVP**

Não criar tabelas apenas para preparar hipóteses futuras.

Não existem atualmente:

\`\`\`text

clientes

agendamentos

lembretes

fidelidade

comissoes

funcionarios

equipes de barbeiros

pagamentos online

assinaturas SaaS automatizadas

campanhas

\`\`\`

Quando uma funcionalidade futura for aprovada, a modelagem deverá ser revisada.

\---

**# 121. SQL de referência**

O arquivo:

\`\`\`text

BANCO\_EXEMPLO.sql

\`\`\`

é uma representação técnica inicial.

Ele serve para visualizar:

\- tabelas;

\- colunas;

\- tipos;

\- nulabilidade;

\- enums;

\- relacionamentos;

\- constraints principais.

Não deverá ser executado cegamente em produção.

\---

**# 122. Sincronização com o SQL**

O *\`BANCO\_EXEMPLO.sql\`* deverá permanecer sincronizado com as decisões descritas neste documento.

As principais mudanças atuais que também devem existir no SQL são:

\- *\`tipo = BARBEIRO | ADMIN\`*;

\- *\`BARBEIRO\`* como padrão;

\- *\`barbearia\_id\`* opcional para *\`ADMIN\`*;

\- regra entre tipo e barbearia;

\- tema do usuário persistido em *\`perfis.tema\`*;

\- 6 etapas de Onboarding na ordem aprovada;

\- formas de pagamento aceitas pela barbearia;

\- configuração de produtos sem estoque na Vitrine;

\- slug estável;

\- despesas com origem identificável;

\- despesas recorrentes;

\- ocorrências recorrentes;

\- vínculo entre ocorrência paga e saída financeira;

\- suporte a dois intervalos de funcionamento;

\- custo histórico das perdas;

\- reposição sem saída financeira automática e vínculo opcional com despesa manual;

\- planos, assinaturas, pagamentos e histórico administrativo;

\- situação *\`ATIVA/SUSPENSA\`* separada do plano;

\- código imutável *\`BAR-XXXXXX\`* e reserva contra reutilização;

\- retenção separada de contas excluídas;

\- aceite de documentos legais;


\---

**# 123. Antes da primeira migration real**

Antes de criar a migration definitiva, revisar:

\- nulabilidade;

\- constraints;

\- enums;

\- índices;

\- RLS;

\- policies;

\- autorização de *\`BARBEIRO\`*;

\- autorização de *\`ADMIN\`*;

\- relações entre tenants;

\- relação entre produto e categoria;

\- imagem padrão das categorias sugeridas;

\- fallback de imagem dos produtos;

\- comportamento ao remover imagem personalizada;

\- separação entre arquivos oficiais do sistema e arquivos dos tenants no Storage;

\- relação entre barbearia e formas de pagamento aceitas;

\- persistência e retomada do Onboarding;

\- persistência do tema do usuário;

\- despesas automáticas;

\- despesas recorrentes;

\- geração das ocorrências;

\- operação transacional do PDV;

\- cancelamento;

\- concorrência de estoque;

\- leitura pública;

\- horários com dois intervalos;

\- Storage;

\- exclusão e retenção;

\- fluxo de criação de conta;

\- atribuição manual de *\`ADMIN\`*.

\---

**# 124. Critério de conclusão**

A modelagem estará pronta para produção quando:

\- refletir o escopo funcional aprovado;

\- todas as tabelas possuírem função clara;

\- *\`BARBEIRO\`* e *\`ADMIN\`* estiverem corretamente representados;

\- cadastro público não puder gerar *\`ADMIN\`*;

\- cada barbeiro estiver associado corretamente à própria barbearia;

\- administradores não forem tratados automaticamente como proprietários de tenants;

\- dados privados estiverem isolados;

\- RLS estiver implementada e testada;

\- relações entre barbearias estiverem protegidas;

\- categorias sugeridas puderem utilizar imagens padrão oficiais sem duplicação por tenant;

\- produtos respeitarem a prioridade entre imagem personalizada, fallback da categoria e ausência de imagem;

\- categorias personalizadas iniciarem sem imagem padrão;

\- formas de pagamento aceitas estiverem isoladas por barbearia;

\- preferência de tema estiver persistida por usuário;

\- Onboarding puder ser retomado e concluído corretamente;

\- PDV for transacional;

\- estoque concorrente estiver protegido;

\- reposição e Financeiro permanecerem consistentes;

\- perdas preservarem custo histórico;

\- despesas recorrentes preservarem ocorrências históricas;

\- Vitrine não expuser campos privados;

\- slug público permanecer estável após sua criação;

\- horários suportarem os dois intervalos aprovados;

\- Vitrine puder apresentar somente as formas de pagamento configuradas como aceitas;

\- migrations estiverem versionadas;

\- Storage possuir policies adequadas;

\- arquivos padrão do sistema estiverem protegidos contra alteração por barbeiros;


\---

# 120. Modelagem comercial e administrativa aprovada

As estruturas abaixo complementam o modelo operacional e são obrigatórias para a versão com planos e administração do SaaS.

## `planos`

Catálogo comercial dos planos. Campos mínimos:

- `id`;
- `codigo` único: `GRATIS` ou `NORMAL`;
- `nome`;
- `preco_mensal`;
- `ativo`;
- datas de criação e atualização.

Valores da versão inicial: Grátis R$ 0,00 e Normal R$ 49,90. Permissões não ficam duplicadas nessa tabela; são definidas pelo verificador central de recursos no código.

## `assinaturas`

Existe exatamente um registro atual por barbearia, inclusive no Grátis. Campos mínimos:

- `barbearia_id` único;
- `plano_atual_id`;
- `inicio_periodo` e `fim_periodo` quando pago ou cortesia;
- `dia_base`;
- `origem_periodo`: `GRATIS`, `PAGAMENTO` ou `CORTESIA`;
- `proximo_plano_id` e `mudanca_agendada_para`;
- `cancelamento_agendado`;
- datas de criação e atualização.

O plano efetivo deverá ser calculado pela validade em cada acesso. Período encerrado equivale imediatamente ao Grátis. O Normal somente fica vigente quando houver pagamento confirmado ou cortesia administrativa válida.

## `pagamentos_assinatura`

Um registro imutável por pagamento real. Guardar:

- barbearia ou retenção relacionada;
- plano comprado e nome do plano como snapshot;
- preço oficial como snapshot;
- valor recebido;
- data real do pagamento;
- data/hora da confirmação;
- ADMIN responsável;
- método de pagamento;
- status e identificador externo, quando existir.

Cortesia não gera pagamento.

## `historico_administrativo`

Registra eventos permanentes de plano, pagamento, suspensão, reativação, manutenção excepcional e exclusão administrativa. Guardar ator `BARBEIRO`, `ADMIN` ou `SISTEMA`, data/hora, tipo do evento e estados anterior/posterior em JSON controlado.

O histórico administrativo é independente do histórico de vendas e não concede ao ADMIN acesso aos dados operacionais privados da barbearia.

## `configuracoes_sistema`

Registro único do sistema. Deve guardar estado de manutenção, motivo interno, mensagem pública opcional, indicação de exibir motivo, previsão de retorno opcional e ADMIN que realizou a alteração.

## `codigos_reservados`

Protege contra reutilização do código `BAR-XXXXXX`. Enquanto a conta existir ou estiver no período de retenção, o código pode permanecer legível. Depois da eliminação final, conservar apenas uma impressão criptográfica não reversível suficiente para rejeitar uma nova geração igual.

## `retencoes_contas_excluidas`

Não possui dados operacionais nem vínculo restaurável com uma barbearia ativa. Campos mínimos:

- identificador próprio;
- código, nome e e-mail retidos;
- data da exclusão;
- data programada de eliminação, cinco anos depois;
- data da eliminação efetiva, quando executada.

Pagamentos e ações essenciais podem apontar para essa retenção após a exclusão. Ao eliminar a retenção, os registros identificáveis relacionados também deverão ser apagados.

## `aceites_legais`

Registra o aceite dos Termos de Uso e da Política de Privacidade:

- perfil;
- tipo do documento;
- versão;
- data/hora do aceite.

Não usar a tabela como justificativa para conservar dados após a exclusão além das regras jurídicas aprovadas.

# 121. Alterações em estruturas existentes

`barbearias` deverá possuir:

- `codigo` único, obrigatório e imutável;
- `status_conta`: `ATIVA` ou `SUSPENSA`;
- motivo e data da suspensão, quando aplicável.

`perfis.tipo` deverá aceitar somente `BARBEIRO` e `ADMIN`. Cadastro público cria apenas `BARBEIRO`.

# 122. Exclusão transacional

A exclusão deverá ocorrer em operação de servidor controlada:

1. reautenticar o usuário e validar a frase de confirmação;
2. retirar a Vitrine do ar e invalidar acesso;
3. criar a retenção mínima;
4. transferir somente pagamentos e ações essenciais para a retenção;
5. apagar dados operacionais e objetos do Storage;
6. apagar o usuário do Auth;
7. registrar a reserva técnica do código;
8. impedir qualquer restauração funcional da conta.

Backups antigos expiram pelo ciclo automático e não podem ser usados para reconstruir intencionalmente a conta.

# 123. RLS e acesso administrativo

- BARBEIRO acessa somente a própria barbearia;
- ADMIN acessa apenas dados administrativos necessários;
- visitante acessa somente contrato público seguro da Vitrine;
- usuário autenticado nunca pode alterar o próprio papel para `ADMIN`;
- registros de retenção ficam fora das consultas normais e exigem acesso técnico restrito e auditado.

# 124. Módulos futuros

Não criar tabelas vazias para Agendamento, Funcionários ou outros módulos ainda inexistentes. Preparar apenas o verificador central de recursos para aceitar novas chaves no futuro.
