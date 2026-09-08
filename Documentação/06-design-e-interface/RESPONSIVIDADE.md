# Responsividade — Estilo e Gestão

## Objetivo

Este documento define como a interface do **Estilo e Gestão** deverá se adaptar a celulares, tablets, notebooks e computadores.

O sistema seguirá abordagem **Mobile First**.

Este arquivo trata apenas da adaptação da interface.

Cores, componentes e identidade visual pertencem ao `DESIGN_SYSTEM.md`.

Regras funcionais pertencem ao documento de Fluxo Técnico.

---

# 1. Princípio principal

A interface deverá funcionar adequadamente em diferentes tamanhos de tela sem criar duas aplicações independentes.

A mesma funcionalidade deverá existir em:

- Mobile;
- Tablet;
- Desktop.

O layout pode mudar.

A regra de negócio não.

---

# 2. Mobile First

O CSS e os componentes deverão partir do menor layout suportado e evoluir para telas maiores.

Conceito:

```text
Mobile
  ↓
Tablet
  ↓
Notebook
  ↓
Desktop
```

Isso é especialmente importante porque o barbeiro poderá operar o sistema pelo celular durante o atendimento.

---

# 3. Dispositivos alvo

A aplicação deverá considerar:

- celulares pequenos;
- celulares grandes;
- tablets;
- notebooks;
- monitores desktop.

Não desenvolver somente olhando para a resolução do computador utilizado pelo desenvolvedor.

---

# 4. Breakpoints

Os breakpoints deverão seguir preferencialmente os padrões disponíveis no Tailwind CSS utilizado pelo projeto.

Valores definitivos deverão acompanhar a versão adotada durante a implementação.

Como referência conceitual:

```text
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
```

Não criar dezenas de breakpoints específicos sem necessidade.

---

# 5. Breakpoint não representa dispositivo exato

Não pensar:

```text
768px = tablet
```

como regra absoluta.

O breakpoint representa apenas espaço disponível para alterar o layout.

A interface deverá responder ao espaço, não ao nome comercial do dispositivo.

---

# 6. Largura mínima

A aplicação deverá permanecer utilizável em celulares estreitos.

Largura mínima de referência para testes:

```text
320px
```

O sistema não deverá depender de uma largura mínima superior sem motivo técnico real.

---

# 7. Conteúdo principal

Em telas grandes, o conteúdo não deverá crescer indefinidamente.

Utilizar largura máxima apropriada quando isso melhorar leitura.

Exemplo:

```text
max-width
```

para formulários e páginas de texto.

Dashboard e PDV poderão utilizar mais espaço horizontal.

---

# 8. Padding lateral

Mobile deverá possuir espaçamento suficiente nas laterais para impedir conteúdo colado à borda.

O valor deverá seguir os tokens definidos no Design System.

---

# 9. Navegação Mobile

A navegação mobile poderá utilizar:

- menu lateral temporário;
- menu compacto;
- barra inferior para ações principais.

A escolha definitiva será feita no protótipo.

---

# 10. Barra inferior

Se utilizada, deverá conter somente as funções mais frequentes.

Não tentar colocar:

- Dashboard;
- PDV;
- Serviços;
- Produtos;
- Estoque;
- Financeiro;
- Relatórios;
- Vitrine;
- Portfólio;
- Configurações;

todas simultaneamente.

Funções menos frequentes deverão ficar no menu.

---

# 11. Navegação Desktop

Em desktop, poderá ser utilizada sidebar permanente.

Ela poderá mostrar:

- logo;
- páginas;
- estado selecionado;
- conta.

A sidebar não deverá reduzir excessivamente a área útil.

---

# 12. Sidebar recolhível

Pode ser utilizada em larguras intermediárias.

Exemplo:

```text
Desktop largo
→ sidebar completa

Notebook menor
→ sidebar compacta

Mobile
→ menu temporário
```

---

# 13. Cabeçalho

