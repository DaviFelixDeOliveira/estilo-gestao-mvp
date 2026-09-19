**# Design System - Estilo e Gestão**

**## Objetivo**

Este documento define os padrões visuais, de componentes, interação, feedback, acessibilidade e usabilidade do **\*\*Estilo e Gestão\*\***.

Ele serve como referência para:

\- prototipação no Stitch;

\- desenvolvimento frontend;

\- criação de novos componentes;

\- manutenção da consistência entre telas;

\- implementação por desenvolvedores ou agentes de IA;

\- interfaces do *\`BARBEIRO\`*;

\- interfaces do *\`ADMIN\`*;

\- Vitrine Digital pública.

Este documento define padrões globais.

Regras específicas de funcionamento de cada tela pertencem ao documento:

\`\`\`text

FLUXO\_BARBEIRO\_E\_CLIENTE.md

\`\`\`

Regras específicas de adaptação por tamanho de tela pertencem ao:

\`\`\`text

RESPONSIVIDADE.md

\`\`\`

As cores e tokens cromáticos detalhados pertencem ao:

\`\`\`text

ESQUEMA\_DE\_CORES.md

\`\`\`

Quando uma regra específica de uma funcionalidade entrar em conflito com um padrão genérico deste documento, a regra específica documentada para aquela funcionalidade terá prioridade.

\---

**# 1. Princípios visuais**

A interface deverá ser:

\- simples;

\- profissional;

\- limpa;

\- moderna;

\- fácil de entender;

\- adequada ao uso rápido;

\- consistente;

\- prioritariamente Mobile First;

\- acessível;

\- previsível.

Evitar excesso de:

\- efeitos;

\- gradientes;

\- sombras;

\- animações;

\- informações simultâneas;

\- elementos decorativos sem função;

\- cores competindo pela atenção;

\- componentes diferentes executando a mesma função.

A interface deverá priorizar clareza sobre ornamentação.

\---

**# 2. Princípios de usabilidade**

O sistema deverá reduzir o esforço necessário para executar ações frequentes.

Sempre que possível:

\- utilizar padrões conhecidos de interface;

\- reduzir quantidade de cliques;

\- manter ações importantes visíveis;

\- utilizar textos claros;

\- fornecer feedback após ações;

\- evitar exigir a mesma informação duas vezes;

\- preservar dados preenchidos quando ocorrer erro recuperável;

\- evitar bloquear toda a tela quando somente uma parte estiver processando;

\- impedir ações duplicadas acidentais;

\- permitir uso por teclado, mouse e toque.

Não criar comportamentos inesperados apenas para tornar a interface visualmente diferente.

\---

**# 3. Reaproveitamento de padrões de usabilidade**

O Estilo e Gestão poderá reutilizar padrões genéricos de usabilidade, acessibilidade e interação provenientes de outros projetos quando esses padrões melhorarem a experiência.

Podem ser reaproveitados:

\- envio de formulários com *\`Enter\`*;

\- foco automático quando apropriado;

\- avanço automático entre campos relacionados;

\- retorno ao campo anterior ao apagar;

\- copiar e colar códigos OTP;

\- teclado adequado ao tipo do campo;

\- mostrar e ocultar senha;

\- validações próximas aos campos;

\- Loading;

\- bloqueio de múltiplos envios;

\- estados de sucesso;

\- estados de erro;

\- Empty States;

\- confirmações de ações destrutivas;

\- navegação por teclado;

\- feedback visual;

\- padrões de acessibilidade.

Não deverão ser herdados automaticamente:

\- regras de negócio;

\- entidades;

\- campos específicos;

\- integrações específicas;

\- permissões;

\- funcionalidades;

\- fluxos comerciais;

\- estruturas de banco;

\- regras financeiras;

\- comportamentos exclusivos de outro sistema.

\---

**# 4. Identidade visual**

A identidade do Estilo e Gestão utiliza como base tons neutros relacionados à marca.

A aparência deverá transmitir:

\- organização;

\- confiança;

\- simplicidade;

\- modernidade;

\- profissionalismo.

A interface privada deverá priorizar:

\- legibilidade;

\- velocidade;

\- organização;

\- baixa carga visual.

A Vitrine Digital poderá possuir composição visual um pouco mais expressiva, sem abandonar a identidade principal do produto.

O Painel Administrativo do SaaS deverá utilizar o mesmo Design System da aplicação, mas possuir contexto visual suficiente para deixar claro que o usuário está em uma área administrativa.

\---

**# 5. Sistema de temas**

A interface autenticada deverá suportar três opções:

\`\`\`text

Tema Claro

Tema Escuro

Padrão do Sistema

\`\`\`

Essas opções representam aparência, não permissões ou configurações da barbearia.

\---

**# 6. Tema Claro**

O Tema Claro utilizará como base as cores claras já definidas para o projeto.

Principais referências:

\`\`\`text

Brand 950

\#2F2F2D

Brand 800

\#3A3A38

Brand 600

\#666662

Surface 100

\#E9E9E4

Surface 50

\#F4F4F0

White

\#FFFFFF

\`\`\`

A aplicação deverá evitar grandes áreas totalmente brancas quando uma superfície levemente diferenciada melhorar a hierarquia visual.

\---

**# 7. Tema Escuro**

O Tema Escuro faz parte das opções atuais do sistema.

Ele deverá possuir equivalentes próprios para:

\- fundo da aplicação;

\- superfícies;

\- cards;

\- bordas;

\- textos;

\- textos secundários;

\- inputs;

\- menus;

\- sidebar;

\- modais;

\- estados interativos;

\- gráficos;

\- estados semânticos.

Não implementar Tema Escuro simplesmente invertendo as cores do Tema Claro.

Também não utilizar:

\`\`\`text

\#000000

\`\`\`

como fundo obrigatório de toda a aplicação.

O Tema Escuro deverá manter:

\- contraste;

\- hierarquia;

\- legibilidade;

\- conforto visual;

\- identidade da marca.

Os valores cromáticos definitivos pertencem ao:

\`\`\`text

ESQUEMA\_DE\_CORES.md

\`\`\`

\---

**# 8. Padrão do Sistema**

Quando o usuário selecionar:

\`\`\`text

Padrão do Sistema

\`\`\`

a aplicação deverá acompanhar a preferência de aparência do dispositivo ou navegador.

Exemplo:

\`\`\`text

Dispositivo em modo claro

→ aplicação clara

Dispositivo em modo escuro

→ aplicação escura

\`\`\`

Quando a preferência do dispositivo mudar, a interface deverá acompanhar quando tecnicamente suportado.

\---

**# 9. Persistência do tema**

A preferência de tema pertence ao usuário.

Depois de escolhida, deverá continuar aplicada nos acessos seguintes.

O tema não deverá mudar aleatoriamente entre páginas.

A implementação e persistência pertencem às camadas técnicas do sistema.

\---

**# 10. Transição entre temas**

A troca de tema deverá ocorrer de forma rápida e sem efeitos exagerados.

Evitar:

\- flashes intensos;

\- animações longas;

\- páginas momentaneamente com tema incorreto;

\- componentes que permaneçam com cores do tema anterior.

Todos os componentes reutilizáveis deverão funcionar nos temas suportados.

\---

**# 11. Vitrine Digital e tema do sistema**

A seleção:

\`\`\`text

Tema Claro

Tema Escuro

Padrão do Sistema

\`\`\`

refere-se à interface autenticada do sistema.

Ela não deverá ser interpretada automaticamente como configuração visual pública da Vitrine.

A aparência da Vitrine deverá seguir as regras próprias documentadas para a interface pública.

\---

**# 12. Tokens de cor**

Durante a implementação, componentes deverão preferir tokens semânticos em vez de cores fixas espalhadas pelo código.

Exemplo conceitual:

\`\`\`text

background

surface

surface-elevated

text-primary

text-secondary

border

primary

primary-hover

success

warning

danger

info

\`\`\`

Assim, o mesmo componente poderá funcionar em:

\`\`\`text

Tema Claro

Tema Escuro

\`\`\`

sem precisar ser recriado.

\---

**# 13. Cor Brand 950**

Referência atual:

\`\`\`text

\#2F2F2D

\`\`\`

No Tema Claro poderá ser utilizada principalmente para:

\- títulos;

\- textos de grande destaque;

\- botões principais;

\- elementos de marca;

\- ícones importantes;

\- navegação selecionada quando apropriado.

No Tema Escuro, não assumir automaticamente que essa mesma cor possui contraste suficiente.

Utilizar o token correspondente definido para o tema.

\---

**# 14. Cor Brand 800**

Referência atual:

\`\`\`text

\#3A3A38

\`\`\`

Uso possível no Tema Claro:

\- variações do botão principal;

\- hover de elementos escuros;

\- textos de destaque secundário;

\- elementos de navegação.

\---

**# 15. Cor Brand 600**

Referência atual:

\`\`\`text

\#666662

\`\`\`

Uso possível:

\- textos secundários;

\- ícones neutros;

\- informações auxiliares;

\- estados discretos.

Não utilizar em textos pequenos quando o contraste for insuficiente.

\---

**# 16. Surface 100**

Referência atual:

\`\`\`text

\#E9E9E4

\`\`\`

Uso no Tema Claro:

\- bordas;

\- divisores;

\- áreas secundárias;

\- fundos de controles;

\- estados neutros.

\---

**# 17. Surface 50**

Referência atual:

\`\`\`text

\#F4F4F0

\`\`\`

Uso no Tema Claro:

\- fundo geral;

\- áreas secundárias;

\- superfícies discretamente diferenciadas.

\---

**# 18. Branco**

Referência:

\`\`\`text

\#FFFFFF

\`\`\`

Uso possível no Tema Claro:

\- cards;

\- formulários;

\- modais;

\- superfícies elevadas.

No Tema Escuro, cards e modais não deverão continuar brancos apenas porque utilizavam branco no Tema Claro.

\---

**# 19. Cor positiva**

Referência atual:

\`\`\`text

\#2F6B4F

\`\`\`

Utilizar para:

\- sucesso;

\- confirmação;

\- indicadores positivos;

\- operação concluída;

\- estado saudável quando necessário.

Não utilizar verde como decoração quando ele puder ser interpretado como indicação de sucesso.

O Tema Escuro poderá utilizar uma variação adequada ao contraste, conforme o Esquema de Cores.

\---

**# 20. Cor destrutiva**

Referência atual:

\`\`\`text

\#B42318

\`\`\`

Utilizar para ações como:

\- excluir;

\- remover permanentemente;

\- confirmar perda;

\- suspender barbearia quando houver impacto relevante;

\- excluir conta.

A cor destrutiva não deverá ser utilizada em ações comuns.

\---

**# 21. Cor de alerta**

Referência atual:

\`\`\`text

\#B54708

\`\`\`

Exemplos:

\- estoque baixo;

\- venda abaixo do custo;

\- configuração incompleta;

\- dados opcionais ausentes na criação da Vitrine;

\- situação que exige atenção, mas não bloqueia necessariamente a ação.

Alerta não significa erro.

\---

**# 22. Cor informativa**

Referência atual:

\`\`\`text

\#175CD3

\`\`\`

Pode ser utilizada para:

\- informações auxiliares;

\- avisos não críticos;

\- ajuda contextual;

\- informações de processo.

Não transformar a interface em uma coleção de cores competindo por atenção.

\---

**# 23. Uso semântico das cores**

Cor nunca deverá ser o único meio de transmitir significado.

Incorreto:

\`\`\`text

● vermelho

● verde

\`\`\`

sem explicação.

Preferir:

\`\`\`text

Cancelada

Concluída

Estoque baixo

Pendente

Paga

Ignorada

\`\`\`

com combinação apropriada de:

\- texto;

\- cor;

\- ícone quando útil;

\- badge quando apropriado.

\---

**# 24. Tipografia**

A fonte deverá ser:

\- sans-serif;

\- legível;

\- adequada a interfaces;

\- consistente entre painel e Vitrine.

A família definitiva será validada durante a prototipação.

Evitar utilizar várias famílias tipográficas sem necessidade.

\---

**# 25. Hierarquia tipográfica**

A hierarquia deverá diferenciar claramente:

\- título da página;

\- título de seção;

\- título de card;

\- texto principal;

\- texto secundário;

\- label;

\- ajuda;

\- mensagem de erro;

\- valores financeiros importantes.

Títulos não deverão depender apenas de tamanho.

Também poderão utilizar:

\- peso;

\- posição;

\- espaçamento;

\- contraste.

\---

**# 26. Valores financeiros em destaque**

Indicadores financeiros importantes poderão utilizar maior peso e tamanho.

Exemplo:

\`\`\`text

Faturamento

R$ 1.250,00

\`\`\`

Não destacar indiscriminadamente todos os números da interface.

Deverá existir hierarquia entre:

\- título do indicador;

\- valor;

\- informação auxiliar.

\---

**# 27. Espaçamento**

Utilizar escala consistente.

Referência:

\`\`\`text

4px

8px

12px

16px

24px

32px

48px

\`\`\`

Evitar valores aleatórios quando um token existente resolver adequadamente.

\---

**# 28. Bordas e cantos**

Referência:

\`\`\`text

8px

→ inputs e controles menores

12px

→ botões e cards

16px

→ cards maiores, modais e painéis

\`\`\`

Componentes semelhantes deverão possuir arredondamento consistente.

\---

**# 29. Sombras**

Sombras deverão ser discretas.

Utilizar principalmente em:

\- menus flutuantes;

\- dropdowns;

\- popovers;

\- modais;

\- elementos sobrepostos.

Cards comuns deverão depender preferencialmente de:

\- superfície;

\- borda;

\- espaçamento.

O Tema Escuro deverá evitar sombras que se tornem invisíveis ou excessivamente artificiais.

\---

**# 30. Ícones**

Biblioteca principal:

\`\`\`text

Lucide React

\`\`\`

Os ícones deverão:

\- possuir significado claro;

\- manter espessura consistente;

\- acompanhar texto quando houver possibilidade de dúvida;

\- possuir nome acessível quando utilizados sem texto.

Não utilizar emojis como substitutos obrigatórios dos ícones da interface administrativa.

\---

**# 31. Botões**

Todo botão deverá prever, quando aplicável:

\- padrão;

\- hover;

\- foco;

\- pressionado;

\- Loading;

\- desabilitado.

Tipos principais:

\- primário;

\- secundário;

\- neutro;

\- destrutivo;

\- somente ícone.

\---

**# 32. Botão primário**

Utilizado para a ação principal de uma área.

Exemplos:

\- Salvar;

\- Finalizar venda;

\- Criar conta;

\- Entrar;

\- Gerar URL;

\- Publicar;

\- Marcar como paga.

Evitar mais de uma ação primária competindo visualmente na mesma região.

\---

**# 33. Botão secundário**

Utilizado para ações importantes, mas secundárias.

Exemplos:

\- Voltar;

\- Cancelar;

\- Visualizar;

\- Editar;

\- Copiar URL.

\---

**# 34. Botão neutro**

Pode ser utilizado para ações que não precisam competir com a principal nem representar risco.

Exemplos:

\- Fechar;

\- Limpar filtro;

\- Abrir detalhes;

\- Cancelar edição.

\---

**# 35. Botão destrutivo**

Utilizado para ações com impacto relevante.

Exemplos:

\- Excluir conta;

\- Remover imagem;

\- Confirmar perda;

\- Suspender barbearia.

Quando necessário, deverá existir confirmação antes da execução.

\---

**# 36. Botões durante processamento**

Ao iniciar uma ação assíncrona:

\- impedir múltiplos envios;

\- desabilitar o botão responsável;

\- apresentar feedback;

\- manter texto compreensível.

Exemplos:

\`\`\`text

Salvando...

\`\`\`

\`\`\`text

Finalizando...

\`\`\`

\`\`\`text

Criando sua Vitrine...

\`\`\`

\`\`\`text

Gerando relatório...

\`\`\`

Não permitir cinco cliques porque a resposta levou um segundo. A humanidade já produz duplicação suficiente sem ajuda da interface.

\---

**# 37. Área mínima de interação**

Elementos tocáveis deverão possuir área confortável.

Referência mínima:

\`\`\`text

44px × 44px

\`\`\`

Aplicável especialmente a:

\- botões;

\- ícones clicáveis;

\- controles de quantidade;

\- fechar;

\- menus;

\- opções de navegação.

\---

**# 38. Inputs**

Inputs deverão possuir:

\- label visível;

\- estado padrão;

\- foco;

\- erro;

\- desabilitado quando necessário;

\- ajuda quando necessária;

\- tamanho confortável.

Placeholder não substitui label.

\---

**# 39. Campos obrigatórios**

Campos obrigatórios deverão ser identificados consistentemente.

Exemplo:

\`\`\`text

E-mail \*

\`\`\`

A convenção adotada deverá permanecer igual em todos os formulários.

\---

**# 40. Campos opcionais**

Quando necessário, indicar:

\`\`\`text

Descrição (opcional)

\`\`\`

Evitar obrigar o usuário a descobrir a regra somente após tentar salvar.

\---

**# 41. Mensagens de ajuda**

Informações auxiliares deverão ficar próximas ao campo correspondente.

Exemplo:

\`\`\`text

Estoque mínimo

Quantidade em que o sistema começará a avisar que o estoque está baixo.

\`\`\`

Textos de ajuda deverão explicar apenas o necessário.

\---

**# 42. Campos evidentes**

Campos cujo significado já é evidente não precisam receber explicações longas.

Exemplo:

\`\`\`text

Nome do produto

\`\`\`

não precisa de um texto dizendo:

\`\`\`text

Digite o nome do produto.

\`\`\`

Evitar documentação transformada em decoração da interface.

\---

**# 43. Validação de campos**

Quando apropriado:

\- validar ao sair do campo;

\- validar durante digitação quando realmente ajudar;

\- validar novamente no envio;

\- validar novamente no servidor quando necessário.

Não apresentar erro agressivamente antes de o usuário ter oportunidade de preencher.

\---

**# 44. Mensagens de erro em campos**

Quando houver erro:

\- destacar o campo;

\- apresentar mensagem próxima;

\- explicar como corrigir;

\- preservar o valor digitado quando seguro.

Exemplo:

\`\`\`text

E-mail

[davi@]

Informe um endereço de e-mail válido.

\`\`\`

Evitar:

\`\`\`text

Erro inválido.

\`\`\`

\---

**# 45. Erro ao enviar formulário**

Quando houver vários campos inválidos:

\- manter dados válidos;

\- destacar campos incorretos;

\- levar atenção ao primeiro erro quando apropriado;

\- não apagar o formulário.

\---

**# 46. Envio com Enter**

Formulários deverão aceitar *\`Enter\`* para a ação principal quando esperado.

Exemplos:

\- Login;

\- Criar conta;

\- Recuperar senha;

\- Verificar código;

\- busca;

\- formulários simples.

Regras:

\- *\`Enter\`* não executa ação destrutiva sem confirmação;

\- dentro de *\`textarea\`*, *\`Enter\`* cria nova linha;

\- se inválido, apresentar validações;

\- se já estiver em Loading, novo *\`Enter\`* não gera novo envio.

\---

**# 47. Navegação por teclado**

Componentes deverão funcionar por teclado quando aplicável.

Utilizar corretamente:

\`\`\`text

Tab

Shift + Tab

Enter

Espaço

Esc

Setas

\`\`\`

A ordem de foco deverá acompanhar a estrutura lógica da interface.

\---

**# 48. Foco visível**

Todo componente interativo deverá possuir estado de foco claramente visível.

Não remover *\`outline\`* sem substituição equivalente.

O foco deverá possuir contraste adequado em:

\- Tema Claro;

\- Tema Escuro.

\---

**# 49. Foco automático**

Pode ser utilizado quando realmente facilitar a tarefa.

Exemplos:

\- primeiro campo de fluxo simples;

\- próximo dígito de OTP;

\- campo de busca após ação explícita.

Evitar quando:

\- abrir teclado Mobile inesperadamente;

\- causar rolagem indesejada;

\- interromper outro elemento.

\---

**# 50. Campos de senha**

Campos de senha deverão possuir:

\- conteúdo inicialmente oculto;

\- botão Mostrar;

\- botão Ocultar;

\- ícone apropriado;

\- label acessível.

Alterar visibilidade não deverá:

\- apagar o conteúdo;

\- mover foco desnecessariamente;

\- alterar o valor.

\---

**# 51. Requisitos de senha**

Quando os requisitos forem apresentados:

\- atualizar o estado conforme o usuário digita;

\- indicar requisitos atendidos;

\- indicar requisitos ainda pendentes;

\- não depender apenas de verde/vermelho.

As regras exatas pertencem ao Fluxo Técnico.

\---

**# 52. Autocomplete**

Quando apropriado, utilizar atributos equivalentes a:

\`\`\`text

email

current-password

new-password

one-time-code

tel

street-address

postal-code

\`\`\`

Isso melhora a experiência principalmente em dispositivos móveis.

\---

**# 53. Código OTP**

Quando houver código numérico de 6 dígitos, utilizar seis posições visuais.

Exemplo:

\`\`\`text

[ 4 ] [ 8 ] [ 2 ] [ 1 ] [ 7 ] [ 5 ]

\`\`\`

Regras:

\- somente *\`0\`* a *\`9\`*;

\- cada posição representa um dígito;

\- avançar automaticamente;

\- retornar ao apagar quando apropriado;

\- permitir teclado;

\- permitir colagem completa;

\- utilizar teclado numérico no Mobile;

\- permitir preenchimento automático quando suportado.

\---

**# 54. Colagem do OTP**

Exemplo:

\`\`\`text

582941

\`\`\`

Ao colar:

\`\`\`text

[ 5 ] [ 8 ] [ 2 ] [ 9 ] [ 4 ] [ 1 ]

\`\`\`

O código deverá ser distribuído automaticamente pelas posições.

A implementação poderá utilizar:

\- um único input acessível;

\- múltiplos inputs coordenados.

A experiência final é o requisito principal.

\---

**# 55. Seletores Sim/Não**

Quando uma resposta alterar outros campos, a interface deverá reagir imediatamente.

Exemplo:

\`\`\`text

O endereço tem número?

(●) Sim

( ) Não

\`\`\`

Se **\*\*Sim\*\***:

\- exibir Número;

\- indicar obrigatoriedade.

Se **\*\*Não\*\***:

\- ocultar ou desabilitar Número;

\- remover sua obrigatoriedade.

\---

**# 56. Checkbox, Radio e Switch**

Utilizar:

\- checkbox para seleção independente;

\- radio para escolha exclusiva;

\- switch para ativar/desativar um estado.

Exemplos apropriados para switch:

\`\`\`text

Serviço ativo

Exibir na Vitrine


\`\`\`

Não utilizar switch para:

\`\`\`text

Excluir conta

\`\`\`

Essas são ações.

\---

**# 57. Tipo BARBEIRO e ADMIN**

O tipo da conta é uma permissão interna.

Não criar controles editáveis para:

\`\`\`text

BARBEIRO

ADMIN

\`\`\`

na criação de conta ou Perfil/Conta.

Não apresentar:

\`\`\`text

Tipo da conta

[ ADMIN ▼ ]

\`\`\`

como configuração editável.

O cadastro público sempre representa um novo *\`BARBEIRO\`*.

\---

**# 58. Login compartilhado**

Não deverá existir uma interface visual separada de:

\`\`\`text

Login do Administrador

\`\`\`

*\`BARBEIRO\`* e *\`ADMIN\`* utilizam a mesma Tela de Login.

A diferença de destino ocorre depois da autenticação.

Não adicionar à tela:

\- seletor de tipo;

\- botão Entrar como administrador;

\- checkbox Sou administrador.

\---

**# 59. Select e Combobox**

Select simples deverá ser utilizado quando houver poucas opções.

Combobox pesquisável poderá ser utilizado quando:

\- houver muitas opções;

\- busca melhorar significativamente a tarefa.

Não adicionar pesquisa a uma lista com três opções apenas porque a biblioteca oferece esse recurso.

\---

**# 60. Valores monetários**

Exibir no padrão brasileiro:

\`\`\`text

R$ 45,00

\`\`\`

Evitar misturar formatos como:

\`\`\`text

45.00

R$45

45 reais

\`\`\`

na interface final.

\---

**# 61. Inputs monetários**

Campos de dinheiro deverão:

\- possuir formatação compreensível;

\- impedir valores inválidos;

\- aceitar o fluxo de digitação sem comportamento frustrante;

\- funcionar adequadamente em teclado Mobile.

A representação técnica interna pertence à camada de dados.

\---

**# 62. Datas e horários**

Datas:

\`\`\`text

10/09/2026

\`\`\`

Horários:

\`\`\`text

14:30

\`\`\`

Quando necessário:

\`\`\`text

10/09/2026 às 14:30

\`\`\`

\---

**# 63. Horários com dois intervalos**

Quando um dia possuir dois intervalos, representar claramente.

Exemplo:

\`\`\`text

08:00 às 12:00

14:00 às 18:00

\`\`\`

A interface deverá deixar visualmente claro que os dois períodos pertencem ao mesmo dia.

\---

**# 64. Estados dos componentes**

Todo componente que dependa de dados remotos deverá considerar, quando aplicável:

\`\`\`text

Idle

Loading

Success

Empty

Error

Disabled

\`\`\`

Nenhuma tela importante deverá ser projetada somente para o estado ideal.

\---

**# 65. Loading**

Durante carregamento:

\- indicar processamento;

\- evitar valores falsos;

\- evitar piscar conteúdo incorreto;

\- utilizar Skeleton quando adequado;

\- utilizar Spinner em ações pontuais.

Incorreto:

\`\`\`text

Faturamento: R$ 0,00

\`\`\`

quando os dados ainda não chegaram.

Preferir:

\`\`\`text

Faturamento: [skeleton]

\`\`\`

\---

**# 66. Skeleton**

Skeleton deverá:

\- lembrar aproximadamente o conteúdo final;

\- ser discreto;

\- desaparecer quando os dados chegarem;

\- funcionar em Tema Claro e Escuro;

\- respeitar redução de movimento.

Não utilizar Skeleton se um Loading simples resolver melhor.

\---

**# 67. Empty State**

Quando não houver dados, informar:

\- o que está vazio;

\- que a situação é válida;

\- ação disponível quando aplicável.

Exemplo:

\`\`\`text

Nenhum produto cadastrado.

Cadastre seu primeiro produto para começar a controlar o estoque.

[Novo produto]

\`\`\`

Empty State não é erro.

\---

**# 68. Busca sem resultados**

Não confundir coleção vazia com busca sem correspondência.

Exemplo:

\`\`\`text

Nenhum produto encontrado para "pomada azul".

\`\`\`

Isso é diferente de:

\`\`\`text

Nenhum produto cadastrado.

\`\`\`

\---

**# 69. Estado de erro**

Erros deverão:

\- explicar o problema;

\- evitar detalhes técnicos;

\- permitir nova tentativa quando possível;

\- preservar dados quando seguro.

Exemplo:

\`\`\`text

Não foi possível carregar os produtos.

[Tentar novamente]

\`\`\`

\---

**# 70. Sucesso**

Ações concluídas deverão fornecer feedback.

Pode ocorrer através de:

\- alteração visual;

\- mensagem inline;

\- toast;

\- redirecionamento acompanhado de feedback;

\- tela de sucesso quando o momento justificar.

Evitar modal de sucesso para cada alteração pequena.

\---

**# 71. Toasts**

Utilizar para mensagens curtas e não bloqueantes.

Exemplos:

\`\`\`text

Produto salvo com sucesso.

Despesa registrada.

Alterações salvas.

\`\`\`

Erros de campo não devem existir apenas em toast.

\---

**# 72. Confirmações**

Ações com impacto relevante deverão exigir confirmação.

Exemplos:

\- excluir conta;

\- excluir despesa;

\- remover item do Portfólio;

\- despublicar Vitrine quando necessário;

\- ignorar ocorrência quando contexto exigir confirmação;

\- suspender barbearia pelo ADMIN.

O diálogo deverá explicar:

\- ação;

\- consequência;

\- possibilidade de reversão quando relevante.

\---

**# 73. Texto dos botões de confirmação**

Preferir:

\`\`\`text

Voltar

\`\`\`

em vez de:

\`\`\`text

Não

Sim

\`\`\`

Preferir:

\`\`\`text

Continuar editando

Descartar alterações

\`\`\`

em vez de:

\`\`\`text

Cancelar

OK

\`\`\`

O texto deverá dizer o que acontece.

\---

**# 74. Modais**

Utilizar para tarefas:

\- curtas;

\- focadas;

\- dependentes do contexto atual.

Evitar formulários extensos dentro de pequenos modais.

Modais deverão possuir:

\- título;

\- conteúdo objetivo;

\- fechar quando apropriado;

\- ações claras;

\- foco gerenciado;

\- comportamento por teclado;

\- bloqueio adequado da área atrás.

\---

**# 75. Fechamento com Esc**

*\`Esc\`* poderá fechar:

\- popovers;

\- menus;

\- dropdowns;

\- modais não destrutivos.

Se houver informação importante não salva, não descartar silenciosamente.

\---

**# 76. Cards**

Cards deverão agrupar informações relacionadas.

Evitar um card para cada linha.

Cards clicáveis deverão possuir:

\- área de interação clara;

\- hover no Desktop;

\- foco;

\- comportamento apropriado por toque.

\---

**# 77. Metric Cards**

Utilizados principalmente no Dashboard.

Exemplos:

\`\`\`text

Faturamento

R$ 1.250,00

\`\`\`

\`\`\`text

Saídas

R$ 430,00

\`\`\`

\`\`\`text

Resultado estimado

R$ 820,00

\`\`\`

Todos deverão manter:

\- título;

\- valor;

\- contexto quando necessário;

\- hierarquia consistente.

\---

**# 78. Tabelas**

Utilizar quando comparação entre colunas for importante.

Devem prever:

\- cabeçalho;

\- alinhamento consistente;

\- Loading;

\- Empty;

\- erro;

\- ações compreensíveis.

A adaptação Mobile pertence ao:

\`\`\`text

RESPONSIVIDADE.md

\`\`\`

\---

**# 79. Badges e status**

Badges poderão representar estados curtos.

Exemplos:

\`\`\`text

Ativo

Inativo

Concluída

Cancelada

Estoque baixo

Indisponível

Pendente

Paga

Ignorada

Publicado

Despublicado

\`\`\`

Não depender somente de cor.

\---

**# 80. Despesas recorrentes**

A interface deverá distinguir visualmente:

\`\`\`text

Despesa recorrente

\`\`\`

de:

\`\`\`text

Ocorrência mensal

\`\`\`

e de:

\`\`\`text

Despesa efetivamente paga

\`\`\`

Uma ocorrência *\`PENDENTE\`* não deverá aparentar já ter saído do caixa.

\---

**# 81. Status de despesas recorrentes**

Estados:

\`\`\`text

Pendente

Paga

Ignorada

\`\`\`

Deverão ser apresentados de forma consistente.

Exemplo conceitual:

\`\`\`text

Pendente

→ atenção neutra

Paga

→ sucesso

Ignorada

→ estado neutro/secundário

\`\`\`

Texto deverá sempre acompanhar a cor.

\---

**# 82. Marcar como paga**

A ação:

\`\`\`text

Marcar como paga

\`\`\`

deverá possuir destaque suficiente para ser encontrada rapidamente.

O fluxo poderá solicitar:

\- valor realmente pago;

\- data do pagamento.

Após sucesso, o estado deverá mudar claramente para:

\`\`\`text

Paga

\`\`\`

\---

**# 83. Ignorar neste mês**

A ação:

\`\`\`text

Ignorar neste mês

\`\`\`

não deverá possuir aparência de exclusão permanente da recorrência.

O texto deve deixar claro que afeta apenas aquela ocorrência.

\---

**# 84. Controles de quantidade**

Podem utilizar:

\`\`\`text

[-] 2 [+]

\`\`\`

Regras:

\- botões suficientemente grandes;

\- impedir valor inválido;

\- mostrar indisponibilidade quando não puder aumentar;

\- evitar toque acidental em remover.

\---

**# 85. Pesquisa**

Campos de busca deverão:

\- possuir identificação clara;

\- permitir limpar;

\- apresentar estado sem resultado;

\- funcionar com teclado.

Aplicável, por exemplo, a:

\- produtos;

\- serviços;

\- vendas;

\- barbearias no Painel Administrativo.

\---

**# 86. Filtros**

Filtros ativos deverão ser perceptíveis.

O usuário deverá conseguir:

\- aplicar;

\- alterar;

\- limpar.

Não manter filtro invisível e obrigar o usuário a investigar por que seus registros desapareceram misteriosamente.

\---

**# 87. Filtros de período**

Períodos frequentes poderão utilizar:

\`\`\`text

Hoje

Semana

Mês

Ano

Personalizado

\`\`\`

No Mobile, poderão ser adaptados para:

\- chips roláveis;

\- select;

\- outro padrão previsto em Responsividade.

A funcionalidade deverá permanecer igual.

\---

**# 88. Upload de imagem**

O componente deverá apresentar:

\- área selecionável;

\- formatos permitidos quando relevante;

\- prévia;

\- Loading;

\- erro;

\- substituir;

\- remover.

Limites específicos pertencem às regras funcionais correspondentes.

O upload deverá diferenciar visualmente:

\`\`\`text

imagem personalizada enviada pelo usuário

\`\`\`

de:

\`\`\`text

imagem padrão fornecida pelo sistema

\`\`\`

Uma imagem padrão não deverá parecer um arquivo já enviado pelo usuário.

A interface não deverá apresentar ações como:

\- excluir arquivo do sistema;

\- substituir imagem oficial da categoria;

quando o usuário estiver apenas utilizando o fallback padrão.

A ação **Trocar imagem** deverá significar:

\`\`\`text

adicionar ou substituir a imagem personalizada do produto

\`\`\`

e não alterar a imagem padrão da categoria.

\---

**# 88.1 Estados do upload de produto**

Para produtos, prever pelo menos:

\`\`\`text

Sem imagem personalizada

Imagem padrão da categoria em uso

Imagem personalizada em uso

Selecionando nova imagem

Preview local

Enviando

Upload concluído

Erro no upload

\`\`\`

Durante o envio:

\- manter a imagem anterior visível quando apropriado;

\- indicar Loading próximo ao contexto da imagem;

\- impedir múltiplos uploads acidentais;

\- não declarar a troca concluída antes da confirmação real.

Se o upload falhar:

\- preservar a imagem anteriormente válida;

\- informar o erro;

\- permitir nova tentativa.

\---

**# 88.2 Remoção da imagem personalizada do produto**

Quando um produto possuir imagem personalizada e a categoria possuir imagem padrão, a ação **Remover imagem** deverá abrir uma escolha clara.

Exemplo:

\`\`\`text

Remover imagem personalizada

O que deseja exibir depois?

(●) Usar imagem padrão da categoria
( ) Ficar sem imagem

[Cancelar] [Remover imagem]

\`\`\`

As opções representam estados diferentes.

**Usar imagem padrão da categoria**

\- remove a imagem personalizada;

\- passa a apresentar a imagem padrão disponível para a categoria.

**Ficar sem imagem**

\- remove a imagem personalizada;

\- não utiliza o fallback da categoria;

\- apresenta o estado visual sem imagem.

Se a categoria não possuir imagem padrão, não apresentar uma opção que não produzirá efeito.

A remoção da imagem personalizada não deverá apagar ou modificar a imagem oficial da categoria.

\---

**# 88.3 Imagem padrão da categoria**

Categorias sugeridas pelo Estilo e Gestão poderão possuir imagens padrão oficiais.

Exemplos:

\`\`\`text

Bebida
→ imagem genérica relacionada a bebidas

Pomada
→ imagem genérica de pomada

Shampoo
→ imagem genérica de shampoo

Outros
→ imagem neutra e não específica

\`\`\`

Essas imagens funcionam como fallback visual.

Na interface administrativa, quando for útil diferenciar a origem, poderá existir texto discreto como:

\`\`\`text

Imagem padrão da categoria

\`\`\`

Não é necessário exibir essa informação ao visitante da Vitrine.

Categorias personalizadas criadas pelo barbeiro começam sem imagem padrão.

\---

**# 89. Imagens**

Imagens deverão:

\- manter proporção;

\- evitar distorção;

\- possuir alternativa textual quando necessária;

\- utilizar carregamento adequado;

\- evitar mudanças bruscas de layout.

Para cards de produto, definir uma área de imagem consistente para que:

\- produtos com imagem personalizada;

\- produtos com imagem padrão da categoria;

\- produtos sem imagem;

ocupem a mesma estrutura básica sem alterar bruscamente o layout.

Quando não existir imagem efetiva, utilizar um placeholder neutro e claramente diferente de uma fotografia real.

O placeholder poderá utilizar:

\- ícone relacionado a produto;

\- superfície neutra;

\- texto acessível quando necessário.

Não utilizar uma imagem aleatória apenas para preencher espaço.

\---

**# 89.1 Prioridade visual da imagem do produto**

A interface deverá apresentar a imagem efetiva seguindo a regra funcional:

\`\`\`text

1. imagem personalizada do produto

2. imagem padrão da categoria, quando habilitada

3. placeholder / estado sem imagem

\`\`\`

A origem da imagem não deverá alterar:

\- tamanho do card;

\- posição do nome;

\- posição do preço;

\- ações principais;

\- hierarquia visual.

Assim, a lista permanece estável mesmo quando alguns produtos possuem fotos próprias e outros utilizam imagens padrão.

\---

**# 89.2 Product Card com imagem**

O **Product Card** deverá prever os três estados:

\`\`\`text

Imagem personalizada

Imagem padrão da categoria

Sem imagem

\`\`\`

Exemplo conceitual:

\`\`\`text

┌─────────────────────────┐
│        IMAGEM           │
├─────────────────────────┤
│ Pomada Matte            │
│ Pomada                  │
│ R$ 35,00                │
└─────────────────────────┘
\`\`\`

Quando não houver imagem:

\`\`\`text

┌─────────────────────────┐
│     PLACEHOLDER         │
├─────────────────────────┤
│ Pomada Matte            │
│ Pomada                  │
│ R$ 35,00                │
└─────────────────────────┘
\`\`\`

Não alterar toda a composição do card apenas pela ausência de fotografia.

\---

**# 90. Links externos**

Links para:

\- WhatsApp;

\- Instagram;

\- mapas;

deverão parecer claramente interativos.

Quando abrirem nova aba, utilizar implementação segura.

\---

**# 91. Acessibilidade de ícones**

Botões somente com ícone deverão possuir nome acessível.

Exemplo visual:

\`\`\`text

[ícone de lixeira]

\`\`\`

deverá possuir significado programático como:

\`\`\`text

Excluir produto

\`\`\`

\---

**# 92. Contraste**

Texto, controles, bordas importantes e foco deverão possuir contraste adequado.

Validar separadamente:

\- Tema Claro;

\- Tema Escuro.

Não utilizar texto cinza quase invisível em nome do minimalismo. Fazer o usuário decifrar a interface não é sofisticação.

\---

**# 93. Zoom e tamanho do texto**

A interface deverá continuar utilizável quando o usuário aumentar:

\- zoom;

\- tamanho do texto.

Não bloquear zoom.

Elementos deverão evitar altura fixa quando o conteúdo puder crescer.

\---

**# 94. Movimento e animações**

Animações deverão existir apenas quando ajudarem a:

\- indicar mudança;

\- orientar;

\- fornecer feedback.

Evitar animações decorativas em tarefas frequentes.

Respeitar preferência de redução de movimento quando possível.

\---

**# 95. Hover**

Hover poderá melhorar a experiência em dispositivos com cursor.

Nenhuma funcionalidade essencial poderá depender exclusivamente dele.

Sempre deverá existir alternativa por:

\- clique;

\- foco;

\- toque;

\- texto.

\---

**# 96. Cursor**

Elementos clicáveis deverão comunicar interatividade consistentemente.

Não fazer elemento estático parecer botão.

Não fazer botão parecer texto comum.

\---

**# 97. Estado desabilitado**

Quando um controle estiver desabilitado:

\- aparência deve comunicar indisponibilidade;

\- não deve responder;

\- poderá haver explicação quando necessário.

O contraste deverá continuar suficiente para leitura.

\---

**# 98. Preservação de dados**

Em erros recuperáveis, preservar dados já preenchidos.

Exemplos:

\- falha de rede;

\- erro temporário;

\- erro em apenas um campo;

\- falha ao criar Vitrine;

\- falha de upload.

\---

**# 99. Alterações não salvas**

Quando houver risco relevante de perda de conteúdo, poderá existir confirmação.

Exemplo:

\`\`\`text

Descartar alterações?

Você possui alterações que ainda não foram salvas.

[Continuar editando] [Descartar]

\`\`\`

Não aplicar isso a cada formulário minúsculo.

\---

**# 100. Feedback otimista**

Atualizações otimistas poderão ser utilizadas em ações simples e reversíveis.

Operações críticas deverão aguardar resposta real.

Exemplos:

\- finalizar venda;

\- reposição;

\- perda;

\- registrar despesa;

\- marcar recorrência como paga;

\- gerar Vitrine;

\- operações administrativas.

A interface não deverá declarar sucesso antes de ele realmente acontecer.

\---

**# 101. Navegação principal**

A área autenticada do BARBEIRO possui exatamente quatro módulos principais:

```text
Dashboard
PDV
Operação
Configurações
```

Esses quatro destinos formam a navegação principal tanto no Desktop quanto no Mobile.

A conta do usuário é uma área separada da navegação de Configurações.

Não criar como destinos principais independentes:

- Serviços;
- Produtos;
- Estoque;
- Financeiro;
- Relatórios;
- Vitrine Digital;
- Perfil;
- Aparência.

Categorias pertence a Produtos e Portfólio pertence à Vitrine Digital.

---

**# 102. Navegação do BARBEIRO**

Estrutura aprovada:

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

**Sua conta** não é um quinto módulo principal e não pertence ao grupo Configurações.

---

**# 102.1 Sidebar Desktop**

No Desktop, utilizar sidebar recolhível.

A sidebar expandida deverá exibir os quatro módulos principais, seus submenus e a identidade da conta no rodapé.

A sidebar recolhida deverá preservar:

- marca compacta **E&G**;
- ícones dos módulos;
- estado ativo;
- acesso à conta.

Comportamento aprovado da marca no estado recolhido:

```text
estado normal
→ exibir E&G

