# Esquema de Cores - Estilo e Gestão

## Objetivo

Este documento define e explica a paleta de cores utilizada no **Estilo e Gestão**, o significado visual de cada grupo e sua utilização nos temas suportados pelo sistema.

Ele é voltado para:

- apresentação da identidade visual;
- prototipação;
- desenvolvimento frontend;
- manutenção da consistência visual;
- referência para desenvolvedores e agentes de IA.

As regras específicas de aplicação em:

- botões;
- inputs;
- alertas;
- badges;
- gráficos;
- estados;
- componentes;

pertencem ao:

```text
DESIGN_SYSTEM.md
```

Este documento é a referência principal para os valores das cores.

---

# 1. Conceito visual

O Estilo e Gestão é um sistema voltado à administração e divulgação de pequenas barbearias.

A identidade visual foi criada para transmitir:

- profissionalismo;
- organização;
- confiança;
- simplicidade;
- modernidade.

A base visual utiliza tons neutros inspirados em grafite, combinados com superfícies discretas.

As cores semânticas aparecem apenas quando existe motivo funcional.

A interface não deverá depender de grande quantidade de cores para organizar informações.

---

# 2. Estrutura da identidade

A identidade pode ser resumida da seguinte forma:

```text
Grafites
↓
marca, hierarquia e ações principais

Superfícies neutras
↓
organização e separação

Tons claros ou escuros
↓
fundo da interface conforme o tema

Cores semânticas
↓
sucesso, erro, aviso e informação
```

A maior parte da interface deverá permanecer neutra.

---

# 3. Temas suportados

A interface autenticada suporta:

```text
Tema Claro
Tema Escuro
Padrão do Sistema
```

`Padrão do Sistema` não possui uma terceira paleta.

Ele utiliza:

```text
Tema Claro
```

ou:

```text
Tema Escuro
```

de acordo com a preferência do dispositivo.

---

# 4. Tema Claro

O Tema Claro utiliza:

- fundo levemente quente;
- superfícies brancas;
- grafite para textos e ações;
- bordas suaves;
- cores semânticas mais profundas.

A intenção é evitar uma interface construída somente com branco puro e preto absoluto.

---

# 5. Tema Escuro

O Tema Escuro utiliza:

- fundo grafite muito escuro;
- superfícies progressivamente mais claras;
- texto claro;
- bordas discretas;
- cores semânticas adaptadas ao fundo escuro.

Não utilizar simples inversão automática das cores do Tema Claro.

Também não utilizar preto puro como fundo obrigatório de toda a aplicação.

---

# 6. Paleta principal da marca

## Grafite principal

```text
#2F2F2D
```

Representa:

- estabilidade;
- profissionalismo;
- seriedade;
- organização.

Também mantém relação visual com ambientes de barbearia, nos quais tons escuros aparecem com frequência em:

- móveis;
- equipamentos;
- decoração;
- identidade visual.

---

# 7. Grafite secundário

```text
#3A3A38
```

É uma variação do grafite principal.

Pode apoiar:

- estados interativos;
- elementos secundários;
- hierarquia;
- navegação.

Mantém a identidade sem introduzir outra família cromática.

---

# 8. Cinza intermediário

```text
#666662
```

Ajuda a diferenciar:

- informação principal;
- informação secundária;
- texto auxiliar;
- ícones neutros.

Não deverá ser utilizado quando o contraste com o fundo for insuficiente.

---

# 9. Cinza claro

```text
#E9E9E4
```

No Tema Claro, pode ser utilizado para:

- bordas;
- divisores;
- superfícies secundárias;
- áreas neutras;
- controles discretos.

---

# 10. Fundo claro

```text
#F4F4F0
```

É o fundo principal do Tema Claro.

Sua tonalidade levemente quente reduz a aparência fria de uma interface construída somente com branco.

---

# 11. Branco

```text
#FFFFFF
```

No Tema Claro, poderá representar:

- cards;
- formulários;
- modais;
- superfícies elevadas;
- áreas internas.

Não deverá ser utilizado como superfície principal no Tema Escuro.

---

# 12. Paleta estrutural do Tema Claro

| Token | Cor | Função principal |
|---|---|---|
| `background` | `#F4F4F0` | Fundo geral |
| `surface` | `#FFFFFF` | Cards e superfícies |
| `surface-secondary` | `#E9E9E4` | Áreas secundárias |
| `border` | `#E9E9E4` | Bordas e divisores |
| `text-primary` | `#2F2F2D` | Texto principal |
| `text-secondary` | `#666662` | Texto secundário |
| `primary` | `#2F2F2D` | Ação principal |
| `primary-hover` | `#3A3A38` | Hover da ação principal |
| `on-primary` | `#FFFFFF` | Conteúdo sobre ação principal |