O cabeçalho deverá adaptar:

- título;
- ações;
- filtros;
- conta.

Em mobile, ações secundárias poderão ser movidas para menu.

A ação principal deverá permanecer fácil de localizar.

---

# 14. Botões

Em mobile:

- área adequada para toque;
- texto legível;
- evitar vários botões minúsculos lado a lado.

Quando necessário, botão principal poderá ocupar toda a largura.

---

# 15. Botões lado a lado

Em desktop:

```text
[Cancelar] [Salvar]
```

pode funcionar adequadamente.

Em celular estreito:

```text
[Salvar           ]
[Cancelar         ]
```

pode ser mais seguro dependendo da importância.

A decisão depende do contexto.

---

# 16. Formulários

Mobile:

- uma coluna por padrão.

Desktop:

- campos relacionados podem formar duas colunas.

Exemplo:

```text
Cidade    Estado
```

ou:

```text
Preço de custo    Preço de venda
```

quando existir espaço suficiente.

---

# 17. Labels

Labels deverão permanecer visíveis em qualquer tamanho.

Não ocultar label no mobile para economizar espaço.

---

# 18. Teclado virtual

Inputs mobile deverão utilizar tipos adequados.

Exemplos:

```text
email
tel
number
```

quando apropriado.

A interface deverá considerar que o teclado virtual ocupa parte considerável da tela.

---

# 19. Modais em Mobile

Modal pequeno de confirmação pode continuar centralizado.

Formulários maiores deverão preferir:

- tela inteira;
- drawer;
- bottom sheet.

Não colocar formulário extenso dentro de uma caixa pequena apenas para evitar criar uma tela adequada.

---

# 20. Bottom Sheet

Pode ser apropriado para:

- resumo da comanda;
- filtro;
- seletor;
- pequenas ações.

Deve permitir:

- fechar;
- rolar quando necessário;
- respeitar safe areas.

---

# 21. Safe Areas

Em dispositivos compatíveis, considerar áreas reservadas por:

- notch;
- barra inferior;
- elementos do sistema operacional.

Principalmente em componentes fixos na parte inferior.

---

# 22. Tabelas

Tabelas deverão ser utilizadas principalmente onde houver espaço.

No Mobile, uma tabela larga deverá ser adaptada.

Não reduzir toda a tabela até ficar ilegível.

---

# 23. Alternativa para tabelas

Exemplo Desktop:

```text
Data | Produto | Tipo | Quantidade | Saldo
```

Mobile:

```text
Coca-Cola
Venda
08/09/2026 • 18:30

-2 unidades
Saldo: 8
```

Cards podem substituir tabelas quando melhorarem leitura.

---

# 24. Scroll horizontal

Pode ser utilizado excepcionalmente quando a natureza da informação exigir tabela.

Não deverá ser a solução padrão para todas as páginas.

---

# 25. Dashboard Mobile

Prioridade:

1. indicadores principais;
2. alertas;
3. resumo;
4. gráficos secundários.

Cards deverão ser empilhados ou formar grade compatível.

---

# 26. Dashboard Desktop

Pode utilizar:

- grid;
- cards lado a lado;
- gráficos;
- tabelas resumidas.

A maior largura deverá ser utilizada para melhorar leitura, não simplesmente para adicionar informação.

---

# 27. Cards de indicadores

Mobile:

```text
1 ou 2 por linha
```

dependendo da largura e conteúdo.

Desktop:

```text
3 ou 4 por linha
```

quando houver espaço suficiente.

Não fixar quatro colunas em todas as telas.

---

# 28. PDV Mobile

É uma das telas mais importantes do sistema.

Deverá priorizar:

- catálogo;
- comanda acessível;
- total;
- botão Finalizar.

---

# 29. Estrutura sugerida do PDV Mobile

Uma possibilidade:

```text
[Busca]

[Serviços] [Produtos]

Cards dos itens

--------------------
[Comanda • 3 itens]
[Total R$ 55,00]
[Finalizar venda]
```

