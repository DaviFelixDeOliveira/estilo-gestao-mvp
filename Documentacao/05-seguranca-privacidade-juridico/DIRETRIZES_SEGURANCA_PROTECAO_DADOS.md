# Diretrizes de Segurança e Proteção de Dados - Estilo e Gestão

## Objetivo

Este documento estabelece os requisitos mínimos de segurança, privacidade, proteção de dados e desenvolvimento seguro que deverão ser observados durante:

- planejamento;
- desenvolvimento;
- testes;
- implantação;
- operação;
- manutenção;
- evolução do Estilo e Gestão.

Este documento é voltado principalmente para desenvolvimento e operação técnica.

Ele não substitui:

- Termos de Uso;
- Política de Privacidade;
- contratos;
- avaliação jurídica;
- documentação funcional do sistema.

As regras específicas de campos, mensagens, fluxos e validações funcionais pertencem ao documento **Fluxo Técnico do Barbeiro e do Cliente**.

---

# 1. Princípios gerais

O desenvolvimento deverá seguir os princípios de:

- menor privilégio;
- minimização de dados;
- segurança desde a concepção;
- separação entre dados públicos e privados;
- separação entre autenticação e autorização;
- validação no servidor;
- isolamento entre barbearias;
- rastreabilidade de operações críticas;
- proteção em múltiplas camadas;
- prevenção de vazamentos;
- simplicidade.

Não adicionar mecanismos complexos de segurança sem necessidade real.

Também não remover controles essenciais apenas para simplificar a implementação.

---

# 2. Tipos de usuário

O sistema possui dois tipos de usuário no MVP:

```text
BARBEIRO
ADMIN
```

## BARBEIRO

Representa o usuário responsável por uma barbearia.

Deverá acessar somente:

- a própria barbearia;
- os próprios dados;
- os recursos disponíveis para sua conta.

## ADMIN

Representa o Operador do SaaS.

Possui acesso somente às funcionalidades administrativas necessárias para operação do Estilo e Gestão.

Ser `ADMIN` não significa possuir acesso irrestrito a todas as informações das barbearias.

---

# 3. Atribuição do tipo de usuário

Todo cadastro público deverá receber:

```text
tipo = BARBEIRO
```

Não deverá existir no cadastro:

```text
Criar conta como administrador
```

O frontend não deverá conseguir conceder:

```text
tipo = ADMIN
```

No MVP, a permissão `ADMIN` será atribuída manualmente no banco de dados.

O próprio usuário não poderá alterar seu tipo pela aplicação.

---

# 4. Proteção contra promoção indevida

O sistema deverá impedir tentativas de alterar o tipo da própria conta.

Exemplos de valores enviados pelo navegador que não deverão ser considerados confiáveis:

```json
{
  "tipo": "ADMIN"
}
```

ou:

```text
role=admin
```

ou:

```text
isAdmin=true
```

A autorização deverá utilizar somente informações confiáveis obtidas no servidor e no banco de dados.

---

# 5. Dados pessoais previstos

O Estilo e Gestão poderá tratar dados relacionados ao responsável pela barbearia, como:

- nome;
- e-mail;
- telefone ou WhatsApp;
- endereço;
- informações profissionais.

Também poderão existir dados pessoais dentro de:

- imagens do Portfólio;
- imagens enviadas pelo barbeiro;
- registros técnicos de acesso;
- solicitações de suporte.

Informações de pessoas jurídicas que não identifiquem uma pessoa natural não são, por si só, dados pessoais.

---

# 6. Dados que não fazem parte do MVP

O MVP não deverá solicitar nem criar estruturas específicas para:

- cadastro de clientes;
- Login de clientes;
- agendamento;
- histórico individual de clientes;
- lembretes de retorno;
- fidelidade;
- campanhas de marketing;
- dados de cartão;
- pagamentos online.

Não criar campos apenas para preparar funcionalidades futuras.

---

# 7. Dados pessoais sensíveis

O sistema não foi projetado para solicitar dados pessoais sensíveis, como:

- origem racial ou étnica;
- religião;
- opinião política;
- filiação sindical;
- dados de saúde;
- dados genéticos;
- dados biométricos;
- informações sobre vida sexual.

Caso uma funcionalidade futura passe a tratar qualquer categoria sensível, a documentação de privacidade e segurança deverá ser revisada antes da implementação.

---

# 8. Minimização de dados

Coletar somente informações necessárias para funcionalidades existentes.

Exemplo:

se o MVP não possui cadastro de clientes, não existe motivo para cadastrar:

- nome do cliente;
- aniversário;
- telefone do cliente;
- histórico de cortes;
- preferências pessoais.

