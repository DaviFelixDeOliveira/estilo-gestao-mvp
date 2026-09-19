> [!WARNING]
> **DOCUMENTO ARQUIVADO.** Este arquivo foi substituído e não deve orientar implementação, prototipação ou testes. Consulte a documentação atual e o `README.md` desta pasta.

# Documentação consolidada — Estilo e Gestão

**Consolidação:** 18/09/2026  
**Status das decisões:** Blocos 1 a 8 concluídos  
**Status do produto:** preparação para prototipação final, implementação e piloto assistido

Esta pasta é o conjunto canônico consolidado do projeto. Versões anteriores, arquivos com sufixos como `atualizado`, `imagens`, `navegacao`, `(1)` e textos colados permanecem apenas como histórico e não devem prevalecer sobre estes arquivos.

## Fontes oficiais por assunto

| Arquivo | Assunto principal |
| --- | --- |
| `DOCUMENTO_VISAO.md` | Visão geral, escopo, modelo comercial e critérios de lançamento |
| `ESPECIFICACAO_FUNCIONAL.md` | Requisitos e comportamento funcional |
| `FLUXOS_DE_USUARIOS.md` | Jornadas resumidas dos usuários |
| `FLUXO_BARBEIRO_E_CLIENTE.md` | Fluxos detalhados do barbeiro, visitante e ADMIN |
| `MANUAL_DO_USUARIO.md` | Orientação em linguagem do usuário |
| `MODELAGEM_DE_DADOS.md` | Modelo conceitual |
| `BANCO_DE_DADOS.md` | Regras detalhadas de persistência e integridade |
| `BANCO_EXEMPLO.sql` | Exemplo técnico, ainda não equivalente a uma migration de produção |
| `PREPARACAO_FRONTEND_PARA_BACKEND.md` | Contratos, camadas e integração frontend/backend |
| `DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md` | Segurança, privacidade, exclusão, retenção e incidentes |
| `DESIGN_SYSTEM.md` | Componentes e regras visuais |
| `RESPONSIVIDADE.md` | Comportamento Desktop e Mobile |
| `GUIA_PROTOTIPACAO_IA.md` | Instruções para o Stitch e ordem das telas |
| `PLANO_DE_TESTES.md` | Casos, ferramentas e critérios de aprovação |
| `CHECKLIST_MESTRE.md` | Progresso, pendências e portões de lançamento |

## Decisões comerciais vigentes

| Plano | Preço mensal | Escopo |
| --- | ---: | --- |
| Grátis | R$ 0,00 | Divulgação pela Vitrine, Portfólio, serviços e produtos; dados pagos anteriores em somente leitura |
| Normal | R$ 49,90 | Núcleo completo de gestão da versão inicial |
| Com IA | R$ 79,90 | Tudo do Normal e Assistente IA |

A cobrança inicial é por Pix, com confirmação manual pelo ADMIN. Não existe período de tolerância após o vencimento.

## Regras estruturais consolidadas

- permissões dos planos são definidas centralmente no código;
- cada barbearia possui código único, imutável e não reutilizável no formato `EG-XXXXXX`;
- plano e situação `ATIVA/SUSPENSA` são independentes;
- o ADMIN não acessa dados operacionais privados das barbearias;
- cancelar renovação não exclui conta nem dados;
- exclusão é imediata, irreversível e usa confirmação reforçada;
- somente pagamentos e ações administrativas essenciais, com código, nome e e-mail, permanecem por cinco anos;
- o conteúdo das conversas da IA não é persistido;
- a IA possui 1.000 respostas por ciclo, 20 mensagens por conversa e proteção contra abuso;
- reposição de estoque não cria despesa automaticamente;
- módulos futuros não recebem tabelas vazias antes de entrar no produto.

## Telas ainda não prototipadas

1. ADMIN → Dashboard;
2. ADMIN → Barbearias;
3. ADMIN → Detalhes da barbearia;
4. Sua conta → Minha assinatura;
5. Recurso bloqueado no Grátis;
6. Conta suspensa;
7. Manutenção;
8. Offline global;
9. 404 / Página não encontrada.

## Portões de uso real

O piloto com o primeiro barbeiro exige o núcleo do Plano Normal funcional, ausência de falha crítica ou operacional, documentos legais publicados com aceite registrado, backup diário e restauração testada. O suporte inicial será pelo WhatsApp e o uso poderá começar no endereço temporário da Vercel.

A divulgação pública exige também validação técnica, validação do primeiro barbeiro, fluxos comerciais testados, revisão jurídica e domínio próprio com HTTPS.

## Pendências que continuam abertas

- implementar as decisões documentadas;
- prototipar as nove telas e estados restantes;
- configurar ambiente de produção, backups e monitoramento;
- concluir e publicar Termos de Uso e Política de Privacidade;
- obter revisão jurídica antes da divulgação;
- executar os testes e registrar os resultados;
- validar o produto com o primeiro barbeiro.

As decisões comerciais e operacionais estão concluídas. As pendências acima são de execução, validação profissional ou validação prática, e não reabrem automaticamente os Blocos 1 a 8.