A comanda poderá abrir como:

- bottom sheet;
- página;
- painel expansível.

A decisão final será validada no protótipo.

---

# 30. Total no PDV Mobile

O total deverá permanecer fácil de encontrar.

Evitar que o barbeiro precise rolar até o início da página para descobrir quanto a venda está dando.

---

# 31. PDV Desktop

Poderá utilizar duas áreas simultâneas:

```text
Catálogo           Comanda
────────────       ─────────────
Serviços           Item 1
Produtos           Item 2
Busca              Total
                   Finalizar
```

---

# 32. Quantidade no PDV

Controles:

```text
[-] 2 [+]
```

deverão possuir tamanho adequado para toque.

O botão Remover deverá ser acessível sem risco de toque acidental.

---

# 33. Serviços

Mobile:

- lista/card;
- ação principal acessível;
- preço visível.

Desktop:

- lista ou tabela;
- ações agrupadas.

---

# 34. Produtos

Mobile deverá priorizar:

- nome;
- categoria;
- preço;
- estoque;
- status.

Informações secundárias podem ficar na tela de detalhe.

---

# 35. Estoque

Alertas deverão ser legíveis em telas pequenas.

Exemplo:

```text
Pomada Matte
2 unidades
⚠ Estoque baixo
```

Não depender apenas de uma coluna colorida.

---

# 36. Histórico de vendas

Mobile:

```text
08/09/2026 • 18:30
R$ 55,00
Pix
Concluída
```

Cada venda poderá ser um card clicável.

Desktop poderá utilizar tabela.

---

# 37. Financeiro

Filtros de período devem adaptar-se.

Desktop:

```text
[Hoje] [Semana] [Mês] [Ano] [Personalizado]
```

Mobile poderá utilizar:

```text
[Período ▼]
```

ou chips roláveis horizontalmente.

---

# 38. Período personalizado

Desktop poderá mostrar:

```text
Data inicial | Data final | Aplicar
```

Mobile:

```text
Data inicial
Data final
[Aplicar]
```

---

# 39. Gráficos

Gráficos devem:

- redimensionar;
- possuir labels legíveis;
- evitar muitas categorias simultâneas.

Quando um gráfico não for compreensível no mobile, considerar substituir por:

- lista;
- resumo;
- versão simplificada.

---

# 40. Vitrine Administrativa

Desktop poderá utilizar prévia lado a lado:

```text
Configuração | Prévia
```

Mobile deverá priorizar edição por seções.

A prévia poderá abrir:

- nova tela;
- modal tela cheia;
- nova aba.

---

# 41. Formulário da Vitrine

Separar em blocos:

- Identidade;
- Sobre;
- Contato;
- Endereço;
- Horários;
- Seções;
- Serviços;
- Produtos;
- IA.

Isso evita formulário interminável.

---

# 42. Portfólio Administrativo

Mobile:

- grid de poucas colunas;
- cards grandes o suficiente para toque.

Desktop:

- grid com mais colunas.

A proporção das imagens deverá permanecer consistente.

---

# 43. Vitrine Pública

A Vitrine deverá ser construída Mobile First.

Motivo:

boa parte dos visitantes provavelmente acessará através de:

- Instagram;
- WhatsApp;
- Google;
- QR Code.

---

# 44. Cabeçalho da Vitrine

Mobile:

- logo;
- nome;
- informações principais;
- CTA de contato.

Desktop:

pode utilizar composição horizontal mais ampla.

---

# 45. Serviços públicos

Mobile:

- cards empilhados ou grade simples.

Desktop:

- múltiplas colunas quando adequado.

Preço deverá continuar legível.

---

# 46. Produtos públicos

Mobile:

- uma ou duas colunas dependendo da largura.

Desktop:

- grid com mais colunas.

Não reduzir imagem e texto a ponto de impedir leitura.

---

