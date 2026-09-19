**# Responsividade - Estilo e Gestão**

**## Objetivo**

Este documento define como a interface do **\*\*Estilo e Gestão\*\*** deverá se adaptar a celulares, tablets, notebooks e computadores.

O sistema seguirá abordagem **\*\*Mobile First\*\***.

Este arquivo trata principalmente da adaptação da interface ao:

\- espaço disponível;

\- tipo de interação;

\- características do dispositivo;

\- teclado virtual;

\- orientação;

\- tamanho do conteúdo.

Cores, componentes, estados globais e padrões de interação pertencem ao:

\`\`\`text

DESIGN\_SYSTEM.md

\`\`\`

Os valores cromáticos pertencem ao:

\`\`\`text

ESQUEMA\_DE\_CORES.md

\`\`\`

Regras funcionais específicas pertencem ao documento de Fluxos.

\---

**# 1. Princípio principal**

A interface deverá funcionar adequadamente em diferentes tamanhos de tela sem criar aplicações independentes.

A mesma funcionalidade deverá existir em:

\`\`\`text

Mobile

Tablet

Desktop

\`\`\`

O layout poderá mudar.

A regra de negócio não.

\---

**# 2. Mobile First**

O CSS e os componentes deverão partir do menor layout suportado e evoluir progressivamente.

Conceito:

\`\`\`text

Mobile

  ↓

Tablet

  ↓

Notebook

  ↓

Desktop

\`\`\`

Isso é especialmente importante porque o barbeiro poderá operar o sistema pelo celular durante o atendimento.

\---

**# 3. Dispositivos alvo**

Considerar:

\- celulares pequenos;

\- celulares grandes;

\- tablets;

\- notebooks;

\- monitores Desktop.

Não desenvolver somente observando a resolução do computador utilizado pelo desenvolvedor.

\---

**# 4. Breakpoints**

Os breakpoints deverão seguir preferencialmente os padrões disponíveis no Tailwind CSS adotado pelo projeto.

Referência conceitual:

\`\`\`text

Mobile

< 640px

Small

≥ 640px

Medium

≥ 768px

Large

≥ 1024px

Extra Large

≥ 1280px

\`\`\`

Não criar dezenas de breakpoints específicos sem necessidade.

\---

**# 5. Breakpoint não representa dispositivo**

Evitar interpretar:

\`\`\`text

768px = tablet

\`\`\`

como uma regra absoluta.

O breakpoint representa espaço disponível.

A interface deverá responder ao espaço, não ao nome comercial do aparelho.

\---

**# 6. Largura mínima**

A aplicação deverá permanecer utilizável em aproximadamente:

\`\`\`text

320px

\`\`\`

Não depender de largura mínima maior sem motivo técnico real.

\---

**# 7. Conteúdo principal**

Em telas grandes, o conteúdo não deverá crescer indefinidamente.

Formulários e páginas textuais deverão possuir largura confortável.

Dashboard, PDV e algumas áreas administrativas poderão utilizar maior espaço horizontal quando isso melhorar a tarefa.

\---

**# 8. Padding lateral**

Mobile deverá possuir espaçamento suficiente para impedir conteúdo colado às bordas.

Os valores deverão seguir o Design System.

O padding poderá aumentar progressivamente em telas maiores.

\---

**# 9. Navegação do BARBEIRO no Mobile**

A navegação principal do barbeiro no Mobile deverá utilizar uma **barra inferior fixa** com quatro áreas principais:

\`\`\`text

Dashboard

PDV

Operação

Configurações
\`\`\`

A barra inferior deverá permanecer disponível nas telas principais da área autenticada, exceto quando uma tela específica exigir foco total ou fluxo modal/tela cheia.

Estrutura conceitual:

\`\`\`text

┌─────────────────────────────┐
│ Conteúdo da tela            │
│                             │
│                             │
├─────────────────────────────┤
│ Dashboard | PDV | Operação  │
│          | Configurações    │
└─────────────────────────────┘
\`\`\`

Cada item deverá possuir:

\- ícone;

\- rótulo;

\- estado ativo;

\- área adequada para toque;

\- nome acessível completo.

A navegação não deverá depender de menu hambúrguer para acessar as quatro áreas principais.

O objetivo é permitir troca rápida entre os módulos usados no dia a dia sem ocupar espaço vertical excessivo.

\---

**# 10. Barra inferior**

A barra inferior do BARBEIRO deverá conter somente:

\`\`\`text

Dashboard

PDV

Operação

Configurações
\`\`\`

Não adicionar itens independentes para:

\`\`\`text

Serviços

Produtos

Estoque

Financeiro

Relatórios

Vitrine

Conta
\`\`\`

Essas áreas pertencem aos agrupamentos definidos na navegação principal.

A barra inferior deverá:

\- respeitar safe areas;

\- não esconder o conteúdo final da página;

\- manter o item ativo claramente identificado;

\- funcionar em Tema Claro e Escuro;

\- funcionar a partir de aproximadamente 320px;

\- não depender somente de cor para indicar seleção.

Em telas muito estreitas, o rótulo visual poderá utilizar solução abreviada apenas se necessário, mantendo o nome acessível completo.

O conteúdo da página deverá reservar espaço inferior suficiente para não ficar coberto pela navegação fixa.

\---

**# 11. Navegação do BARBEIRO no Desktop**

No Desktop, utilizar sidebar recolhível com quatro áreas principais:

```text
Dashboard
PDV
Operação
Configurações
```

Estrutura expandida:

```text
Estilo e Gestão

Dashboard

PDV
  ├── Nova venda
  └── Histórico de vendas

Operação
  ├── Serviços
  ├── Produtos
  └── Estoque

Configurações
  ├── Negócio
  │   ├── Financeiro
  │   ├── Relatórios
  │   └── Vitrine Digital
  └── Barbearia
      ├── Dados da barbearia
      ├── Endereço
      ├── Horários
      └── Formas de pagamento

