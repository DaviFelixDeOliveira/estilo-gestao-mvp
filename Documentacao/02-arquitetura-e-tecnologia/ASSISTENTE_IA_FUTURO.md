# Assistente IA — Planejamento Futuro

## Status

**FUTURO / NÃO IMPLEMENTADO**

O Assistente IA não faz parte da versão inicial do sistema.

A arquitetura atual deve permanecer preparada para permitir a inclusão desse módulo futuramente sem remodelar o núcleo do produto.

## Estado da versão inicial

Na versão inicial:

- não existe plano `COM_IA`;
- não existe integração com Gemini;
- não existe chat de IA na Vitrine;
- não existe coluna `assistente_ia_ativo`;
- não existe tabela `uso_ia_mensal`;
- não existe controle de cota da IA;
- não existe configuração de IA para a barbearia;
- não existe funcionalidade administrativa específica de IA.

Os planos previstos inicialmente no banco são:

- `GRATIS`;
- `NORMAL`.

## Princípio de expansão

Quando o Assistente IA for aprovado para implementação, ele deve entrar por novas migrations e novos módulos da aplicação.

Não alterar migrations antigas já aplicadas.

Exemplo:

```text
supabase/migrations/
├── ..._initial_schema.sql
└── ..._add_ai_assistant.sql
```

## Banco de dados

A migration futura deverá:

- adicionar `COM_IA` ao tipo `codigo_plano`;
- criar o registro comercial do plano;
- adicionar `barbearias.assistente_ia_ativo`;
- criar `uso_ia_mensal`;
- criar índices necessários;
- adicionar RLS/policies necessárias;
- registrar ações administrativas no `historico_administrativo`.

## Controle de recursos

A aplicação deverá concentrar permissões comerciais em uma função como:

```text
hasFeature(...)
```

Exemplo conceitual:

```text
GRATIS
→ recursos gratuitos

NORMAL
→ recursos do Grátis
→ PDV
→ Estoque
→ Financeiro
→ Relatórios

COM_IA
→ recursos do Normal
→ Assistente IA
```

Não criar vários booleanos duplicados de autorização no banco.

## Backend

A integração com IA deve existir somente no servidor.

Fluxo esperado:

```text
Visitante
   ↓
Vitrine
   ↓
Route Handler / servidor Next.js
   ↓
validar barbearia
   ↓
validar plano efetivo
   ↓
validar assistente_ia_ativo
   ↓
validar cota
   ↓
montar contexto público
   ↓
API de IA
```

Nunca chamar a API de IA diretamente pelo navegador.

## Segurança

O contexto da IA poderá utilizar apenas dados públicos autorizados, como:

- nome da barbearia;
- descrição pública;
- serviços públicos;
- preços públicos;
- produtos públicos;
- horários;
- formas de pagamento aceitas;
- endereço público;
- demais informações da Vitrine.

Nunca enviar:

- vendas;
- despesas;
- faturamento;
- lucro;
- movimentações de estoque;
- preço de custo;
- estoque interno;
- dados administrativos;
- dados de outras barbearias.

## Ambiente

Quando a implementação começar, adicionar variáveis server-side, por exemplo:

```text
GEMINI_API_KEY
GEMINI_MODEL
```

Nunca expor chave privada com prefixo `NEXT_PUBLIC_`.

## Limites anteriormente estudados

Os valores abaixo são apenas referência para revisão futura:

```text
1.000 respostas por ciclo da barbearia
20 mensagens por conversa
10 mensagens por minuto por visitante
15 segundos de timeout
```

Nenhum desses limites é regra ativa enquanto o módulo não estiver implementado.

## Vitrine pública

O Assistente deverá aparecer somente quando todas as condições forem verdadeiras:

```text
plano efetivo = COM_IA
+
assistente_ia_ativo = true
+
conta ativa
+
sistema fora de manutenção
+
cota disponível
```

## Área da barbearia

Adicionar futuramente uma configuração semelhante a:

```text
Assistente IA
[ Ativar na Vitrine ]
```

Essa configuração só deve existir para barbearias com direito ao recurso.

## Painel ADMIN

O painel poderá futuramente apresentar:

- consumo do ciclo;
- limite;
- percentual utilizado;
- alerta de consumo elevado;
- extensão excepcional de cota;
- histórico das extensões.

Extensões administrativas devem exigir justificativa e gerar evento no `historico_administrativo`.

## Testes obrigatórios

Antes de liberar o módulo, testar:

- Grátis não possui acesso;
- Normal não possui acesso;
- Com IA possui acesso;
- recurso desativado não aparece;
- conta suspensa não possui acesso;
- manutenção global bloqueia acesso;
- cota esgotada bloqueia respostas;
- rate limit funciona;
- timeout funciona;
- tenant A nunca utiliza dados do tenant B;
- dados privados nunca entram no contexto;
- chave da API nunca aparece no navegador.

## Ordem futura de implementação

1. Revisar este documento.
2. Revisar regras comerciais.
3. Criar migration `add_ai_assistant`.
4. Adicionar plano `COM_IA`.
5. Adicionar estruturas de uso da IA.
6. Atualizar `hasFeature`.
7. Criar integração server-side.
8. Criar configuração da barbearia.
9. Criar chat da Vitrine.
10. Criar controles ADMIN.
11. Implementar testes.
12. Validar segurança.
13. Liberar gradualmente.

## Regra principal

Não implementar estruturas do Assistente IA antecipadamente apenas porque o recurso pode existir futuramente.

Este documento é o ponto oficial de retomada quando o recurso voltar ao escopo.