---

# 13. Paleta estrutural do Tema Escuro

## Fundo principal

```text
#181817
```

Utilizado como fundo geral da aplicação.

---

## Superfície principal

```text
#222220
```

Utilizada para:

- cards;
- formulários;
- áreas internas.

---

## Superfície secundária

```text
#2B2B29
```

Utilizada para:

- controles;
- áreas diferenciadas;
- elementos secundários;
- estados neutros.

---

## Bordas

```text
#3F3F3B
```

Utilizada para:

- divisores;
- bordas;
- separação entre superfícies.

---

## Texto principal

```text
#F4F4F0
```

Utilizado para:

- títulos;
- textos principais;
- informações importantes.

---

## Texto secundário

```text
#B8B8B2
```

Utilizado para:

- textos auxiliares;
- labels secundárias;
- informações de menor hierarquia.

---

# 14. Tabela estrutural do Tema Escuro

| Token | Cor | Função principal |
|---|---|---|
| `background` | `#181817` | Fundo geral |
| `surface` | `#222220` | Cards e superfícies |
| `surface-secondary` | `#2B2B29` | Áreas secundárias |
| `border` | `#3F3F3B` | Bordas e divisores |
| `text-primary` | `#F4F4F0` | Texto principal |
| `text-secondary` | `#B8B8B2` | Texto secundário |
| `primary` | `#F4F4F0` | Ação principal |
| `primary-hover` | `#E9E9E4` | Hover da ação principal |
| `on-primary` | `#181817` | Conteúdo sobre ação principal |

---

# 15. Ação principal

A principal ação da interface deverá utilizar a identidade neutra da marca.

## Tema Claro

```text
Fundo: #2F2F2D
Texto: #FFFFFF
```

## Tema Escuro

```text
Fundo: #F4F4F0
Texto: #181817
```

Isso permite que a ação principal continue visualmente forte sem transformar todas as telas em interfaces verdes.

---

# 16. Verde positivo

Tema Claro:

```text
#2F6B4F
```

Tema Escuro:

```text
#6FB892
```

O verde representa principalmente:

- sucesso;
- conclusão positiva;
- estado saudável;
- resultado favorável.

Não deverá substituir automaticamente a cor de todos os botões principais.

---

# 17. Cor destrutiva

## Tema Claro

```text
#B42318
```

## Tema Escuro

```text
#F97066
```

Representa:

- erro;
- falha;
- ação destrutiva;
- situação crítica.

Exemplos:

- excluir conta;
- excluir despesa;
- excluir registro;
- erro de validação importante.

---

# 18. Cor de aviso

## Tema Claro

```text
#B54708
```

## Tema Escuro

```text
#FDB022
```

Representa situação que exige atenção sem necessariamente impedir a ação.

Exemplos:

- estoque baixo;
- preço abaixo do custo;
- informações opcionais ausentes;
- situação que merece revisão.

---

# 19. Cor informativa

## Tema Claro

```text
#175CD3
```

## Tema Escuro

```text
#53B1FD
```

Pode representar:

- orientação;
- ajuda;
- informação contextual;
- estado informativo.

---

# 20. Resumo das cores semânticas

| Estado | Tema Claro | Tema Escuro |
|---|---|---|
| Sucesso | `#2F6B4F` | `#6FB892` |
| Erro/Destrutivo | `#B42318` | `#F97066` |
| Aviso | `#B54708` | `#FDB022` |
| Informação | `#175CD3` | `#53B1FD` |

---

# 21. Fundos semânticos no Tema Claro

Quando uma mensagem precisar de superfície própria, utilizar tons suaves.

| Estado | Fundo sugerido | Conteúdo principal |
|---|---|---|
| Sucesso | `#EAF5EF` | `#2F6B4F` |
| Erro | `#FEECEB` | `#B42318` |
| Aviso | `#FFF4E5` | `#B54708` |
| Informação | `#EAF3FF` | `#175CD3` |

Essas combinações são apropriadas para:

- alerts;
- banners;
- mensagens inline;
- cards de estado.

---

# 22. Fundos semânticos no Tema Escuro

| Estado | Fundo sugerido | Conteúdo principal |
|---|---|---|
| Sucesso | `#173B2D` | `#6FB892` |
| Erro | `#4A1D1A` | `#F97066` |
| Aviso | `#4A2C0A` | `#FDB022` |
| Informação | `#12365A` | `#53B1FD` |

Não utilizar cores saturadas em grandes áreas sem necessidade.

---

# 23. Cor não pode ser o único indicador

Nunca comunicar estado apenas através da cor.

Incorreto:

```text
●
```