hover/foco sobre a mesma área
→ substituir E&G pelo ícone de expandir sidebar

saída do hover/foco
→ E&G volta ao mesmo lugar
```

Não exibir E&G e o ícone de expandir lado a lado.

---

**# 102.2 Estado ativo da sidebar**

A sidebar deverá diferenciar:

- módulo principal ativo;
- submenu ativo;
- hover;
- foco;
- estado recolhido/expandido.

Quando **Produtos** estiver ativo, Categorias poderá ser acessada dentro do contexto de Produtos, sem virar um item independente da navegação principal.

---

**# 102.3 Submenu de Operação**

Operação contém somente:

```text
Serviços
Produtos
Estoque
```

Categorias é uma subtela/ação interna de Produtos.

Não adicionar Categorias como item irmão de Estoque na sidebar.

---

**# 102.4 Navegação interna de Configurações**

Configurações possui somente dois grupos:

```text
NEGÓCIO
Financeiro
Relatórios
Vitrine Digital

BARBEARIA
Dados da barbearia
Endereço
Horários
Formas de pagamento
```

Não criar grupo **Pessoal** dentro de Configurações.

Perfil, Aparência, Alterar senha, Minha assinatura e Zona de perigo pertencem à área **Sua conta**.

---

**# 102.5 Bottom Navigation Mobile**

A navegação fixa inferior no Mobile possui exatamente:

```text
Dashboard
PDV
Operação
Configurações
```

Regras:

- respeitar safe area;
- reservar espaço para não cobrir conteúdo;
- possuir item ativo claro;
- manter rótulo e ícone compreensíveis;
- não adicionar quinto item para Conta.

---

**# 102.6 Operação no Mobile**

Operação poderá utilizar lista, tabs, segmented control ou cards para acessar:

- Serviços;
- Produtos;
- Estoque.

Categorias permanece acessível dentro de Produtos.

---

**# 102.7 Configurações no Mobile**

No Mobile, Configurações deverá apresentar seções claras:

```text
Negócio
Barbearia
```

Não duplicar opções pessoais nessa tela.

A conta é acessada pelo cabeçalho ou ponto equivalente definido no shell autenticado.

---

**# 102.8 Menu rápido da conta**

O menu rápido poderá conter:

```text
Minha conta
Aparência
Alterar senha
Sair
```

**Minha conta** abre a área completa **Sua conta**.

Não apresentar **Excluir conta** diretamente no menu rápido. A exclusão pertence a:

```text
Sua conta
→ Zona de perigo
```

---

**# 102.9 Ícones da navegação**

Utilizar a biblioteca de ícones definida pelo projeto.

Ícones sem texto deverão possuir nome acessível.

O significado da navegação não deverá depender somente do desenho do ícone ou da cor.

---

**# 103. Navegação do ADMIN**

O Painel Administrativo deverá possuir navegação própria.

Estrutura conceitual:

\`\`\`text

Dashboard administrativo

Barbearias

Minha conta

\`\`\`

Não copiar automaticamente todas as opções do menu do barbeiro.

\---

**# 104. Identificação da área ADMIN**

O usuário deverá perceber claramente que está no:

\`\`\`text

Painel Administrativo

\`\`\`

Pode ser utilizado:

\- título;

\- contexto na sidebar;

\- identificação textual;

\- estrutura de navegação própria.

Não é necessário criar uma identidade visual completamente diferente.

\---

**# 105. Dados no Painel Administrativo**

A interface do ADMIN deverá apresentar somente informações necessárias às ações permitidas.

Exemplos:

\- nome da barbearia;

\- código da barbearia;

\- plano e validade;

\- situação *\`ATIVA\`* ou *\`SUSPENSA\`*;

\- informações necessárias para suporte;

\- pagamentos de assinatura e histórico administrativo permitido.

Não incluir por padrão:

\- faturamento;

\- despesas;

\- vendas;

\- custos;

\- estoque detalhado;

\- senhas;

\- tokens;

\- segredos.

\---

**# 106. Ações administrativas**

Exemplos aprovados:

\`\`\`text

Confirmar pagamento

Conceder cortesia

Aplicar upgrade

Agendar ou cancelar downgrade

Cancelar renovação

Suspender barbearia

Reativar barbearia

\`\`\`

Ações de maior impacto deverão possuir confirmação apropriada.

Plano e situação da conta devem ser apresentados como conceitos independentes.

A exclusão administrativa não é uma ação comum e não deverá aparecer junto dessas ações.

\---

**# 107. Linguagem**

Utilizar português brasileiro claro e direto.

Preferir:

\`\`\`text

Salvar produto

\`\`\`

a:

\`\`\`text

Efetuar persistência das informações

\`\`\`

Evitar termos técnicos desnecessários na interface.

\---

**# 108. Consistência de termos**

O mesmo conceito deverá possuir o mesmo nome em todo o sistema.

Exemplo:

se o sistema utiliza:

\`\`\`text

Estoque mínimo

\`\`\`

não alternar arbitrariamente para:

\`\`\`text

Quantidade mínima

Limite mínimo

Estoque de alerta

\`\`\`

\---

**# 109. Termos financeiros**

Utilizar consistentemente:

\`\`\`text

Faturamento

Entradas

Saídas

Resultado estimado

\`\`\`

Evitar chamar o indicador gerencial de:

\`\`\`text

Lucro líquido

\`\`\`

quando essa não for a definição funcional.

\---

**# 110. Histórico financeiro**

Em detalhes históricos, preferir textos compreensíveis.

Exemplos:

\`\`\`text

Preço cobrado no momento da venda

\`\`\`

\`\`\`text

Custo do item no momento da venda

\`\`\`

Evitar termos na interface como:

\`\`\`text

preço congelado

custo congelado

snapshot

\`\`\`

Esses termos podem existir em documentação técnica, não precisam perseguir o barbeiro até a tela.

\---

**# 111. Design da autenticação**

Telas de autenticação deverão possuir:

\- foco na tarefa;

\- poucos elementos decorativos;

\- formulário claro;

\- identidade da marca;

\- ações relacionadas acessíveis.

Exemplos:

\- Entrar;

\- Criar conta;

\- Esqueci minha senha;

\- Verificar código;

\- Criar nova senha.

A mesma Tela de Login atende *\`BARBEIRO\`* e *\`ADMIN\`*.

\---

**# 112. Interface do Onboarding**

O Onboarding deverá:

\- mostrar progresso;

\- deixar clara a etapa atual;

\- permitir compreender quanto falta;

\- evitar excesso de informação simultânea;

\- salvar cada etapa conforme regra funcional.

Etapas atuais:

\`\`\`text

1\. Dados da barbearia

2\. Endereço

3\. Horários

4\. Produtos

5\. Serviços

6\. Tema do Sistema

\`\`\`

Não criar uma etapa adicional apenas para repetir dados da Vitrine.

\---

**# 113. Seletor de tema**

A etapa Tema do Sistema deverá apresentar três escolhas claras:

\`\`\`text

Tema Claro

Tema Escuro

Padrão do Sistema

\`\`\`

Pode utilizar:

\- cards selecionáveis;

\- radio cards;

\- outro componente equivalente acessível.

Cada opção deverá possuir:

\- nome;

\- indicação visual;

\- estado selecionado;

\- funcionamento por teclado.

\---

**# 114. Interface do PDV**

O PDV deverá priorizar velocidade.

Elementos principais:

\- busca;

\- serviços;

\- produtos;

\- quantidade de produtos;

\- comanda;

\- total;

\- finalizar venda.

Evitar decoração consumindo espaço da tarefa principal.

\---

**# 115. Serviço no PDV**

Serviço:

\- não possui controle de quantidade;

\- aparece apenas uma vez na comanda.

Não exibir:

\`\`\`text

[-] 2 [+]

\`\`\`

para serviço.

\---

**# 116. Produto no PDV**

Produto poderá possuir controle de quantidade.

Quando o limite de estoque for atingido:

\- botão de aumentar deverá ficar indisponível;

\- estado deverá ser compreensível.

\---

**# 117. Estoque e atualização de quantidade**

A interface de Estoque deverá falar em linguagem compreensível para o barbeiro, sem expor termos técnicos quando eles não ajudarem a tarefa.

Na tela principal, priorizar perguntas simples:

- qual produto é este?;
- quantas unidades existem?;
- qual é o mínimo?;
- precisa repor?;
- onde atualizo?;
- onde vejo o histórico?

A ação principal poderá ser apresentada como:

```text
Atualizar
```

Para produtos que exigem reposição, a ação contextual poderá ser:

```text
Repor
```

Ao abrir o fluxo de atualização, apresentar escolhas claras:

```text
Adicionar estoque
Corrigir contagem
Registrar perda
```

Mapeamento interno:

```text
Adicionar estoque  → REPOSICAO
Corrigir contagem  → AJUSTE
Registrar perda    → PERDA
```

A interface não deverá permitir editar diretamente o valor final do estoque sem registrar uma movimentação.

**Adicionar estoque**

- quantidade positiva;
- custo unitário opcional e apenas informativo;
- mostrar estoque atual e novo estoque;
- não criar despesa financeira automaticamente.

**Corrigir contagem**

- permitir escolher **Entrada (+)** ou **Saída (-)**;
- solicitar a quantidade da diferença;
- mostrar o impacto no estoque;
- impedir estoque negativo.

**Registrar perda**

- solicitar quantidade perdida;
- observação opcional;
- impedir quantidade superior ao estoque disponível;
- não criar nova saída financeira automática.

---

**# 118. Histórico e perda de estoque**

O histórico deverá apresentar movimentações de forma compreensível.

Exemplos de rótulos de interface:

```text
Adição de estoque
Venda
Correção de contagem
Perda
Reversão de venda
```

Quando útil para desenvolvimento, os tipos técnicos podem permanecer internamente como `REPOSICAO`, `VENDA`, `AJUSTE`, `PERDA` e `REVERSAO_VENDA`.

Cor nunca deverá ser o único indicador do tipo ou da situação.

---

**# 119. Ações financeiras**

Valores importantes deverão possuir hierarquia visual clara.

Exemplo:

\`\`\`text

Valor total da reposição

R$ 150,00

\`\`\`

Informações financeiras deverão evitar ambiguidade entre:

\- faturamento;

\- entradas;

\- saídas;

\- despesas;

\- resultado estimado;

\- previsões recorrentes.

\---

**# 120. Dashboard**

O Dashboard deve fornecer visão rápida, não substituir Relatórios.

A hierarquia principal aprovada é:

1. orientação de primeiro acesso, quando realmente aplicável;
2. filtro de período;
3. indicadores financeiros;
4. indicadores operacionais;
5. evolução no período;
6. atalhos de início quando a barbearia ainda estiver começando;
7. situação do estoque com produtos que exigem atenção.

Indicadores financeiros:

- Faturamento;
- Entradas;
- Saídas;
- Resultado estimado.

Indicadores operacionais:

- Serviços realizados;
- Bebidas vendidas;
- Outros produtos vendidos;
- Estoque baixo.

Não adicionar ao Dashboard um bloco permanente de **Detalhamento gerencial** com análises por origem, forma de pagamento ou despesas. Essas análises pertencem a Relatórios.

O primeiro acesso não deverá ser confundido com um período normal sem movimentações.

---

**# 121. Gráfico principal**

A área **Evolução no período** poderá utilizar gráfico adequado para acompanhar a métrica selecionada no intervalo atual.

No estado sem dados, não inventar linha, valores ou receita fictícia.

---

**# 122. Gráficos e interação**

Gráficos deverão:

- funcionar por toque e mouse;
- não depender somente de hover;
- utilizar poucos elementos simultâneos;
- manter textos legíveis;
- apresentar estado vazio e erro.

Análises detalhadas permanecem em Relatórios.

---

**# 123. Estoque baixo**

Além do contador de produtos com estoque baixo, o Dashboard poderá mostrar uma lista curta com os produtos que precisam de atenção.

Exemplo:

```text
Pomada Modeladora
2 un. • mínimo 5