[Conta do usuário]
```

Categorias é acessada dentro de Produtos. Portfólio fica dentro da Vitrine Digital.

Perfil, Aparência, Alterar senha, Minha assinatura e Zona de perigo ficam em **Sua conta**, acessada pela identidade do usuário, e não dentro de Configurações.

---

**# 12. Sidebar recolhível**

A sidebar deverá possuir pelo menos dois estados:

\`\`\`text

Expandida

Recolhida
\`\`\`

**## Expandida**

Pode apresentar:

\- logo;

\- ícones;

\- nomes dos módulos;

\- submenus;

\- conta do usuário.

**## Recolhida**

Deverá priorizar:

\- logo compacta;

\- ícones dos quatro módulos principais;

\- indicador do item ativo;

\- acesso à conta.

Exemplo:

\`\`\`text

Desktop largo
→ sidebar expandida

Notebook menor
→ sidebar recolhida ou compacta

Mobile
→ barra inferior
\`\`\`

No estado recolhido, informações essenciais não deverão depender apenas de tooltip.

Tooltips poderão complementar os ícones no Desktop, mas a navegação deverá continuar compreensível e acessível por teclado.

O estado recolhido não deverá alterar as permissões ou a estrutura funcional da aplicação.

\---

**# 12.1 Agrupamento Operação**

O módulo:

\`\`\`text

Operação
\`\`\`

agrupa:

\`\`\`text

Serviços

Produtos

Estoque
\`\`\`

No Desktop, poderá abrir como submenu dentro da sidebar.

No Mobile, poderá abrir uma tela própria com navegação interna.

Opções adequadas:

\- tabs;

\- segmented control;

\- lista de atalhos;

\- cards compactos.

A escolha visual deverá ser validada no protótipo.

Evitar criar três novos itens independentes na barra inferior.

\---

**# 12.2 Agrupamento Configurações**

Configurações agrupa somente:

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

O Portfólio pertence à Vitrine Digital.

Não criar seção **Pessoal** dentro de Configurações.

No Mobile, Configurações deverá preferir lista por seções. No Desktop, poderá utilizar submenu ou navegação secundária.

---

**# 12.3 Menu rápido e Sua conta**

O avatar ou identidade do usuário poderá abrir:

```text
Minha conta
Aparência
Alterar senha
Sair
```

**Minha conta** abre a área completa **Sua conta**:

```text
Perfil
Aparência
Alterar senha
Minha assinatura
Zona de perigo
```

No Mobile, o acesso à conta poderá ficar no cabeçalho. Não adicionar um quinto item na barra inferior.

Excluir conta não aparece diretamente no menu rápido.

---

**# 13. Navegação do ADMIN**

O Painel Administrativo utiliza navegação própria.

Estrutura conceitual:

\`\`\`text

Dashboard administrativo

Barbearias

Minha conta

\`\`\`

Não utilizar automaticamente a navegação completa do barbeiro.

\---

**# 14. ADMIN no Mobile**

Em Mobile, o Painel Administrativo deverá continuar totalmente utilizável.

Pode utilizar:

\- menu temporário;

\- cabeçalho compacto;

\- navegação inferior somente se realmente fizer sentido.

A condição de *\`ADMIN\`* não pressupõe utilização apenas em computador.

\---

**# 15. Cabeçalho**

O cabeçalho deverá adaptar:

\- título;

\- ações;

\- filtros;

\- conta;

\- contexto da tela.

No Mobile, ações secundárias poderão migrar para menu.

O cabeçalho poderá apresentar avatar ou acesso à conta no canto superior quando isso não competir com a ação principal.

A principal deverá continuar fácil de encontrar.

O cabeçalho não deverá duplicar desnecessariamente os quatro destinos já presentes na barra inferior.

\---

**# 16. Botões**

No Mobile:

\- área adequada para toque;

\- texto legível;

\- evitar muitos botões pequenos lado a lado.

Referência mínima:

\`\`\`text

44px × 44px

\`\`\`

Quando adequado, o botão principal poderá ocupar toda a largura.

\---

**# 17. Botões lado a lado**

Em Desktop:

\`\`\`text

[Cancelar] [Salvar]

\`\`\`

pode funcionar bem.

Em celular estreito:

\`\`\`text

[Salvar              ]

[Cancelar            ]

\`\`\`

pode ser mais confortável.

A escolha depende:

\- da largura;

\- do tamanho do texto;

\- da importância;

\- do risco de toque acidental.

\---

**# 18. Formulários**

Mobile:

\`\`\`text

uma coluna por padrão

\`\`\`

Desktop poderá agrupar campos relacionados.

Exemplo:

\`\`\`text

Cidade               Estado

\`\`\`

ou:

\`\`\`text

Preço de custo       Preço de venda

\`\`\`

Não criar colunas apenas para preencher espaço.

\---

**# 19. Labels**

Labels deverão permanecer visíveis em qualquer tamanho.

Placeholder não substitui label.

\---

**# 20. Campos obrigatórios e mensagens**

Indicadores de obrigatoriedade e mensagens deverão permanecer legíveis.

Textos longos deverão quebrar linha naturalmente.

Não permitir overflow horizontal provocado por mensagem de erro.

\---

**# 21. Teclado virtual**

Inputs Mobile deverão utilizar teclado adequado ao conteúdo quando possível.

Exemplos:

\`\`\`text

email

tel

number

decimal

one-time-code

\`\`\`

A interface deverá considerar o espaço ocupado pelo teclado.

\---

**# 22. Teclado não pode esconder a ação**

Com teclado aberto:

\- campo ativo deverá continuar visível;

\- mensagem relacionada deverá permanecer acessível;

\- ação principal deverá poder ser alcançada;

\- a página deverá permitir scroll quando necessário.

\---

**# 23. Altura dinâmica do viewport**

Evitar depender somente de:

\`\`\`css

height: 100vh;

\`\`\`

quando barras do navegador ou teclado causarem problemas.

Quando apropriado, considerar:

\`\`\`css

100dvh

\`\`\`

ou estratégia equivalente.

Testar em aparelhos reais.

\---

**# 24. Safe Areas**

Considerar áreas reservadas por:

\- notch;

\- câmera;

\- barra de gestos;

\- interface do sistema operacional.

Especialmente em:

\- navegação inferior;

\- botões fixos;

\- chat;

\- bottom sheets.

\---

**# 25. Modais no Mobile**

Confirmações pequenas podem continuar centralizadas.

Formulários maiores deverão preferir:

\- página dedicada;

\- tela cheia;

\- drawer;

\- bottom sheet adequado.

Evitar formulários gigantes presos dentro de pequenos modais.

\---

**# 26. Bottom Sheet**

Pode ser apropriado para:

\- comanda;

\- filtros;

\- seletores;

\- pequenas ações.

Deverá:

\- poder ser fechado;

\- permitir scroll;

\- respeitar safe areas;

\- considerar teclado virtual.

\---

**# 27. Tabelas**

Tabelas são mais apropriadas onde existir espaço horizontal.

No Mobile, tabelas largas deverão ser adaptadas.

Não reduzir tudo até o texto se tornar ilegível.

\---

**# 28. Alternativa para tabelas**

Desktop:

\`\`\`text

Data | Produto | Tipo | Quantidade | Saldo

\`\`\`

Mobile:

\`\`\`text

Coca-Cola

Venda

08/09/2026 • 18:30

-2 unidades

Saldo: 8

\`\`\`

Cards e listas poderão substituir tabelas.

\---

**# 29. Scroll horizontal**

Pode ser utilizado excepcionalmente quando a informação exigir estrutura tabular.

Não deverá ser solução padrão para todas as telas.

\---

**# 30. Conteúdo longo**

Nomes, e-mails, descrições e URLs não deverão quebrar o layout.

Quando necessário:

\- quebrar linha;

\- truncar visualmente;

\- permitir acesso ao conteúdo completo.

Não esconder informação essencial sem alternativa.

\---

**# 31. Tema Claro e Escuro**

Responsividade deverá funcionar igualmente em:

\`\`\`text

Tema Claro

Tema Escuro

\`\`\`

Mudança de tema não deverá alterar:

\- largura;

\- altura estrutural;

\- ordem dos elementos;

\- disponibilidade das ações.

\---

**# 32. Padrão do Sistema**

Quando o usuário utilizar:

\`\`\`text

Padrão do Sistema

\`\`\`

a interface poderá mudar entre Tema Claro e Escuro sem quebrar o layout.

Componentes deverão possuir espaço adequado para ambos os estados visuais.

\---

**# 33. Dashboard Mobile**

Prioridade recomendada:

\`\`\`text

1\. indicadores principais

2\. alertas

3\. resumo

4\. gráficos

5\. detalhamentos

\`\`\`

Cards deverão ser empilhados ou utilizar grid adequado.

O conteúdo deverá reservar espaço para a barra inferior fixa.

A Dashboard não deverá criar navegação paralela para módulos que já estão disponíveis na barra principal.

\---

**# 34. Dashboard Desktop**

Pode utilizar:

\- grid;

\- indicadores lado a lado;

\- gráficos maiores;

\- informações resumidas.

Maior largura deve melhorar leitura, não simplesmente adicionar conteúdo.

\---

**# 35. Cards de indicadores**

Mobile:

\`\`\`text

1 ou 2 por linha

\`\`\`

conforme largura e conteúdo.

Desktop:

\`\`\`text

3 ou 4 por linha

\`\`\`

quando houver espaço.

Testar também valores financeiros grandes.

\---

**# 36. Valores grandes**

Exemplo:

\`\`\`text

R$ 123.456,78

\`\`\`

não deverá:

\- sair do card;

\- quebrar em posições absurdas;

\- sobrepor outro conteúdo.

Se necessário, adaptar:

\- tamanho do texto;

\- grid;

\- quantidade de colunas.

\---

**# 37. Filtros do Dashboard**

Filtros como:

\`\`\`text

Hoje

Semana

Mês

Ano

Personalizado

\`\`\`

deverão ser acessíveis no Mobile.

Podem utilizar:

\- chips com scroll controlado;

\- select;

\- outro padrão adequado.

\---

**# 38. Gráficos**

Gráficos deverão:

\- redimensionar;

\- preservar labels;

\- evitar muitas informações simultâneas;

\- funcionar com toque.

Quando um gráfico ficar inadequado no Mobile, considerar:

\- resumo;

\- lista;

\- simplificação visual.

\---

**# 39. PDV Mobile**

O PDV é uma das telas de maior prioridade.

Deverá priorizar:

\- busca;

\- catálogo;

\- comanda;

\- total;

\- finalizar venda.

\---

**# 40. Estrutura possível do PDV Mobile**

\`\`\`text

[Busca]

[Serviços] [Produtos]

Cards

\--------------------

[Comanda • 3 itens]

[Total R$ 55,00]

[Finalizar venda]

\`\`\`

A comanda poderá abrir como:

\- bottom sheet;

\- página;

\- painel expansível.

A decisão final será validada no Stitch.

\---

**# 41. Total no PDV Mobile**

O total deverá permanecer fácil de encontrar.

O barbeiro não deverá precisar retornar ao início da página para descobrir o valor.

\---

**# 42. PDV Desktop**

Poderá utilizar duas áreas simultâneas:

\`\`\`text

Catálogo               Comanda

────────────            ────────────

Serviços                Item 1

Produtos                Item 2

Busca                    Total

                         Finalizar

\`\`\`

\---

**# 43. Comanda extensa**

Quando houver muitos itens:

\- lista deverá poder rolar;

\- total deverá continuar acessível;

\- botão Finalizar deverá permanecer disponível;

\- últimos itens não poderão ficar escondidos atrás de área fixa.

\---

**# 44. Serviço no PDV**

Serviço não possui quantidade.

No Mobile e Desktop, não criar:

\`\`\`text

[-] 2 [+]

\`\`\`

para serviços.

\---

**# 45. Produto no PDV**

Produtos podem possuir quantidade.

Controles:

\`\`\`text

[-] 2 [+]

\`\`\`

deverão possuir área adequada para toque.

Ao atingir estoque disponível, aumentar deverá ficar indisponível.

\---

**# 46. Histórico de vendas**

Mobile poderá utilizar cards:

\`\`\`text

08/09/2026 • 18:30

R$ 55,00

Pix

Concluída

\`\`\`

Desktop poderá utilizar tabela.

\---

**# 47. Detalhes da venda**

No Mobile:

\- organizar informações em blocos;

\- evitar tabela horizontal grande;

\- manter total visível;

\- separar dados gerais dos itens.

No Desktop, informações poderão ficar lado a lado quando apropriado.

\---

**# 48. Vendas canceladas no Histórico**

O layout deve conseguir representar o status **Cancelada** de forma legível em Mobile e Desktop.

O protótipo atual não precisa apresentar uma ação de cancelamento/estorno. Caso essa ação seja aprovada futuramente, sua confirmação deverá respeitar as regras de ações destrutivas.

---

**# 49. Serviços**

Serviços pertence ao módulo **Operação**.

Mobile:

\- lista ou cards;

\- nome;

\- preço;

\- status;

\- ação acessível.

Desktop:

\- lista ou tabela;

\- ações agrupadas.

\---

**# 50. Produtos**

Produtos pertence ao módulo **Operação**.

Mobile deverá priorizar:

\- nome;

\- categoria;

\- preço;

\- estoque;

\- status.

Informações secundárias poderão ficar no detalhe.

\---

**# 51. Categorias de produtos**

A lista deverá continuar utilizável em telas pequenas.

A criação de nova categoria poderá usar:

\- modal simples;

\- drawer;

\- área inline;

conforme solução validada.

\---

**# 52. Estoque**

Estoque pertence ao módulo **Operação**.

No Mobile, priorizar:

- imagem do produto quando disponível;
- nome;
- estoque atual;
- estoque mínimo;
- situação;
- ação clara.

Evitar expor muitas colunas técnicas ao mesmo tempo.

Exemplo:

```text
Pomada Modeladora
Produto • Pomada