Uma funcionalidade futura não justifica coleta antecipada.

---

# 9. Autenticação

A autenticação será realizada pelo Supabase Auth.

A aplicação não deverá:

- criar tabela própria de senha;
- salvar senha em texto;
- salvar senha em logs;
- enviar senha para serviços que não participam da autenticação;
- armazenar senha no `localStorage`.

A autenticação responde:

> Quem é o usuário?

Ela não define sozinha o que o usuário poderá acessar.

---

# 10. Autorização

A autorização responde:

> O que este usuário pode acessar?

Após autenticar, o sistema deverá verificar:

```text
auth.uid()
    ↓
perfil
    ↓
tipo
```

Para `BARBEIRO`, também deverá verificar:

```text
barbearia_id
```

Nenhuma operação privada deverá confiar apenas no fato de existir uma sessão autenticada.

---

# 11. Fluxo de autorização após Login

Após o Supabase Auth validar as credenciais:

```text
Usuário autenticado
        ↓
Localizar perfil
        ↓
Verificar tipo
```

Se:

```text
tipo = BARBEIRO
```

o sistema deverá validar:

- barbearia vinculada;
- status da conta;
- permissões sobre a própria barbearia.

Se:

```text
tipo = ADMIN
```

o sistema deverá validar:

- permissão administrativa;
- ação administrativa solicitada.

---

# 12. Sessão

A sessão deverá ser validada antes de qualquer operação privada.

Rotas administrativas não devem confiar apenas em:

- menu oculto;
- botão escondido;
- estado React;
- informação guardada no navegador;
- rota conhecida;
- parâmetro da URL.

Uma pessoa que descubra diretamente uma rota privada não deverá conseguir acessar dados sem autorização válida.

---

# 13. Sessão expirada

Quando a sessão não for válida:

- não executar a operação;
- não realizar alteração parcial;
- informar o usuário;
- exigir nova autenticação.

Mensagem funcional adequada pertence ao documento de Fluxo Técnico.

---

# 14. Isolamento entre barbearias

Cada barbearia deverá acessar apenas seus próprios dados.

Exemplo:

```text
Barbearia A
→ dados A

Barbearia B
→ dados B
```

Nunca:

```text
Barbearia A
→ dados B
```

Essa regra deverá ser protegida:

- no backend;
- no banco;
- através de RLS;
- através de testes específicos.

---

# 15. Identificação da barbearia

O navegador não deverá possuir autoridade para determinar livremente:

```text
barbearia_id
```

Exemplo inseguro:

```json
{
  "barbearia_id": "id-de-outra-barbearia"
}
```

O backend deverá determinar a barbearia autorizada através da sessão e do perfil.

---

# 16. Row Level Security - RLS

Todas as tabelas privadas deverão utilizar RLS quando aplicável.

Para um barbeiro, a regra conceitual será:

```text
auth.uid()
    ↓
perfil
    ↓
tipo = BARBEIRO
    ↓
barbearia_id
    ↓
registros da própria barbearia
```

Não utilizar policy pública ampla apenas para facilitar desenvolvimento.

---

# 17. RLS e ADMIN

O fato de um perfil possuir:

```text
tipo = ADMIN
```

não deverá automaticamente liberar:

```text
SELECT *
UPDATE *
DELETE *
```

sobre todas as tabelas.

O Operador do SaaS possui um conjunto limitado de ações administrativas.

Evitar uma regra genérica:

```text
ADMIN pode tudo
```

Esse tipo de atalho é muito eficiente para transformar um painel de suporte em um desastre de autorização.

---

# 18. Painel Administrativo

A área administrativa deverá ser separada do painel comum das barbearias.

Exemplo conceitual:

```text
/admin
```

ou estrutura equivalente.

O acesso deverá exigir:

```text
sessão válida
+
tipo = ADMIN
+
ação permitida
```

---

# 19. Funções permitidas ao ADMIN

O Operador do SaaS poderá executar funções necessárias para operação do serviço, como:

- localizar barbearia;
- visualizar informações necessárias para suporte;
- verificar plano, validade e situação da conta;
- confirmar pagamento manual;
- conceder cortesia;
- aplicar upgrade ou agendar downgrade;
- cancelar renovação;
- suspender e reativar conta;

O acesso deve permanecer limitado ao necessário.

---

# 20. Ações não permitidas ao ADMIN por padrão

O Operador não deverá, por padrão:

- visualizar senha;
- consultar credenciais;
- consultar tokens;
- consultar Secret Keys;
- realizar venda como barbeiro;
- criar despesas como barbeiro;
- alterar despesas da barbearia;
- alterar estoque como barbeiro;
- modificar produtos como proprietário;
- acessar a conta como se fosse o barbeiro;
- acessar dados de outra barbearia sem necessidade operacional;
- ignorar RLS de maneira genérica;
- obter acesso irrestrito apenas por possuir `ADMIN`.

---

# 21. Impersonação

O MVP não deverá possuir funcionalidade de:

```text
Entrar como barbeiro
```

ou:

```text
Acessar como usuário
```

para o Operador do SaaS.

Caso uma funcionalidade de impersonação seja considerada futuramente, ela deverá possuir revisão específica de:

- segurança;
- auditoria;
- autorização;
- privacidade;
- registro de ações.

---

# 22. Secret Key do Supabase

A chave administrativa do Supabase:

- deverá existir somente no servidor;
- nunca deverá utilizar prefixo `NEXT_PUBLIC_`;
- nunca deverá ser enviada ao navegador;
- nunca deverá aparecer em logs;
- nunca deverá ser usada nas operações comuns do barbeiro apenas para contornar RLS.

---

# 23. Uso administrativo da Secret Key

Se uma operação administrativa realmente exigir privilégios elevados, o fluxo deverá ser:

```text
Requisição
   ↓
Servidor
   ↓
Validar sessão
   ↓
Validar tipo = ADMIN
   ↓
Validar ação permitida
   ↓
Executar somente a operação necessária
```

A existência da Secret Key no servidor não substitui autorização.

---

# 24. Variáveis de ambiente

Segredos deverão ser armazenados em variáveis de ambiente.

Exemplos:

- Secret Key do Supabase;

Não colocar segredos:

- no código;
- no GitHub;
- em prints;
- em documentação;
- em mensagens de erro;
- em arquivos públicos.

A configuração completa pertence ao documento `ENV_SETUP.md`.

---

# 25. Git e GitHub

Antes de commits:

- confirmar que arquivos `.env` não estão sendo enviados;
- revisar alterações contendo chaves;
- não versionar arquivos com credenciais reais;
- não colocar segredos em exemplos da documentação.

Caso um segredo seja commitado:

1. considerar a credencial comprometida;
2. revogar ou rotacionar;
3. substituir por uma nova;
4. remover o segredo do código;
5. revisar o histórico quando necessário.

Apagar apenas a linha em um commit posterior não torna a credencial antiga segura.

---

# 26. Validação no servidor

Toda entrada que modifica dados deverá ser validada no servidor.

Exemplos:

- serviço;
- produto;
- categoria;
- venda;
- despesa;
- despesa recorrente;
- pagamento de ocorrência recorrente;
- estoque;
- configurações;
- Vitrine;
- Portfólio;
- operações administrativas.

A validação no navegador existe para melhorar a experiência.

Não representa uma barreira de segurança.

---

# 27. Valores financeiros

O navegador não será fonte confiável para:

- preço;
- custo;
- subtotal;
- total;
- resultado;
- estoque final;
- valor final de uma reposição.

Ao finalizar uma venda, o backend deverá buscar novamente:

- produto;
- serviço;
- preço;
- custo;
- estoque.

Depois deverá recalcular os valores.

---

# 28. PDV

Finalizar uma venda é uma operação crítica.

As seguintes ações deverão ser tratadas como uma única operação consistente:

- criar venda;
- criar itens;
- baixar estoque;
- criar movimentações.

Se alguma etapa falhar:

- nenhuma alteração parcial deverá permanecer.

---

# 29. Duplo envio

Operações críticas deverão ser protegidas contra múltiplos envios.

O frontend deverá:

- desabilitar o botão durante a operação;
- apresentar estado de carregamento.

O backend também deverá possuir proteção adequada contra duplicações.

Aplicável especialmente a:

- finalizar venda;
- registrar reposição;
- marcar despesa recorrente como paga;
- gerar Vitrine;
- operações administrativas.

---

# 30. Concorrência de estoque

O sistema deverá impedir que duas requisições vendam a mesma unidade disponível.

Exemplo:

```text
Estoque = 1
```

Duas vendas simultâneas não poderão resultar em:

```text
Estoque = -1
```

O controle deverá ocorrer no servidor e no banco.

---

# 31. Cancelamento de venda

Uma venda cancelada:

- não deverá ser apagada;
- deverá manter histórico;
- deverá restaurar estoque quando aplicável;
- deverá criar movimentação de reversão;
- não poderá ser cancelada uma segunda vez.

Venda cancelada deverá deixar de participar dos totais válidos.

---

# 32. Reposição de estoque

