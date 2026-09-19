# Skill — Design do Estilo e Gestão

## Objetivo

Orientar a criação das interfaces do Estilo e Gestão de forma consistente, simples e funcional.

A referência completa é:

- `DESIGN_SYSTEM.md`;
- `ESQUEMA_DE_CORES.md`;
- `RESPONSIVIDADE.md`.

---

# Regras principais

1. Desenvolver com abordagem Mobile First.
2. Manter uma ação principal clara por contexto.
3. Priorizar usabilidade antes de decoração.
4. Utilizar os tokens definidos no Design System.
5. Manter hierarquia visual clara.
6. Utilizar Lucide React como biblioteca padrão de ícones.
7. Inputs devem possuir label.
8. Ações destrutivas devem possuir distinção visual.
9. Não depender apenas de cor para indicar estado.
10. Não depender de hover para ações essenciais.
11. Preservar a proporção de logos e imagens.
12. Evitar conteúdo excessivo na mesma tela.

---

# Estados obrigatórios

Quando aplicável, considerar:

- Loading;
- Success;
- Empty;
- Error;
- Disabled.

Não desenhar apenas o estado ideal da tela.

---

# Componentes prioritários

Criar componentes reutilizáveis quando houver repetição real.

Exemplos:

- Button;
- Input;
- Select;
- Modal;
- Card;
- Badge;
- Toast;
- EmptyState;
- ErrorState;
- Skeleton;
- MoneyValue;
- ProductCard;
- ServiceCard;
- ConfirmDialog.

---

# PDV

O PDV deve priorizar:

1. localizar item;
2. adicionar item;
3. visualizar comanda;
4. visualizar total;
5. finalizar venda.

Não sacrificar velocidade para adicionar decoração.

---

# Dashboard

Mostrar primeiro as informações que ajudam o barbeiro a entender o negócio.

Não criar gráfico apenas para preencher espaço.

---

# Vitrine

A Vitrine pública deve parecer uma página destinada a clientes.

Não reutilizar visualmente o painel administrativo como se fosse uma Vitrine.

---

# Anti-padrões

Evitar:

- excesso de cards;
- sombra pesada;
- gradientes aleatórios;
- baixo contraste;
- textos minúsculos;
- vários botões principais;
- ícones ambíguos sem texto;
- formulário grande em modal pequeno;
- informação duplicada;
- animações sem função.