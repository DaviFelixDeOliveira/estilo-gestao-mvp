# Esquema de Cores — Estilo e Gestão

## Objetivo

Este documento explica a escolha das cores utilizadas no **Estilo e Gestão**, o significado visual de cada grupo e o motivo de sua utilização.

Ele é voltado para apresentação e compreensão da identidade visual.

As regras específicas de aplicação das cores em botões, inputs, alertas e componentes pertencem ao `DESIGN_SYSTEM.md`.

---

# 1. Conceito visual

O Estilo e Gestão é um sistema voltado à administração e divulgação de pequenas barbearias.

A identidade visual foi pensada para transmitir principalmente:

- profissionalismo;
- organização;
- confiança;
- simplicidade;
- modernidade.

Por isso, a base visual utiliza tons neutros e escuros, evitando cores excessivamente chamativas.

---

# 2. Paleta principal

## Grafite principal

```text
#2F2F2D
```

É a cor mais escura da identidade.

Representa:

- estabilidade;
- profissionalismo;
- seriedade;
- organização.

O grafite também possui relação visual com ambientes de barbearia, nos quais tons escuros são comuns em:

- móveis;
- equipamentos;
- identidade visual;
- decoração.

---

## Grafite secundário

```text
#3A3A38
```

É uma variação mais clara do grafite principal.

Sua função é complementar a identidade sem criar grande diferença visual.

Ajuda a manter uma aparência:

- discreta;
- consistente;
- sofisticada.

---

## Cinza intermediário

```text
#666662
```

É utilizado como cor neutra intermediária.

Visualmente, ajuda a criar hierarquia entre:

- informações principais;
- informações secundárias.

O cinza reduz a necessidade de utilizar preto em todos os textos e elementos.

---

# 3. Cores claras

## Cinza claro

```text
#E9E9E4
```

É utilizado para criar separação suave entre áreas da interface.

Pode representar visualmente:

- divisões;
- superfícies secundárias;
- elementos neutros.

Sua tonalidade evita o contraste rígido de interfaces construídas apenas com preto e branco.

---

## Fundo claro

```text
#F4F4F0
```

É utilizado como base clara da aplicação.

Sua tonalidade levemente quente reduz a aparência fria de um branco puro e combina com os grafites da identidade.

O objetivo é criar uma interface:

- confortável;
- limpa;
- discreta.

---

## Branco

```text
#FFFFFF
```

O branco é utilizado para superfícies que precisam se destacar sobre o fundo principal.

Exemplos conceituais:

- cards;
- formulários;
- áreas internas.

Ele também ajuda a manter boa legibilidade.

---

# 4. Cor de destaque

## Verde profundo

Cor atualmente proposta:

```text
#2F6B4F
```

O verde poderá ser utilizado como cor de destaque e ação principal.

A escolha busca transmitir:

- progresso;
- resultado positivo;
- crescimento;
- confirmação.

Também cria contraste com a base neutra sem tornar a interface excessivamente colorida.

A adoção definitiva desse tom deverá ser validada durante a prototipação.

---

# 5. Estrutura visual da paleta

A identidade pode ser resumida da seguinte forma:

```text
Grafites
↓
identidade principal e hierarquia

Cinzas claros
↓
fundos e separação

Branco
↓
superfícies

Verde
↓
destaque e ação
```

A maior parte da interface continuará neutra.

As cores de destaque serão utilizadas de forma controlada.

---

# 6. Por que utilizar tons neutros

O sistema possui grande quantidade de informações administrativas, como:

- valores;
- produtos;
- estoque;
- vendas;
- relatórios.

Uma interface com muitas cores diferentes poderia dificultar a leitura.

Os tons neutros permitem que cores semânticas importantes se destaquem quando realmente forem necessárias.

Exemplo:

```text
Estoque normal
→ interface neutra

Estoque baixo
→ alerta ganha destaque
```

---

# 7. Cores semânticas

Além da identidade principal, a aplicação precisará de cores específicas para representar estados.

Os grupos necessários são:

- sucesso;
- erro;
- aviso;
- informação.

Os valores HEX definitivos deverão ser escolhidos durante o Design System e testados quanto ao contraste.

---

# 8. Sucesso

O sucesso representa operações concluídas corretamente.

Exemplos:

- venda registrada;
- produto salvo;
- estoque atualizado;
- configuração salva.

A cor deverá ser visualmente positiva, normalmente utilizando tonalidades verdes.

O verde de ação poderá ou não ser utilizado também para sucesso, dependendo dos testes visuais.

---

# 9. Erro

O erro deverá possuir uma cor própria associada a:

- falha;
- campo inválido;
- operação não concluída;
- ação destrutiva.

Normalmente será utilizada uma tonalidade vermelha.

O valor definitivo será definido no Design System.

---

# 10. Aviso

O aviso representa uma situação que exige atenção, mas não necessariamente um erro.

Exemplos:

- estoque baixo;
- preço de venda abaixo do custo;
- informação importante antes de continuar.

Será utilizada tonalidade apropriada de amarelo ou laranja.

---

# 11. Informação

A cor informativa poderá ser utilizada para mensagens neutras que precisam de destaque.

Exemplos:

- orientação;
- informação adicional;
- estado em processamento.

O valor definitivo será escolhido durante a prototipação.

---

# 12. Cor não pode ser o único indicador

Uma informação nunca deverá depender somente da cor.

Exemplo incorreto:

```text
●
```

onde apenas a cor indica que o estoque está baixo.

Exemplo adequado:

```text
⚠ Estoque baixo
```

O sistema poderá combinar:

- cor;
- texto;
- ícone;
- símbolo.

Isso melhora a compreensão e a acessibilidade.

---

# 13. Contraste

Textos e elementos importantes deverão possuir contraste adequado com o fundo.

Evitar combinações como:

```text
cinza muito claro
sobre
fundo branco
```

quando isso prejudicar a leitura.

A escolha final das combinações deverá considerar critérios de acessibilidade.

---

# 14. Hierarquia

As cores também ajudam a mostrar importância.

Exemplo conceitual:

```text
Título principal
→ grafite forte

Texto comum
→ grafite

Texto secundário
→ cinza

Ação principal
→ verde

Informação auxiliar
→ neutra
```

Isso permite que o usuário entenda rapidamente quais elementos possuem maior importância.

---

# 15. Uso da cor na área administrativa

A área administrativa deverá possuir aparência predominantemente neutra.

A intenção é facilitar:

- leitura;
- uso prolongado;
- análise de números;
- identificação dos estados importantes.

O sistema não deverá parecer uma página publicitária durante tarefas de gestão.

---

# 16. Uso da cor na Vitrine

A Vitrine pública poderá possuir composição visual mais expressiva que o painel administrativo.

Mesmo assim, continuará seguindo a identidade principal do Estilo e Gestão.

A identidade da própria barbearia poderá aparecer através de:

- logo;
- capa;
- imagens;
- Portfólio.

O MVP não permitirá alteração livre de toda a paleta pelo barbeiro.

---

# 17. Relação com a marca

A paleta principal deverá manter relação visual com a identidade do Estilo e Gestão.

As cores utilizadas no sistema não precisam aparecer todas diretamente na logo.

Cores semânticas existem principalmente para comunicação da interface.

Exemplo:

o vermelho de erro não precisa fazer parte da marca para ser utilizado quando uma ação falhar.

---

# 18. Consistência

A mesma função deverá utilizar o mesmo padrão de cor em todo o sistema.

Exemplo:

se ações destrutivas utilizarem vermelho:

```text
Excluir produto
Cancelar venda
Excluir imagem
```

deverão seguir o mesmo padrão visual.

---

# 19. Evitar excesso de cores

Não utilizar uma cor diferente para cada módulo.

Exemplo a evitar:

```text
PDV = azul
Estoque = verde
Financeiro = roxo
Produtos = laranja
Vitrine = rosa
```

sem necessidade funcional.

Essa estratégia cria poluição visual e enfraquece a identidade.

---

# 20. Resumo da paleta

| Função | Cor |
|---|---|
| Grafite principal | `#2F2F2D` |
| Grafite secundário | `#3A3A38` |
| Cinza intermediário | `#666662` |
| Cinza claro | `#E9E9E4` |
| Fundo claro | `#F4F4F0` |
| Branco | `#FFFFFF` |
| Destaque proposto | `#2F6B4F` |
| Sucesso | A definir |
| Erro | A definir |
| Aviso | A definir |
| Informação | A definir |

---

# 21. Decisões ainda pendentes

Ainda deverão ser definidos:

- tom definitivo da cor de destaque;
- cor de sucesso;
- cor de erro;
- cor de aviso;
- cor de informação;
- combinações finais de contraste;
- aplicação final nos protótipos.

---

# 22. Critério de aprovação

O esquema de cores será considerado final quando:

- paleta principal estiver aprovada;
- cores semânticas estiverem definidas;
- contraste estiver validado;
- protótipos principais estiverem utilizando a paleta;
- a identidade permanecer consistente em Mobile e Desktop;
- a Vitrine e o painel administrativo estiverem visualmente relacionados sem parecerem a mesma tela.