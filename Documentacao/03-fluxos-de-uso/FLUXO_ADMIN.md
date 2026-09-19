# FLUXO_ADMIN — Estilo e Gestão

## Objetivo

Este documento concentra os fluxos funcionais do **Operador do SaaS** no Estilo e Gestão.

Ele deve ser usado como referência principal para a implementação e validação da área administrativa, cobrindo:

- autenticação e autorização do ADMIN;
- navegação administrativa;
- Dashboard do SaaS;
- busca e consulta de barbearias;
- detalhes administrativos da conta;
- assinatura, pagamentos e mudanças de plano;
- suspensão e reativação;
- manutenção global;
- histórico administrativo;
- exclusão administrativa excepcional;
- limites de acesso a dados privados das barbearias;
- estados de carregamento, erro e responsividade.

Detalhes de banco, RLS, segurança profunda e retenção permanecem nos documentos específicos de banco e segurança.

---

# 1. Ator: Operador do SaaS

O Operador do SaaS utiliza uma conta autenticada com:

```text
tipo = ADMIN
```

O ADMIN utiliza o mesmo fluxo de Login do barbeiro, mas entra em uma área administrativa separada.

No cadastro público:

- todo novo usuário recebe `BARBEIRO`;
- não existe opção para criar conta como `ADMIN`;
- o próprio usuário não pode alterar seu tipo;
- a atribuição de `ADMIN` é interna e protegida.

No MVP, a promoção para `ADMIN` é realizada manualmente no banco de dados.

---

# 2. Princípios de autorização

O fato de um perfil possuir `tipo = ADMIN` não significa acesso irrestrito ao banco.

Toda ação administrativa deve validar:

1. sessão válida;
2. usuário autenticado;
3. `tipo = ADMIN`;
4. ação permitida;
5. dados mínimos necessários para a operação.

Não utilizar a regra conceitual:

```text
ADMIN pode tudo
```

O ADMIN não recebe acesso automático às tabelas privadas das barbearias apenas por possuir esse tipo de perfil.

---

# 3. Login do ADMIN

## Dados usados

- e-mail;
- senha.

## Fluxo

1. O operador acessa a mesma tela de Login utilizada pelo barbeiro.
2. Informa e-mail e senha.
3. O Supabase Auth valida as credenciais.
4. O backend localiza o perfil.
5. O backend verifica `tipo`.
6. Se `tipo = ADMIN`, valida a autorização administrativa.
7. Se autorizado, direciona para o Painel Administrativo.
8. Se `tipo = BARBEIRO`, utiliza o fluxo normal da barbearia.

Não criar uma tela pública separada de **Login do Administrador** no MVP.

## Erros

### Credenciais inválidas

> E-mail ou senha incorretos.

### Sem permissão administrativa

> Você não possui permissão para acessar esta área.

### Sessão expirada

> Sua sessão expirou. Entre novamente para continuar.

---

# 4. Estrutura da área administrativa

A navegação principal do ADMIN possui inicialmente apenas:

```text
Dashboard
Barbearias
```

Não criar como item principal no MVP:

- Assinaturas;
- Clientes;
- Vendas;
- Estoque;
- Financeiro das barbearias;
- Agendamento;
- Funcionários;
- Novidades/Atualizações.

A conta do próprio ADMIN pode reutilizar os fluxos comuns já existentes de:

- Perfil;
- Aparência;
- Alterar senha;
- Logout.

Não é necessário criar uma segunda versão administrativa dessas telas apenas por diferença de papel.

---

# 5. Dashboard administrativo

## Objetivo

Apresentar uma visão operacional do SaaS sem acessar dados privados de funcionamento das barbearias.

## Indicadores aprovados

Mostrar:

- total de barbearias;
- quantidade no Plano Grátis;
- quantidade no Plano Normal;
- receita de assinaturas recebida no mês;
- próximos vencimentos;
- alterações de plano, renovações ou ações pendentes relevantes;
- status global do sistema/manutenção.

## Receita do mês