Estoque atual: 2 un.
Mínimo: 5 un.
Precisa repor

[Repor]
```

Produto regular pode utilizar **Atualizar** como ação principal.

O card/linha do produto também pode ser clicável para abrir detalhes.

---

**# 53. Histórico de estoque**

Desktop poderá usar tabela ou lista estruturada.

Mobile deverá usar cards/lista compacta com:

- produto;
- tipo da movimentação;
- quantidade;
- data e horário;
- saldo quando útil.

A ação **Ver histórico** é secundária em relação à atualização do estoque.

---

**# 54. Adicionar estoque**

No Mobile, o drawer/bottom sheet deverá apresentar:

```text
Produto selecionado
O que aconteceu?
[Adicionar estoque] [Corrigir contagem] [Registrar perda]

Quantidade a adicionar
Custo unitário (opcional)
Observação (opcional)

Estoque atual → Novo estoque

[Registrar movimentação]
```

O custo é apenas informativo quando preenchido. Não mostrar mensagem de criação automática de despesa no Financeiro.

---

**# 55. Corrigir contagem**

No Mobile, mostrar:

- estoque atual;
- Entrada (+) ou Saída (-);
- quantidade da diferença;
- observação opcional;
- novo estoque calculado.

Não solicitar que o usuário digite diretamente o novo saldo final como forma de burlar o histórico de movimentações.

---

**# 56. Registrar perda**

No Mobile, mostrar:

```text
Produto
Quantidade perdida
Observação (opcional)
Resumo do impacto
[Registrar movimentação]
```

Impedir quantidade superior ao estoque disponível e não permitir saldo negativo.

---

**# 57. Financeiro**

Financeiro pertence ao módulo **Configurações**, grupo **Negócio**.

Filtros de período deverão se adaptar.

Desktop:

\`\`\`text

[Hoje] [Semana] [Mês] [Ano] [Personalizado]

\`\`\`

Mobile:

\`\`\`text

[Período ▼]

\`\`\`

ou chips adequados.

\---

**# 58. Período personalizado**

Desktop:

\`\`\`text

Data inicial | Data final | Aplicar

\`\`\`

Mobile:

\`\`\`text

Data inicial

Data final

[Aplicar]

\`\`\`

\---

**# 59. Despesas**

No Mobile, cada despesa poderá ser apresentada como card ou item de lista.

Priorizar:

\- nome;

\- categoria;

\- valor;

\- data;

\- origem quando necessário.

\---

**# 60. Despesas recorrentes**

No Mobile, evitar tabelas largas.

Cada recorrência poderá apresentar:

\`\`\`text

Internet

R$ 100,00 previstos

Vence dia 10

Ativa

[Ver detalhes]

\`\`\`

\---

**# 61. Ocorrências recorrentes**

No Mobile, uma ocorrência poderá utilizar:

\`\`\`text

Internet

Outubro/2026

Vencimento: 10/10/2026

R$ 100,00

Pendente

\`\`\`

Ações deverão ficar acessíveis sem depender de hover.

\---

**# 62. Marcar como paga**

Em telas pequenas, o formulário ou modal deverá mostrar claramente:

\- valor previsto;

\- valor efetivamente pago;

\- data de pagamento;

\- ação Confirmar.

Não comprimir campos monetários e datas na mesma linha se não houver espaço.

\---

**# 63. Ignorar neste mês**

A confirmação deverá deixar claro que:

\`\`\`text

somente esta ocorrência

\`\`\`

será ignorada.

Não utilizar layout que faça parecer que toda a recorrência será excluída.

\---

**# 64. Detalhes da recorrência**

Mobile deverá poder exibir sequencialmente:

\`\`\`text

Configuração

Próxima ocorrência

Histórico

Ações

\`\`\`

Desktop poderá aproveitar duas colunas quando isso melhorar a leitura.

\---

**# 65. Relatórios**

Relatórios pertence ao módulo **Configurações**, grupo **Negócio**.

No Mobile, priorizar:

\`\`\`text

Período

Indicadores principais

Resumo

Gráficos

Exportação

\`\`\`

Não tentar reproduzir a mesma distribuição ampla do Desktop.

\---

**# 66. Exportação PDF e PNG**

As ações:

\`\`\`text

Exportar PDF

Exportar PNG

\`\`\`

deverão permanecer fáceis de encontrar.

No Desktop podem ficar lado a lado.

No Mobile podem:

\- ocupar largura total;

\- existir em menu de exportação;

\- empilhar quando necessário.

\---

**# 67. Estado de geração de relatório**

Durante exportação:

\`\`\`text

Gerando PDF...

\`\`\`

ou:

\`\`\`text

Gerando PNG...

\`\`\`

deverá permanecer legível e não alterar bruscamente o layout.

\---

**# 68. Vitrine Administrativa**

A Vitrine Digital pertence ao módulo **Configurações**, grupo **Negócio**.

Desktop poderá utilizar:

\`\`\`text

Configuração | Prévia

\`\`\`

lado a lado quando houver espaço.

Mobile deverá priorizar edição por blocos.

\---

**# 69. Formulário da Vitrine**

Pode ser separado em seções como:

\- Identidade;

\- Sobre;

\- Contato;

\- Endereço;

\- Horários;

\- Serviços;

\- Produtos;

\- Portfólio;

\- Assistente IA.

Evitar formulário visualmente interminável.

\---

**# 70. Prévia da Vitrine**

No Mobile poderá abrir em:

\- página própria;

\- tela cheia;

\- nova aba;

\- solução equivalente.

Não comprimir simultaneamente editor e prévia em metade de um celular.

\---

**# 71. Gerar URL**

A ação:

\`\`\`text

Gerar URL

\`\`\`

deverá continuar facilmente acessível no Mobile.

Não permitir que ela fique escondida após formulário muito longo sem alternativa de navegação adequada.

\---

**# 72. Informações opcionais ausentes**

O aviso deverá funcionar em telas estreitas.

Exemplo:

\`\`\`text

Algumas informações ainda não foram cadastradas e não serão exibidas:

• Instagram

• Logo

• Portfólio

\`\`\`

Botões:

\`\`\`text

Voltar e preencher

Continuar

\`\`\`

podem ser empilhados no Mobile.

\---

**# 73. Criando sua Vitrine**

O estado:

\`\`\`text

Criando sua Vitrine...

\`\`\`

deverá:

\- permanecer centralizado ou claramente associado à ação;

\- impedir envio duplicado;

\- funcionar em telas pequenas;

\- não apresentar URL prematuramente.

\---

**# 74. Vitrine criada**

No Mobile:

\`\`\`text

Sua Vitrine está pronta!

estiloegestao.com/...

[Copiar URL]

[Visualizar Vitrine]

\`\`\`

A URL deverá quebrar ou truncar adequadamente.

Não causar overflow horizontal.

\---

**# 75. URL longa**

URLs públicas deverão suportar:

\- quebra;

\- truncamento;

\- botão Copiar.

A URL não deverá empurrar outros elementos para fora da tela.

\---

**# 76. Despublicar Vitrine**

A confirmação deverá continuar compreensível no Mobile.

O texto deverá indicar que:

\- dados permanecem;

\- acesso público é interrompido;

\- URL permanece associada.

\---

**# 77. Portfólio Administrativo**

O Portfólio pertence à área **Vitrine Digital** e não é um módulo principal independente.

Mobile:

\- grid com poucas colunas;

\- cards grandes o suficiente para toque.

Desktop:

\- grid com maior quantidade de colunas.

A proporção das imagens deverá permanecer consistente.

\---

**# 78. Upload de Portfólio**

No Mobile:

\- selecionar imagem;

\- visualizar prévia;

\- adicionar descrição;

\- relacionar serviço quando aplicável;

\- publicar.

A interface deverá considerar teclado e preview simultaneamente.

\---

**# 79. Configurações da Barbearia**

As Configurações da Barbearia pertencem a:

\`\`\`text

Configurações
→ Barbearia
\`\`\`

Agrupar:

\`\`\`text

Dados da barbearia

Endereço

Horários

Formas de pagamento
\`\`\`

No Mobile, organizar como lista de seções ou páginas internas.

Evitar uma única página com dezenas de campos sem agrupamento.

No Desktop, poderá utilizar navegação secundária para alternar entre essas áreas.

\---

**# 80. Perfil e Conta**

A área **Sua conta** é separada de Configurações.

Inclui:

```text
Perfil
Aparência
Alterar senha
Minha assinatura
Zona de perigo
```

Mobile:

- acesso pelo cabeçalho ou menu da conta;
- opções em lista/blocos verticais;
- sem quinto item na barra inferior.

Desktop:

- acesso pelo rodapé da sidebar/menu da conta;
- navegação secundária quando necessário.

---

**# 81. Exclusão da conta**

A área destrutiva pertence a:

```text
Sua conta
→ Zona de perigo
```

No Mobile, manter visualmente separada de ações rotineiras.

Não apresentar Excluir conta diretamente no menu rápido.

---

**# 82. Tela de Login**

Mobile:

\- formulário com largura disponível;

\- padding adequado;

\- ação Entrar acessível;

\- links relacionados visíveis.

Desktop:

\- formulário com largura máxima;

\- posição centralizada ou composição equivalente.

\---

**# 83. Login do ADMIN**

Não existe tela responsiva separada de Login para ADMIN.

A mesma Tela de Login atende:

\`\`\`text

BARBEIRO

ADMIN

\`\`\`

O redirecionamento ocorre após autenticação.

\---

**# 84. Criar Conta**

Mobile deverá utilizar uma coluna.

Não adicionar seletor:

\`\`\`text

BARBEIRO / ADMIN

\`\`\`

O cadastro público representa BARBEIRO.

\---

**# 85. Confirmação de e-mail**

A tela de confirmação por código deverá seguir os mesmos princípios responsivos da verificação OTP.

O código possui 6 posições visuais.

\---

**# 86. Recuperação de senha**

As telas de:

\`\`\`text

Solicitar recuperação

Verificar código

Criar nova senha

\`\`\`

deverão continuar utilizáveis com teclado Mobile aberto.

\---

**# 87. Tela OTP**

Os seis campos visuais deverão caber em:

\`\`\`text

320px

\`\`\`

sem overflow horizontal.

O espaçamento poderá diminuir, sem prejudicar toque e leitura.

\---

**# 88. OTP e teclado**

No Mobile:

\- abrir teclado numérico quando possível;

\- campo ativo permanecer visível;

\- botão de verificação continuar alcançável;

\- reenvio permanecer legível.

\---

**# 89. Reenvio do código**

Textos como:

\`\`\`text

Reenviar código em 00:42

\`\`\`

deverão funcionar em telas estreitas.

Evitar combinações rígidas de botão e cronômetro que quebrem o layout.

\---

**# 90. Campo de senha**

Mostrar/Ocultar deverá possuir área de toque adequada.

O botão não deverá reduzir excessivamente a área destinada à senha.

\---

**# 91. Onboarding**

O Onboarding possui 6 etapas:

\`\`\`text

1. Dados da barbearia

2. Endereço

3. Horários de funcionamento

4. Serviços

5. Produtos e formas de pagamento

6. Aparência e conclusão
\`\`\`

O indicador de progresso deverá funcionar no Mobile sem exigir seis textos completos lado a lado.

A navegação principal autenticada com Dashboard, PDV, Operação e Configurações somente passa a ser o fluxo normal depois da conclusão válida do Onboarding.

\---

**# 92. Progresso do Onboarding**

No Mobile poderá utilizar:

\`\`\`text

Etapa 3 de 6

\`\`\`

com barra de progresso ou indicação equivalente.

No Desktop poderá existir visualização mais ampla.

\---

**# 93. Endereço**

Mobile:

\`\`\`text

CEP

Logradouro

Tem número?

Número

Complemento

Bairro

Cidade

Estado

\`\`\`

Desktop poderá agrupar campos relacionados sem alterar a ordem lógica.

\---

**# 94. Campo condicional Número**

Quando:

\`\`\`text

Tem número? → Não

\`\`\`

o campo Número deverá desaparecer ou ficar indisponível conforme a regra visual.

O layout deverá se reorganizar sem deixar espaço vazio permanente.

\---

**# 95. Horários no Onboarding**

Cada dia poderá possuir até dois intervalos.

Mobile deverá evitar uma linha enorme como:

\`\`\`text

Segunda | 08:00 | 12:00 | 14:00 | 18:00 | Fechado

\`\`\`

Preferir bloco por dia.

Exemplo:

\`\`\`text

Segunda-feira

08:00 - 12:00

14:00 - 18:00

\`\`\`

\---

**# 96. Segundo intervalo**

A inclusão do segundo intervalo deverá ser clara.

Exemplo:

\`\`\`text

[Adicionar segundo horário]

\`\`\`

ou solução equivalente definida no protótipo.

Não mostrar campos vazios desnecessariamente se isso piorar o Mobile.

\---

**# 97. Produtos e formas de pagamento no Onboarding**

A pergunta:

\`\`\`text

A barbearia vende produtos ou bebidas?

\`\`\`

deverá funcionar confortavelmente no Mobile.

Se selecionar *\`Sim\`*, as categorias de produtos aparecem de forma adaptada ao Mobile.

As formas de pagamento aceitas deverão permanecer acessíveis na mesma etapa sem exigir cadastro detalhado dos produtos.

\---

**# 98. Serviços no Onboarding**

Campos deverão utilizar uma coluna no Mobile.

Se múltiplos serviços forem adicionados, cada cadastro deverá permanecer claramente separado.

\---

**# 99. Aparência e conclusão no Onboarding**

As opções:

\`\`\`text

Tema Claro

Tema Escuro

Padrão do Sistema

\`\`\`

deverão funcionar em telas estreitas.

Cards selecionáveis poderão:

\`\`\`text

empilhar no Mobile

\`\`\`

e:

\`\`\`text

ficar lado a lado no Desktop

\`\`\`

quando houver espaço.

\---

**# 100. Painel Administrativo Desktop**

Desktop poderá utilizar:

\- sidebar;

\- tabela de barbearias;

\- filtros;

\- busca;

\- painel de detalhes.

A maior largura deverá beneficiar tarefas administrativas.

\---

**# 101. Dashboard Administrativo Mobile**

Indicadores administrativos deverão empilhar ou formar grade adequada.

Não copiar os indicadores financeiros do Dashboard da barbearia.

\---

**# 102. Lista de barbearias do ADMIN**

Desktop poderá utilizar tabela.

Mobile deverá preferir cards.

Exemplo:

\`\`\`text

Barbearia Imperial

Plano: Normal

Situação: Ativa

Validade: 18/10/2026

[Ver detalhes]

\`\`\`

\---

**# 103. Busca administrativa**

Campo de busca deverá ocupar largura adequada no Mobile.

Filtros adicionais poderão abrir em:

\- bottom sheet;

\- drawer;

\- área expansível.

\---

**# 104. Detalhes administrativos da barbearia**

Mobile deverá organizar em seções:

\`\`\`text

Identificação

Plano e validade

Situação da conta

Pagamentos

Histórico administrativo

Ações administrativas

\`\`\`

Não criar tabela horizontal larga.

\---

**# 105. Ações administrativas**

Ações como:

\`\`\`text

Confirmar pagamento

Conceder cortesia

Aplicar upgrade

Agendar downgrade

Cancelar renovação

Suspender

Reativar

\`\`\`

deverão possuir áreas de toque adequadas.

Ações de impacto poderão ocupar largura total no Mobile quando isso reduzir toque acidental.

\---

**# 106. Confirmação administrativa**

Diálogos de:

\- ativação;

\- desativação;

\- retirada da IA;

deverão funcionar em 320px.

O texto não deverá ser cortado.

\---

**# 107. Vitrine Pública**

A Vitrine deverá ser construída Mobile First.

É esperado acesso principalmente através de:

\- Instagram;

\- WhatsApp;

\- Google;

\- links compartilhados.

\---

**# 108. Cabeçalho da Vitrine**

Mobile poderá apresentar:

\- logo;

\- nome;

\- nome profissional;

\- informações principais;

\- CTA de contato.

Desktop poderá utilizar composição horizontal mais ampla.

\---

**# 109. Capa da Vitrine**

A capa deverá possuir altura adaptável.

Não deverá consumir praticamente toda a primeira tela de um celular.

\---

**# 110. Logo**

Deverá manter proporção.

Não deformar para preencher um container.

\---

**# 111. Serviços públicos**

Mobile:

\- cards empilhados;

\- ou grid simples.

Desktop:

\- múltiplas colunas quando adequado.

Preço deverá permanecer legível.

\---

**# 112. Produtos públicos**

Mobile:

\`\`\`text

1 ou 2 colunas

\`\`\`

conforme largura e conteúdo.

Desktop poderá utilizar grid maior.

\---

**# 113. Produto indisponível**

O estado:

\`\`\`text

Indisponível

\`\`\`

deverá permanecer legível em card Mobile sem depender somente de cor.

\---

**# 114. Portfólio público**

Mobile:

\`\`\`text

1 ou 2 colunas

\`\`\`

conforme largura.

Desktop:

\`\`\`text

3 ou 4 colunas

\`\`\`

quando adequado.

Não fixar números absolutos como regra para qualquer conteúdo.

\---

**# 115. Horários públicos**

Quando houver dois intervalos:

\`\`\`text

Segunda-feira

08:00 - 12:00

14:00 - 18:00

\`\`\`

deverão permanecer claramente associados ao mesmo dia.

\---

**# 116. Endereço público**

Em telas pequenas:

\`\`\`text

Rua Exemplo, 120

Centro

Mongaguá - SP

\`\`\`

é preferível a uma única linha enorme.

\---

**# 117. Endereço sem número**

Exemplo:

\`\`\`text

Avenida Exemplo, Sem número

Centro

Mongaguá - SP

\`\`\`

deverá funcionar normalmente.

\---

**# 118. WhatsApp**

Na Vitrine Mobile, o botão deverá possuir destaque suficiente para localização rápida.

Não duplicar excessivamente o mesmo CTA.

\---

**# 119. Instagram e Como chegar**

Botões deverão:

\- possuir área adequada para toque;

\- quebrar ou adaptar texto quando necessário;

\- não formar uma fileira comprimida.

\---

**# 120. Assistente IA Mobile**

Quando fechado:

\- não esconder CTAs;

\- respeitar safe areas;

\- ocupar pouco espaço.

\---

**# 121. Assistente IA aberto**

No Mobile poderá ocupar grande parte da tela.

Deverá considerar:

\- teclado virtual;

\- campo de mensagem;

\- botão Enviar;

\- lista de mensagens;

\- fechamento;

\- safe area.

\---

**# 122. Assistente IA Desktop**

Pode utilizar:

\- janela flutuante;

\- painel lateral;

\- solução equivalente.

Não deverá bloquear conteúdo principal desnecessariamente.

\---

**# 123. Estados da IA**

Deverão funcionar em telas pequenas:

\`\`\`text

Aguardando resposta

Erro

Timeout

Limite de uso

\`\`\`

Mensagens longas não deverão provocar overflow horizontal.

\---

**# 124. Upload de imagem**

Mobile deverá permitir:

\- selecionar;

\- visualizar;

\- substituir;

\- remover;

\- confirmar.

A prévia deverá adaptar-se à largura.

Para produtos, a interface deverá suportar:

\`\`\`text

imagem personalizada

imagem padrão da categoria

sem imagem
\`\`\`

Ao remover uma imagem personalizada, quando houver imagem padrão da categoria, o Mobile deverá apresentar confortavelmente as opções:

\`\`\`text

Usar imagem padrão da categoria

Ficar sem imagem
\`\`\`

Essa escolha poderá utilizar:

\- modal;

\- bottom sheet;

\- diálogo equivalente.

A ação não deverá ficar escondida atrás da barra inferior fixa ou do teclado.

\---

**# 125. Imagens**

Utilizar imagens responsivas.

Evitar:

\`\`\`css

width: 800px;

\`\`\`

sem comportamento adaptativo.

\---

**# 126. Textos longos**

Descrições deverão manter largura confortável.

Em monitores grandes, não deixar parágrafos atravessarem a tela inteira.

\---

**# 127. URLs, e-mails e conteúdos sem espaço**

Devem utilizar estratégia adequada de:

\- quebra;

\- truncamento;

\- overflow.

Aplicável especialmente à URL da Vitrine.

\---

**# 128. Empty States**

Mobile poderá utilizar:

\- ícone;

\- título;

\- descrição curta;

\- botão.

Não depender de ilustrações grandes.

\---

**# 129. Erros**

Mensagens deverão permanecer legíveis.

O botão:

\`\`\`text

Tentar novamente

\`\`\`

deverá continuar acessível.

\---

**# 130. Loading e Skeleton**

Skeleton deverá refletir o layout da largura atual.

Não utilizar skeleton Desktop comprimido no Mobile.

Loading de botão deverá evitar mudanças bruscas de largura.

\---

**# 131. Toasts**

Desktop poderá posicioná-los próximos a cantos da interface.

Mobile deverá evitar sobrepor:

\- notch;

\- navegação;

\- teclado;

\- chat;

\- ação fixa importante.

\---

**# 132. Ordem do conteúdo**

A ordem visual poderá mudar conforme a largura.

Desktop:

\`\`\`text

Informações | Ações

\`\`\`

Mobile:

\`\`\`text

Informações

Ação principal

Informações secundárias

\`\`\`

A ordem deverá priorizar a tarefa.

\---

**# 133. Ocultar conteúdo**

Não ocultar informação funcional essencial apenas porque a tela ficou pequena.

Preferir:

\- reorganizar;

\- resumir;

\- mover para detalhe;

\- utilizar menu apropriado.

\---

**# 134. Tooltips**

Não depender de tooltip para informações essenciais.

Em touch, hover não existe da mesma maneira.

\---

**# 135. Menu de ações**

Desktop poderá mostrar:

\`\`\`text

Editar | Inativar

\`\`\`

Mobile poderá utilizar:

\`\`\`text

⋮

\`\`\`

desde que as ações tenham nomes claros ao abrir.

\---

**# 136. Dropdown**

Desktop pode abrir próximo ao acionador.

Mobile poderá transformar listas maiores em:

\- bottom sheet;

\- drawer;

\- tela apropriada.

O conteúdo não deverá sair do viewport.

\---

**# 137. Date Picker**

Deverá funcionar adequadamente por toque.

Quando componentes nativos oferecerem melhor experiência, poderão ser considerados.

Evitar calendários minúsculos em celular.

\---

**# 138. Orientação**

A aplicação deverá funcionar principalmente em orientação vertical no celular.

Nenhuma função essencial deverá exigir Landscape.

\---

**# 139. Landscape**

A interface deverá continuar utilizável horizontalmente.

Tablet Landscape poderá aproximar-se do layout Desktop.

\---

**# 140. Zoom**

Não bloquear zoom.

A interface deverá continuar:

\- legível;

\- navegável;

\- utilizável.

\---

**# 141. Texto aumentado**

Quando o usuário aumentar texto:

\- não cortar;

\- não sobrepor;

\- não esconder botões;

\- permitir crescimento vertical.

Evitar alturas rígidas em componentes textuais.

\---

**# 142. Inputs no iOS**

Campos deverão possuir tamanho de texto adequado para evitar zoom automático indesejado quando aplicável.

Isso não deverá bloquear zoom manual.

\---

**# 143. Scroll**

Evitar várias áreas internas rolando simultaneamente no Mobile.

Exemplo problemático:

\`\`\`text

Página

\+

Modal

\+

Tabela

\+

Painel

\`\`\`

todos com scroll próprio.

\---

**# 144. Elementos fixos**

Utilizar *\`fixed\`* ou *\`sticky\`* somente quando houver benefício.

Exemplos possíveis:

\- total do PDV;

\- ação principal;

\- cabeçalho de tabela no Desktop.

\---

**# 145. Conteúdo atrás de elementos fixos**

Reservar espaço suficiente.

Se o botão Finalizar estiver fixo, o último item da comanda deverá continuar visível.

\---

**# 146. Elementos fixos e teclado**

Quando o teclado abrir:

\- verificar posicionamento;

\- evitar sobreposição;

\- permitir rolagem;

\- reposicionar quando necessário.

\---

**# 147. Performance Mobile**

Responsividade também envolve desempenho.

No Mobile:

\- otimizar imagens;

\- evitar JavaScript desnecessário;

\- evitar listas gigantes;

\- utilizar paginação quando necessário;

\- reduzir processamento desnecessário.

\---

**# 148. Rede lenta**

Testar especialmente:

\- Login;

\- confirmação de e-mail;

\- recuperação;

\- Dashboard;

\- PDV;

\- despesas;

\- upload;

\- geração da Vitrine;

\- relatórios;

\- IA;

\- Painel Administrativo.

\---

**# 149. Ações repetidas em rede lenta**

Durante processamento:

\- bloquear múltiplos envios;

\- manter Loading;

\- evitar duplicação.

Especialmente em:

\- Login;

\- salvar;

\- finalizar venda;

\- cancelar;

\- reposição;

\- marcar recorrência como paga;

\- gerar Vitrine;

\- exportar relatório;

\- ações ADMIN.

\---

**# 150. Offline**

Quando a ausência de conexão for detectada:

\- comunicar claramente;

\- não fingir que operação crítica foi salva;

\- permitir nova tentativa quando apropriado.

O sistema não deverá prometer sincronização offline de vendas no escopo atual.

\---

**# 151. Testes mínimos de largura**

Testar aproximadamente:

\`\`\`text

320px

375px

390px

430px

768px

1024px

1280px

1440px

\`\`\`

São pontos de verificação, não únicos tamanhos suportados.

\---

**# 152. Teste de altura**

Também verificar pouca altura disponível.

Exemplos:

\- celular Landscape;

\- notebook pequeno;

\- barras do navegador;

\- teclado virtual.

\---

**# 153. Teste com zoom**

Verificar interface com zoom aumentado.

Ela deverá continuar:

\- navegável;

\- legível;

\- utilizável;

\- sem sobreposição crítica.

\---

**# 154. Dispositivos reais**

Antes do lançamento, testar em dispositivo móvel real.

DevTools não reproduz perfeitamente:

\- toque;

\- teclado;

\- navegador Mobile;

\- desempenho;

\- safe areas;

\- upload;

\- autocomplete;

\- OTP.

\---

**# 155. Navegadores**

Prioridade inicial:

\- Chrome;

\- Edge;

\- Safari quando possível;

\- navegadores móveis relevantes.

Compatibilidade poderá ser refinada conforme testes reais.

\---

**# 156. Interação por toque**

Não exigir precisão exagerada.

Especial atenção a:

\- Excluir;

\- Remover;

\- Cancelar;

\- *\`+\`*;

\- *\`-\`*;

\- menus.

\---

**# 157. Hover e touch**

Toda ação disponível por hover deverá possuir alternativa por:

\- toque;

\- clique;

\- foco;

\- texto.

\---

**# 158. Foco e responsividade**

Estados de foco deverão permanecer visíveis mesmo após reorganização.

A ordem visual e a ordem de foco deverão continuar coerentes.

\---

**# 159. Ordem DOM**

Sempre que possível, ordem do código deverá acompanhar ordem lógica de leitura.

Não reorganizar apenas por CSS de forma que:

\- leitor de tela;

\- navegação com Tab;

fiquem em ordem diferente da visual.

\---

**# 160. Navegação por teclado no Desktop**

Deverá permanecer confortável em:

\- formulários;

\- menus;

\- tabelas;

\- modais;

\- PDV;

\- Painel Administrativo.

\---

**# 161. Conteúdo rolável em modal**

Quando necessário:

\- título deverá permanecer compreensível;

\- ações deverão continuar alcançáveis;

\- scroll deverá ser previsível;

\- evitar dois scrolls competindo.

\---

**# 162. Modal de confirmação**

Mobile deverá possuir:

\- padding adequado;

\- botões confortáveis;

\- texto completo;

\- diferenciação da ação destrutiva.

\---

**# 163. Auto preenchimento**

A interface deverá permitir recursos do navegador como:

\- gerenciador de senha;

\- e-mail;

\- OTP;

\- telefone;

\- endereço.

Valores preenchidos automaticamente não deverão quebrar o layout.

\---

**# 164. Stitch**

Durante a prototipação das telas autenticadas, validar quatro variações quando aplicável:

```text
Desktop Light
Desktop Dark
Mobile Light
Mobile Dark
```

As quatro versões representam a mesma funcionalidade e devem manter conteúdo e regras equivalentes.


Os protótipos deverão contemplar pelo menos:

\`\`\`text

Mobile

Desktop
\`\`\`

para as telas principais.

Telas críticas também deverão ser avaliadas em larguras intermediárias.

A navegação autenticada deverá ser prototipada explicitamente nos dois formatos:

\`\`\`text

Desktop
→ sidebar recolhível
→ Dashboard
→ PDV
→ Operação
→ Configurações

Mobile
→ barra inferior fixa
→ Dashboard
→ PDV
→ Operação
→ Configurações
\`\`\`

Também validar:

\- submenu de Operação;

\- navegação interna de Configurações;

\- menu rápido da conta;

\- estado ativo;

\- sidebar expandida;

\- sidebar recolhida;

\- barra inferior em 320px;

\- Tema Claro;

\- Tema Escuro.

Prioridade especial:

\- autenticação;

\- Onboarding;

\- Dashboard;

\- PDV;

\- Operação;

\- Serviços;

\- Produtos;

\- Estoque;

\- Configurações;

\- Financeiro;

\- Relatórios;

\- Vitrine;

\- Perfil/Conta;

\- Assistente IA;

\- Painel Administrativo.

\---

**# 165. Estados no protótipo responsivo**

Quando aplicável, validar:

\- normal;

\- Loading;

\- erro;

\- vazio;

\- sucesso;

\- conteúdo longo;

\- teclado aberto;

\- modal;

\- confirmação;

\- campo inválido.

Não validar responsividade somente no estado mais conveniente da tela.

\---

**# 166. Critérios por tela**

Antes de considerar uma tela responsiva, verificar se:

\- funciona em aproximadamente 320px;

\- não possui overflow horizontal indevido;

\- textos estão legíveis;

\- textos longos não quebram o layout;

\- botões possuem área de toque adequada;

\- ação principal está acessível;

\- formulário não exige zoom;

\- teclado virtual não bloqueia a ação;

\- labels continuam visíveis;

\- erros continuam legíveis;

\- modais são utilizáveis;

\- bottom sheets respeitam safe areas;

\- tabelas foram adaptadas;

\- imagens não deformam;

\- Loading funciona;

\- Empty State funciona;

\- erro funciona;

\- toast não cobre ações importantes;

\- Desktop aproveita o espaço;

\- nenhuma ação depende somente de hover;

\- navegação por teclado continua coerente;

\- zoom não destrói o layout;

\- texto aumentado continua utilizável;

\- elementos fixos não escondem conteúdo;

\- Landscape continua utilizável;

\- não existem scrolls internos desnecessários;

\- Tema Claro funciona;

\- Tema Escuro funciona.

\---

**# 167. Ordem de prioridade para validação**

Prioridade recomendada:

\`\`\`text

1. Boas-vindas

2. Login

3. Criar Conta

4. Confirmação de e-mail

5. Recuperar Senha

6. Verificar Código

7. Nova Senha

8. Onboarding

9. Estrutura autenticada Desktop

10. Estrutura autenticada Mobile

11. Dashboard

12. PDV

13. Histórico de Vendas

14. Operação

15. Serviços

16. Produtos

17. Estoque

18. Configurações

19. Financeiro

20. Despesas

21. Despesas Recorrentes

22. Relatórios

23. Vitrine Administrativa

24. Portfólio

25. Configurações da Barbearia

26. Perfil / Conta

27. Vitrine Pública

28. Assistente IA

29. Dashboard Administrativo

30. Lista de Barbearias

31. Detalhes Administrativos
\`\`\`

O **PDV** e a **Vitrine Pública** possuem prioridade especial no Mobile.

A estrutura principal de navegação deverá ser validada antes de prototipar profundamente os módulos internos, pois ela será reutilizada em praticamente toda a área autenticada.

\---

**# 168. Critério de conclusão**

A responsividade estará suficientemente definida para prototipação quando:

\- funcionalidades do escopo atual puderem ser representadas no celular;

\- a aplicação funcionar a partir de aproximadamente 320px;

\- não houver overflow horizontal indevido;

\- ações essenciais não dependerem de hover;

\- formulários forem confortáveis;

\- teclado virtual não impedir operações;

\- OTP funcionar em telas estreitas;

\- Onboarding funcionar nas seis etapas;

\- PDV puder ser utilizado rapidamente;

\- despesas recorrentes possuírem representação adequada;

\- relatórios e exportações forem acessíveis;

\- geração da Vitrine funcionar no Mobile;

\- navegação Desktop utilizar sidebar recolhível com Dashboard, PDV, Operação e Configurações;

\- navegação Mobile utilizar barra inferior com Dashboard, PDV, Operação e Configurações;

\- conteúdo não ficar escondido atrás da barra inferior;

\- Operação agrupar Serviços, Produtos e Estoque;

\- Configurações agrupar Negócio e Barbearia;

\- Sua conta estiver adaptada separadamente de Configurações;

\- Vitrine Pública estiver adequada ao celular;

\- Assistente IA considerar teclado e safe area;

\- Painel Administrativo funcionar em Mobile e Desktop;

\- Tema Claro e Tema Escuro funcionarem nos mesmos layouts;

\- Desktop utilizar adequadamente o espaço;

\- zoom e texto aumentado não destruírem a interface;

\- protótipos Mobile e Desktop puderem ser construídos seguindo este documento.

Antes do lançamento definitivo, a responsividade ainda deverá ser validada em dispositivos reais e com o barbeiro parceiro.

\---

**# 169. Minha assinatura responsiva**

No Desktop, o resumo do plano, validade, alteração agendada e recursos pode usar cards lado a lado.

No Mobile:

\- empilhar as informações em ordem de importância;

\- manter plano e validade visíveis sem rolagem horizontal;

\- apresentar alteração agendada em card próprio;

\- usar botão de largura confortável para cancelar renovação;

\- separar visualmente qualquer atalho para a Zona de perigo;

\- não fixar ações de forma que oculte conteúdo ou a bottom navigation.

\---

**# 170. Recurso bloqueado no Grátis**

O mesmo componente deve se adaptar a página completa, card ou região interna de um módulo.

No Mobile:

\- mostrar primeiro o nome do recurso e o motivo do bloqueio;

\- manter benefícios e preço legíveis;

\- empilhar as ações;

\- preservar a visualização em somente leitura dos dados existentes;

\- evitar modal maior que a área disponível.

No Desktop, o painel não deverá desperdiçar toda a largura quando puder permanecer próximo ao conteúdo bloqueado.

\---

**# 171. Tabelas e filtros do ADMIN**

No Desktop:

\- usar tabela para a lista de barbearias;

\- manter busca e filtros visíveis;

\- permitir abrir os detalhes sem depender de gesto oculto.

No Mobile:

\- converter cada linha em card;

\- exibir nome, código, plano, situação e validade;

\- abrir filtros em bottom sheet, drawer ou região expansível;

\- mostrar filtros ativos fora do painel fechado;

\- evitar tabela horizontal e scroll lateral.

\---

**# 172. Detalhes e ações administrativas**

No Mobile, usar seções ou acordeões para Identificação, Assinatura, Pagamentos, Histórico e Ações.

A ação principal de cada confirmação poderá ocupar toda a largura. Ações destrutivas não devem ficar coladas a ações rotineiras.

O fluxo excepcional de exclusão administrativa deverá usar página ou modal de tela ampla, permitir rolagem previsível e manter visíveis a justificativa, o código e a frase de confirmação.

\---

**# 173. Exclusão da própria conta no Mobile**

O teclado virtual não poderá esconder:

\- campo da senha;

\- campo da frase *\`EXCLUIR MINHA CONTA\`*;

\- mensagens de validação;

\- ação final.

Se o conteúdo não couber em modal, usar página dedicada ou bottom sheet de altura controlada. Nunca reduzir o texto de consequência apenas para fazê-lo caber.

\---

**# 174. Conta suspensa, Manutenção, Offline e 404**

Esses estados usam layout global sem sidebar e sem bottom navigation.

Em qualquer largura:

\- centralizar o conteúdo sem limitar excessivamente a leitura;

\- manter título, mensagem e ação dentro da área segura;

\- permitir texto maior e zoom;

\- evitar ilustrações que empurrem a ação para fora da tela;

\- adaptar o botão primário para largura confortável no Mobile.

Na manutenção, motivo e previsão podem aumentar de tamanho sem provocar overflow. No offline, a ação de tentar novamente deve permanecer disponível. No 404, o destino de retorno deve respeitar o contexto autenticado ou público.

\---

**# 175. Ordem atualizada de validação final**

Depois das telas já aprovadas, validar nesta ordem:

\`\`\`text

1. ADMIN → Dashboard

2. ADMIN → Barbearias

3. ADMIN → Detalhes da barbearia

4. Sua conta → Minha assinatura

5. Recurso bloqueado no Grátis

6. Conta suspensa

7. Manutenção

8. Offline global

9. 404 / Página não encontrada

\`\`\`

Cada item deve ser verificado em Desktop e Mobile, Tema Claro e Tema Escuro, incluindo Loading, Empty, Error e confirmação quando aplicáveis.

\---