onde somente a tonalidade explica o significado.

Preferir:

```text
⚠ Estoque baixo

Pendente

Concluída

Cancelada
```

combinando quando apropriado:

- texto;
- cor;
- ícone;
- símbolo;
- badge.

---

# 24. Status financeiros

Indicadores financeiros não deverão possuir automaticamente uma cor diferente para cada categoria.

Exemplo:

```text
Faturamento
Entradas
Saídas
Resultado estimado
```

podem utilizar a identidade neutra da interface.

Cores semânticas deverão ser reservadas para quando houver significado real.

Exemplo:

```text
Resultado negativo
```

poderá exigir destaque apropriado.

---

# 25. Despesas recorrentes

Os estados deverão possuir diferenciação visual consistente.

## Pendente

Utilizar aparência de atenção moderada.

A cor de aviso poderá ser utilizada quando adequado.

## Paga

Utilizar estado positivo.

## Ignorada

Utilizar aparência neutra ou secundária.

Não utilizar vermelho, porque ignorar uma ocorrência não representa necessariamente erro.

---

# 26. Estoque

Estoque normal:

```text
aparência neutra
```

Estoque baixo:

```text
aviso
```

Produto sem estoque na Vitrine:

```text
Indisponível
```

deverá possuir aparência neutra/secundária suficiente para comunicar indisponibilidade sem parecer erro do sistema.

---

# 27. Vendas

Estados como:

```text
Concluída
Cancelada
```

deverão possuir texto explícito.

`Concluída` poderá utilizar indicação positiva.

`Cancelada` poderá utilizar indicação destrutiva ou neutra de cancelamento conforme o componente.

A cor nunca substitui o texto.

---

# 28. Painel Administrativo

O Painel Administrativo utiliza a mesma identidade do sistema.

Não criar uma paleta separada para ADMIN.

A diferenciação deverá acontecer principalmente através de:

- título;
- contexto;
- navegação;
- conteúdo.

Isso evita transformar o ADMIN em um segundo produto visual.

---

# 29. Tema do ADMIN

O Painel Administrativo também deverá funcionar em:

```text
Tema Claro
Tema Escuro
Padrão do Sistema
```

Os mesmos tokens estruturais deverão ser reutilizados.

---

# 30. Vitrine Digital

A Vitrine Pública utiliza a identidade visual do Estilo e Gestão, mas sua aparência não deverá ser automaticamente controlada pela preferência privada:

```text
Tema Claro
Tema Escuro
Padrão do Sistema
```

selecionada pelo barbeiro para utilizar o painel.

A preferência do sistema autenticado e a apresentação pública da Vitrine são conceitos separados.

---

# 31. Identidade da barbearia na Vitrine

A identidade própria da barbearia poderá aparecer através de:

- logo;
- capa;
- imagens;
- Portfólio;
- conteúdo textual.

A versão inicial não permitirá que cada barbearia substitua livremente toda a paleta estrutural da aplicação.

---

# 32. Por que utilizar tons neutros

O sistema possui muitas informações administrativas:

- preços;
- vendas;
- despesas;
- estoque;
- relatórios;
- indicadores.

Uma interface com muitas cores simultâneas dificultaria a leitura.

A base neutra permite que um alerta realmente se destaque quando necessário.

Exemplo:

```text
Estoque normal
→ neutro

Estoque baixo
→ aviso
```

---

# 33. Contraste

Textos, ícones, controles, bordas importantes e estados de foco deverão possuir contraste adequado com o fundo.

Isso deverá ser verificado individualmente em:

- Tema Claro;
- Tema Escuro.

Não presumir que uma cor adequada no Tema Claro também funcionará no Tema Escuro.

---

# 34. Textos secundários

Texto secundário deverá continuar legível.

Não utilizar tonalidades tão fracas que obriguem o usuário a aproximar o rosto do monitor para descobrir uma descrição.

No Tema Claro:

```text
#666662
```

é a referência principal.

No Tema Escuro:

```text
#B8B8B2
```

é a referência principal.

---

# 35. Hierarquia visual

Exemplo no Tema Claro:

```text
Título
→ #2F2F2D

Texto principal
→ #2F2F2D

Texto secundário
→ #666662

Fundo
→ #F4F4F0

Card
→ #FFFFFF
```

Exemplo no Tema Escuro:

```text
Título
→ #F4F4F0

Texto principal
→ #F4F4F0

Texto secundário
→ #B8B8B2

Fundo
→ #181817

Card
→ #222220
```

---

# 36. Gráficos

Gráficos deverão priorizar:

- legibilidade;
- poucos elementos simultâneos;
- contraste;
- identificação textual.

Não utilizar uma grande quantidade de cores apenas para deixar o gráfico mais chamativo.

