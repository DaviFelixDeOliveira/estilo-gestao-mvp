# Modelagem de Dados — Visão Conceitual

**Status:** Proposta para o MVP.  
**Importante:** o SQL de exemplo em arquivo separado é ilustrativo e deve ser revisado antes de virar migration.

---

## Entidades principais

### 1. barbearias

Tenant do sistema e identidade principal da Vitrine.

Também pode concentrar, no MVP, configurações públicas simples para evitar uma tabela adicional de Vitrine.

### 2. perfis

Vínculo entre `auth.users` e a barbearia.

MVP:

- uma barbearia;
- um usuário `BARBEIRO` responsável por barbearia;
- perfis `ADMIN` internos sem barbearia vinculada.

A modelagem com `barbearia_id` evita reescrita caso o SaaS passe a atender várias barbearias, mantendo isolamento dos dados.

A senha **não fica nessa tabela**. Ela é gerenciada pelo Supabase Auth.

### 3. servicos

Catálogo de serviços.

Armazena:

- preço;
- custo estimado de insumos opcional;
- ativo/inativo;
- visibilidade pública.

### 4. categorias_produto

Categorias de produtos pertencentes à barbearia.

Exemplos:

- Bebida;
- Pomada;
- Shampoo;
- Cera;
- Acessórios.

O sistema pode possuir uma lista de **sugestões padrão no código/configuração da aplicação**.

Uma sugestão somente precisa virar registro em `categorias_produto` quando aquela barbearia realmente utilizá-la.

O barbeiro também pode criar categorias personalizadas.

Não é necessário armazenar no banco se a categoria veio de sugestão ou foi personalizada, porque isso não altera o comportamento depois que ela existe.

### 5. produtos

Bebidas e produtos vendidos.

Cada produto se relaciona com uma categoria da própria barbearia.

### 6. vendas

Cabeçalho da venda.

Status do MVP:

- `CONCLUIDA`;
- `CANCELADA`.

Uma comanda ainda em edição não é persistida como venda pendente.

### 7. venda_itens

Itens congelados da venda.

Preserva o histórico mesmo que preço/custo do cadastro mude.

### 8. despesas

Saídas financeiras registradas.

### 9. movimentacoes_estoque

Auditoria das alterações de estoque.

### 10. portfolio

Fotos/trabalhos publicados ou ocultos.

### 11. horarios_funcionamento

Horários públicos da barbearia.

---

## Relações

```text
auth.users
    │
    ▼
perfis ─────► barbearias
                 │
                 ├── servicos
                 ├── categorias_produto
                 │      └── produtos
                 ├── vendas
                 │      └── venda_itens
                 ├── despesas
                 ├── movimentacoes_estoque
                 ├── portfolio
                 └── horarios_funcionamento
```

---

## Por que não existe tabela Cliente?

Cadastro de clientes e lembretes automáticos estão fora do MVP.

## Por que não existe tabela Agendamento?

Agendamento foi explicitamente retirado do MVP.

Horários de funcionamento não representam agenda.

## Por que existem tabelas de planos e assinaturas?

Mesmo sem cobrança automática por gateway, a versão inicial precisa representar três planos, validade, pagamento manual, cortesia, upgrade, downgrade, cancelamento e histórico.

Por isso a modelagem oficial utiliza:

- `planos` para o catálogo central;
- `assinaturas` para o estado atual de cada barbearia;
- `pagamentos_assinatura` para registros permanentes dos pagamentos reais;
- `historico_administrativo` para mudanças e ações permanentes.

O campo `assistente_ia_ativo` representa somente a escolha da barbearia de exibir o recurso. O direito de uso vem do Plano Com IA e da cota vigente, sem um booleano administrativo paralelo de liberação.

## Por que não existe tabela Vitrine?

No MVP, os dados públicos mais simples podem ficar na própria tabela `barbearias`.

Portfólio e horários já possuem suas tabelas próprias.

Se a Vitrine crescer muito, uma tabela específica poderá ser criada posteriormente.

---

## Categorias sugeridas

Exemplos de sugestões da aplicação:

- Bebida;
- Pomada;
- Shampoo;
- Cera;
- Óleo/Balm para barba;
- Acessórios;
- Outros.

As sugestões não precisam gerar registros em todas as barbearias.

Fluxo conceitual:

```text
Sugestão da aplicação
        │
        │ barbeiro seleciona
        ▼
categorias_produto da barbearia
        │
        ▼
produto
```

Se o barbeiro criar uma nova categoria, ela vai diretamente para `categorias_produto`.

---

## Estoque mínimo

`estoque_minimo` é opcional.

Regra conceitual:

```text
estoque_minimo IS NOT NULL
AND estoque_atual <= estoque_minimo
→ estoque baixo
```

O valor pode ser maior que o estoque atual. Isso representa justamente um produto já abaixo da quantidade desejada.

---

## Dinheiro

PostgreSQL:

- `numeric(12,2)` para valores monetários.

Não usar `real`/`float` como fonte financeira.

---

## Histórico

`venda_itens` preserva:

- nome;
- preço;
- custo;
- quantidade;
- tipo.

Isso impede alterações retroativas quando o cadastro muda.

---

## Status da venda

### CONCLUIDA

Venda finalizada e válida.

### CANCELADA

Venda anteriormente concluída que foi cancelada.

A venda cancelada:

- permanece no histórico;
- não compõe agregados de vendas válidas;
- pode gerar reversão de estoque.

Não é necessário status `PENDENTE` para a comanda em edição.

---

## Exclusão

Preferir:

- `ativo=false` para serviços/produtos históricos;
- `ativo=false` para categorias que já tenham produtos;
- `status=CANCELADA` para vendas;
- exclusão física somente quando não destrói rastreabilidade.

---

## Estoque

Toda alteração relevante cria uma movimentação.

Não depender apenas do número atual do produto.

---

## Dados públicos da Vitrine

A Vitrine é a página pública completa.

No MVP, dados como os seguintes podem ficar em `barbearias`:

- nome da marca;
- nome profissional;
- descrição/Sobre;
- WhatsApp/telefone;
- Instagram;
- atende a domicílio;
- endereço;
- logo;
- capa;
- slug;
- publicada/despublicada.

Serviços, produtos e Portfólio controlam sua própria visibilidade pública.

---

## RLS

Todas as tabelas privadas devem possuir RLS.

A leitura pública não deve abrir as tabelas administrativas indiscriminadamente.

Preferir:

- view/função pública específica;
- ou políticas estritamente limitadas aos campos/linhas realmente públicas.

---

## Administrador / Operador do SaaS

O painel administrativo mínimo previsto precisa de uma estratégia de autenticação/autorização própria.

**Decisão aprovada:**

- o operador é identificado por `perfis.tipo = ADMIN`, atribuído somente por operação interna protegida;
- as ações permitidas são endpoints específicos para consulta administrativa, pagamento, cortesia, plano, suspensão, reativação, manutenção e extensão de cota da IA;
- o acesso não desativa RLS genericamente e nunca concede leitura dos dados operacionais privados das barbearias.

Não criar RBAC complexo na primeira versão.

---

## Ponto ainda sujeito a revisão

A forma exata de expor a Vitrine publicamente deve ser implementada sem tornar colunas privadas de `barbearias`, `produtos` ou `servicos` acessíveis por engano.

---

## Modelo oficial após os blocos de decisão

Além das tabelas operacionais já documentadas, a modelagem oficial inclui:

| Estrutura | Responsabilidade |
| --- | --- |
| `planos` | Catálogo Grátis, Normal e Com IA, com preço e situação comercial |
| `assinaturas` | Um estado atual por barbearia, inclusive no Grátis |
| `pagamentos_assinatura` | Um registro imutável por pagamento real |
| `historico_administrativo` | Eventos de plano, status e ações administrativas |
| `configuracoes_sistema` | Registro único de manutenção global |
| `retencoes_contas_excluidas` | Identificação retida por cinco anos após exclusão, sem dados operacionais |
| `codigos_reservados` | Impede reutilização de códigos `EG-XXXXXX` |
| `uso_ia_mensal` | Contagem de respostas por ciclo, sem conteúdo das conversas |
| `aceites_legais` | Versão e data dos aceites dos documentos legais |

Alterações necessárias:

- `barbearias.codigo`: `UNIQUE`, `NOT NULL` e imutável;
- `barbearias.status_conta`: `ATIVA` ou `SUSPENSA`;
- `perfis.tipo`: `BARBEIRO` ou `ADMIN`;
- cadastro público sempre cria `BARBEIRO`;
- toda barbearia possui uma assinatura atual, mesmo no Grátis.

## Regra de recursos

O banco guarda o plano comercial atual. As permissões de cada plano são definidas centralmente no código e consultadas por `hasFeature`. Não duplicar booleanos de cada recurso em todas as assinaturas.

## Regra de validade

O acesso não depende somente de um status gravado. O backend calcula o plano efetivo usando `fim_periodo`. Se venceu, considera Grátis imediatamente e depois registra a transição no histórico.

## Retenção após exclusão

No fluxo de exclusão, pagamentos reais e ações essenciais deixam de apontar para a barbearia ativa e passam a apontar para a retenção separada. Código, nome e e-mail podem permanecer por cinco anos. Ao final, apagar a retenção e todos os registros identificáveis relacionados.

## Estoque e Financeiro

Reposição de estoque não cria despesa automaticamente. O barbeiro registra a despesa separadamente quando desejar e poderá relacioná-la opcionalmente à reposição.

## Recursos futuros

Não criar tabelas de Agendamento, Funcionários ou módulos ainda não implementados. O modelo deverá ser estendido somente quando o módulo entrar no produto.
