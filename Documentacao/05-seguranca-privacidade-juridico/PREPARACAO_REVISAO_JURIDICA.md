# Preparação para Revisão Jurídica — Estilo e Gestão

## Objetivo

Este documento define como o **Estilo e Gestão** deve se preparar para uma revisão jurídica antes do lançamento comercial definitivo.

Ele não constitui parecer jurídico.

Seu objetivo é organizar o funcionamento real do projeto, os dados tratados, os fornecedores, as decisões pendentes e os documentos que deverão ser apresentados a um profissional jurídico.

A ideia é evitar chegar à revisão dizendo apenas:

> "É um SaaS de barbearia, acho que está tudo certo."

O advogado deverá receber informações concretas sobre o sistema.

---

# 1. Resumo do projeto

## Nome

**Estilo e Gestão**

## Tipo

SaaS web responsivo para gestão de pequenas barbearias.

## Público principal

- barbeiros autônomos;
- pequenas barbearias.

## Modelo inicial

Uma conta administrativa para uma barbearia.

## Principais módulos

- autenticação;
- Dashboard;
- serviços;
- produtos;
- categorias;
- estoque;
- PDV;
- vendas;
- despesas;
- relatórios;
- Vitrine Digital;
- Portfólio;

---

# 2. O que não existe no MVP

- cadastro de clientes;
- login de clientes;
- agendamento;
- sinal;
- pagamento online;
- lembrete de retorno;
- WhatsApp automático;
- fidelidade;
- equipe de vários barbeiros;
- comissão;
- billing automático.

Isso é relevante porque cada funcionalidade adicional pode alterar as obrigações jurídicas e o inventário de dados.

---

# 3. Pessoas envolvidas

A revisão deverá considerar dados relacionados a:

## Barbeiro / responsável

Pessoa que cria a conta e administra a barbearia.

## Visitante

Pessoa que acessa a Vitrine.

## Pessoa presente em imagem

Pessoa que pode aparecer em foto publicada no Portfólio.

## Pessoa que utiliza recurso futuro de IA

Não se aplica à versão inicial. Revisar esta categoria somente quando o módulo de IA entrar novamente no escopo.

## Pessoa que entra em contato com suporte

Usuário ou titular que envia uma solicitação.

---

# 4. Dados previstos da conta

- nome, quando informado;
- e-mail;
- identificador do usuário;
- dados de autenticação gerenciados pelo Supabase Auth;
- sessão.

A senha não é armazenada em texto pela aplicação.

---

# 5. Dados da barbearia

- nome da marca;
- nome profissional;
- telefone;
- WhatsApp;
- Instagram;
- CEP;
- rua/logradouro;
- número;
- bairro;
- cidade;
- estado;
- complemento;
- atendimento a domicílio;
- horários;
- descrição;
- logo;
- capa.

O advogado deverá avaliar em quais situações essas informações são dados de pessoa natural e em quais são apenas informações empresariais.

---

# 6. Dados operacionais

- serviços;
- categorias;
- produtos;
- estoque;
- movimentações;
- vendas;
- itens;
- forma de pagamento quando informada;
- despesas;
- valores;
- datas;
- observações.

---

# 7. Imagens

O sistema poderá armazenar:

- logo;
- capa;
- produtos;
- Portfólio.

Questões a validar:

- responsabilidade por imagens enviadas pelo barbeiro;
- necessidade de autorização de pessoas identificáveis;
- imagens de crianças ou adolescentes;
- procedimento de denúncia;
- remoção de imagem;
- responsabilidade do SaaS após receber solicitação válida.

---

# 8. Vitrine pública

A Vitrine poderá expor:

- nome;
- descrição;
- serviços;
- preços;
- produtos;
- imagens;
- endereço;
- horários;
- WhatsApp;
- Instagram.

Deverá ser validado:

- quais informações podem ser públicas por escolha do usuário;
- como demonstrar essa escolha;
- necessidade de avisos;
- responsabilidade por conteúdo publicado;
- procedimento de remoção de conteúdo ilícito ou indevido.

---

# 9. Assistente IA — revisão futura

O recurso não faz parte da versão inicial. Qualquer revisão jurídica específica de IA deverá ocorrer antes de sua futura implementação comercial e considerar fornecedor, dados enviados, transparência, retenção, limites e transferência internacional.

---

# 10. ViaCEP

Uso:

- preenchimento assistido do endereço.

Dado enviado:

- CEP.

Validar:

- existência de implicação relevante de privacidade;
- necessidade de citar o fornecedor na Política;
- condições de uso do serviço.

---

# 11. Supabase

Uso:

- PostgreSQL;
- Auth;
- Storage;
- RLS.

Verificar antes da revisão:

