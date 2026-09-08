# Checklist Mestre — Estilo e Gestão

## Objetivo

Centralizar o acompanhamento da documentação do **Estilo e Gestão**.

Cada seção representa um dos documentos planejados.

`[x]` significa que o item já foi definido ou criado.

`[ ]` significa que ainda precisa ser definido, revisado ou concluído.

Este arquivo não substitui nenhum documento. Ele apenas acompanha o progresso.

---

# 1. Decisões Tecnológicas

- [x] Definir tecnologias principais.
- [x] Definir frontend.
- [x] Definir backend.
- [x] Definir banco de dados.
- [x] Definir autenticação.
- [x] Definir Storage.
- [x] Definir hospedagem.
- [x] Definir GitHub.
- [x] Definir integração de CEP.
- [x] Definir Gemini API.
- [x] Criar documento base.
- [ ] Validar tecnologias após início da implementação.
- [ ] Atualizar caso uma tecnologia realmente seja adicionada ou removida.

---

# 2. Documento de Visão

- [x] Definir nome do software.
- [x] Criar resumo.
- [x] Definir palavras-chave.
- [x] Criar introdução.
- [x] Definir nicho.
- [x] Definir público-alvo.
- [x] Descrever problema.
- [x] Descrever solução.
- [x] Resumir tecnologias.
- [x] Criar requisitos funcionais.
- [x] Criar requisitos não funcionais.
- [x] Criar seção de esquema de cores.
- [x] Criar seção de Wireframes.
- [x] Resumir Manual do Usuário.
- [x] Resumir Modelo de Negócio.
- [x] Resumir Plano de Testes.
- [x] Criar estrutura de apêndice de privacidade.
- [x] Criar referências iniciais.
- [x] Criar conclusão.
- [ ] Definir empresa responsável.
- [ ] Definir missão da empresa.
- [ ] Definir visão da empresa.
- [ ] Definir valores da empresa.
- [ ] Definir logo da empresa.
- [ ] Definir slogan.
- [ ] Inserir Wireframes.
- [ ] Revisar requisitos após validação final do MVP.
- [ ] Gerar versão final paginada/PDF quando necessário.

---

# 3. Perguntas

- [x] Remover perguntas sobre funcionalidades já retiradas do MVP.
- [x] Registrar dúvidas de produtos.
- [x] Registrar dúvidas de serviços.
- [x] Registrar dúvidas de despesas.
- [x] Registrar dúvidas de estoque.
- [x] Registrar dúvidas da Vitrine.
- [x] Registrar dúvidas do PDV.
- [x] Registrar dúvidas dos relatórios.
- [x] Registrar dúvidas do Portfólio.
- [ ] Perguntar dúvidas ao barbeiro.
- [ ] Registrar respostas nos documentos correspondentes.
- [ ] Remover perguntas resolvidas.

---

# 4. Manual do Usuário

- [x] Criar estrutura por telas e funções.
- [x] Criar pasta de assets.
- [x] Documentar primeiro acesso.
- [x] Documentar Login.
- [x] Documentar Dashboard.
- [x] Documentar serviços.
- [x] Documentar produtos.
- [x] Documentar estoque.
- [x] Documentar PDV.
- [x] Documentar financeiro.
- [x] Documentar relatórios.
- [x] Documentar Vitrine.
- [x] Documentar Portfólio.
- [x] Documentar Assistente IA.
- [ ] Finalizar interface.
- [ ] Capturar imagens reais.
- [ ] Inserir imagens.
- [ ] Conferir textos e botões com a implementação final.
- [ ] Validar manual com usuário real.

---

# 5. Fluxo do Barbeiro e Cliente

- [x] Unificar detalhes funcionais em um documento técnico principal.
- [x] Documentar autenticação.
- [x] Documentar Onboarding.
- [x] Documentar Dashboard.
- [x] Documentar serviços.
- [x] Documentar produtos.
- [x] Documentar categorias.
- [x] Documentar estoque.
- [x] Documentar PDV.
- [x] Documentar vendas.
- [x] Documentar cancelamento.
- [x] Documentar despesas.
- [x] Documentar relatórios.
- [x] Documentar Vitrine.
- [x] Documentar Portfólio.
- [x] Documentar visitante.
- [x] Documentar IA.
- [x] Documentar mensagens e estados.
- [x] Documentar responsividade resumida.
- [ ] Resolver todas as decisões marcadas como `DECISÃO PENDENTE`.
- [ ] Revisar após validação do protótipo.
- [ ] Revisar novamente antes de implementar backend definitivo.

---

# 6. ENV Setup

- [x] Documentar arquivo `.env.local`.
- [x] Documentar `.env.example`.
- [x] Documentar Supabase URL.
- [x] Documentar Publishable Key.
- [x] Documentar Secret Key.
- [x] Documentar URL da aplicação.
- [x] Documentar Gemini API Key.
- [x] Documentar Gemini Model.
- [x] Documentar manutenção.
- [x] Explicar configuração na Vercel.
- [x] Explicar onde obter variáveis.
- [x] Separar variáveis públicas e privadas.
- [ ] Criar valores reais no ambiente local.
- [ ] Criar ambiente de produção.
- [ ] Configurar domínio definitivo.
- [ ] Definir limites da IA.
- [ ] Revisar ENV após implementação.

