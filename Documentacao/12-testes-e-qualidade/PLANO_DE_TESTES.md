**# Plano de Testes — Estilo e Gestão**

**## Objetivo**

Este documento define quais testes deverão ser realizados no **\*\*Estilo e Gestão\*\***, quais ferramentas poderão ser utilizadas e como os resultados deverão ser registrados.

Os testes deverão validar:

\- regras funcionais;

\- regras de negócio;

\- autenticação;

\- autorização;

\- isolamento entre barbearias;

\- segurança;

\- banco de dados;

\- integrações;

\- responsividade;

\- acessibilidade;

\- desempenho;

\- estabilidade;

\- qualidade do código.

Cada execução deverá registrar:

\- o que foi testado;

\- como foi testado;

\- quando foi testado;

\- ferramenta utilizada;

\- resultado esperado;

\- resultado obtido;

\- status;

\- observações;

\- evidências quando aplicável.

Este documento também poderá funcionar como histórico das execuções de teste.

\---

**# 1. Objetivos dos testes**

Os testes deverão verificar principalmente:

\- funcionamento correto das funcionalidades;

\- cumprimento das regras documentadas;

\- integração entre módulos;

\- autenticação e recuperação de acesso;

\- autorização entre *\`BARBEIRO\`* e *\`ADMIN\`*;

\- isolamento entre barbearias;

\- integridade financeira;

\- integridade do estoque;

\- funcionamento das despesas recorrentes;

\- consistência das vendas;

\- consistência das imagens padrão das categorias e imagens personalizadas dos produtos;

\- segurança dos arquivos oficiais e dos uploads por tenant;

\- segurança da Vitrine pública;


\- usabilidade;

\- responsividade;

\- acessibilidade;

\- desempenho;

\- estabilidade;

\- qualidade do código.

\---

**# 2. Ambientes**

Os testes poderão ocorrer nos seguintes ambientes.

**## Local**

Utilizado durante o desenvolvimento.

**## Desenvolvimento/Teste**

Ambiente com banco e configurações próprios para testes.

**## Preview**

Deployment utilizado para validação antes da produção.

**## Produção**

Somente testes seguros, controlados e não destrutivos.

Não executar diretamente em produção:

\- testes destrutivos;

\- testes de carga intensa;

\- testes de estresse;

\- ataques automatizados;

\- exclusões experimentais;

\- manipulação de dados reais sem necessidade.

\---

**# 3. Ferramentas principais**

\| Tipo | Ferramenta principal |

\|---|---|

\| Teste unitário | Vitest |

\| Componentes React | Vitest + React Testing Library |

\| Integração | Vitest + ambiente local do Supabase |

\| Banco/RLS | Supabase CLI + pgTAP |

\| E2E | Playwright |

\| Cross-browser | Playwright |

\| Responsividade automática | Playwright |

\| Usabilidade | Teste manual com barbeiro |

\| Acessibilidade automática | axe-core |

\| Auditoria web | Lighthouse |

\| Qualidade estática | SonarQube Community Build |

\| Segurança dinâmica | OWASP ZAP |

\| Carga e estresse | Grafana k6 |

\---

**# 4. Vitest**

**## Uso**

Será utilizado principalmente para testes rápidos de:

\- funções;

\- cálculos;

\- validações;

\- regras isoladas;

\- utilitários;

\- transformação de dados;

\- regras financeiras;

\- regras de estoque.

**## Exemplos**

\- calcular subtotal;

\- calcular resultado estimado;

\- detectar estoque baixo;

\- normalizar categoria;

\- validar datas;

\- validar períodos;

\- calcular valor da reposição;

\- calcular valor da perda;

\- calcular vencimento em mês menor;

\- validar regras de horário.

\---

**# 5. React Testing Library**

**## Uso**

Será utilizada junto ao Vitest para testar componentes React do ponto de vista do usuário.

Priorizar comportamento visível.

Exemplo:

\`\`\`text

Usuário seleciona Salvar

→ formulário entra em Loading

→ envio ocorre

→ resposta de sucesso é mostrada

\`\`\`

Evitar testes excessivamente dependentes da implementação interna do componente.

**## Exemplos**

\- formulário de serviço;

\- formulário de produto;

\- formulário de despesa;

\- formulário de despesa recorrente;

\- modal de cancelamento;

\- confirmação de Vitrine;

\- seletor de período;

\- estado vazio;

\- Loading;

\- mensagens de erro;

\- estados administrativos.

\---

**# 6. Supabase CLI e pgTAP**

**## Uso**

Utilizar para testes do PostgreSQL e das políticas de RLS.

Testar:

\- estrutura;

\- constraints;

\- enums;

\- funções;

\- relacionamentos;

\- policies;

\- isolamento entre tenants;

\- regras entre *\`BARBEIRO\`* e *\`ADMIN\`*.

**## Estrutura possível**

\`\`\`text

supabase/tests/database/

\`\`\`

Os testes poderão ser executados através do ambiente local do Supabase.

\---

**# 7. Playwright**

**## Uso**

Será a ferramenta principal para testes End-to-End.

Permite testar fluxos completos através do navegador.

**## Navegadores**

Testar pelo menos:

\- Chromium;

\- Firefox;

\- WebKit;

quando compatíveis com o fluxo testado.

\---

**# 8. SonarQube Community Build**

**## Objetivo**

Analisar automaticamente o código em busca de problemas relacionados a:

\- bugs;

\- confiabilidade;

\- segurança;

\- manutenibilidade;

\- duplicação;

\- qualidade estática.

A análise deverá ser executada periodicamente.

\---

**# 9. SonarQube durante o desenvolvimento**

Executar especialmente:

\- após alterações estruturais;

\- antes de releases importantes;

\- antes da publicação inicial.

Problemas identificados deverão ser avaliados antes de serem ignorados.

\---

**# 10. SonarQube não substitui testes**

Análise estática não consegue confirmar sozinha:

\- se uma venda baixou estoque corretamente;

\- se um ADMIN foi autorizado corretamente;

\- se uma recorrência gerou uma única despesa;

\- se duas vendas concorrentes respeitaram o estoque;

\- se a interface é compreensível;

\- se o fluxo completo funciona.

Por isso, complementa os demais testes.

\---

**# 11. OWASP ZAP**

**## Objetivo**

Executar testes dinâmicos de segurança na aplicação web.

Pode auxiliar na identificação de:

\- configurações inseguras;

\- cabeçalhos inadequados;

\- exposição inesperada;

\- determinadas vulnerabilidades web.

Utilizar somente em ambientes autorizados do próprio projeto.

\---

**# 12. Grafana k6**

**## Objetivo**

Realizar testes de:

\- carga;

\- estresse;

\- pico;

\- duração.

Priorizar endpoints que possam receber maior quantidade de requisições.

\---

**# 13. Lighthouse**

**## Objetivo**

Auditar páginas em aspectos como:

\- desempenho;

\- acessibilidade;

\- boas práticas;

\- SEO.

Será especialmente útil para a **\*\*Vitrine Digital pública\*\***.

\---

**# 14. axe-core**

**## Objetivo**

Automatizar parte dos testes de acessibilidade.

Pode detectar problemas como:

\- ausência de labels;

\- ARIA incorreto;

\- problemas de semântica;

\- determinadas falhas de contraste;

\- estruturas inacessíveis.

Testes automáticos não substituem testes manuais.

\---

**# 15. Testes unitários**

**## Objetivo**

Verificar pequenas unidades de lógica isoladamente.

**## Prioridades**

\- cálculos financeiros;

\- cálculo de reposição;

\- cálculo de perda;

\- resultado estimado;

\- estoque mínimo;

\- normalização;

\- datas;

\- recorrências;

\- vencimentos;

\- horários;

\- formatação;

\- transformação de dados.

\---

**# 16. Testes de componentes**

**## Botão**

Verificar:

\- clique;

\- estado desabilitado;

\- Loading;

\- prevenção de clique repetido.

**## Formulário**

Verificar:

\- preenchimento;

\- obrigatoriedade;

\- validação;

\- envio;

\- erro;

\- preservação dos dados após falha recuperável.

**## Modal**

Verificar:

\- abertura;

\- fechamento;

\- cancelar;

\- confirmar;

\- foco;

\- uso por teclado.

\---

**# 17. Testes de integração**

**## Cadastro**

\`\`\`text

Cadastro

\+

Supabase Auth

\+

Perfil

\+

tipo = BARBEIRO

\+

Barbearia

\`\`\`

**## Reposição**

\`\`\`text

Reposição

\+

Produto

\+

Movimentação

≠

Despesa automática

\`\`\`

Uma despesa de compra de estoque, quando desejada, é cadastrada manualmente em fluxo separado e pode possuir vínculo opcional com a movimentação.

**## Venda**

\`\`\`text

Venda

\+

Itens

\+

Estoque

\+

Movimentações

\`\`\`

**## Despesa recorrente**

\`\`\`text

Recorrência

\+

Ocorrência

\+

Marcar como paga

\+

Despesa efetiva

\`\`\`

**## Login administrativo**

\`\`\`text

Supabase Auth

\+

Perfil ADMIN

\+

Autorização

\+

Painel Administrativo

\`\`\`

\---

**# 18. Testes do banco**

Verificar:

\- migrations;

\- tabelas;

\- constraints;

\- relacionamentos;

\- nulabilidade;

\- enums;

\- índices;

\- funções SQL;

\- integridade referencial;

\- consistência histórica.

\---

**# 19. Testes de tipos de usuário**

Criar pelo menos:

\`\`\`text

Usuário A

tipo = BARBEIRO

Barbearia A

\`\`\`

e:

\`\`\`text

Usuário ADMIN

tipo = ADMIN

barbearia\_id = null

\`\`\`

Verificar que:

\- cadastro público cria *\`BARBEIRO\`*;

\- *\`BARBEIRO\`* possui barbearia;

\- *\`ADMIN\`* não precisa possuir barbearia;

\- usuário comum não altera o próprio tipo;

\- frontend não consegue criar *\`ADMIN\`*;

\- backend rejeita promoção indevida.

\---

**# 20. Teste de tentativa de criação como ADMIN**

Cenário:

frontend manipulado envia:

\`\`\`json

{

  "tipo": "ADMIN"

}

\`\`\`

durante o cadastro público.

Resultado esperado:

\- conta não é criada como ADMIN;

\- novo perfil continua *\`BARBEIRO\`*;

\- nenhuma permissão administrativa é concedida.

\---

**# 21. Teste de alteração do próprio tipo**

Cenário:

usuário *\`BARBEIRO\`* tenta atualizar:

\`\`\`text

tipo = ADMIN

\`\`\`

Resultado esperado:

\- alteração rejeitada;

\- perfil continua *\`BARBEIRO\`*;

\- nenhuma rota administrativa é liberada.

\---

**# 22. Teste de Login por tipo**

**## BARBEIRO com Onboarding concluído**

Resultado:

\`\`\`text

Login

→ Dashboard

\`\`\`

**## BARBEIRO com Onboarding incompleto**

Resultado:

\`\`\`text

Login

→ etapa pendente do Onboarding

\`\`\`

**## ADMIN**

Resultado:

\`\`\`text

Login

→ Painel Administrativo

\`\`\`

Não deve existir necessidade de selecionar o tipo antes do Login.

\---

**# 23. Testes de rotas administrativas**

Cenário:

*\`BARBEIRO\`* tenta acessar diretamente:

\`\`\`text

/admin

\`\`\`

Resultado esperado:

\- acesso negado;

\- dados administrativos não são retornados.

Cenário:

*\`ADMIN\`* autenticado acessa:

\`\`\`text

/admin

\`\`\`

Resultado esperado:

\- acesso permitido;

\- somente funcionalidades administrativas autorizadas ficam disponíveis.

\---

**# 24. Testes de permissões do ADMIN**

Verificar que ADMIN consegue, quando permitido:

\- localizar barbearia;

\- consultar dados necessários ao suporte;

\- consultar plano, validade, pagamentos e histórico administrativo permitido;

\- confirmar pagamento manual;

\- conceder cortesia;

\- aplicar upgrade ou agendar downgrade;

\- cancelar renovação;

\- suspender e reativar a conta;


\---

**# 25. Testes de limitações do ADMIN**

Verificar que o ADMIN não recebe automaticamente acesso para:

\- realizar venda;

\- alterar estoque como barbeiro;

\- criar despesa em nome do barbeiro;

\- alterar despesas da barbearia;

\- consultar senhas;

\- consultar segredos;

\- impersonar usuário;

\- acessar dados internos desnecessários.

\---

**# 26. Testes de RLS**

Criar pelo menos dois tenants fictícios.

Exemplo:

\`\`\`text

Usuário A

→ Barbearia A

Usuário B

→ Barbearia B

\`\`\`

Testar que A não consegue:

\- listar dados de B;

\- inserir dados para B;

\- editar dados de B;

\- excluir dados de B.

Repetir os cenários críticos para:

\- serviços;

\- produtos;

\- categorias;

\- imagens/referências associadas às categorias quando aplicável;

\- produtos e suas referências de imagem;

\- formas de pagamento aceitas pela barbearia;

\- vendas;

\- despesas;

\- despesas recorrentes;

\- movimentações;

\- Portfólio;

\- horários.

\---

**# 27. ADMIN e RLS**

Testar que possuir:

\`\`\`text

tipo = ADMIN

\`\`\`

não significa automaticamente receber acesso irrestrito a todas as tabelas privadas.

As operações administrativas deverão utilizar apenas o acesso necessário.

\---

**# 28. Testes de Auth**

Verificar:

\- criar conta;

\- confirmação de e-mail quando habilitada;

\- Login;

\- senha inválida;

\- recuperação;

\- código;

\- redefinição;

\- Logout;

\- sessão expirada;

\- conta suspensa com redirecionamento para a página dedicada;

\- redirecionamento conforme tipo.

\---

**# 29. Criação da conta**

Testar:

\- nome opcional;

\- e-mail válido;

\- e-mail inválido;

\- senha com menos de 8 caracteres;

\- senha sem letra;

\- senha sem número;

\- confirmação diferente;

\- e-mail já cadastrado;

\- envio duplicado;

\- criação de perfil;

\- criação de barbearia;

\- *\`tipo = BARBEIRO\`*.

Verificar que uma mesma operação não cria duas barbearias para o mesmo usuário.

\---

**# 30. Confirmação de e-mail**

Quando habilitada, testar:

\- código correto;

\- código incorreto;

\- código incompleto;

\- colagem de 6 dígitos;

\- apenas números;

\- avanço automático;

\- retorno ao apagar;

\- reenvio;

\- intervalo de reenvio definido para esse fluxo.

\---

**# 31. Recuperação de senha**

Testar:

\- e-mail existente;

\- e-mail inexistente;

\- mensagem neutra;

\- código correto;

\- código errado;

\- código expirado;

\- código anterior após reenvio;

\- somente código mais recente válido;

\- nova senha;

\- confirmação de senha;

\- Login após redefinição.

A resposta inicial não deverá revelar se o e-mail está cadastrado.

\---

**# 32. Validade do código de recuperação**

Regra atual:

\`\`\`text

15 minutos

\`\`\`

Testar:

\- dentro da validade;

\- exatamente próximo ao limite;

\- após a validade;

\- novo código reiniciando a validade;

\- código anterior invalidado imediatamente.

\---

**# 33. Reenvio do código de recuperação**

Após reenviar:

\`\`\`text

1 minuto de bloqueio

\`\`\`

Verificar:

\- botão indisponível;

\- contagem regressiva;

\- liberação após o intervalo;

\- código anterior inválido.

\---

**# 34. Tentativas de código**

A regra funcional prevê limite de tentativas para o código de recuperação.

Testar:

\- tentativas válidas;

\- código incorreto;

\- atingir o limite;

\- bloqueio daquele código;

\- solicitação de novo código.

\---

**# 35. Testes de Onboarding**

Verificar:

\- início;

\- seis etapas;

\- salvamento individual de cada etapa;

\- avanço somente após sucesso do salvamento;

\- saída no meio;

\- retorno;

\- retomada da etapa pendente;

\- preservação das etapas já concluídas;

\- conclusão;

\- redirecionamento para Dashboard somente após conclusão.

Etapas oficiais:

\`\`\`text

1\. Dados da barbearia

2\. Endereço

3\. Horários de funcionamento

4\. Serviços

5\. Produtos e formas de pagamento

6\. Aparência e conclusão

\`\`\`

Também testar:

\- salvar a Etapa 1 mesmo antes de o endereço existir;

\- interromper o fluxo em cada uma das seis etapas e autenticar novamente;

\- garantir que *\`onboarding_etapa\`* represente a etapa correta a ser retomada;

\- impedir que *\`onboarding_concluido\`* seja marcado como verdadeiro antes da conclusão válida das etapas obrigatórias;


\---

**# 36. Dados da barbearia**

Testar:

\- nome obrigatório;

\- nome profissional opcional;

\- WhatsApp válido;

\- WhatsApp sem DDD;

\- Instagram opcional;

\- logo opcional;

\- ausência de logo sem bloquear a etapa;

\- atendimento a domicílio Sim/Não;

\- persistência do atendimento a domicílio após avançar e retornar à etapa.

\---

**# 37. Endereço**

Testar:

\- CEP válido;

\- CEP inválido;

\- ViaCEP funcionando;

\- ViaCEP indisponível;

\- preenchimento manual;

\- endereço com número;

\- endereço sem número.

**## Com número**

Esperado:

\`\`\`text

tem\_numero = true

numero != null

\`\`\`

**## Sem número**

Esperado:

\`\`\`text

tem\_numero = false

numero = null

\`\`\`

Não armazenar:

\`\`\`text

S/N

\`\`\`

no campo de número.

\---

**# 38. ViaCEP**

Testar:

\- CEP encontrado;

\- CEP inexistente;

\- formato inválido;

\- serviço indisponível;

\- preenchimento automático;

\- edição manual posterior.

Falha do ViaCEP não pode impedir definitivamente o cadastro.

\---

**# 39. Horários de funcionamento**

Testar:

\- dia fechado;

\- dia aberto;

\- primeiro intervalo válido;

\- segundo intervalo opcional;

\- horários iguais;

\- fechamento antes da abertura;

\- intervalos sobrepostos;

\- dois intervalos válidos.

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

**# 40. Aparência e conclusão do Onboarding**

Testar as três opções de aparência:

\`\`\`text

CLARO

ESCURO

SISTEMA

\`\`\`

Verificar:

\- seleção;

\- persistência em *\`perfis.tema\`*;

\- aplicação imediata quando apropriado;

\- aplicação após atualizar a página;

\- aplicação após novo Login;

\- comportamento *\`SISTEMA\`*;

\- troca de preferência do dispositivo quando aplicável;

\- preferência associada ao usuário, e não à configuração pública da barbearia;

\- escolha do tema privado sem alterar automaticamente a aparência pública da Vitrine.

Na revisão final do Onboarding, verificar a apresentação das principais configurações já salvas, incluindo quando aplicável:

\- nome da barbearia;

\- endereço;

\- horários;

\- quantidade de serviços cadastrados;

\- categorias de produtos selecionadas;

\- formas de pagamento aceitas;

\- tema escolhido.

Ao selecionar **\*\*Concluir configuração\*\***:

\- não solicitar novamente dados já salvos;

\- marcar o Onboarding como concluído somente após sucesso;

\- preservar a preferência de tema;

\- redirecionar para o Dashboard.

\---

**# 41. Produtos e formas de pagamento no Onboarding**

Testar pergunta:

*> A barbearia vende produtos ou bebidas?*

**## Não**

Resultado:

\- não exigir categorias de produto;

\- não exigir cadastro de produtos;

\- permitir continuar para a seleção das formas de pagamento.

**## Sim**

Resultado:

- permitir selecionar uma ou mais categorias sugeridas;
- permitir criar categoria personalizada;
- criar somente as categorias realmente selecionadas/utilizadas;
- exigir pelo menos 1 categoria;
- exigir pelo menos 1 produto cadastrado antes de concluir a etapa;
- não exigir configuração de estoque durante o Onboarding.


Categorias sugeridas podem incluir:

\`\`\`text

Bebida
Pomada
Shampoo
Cera
Óleo/Balm para barba
Acessórios
Outros

\`\`\`


**## Cadastro dos produtos iniciais**

Para cada produto, testar:

- categoria obrigatória;
- nome obrigatório;
- preço de custo obrigatório;
- preço de custo igual a `0` permitido;
- preço de custo negativo bloqueado;
- preço de venda obrigatório;
- preço de venda maior que `0`;
- preço de venda igual a `0` bloqueado;
- preço de venda negativo bloqueado;
- imagem própria opcional;
- utilização da imagem padrão da categoria quando não houver imagem própria;
- imagem própria do produto sem alterar a imagem padrão da categoria;
- produto pertencendo somente a categoria da própria barbearia;
- estoque inicial igual a `0`.

Verificar que o Onboarding não solicite:

- estoque atual;
- estoque mínimo;
- reposição;
- ajuste;
- perda;
- movimentação de estoque.

Se a barbearia informou que vende produtos ou bebidas:

- impedir avanço sem nenhum produto cadastrado;
- permitir avanço após existir pelo menos 1 produto válido.


**## Formas de pagamento aceitas**

Testar seleção de:

\`\`\`text

PIX
DINHEIRO
DEBITO
CREDITO
OUTRO

\`\`\`

Verificar:

\- persistência das formas selecionadas;

\- possibilidade de selecionar várias formas;

\- impedir duplicidade da mesma forma para a mesma barbearia;

\- isolamento por *\`barbearia_id\`*;

\- alteração posterior nas Configurações da Barbearia;

\- formas configuradas disponíveis como opções preferenciais no PDV;

\- formas configuradas disponíveis para exposição pública na Vitrine;

\- impedir avanço quando nenhuma forma de pagamento estiver selecionada;

\- permitir avanço quando existir pelo menos uma forma de pagamento selecionada;


A configuração de formas aceitas deve permanecer diferente de:

\`\`\`text

vendas.forma_pagamento

\`\`\`

que registra a forma utilizada em uma venda específica.

\---

**# 42. Testes de serviços**

No Onboarding, verificar:

\- cadastro dos serviços iniciais;

\- nome obrigatório;

\- descrição opcional;

\- preço obrigatório;

\- custo estimado de insumos opcional;

\- status ativo com padrão correspondente ao fluxo;

\- visibilidade na Vitrine com padrão correspondente ao fluxo;

\- serviços salvos disponíveis posteriormente no PDV conforme status.

Nas telas gerais de Serviços, verificar:

\- cadastrar;

\- editar;

\- preço;

\- custo estimado opcional;

\- ativar;

\- inativar;

\- visibilidade pública;

\- uso no PDV.

\---

**# 43. Serviço ativo e inativo**

Serviço ativo:

\- pode aparecer no PDV;

\- pode aparecer na Vitrine se também estiver público.

Serviço inativo:

\- não aparece em novas vendas;

\- não aparece na Vitrine;

\- permanece no histórico.

\---

**# 44. Serviço sem quantidade**

No PDV:

\- adicionar serviço uma vez;

\- tentar adicionar novamente.

Resultado esperado:

\- não criar segunda unidade;

\- não permitir quantidade maior que 1.

\---

**# 45. Histórico de serviço**

Cenário:

1\. vender serviço por R$ 40;

2\. alterar preço para R$ 50;

3\. abrir venda anterior.

Resultado esperado:

\`\`\`text

Venda antiga = R$ 40

\`\`\`

\---

**# 46. Testes de categorias de produtos**

Testar:

\- categoria sugerida;

\- categoria personalizada;

\- nome vazio;

\- duplicidade;

\- diferenças de maiúsculas/minúsculas;

\- espaços externos;

\- imagem padrão das categorias sugeridas;

\- categoria personalizada iniciando sem imagem padrão.

Devem ser consideradas equivalentes:

\`\`\`text

Bebida

bebida

 BEBIDA 

\`\`\`

**## Categoria sugerida com imagem padrão**

Criar ou selecionar uma categoria sugerida que possua imagem padrão oficial.

Exemplo:

\`\`\`text

Categoria:
Pomada

imagem_padrao_path:
sistema/categorias/pomada.webp

\`\`\`

Resultado esperado:

\- categoria criada corretamente para a barbearia;

\- referência da imagem padrão associada;

\- arquivo padrão não duplicado fisicamente por tenant;

\- barbeiro não consegue substituir ou excluir o arquivo oficial do sistema.

**## Categoria personalizada**

Criar categoria:

\`\`\`text

Perfumes

\`\`\`

Resultado esperado:

\`\`\`text

imagem_padrao_path = null

\`\`\`

Não atribuir imagem padrão automática.

**## Reutilização da imagem oficial**

Criar a mesma categoria sugerida em duas barbearias distintas.

Resultado esperado:

\- cada barbearia possui seu próprio registro de categoria;

\- ambas podem apontar para o mesmo recurso oficial do sistema;

\- não criar uma cópia física da mesma imagem para cada barbearia.

\---

**# 47. Testes de produtos**

Testar:

\- cadastrar;

\- editar;

\- inativar;

\- preço;

\- custo;

\- estoque inicial;

\- estoque mínimo;

\- categoria;

\- visibilidade na Vitrine;

\- imagem personalizada;

\- uso da imagem padrão da categoria;

\- remoção da imagem personalizada;

\- escolha entre voltar à imagem padrão ou ficar sem imagem;

\- troca de categoria;

\- produto sem imagem efetiva.

**## Produto com imagem personalizada**

Cenário:

\`\`\`text

categoria = Pomada

categoria possui imagem padrão

produto.imagem_path = imagem personalizada

usar_imagem_categoria = true

\`\`\`

Resultado esperado:

\- exibir imagem personalizada;

\- não exibir a imagem padrão enquanto a personalizada existir.

**## Produto sem imagem personalizada usando fallback**

Cenário:

\`\`\`text

imagem_path = null

usar_imagem_categoria = true

categoria.imagem_padrao_path != null

\`\`\`

Resultado esperado:

\- exibir imagem padrão da categoria.

**## Produto sem imagem personalizada e sem fallback**

Cenário:

\`\`\`text

imagem_path = null

usar_imagem_categoria = false

\`\`\`

Resultado esperado:

\- não utilizar imagem padrão da categoria;

\- utilizar estado sem imagem ou placeholder definido pela interface.

**## Categoria sem imagem padrão**

Cenário:

\`\`\`text

produto.imagem_path = null

produto.usar_imagem_categoria = true

categoria.imagem_padrao_path = null

\`\`\`

Resultado esperado:

\- produto permanece sem imagem efetiva;

\- interface utiliza placeholder neutro quando previsto.

**## Remover imagem e voltar para a padrão**

Cenário:

1\. produto possui imagem personalizada;

2\. categoria possui imagem padrão;

3\. usuário seleciona **Remover imagem**;

4\. escolhe **Usar imagem padrão da categoria**.

Resultado esperado:

\`\`\`text

imagem_path = null

usar_imagem_categoria = true

\`\`\`

e:

\- imagem padrão passa a ser exibida.

**## Remover imagem e ficar sem**

Cenário:

1\. produto possui imagem personalizada;

2\. categoria possui imagem padrão;

3\. usuário seleciona **Remover imagem**;

4\. escolhe **Ficar sem imagem**.

Resultado esperado:

\`\`\`text

imagem_path = null

usar_imagem_categoria = false

\`\`\`

e:

\- imagem padrão não é exibida.

**## Trocar categoria com fallback ativo**

Cenário:

\`\`\`text

produto sem imagem personalizada

usar_imagem_categoria = true

categoria atual = Pomada

\`\`\`

Alterar para:

\`\`\`text

Shampoo

\`\`\`

Resultado esperado:

\- imagem efetiva muda da imagem padrão de Pomada para a imagem padrão de Shampoo.

**## Trocar categoria com imagem personalizada**

Cenário:

\`\`\`text

produto possui imagem personalizada

categoria atual = Pomada

\`\`\`

Alterar para:

\`\`\`text

Shampoo

\`\`\`

Resultado esperado:

\- imagem personalizada continua sendo utilizada;

\- troca da categoria não substitui automaticamente a imagem do produto.

**## Upload de imagem**

Testar:

\- JPG/JPEG;

\- PNG;

\- WebP;

\- arquivo dentro do limite;

\- arquivo acima do limite;

\- preview;

\- sucesso no upload;

\- falha no upload;

\- referência salva somente após upload válido;

\- ausência de Base64 como persistência definitiva.

**## Troca de imagem**

Testar:

\- produto com imagem existente;

\- upload de nova imagem;

\- atualização da referência somente após sucesso;

\- arquivo anterior tratado corretamente após confirmação;

\- falha durante a substituição sem perder a imagem anterior válida.

\---

**# 48. Produto de outro tenant**

Tentar cadastrar ou editar produto usando categoria pertencente a outra barbearia.

Resultado esperado:

\- operação rejeitada.

\---

**# 49. Estoque mínimo**

Cenários:

\`\`\`text

estoque atual > mínimo

\`\`\`

Resultado:

\- sem alerta.

\`\`\`text

estoque atual = mínimo

\`\`\`

Resultado:

\- estoque baixo.

\`\`\`text

estoque atual < mínimo

\`\`\`

Resultado:

\- estoque baixo.

\`\`\`text

estoque mínimo = null

\`\`\`

Resultado:

\- não gerar alerta mínimo.

\---

**# 49.1 Testes de Storage e imagens**

Verificar a separação entre:

\`\`\`text

arquivos oficiais do sistema

e

arquivos personalizados das barbearias

\`\`\`

**## Arquivos oficiais**

Exemplos:

\`\`\`text

sistema/categorias/bebida.webp

sistema/categorias/pomada.webp

sistema/categorias/outros.webp

\`\`\`

Testar que:

\- podem ser lidos quando necessários pela aplicação;

\- não podem ser alterados por um BARBEIRO comum;

\- não podem ser excluídos por um BARBEIRO comum;

\- não dependem de uma barbearia específica.

**## Arquivos do tenant**

Exemplo:

\`\`\`text

barbearias/{barbeariaId}/produtos/

\`\`\`

Testar que:

\- Barbearia A consegue utilizar seus próprios arquivos;

\- Barbearia A não consegue substituir arquivos da Barbearia B;

\- Barbearia A não consegue excluir arquivos da Barbearia B;

\- referências inválidas ou de outro tenant são rejeitadas quando aplicável.

**## Remoção da referência**

Ao remover uma imagem personalizada do produto:

\- remover a referência do produto conforme o fluxo;

\- preservar a imagem padrão da categoria;

\- garantir que a imagem oficial compartilhada nunca seja apagada junto com o produto.

**## Falha no upload**

Simular falha antes de salvar a referência.

Resultado esperado:

\- produto não aponta para arquivo inexistente;

\- estado anterior permanece válido;

\- interface informa erro recuperável.

\---

**# 50. Testes do PDV**

O PDV possui prioridade crítica.

Testar:

\- comanda vazia;

\- adicionar serviço;

\- evitar serviço duplicado;

\- adicionar produto;

\- alterar quantidade de produto;

\- impedir quantidade superior ao estoque;

\- remover item;

\- subtotal;

\- total visual;

\- formas de pagamento aceitas configuradas pela barbearia como opções preferenciais;

\- forma de pagamento da venda;

\- venda sem forma de pagamento quando o fluxo permitir;

\- observação;

\- finalização;

\- sucesso;

\- falha;

\- envio duplicado.

\---

**# 51. Valor calculado pelo servidor**

Criar cenário em que o navegador envie valores manipulados.

Exemplo:

\`\`\`text

Preço real = R$ 40

Valor enviado = R$ 1

\`\`\`

Resultado esperado:

\`\`\`text

Servidor ignora R$ 1

e utiliza R$ 40

\`\`\`

Fazer o mesmo com:

\- custo;

\- subtotal;

\- total.

\---

**# 52. Estoque insuficiente**

Cenário:

\`\`\`text

Estoque = 2

Venda solicita = 3

\`\`\`

Resultado esperado:

\- venda não concluída;

\- estoque permanece 2;

\- nenhum registro parcial criado.

\---

**# 53. Concorrência de estoque**

Cenário:

\`\`\`text

Estoque = 1

\`\`\`

Enviar duas vendas concorrentes.

Resultado esperado:

\- somente uma conclui;

\- outra falha corretamente;

\- estoque nunca fica negativo;

\- banco permanece consistente.

\---

**# 54. Venda atômica**

Simular falha durante o processo.

Resultado esperado:

\- venda não fica criada parcialmente;

\- itens não ficam órfãos;

\- estoque não fica alterado isoladamente;

\- movimentações não ficam inconsistentes.

\---

**# 55. Venda concluída**

Após sucesso, verificar:

\- venda criada;

\- itens criados;

\- preço utilizado preservado;

\- custo utilizado preservado;

\- estoque reduzido;

\- movimentação criada;

\- Dashboard atualizado;

\- relatórios atualizados.

\---

**# 56. Snapshot da venda**

Cenário:

1\. produto custa R$ 20;

2\. produto é vendido;

3\. custo cadastrado posteriormente muda para R$ 25;

4\. abrir venda antiga.

Resultado esperado:

\- venda antiga continua mostrando o custo de R$ 20 utilizado no momento da venda.

\---

**# 57. Cancelamento**

Testar:

1\. criar venda;

2\. confirmar baixa do estoque;

3\. cancelar;

4\. conferir status;

5\. conferir estoque;

6\. conferir reversão;

7\. conferir Dashboard;

8\. conferir relatório.

Resultado esperado:

\- venda permanece no histórico;

\- status vira Cancelada;

\- produtos retornam ao estoque;

\- movimentação de reversão é criada;

\- venda deixa de participar dos totais válidos.

\---

**# 58. Cancelamento duplicado**

Tentar cancelar novamente uma venda já cancelada.

Resultado esperado:

\- operação rejeitada;

\- estoque não aumenta uma segunda vez;

\- não criar segunda reversão.

\---

**# 59. Testes de reposição de estoque**

Testar:

\- produto válido;

\- quantidade mínima 1;

\- quantidade zero;

\- custo válido;

\- cálculo do valor total;

\- atualização do estoque;

\- atualização do custo atual;

\- movimentação;

\- ausência de saída financeira automática.

\---

**# 60. Reposição e Financeiro**

Exemplo:

\`\`\`text

Quantidade = 10

Custo unitário = R$ 15

\`\`\`

Esperado:

\`\`\`text

Valor total = R$ 150

\`\`\`

Após confirmar:

\- estoque aumenta 10;

\- movimento *\`REPOSICAO\`* é criado;

\- nenhuma despesa de R$ 150 é criada automaticamente.

Se o barbeiro quiser registrar a compra no Financeiro, deverá cadastrar uma despesa manual de categoria Estoque, podendo relacioná-la opcionalmente à movimentação.

\---

**# 61. Financeiro separado da reposição**

Validar que o fluxo não oferece:

\`\`\`text

Registrar no Financeiro?

\`\`\`

A reposição termina sem criar despesa. Um atalho para cadastrar uma despesa manual poderá existir futuramente, desde que seja explícito e não automático.

\---

**# 62. Falha durante reposição**

Simular erro entre:

\`\`\`text

atualizar estoque

\`\`\`

e:

\`\`\`text

registrar movimentação de estoque

\`\`\`

Resultado esperado:

\- operação não fica pela metade;

\- saldo e movimentação permanecem consistentes;

\- Financeiro permanece inalterado.

\---

**# 63. Duplicação de reposição**

Simular duplo clique ou repetição da mesma requisição.

Resultado esperado:

\- não aumentar o estoque duas vezes por um único envio lógico.

\- não criar duas movimentações para um único envio lógico;

\- não criar despesa automática em nenhuma das tentativas.

\---

**# 64. Ajuste de estoque**

Testar:

\- saldo correto maior;

\- saldo correto menor;

\- saldo zero;

\- motivo obrigatório;

\- diferença calculada;

\- histórico.

\---

**# 65. Perda de estoque**

Testar:

\- produto;

\- quantidade válida;

\- quantidade zero;

\- quantidade maior que estoque;

\- motivo;

\- data automática;

\- redução do estoque;

\- movimentação *\`PERDA\`*.

\---

**# 66. Valor da perda**

Exemplo:

\`\`\`text

Custo atual = R$ 20

Quantidade perdida = 2

\`\`\`

Resultado esperado:

\`\`\`text

Valor da perda = R$ 40

\`\`\`

O custo deverá ser preservado historicamente.

\---

**# 67. Perda não gera nova saída**

Após perda:

\- estoque reduz;

\- resultado estimado é afetado;

\- nenhuma nova despesa de R$ 40 deve ser criada.

Isso evita duplicar a saída que já ocorreu na compra do produto.

\---

**# 68. Histórico de estoque**

Verificar registros de:

\`\`\`text

REPOSICAO

VENDA

AJUSTE

PERDA

REVERSAO\_VENDA

\`\`\`

Conferir:

\- data;

\- produto;

\- quantidade;

\- saldo anterior;

\- saldo posterior;

\- motivo;

\- venda associada quando aplicável.

\---

**# 69. Testes de despesas avulsas**

Testar:

\- nome;

\- descrição opcional;

\- categoria;

\- valor;

\- data atual;

\- data passada;

\- data futura;

\- editar;

\- excluir.

Resultado esperado para data futura:

\- rejeitar.

\---

**# 70. Categorias de despesas**

Testar somente categorias previstas:

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

Não permitir criação arbitrária de novas categorias no fluxo atual.

\---

**# 71. Categoria Outros**

Exemplo:

\`\`\`text

Nome: Compra de lâmpadas

Categoria: Outros

\`\`\`

Não exigir campo adicional apenas para descrever a categoria.

\---

**# 72. Reposição de estoque e despesa manual independente**

Testar uma reposição de estoque com e sem despesa manual relacionada.

Resultados esperados:

\- a reposição altera somente o estoque e a movimentação correspondente;

\- nenhuma despesa é criada automaticamente;

\- o barbeiro pode cadastrar separadamente uma despesa manual e, de forma opcional, relacioná-la à movimentação;

\- editar ou excluir a despesa manual não altera a quantidade em estoque;

\- editar a movimentação não modifica automaticamente a despesa;

\- repetir a requisição não cria movimentações ou despesas duplicadas.

\---

**# 73. Testes de despesas recorrentes**

Testar:

\- criação;

\- nome;

\- categoria;

\- valor previsto;

\- frequência mensal;

\- dia de vencimento;

\- descrição;

\- status ativa;

\- desativação;

\- reativação.

\---

**# 74. Dia do vencimento**

Testar valores:

\`\`\`text

1

28

29

30

31

\`\`\`

Também testar:

\`\`\`text

0

32

\`\`\`

que devem ser rejeitados.

\---

**# 75. Mês menor que o vencimento**

Configuração:

\`\`\`text

Dia = 31

\`\`\`

Esperado:

\`\`\`text

Janeiro → 31

Fevereiro → 28 ou 29

Abril → 30

\`\`\`

\---

**# 76. Geração de ocorrência**

Para uma recorrência ativa:

\- gerar uma ocorrência para o período;

\- evitar duplicidade da mesma competência.

Exemplo:

\`\`\`text

Internet

Outubro/2026

\`\`\`

não pode gerar duas ocorrências iguais acidentalmente.

\---

**# 77. Ocorrência pendente**

Status:

\`\`\`text

PENDENTE

\`\`\`

Resultado esperado:

\- não entra nas saídas efetivas;

\- aparece como previsão;

\- pode ser marcada como paga;

\- pode ser ignorada.

\---

**# 78. Marcar como paga**

Testar:

\- valor previsto mantido;

\- valor pago igual ao previsto;

\- valor pago diferente;

\- data de pagamento atual;

\- data passada;

\- data futura;

\- criação da despesa;

\- status *\`PAGA\`*.

\---

**# 79. Pagamento duplicado**

Tentar marcar novamente uma ocorrência já paga.

Resultado esperado:

\- não criar segunda despesa;

\- não duplicar saída financeira;

\- status permanece consistente.

\---

**# 80. Ignorar neste mês**

Ao ignorar:

\- ocorrência vira *\`IGNORADA\`*;

\- nenhuma despesa é criada;

\- recorrência continua ativa;

\- mês seguinte continua normalmente.

\---

**# 81. Alterar recorrência**

Cenário:

1\. recorrência possui valor previsto de R$ 100;

2\. ocorrência de outubro é criada;

3\. alterar valor futuro para R$ 120.

Resultado esperado:

\`\`\`text

Outubro continua = R$ 100

Próximas ocorrências = R$ 120

\`\`\`

\---

**# 82. Desativar recorrência**

Após desativar:

\- não gerar novas ocorrências;

\- preservar histórico;

\- manter ocorrências anteriores;

\- permitir reativação.

\---

**# 83. Testes financeiros**

Verificar separadamente:

\- faturamento;

\- entradas;

\- saídas;

\- custos;

\- perdas;

\- despesas;

\- resultado estimado;

\- vendas canceladas;

\- reposição de estoque;

\- despesas recorrentes pagas;

\- ocorrências pendentes.

\---

**# 84. Dupla contagem de estoque**

Criar cenário com:

\- compra de estoque;

\- venda do produto;

\- custo do produto no momento da venda.

Verificar que a mesma compra não seja descontada duas vezes dentro do mesmo indicador de resultado.

\---

**# 85. Fluxo de caixa**

Validar:

\`\`\`text

Entradas efetivas

\-

Saídas efetivas

\`\`\`

Uma ocorrência recorrente *\`PENDENTE\`* não deve ser tratada como saída.

Uma reposição concluída deve ser tratada como saída.

Uma perda não cria nova saída.

\---

**# 86. Resultado estimado**

Validar que:

\- custos diretos de vendas sejam considerados conforme regra;

\- perdas sejam consideradas;

\- vendas canceladas sejam excluídas;

\- compra de estoque não seja duplicada no mesmo cálculo.

Não apresentar automaticamente o indicador como lucro líquido contábil.

\---

**# 87. Testes do Dashboard**

Testar filtros:

\`\`\`text

Hoje

Semana

Mês

Ano

Personalizado

\`\`\`

Verificar atualização de:

\- Faturamento;

\- Entradas;

\- Saídas;

\- Resultado estimado;

\- serviços;

\- bebidas;

\- outros produtos;

\- estoque baixo;

\- gráficos.

\---

**# 88. Período personalizado**

Testar:

\- data inicial válida;

\- data final válida;

\- data final anterior;

\- data futura;

\- campos vazios.

Resultado esperado:

\- impedir período inválido.

\---

**# 89. Gráfico principal**

Testar seleção entre:

\`\`\`text

Faturamento

Entradas

Saídas

Resultado estimado

\`\`\`

Verificar:

\- valores corretos;

\- período correto;

\- interação por mouse;

\- interação por toque;

\- ausência de dependência exclusiva de hover.

\---

**# 90. Gráficos de detalhamento**

Testar:

\`\`\`text

Faturamento por origem

Entradas por forma de pagamento

Saídas por categoria

Resultado estimado por origem

\`\`\`

Verificar origem:

\`\`\`text

Serviços

Bebidas

Outros produtos

\`\`\`

\---

**# 91. Dashboard sem dados**

Resultado esperado:

*> Nenhuma movimentação encontrada neste período.*

ou mensagem equivalente definida no fluxo.

Não apresentar dados fictícios como se fossem reais.

\---

**# 92. Testes de relatórios**

Testar períodos:

\`\`\`text

Diário

Semanal

Mensal

Anual

Personalizado

\`\`\`

Verificar:

\- faturamento;

\- entradas;

\- saídas;

\- serviços;

\- bebidas;

\- outros produtos;

\- despesas por categoria;

\- resultado estimado.

\---

**# 93. Exportação PDF**

Testar geração do PDF com:

\- nome da barbearia;

\- período;

\- data de geração;

\- faturamento;

\- entradas;

\- saídas;

\- resultado estimado;

\- quantidade de serviços;

\- bebidas vendidas;

\- outros produtos vendidos;

\- despesas por categoria;

\- resultados por origem.

Verificar que:

\- utiliza o período selecionado;

\- valores são iguais aos da aplicação;

\- informações não ficam cortadas;

\- layout permanece legível;

\- venda individual não é despejada desnecessariamente no relatório resumido.

\---

**# 94. Exportação PNG**

Testar:

\- geração;

\- legibilidade;

\- textos;

\- valores;

\- indicadores;

\- gráficos;

\- período;

\- nome da barbearia.

Verificar que a imagem permaneça adequada para compartilhamento e leitura.

\---

**# 95. Consistência entre relatório e exportação**

Para o mesmo filtro:

\`\`\`text

Tela

PDF

PNG

\`\`\`

devem utilizar os mesmos dados-base.

Não pode ocorrer, por exemplo:

\`\`\`text

Tela = R$ 1.000

PDF = R$ 950

\`\`\`

sem motivo funcional documentado.

\---

**# 96. Testes da Vitrine administrativa**

**## Imagens de produtos na Vitrine**

Testar que o contrato público utiliza somente a imagem efetiva necessária para apresentação.

Cenários:

\`\`\`text

1. Produto com imagem personalizada
   → Vitrine recebe/exibe personalizada

2. Produto sem personalizada
   + fallback habilitado
   + categoria com padrão
   → Vitrine recebe/exibe imagem padrão

3. Produto sem personalizada
   + fallback desabilitado
   → Vitrine recebe/exibe sem imagem

4. Categoria personalizada sem padrão
   + produto sem personalizada
   → Vitrine recebe/exibe sem imagem
\`\`\`

A resposta pública não deverá expor desnecessariamente:

\- `imagem_path`;

\- `imagem_padrao_path`;

\- `usar_imagem_categoria`;

\- caminhos privados ou internos do Storage.

A aplicação poderá retornar apenas a URL ou referência pública já resolvida para apresentação.

Testar:

\- configuração;

\- prévia;

\- Gerar URL;

\- publicação;

\- despublicação;

\- republicação;

\- copiar URL;

\- visualizar Vitrine.

\---

**# 97. Gerar URL**

Antes da geração, testar cenário com informações opcionais ausentes.

Exemplo:

\`\`\`text

Instagram ausente

Logo ausente

Portfólio vazio

\`\`\`

Resultado esperado:

\- mostrar somente informações ausentes;

\- informar que não serão exibidas;

\- oferecer:

  - Voltar e preencher;

  - Continuar.

\---

**# 98. Continuar com informações ausentes**

Ao selecionar:

\`\`\`text

Continuar

\`\`\`

esperado:

\`\`\`text

Criando sua Vitrine...

\`\`\`

Durante o Loading:

\- botão indisponível;

\- múltiplos envios impedidos;

\- URL não deve aparecer antes da resposta.

\---

**# 99. Vitrine criada**

Após sucesso:

*> Sua Vitrine está pronta!*

Verificar:

\- URL exibida;

\- Copiar URL;

\- Visualizar Vitrine;

\- Vitrine acessível publicamente.

\---

**# 100. Falha ao criar Vitrine**

Simular erro.

Resultado esperado:

\- mensagem segura;

\- permitir nova tentativa;

\- não perder configurações;

\- não criar dois slugs ou duas estruturas inconsistentes.

\---

**# 101. Slug**

Testar:

\- geração automática;

\- letras minúsculas;

\- números;

\- hífens;

\- remoção de acentos;

\- remoção de espaços;

\- caracteres especiais;

\- unicidade;

\- palavras reservadas.

\---

**# 102. Slug duplicado**

Criar duas barbearias com nomes iguais.

Resultado esperado:

\- URLs continuam únicas através do identificador público.

\---

**# 103. Alteração do nome da barbearia**

Cenário:

\`\`\`text

/barbearia-imperial-a7k9

\`\`\`

Depois alterar o nome da barbearia.

Resultado esperado:

\- URL existente não muda automaticamente.

\---

**# 104. Despublicar Vitrine**

Após despublicar:

\- URL permanece reservada;

\- conteúdo público deixa de ser acessível;

\- dados cadastrados permanecem;

\- republicação utiliza a mesma URL.

\---

**# 105. Vitrine pública**

Testar:

\- publicada;

\- despublicada;

\- slug válido;

\- slug inexistente;

\- barbearia ativa;

\- barbearia suspensa;

\- serviço público;

\- serviço privado;

\- produto público;

\- produto privado;

\- Portfólio publicado;

\- Portfólio oculto;

\- horários;

\- atendimento a domicílio;

\- formas de pagamento aceitas;

\- atualização pública após alteração das formas aceitas;

\- localização;

\- contato.

\---

**# 106. Vazamento de dados da Vitrine**

Verificar diretamente as respostas da aplicação.

Não basta confirmar que o campo não aparece visualmente.

A resposta pública não deverá conter:

\- preço de custo;

\- custo estimado do serviço;

\- estoque mínimo;

\- quantidade exata em estoque;

\- faturamento;

\- despesas;

\- vendas;

\- IDs internos desnecessários;

\- dados administrativos;

\- dados de outra barbearia.

Quando configuradas para exibição pública, as formas de pagamento aceitas poderão estar presentes na resposta pública.

Essa resposta não deverá expor registros de vendas individuais nem qualquer relação financeira privada além da lista pública de formas aceitas.

\---

**# 107. Produto sem estoque na Vitrine**

Configuração:

\`\`\`text

INDISPONIVEL

\`\`\`

Resultado:

\- produto continua visível;

\- mostra Indisponível;

\- não mostra quantidade numérica.

Configuração:

\`\`\`text

OCULTAR

\`\`\`

Resultado:

\- produto não aparece.

\---

**# 108. WhatsApp**

Testar:

\- número existente;

\- número válido;

\- abertura correta;

\- ausência de número.

Se não houver valor válido:

\- botão não deve aparecer.

\---

**# 109. Instagram**

Testar:

\- perfil cadastrado;

\- abertura correta;

\- informação ausente.

Sem Instagram:

\- botão não aparece.

\---

**# 110. Como chegar**

Quando houver endereço:

\- botão abre o Google Maps com destino correspondente.

Quando não houver informação pública aplicável:

\- botão não aparece.

\---

**# 111. Testes do Portfólio**

Testar:

\- JPEG;

\- PNG;

\- WebP;

\- arquivo inválido;

\- arquivo acima do limite;

\- descrição;

\- serviço relacionado;

\- publicar;

\- ocultar;

\- excluir;

\- falha de upload.

\---

**# 112. Upload de outro tenant**

Tentar manipular upload para utilizar o caminho de outra barbearia.

Resultado esperado:

\- operação rejeitada;

\- arquivo de outro tenant não é sobrescrito ou excluído.

\---

**# 113. Testes do Perfil e Conta**

Testar:

\- exibição do e-mail;

\- alteração de senha;

\- alteração da preferência de tema;

\- persistência do tema após sair e entrar novamente;

\- Logout;

\- exclusão da conta;

\- tentativa de alterar o próprio tipo.

Não deve existir opção funcional para promover a própria conta.

\---

**# 114. Exclusão da conta**

Testar o fluxo normal do barbeiro e a exceção administrativa.

Resultados esperados no fluxo do barbeiro:

\- exigir sessão recente, senha atual e a frase exata *\`EXCLUIR MINHA CONTA\`*;

\- rejeitar senha incorreta, frase diferente ou tentativa sobre outra conta;

\- informar que a exclusão é imediata, definitiva e sem reembolso automático, salvo direito legal;

\- encerrar o acesso e retirar a Vitrine do ar imediatamente;

\- remover autenticação, dados operacionais e arquivos do Storage;

\- não permitir restauração da conta a partir dos backups;

\- manter somente pagamentos e ações administrativas essenciais na área de retenção;

\- conservar apenas código, nome e e-mail como identificação nesses registros;

\- excluir completamente os registros retidos ao fim de cinco anos.

Resultados esperados na exceção administrativa:

\- não existir botão comum de exclusão na lista de barbearias;

\- exigir autorização restrita, justificativa e a frase *\`EXCLUIR BAR-XXXXXX\`* com o código correto;

\- registrar a ação no histórico administrativo.

\---

**# 115. Testes do Painel Administrativo**

Testar:

\- Dashboard administrativo;

\- lista de barbearias;

\- busca por nome ou código;

\- filtros por plano e situação da conta;

\- detalhes administrativos;

\- consulta do plano, validade, pagamentos e histórico administrativo permitido;

\- confirmação de pagamento manual;

\- concessão de cortesia;

\- upgrade imediato;

\- downgrade agendado e cancelamento do agendamento;

\- cancelamento da renovação;

\- suspensão e reativação;

\- estado vazio;

\- Loading;

\- erros.

Resultados esperados:

\- somente perfil *\`ADMIN\`* autorizado acessa as rotas;

\- plano e situação *\`ATIVA/SUSPENSA\`* permanecem independentes;

\- o ADMIN não acessa vendas, despesas, estoque ou outros dados operacionais privados;

\- não existe tela geral de assinaturas na versão inicial.

\---

**# 116. Busca administrativa**

Testar:

\- barbearia existente;

\- barbearia inexistente;

\- texto parcial;

\- lista vazia;

\- erro de consulta.

Resultado esperado para ausência:

*> Nenhuma barbearia encontrada.*

ou equivalente.

\---

**# 117. Suspender barbearia**

Testar confirmação.

Após suspender:

\- barbeiro não deve acessar normalmente sua área;

\- Vitrine não deve permanecer acessível se a regra de conta ativa impedir;

\- dados não devem ser apagados.

\---

**# 118. Reativar barbearia**

Após reativação:

\- acesso volta conforme regras;

\- dados anteriores continuam preservados;

\- nenhuma venda ou despesa histórica é perdida.

\---

**# 119. Alterações administrativas da assinatura**

Testar confirmação de pagamento, cortesia, upgrade, downgrade agendado, cancelamento do downgrade e cancelamento da renovação.

Resultados esperados:

\- toda mudança gera evento permanente no histórico administrativo;

\- o registro atual da assinatura reflete somente o estado vigente;


\- mudanças não alteram retroativamente pagamentos anteriores.

\---

**# 120. Assistente IA — testes futuros**

O Assistente IA não faz parte da versão inicial. Testes de cota, rate limit, timeout, prompt injection, privacidade, fornecedor, agendamento e extensão administrativa não devem bloquear o lançamento atual.

Quando o módulo voltar ao escopo, criar uma bateria específica de testes baseada em `ASSISTENTE_IA_FUTURO.md` antes de qualquer liberação comercial.

\---

**# 130. Testes de ausência de internet**

Testar perda de conexão durante:

\- Dashboard;

\- formulário;

\- PDV;

\- Vitrine administrativa.

No PDV:

\- preservar comanda temporária quando possível enquanto a página permanecer aberta;

\- impedir finalização;

\- não criar venda offline;

\- não prometer sincronização posterior.

\---

**# 131. Modo de manutenção**

Com manutenção ativa:

\- áreas definidas ficam bloqueadas;

\- página de manutenção aparece;

\- detalhes técnicos não são exibidos.

Testar também retorno ao estado normal.

\---

**# 132. Testes E2E prioritários**

**## E2E-01 — Cadastro**

\`\`\`text

Criar conta

→ perfil BARBEIRO

→ Onboarding

→ Dashboard

\`\`\`

**## E2E-02 — Login ADMIN**

\`\`\`text

Login

→ perfil ADMIN

→ Painel Administrativo

\`\`\`

**## E2E-03 — Serviço**

\`\`\`text

Cadastrar serviço

→ PDV

→ Vender serviço

→ Histórico

\`\`\`

**## E2E-04 — Produto**

\`\`\`text

Cadastrar produto

→ Reposição

→ Nenhuma despesa automática

→ Despesa manual opcional em fluxo separado

→ PDV

→ Venda

→ Estoque

\`\`\`

**## E2E-05 — Cancelamento**

\`\`\`text

Venda

→ Cancelamento

→ Estoque restaurado

→ Relatório atualizado

\`\`\`

**## E2E-06 — Despesa recorrente**

\`\`\`text

Criar recorrência

→ gerar ocorrência

→ marcar como paga

→ Financeiro atualizado

\`\`\`

**## E2E-07 — Vitrine**

\`\`\`text

Configurar Vitrine

→ Prévia

→ Gerar URL

→ aviso de informações ausentes

→ Criando sua Vitrine

→ Vitrine criada

→ acessar como visitante

\`\`\`

**## E2E-08 — ADMIN**

\`\`\`text

Login ADMIN

→ buscar barbearia

→ abrir detalhes

→ confirmar pagamento ou suspender conta

→ verificar histórico administrativo

\`\`\`

**## E2E-09 — Relatório**

\`\`\`text

Selecionar período

→ gerar relatório

→ exportar PDF

→ exportar PNG

\`\`\`

\---

**# 133. Cross-browser**

Executar fluxos importantes em:

\- Chromium;

\- Firefox;

\- WebKit.

Não é necessário executar toda combinação possível em todo commit.

Priorizar fluxos críticos.

\---

**# 134. Responsividade**

Testar larguras aproximadas:

\`\`\`text

320

375

390

430

768

1024

1280

1440

\`\`\`

Verificar:

\- overflow;

\- botões;

\- formulários;

\- tabelas;

\- cards;

\- modais;

\- navegação;

\- gráficos;

\- PDV;

\- despesas recorrentes;

\- Vitrine;

\- chat;

\- Painel Administrativo.

\---

**# 135. Teste em dispositivo real**

Antes da produção, realizar validação manual em pelo menos um celular real.

Verificar:

\- toque;

\- teclado;

\- scroll;

\- uploads;

\- desempenho;

\- navegação;

\- PDV;

\- OTP;

\- Vitrine.

\---

**# 136. Acessibilidade**

Testes automáticos com axe-core deverão ser complementados por verificações manuais.

Verificar:

\- navegação por teclado;

\- foco visível;

\- labels;

\- ordem de foco;

\- contraste;

\- textos alternativos;

\- uso sem depender somente de cor;

\- controles por toque;

\- estados de erro compreensíveis.

\---

**# 137. Tema Claro e Escuro**

Testar ambos os temas em toda a interface autenticada.

Verificar:

\- contraste;

\- textos;

\- cards;

\- inputs;

\- modais;

\- gráficos;

\- estados semânticos;

\- foco;

\- Vitrine administrativa;

\- Painel Administrativo;

\- persistência entre páginas;

\- persistência após atualização do navegador;

\- persistência após novo Login;

\- ausência de flash prolongado com tema incorreto durante carregamento.

\---

**# 138. Padrão do Sistema**

Com:

\`\`\`text

Tema = SISTEMA

\`\`\`

testar mudança da preferência do dispositivo entre Claro e Escuro.

Resultado esperado:

\- interface acompanha a preferência quando aplicável;

\- a preferência salva continua sendo *\`SISTEMA\`*, e não é substituída por *\`CLARO\`* ou *\`ESCURO\`* apenas porque o dispositivo mudou;

\- a Vitrine pública não muda automaticamente em razão da preferência privada do barbeiro.

\---

**# 139. Lighthouse**

Executar principalmente em:

\- Login;

\- Dashboard quando apropriado;

\- Vitrine pública.

Registrar resultados.

Não sacrificar funcionalidade útil apenas para perseguir pontuação perfeita.

\---

**# 140. Testes de usabilidade**

Devem ser realizados com um usuário representativo, preferencialmente o barbeiro parceiro.

O desenvolvedor deverá observar sem ensinar cada etapa antes da tentativa.

\---

**# 141. Tarefas de usabilidade**

Solicitar ao barbeiro que execute tarefas como:

1\. registrar venda;

2\. cadastrar produto;

3\. registrar reposição;

4\. cadastrar despesa;

5\. criar despesa recorrente;

6\. encontrar relatório do mês;

7\. alterar preço de serviço;

8\. adicionar foto ao Portfólio;

9\. gerar a URL da Vitrine;

10\. copiar o link da Vitrine.

\---

**# 142. O que observar**

Durante o teste de usabilidade, registrar:

\- encontrou a função sozinho?

\- demorou?

\- clicou no lugar errado?

\- entendeu os termos?

\- pediu explicação?

\- conseguiu corrigir erro?

\- terminou a tarefa?

\- percebeu claramente a ação principal?

\---

**# 143. Teste de carga**

Utilizar k6 para verificar comportamento com múltiplas requisições.

Prioridades:

\- Vitrine;

\- endpoints públicos;

\- leitura de serviços;

\- leitura de produtos;


\---

**# 144. Teste de estresse**

Aumentar a carga progressivamente para identificar:

\- lentidão;

\- erros;

\- limite da infraestrutura;

\- comportamento sob falha.

Executar somente em ambiente preparado.

\---

**# 145. Teste de pico**

Simular crescimento rápido de tráfego.

Exemplo conceitual:

\`\`\`text

10 usuários

↓

100 usuários rapidamente

\`\`\`

Valores reais deverão ser definidos com base em estimativas futuras.

\---

**# 146. Teste de duração**

Manter carga estável por período prolongado para identificar:

\- degradação;

\- vazamento de recursos;

\- instabilidade.

O tempo deverá ser definido conforme a fase do projeto.

\---

**# 147. Critérios de desempenho**

Não inventar metas arbitrárias antes de medir.

Processo:

\`\`\`text

Criar baseline

→ medir

→ encontrar gargalos

→ definir metas

→ otimizar

→ medir novamente

\`\`\`

\---

**# 148. Testes de segurança**

Utilizar combinação de:

\- testes manuais;

\- RLS;

\- testes automatizados;

\- OWASP ZAP;

\- SonarQube.

Prioridades:

\- autenticação;

\- autorização;

\- *\`BARBEIRO/ADMIN\`*;

\- isolamento de tenants;

\- segredos;

\- endpoints públicos;

\- uploads;


\- mass assignment;

\- manipulação de IDs.

\---

**# 149. Mass assignment**

Cenário:

usuário envia um objeto de perfil contendo campo não permitido:

\`\`\`json

{

  "nome": "Carlos",

  "tipo": "ADMIN"

}

\`\`\`

Resultado esperado:

\- nome poderá ser processado se permitido;

\- campo *\`tipo\`* é ignorado ou rejeitado;

\- permissão não muda.

\---

**# 150. Manipulação de IDs**

Tentar enviar ID válido de registro pertencente a outro tenant.

Exemplo:

\`\`\`text

produto\_id da Barbearia B

\`\`\`

durante operação da Barbearia A.

Resultado esperado:

\- acesso negado;

\- nenhuma alteração ocorre.

\---

**# 151. OWASP ZAP**

Executar contra:

\- ambiente local;

\- teste;

\- Preview autorizado.

Não executar ataque ativo contra sistemas de terceiros.

\---

**# 152. Dependências**

Verificar periodicamente dependências em busca de vulnerabilidades conhecidas.

Problemas relevantes deverão ser avaliados e corrigidos quando aplicáveis.

\---

**# 153. Teste de regressão**

Quando um bug for corrigido:

1\. criar teste que reproduza o problema quando possível;

2\. confirmar falha anterior;

3\. aplicar correção;

4\. confirmar que passa;

5\. manter teste para evitar retorno do bug.

\---

**# 154. Prioridade dos testes**

**## Crítico**

\- Auth;

\- autorização;

\- *\`BARBEIRO/ADMIN\`*;

\- isolamento entre tenants;

\- PDV;

\- estoque;

\- cancelamento;

\- Financeiro;

\- despesas recorrentes;

\- segredos.

**## Alto**

\- produtos;

\- serviços;

\- reposição;

\- perda;

\- Vitrine;

\- uploads;

\- ADMIN;


\- relatórios.

**## Médio**

\- Portfólio;

\- filtros;

\- detalhes visuais;

\- temas;

\- funções secundárias.

\---

**# 155. Quando executar**

**## Durante desenvolvimento**

Executar:

\- unitários;

\- componentes;

\- TypeScript;

\- análise estática.

**## Antes de integrar alteração importante**

Executar:

\- unitários;

\- integração;

\- E2E relacionado.

**## Antes de release**

Executar:

\- E2E críticos;

\- RLS;

\- autorização;

\- segurança;

\- responsividade;

\- acessibilidade;

\- SonarQube.

**## Antes da produção inicial**

Executar a bateria completa aplicável ao MVP.

\---

**# 156. Registro de testes**

Cada teste executado deverá possuir registro.

\| Campo | Informação |

\|---|---|

\| ID | Identificador |

\| Data | Data da execução |

\| Versão/Commit | Versão testada |

\| Ambiente | Local/Teste/Preview |

\| Responsável | Quem executou |

\| Tipo | Unitário/E2E/etc. |

\| Ferramenta | Ferramenta utilizada |

\| Cenário | O que foi testado |

\| Resultado esperado | Comportamento correto |

\| Resultado obtido | O que ocorreu |

\| Status | PASSOU/FALHOU/BLOQUEADO/NÃO EXECUTADO |

\| Evidência | Print, relatório ou arquivo |

\| Observação | Informação adicional |

\---

**# 157. Status permitidos**

Utilizar:

\`\`\`text

PASSOU

FALHOU

BLOQUEADO

NÃO EXECUTADO

\`\`\`

\---

**# 158. IDs dos testes**

Sugestão:

\`\`\`text

UNIT-001

COMP-001

INT-001

DB-001

RLS-001

AUTH-001

ADMIN-001

PDV-001

EST-001

FIN-001

VIT-001


E2E-001

SEC-001

PERF-001

LOAD-001

UX-001

A11Y-001

\`\`\`

\---

**# 159. Exemplo de registro**

\| Campo | Valor |

\|---|---|

\| ID | PDV-001 |

\| Data | 08/09/2026 |

\| Ambiente | Local |

\| Tipo | Integração |

\| Cenário | Vender 2 produtos com estoque disponível |

\| Esperado | Venda concluída e estoque reduzido em 2 |

\| Obtido | Conforme esperado |

\| Status | PASSOU |

\| Evidência | *\`evidencias/PDV-001.png\`* |

\| Observação | Nenhuma |

\---

**# 160. Evidências**

Quando útil, guardar:

\- screenshots;

\- relatórios HTML;

\- logs sanitizados;

\- relatório SonarQube;

\- resultado Lighthouse;

\- relatório Playwright;

\- resultado k6;

\- relatório ZAP;

\- PDF de teste;

\- PNG de teste.

Não armazenar:

\- senhas;

\- tokens;

\- chaves;

\- cookies;

\- dados pessoais desnecessários.

\---

**# 161. Estrutura sugerida**

\`\`\`text

testes/

├── unit/

├── components/

├── integration/

├── database/

├── e2e/

├── security/

├── performance/

└── evidencias/

\`\`\`

A estrutura real poderá seguir as convenções das ferramentas utilizadas.

\---

**# 162. Bugs encontrados**

Todo teste que falhar deverá gerar informação suficiente para reproduzir o problema.

Registrar:

\- comportamento observado;

\- comportamento esperado;

\- passos;

\- ambiente;

\- evidência;

\- gravidade.

\---

**# 163. Gravidade**

**## Crítica**

Exemplos:

\- vazamento entre barbearias;

\- BARBEIRO conseguindo virar ADMIN;

\- BARBEIRO acessando Painel Administrativo;

\- perda financeira relevante;

\- estoque inconsistente;

\- segredo exposto;

\- impossibilidade geral de uso.

**## Alta**

Exemplos:

\- venda não funciona;

\- Login não funciona;

\- reposição gera valor incorreto;

\- despesa recorrente duplica saída;

\- Vitrine expõe informação privada.

**## Média**

Exemplos:

\- função secundária com comportamento incorreto;

\- filtro inconsistente;

\- exportação visual com erro sem comprometer dados.

**## Baixa**

Exemplos:

\- problema visual;

\- texto;

\- alinhamento;

\- detalhe sem impacto funcional relevante.

\---

**# 164. Critério para lançamento**

O sistema não deverá ser lançado comercialmente com:

\- falha crítica conhecida;

\- vazamento entre tenants;

\- promoção indevida para ADMIN;

\- acesso administrativo indevido;

\- PDV inconsistente;

\- estoque negativo;

\- vazamento ou mistura de formas de pagamento aceitas entre barbearias;

\- saída financeira duplicada;

\- segredo exposto;

\- Auth quebrado;

\- vulnerabilidade crítica conhecida sem tratamento;

\- fluxo principal E2E falhando.

\---

**# 165. Cobertura**

Não definir uma porcentagem arbitrária de cobertura apenas para produzir um número atraente.

Priorizar regras críticas.

Exemplo:

um cálculo financeiro importante sem teste merece mais atenção do que um componente decorativo com 100% de cobertura.

\---

**# 166. Automatização**

Conforme o projeto amadurecer, testes importantes poderão ser executados automaticamente através do GitHub.

Prioridade:

\`\`\`text

1\. TypeScript

2\. Testes unitários

3\. Testes de componentes

4\. Testes de banco/RLS críticos

5\. E2E críticos

6\. Análise de qualidade

\`\`\`

Não criar pipeline excessivamente complexo antes de existir uma suíte estável.

\---

**# 167. Critério de conclusão**

O Plano de Testes estará efetivamente implantado quando:

\- ferramentas necessárias estiverem configuradas;

\- cenários críticos possuírem testes;

\- cadastro como *\`BARBEIRO\`* estiver testado;

\- promoção indevida para *\`ADMIN\`* estiver bloqueada e testada;

\- rotas administrativas estiverem protegidas;

\- permissões do ADMIN estiverem testadas;

\- RLS estiver testada;

\- isolamento entre barbearias estiver validado;

\- as seis etapas do Onboarding estiverem testadas, incluindo interrupção e retomada;

\- preferência de tema estiver persistindo corretamente;

\- formas de pagamento aceitas estiverem persistidas, isoladas por tenant e disponíveis corretamente no PDV/Vitrine;

\- PDV e estoque estiverem testados;

\- concorrência estiver testada;

\- reposição e Financeiro estiverem testados em conjunto;

\- perda de estoque estiver testada;

\- despesas recorrentes estiverem testadas;

\- E2E principais passarem;

\- fluxo de criação da Vitrine estiver testado;

\- exportação PDF e PNG estiver testada;


\- responsividade estiver validada;

\- acessibilidade estiver revisada;

\- usabilidade estiver validada;

\- SonarQube estiver sendo utilizado;

\- segurança tiver avaliação;

\- resultados forem registrados;

\- falhas relevantes forem corrigidas antes da produção.

\---
# 168. Matriz oficial dos planos

Validar o verificador central de recursos para `GRATIS` e `NORMAL`.

Casos obrigatórios:

- Grátis mantém Vitrine, Portfólio, Serviços e Produtos para divulgação;
- Grátis bloqueia PDV, movimentações de estoque e edição de dados exclusivos do plano pago;
- dados criados no período pago continuam visíveis em somente leitura após o retorno ao Grátis;
- relatórios no Grátis permitem consulta e filtros, mas não exportação;
- Normal libera o núcleo completo de gestão;
- telas bloqueadas usam a explicação reutilizável e apresentam o benefício do Plano Normal.

Recursos futuros não fazem parte desta matriz enquanto não entrarem oficialmente no escopo.

**# 169. Assinaturas, preços e validade**

Validar:

\- preço oficial inicial de R$ 49,90 para o Plano Normal;

\- início da validade na data real de confirmação do pagamento manual via Pix;

\- preservação dos dias restantes quando o pagamento é confirmado antes do vencimento;

\- início de novo ciclo na data do pagamento quando a assinatura já venceu;

\- retorno imediato ao Grátis no vencimento sem pagamento confirmado e sem período de tolerância;

\- cancelamento que encerra somente a renovação e mantém o acesso até a validade final;

\- upgrade imediato mantendo a data final do ciclo;

\- downgrade agendado, cancelável antes do vencimento;

\- downgrade sem pagamento confirmado que resulta em Grátis, e não em Normal;

\- registro permanente do pagamento e dos eventos administrativos;

\- preço e plano registrados como fotografia histórica do momento da cobrança.

Testar datas limítrofes, inclusive meses com 28, 29, 30 e 31 dias.

\---

**# 170. Código imutável da barbearia**

Validar formato *\`BAR-XXXXXX\`*, geração no servidor, unicidade e imutabilidade.

O código não pode:

\- ser escolhido ou alterado pelo usuário;

\- ser exposto na Vitrine pública;

\- ser reutilizado após exclusão da conta;

\- colidir sob cadastros concorrentes.

\---

**# 171. Estados globais e suspensão**

Testar as telas de manutenção, offline global, página não encontrada e conta suspensa.

Na suspensão:

\- o acesso autenticado fica bloqueado;

\- a Vitrine sai do ar;

\- os dados permanecem preservados;

\- a reativação recupera o acesso sem alterar o plano ou o histórico.

Na manutenção, validar motivo e previsão quando informados pelo ADMIN, além do bloqueio consistente das rotas afetadas.

\---

**# 172. Retenção e consulta técnica**

Testar que registros de contas excluídas:

\- ficam fora da lista normal de barbearias;

\- só podem ser consultados por acesso técnico restrito e auditável;

\- contêm somente pagamentos, ações essenciais, código, nome e e-mail;

\- não permitem reconstruir ou reativar a conta;

\- são apagados completamente ao completar cinco anos.

\---

**# 173. Aceite legal**

Antes do primeiro uso real, validar:

\- Termos de Uso e Política de Privacidade publicados;

\- aceite explícito e obrigatório no cadastro;

\- registro da versão, data, usuário e evidência técnica necessária;

\- novo aceite quando uma alteração relevante exigir concordância novamente.

\---

**# 174. Backup e restauração**

Validar backup automático diário do banco e do Storage, monitoramento de falhas e teste documentado de restauração.

Contas excluídas podem permanecer temporariamente em cópias antigas até a expiração automática, mas não podem ser restauradas para o sistema ativo.

\---

**# 175. Piloto assistido**

O primeiro barbeiro poderá iniciar o piloto quando:

\- todo o núcleo do Plano Normal estiver funcional;

\- não houver falha crítica ou operacional conhecida;

\- defeitos pequenos e visuais estiverem registrados para correção durante o acompanhamento;

\- o cadastro próprio, o Login e o mês gratuito do Normal funcionarem no endereço temporário da Vercel;

\- o suporte via WhatsApp estiver definido;

\- backup diário e restauração tiverem sido validados.

O mês gratuito começa quando o link funcional for enviado ao primeiro barbeiro.

\---

**# 176. Incidente crítico durante o piloto**

Ao detectar falha crítica:

\- ativar manutenção;

\- avisar o barbeiro pelo WhatsApp;

\- corrigir a causa;

\- executar regressão dos fluxos afetados;

\- reabrir somente após validação.

\---

**# 177. Liberação para divulgação pública**

O sistema só poderá receber o segundo barbeiro e ser divulgado depois de:

\- validação do desenvolvedor, inclusive pelas ferramentas de teste definidas;

\- validação prática do primeiro barbeiro sem erro relevante pendente;

\- testes completos de assinatura, pagamento, upgrade, downgrade e cancelamento;

\- revisão de Termos de Uso e Política de Privacidade por advogado;

\- domínio próprio com HTTPS configurado;

\- ausência de falha crítica conhecida.

O Assistente IA é um recurso futuro e não faz parte dos critérios de liberação da versão inicial. Antes de qualquer futura liberação, deverá possuir plano de testes próprio e atualizado.

\---