Refrigerante Lata
3 un. • mínimo 6

[Ver estoque]
```

Se não houver produtos cadastrados, não utilizar a mesma mensagem de "nenhum alerta". Diferenciar:

```text
Nenhum produto cadastrado
```

de:

```text
Nenhum produto com estoque baixo
```

---

**# 124. Relatórios**

A interface deverá permitir distinguir claramente:

\- filtros;

\- resumo;

\- indicadores;

\- gráficos;

\- ações de exportação.

\---

**# 125. Exportação de relatórios**

As ações previstas são:

\`\`\`text

Exportar PDF

Exportar PNG

\`\`\`

Podem ser apresentadas:

\- separadamente;

\- em menu de exportação;

\- em botão com opções.

O formato escolhido deverá continuar facilmente identificável.

Durante geração:

\`\`\`text

Gerando PDF...

\`\`\`

ou:

\`\`\`text

Gerando PNG...

\`\`\`

deverá impedir envios duplicados.

\---

**# 126. Vitrine Digital administrativa**

A área administrativa da Vitrine deverá deixar claro:

\- o que está público;

\- o que está oculto;

\- estado de publicação;

\- URL quando já criada;

\- acesso à prévia;

\- configurações públicas.

\---

**# 127. Gerar URL da Vitrine**

Antes da Vitrine existir, a ação principal deverá ser claramente identificada:

\`\`\`text

Gerar URL

\`\`\`

Não solicitar ao usuário que digite manualmente o slug.

\---

**# 128. Aviso de informações opcionais ausentes**

Se existirem dados opcionais ausentes, utilizar aviso ou diálogo.

Exemplo:

\`\`\`text

Algumas informações ainda não foram cadastradas e não serão exibidas na sua Vitrine:

• Instagram

• Logo

• Portfólio

Deseja criar a Vitrine mesmo assim?

\`\`\`

Ações:

\`\`\`text

Voltar e preencher

Continuar

\`\`\`

Isso é um alerta, não um erro.

\---

**# 129. Estado Criando sua Vitrine**

Após continuar:

\`\`\`text

Criando sua Vitrine...

\`\`\`

Texto auxiliar:

\`\`\`text

Estamos preparando seu perfil público.

\`\`\`

Durante esse estado:

\- impedir novo envio;

\- indicar processamento;

\- não apresentar URL fictícia;

\- não permitir criação duplicada.

\---

**# 130. Vitrine criada**

Após sucesso, o estado deverá possuir destaque adequado.

Título:

\`\`\`text

Sua Vitrine está pronta!

\`\`\`

Exibir:

\- URL pública;

\- Copiar URL;

\- Visualizar Vitrine.

Esse momento justifica um estado de sucesso mais destacado do que um toast comum.

\---

**# 131. Falha ao criar Vitrine**

Apresentar mensagem clara.

Exemplo:

\`\`\`text

Não foi possível criar sua Vitrine. Tente novamente.

\`\`\`

Permitir nova tentativa.

Não apagar configurações preenchidas.

\---

**# 132. Vitrine publicada**

Quando já publicada, o estado deverá ser facilmente identificável.

Exemplo:

\`\`\`text

Publicada

\`\`\`

Também deverá existir acesso às ações apropriadas:

\- visualizar;

\- copiar URL;

\- editar;

\- despublicar.

\---

**# 133. Vitrine despublicada**

Quando despublicada:

\- informar estado;

\- não sugerir que os dados foram apagados;

\- permitir publicar novamente.

Exemplo:

\`\`\`text

Despublicada

\`\`\`

\---

**# 134. Interface pública da Vitrine**

A Vitrine poderá ser visualmente mais expressiva que o painel.

Deverá continuar:

\- limpa;

\- rápida;

\- legível;

\- Mobile First;

\- coerente com a marca.

Priorizar:

\- nome;

\- apresentação;

\- serviços;

\- produtos;

\- Portfólio;

\- horários;

\- atendimento a domicílio;

\- localização;

\- contato.

\---

**# 135. Produto sem estoque na Vitrine**

Quando a configuração for:

\`\`\`text

Mostrar como Indisponível

\`\`\`

apresentar indicação clara:

\`\`\`text

Indisponível

\`\`\`

Não mostrar quantidade interna.

Quando configurado para ocultar, o produto simplesmente não aparece publicamente.

\---

**# 136. Dados privados na Vitrine**

Nunca mostrar visualmente:

\- preço de custo;

\- custo estimado do serviço;

\- estoque numérico;

\- estoque mínimo;

\- despesas;

\- faturamento;

\- resultado estimado;

\- dados administrativos;

\- informações da conta.

\---

**# 137. Perfil e Conta**

Perfil, Aparência, Alterar senha, Minha assinatura e Zona de perigo pertencem à área **Sua conta**, separada de Configurações.

A área deverá ser acessível pela identidade do usuário no shell autenticado.

No Desktop, poderá abrir a partir do rodapé da sidebar. No Mobile, a partir do cabeçalho ou acesso equivalente.

A navegação interna poderá utilizar lista ou navegação secundária, mas não deverá duplicar o grupo dentro de Configurações.

---

**# 138. Tipo da conta no Perfil**

Se o tipo da conta for mostrado, deverá ser somente informativo.

Não poderá possuir edição.

Exemplo:

\`\`\`text

Tipo da conta

Barbeiro

\`\`\`

Não utilizar:

\`\`\`text

Tipo da conta

[Barbeiro ▼]

\`\`\`

\---

**# 139. Exclusão da conta**

A exclusão pertence a:

```text
Sua conta
→ Zona de perigo
```

Deverá ficar visualmente separada de ações rotineiras.

Não apresentar **Excluir conta** diretamente no menu rápido do avatar.

A confirmação deverá explicar que a exclusão é imediata e não pode ser desfeita.

O fluxo deverá solicitar:

\- senha atual;

\- frase exata *\`EXCLUIR MINHA CONTA\`*.

O botão final permanece desabilitado até que as duas confirmações sejam válidas.

Também deverá informar que o acesso e a Vitrine terminam imediatamente e que não existe reembolso automático do período restante, salvo direito legal.

---

**# 140. Assistente IA — recurso futuro**

O Assistente IA não faz parte da versão inicial. Componentes, estados de chat e padrões visuais específicos só deverão ser adicionados ao Design System quando o módulo voltar ao escopo.

Consultar `Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md`.

\---

**# 152. Badge de plano**

Criar um componente único para identificar:

\`\`\`text

Grátis

Normal


\`\`\`

O badge não substitui o nome textual do plano e não pode depender somente da cor.

Na área administrativa, não misturar o badge do plano com o estado da conta.

\---

**# 153. Estado da conta**

Representar *\`ATIVA\`* e *\`SUSPENSA\`* em componente próprio, com texto, ícone e cor acessível.

Exemplo de combinação válida:

\`\`\`text

Plano: Normal

Situação: Suspensa

\`\`\`

Não transformar suspensão em nome de plano nem apagar visualmente a informação da assinatura vigente.

\---

**# 154. Painel de recurso bloqueado**

Usar um componente reutilizável com:

\- título do recurso;

\- motivo do bloqueio;

\- benefício disponível no Normal;

\- preço mensal de R$ 49,90;

\- ação para consultar a assinatura;

\- ação de retorno.

Se houver conteúdo de período pago anterior, o painel deve conviver com a visualização em somente leitura, sem esconder os dados preservados.

\---

**# 155. Resumo da assinatura**

O componente de assinatura deverá suportar:

\- plano atual;

\- preço;

\- início e fim da validade;

\- situação da renovação;

\- alteração agendada;

\- aviso de retorno ao Grátis;

\- ação de cancelamento da renovação.

Não usar linguagem que confunda cancelar a renovação com excluir a conta.

\---

**# 156. Confirmação destrutiva reforçada**

Para exclusão da própria conta:

\- usar modal ou página dedicada de alta atenção;

\- exigir senha atual e frase exata;

\- manter a ação final indisponível até validação completa;

\- não selecionar, preencher ou copiar automaticamente a frase de confirmação.

Para a exceção administrativa, exigir justificativa e o código na frase *\`EXCLUIR BAR-XXXXXX\`*.

Suspender e cancelar renovação usam confirmações próprias e não devem ter a mesma aparência de uma exclusão irreversível.

\---

**# 157. Componentes administrativos**

O ADMIN deverá reutilizar:

\- cards de indicadores gerais;

\- campo de busca por nome ou código;

\- filtros por plano e situação;

\- tabela responsiva no Desktop;

\- cards equivalentes no Mobile;

\- linha do tempo de eventos administrativos;

\- painel de pagamentos de assinatura;

\- grupo de ações com confirmações adequadas.

Nenhum desses componentes deve revelar vendas, despesas, custos ou estoque privado.

\---

**# 158. Páginas globais de estado**

Conta suspensa, Manutenção, Offline e 404 usam um layout global consistente:

\- título direto;

\- explicação curta;

\- ilustração ou ícone não essencial;

\- ação primária segura;

\- ação secundária somente quando necessária;

\- foco inicial e leitura acessível;

\- suporte a Tema Claro e Escuro.

Essas páginas não devem exibir sidebar ou bottom navigation quando o conteúdo autenticado estiver indisponível.

Na manutenção, motivo e previsão são opcionais e só aparecem quando cadastrados.

\---

**# 159. Critérios adicionais de conclusão**

Antes de considerar os novos estados aprovados:

\- plano e situação da conta estão visualmente separados;

\- Minha assinatura não se confunde com a Zona de perigo;

\- recurso bloqueado possui versão reutilizável;

\- dados preservados no Grátis podem ser identificados como somente leitura;

\- busca e filtros administrativos possuem estados vazios e de erro;

\- exclusão exige confirmação reforçada;

\- suspensão deixa claro que os dados foram preservados;

\- Manutenção, Offline e 404 não reutilizam mensagens incorretas entre si;

\- todos os componentes funcionam em Desktop, Mobile, Tema Claro e Tema Escuro.

\---