---

# 7. Preparação Frontend para Backend

- [x] Definir uso de mocks.
- [x] Separar mocks da interface.
- [x] Definir tipos.
- [x] Definir validação com Zod.
- [x] Definir estados Loading/Success/Empty/Error.
- [x] Preparar operações server-side.
- [x] Separar dados públicos e administrativos.
- [x] Preparar uploads.
- [x] Preparar integração com Supabase.
- [x] Definir regra de valores financeiros.
- [x] Definir regra de PDV temporário.
- [ ] Criar estrutura real do frontend.
- [ ] Criar mocks finais.
- [ ] Substituir mocks pelo backend.
- [ ] Remover dependências temporárias desnecessárias.

---

# 8. Banco Exemplo SQL

- [x] Criar tabelas principais.
- [x] Definir colunas.
- [x] Definir tipos.
- [x] Definir nulabilidade.
- [x] Definir enums.
- [x] Definir relacionamentos.
- [x] Definir índices iniciais.
- [x] Representar RLS.
- [ ] Resolver decisões que alteram schema.
- [ ] Criar migration definitiva.
- [ ] Testar constraints.
- [ ] Atualizar SQL quando o banco real mudar.

---

# 9. Banco de Dados

- [x] Explicar tenant.
- [x] Explicar Auth.
- [x] Explicar perfis.
- [x] Explicar relacionamentos.
- [x] Explicar snapshots.
- [x] Explicar estoque.
- [x] Explicar venda.
- [x] Explicar cancelamento.
- [x] Explicar transações.
- [x] Explicar RLS.
- [x] Explicar Storage.
- [x] Explicar Vitrine pública.
- [ ] Definir policies reais.
- [ ] Implementar migrations.
- [ ] Testar isolamento entre barbearias.
- [ ] Testar concorrência do estoque.
- [ ] Testar backup e restauração.

---

# 10. Diretrizes de Segurança e Proteção de Dados

- [x] Definir princípios gerais.
- [x] Documentar Auth.
- [x] Documentar RLS.
- [x] Documentar secrets.
- [x] Documentar validação server-side.
- [x] Documentar PDV seguro.
- [x] Documentar uploads.
- [x] Documentar Vitrine.
- [x] Documentar IA.
- [x] Documentar logs.
- [x] Documentar incidentes.
- [x] Documentar privacidade desde a concepção.
- [ ] Implementar controles.
- [ ] Executar testes de segurança.
- [ ] Validar processo de incidentes.
- [ ] Revisar antes da produção.

---

# 11. Política de Privacidade

- [x] Criar minuta.
- [x] Mapear categorias iniciais de dados.
- [x] Mapear fornecedores previstos.
- [x] Descrever Vitrine.
- [x] Descrever IA.
- [x] Descrever direitos dos titulares.
- [ ] Definir responsável legal.
- [ ] Definir CPF/CNPJ.
- [ ] Definir contato de privacidade.
- [ ] Validar bases legais.
- [ ] Definir retenção.
- [ ] Definir exclusão.
- [ ] Confirmar transferências internacionais.
- [ ] Revisão jurídica.
- [ ] Publicar versão final.

---

# 12. Preparação para Revisão Jurídica

- [x] Criar resumo do sistema.
- [x] Mapear pessoas envolvidas.
- [x] Mapear dados.
- [x] Mapear fornecedores.
- [x] Criar perguntas jurídicas.
- [x] Criar checklist.
- [ ] Definir empresa/responsável.
- [ ] Definir modelo comercial.
- [ ] Completar inventário de dados.
- [ ] Definir retenção proposta.
- [ ] Definir fluxo de exclusão.
- [ ] Definir fluxo de incidentes.
- [ ] Entregar documentação ao advogado.
- [ ] Aplicar correções solicitadas.

---

# 13. Termos de Uso

- [x] Criar minuta.
- [x] Documentar uso permitido.
- [x] Documentar uso proibido.
- [x] Documentar Vitrine.
- [x] Documentar Portfólio.
- [x] Documentar IA.
- [x] Documentar disponibilidade.
- [x] Criar estrutura comercial.
- [ ] Definir responsável legal.
- [ ] Definir preços.
- [ ] Definir cobrança.
- [ ] Definir cancelamento.
- [ ] Definir suporte.
- [ ] Validar CDC.
- [ ] Validar direito de arrependimento.
- [ ] Validar foro.
- [ ] Revisão jurídica.
- [ ] Publicar versão final.

---

# 14. Design System

- [x] Definir princípios visuais.
- [x] Definir paleta base.
- [x] Definir componentes.
- [x] Definir estados.
- [x] Definir botões.
- [x] Definir inputs.
- [x] Definir cards.
- [x] Definir modais.
- [x] Definir acessibilidade básica.
- [ ] Definir fonte final.
- [ ] Definir cores semânticas finais.
- [ ] Criar protótipos.
- [ ] Validar componentes.
- [ ] Validar com barbeiro.