Uma reposição altera o estoque e registra sua movimentação de forma rastreável.

A operação deverá manter consistentes:

```text
estoque
+
movimentação de reposição
```

A reposição **não cria despesa ou saída financeira automaticamente**.

Se a compra precisar ser refletida no Financeiro, o usuário registra uma despesa separadamente.

---

# 33. Despesa manual relacionada à reposição

Uma despesa manual pode guardar uma referência opcional à reposição para facilitar consulta e auditoria.

Os registros continuam independentes:

- corrigir a reposição não altera automaticamente a despesa;
- corrigir ou excluir a despesa não altera automaticamente o estoque;
- cada operação exige sua própria validação e autorização.

---

# 34. Perda de estoque

Uma perda de estoque:

- reduz a quantidade;
- registra movimento `PERDA`;
- preserva o custo no momento da perda;
- afeta o resultado estimado.

Não deverá criar nova saída financeira.

A compra do produto já representou saída de caixa.

---

# 35. Preservação do custo da perda

O custo utilizado na perda deverá permanecer histórico.

Exemplo:

```text
Produto custa R$ 20 no momento da perda
```

Se posteriormente o custo for alterado para:

```text
R$ 25
```

a perda antiga deverá continuar representando:

```text
R$ 20 por unidade perdida
```

---

# 36. Despesas avulsas

Despesas cadastradas manualmente deverão ser associadas somente à barbearia autenticada.

O backend deverá validar:

- categoria permitida;
- valor;
- data;
- propriedade da barbearia.

Datas futuras não deverão ser aceitas conforme regra funcional atual.

---

# 37. Categorias de despesas

As categorias do MVP são predefinidas.

O frontend não deverá conseguir criar arbitrariamente novas categorias de despesas.

A lista funcional deverá permanecer sincronizada com os documentos de fluxo e banco.

---

# 38. Despesas recorrentes

A configuração de uma despesa recorrente representa:

```text
previsão
```

e não:

```text
dinheiro já gasto
```

Uma ocorrência com status:

```text
PENDENTE
```

não deverá entrar automaticamente nas saídas efetivas.

---

# 39. Marcar despesa recorrente como paga

Ao marcar uma ocorrência como paga:

1. validar sessão;
2. validar barbearia;
3. validar ocorrência;
4. verificar status atual;
5. validar valor pago;
6. validar data de pagamento;
7. criar saída financeira;
8. atualizar ocorrência para `PAGA`.

A operação deverá ser consistente.

Não permitir que uma mesma ocorrência gere múltiplas despesas por envio repetido.

---

# 40. Ocorrência ignorada

Uma ocorrência `IGNORADA`:

- não gera saída financeira;
- permanece no histórico;
- não encerra a recorrência.

O backend deverá impedir que uma ocorrência já paga seja ignorada sem um fluxo específico de correção.

---

# 41. Alterações em despesas recorrentes

Editar uma recorrência deverá afetar apenas períodos futuros.

Ocorrências históricas devem preservar:

- nome correspondente ao período;
- categoria;
- valor previsto;
- valor pago quando aplicável;
- vencimento;
- status.

---

# 42. Upload de arquivos

Uploads deverão validar no mínimo:

- tipo permitido;
- tamanho permitido;
- sessão;
- barbearia proprietária;
- destino permitido.

Arquivos previstos:

- logo;
- capa;
- imagem de produto;
- imagem do Portfólio.

---

# 43. Formatos permitidos de imagem

Quando definido na funcionalidade, utilizar somente formatos aprovados.

Atualmente previstos:

- JPEG/JPG;
- PNG;
- WebP.

Não confiar somente na extensão do nome do arquivo.

Quando tecnicamente possível, validar também o tipo real do conteúdo.

---

# 44. Tamanho dos arquivos

Os limites específicos deverão seguir o documento funcional.

Quando houver limite definido, ele deverá ser validado:

- no frontend para experiência;
- no servidor para segurança.

Atualmente, imagens de produtos e Portfólio possuem limite funcional de 10 MB.

---

# 45. Nome dos arquivos

Não utilizar diretamente o nome original enviado pelo usuário como caminho definitivo no Storage.

Preferir nomes gerados pela aplicação.

Exemplo:

```text
UUID.webp
```

Isso reduz:

- colisões;
- caracteres problemáticos;
- tentativa de manipular caminhos.

---

# 46. Supabase Storage

Arquivos deverão ser organizados de forma que seja possível relacioná-los à barbearia proprietária.

Exemplo:

```text
barbearias/
  {barbeariaId}/
    logo/
    capa/
    produtos/
    portfolio/
```

A estrutura definitiva deverá ser compatível com as policies de Storage.

