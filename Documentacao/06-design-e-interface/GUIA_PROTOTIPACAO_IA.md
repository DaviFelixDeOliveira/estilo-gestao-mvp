# Guia de Prototipação para IA — Estilo e Gestão

## Objetivo

Este documento orienta a IA responsável pela prototipação do **Estilo e Gestão**.

A ferramenta atual é o **Stitch**.

A documentação do projeto é a fonte oficial de verdade. O protótipo não deve inventar funcionalidades, campos, entidades, automações, integrações ou regras financeiras apenas porque são comuns em sistemas parecidos.

---

# 1. Documentos-base obrigatórios

Para toda nova tela, considerar sempre estes quatro arquivos visuais:

```text
GUIA_PROTOTIPACAO_IA.md
DESIGN_SYSTEM.md
RESPONSIVIDADE.md
ESQUEMA_DE_CORES.md
```

Adicionar também **um fluxo funcional conforme o ator da tela**:

```text
Área autenticada do barbeiro → FLUXO_BARBEIRO.md
Vitrine pública / visitante → FLUXO_CLIENTE.md
Painel administrativo → FLUXO_ADMIN.md
```

Assim, a prototipação continua trabalhando normalmente com cinco arquivos-base por contexto, sem carregar fluxos de atores que não participam daquela tela.

Antes de cada etapa, informar explicitamente quais arquivos adicionais devem ser anexados.

Se não houver nenhum adicional, usar:

```text
Arquivos adicionais: nenhum.
```

---

# 2. Documentos adicionais por contexto

## Dashboard, PDV, Serviços, Produtos e Estoque

Adicionar quando for necessário confirmar entidades, indicadores, estoque, venda ou snapshots:

```text
BANCO_DE_DADOS.md
```

## Login, recuperação de senha, conta, exclusão e dados sensíveis

Adicionar:

```text
DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md
```

## Vitrine pública

Adicionar:

```text
BANCO_DE_DADOS.md
DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md
```

## Dúvida de escopo

Consultar:

```text
DOCUMENTO_VISAO.md
```

## Casos de borda e erros

Consultar:

```text
PLANO_DE_TESTES.md
```

## Terminologia e instruções ao usuário

Consultar:

```text
MANUAL_DO_USUARIO.md
```

---

# 3. Hierarquia das fontes

Quando houver conflito:

```text
Regra específica aprovada da funcionalidade
↓
Fluxo do ator correspondente
(FLUXO_BARBEIRO.md | FLUXO_CLIENTE.md | FLUXO_ADMIN.md)
↓
DESIGN_SYSTEM.md
↓
RESPONSIVIDADE.md
↓
ESQUEMA_DE_CORES.md
↓
DOCUMENTO_VISAO.md
↓
Referências complementares
```

Uma decisão aprovada durante a prototipação deve ser incorporada aos documentos antes da implementação definitiva.

---

# 4. Regra de continuidade visual

Telas já aprovadas são referência visual e não devem ser redesenhadas sem solicitação explícita.

Preservar:

- sidebar;
- bottom navigation;
- cabeçalho;
- tipografia;
- espaçamentos;
- botões;
- cards;
- inputs;
- drawers;
- modais;
- cores;
- estados Light/Dark.

Não interpretar "criar a próxima tela" como autorização para reinventar o shell.

---

# 5. Navegação aprovada do BARBEIRO

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

Regras obrigatórias:

- existem exatamente quatro módulos principais;
- **Sua conta** é separada de Configurações;
- não existe grupo Pessoal dentro de Configurações;
- Categorias não é item próprio da sidebar;
- Portfólio pertence à Vitrine Digital.

---

# 6. Shell Desktop aprovado

A sidebar é recolhível.

Estado expandido:

- quatro módulos principais;
- submenus;
- conta no rodapé.

Estado recolhido:

- mostrar somente a marca compacta E&G na área superior;
- ao hover/foco nessa mesma área, substituir E&G pelo ícone de expandir;
- ao sair do hover/foco, E&G retorna;
- não exibir marca e ícone lado a lado.

Não alterar esse comportamento em novas telas.

---

# 7. Shell Mobile aprovado

A barra inferior fixa possui exatamente:

```text
Dashboard
PDV
Operação
Configurações
```

Regras:

- não adicionar quinto item para Conta;
- respeitar safe area;
- reservar espaço para que o conteúdo não fique escondido;
- Conta pode ser acessada no cabeçalho;
- não comprimir a sidebar Desktop para dentro do Mobile.

---

# 8. Quatro variações por tela

Para telas autenticadas, gerar e validar quando aplicável:

```text
Desktop-Light
Desktop-Dark
Mobile-Light
Mobile-Dark
```

As quatro versões representam a mesma tela e o mesmo estado funcional.

Elas podem mudar em:

- distribuição responsiva;
- modal vs drawer vs bottom sheet;
- cores do tema.

Elas não podem mudar em:

- campos;
- regras;
- ações;
- estados de negócio;
- navegação disponível.

---

# 9. Regra sobre estados e telas

Um estado interativo não precisa virar uma rota separada.

Exemplos:

```text
Nova venda
├── comanda vazia
├── comanda com itens
└── finalização em modal/drawer/bottom sheet
```

```text
Serviços
├── lista
├── Novo serviço em drawer
└── Editar serviço no mesmo padrão
```

Criar páginas novas somente quando a tarefa realmente for um destino próprio.

---

# 10. Regras aprovadas do Dashboard

Conteúdo principal:

```text
Filtros: Hoje | Semana | Mês | Ano | Personalizado

Faturamento
Entradas
Saídas
Resultado estimado

Serviços realizados
Bebidas vendidas
Outros produtos vendidos
Estoque baixo

Evolução no período
Situação do estoque
```

No primeiro acesso, pode existir orientação inicial e atalhos.

Não incluir bloco permanente **Detalhamento gerencial**. Análises detalhadas pertencem a Relatórios.

A Situação do estoque pode mostrar os nomes dos produtos com baixa quantidade, e não apenas um contador.

---

# 11. Regras aprovadas do PDV

## Nova venda

Permitir:

- busca;
- Todos;
- Serviços;
- Bebidas;
- Outros produtos;
- estoque disponível/baixo/sem estoque;
- comanda atual;
- total;
- Finalizar venda.

Não incluir cadastro de cliente, agendamento, profissional, cupom, gorjeta ou recurso fiscal.

Serviço permanece com quantidade 1.

Produtos e bebidas podem alterar quantidade até o limite disponível.

## Finalização

`Finalizar venda` abre a etapa de seleção de pagamento; a gravação definitiva acontece em `Confirmar venda`.

A implementação visual dessa etapa pode ser feita diretamente no frontend quando a prototipação adicional não trouxer ganho relevante.

## Histórico

Mostrar:

- venda;
- data/hora;
- itens;
- pagamento;
- status;
- total;
- detalhes em painel/drawer/bottom sheet.

Não adicionar comprovante fiscal, webhook fiscal, operador de caixa, descontos/cupons ou ações não documentadas.

O status Cancelada pode ser exibido, mas o protótipo atual não expõe botão de cancelar/estornar.

---

# 12. Regras aprovadas de Serviços

Campos:

- Nome;
- Descrição opcional;
- Preço;
- Custo direto opcional;
- Visível na Vitrine;
- Ativo.

Não adicionar duração, imagem, agenda, profissional ou comissão.

Criar e editar podem utilizar drawer/modal/bottom sheet da mesma tela.

---

# 13. Regras aprovadas de Produtos

A lista deve permitir:

- busca;
- filtro Bebida/Produto;
- status;
- categoria;
- estoque visível como contexto;
- Editar;
- Ativar/Desativar.

Categorias são acessadas dentro da própria tela de Produtos.

Imagem efetiva:

```text
1. imagem personalizada do produto
2. imagem padrão da categoria, quando habilitada
3. placeholder sem imagem
```

Não adicionar fornecedor, SKU, código de barras, validade, marca, variantes ou compra automática.

---

# 14. Regras aprovadas de Estoque

A interface deve ser compreensível para usuário novo.

Na lista, priorizar:

- imagem;
- produto;
- estoque atual;
- mínimo;
- situação;
- ação clara.

Produtos devem ser clicáveis para abrir detalhes.

Busca e filtros devem funcionar no protótipo quando o HTML for interativo.

Ações em linguagem de usuário:

```text
Adicionar estoque
Corrigir contagem
Registrar perda
```

Mapeamento técnico:

```text
REPOSICAO
AJUSTE
PERDA
```

