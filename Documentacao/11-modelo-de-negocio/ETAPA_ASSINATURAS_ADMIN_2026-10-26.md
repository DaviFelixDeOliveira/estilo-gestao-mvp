# Etapa de implantação — Planos Grátis/Normal, Admin e cobrança

Data da decisão: 2026-10-26.
Status: planejamento de implementação. Este arquivo descreve decisões do produto, **não** confirma que os recursos foram implementados.

## Escopo comercial decidido
- Lançamento com **dois planos**: Grátis (R$ 0) e Normal (R$ 49,90 por ciclo mensal).
- Premium e agente de IA **fora** do escopo de lançamento.
- Plano Grátis deve permitir cadastro, login, onboarding, vitrine e divulgação de produtos, categorias, serviços, preços, portfólio, horários, contato/redes sociais, dados da barbearia, formas de pagamento e aparência.
- Dashboard Grátis: informações simples da vitrine (ex.: total de produtos e serviços); não mostrar dados financeiros, vendas ou métricas de estoque.
- Plano Normal: recursos do Grátis **mais** PDV, histórico de vendas, estoque, movimentações, despesas, recorrências, financeiro, relatórios, exportações e dashboard completo.
- Usar **mesmos cadastros** de produtos e serviços em ambos os planos. Grátis não deve expor movimentação/custos/estoque gerencial mesmo quando existirem colunas técnicas no banco.
- Downgrade para Grátis **não apaga** vendas, despesas, histórico ou estoque; definir experiência de leitura/reativação conforme o fluxo vigente e respeitar retenção de dados.
- Recursos pagos devem ser negados **no servidor e no banco**, não apenas removidos dos menus.

## Contas existentes e segurança
- `davifelixoliveira4@gmail.com`: futura conta ADMIN. Não promover até existir e ser testada uma rota `/admin` funcional e restrita: o layout atual redireciona ADMIN para essa rota.
- `davizaumbs@gmail.com`: conta de teste para alternância Grátis/Normal, com registro das mudanças.
- `ademar.oliveira.1957@gmail.com`: conta de teste de usabilidade; preservar os dados e iniciar no Grátis.
- `maykolmayara97@outlook.com`: primeiro cliente real. Deve ter Normal mediante **cortesia controlada**, sem cobrança automática inesperada, durante a fase de implantação. Não mudar até implementar/testar o fluxo.
- Preservar os dados e anexos dessas quatro contas em todas as migrações.

## Painel administrativo — MVP
- Login comum, mas autorização de ADMIN validada no backend.
- Dashboard do SaaS: contagem de barbearias, planos, receita **de assinaturas**, vencimentos e manutenção (nunca faturamento privado de clientes).
- Busca por código amigável BAR-XXXXXX, nome; ID técnico/e-mail opcionais para pesquisa privada.
- Detalhes administrativos mínimos: nome, responsável, e-mail, contato, data de cadastro, plano, origem/validade, situação, histórico de ações e pagamentos do SaaS.
- Ações: concessão de cortesia com vencimento, troca de plano, suspensão/reativação com motivo, confirmação de pagamentos (se aplicável), manutenção global.
- Histórico/auditoria de toda mudança administrativa sensível, confirmação para operações perigosas, privilégios mínimos.
- ADMIN não recebe automaticamente leitura de vendas, despesas ou estoque dos tenants.

## Cobrança automatizada — antes da prospecção
- Avaliar e integrar **Asaas** em ambiente sandbox, confirmando custos, método de cobrança, políticas e requisitos atuais antes de produção. Mercado Pago é alternativa se necessário.
- Assinatura deve ter ligação confiável à barbearia, identificadores do provedor e estados de cobrança; separar plano/benefício de estado do pagamento.
- Webhooks verificados, idempotentes, persistidos e processados no servidor; um aviso repetido não pode renovar duas vezes.
- Cartão pode renovar automaticamente conforme autorização; Pix avulso exige novo pagamento — distinguir de Pix Automático se adotado.
- Só liberar/renovar mediante pagamento confirmado, ou cortesia administrativa válida, nunca somente por retorno do checkout.
- Tratar não pagamento, renovação antecipada, cancelamento, reembolso, webhook atrasado e downgrades, sem deletar dados históricos.
- Não cobrar o cliente piloto sem autorização/comunicação prévia.

## Plano técnico em fases (sempre em branch separada)
1. Levantar rotas, ações de escrita/leitura, RLS, colunas e políticas que precisam separar divulgação de gestão. Criar testes de regressão.
2. Implementar um único mecanismo server-side de acesso (Grátis/Normal/ADMIN/cortesia/conta suspensa) e proteger APIs/servidor/RLS.
3. Dashboard e navegação por plano; garantir criação/edição de produtos e serviços gratuitos, inclusive preço para vitrine.
4. Construir `/admin`, validar acesso, e **só então** atribuir papel ADMIN à conta indicada; implementar auditoria.
5. Minha Assinatura com estados de plano, vencimento, cortesia, upgrade e cancelamento.
6. Integração de pagamento em sandbox, testes de webhooks, reconciliação e erros; depois credenciais reais.
7. Configurar domínio, e-mail transacional e SPF/DKIM/DMARC, validar entrega dos códigos.
8. Validar com contas de teste, obter anuência do cliente piloto, revisão de segurança e publicação controlada.

## Critérios mínimos para publicar
- Nenhuma regressão de login/onboarding/vitrine para contas existentes.
- Usuário Grátis não acessa e não consegue executar ações pagas nem por URL/API.
- Normal tem acesso completo e dados próprios isolados.
- Uma barbearia jamais enxerga informações privadas de outra.
- ADMIN não é criado por formulário nem autoatribuição.
- Cobrança repetida ou webhook repetido não duplica período, pagamento ou mudança de plano.
- Downgrade retém dados; reativação restaura acesso às informações que já existiam.
- A conta do Maykol e as outras protegidas seguem operacionais durante todo o desenvolvimento.

## Documentação existente relacionada
- `Documentacao/03-fluxos-de-uso/FLUXO_ADMIN.md`
- `Documentacao/11-modelo-de-negocio/MODELO_DE_NEGOCIO.md`
- `Documentacao/04-banco-de-dados/BANCO_DE_DADOS.md`
- `Documentacao/05-seguranca-privacidade-juridico/DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md`

Nota: a decisão atual de automatizar pagamentos **antes** da prospecção substitui a ideia anterior de deixar a cobrança manual como fluxo inicial definitivo. Revisar os documentos antigos antes do merge.