# 47. Portfólio público

Mobile:

```text
2 colunas
```

pode ser adequado.

Celular muito estreito:

```text
1 ou 2
```

conforme protótipo.

Desktop:

```text
3 ou 4
```

quando as imagens permitirem.

Não fixar esses números como regra absoluta.

---

# 48. Endereço público

Em telas pequenas, exibir em linhas legíveis.

Exemplo:

```text
Rua Exemplo, 120
Centro
Mongaguá - SP
```

Evitar linha única enorme.

---

# 49. Botão de WhatsApp

Na Vitrine Mobile, deverá possuir destaque suficiente para ser encontrado facilmente.

Pode existir:

- na seção Contato;
- CTA próximo ao topo;
- botão flutuante, caso aprovado no protótipo.

Não duplicar excessivamente o mesmo CTA.

---

# 50. Assistente IA Mobile

O botão de chat:

- não deverá esconder ações importantes;
- deverá respeitar safe area;
- não deverá ocupar grande parte da tela fechado.

---

# 51. Chat aberto

Mobile:

- poderá ocupar grande parte da tela;
- deverá considerar teclado virtual;
- campo de mensagem deverá permanecer acessível.

Desktop:

- poderá utilizar janela lateral/flutuante.

---

# 52. Upload de imagem

Mobile deverá permitir selecionar arquivo ou imagem através das capacidades disponíveis do navegador.

A prévia deverá adaptar-se à largura.

---

# 53. Imagens

Usar imagens responsivas.

Evitar tamanho fixo como:

```css
width: 800px;
```

sem comportamento adaptativo.

---

# 54. Imagem de capa

A capa deverá possuir altura adaptável.

Não deverá ocupar praticamente toda a primeira tela de um celular.

---

# 55. Logo

Não deformar.

Utilizar limites de:

- largura;
- altura.

Manter proporção.

---

# 56. Textos longos

Descrições longas deverão respeitar largura de leitura.

Em desktop, não esticar parágrafos de uma borda à outra em monitor ultrawide.

---

# 57. Empty States

Estados vazios deverão adaptar-se sem depender de grandes ilustrações.

Mobile:

- texto;
- ícone;
- botão.

Desktop pode possuir composição maior.

---

# 58. Erro

Mensagens de erro deverão ser legíveis em qualquer largura.

Botão **Tentar novamente** deve continuar acessível.

---

# 59. Loading

Skeleton deverá acompanhar o layout correspondente.

Não utilizar skeleton desktop comprimido em celular.

---

# 60. Ordem de conteúdo

Mobile poderá alterar a ordem visual.

Exemplo Desktop:

```text
Informações | Ações
```

Mobile:

```text
Informações
Ação principal
Informações secundárias
```

A prioridade deve ser definida pelo uso.

---

# 61. Ocultar conteúdo

Não ocultar informação funcional essencial apenas porque a tela ficou pequena.

Quando necessário:

- reorganizar;
- resumir;
- mover para detalhe;
- usar menu.

---

# 62. Tooltip

Não depender de tooltip para informação obrigatória.

Em telas touch, hover não existe de forma equivalente.

---

# 63. Menu de ações

Desktop pode mostrar:

```text
Editar | Inativar
```

Mobile pode utilizar:

```text
⋮
```

desde que as ações sejam claramente identificadas ao abrir.

---

# 64. Orientação

O sistema deverá funcionar principalmente em orientação vertical no celular.

Não exigir que o usuário vire o aparelho para utilizar nenhuma funcionalidade essencial.

---

# 65. Landscape

Se o dispositivo for usado horizontalmente, o layout deverá continuar utilizável.

Tablet landscape poderá aproximar-se do layout desktop.

---

# 66. Zoom

Não bloquear zoom do navegador.

Evitar configurações que impeçam usuários de ampliar conteúdo.

---

# 67. Inputs no iOS

