# Skill — Responsividade

## Objetivo

Orientar a IA a manter o Estilo e Gestão utilizável em diferentes tamanhos de tela.

A referência completa é `RESPONSIVIDADE.md` da documentação de Design e Interface.

---

# Princípio

Projetar por comportamento e espaço disponível, não por modelo específico de aparelho.

Utilizar Mobile First.

---

# Mobile

Priorizar:

- uma coluna;
- ações confortáveis para toque;
- navegação compacta;
- textos legíveis;
- formulários simples;
- ausência de overflow horizontal.

---

# Tablet

Pode utilizar:

- duas ou mais colunas quando couber;
- navegação adaptada;
- maior aproveitamento horizontal.

Não tratar tablet como desktop comprimido.

---

# Desktop

Pode utilizar:

- sidebar;
- tabelas;
- conteúdo lado a lado;
- PDV dividido entre catálogo e comanda.

Não esticar conteúdo indefinidamente.

---

# Tabelas

No mobile:

- converter para cards/listas quando adequado;
- utilizar scroll horizontal apenas quando a estrutura tabular for realmente necessária.

---

# PDV

Mobile:

- catálogo;
- total acessível;
- comanda facilmente acessível;
- Finalizar venda visível.

Desktop:

```text
Catálogo | Comanda
```

---

# Modais

Conteúdo curto:

- modal.

Conteúdo grande em mobile:

- tela dedicada;
- drawer;
- bottom sheet.

---

# Safe Area

Elementos fixos devem considerar áreas reservadas do dispositivo.

---

# Teclado virtual

Inputs, formulários e chat devem continuar utilizáveis com o teclado aberto.

---

# Hover

Nunca depender de hover para:

- descobrir botão;
- executar ação;
- acessar informação obrigatória.

---

# Testes mínimos

Verificar aproximadamente:

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

Também testar pelo menos um celular real.