A receita exibida é exclusivamente a receita recebida pelo **Estilo e Gestão** com assinaturas do SaaS.

Nunca utilizar para esse indicador:

- faturamento das barbearias;
- vendas das barbearias;
- despesas das barbearias;
- estoque;
- resultado financeiro privado dos tenants.

## Próximos vencimentos

Pode apresentar:

- nome da barbearia;
- código `BAR-XXXXXX`;
- plano atual;
- data de vencimento.

Não chamar uma conta sem renovação de:

- inadimplente;
- devedora;
- irregular.

Ao final do período pago, sem novo pagamento confirmado, a conta simplesmente retorna ao Plano Grátis.

## Status do sistema

Quando a manutenção global estiver desativada, informar de forma simples que o sistema está operando normalmente.

O Dashboard pode oferecer a ação administrativa para ativar manutenção.

---

# 6. Lista de barbearias

## Objetivo

Permitir localizar uma barbearia e abrir seus dados administrativos.

## Busca

Usar uma busca única por:

- nome da barbearia;
- código amigável `BAR-XXXXXX`.

Não exigir que o operador saiba UUID ou ID técnico.

## Filtros

### Plano

- Todos;
- Grátis;
- Normal;

### Situação da conta

- Todas;
- Ativa;
- Suspensa.

Plano e situação são conceitos independentes.

Exemplos válidos:

```text
Ativa + Grátis
Ativa + Normal
Suspensa + qualquer plano
```

Não utilizar `Inativa` como situação comum.

## Dados da lista

Exibir, no mínimo:

- nome;
- Código da barbearia;
- plano;
- situação da conta.

A validade do plano pode aparecer quando ajudar a operação.

Não mostrar na listagem:

- UUID;
- tenant ID interno;
- vendas;
- faturamento da barbearia;
- estoque;
- despesas;
- clientes;
- dados privados operacionais.

## Estado vazio

> Nenhuma barbearia encontrada. Tente alterar a busca ou os filtros.

---

# 7. Detalhes da barbearia

## Objetivo

Concentrar dados administrativos e ações autorizadas de uma única conta.

## Dados permitidos

Exibir:

- nome da barbearia;
- Código da barbearia;
- responsável/perfil;
- e-mail;
- WhatsApp;
- plano atual;
- situação da conta;
- data de criação;
- validade atual do plano.

O Código da barbearia:

- é gerado pelo servidor;
- é único;
- é imutável;
- não muda quando o nome da barbearia muda;
- pode ser copiado pelo ADMIN;
- não é um identificador público da Vitrine.

## Dados proibidos por padrão

Não exibir:

- senha;
- credenciais;
- tokens;
- Secret Keys;
- vendas privadas;
- despesas;
- estoque;
- relatórios internos;
- dados operacionais sem necessidade administrativa.

O ADMIN não deve agir como se fosse proprietário da barbearia.

---

# 8. Plano e situação da conta

A tela de detalhes deve separar claramente:

```text
Plano
```

 de:

```text
Situação da conta
```

Planos oficiais:

- Grátis;
- Normal.

Situações da conta:

- Ativa;
- Suspensa.

A suspensão é excepcional e não decorre automaticamente de falta de renovação.

---

# 9. Pagamento manual

## Objetivo

Registrar pagamentos reais recebidos pelo Estilo e Gestão.

O pagamento inicial é feito por Pix e confirmado manualmente pelo ADMIN.

## Campos

- data real do pagamento;
- valor efetivamente recebido;
- plano resultante.

## Regra da data

A validade utiliza a data real do pagamento, não a data em que o ADMIN realizou a confirmação.

Exemplo:

```text
Pagamento recebido: 16/10
Confirmação administrativa: 17/10
Data usada para o ciclo: 16/10
```

## Fluxo

1. O barbeiro realiza o Pix pelo processo comercial definido.
2. O ADMIN abre a barbearia correspondente.
3. Seleciona **Confirmar pagamento**.
4. Informa data real e valor recebido.
5. Confirma o plano resultante.
6. O backend valida a operação.
7. Cria o pagamento permanente.
8. Atualiza a validade conforme a regra vigente.
9. Registra evento no histórico administrativo.