- região do projeto;
- contrato;
- termos;
- política de privacidade;
- subprocessadores;
- transferência internacional;
- mecanismos de segurança;
- backup;
- retenção aplicável.

---

# 12. Vercel

Uso:

- hospedagem da aplicação;
- execução do Next.js;
- logs técnicos;
- infraestrutura.

Verificar:

- região;
- política;
- contrato;
- subprocessadores;
- logs;
- retenção;
- transferência internacional.

---

# 13. Provedor de IA — revisão futura

Nenhum provedor de IA integra a versão inicial. A escolha do fornecedor e a revisão jurídica correspondente ficam adiadas até a retomada do módulo.

---

# 14. GitHub

O GitHub armazena:

- código;
- documentação;
- histórico do projeto.

Não deve armazenar dados reais de clientes ou segredos.

Avaliar se é necessário constar na Política de Privacidade. Em princípio, se não receber dados dos usuários finais, seu papel é principalmente de ferramenta de desenvolvimento.

---

# 15. Dados e finalidades

Antes da revisão jurídica, montar uma tabela final como:

| Dado | Titular | Finalidade | Onde fica | Compartilhado com | Retenção | Base legal |
|---|---|---|---|---|---|---|
| E-mail | Barbeiro | Criar/autenticar conta | Supabase | Supabase | Pendente | Validar |
| Nome | Barbeiro | Identificação | Banco | Supabase | Pendente | Validar |
| WhatsApp | Barbeiro | Contato/Vitrine | Banco | Supabase/Vitrine | Pendente | Validar |
| CEP | Barbeiro | Endereço | Banco | Supabase/ViaCEP | Pendente | Validar |
| Foto Portfólio | Terceiro possível | Divulgação | Storage | Supabase/Vitrine | Pendente | Validar |

A tabela deverá refletir o sistema real no momento da revisão.

---

# 16. Bases legais

Não decidir bases legais por conveniência.

Para cada tratamento, perguntar ao advogado:

- qual finalidade?
- qual base legal?
- existe alternativa menos invasiva?
- há necessidade de consentimento?
- como o titular é informado?
- como ocorre eventual revogação?
- existe obrigação de retenção?

Possíveis hipóteses previstas na LGPD poderão incluir, dependendo da situação:

- execução de contrato;
- cumprimento de obrigação legal;
- consentimento;
- legítimo interesse;
- exercício regular de direitos.

A definição definitiva deverá vir da análise jurídica.

---

# 17. Papéis de controlador e operador

Este é um dos pontos mais importantes da revisão.

O Estilo e Gestão poderá exercer papéis diferentes conforme o dado e a finalidade.

Exemplo de questão:

> O Estilo e Gestão decide por que o e-mail do barbeiro é usado para criar a conta?

Pode haver papel de controlador.

Outra questão:

> Quando o barbeiro publica uma foto de seu cliente na Vitrine, quem define a finalidade daquela publicação?

A relação entre SaaS, barbearia e fornecedores precisa ser avaliada juridicamente.

Não declarar um único papel para todas as operações sem análise.

---

# 18. Encarregado pelo tratamento de dados

Verificar com o advogado:

- se existe obrigação de nomear encarregado;
- se o projeto se enquadra em regra simplificada aplicável;
- qual contato deve ser publicado;
- quem responderá solicitações de titulares.

Não assumir dispensa apenas por o projeto ser pequeno.

---

# 19. Direitos dos titulares

Preparar um processo para solicitações de:

- confirmação;
- acesso;
- correção;
- eliminação quando cabível;
- bloqueio;
- anonimização;
- informações sobre compartilhamento;
- revogação do consentimento quando aplicável;
- oposição quando prevista em lei;
- portabilidade conforme regulamentação aplicável.

---

# 20. Canal de privacidade

Antes do lançamento definir:

```text
privacidade@DOMINIO
```

ou outro canal oficial.

Deverá existir responsável por:

- receber;
- registrar;
- verificar;
- responder;
- acompanhar solicitações.

---

# 21. Verificação de identidade

Um pedido de acesso ou exclusão não deverá ser atendido automaticamente apenas porque alguém informou um e-mail.

Deverá existir processo proporcional para confirmar a identidade do solicitante.

Validar juridicamente e tecnicamente o método.

---

# 22. Exclusão de conta

Definir com o advogado:

- quais dados são apagados;
- quando;
- quais precisam ser conservados;
- por quanto tempo;
- quais podem ser anonimizados;
- como tratar vendas;
- como tratar despesas;
- como tratar logs;
- como tratar arquivos;
- como tratar backups.

---

# 23. Retenção

Criar tabela definitiva de retenção.

Exemplo de estrutura:

| Categoria | Retenção | Motivo | Exclusão |
|---|---|---|---|
| Conta | Pendente | Validar | Pendente |
| Vendas | Pendente | Validar | Pendente |
| Despesas | Pendente | Validar | Pendente |
| Portfólio | Pendente | Validar | Pendente |
| Logs | Pendente | Validar lei | Pendente |
| Suporte | Pendente | Validar | Pendente |

Não utilizar prazos inventados.

---

# 24. Marco Civil da Internet

Solicitar análise específica sobre a aplicação do Marco Civil da Internet ao Estilo e Gestão.

Em especial, validar:

- enquadramento como provedor de aplicação;
- obrigação de guarda de registros de acesso;
- prazo aplicável;
- informações que compõem o registro;
- forma segura de armazenamento;
- condições para fornecimento;
- alterações regulamentares vigentes.

Esse ponto deverá ser analisado com base na estrutura jurídica real da operação.

---

# 25. Crianças e adolescentes

Embora o sistema administrativo seja destinado a profissionais, a Vitrine será pública.

O advogado deverá avaliar:

- se o serviço possui acesso provável por crianças ou adolescentes;
- quais obrigações adicionais podem ser aplicáveis;
- como lidar com fotos de menores no Portfólio;
- se devem existir restrições específicas.

Também deverá ser verificada a legislação brasileira vigente aplicável a produtos e serviços digitais acessados por crianças e adolescentes.

---

# 26. Transferência internacional

Para cada fornecedor, registrar:

- país/região;
- dado enviado;
- finalidade;
- mecanismo jurídico aplicável;
- contrato;
- subprocessadores.

Fornecedores a verificar:

- Supabase;
- Vercel;
- Google.

---

# 27. Cookies e rastreamento

No momento, o projeto prevê apenas mecanismos tecnicamente necessários ao funcionamento e autenticação.

Antes do lançamento confirmar:

- quais cookies existem;
- finalidade;
- duração;
- quem os cria;
- se há analytics;
- se há tracking;
- se existe necessidade de banner ou mecanismo de consentimento.

Não instalar Google Analytics, Meta Pixel ou tecnologia semelhante sem revisar este ponto.

---

# 28. Segurança

Levar para revisão jurídica o documento:

```text
DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md
```

Confirmar se os processos técnicos são suficientes para as obrigações assumidas nos documentos públicos.

Não escrever na Política:

> Utilizamos segurança de nível militar.

ou:

> Garantimos 100% de segurança.

Nenhum sistema pode prometer risco zero.

---

# 29. Incidentes

Preparar:

- fluxo interno;
- pessoa responsável;
- registro;
- avaliação de risco;
- mecanismo de comunicação;
- contatos necessários.

O advogado deverá orientar a aplicação do regulamento vigente de comunicação de incidentes da ANPD.

---

# 30. Registro de incidentes

Verificar:

- informações mínimas;
- prazo de manutenção;
- responsável;
- local seguro de armazenamento.

---

# 31. Termos de Uso

O advogado deverá revisar pelo menos:

- objeto do serviço;
- requisitos da conta;
- responsabilidades do usuário;
- uso permitido;
- conteúdo enviado;
- Portfólio;
- disponibilidade;
- suporte;
- suspensão;
- cancelamento;
- propriedade intelectual;
- Vitrine;
- limitações;
- modelo comercial;
- jurisdição/foro quando aplicável.

O documento correspondente será:

```text
TERMOS_DE_USO.md
```

---

# 32. Modelo comercial

Antes da revisão jurídica definir:

## Plano normal

- preço;
- cobrança;
- periodicidade;
- período gratuito, se houver;
- cancelamento;
- atraso;
- reajuste.

Enquanto isso não for decidido, os Termos não poderão conter condições comerciais definitivas.

---

# 33. Relação de consumo

Perguntar ao advogado:

- quais regras do Código de Defesa do Consumidor se aplicam;
- como deve funcionar contratação online;
- informações obrigatórias antes da compra;
- cancelamento;
- direito de arrependimento quando aplicável;
- atendimento;
- cobrança;
- comprovantes.

---

# 34. Documentos que devem ser entregues ao advogado

Preparar a versão atual de:

1. Documento de Visão;
2. Decisões Tecnológicas;
3. Fluxo Técnico do Barbeiro e Cliente;
4. Banco de Dados;
5. Diretrizes de Segurança;
6. Política de Privacidade;
7. Termos de Uso;
8. Modelo de Negócio;
9. lista de fornecedores;
10. inventário de dados;
11. fluxo de exclusão;
12. fluxo de incidentes.

Não é necessário entregar código completo inicialmente, salvo se solicitado.

---

# 35. Dados da empresa/responsável

Antes da versão jurídica final definir:

- nome/razão social;
- CPF/CNPJ;
- endereço;
- e-mail;
- telefone;
- responsável legal.

Sem isso, Termos e Política continuarão sendo minutas.

---

# 36. Propriedade intelectual

Validar:

- titularidade da marca Estilo e Gestão;
- titularidade do código;
- logo;
- imagens próprias;
- licenças das bibliotecas;
- fontes;
- ícones;
- conteúdo criado por usuários.

Avaliar necessidade e momento de registro de marca.

---

# 37. Conteúdo criado pelo barbeiro

Definir nos Termos:

- quem é responsável pelas informações publicadas;
- quem é responsável pelas imagens;
- proibição de conteúdo ilícito;
- procedimento de denúncia;
- possibilidade de remoção;
- medidas em caso de abuso.

---

# 38. Assistente IA nos Termos — futuro

Não é necessário disciplinar o recurso na versão inicial. Antes de uma futura liberação, revisar Termos de Uso e Política de Privacidade para incluir as condições específicas do módulo.

---

# 39. Vitrine e indexação

Verificar:

- responsabilidade por informações públicas;
- possibilidade de indexação por buscadores;
- consequências de publicação;
- tratamento após despublicação;
- cache externo de mecanismos de busca.

O sistema pode retirar uma página do ar, mas não controla instantaneamente caches mantidos por terceiros.

---

# 40. Checklist antes de enviar para revisão

## Identidade

- [ ] Responsável legal definido.
- [ ] CPF/CNPJ definido.
- [ ] Endereço definido.
- [ ] Contato definido.
- [ ] E-mail de privacidade definido.

## Produto

- [ ] Escopo da versão inicial congelado.
- [ ] Planos definidos.
- [ ] Preços definidos.
- [ ] Processo de cancelamento definido.

## Dados

- [ ] Inventário completo.
- [ ] Finalidades definidas.
- [ ] Fornecedores listados.
- [ ] Dados públicos identificados.
- [ ] Retenção proposta.
- [ ] Exclusão proposta.

## Terceiros

- [ ] Supabase revisado.
- [ ] Vercel revisada.
- [ ] Provedor de IA futuro revisado antes da implementação do módulo.
- [ ] ViaCEP revisado.

## Documentos

- [ ] Política de Privacidade atualizada.
- [ ] Termos de Uso atualizados.
- [ ] Segurança atualizada.
- [ ] Modelo de Negócio atualizado.

## Procedimentos

- [ ] Canal de titular definido.
- [ ] Fluxo de incidente definido.
- [ ] Fluxo de exclusão definido.
- [ ] Fluxo de suporte definido.

---

# 41. Perguntas principais para o advogado

1. Qual é o papel jurídico do Estilo e Gestão em cada tratamento?
2. Quais bases legais devem ser usadas?
3. Preciso de encarregado?
4. Qual processo de direitos dos titulares devo adotar?
5. Quais dados preciso manter após o cancelamento?
6. Quais prazos de retenção devo usar?
7. Quais obrigações do Marco Civil se aplicam?
8. Como tratar registros de acesso?
9. Se um recurso de IA for lançado futuramente, quais avisos e cláusulas adicionais serão necessários?
10. Como tratar transferência internacional?
11. Como regular fotos do Portfólio?
12. Como tratar fotos de menores?
13. Preciso de banner de cookies?
14. Como estruturar exclusão de conta?
15. Como estruturar Termos e Política?
16. Quais regras do CDC se aplicam ao SaaS?
17. Como tratar cancelamento e direito de arrependimento?
18. Como limitar responsabilidade sem criar cláusula abusiva?
19. Qual documentação deverá ser mantida internamente?
20. Existe alguma obrigação jurídica relevante que não foi identificada?

---

# 42. Resultado esperado da revisão

Ao final, deverão existir decisões claras sobre:

- Termos de Uso;
- Política de Privacidade;
- bases legais;
- controlador/operador;
- retenção;
- exclusão;
- direitos dos titulares;
- incidentes;
- fornecedores;
- transferências internacionais;
- cookies;
- Portfólio;
- modelo comercial;
- relação de consumo.

As alterações necessárias deverão ser incorporadas ao sistema e à documentação antes do lançamento comercial definitivo.

---

# 43. Regra final

A revisão jurídica não deverá ocorrer apenas depois de o sistema estar completamente pronto.

O momento adequado é quando:

- escopo está definido;
- dados estão mapeados;
- fornecedores estão escolhidos;
- modelo comercial está suficientemente claro;
- ainda existe tempo para alterar a implementação.

Corrigir uma regra jurídica antes do lançamento custa muito menos do que descobrir depois que o banco, onboarding e contratos foram construídos sobre uma premissa errada.