Campos deverão utilizar tamanho de fonte adequado para evitar comportamentos indesejados de zoom automático quando aplicável.

---

# 68. Scroll

Páginas poderão rolar normalmente.

Evitar múltiplas áreas internas de scroll no Mobile sem necessidade.

Exemplo ruim:

```text
Página rola
Modal rola
Tabela rola
Painel interno rola
```

todos simultaneamente.

---

# 69. Elementos fixos

Utilizar `position: fixed` ou `sticky` somente quando trouxer benefício claro.

Exemplos úteis:

- total do PDV;
- ação principal;
- cabeçalho de tabela em desktop.

Não transformar a tela inteira em elementos fixos.

---

# 70. Conteúdo atrás de elementos fixos

Sempre reservar espaço adequado.

Exemplo:

se botão Finalizar fica fixo no rodapé:

- últimos itens da comanda não podem ficar escondidos atrás dele.

---

# 71. Performance Mobile

Responsividade não é apenas largura.

No Mobile:

- otimizar imagens;
- evitar JavaScript desnecessário;
- evitar carregar listas gigantes;
- utilizar paginação quando necessário;
- reduzir trabalho desnecessário no navegador.

---

# 72. Rede lenta

Testar o sistema com conexão limitada.

Especialmente:

- Login;
- Dashboard;
- PDV;
- upload;
- Vitrine;
- IA.

A interface deverá fornecer feedback enquanto aguarda.

---

# 73. Testes mínimos de largura

Durante desenvolvimento, testar pelo menos exemplos próximos a:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

Esses valores servem como pontos de verificação.

Não significam que a interface só precise funcionar exatamente nessas larguras.

---

# 74. Teste em dispositivos reais

Antes do lançamento, testar em dispositivo móvel real.

DevTools não substitui completamente:

- toque;
- teclado virtual;
- navegador mobile;
- desempenho;
- safe area;
- comportamento de upload.

---

# 75. Navegadores

Testar pelo menos nos navegadores modernos relevantes ao público.

Prioridade inicial:

- Chrome;
- Safari em dispositivos Apple quando possível;
- Edge;
- navegadores móveis baseados nas plataformas utilizadas pelo público.

Compatibilidade definitiva será definida conforme os dispositivos usados nos testes.

---

# 76. Checklist por tela

Antes de considerar uma tela responsiva:

- [ ] Funciona em 320px.
- [ ] Não possui overflow horizontal indevido.
- [ ] Textos estão legíveis.
- [ ] Botões são tocáveis.
- [ ] Ação principal está visível.
- [ ] Formulário não exige zoom.
- [ ] Teclado virtual não bloqueia ação.
- [ ] Modal é utilizável.
- [ ] Tabela foi adaptada.
- [ ] Imagens não deformam.
- [ ] Loading funciona.
- [ ] Empty State funciona.
- [ ] Erro funciona.
- [ ] Desktop continua aproveitando espaço.
- [ ] Nenhuma ação depende apenas de hover.

---

# 77. Prioridade das telas

As primeiras telas que deverão passar por validação responsiva detalhada são:

1. Login;
2. Criar Conta;
3. Onboarding;
4. Dashboard;
5. PDV;
6. Produtos;
7. Estoque;
8. Financeiro;
9. Vitrine Administrativa;
10. Vitrine Pública;
11. Portfólio;
12. Assistente IA.

O PDV e a Vitrine Pública possuem prioridade especial no Mobile.

---

# 78. Critério de conclusão

A responsividade estará pronta quando:

- todas as funcionalidades do MVP puderem ser utilizadas pelo celular;
- não houver overflow horizontal indevido;
- ações essenciais não dependerem de hover;
- formulários forem confortáveis;
- PDV puder ser operado rapidamente;
- Vitrine pública estiver adequada a celular;
- Desktop utilizar o espaço disponível sem exagero;
- dispositivos reais tiverem sido testados;
- protótipo responsivo tiver sido validado com o barbeiro.