O barbeiro não confirma o próprio pagamento dentro do sistema.

---

# 10. Renovação antecipada

Se o pagamento ocorrer antes do vencimento atual, os dias restantes não podem ser perdidos.

Exemplo:

```text
Plano atual válido até: 16/10
Pagamento antecipado: 10/10
```

O novo período começa após o término do período já pago.

Não substituir imediatamente a validade atual pela data do pagamento antecipado.

---

# 11. Renovação após vencimento

Quando o período pago já terminou, a conta retorna ao Grátis.

Se houver um novo pagamento depois:

```text
Vencimento anterior: 16/10
Novo pagamento: 23/10
Novo ciclo: começa em 23/10
```

Não existe período de tolerância automático.

---

# 12. Mudança entre Grátis e Normal

Na versão inicial existe apenas um plano pago: Normal.

Regras:

- Grátis → Normal ocorre após confirmação de pagamento real ou concessão de cortesia administrativa;
- Normal → Grátis ocorre no vencimento sem renovação ou ao término de um cancelamento agendado;
- não existe segundo plano pago para upgrade ou downgrade nesta etapa;
- mudanças relevantes devem ser registradas no histórico administrativo.

---
# 13. Recursos comerciais futuros

Planos adicionais, incluindo eventual plano associado ao Assistente IA, não fazem parte da versão inicial.

Quando esse recurso entrar no escopo, revisar regras de upgrade, downgrade e cobrança conforme `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

---
# 14. Cancelamento da assinatura

Cancelar assinatura não significa excluir conta.

Regras:

- o plano pago continua até o vencimento atual;
- depois, a conta retorna ao Grátis;
- os dados permanecem armazenados;
- a Vitrine e os recursos do Grátis permanecem disponíveis;
- o cancelamento pode ser desfeito antes do fim do período.

O ADMIN pode executar ou confirmar as ações administrativas correspondentes conforme o fluxo aprovado.

Não chamar esse estado de inadimplência.

---

# 15. Período gratuito administrativo

O ADMIN pode conceder um período gratuito de um plano sem criar pagamento fictício.

O registro deve deixar claro que se trata de uma concessão administrativa.

## Primeiro barbeiro parceiro

O primeiro barbeiro recebe um ciclo do Plano Normal concedido administrativamente quando o sistema estiver pronto para uso real e o link for enviado.

Para o barbeiro, a interface mostra apenas:

- Plano Normal ativo;
- validade correspondente.

No ADMIN, o histórico pode indicar que o período foi concedido administrativamente.

Não criar uma transação Pix falsa.

---

# 16. Histórico de pagamentos

O histórico de pagamentos contém apenas pagamentos reais confirmados.

Cada registro pode conter:

- data do pagamento;
- plano;
- valor recebido;
- validade resultante.

Períodos gratuitos administrativos não entram como pagamento.

---

# 17. Histórico administrativo

O histórico administrativo é separado do histórico de pagamentos e do histórico operacional da barbearia.

Pode registrar eventos como:

- plano ativado;
- pagamento confirmado;
- cancelamento de assinatura;
- cancelamento desfeito;
- período gratuito concedido;
- conta suspensa;
- conta reativada;
- manutenção global alterada;
- exclusão administrativa excepcional.

Cada evento relevante deve guardar, quando aplicável:

- ator;
- data/hora;
- tipo do evento;
- estado anterior;
- estado posterior;
- justificativa quando exigida.

Esse histórico não concede ao ADMIN acesso ao histórico de vendas da barbearia.

---

# 18. Suspensão de conta

## Objetivo

Bloquear temporariamente o acesso de uma conta em situação administrativa excepcional.

Suspensão pode ser utilizada em situações como:

- abuso;
- fraude;
- violação grave dos Termos;
- conteúdo proibido ou ilegal;
- risco de segurança;
- problema administrativo grave.

Não utilizar suspensão por simples não renovação.

## Fluxo

1. ADMIN abre os detalhes da barbearia.
2. Seleciona **Suspender conta**.
3. O sistema exige confirmação.
4. A justificativa administrativa é registrada quando exigida.
5. Backend valida `ADMIN` e a ação.
6. Situação passa para `SUSPENSA`.
7. Evento é registrado no histórico administrativo.

## Efeito

Enquanto suspensa:

- o barbeiro ainda pode autenticar;
- após autenticação, vê a tela global **Conta suspensa**;
- os módulos privados não são montados;
- a Vitrine pública fica indisponível;
- os dados permanecem armazenados.

O visitante da Vitrine não deve ser informado de que houve suspensão. A mensagem pública deve ser neutra.

---

# 19. Reativação

A reativação é manual pelo ADMIN.

Ao reativar:

- situação volta para `ATIVA`;
- acesso normal é restabelecido de acordo com o plano efetivo;
- Vitrine volta a poder ser acessada se estiver publicada;
- dados não precisam ser reconstruídos;
- registrar evento administrativo.

---

# 20. Manutenção global

O ADMIN pode ativar e encerrar o modo de manutenção global.

## Configuração

Permitir definir:

- manutenção ativa/inativa;
- motivo interno;
- mensagem pública quando aplicável;
- se o motivo será exibido publicamente;
- previsão de retorno opcional.

Motivos podem incluir:

- melhorias;
- correção de falhas;
- segurança/privacidade;
- outro motivo informado pelo ADMIN.

Não exigir previsão de retorno.

## Efeito

Enquanto a manutenção global estiver ativa:

- usuários comuns veem a tela global de manutenção;
- a Vitrine pública utiliza o mesmo estado global de manutenção;
- o ADMIN mantém acesso ao Painel Administrativo;
- não é necessário criar uma segunda lógica de manutenção exclusiva para Vitrine.

## Encerramento

Ao encerrar manutenção:

- remover o bloqueio global;
- restabelecer acesso normal;
- registrar a alteração administrativa quando aplicável.

---

# 21. Assistente IA — recurso futuro

O painel ADMIN da versão inicial não possui consumo, cota, extensão ou controles específicos de IA.

Quando o Assistente IA entrar no escopo, os controles administrativos deverão ser definidos conforme `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