---

# 15. Esquema de Cores

- [x] Explicar conceito visual.
- [x] Definir grafites.
- [x] Definir superfícies.
- [x] Definir branco.
- [x] Registrar verde proposto.
- [x] Explicar cores semânticas.
- [ ] Validar verde definitivo.
- [ ] Escolher cor de sucesso.
- [ ] Escolher cor de erro.
- [ ] Escolher cor de aviso.
- [ ] Escolher cor de informação.
- [ ] Validar contraste.

---

# Documento extra — Responsividade

- [x] Criar documento separado.
- [x] Definir Mobile First.
- [x] Definir comportamento de navegação.
- [x] Definir adaptação de tabelas.
- [x] Definir PDV Mobile/Desktop.
- [x] Definir Vitrine Mobile/Desktop.
- [x] Criar checklist de testes.
- [ ] Testar em dispositivos reais.
- [ ] Validar protótipo com barbeiro.

---

# 16. Checklist Mestre

- [x] Criar arquivo.
- [x] Criar seção para todos os documentos.
- [x] Diferenciar itens concluídos e pendentes.
- [ ] Atualizar continuamente conforme o projeto evoluir.

---

# 17. Ideias Futuras

- [x] Criar backlog separado do MVP.
- [ ] Revisar ideias existentes.
- [ ] Adicionar novas ideias quando surgirem.
- [ ] Mover ideia para o escopo somente após aprovação.

---

# 18. Skills

- [ ] Revisar skills atuais.
- [ ] Atualizar Design.
- [ ] Atualizar Financeiro/PDV.
- [ ] Atualizar Responsividade.
- [ ] Atualizar Segurança.
- [ ] Criar skill de banco.
- [ ] Criar skill de frontend/backend.
- [ ] Criar skill de IA/Vitrine.
- [ ] Criar skill de testes.
- [ ] Revisar todas após implementação.

---

# 19. Modelo de Negócio

- [ ] Criar documento.
- [ ] Definir plano padrão.
- [ ] Definir plano com IA.
- [ ] Definir diferenças entre planos.
- [ ] Definir preços.
- [ ] Definir periodicidade.
- [ ] Definir cobrança.
- [ ] Definir custos.
- [ ] Definir margem esperada.
- [ ] Definir estratégia inicial de venda.
- [ ] Validar com cliente piloto.

---

# 20. Plano de Testes

- [ ] Criar documento.
- [ ] Definir testes unitários.
- [ ] Definir testes de componentes.
- [ ] Definir testes de integração.
- [ ] Definir testes E2E.
- [ ] Definir testes de usabilidade.
- [ ] Definir testes de segurança.
- [ ] Definir testes de desempenho.
- [ ] Definir testes de estresse.
- [ ] Definir testes de responsividade.
- [ ] Definir SonarQube/SonarCloud.
- [ ] Definir ferramentas gratuitas.
- [ ] Criar tabela de execução.
- [ ] Registrar Passou/Falhou.
- [ ] Registrar data de cada teste.

---

# 21. Índice da Documentação

- [ ] Criar documento.
- [ ] Listar todos os documentos.
- [ ] Informar finalidade.
- [ ] Informar caminho.
- [ ] Criar links relativos.
- [ ] Incluir pasta de Skills.
- [ ] Atualizar sempre que arquivo for criado ou movido.

---

# 22. Modelos de Estrutura dos Documentos

- [ ] Criar pasta de modelos.
- [ ] Criar modelo para Documento de Visão.
- [ ] Criar modelo para Decisões Tecnológicas.
- [ ] Criar modelo para Manual.
- [ ] Criar modelo para Fluxo Técnico.
- [ ] Criar modelo para ENV.
- [ ] Criar modelo para Banco.
- [ ] Criar modelo para Segurança.
- [ ] Criar modelo jurídico.
- [ ] Criar modelo de Design.
- [ ] Criar modelo de Checklist.
- [ ] Criar modelo de Testes.
- [ ] Criar modelos dos demais documentos existentes.

---

# 23. README

- [ ] Remover READMEs duplicados.
- [ ] Manter um README na raiz.
- [ ] Criar resumo simples.
- [ ] Explicar objetivo.
- [ ] Explicar público.
- [ ] Listar funcionalidades principais.
- [ ] Resumir tecnologias.
- [ ] Explicar status do projeto.
- [ ] Linkar documentação.
- [ ] Incluir instruções básicas para desenvolvimento quando necessário.
- [ ] Revisar antes de tornar o repositório público.

---

# Regra de manutenção

Este checklist deverá ser atualizado sempre que:

- uma decisão for tomada;
- um documento for criado;
- um documento for revisado;
- uma funcionalidade mudar;
- uma decisão pendente for resolvida;
- um novo requisito entrar no MVP;
- uma ideia for movida para desenvolvimento.

O checklist acompanha o projeto.

Os documentos específicos continuam sendo as fontes oficiais de cada assunto.