Quando houver uma única série, utilizar cor coerente com a identidade.

Quando houver múltiplas categorias, as cores adicionais deverão ser definidas durante a prototipação respeitando:

- acessibilidade;
- contraste;
- diferenciação;
- consistência entre temas.

Não utilizar cores sem documentá-las posteriormente caso passem a fazer parte do padrão oficial.

---

# 37. Estados de foco

O foco deverá continuar facilmente perceptível nos dois temas.

Pode utilizar:

- cor informativa;
- contorno contrastante;
- combinação equivalente.

Não remover o foco visual.

---

# 38. Estado desabilitado

Elementos desabilitados deverão parecer indisponíveis, mas continuar compreensíveis.

Não utilizar opacidade tão baixa que:

- texto desapareça;
- ícone fique ilegível;
- usuário não consiga descobrir o que está indisponível.

O Design System define o comportamento completo.

---

# 39. Hover e pressionado

Estados de hover e pressionado deverão continuar reconhecíveis nos dois temas.

No Tema Claro, ações escuras poderão utilizar:

```text
#3A3A38
```

como referência de hover.

No Tema Escuro, ações claras poderão utilizar:

```text
#E9E9E4
```

como referência.

Estados adicionais poderão ser ajustados durante a prototipação desde que preservem a hierarquia definida.

---

# 40. Evitar excesso de cores

Não definir uma cor própria para cada módulo.

Evitar:

```text
PDV = azul
Estoque = verde
Financeiro = roxo
Produtos = laranja
Vitrine = rosa
ADMIN = vermelho
```

sem finalidade funcional.

Os módulos pertencem ao mesmo sistema.

---

# 41. Consistência

A mesma função deverá possuir comportamento cromático semelhante em todas as telas.

Exemplo:

ações destrutivas como:

```text
Excluir produto
Excluir despesa
Excluir conta
```

deverão seguir o mesmo padrão semântico.

---

# 42. Tokens recomendados

A implementação deverá preferir tokens como:

```text
background
surface
surface-secondary
border

text-primary
text-secondary

primary
primary-hover
on-primary

success
success-background

danger
danger-background

warning
warning-background

info
info-background
```

Evitar espalhar valores HEX diretamente por dezenas de componentes.

---

# 43. Resumo geral da paleta

## Marca

| Função | Cor |
|---|---|
| Grafite principal | `#2F2F2D` |
| Grafite secundário | `#3A3A38` |
| Cinza intermediário | `#666662` |
| Cinza claro | `#E9E9E4` |
| Fundo claro | `#F4F4F0` |
| Branco | `#FFFFFF` |

## Tema Escuro

| Função | Cor |
|---|---|
| Fundo | `#181817` |
| Superfície | `#222220` |
| Superfície secundária | `#2B2B29` |
| Borda | `#3F3F3B` |
| Texto principal | `#F4F4F0` |
| Texto secundário | `#B8B8B2` |

## Semânticas

| Estado | Claro | Escuro |
|---|---|---|
| Sucesso | `#2F6B4F` | `#6FB892` |
| Erro | `#B42318` | `#F97066` |
| Aviso | `#B54708` | `#FDB022` |
| Informação | `#175CD3` | `#53B1FD` |

---

# 44. Prototipação

Durante a prototipação no Stitch deverão ser avaliados:

- contraste;
- legibilidade;
- equilíbrio dos grafites;
- superfícies;
- Tema Claro;
- Tema Escuro;
- botões;
- alertas;
- badges;
- gráficos;
- Dashboard;
- PDV;
- Financeiro;
- Vitrine;
- Painel Administrativo.

A paleta deste documento deverá ser utilizada como referência.

O Stitch não deverá inventar uma nova identidade cromática.

---

# 45. Alteração futura da paleta

As cores definidas neste documento são a base oficial atual para a prototipação.

Elas poderão ser ajustadas caso testes reais revelem problemas de:

- contraste;
- acessibilidade;
- legibilidade;
- identidade;
- uso prolongado.

Uma alteração aprovada deverá ser refletida neste documento e no Design System.

---

# 46. Critério de aprovação

O esquema de cores estará aprovado para prototipação quando:

- Tema Claro possuir paleta definida;
- Tema Escuro possuir paleta definida;
- Padrão do Sistema estiver relacionado aos dois temas;
- cores semânticas estiverem definidas;
- ações principais possuírem contraste adequado;
- alertas e status não dependerem somente de cor;
- componentes puderem reutilizar tokens entre temas;
- Painel Administrativo utilizar a mesma identidade;
- Vitrine permanecer relacionada à identidade do produto;
- protótipos utilizarem esta paleta de forma consistente.

---