---
# 22. Exclusão administrativa excepcional

O ADMIN não possui um botão comum de exclusão definitiva nos detalhes da barbearia.

A exclusão administrativa é excepcional e pode ocorrer apenas em hipóteses documentadas, como:

- exigência legal;
- fraude ou abuso grave;
- conteúdo ilegal;
- segurança;
- privacidade;
- solicitação verificada do titular sem acesso;
- hipótese prevista nos Termos.

## Regra operacional

Em fraude, abuso, conteúdo ilegal ou risco de segurança:

1. suspender primeiro;
2. preservar apenas a evidência necessária;
3. analisar a situação;
4. excluir somente quando a preservação não for mais necessária.

## Confirmação

Exigir:

- justificativa;
- autorização específica no servidor;
- confirmação no formato:

```text
EXCLUIR BAR-XXXXXX
```

- registro no histórico administrativo.

Após a exclusão:

- a conta desaparece da lista normal de barbearias;
- não pode ser restaurada;
- somente os registros mínimos permitidos entram na estrutura de retenção.

---

# 23. Retenção após exclusão

A regra de produto vigente é manter por cinco anos apenas:

- código da barbearia;
- nome da barbearia;
- e-mail responsável;
- pagamentos reais indispensáveis;
- ações administrativas essenciais.

Não reter na área administrativa comum:

- vendas;
- estoque;
- despesas;
- relatórios;
- Portfólio;
- Vitrine;
- imagens;
- configurações operacionais;

Os registros retidos ficam fora da lista normal do ADMIN e possuem acesso técnico restrito, motivado e auditado.

A regra deve passar por revisão jurídica antes do lançamento comercial definitivo.

---

# 24. Dados que o ADMIN não deve acessar

Por padrão, o ADMIN não deve:

- visualizar senha;
- consultar credenciais ou tokens;
- consultar segredos;
- realizar venda como barbeiro;
- criar ou alterar despesas da barbearia;
- alterar estoque como barbeiro;
- modificar produtos como proprietário;
- acessar a conta como se fosse o barbeiro;
- acessar dados operacionais privados sem necessidade;
- desativar RLS genericamente;
- usar impersonação no MVP.

Não existe no MVP:

```text
Entrar como barbeiro
```

ou equivalente.

---

# 25. Segurança e RLS

A área administrativa utiliza endpoints e operações controladas.

Fluxo conceitual:

```text
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
consultar somente os dados necessários
↓
executar operação
↓
registrar histórico quando aplicável
```

Operações administrativas com privilégios elevados devem ocorrer somente no servidor.

Secret Keys nunca podem ser enviadas ao navegador.

---

# 26. Loading, sucesso e erro

## Loading

Durante uma ação administrativa:

- desabilitar o botão responsável;
- impedir múltiplos envios;
- preservar os dados preenchidos;
- indicar processamento.

## Sucesso

Após confirmação do servidor:

- atualizar o estado da tela;
- exibir mensagem curta;
- registrar o evento quando aplicável.

## Erro

Não exibir:

- SQL;
- stack trace;
- segredo;
- token;
- caminho interno;
- payload sensível.

Mensagem genérica quando não houver uma explicação funcional mais específica:

> Não foi possível concluir esta operação. Tente novamente.

---

# 27. Responsividade da área ADMIN

## Desktop

Utilizar a sidebar administrativa aprovada com:

- Dashboard;
- Barbearias;
- conta do ADMIN.

Não usar navegação inferior de Mobile no Desktop.

## Mobile

Não utilizar sidebar permanente.

Usar navegação administrativa compacta com:

- Dashboard;
- Barbearias.

Telas de detalhe devem empilhar informações, evitando tabelas largas e ações excessivas lado a lado.

A regra funcional deve permanecer equivalente entre Desktop e Mobile.

---

# 28. Estados globais e ADMIN

## Manutenção

O ADMIN continua acessando a área administrativa enquanto usuários comuns e visitantes recebem o estado global de manutenção.

## Offline

Se o dispositivo do ADMIN ficar sem conexão, utilizar o mesmo estado global Offline e restaurar o contexto anterior quando a conexão voltar, quando possível.

## 404

Rotas administrativas inexistentes utilizam o estado global **Página não encontrada**, sem expor detalhes técnicos.

---

# 29. Primeiro uso real

Antes do primeiro barbeiro utilizar dados reais, o ADMIN deve conseguir executar, no mínimo:

- localizar a barbearia;
- consultar plano e validade;
- conceder o primeiro ciclo gratuito do Normal;
- confirmar pagamento real quando ocorrer;
- aplicar mudanças de plano aprovadas;
- suspender/reativar;
- ativar manutenção em falha crítica.

O piloto exige também:

- núcleo do Plano Normal funcional;
- RLS e isolamento testados;
- backup automático diário;
- restauração testada;
- Termos e Política publicados com aceite registrado;
- ausência de falha crítica ou operacional conhecida.

---

# 30. Fora do escopo inicial do ADMIN

Continuam fora da versão inicial:

- cobrança automática;
- gateway de pagamento;
- página geral de Assinaturas;
- impersonação;
- RBAC avançado;
- múltiplos ADMINs com níveis diferentes;
- Agendamento;
- Funcionários;
- acesso irrestrito a dados operacionais privados;
- criação manual de barbearias pelo painel como fluxo comum.

---

# 31. Resumo operacional

O fluxo administrativo inicial é:

```text
Login único
↓
perfil ADMIN validado
↓
Dashboard administrativo
↓
Barbearias
↓
busca por nome ou EG
↓
Detalhes administrativos
↓
pagamento / plano / suspensão / suporte operacional permitido
↓
histórico administrativo
```

O princípio central é simples:

> O ADMIN administra o serviço Estilo e Gestão, não a operação privada da barbearia.