---

# 47. Isolamento no Storage

Um barbeiro não deverá conseguir:

- substituir arquivo de outra barbearia;
- apagar arquivo de outra barbearia;
- enviar arquivo para pasta de outra barbearia;
- acessar arquivos privados não autorizados.

As policies de Storage deverão considerar o tenant.

---

# 48. Imagens de terceiros

O sistema deverá informar ao barbeiro que ele só deve publicar imagens que possa utilizar legalmente.

Isso é especialmente importante quando a imagem mostrar uma pessoa identificável.

A responsabilidade jurídica e o texto final dessa obrigação deverão ser confirmados nos Termos de Uso.

---

# 49. Vitrine pública

A Vitrine não deverá consultar tabelas administrativas sem limitação adequada.

Nunca utilizar como estratégia:

```text
SELECT *
```

e esconder os campos privados somente no frontend.

O backend deverá retornar apenas dados públicos necessários.

---

# 50. Criação da Vitrine

Ao selecionar:

```text
Gerar URL
```

o frontend não deverá possuir autoridade para definir sozinho o slug definitivo.

O backend deverá:

1. validar a sessão;
2. identificar a barbearia;
3. gerar slug;
4. normalizar;
5. verificar palavras reservadas;
6. verificar unicidade;
7. salvar;
8. publicar;
9. devolver a URL pública.

---

# 51. Slug público

O slug:

- deverá ser único;
- não deverá conter UUID interno completo;
- não deverá permitir caracteres indevidos;
- deverá utilizar identificador público apropriado;
- deverá permanecer estável após a criação.

Alterar o nome da barbearia não deverá alterar automaticamente uma URL já criada.

---

# 52. Despublicar Vitrine

Ao despublicar:

- conteúdo público deverá deixar de ser retornado;
- dados privados não deverão ser expostos;
- slug poderá permanecer reservado;
- a mesma URL poderá ser reutilizada ao publicar novamente.

---

# 53. Dados públicos de produto

Podem ser enviados para a Vitrine quando configurados como públicos:

- nome;
- descrição;
- categoria;
- preço de venda;
- imagem;
- disponibilidade pública.

Não enviar:

- preço de custo;
- estoque mínimo;
- quantidade interna;
- movimentações;
- informações financeiras.

---

# 54. Produto sem estoque

Quando o produto estiver sem estoque, a Vitrine deverá seguir a configuração da barbearia:

```text
OCULTAR
```

ou:

```text
INDISPONIVEL
```

Mesmo no modo `INDISPONIVEL`, não enviar a quantidade numérica interna.

---

# 55. Dados públicos de serviço

Podem ser enviados:

- nome;
- descrição;
- preço.

Não enviar:

- custo estimado de insumos.

---

# 56. Dados públicos da barbearia

Somente campos autorizados deverão ser expostos.

Exemplos possíveis:

- nome;
- nome profissional;
- descrição;
- logo;
- capa;
- WhatsApp;
- Instagram;
- endereço;
- horários;
- informação de atendimento a domicílio.

O fato de um campo existir em `barbearias` não significa automaticamente que ele é público.

---

# 57. Informações opcionais ausentes na Vitrine

Antes de criar a Vitrine, o frontend poderá informar ao barbeiro quais dados opcionais ainda não foram cadastrados.

Essa verificação serve para experiência do usuário.

Ela não deverá permitir exposição automática de campos privados apenas porque estão preenchidos no banco.

---

# 58. Assistente IA — recurso futuro

O Assistente IA não faz parte da versão inicial. Portanto, regras de rate limit, timeout, prompt injection, contexto permitido, fornecedor de IA e armazenamento de conversas não são requisitos ativos neste momento.

Quando o recurso entrar no escopo, a implementação deverá passar por revisão específica de segurança e proteção de dados, seguindo:

`Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`

---

# 67. ViaCEP

A consulta ao ViaCEP deverá enviar somente o necessário para buscar o endereço.

Não enviar:

- nome do usuário;
- e-mail;
- telefone;
- informações financeiras.

Se o serviço estiver indisponível:

- permitir preenchimento manual;
- não impedir definitivamente o cadastro.

---

# 68. Logs

Logs deverão ajudar na investigação de falhas sem virar um depósito de dados pessoais.

Evitar registrar:

- senha;
- tokens;
- cookies;
- chaves;
- cabeçalhos de autenticação;
- dados financeiros completos sem necessidade.

---

# 69. Logs administrativos

Operações relevantes do Operador do SaaS deverão ser passíveis de rastreamento quando necessário.

Exemplos de ações relevantes:

- confirmar pagamento;
- conceder cortesia;
- aplicar upgrade;
- agendar ou cancelar downgrade;
- cancelar renovação;
- suspender ou reativar barbearia;
- iniciar exclusão administrativa excepcional.

A implementação definitiva do histórico administrativo deverá considerar proporcionalidade e minimização de dados.

---

# 70. Erros

Mensagens exibidas ao usuário não deverão revelar:

- SQL;
- tabelas;
- estrutura interna;
- stack trace;
- nomes de variáveis;
- tokens;
- caminhos internos;
- infraestrutura.

Exemplo interno:

```text
ERROR 23505 unique violation...
```

Exemplo público:

> Não foi possível concluir esta operação.

---

# 71. Monitoramento

Antes da produção deverá existir mecanismo mínimo para detectar:

- erros da aplicação;
- indisponibilidade;
- falhas repetidas;
- problemas relevantes do backend;
- falhas em operações críticas.

A ferramenta definitiva poderá ser escolhida posteriormente.

---

# 72. Dependências

Dependências deverão:

- possuir finalidade clara;
- ser obtidas de fonte confiável;
- ser mantidas atualizadas;
- ser removidas quando não utilizadas.

Evitar adicionar bibliotecas para resolver algo simples já atendido pela stack.

---

# 73. Vulnerabilidades de dependências

Executar verificações periódicas.

Quando vulnerabilidade relevante for identificada:

1. verificar impacto real;
2. atualizar quando possível;
3. testar a atualização;
4. documentar riscos que não possam ser corrigidos imediatamente.

---

# 74. XSS

Conteúdo inserido por usuários não deverá ser renderizado como HTML executável sem necessidade.

Exemplos:

- descrição;
- observação;
- nome;
- mensagem;
- conteúdo público.

Não utilizar inserção de HTML bruto sem sanitização específica.

---

# 75. SQL Injection

Não construir consultas SQL através da concatenação direta de texto recebido do usuário.

Utilizar:

- cliente Supabase;
- queries parametrizadas;
- funções SQL seguras.

---

# 76. Manipulação de identificadores

IDs recebidos pelo frontend devem ser tratados apenas como identificadores de registros.

O backend deverá verificar:

- se o registro existe;
- se pertence ao tenant correto;
- se o usuário pode realizar a operação.

Receber um UUID válido não significa possuir autorização sobre o recurso.

---

# 77. Mass Assignment

O backend não deverá atualizar objetos completos enviados pelo navegador sem selecionar explicitamente os campos permitidos.

Exemplo inseguro:

```ts
update(perfilRecebidoDoFrontend)
```

se esse objeto puder conter:

```text
tipo = ADMIN
```

Preferir allowlist de campos atualizáveis.

---

# 78. Ações críticas

Ações críticas devem possuir tratamento adequado de confirmação e autorização.

Exemplos:

- excluir despesa;
- suspender barbearia;
- excluir conta;
- despublicar Vitrine;
- alterar permissões administrativas.

---

# 79. Contas dos serviços utilizados no desenvolvimento

Contas administrativas de:

- GitHub;
- Supabase;
- Vercel;
- Google;

deverão utilizar proteção forte.

Recomenda-se habilitar autenticação em dois fatores sempre que disponível.

---

# 80. Ambientes

Separar, quando apropriado:

```text
DEV
PROD
```

Dados de produção não deverão ser utilizados livremente para testes.

Mocks e seeds de desenvolvimento não deverão ser executados em produção.

Contas `ADMIN` de teste não deverão ser confundidas com contas administrativas reais.

---

# 81. HTTPS

A aplicação em produção deverá utilizar HTTPS.

Credenciais e sessões não deverão trafegar por HTTP em produção.

---

# 82. Backup

Antes do lançamento deverão ser definidos:

- backup do banco;
- backup ou recuperação do Storage;
- responsável pela recuperação;
- procedimento de restauração.

Não basta confirmar que existe backup.

A capacidade de recuperação precisa ser verificada.

---

# 83. Incidentes de segurança

Um incidente pode envolver:

- acesso indevido;
- vazamento;
- perda;
- alteração não autorizada;
- exclusão indevida;
- exposição pública;
- comprometimento de conta;
- abuso de conta administrativa;
- chave vazada;
- falha de isolamento entre barbearias.

Ao identificar incidente:

1. registrar ocorrência;
2. limitar o problema;
3. preservar informações úteis para investigação;
4. identificar dados afetados;
5. identificar pessoas possivelmente afetadas;
6. corrigir a causa;
7. avaliar necessidade de comunicação;
8. revisar controles.