Reposição não cria despesa financeira automaticamente.

Custo unitário, quando exibido, é opcional e informativo.

Corrigir contagem usa Entrada (+) ou Saída (-).

Perda não pode ultrapassar o estoque atual.

Histórico pode mostrar VENDA e REVERSAO_VENDA, mas o usuário não cria esses tipos manualmente.

---

# 15. Conteúdo realista sem criar regra nova

Dados fictícios podem ser usados para avaliar layout:

```text
Corte Degradê
Pomada Modeladora
Refrigerante Lata
R$ 45,00
```

Dados de exemplo não se tornam regra de negócio.

Evitar `Lorem ipsum` quando texto contextual melhora a avaliação.

---

# 16. Antes de desenhar cada tela

Identificar:

1. objetivo;
2. usuário;
3. dados exibidos;
4. campos;
5. ações;
6. validações;
7. estados;
8. navegação;
9. comportamento Desktop;
10. comportamento Mobile;
11. Light/Dark;
12. restrições de segurança.

---

# 17. Estados obrigatórios quando aplicáveis

Considerar:

- Loading;
- Success;
- Empty;
- Error;
- Disabled;
- confirmação;
- busca sem resultados.

Não criar dados falsos apenas para evitar um Empty State.

---

# 18. Ordem atual da prototipação

## Concluído/aprovado

- Autenticação;
- Onboarding completo;
- Shell autenticado;
- Dashboard;
- PDV — Nova venda;
- PDV — Histórico de vendas;
- Operação — Serviços;
- Operação — Produtos;
- Operação — Estoque.

## Próxima sequência principal

```text
Configurações
→ Negócio
→ Financeiro
```

Depois, seguir a documentação e validar uma área por vez.

Categorias de Produtos pode ser prototipada como subtela de Produtos quando necessário; não precisa ocupar posição própria na sidebar.

---

# 19. Critério de aprovação de uma tela

Antes de considerar pronta:

- conteúdo está alinhado com os documentos;
- nenhuma função foi inventada;
- Desktop Light funciona;
- Desktop Dark funciona;
- Mobile Light funciona;
- Mobile Dark funciona;
- busca/filtros funcionam quando o protótipo é interativo;
- estados essenciais estão previstos;
- sidebar/bottom navigation não foram alteradas;
- Mobile funciona a partir de aproximadamente 320px;
- nenhum dado privado aparece publicamente;
- ações perigosas não ficam fáceis de acionar por engano.

---

# 20. Prompt-base

```text
Continue the existing Estilo e Gestão prototype.

Use the attached project documentation as the source of truth.
Do not invent fields, features, integrations, financial rules or navigation.
Preserve all previously approved visual decisions.

Create only the requested screen/state.
Generate Desktop Light, Desktop Dark, Mobile Light and Mobile Dark when applicable.

Desktop must preserve the approved collapsible sidebar.
Mobile must preserve the fixed bottom navigation with exactly Dashboard, PDV, Operação and Configurações.
Sua conta is separate from Configurações.

Use realistic prototype data only when it helps evaluate the interface.
Do not turn example data into a business rule.

After completing the requested screen and its necessary states, stop.
```

---

# 21. Manutenção deste guia

Atualizar este arquivo quando uma decisão aprovada mudar:

- navegação;
- shell;
- padrão de tema;
- regra global de prototipação;
- ordem das telas;
- escopo do MVP;
- comportamento compartilhado entre vários módulos.

Decisões específicas de uma única funcionalidade devem continuar principalmente no Fluxo e nos documentos de domínio correspondentes.

---

# 22. Planos oficiais no protótipo

Usar somente estes planos e valores:

| Plano | Preço mensal | Regra visual principal |
| --- | ---: | --- |
| Grátis | R$ 0,00 | Recursos pagos bloqueados com explicação e dados anteriores em somente leitura |
| Normal | R$ 49,90 | Núcleo completo de gestão |
| Com IA | R$ 79,90 | Tudo do Normal mais o Assistente IA |

Não inventar período de tolerância, cobrança por cartão, boleto, renovação automática ou preço promocional.

O pagamento inicial é por Pix e confirmado manualmente pelo ADMIN.

---

# 23. Status da prototipação complementar

As telas e estados complementares aprovados foram prototipados:

1. ADMIN → Dashboard;
2. ADMIN → Barbearias;
3. ADMIN → Detalhes da barbearia;
4. Sua conta → Minha assinatura;
5. Recurso bloqueado no Grátis;
6. Conta suspensa;
7. Manutenção global;
8. Offline global;
9. 404 / Página não encontrada;
10. Vitrine pública indisponível quando a conta estiver suspensa.

A manutenção da Vitrine reutiliza o **mesmo estado global de manutenção** do sistema, portanto não exige lógica separada.

Continuam fora da versão inicial:

- ADMIN → Assinaturas geral;
- Novidades / Atualizações;
- Agendamento;
- Funcionários.

Novas telas só devem ser prototipadas quando surgirem de uma necessidade funcional documentada, e não para preencher espaço no produto.

---

# 24. Área ADMIN

O ADMIN utiliza a mesma tela de Login, mas entra em um contexto administrativo próprio.

## Dashboard

Mostrar somente indicadores gerais necessários à operação, sem dados privados de vendas, despesas ou estoque das barbearias.

## Barbearias

Prever:

- busca por nome ou código `EG-XXXXXX`;
- filtros por plano e situação `ATIVA` ou `SUSPENSA`;
- estado vazio, sem resultado, Loading e erro;
- acesso aos detalhes da barbearia.

## Detalhes da barbearia

Mostrar:

- código, nome e e-mail;
- plano atual, validade e alteração agendada;
- situação da conta separada do plano;
- pagamentos de assinatura;
- ações administrativas permitidas e histórico essencial.

Ações previstas:

- confirmar pagamento;
- conceder cortesia;
- aplicar upgrade;
- agendar ou cancelar downgrade;
- cancelar renovação;
- suspender ou reativar a conta.

A exclusão administrativa é excepcional. Não usar botão comum. Quando autorizada por fluxo restrito, exigir justificativa e a frase `EXCLUIR EG-XXXXXX` com o código real.

---

# 25. Minha assinatura

Apresentar:

- plano atual;
- preço oficial;
- início e fim da validade;
- estado da assinatura;
- alteração futura agendada, quando existir;
- resumo dos recursos incluídos;
- orientação para pagamento e suporte;
- opção de cancelar renovação sem excluir a conta.

Deixar claro:

- cancelamento mantém o plano até o fim do período já pago;
- no vencimento sem pagamento confirmado, a conta volta ao Grátis;
- voltar ao Grátis não apaga dados;
- excluir a conta é uma ação diferente, localizada na Zona de perigo.

---

# 26. Recurso bloqueado no Grátis

Criar um estado reutilizável, e não uma tela diferente para cada módulo.

Deve conter:

- nome do recurso bloqueado;
- explicação breve do motivo;
- benefícios obtidos no Plano Normal;
- preço de R$ 49,90 por mês;
- ação para consultar como assinar;
- opção clara de voltar.

Quando existirem dados de um período pago anterior, mostrá-los em somente leitura e bloquear somente criação, edição, exclusão ou exportação não permitida.

---

# 27. Conta suspensa e estados globais

## Conta suspensa

Usar página dedicada, sem acesso ao conteúdo autenticado. Informar que a conta foi suspensa e indicar o canal de suporte. Não sugerir que os dados foram apagados.

## Manutenção

Usar página global. Exibir motivo e previsão somente quando cadastrados pelo ADMIN. Não mostrar navegação operacional.

## Offline global

Informar ausência de conexão e oferecer tentativa novamente. Não apresentar falha de conexão como erro de senha, permissão ou servidor.

## 404

Informar que a página não foi encontrada e oferecer retorno seguro para a área inicial adequada ao contexto do usuário.

Todos esses estados devem funcionar em Desktop e Mobile, temas Claro e Escuro, sem conteúdo importante atrás da bottom navigation ou de áreas inseguras da tela.

---

# 28. Exclusão da própria conta

Na Zona de perigo, o fluxo deve:

1. explicar a exclusão imediata e irreversível;
2. avisar que o acesso e a Vitrine terminarão naquele momento;
3. avisar que não existe reembolso automático do período restante, salvo direito legal;
4. solicitar a senha atual;
5. solicitar a frase exata `EXCLUIR MINHA CONTA`;
6. manter o botão final desabilitado até todas as condições serem atendidas.

Não oferecer prazo para desfazer, restauração ou reativação da conta excluída.