As obrigações de comunicação à ANPD e aos titulares deverão seguir legislação e regulamentação vigentes.

---

# 84. Registro dos incidentes

Deverá existir registro interno contendo, quando aplicável:

- data;
- descoberta;
- sistemas afetados;
- dados envolvidos;
- causa;
- impacto;
- ações adotadas;
- responsável;
- conclusão.

O prazo jurídico de manutenção desses registros deverá seguir a regulamentação vigente e ser confirmado na revisão jurídica.

---

# 85. Direitos dos titulares

O sistema deverá possuir processo para receber solicitações relacionadas a dados pessoais.

O fluxo jurídico completo pertence à Política de Privacidade e à revisão jurídica.

Tecnicamente, deverá ser possível localizar e corrigir ou remover dados quando legalmente aplicável.

---

# 86. Exclusão de conta

O barbeiro poderá excluir a própria conta em `Sua conta → Zona de perigo`. A operação exige reautenticação com a senha atual e a frase exata `EXCLUIR MINHA CONTA`.

A exclusão é imediata e irreversível. O servidor deverá:

1. validar usuário, senha, sessão e propriedade da barbearia;
2. retirar a Vitrine do ar;
3. invalidar sessões e bloquear novas operações;
4. criar a retenção mínima permitida;
5. apagar dados operacionais do banco;
6. apagar arquivos do Storage;
7. apagar o usuário do Auth;
8. impedir restauração funcional da conta.

Se existir período pago, o acesso termina imediatamente. Não existe reembolso automático, salvo direito legal aplicável.

Backups antigos podem conservar cópias temporárias até sua expiração automática. Eles não deverão ser utilizados intencionalmente para reconstruir a conta excluída.

---

# 87. Exclusão por ADMIN

O ADMIN não possui botão comum de exclusão definitiva.

A exceção administrativa somente poderá ocorrer por exigência legal, fraude ou abuso grave, conteúdo ilegal, solicitação verificada do titular sem acesso, segurança, privacidade ou hipótese prevista nos Termos.

Exigir:

- justificativa;
- autorização específica no servidor;
- confirmação `EXCLUIR BAR-XXXXXX`;
- histórico administrativo;
- preservação mínima e temporária de evidência quando necessária.

Em suspeita de fraude, abuso ou conteúdo ilegal, suspender primeiro e excluir somente após análise e fim da necessidade de preservação.

---

# 88. Retenção

A regra de produto aprovada é manter por cinco anos após a exclusão somente:

- código da barbearia;
- nome da barbearia;
- e-mail responsável;
- pagamentos reais indispensáveis;
- ações administrativas essenciais.

Não reter dados operacionais além do necessário, incluindo vendas, estoque, despesas, relatórios, Portfólio, configurações, Vitrine ou imagens, conforme as regras de exclusão e retenção aplicáveis.

Os registros ficam em estrutura separada, fora da lista normal do ADMIN. O acesso é técnico, restrito, motivado e auditado.

Ao completar cinco anos, eliminar completamente os dados identificáveis e os registros relacionados, salvo obrigação legal superveniente que exija prazo maior. Essa regra deverá ser confirmada na revisão jurídica antes do lançamento comercial.

Após o prazo, poderá permanecer somente uma impressão técnica anônima e não reversível do código para impedir reutilização.

---

# 89. Privacidade desde a concepção

Ao criar uma nova funcionalidade, perguntar:

1. ela precisa de dado pessoal?
2. quais dados?
3. todos são necessários?
4. quem precisa acessar?
5. precisa ficar armazenado?
6. por quanto tempo?
7. será enviado a terceiro?
8. será público?
9. como será excluído?
10. o que acontece se esse dado vazar?

Se essas perguntas não puderem ser respondidas, a funcionalidade ainda não está pronta para produção.

---

# 90. Critérios de segurança antes do lançamento

## Autenticação

Deverá estar confirmado que:

- Supabase Auth está configurado;
- recuperação de senha funciona;
- confirmação de e-mail funciona quando habilitada;
- sessão expirada é tratada;
- Logout funciona;
- senhas não são armazenadas pela aplicação.

## Tipos de usuário

Deverá estar confirmado que:

- cadastro público gera somente `BARBEIRO`;
- usuário não consegue criar `ADMIN`;
- usuário não consegue alterar o próprio tipo;
- contas administrativas são concedidas somente internamente;
- Login redireciona corretamente conforme o tipo.

## Autorização

Deverá estar confirmado que:

- RLS está ativa;
- policies foram revisadas;
- isolamento entre duas barbearias foi testado;
- `BARBEIRO` não acessa rotas administrativas;
- `ADMIN` acessa somente funções permitidas;
- possuir `ADMIN` não concede acesso irrestrito às operações da barbearia.

## Segredos

Deverá estar confirmado que:

- `.env` não é versionado;
- Supabase Secret permanece server-side;
- nenhum segredo existe no código público;
- nenhum segredo aparece em logs.

## Banco

Deverá estar confirmado que:

- PDV é transacional;
- concorrência de estoque foi testada;
- cancelamento foi testado;
- reposição cria somente movimentação de estoque e não gera despesa automática;
- despesa manual opcional de compra de estoque permanece independente da movimentação;
- despesas recorrentes não geram saída antes do pagamento;
- perda não cria saída financeira duplicada;
- backups foram verificados.

## Vitrine

Deverá estar confirmado que:

- nenhum custo é exposto;
- nenhum estoque numérico é exposto;
- estoque mínimo não é exposto;
- nenhum dado administrativo indevido é exposto;
- slug é validado;
- Vitrine despublicada não retorna conteúdo privado.

## Uploads

Deverá estar confirmado que:

- tipo de arquivo é validado;
- tamanho é validado;
- policies de Storage foram implementadas;
- acesso entre tenants foi testado.

## Assistente IA — recurso futuro

Não é critério de lançamento da versão inicial. Antes de uma futura liberação comercial, deverão ser definidos e testados os controles específicos do módulo conforme `ASSISTENTE_IA_FUTURO.md`.

## Produção

Deverá estar confirmado que:

- HTTPS está ativo;
- logs foram revisados;
- erros não revelam detalhes internos;
- ambientes estão separados;
- Política de Privacidade está disponível;
- Termos de Uso estão disponíveis;
- revisão jurídica necessária foi concluída.

---

# 91. Referências normativas e técnicas

Este documento deverá ser revisado considerando principalmente:

- Lei nº 13.709/2018 - Lei Geral de Proteção de Dados Pessoais;
- Lei nº 12.965/2014 - Marco Civil da Internet;
- Decreto nº 8.771/2016 e alterações aplicáveis;
- regulamentações vigentes da Autoridade Nacional de Proteção de Dados;
- Guia Orientativo sobre Segurança da Informação para Agentes de Tratamento de Pequeno Porte - ANPD;
- recomendações oficiais dos fornecedores utilizados pelo sistema;
- boas práticas de segurança para aplicações web.

---

# 92. Atualização

Este documento deverá ser revisado quando houver:

- nova integração;
- nova categoria de dado;
- mudança de autenticação;
- mudança de autorização;
- novo tipo de usuário;
- ampliação das permissões do ADMIN;
- novo módulo público;
- pagamento;
- cadastro de clientes;
- automação de WhatsApp;
- mudança relevante de infraestrutura;
- incidente de segurança;
- mudança legal relevante.

---

# 96. Assistente IA — proteção futura de dados

Não há tratamento de conversas de IA na versão inicial. Caso o recurso seja implementado futuramente, a política de persistência, logs e minimização deverá ser definida antes da liberação.

---

# 97. Código da barbearia

O código `BAR-XXXXXX` deverá ser gerado por função de servidor, possuir restrição única e nunca ser reutilizado. Evitar caracteres ambíguos. O valor não é público e não deve entrar em URLs da Vitrine.

# 98. Separação entre plano e status

Plano expirado não suspende conta. O plano efetivo passa ao Grátis. `SUSPENSA` é decisão administrativa separada, preserva dados e pode ser revertida.

O guard de autorização deverá calcular validade em cada acesso. Não confiar apenas em um status atualizado por tarefa agendada.

# 99. Aceites de documentos legais

Registrar tipo do documento, versão e data/hora de aceite. Não tratar todo processamento necessário ao serviço como se dependesse de consentimento genérico. A base jurídica e o texto final pertencem à revisão profissional.

# 100. Backup e restauração

Antes do primeiro uso real deverão existir:

- backup automático diário do banco;
- proteção equivalente para arquivos do Storage;
- teste de restauração concluído com sucesso;
- registro da data, resultado e responsável pelo teste.

Backup não substitui exclusão. Cópias expiram conforme a política divulgada e não podem ser restauradas para reativar conta excluída.

# 101. Falha crítica em produção

Risco de vazamento, mistura entre tenants, perda de dados, cálculo financeiro incorreto ou indisponibilidade essencial exige:

1. ativar manutenção;
2. avisar o barbeiro pelo WhatsApp durante o primeiro uso assistido;
3. preservar evidência técnica mínima;
4. corrigir e testar;
5. verificar integridade dos dados;
6. reabrir somente após validação.
