> [!WARNING]
> **DOCUMENTO ARQUIVADO.** Este arquivo foi substituído e não deve orientar implementação, prototipação ou testes. Consulte a documentação atual e o `README.md` desta pasta.

# Fluxos Detalhados dos Usuários

Este documento detalha cada ator sem presumir funcionalidades fora do MVP.

---

# 1. Barbeiro — criar conta e primeiro acesso

## Pré-condições

- possuir e-mail válido;
- ainda não possuir conta, no fluxo de cadastro público.

## Dados usados

- nome do responsável;
- e-mail;
- senha;
- dados iniciais da barbearia.

A senha é gerenciada pelo Supabase Auth e não é armazenada em tabela própria da aplicação.

## Fluxo principal

1. Acessa a tela **Criar conta**.
2. Informa nome, e-mail, senha e confirmação.
3. Sistema valida os dados.
4. Supabase Auth cria a conta.
5. Se confirmação de e-mail estiver habilitada, o usuário realiza a confirmação.
6. Sistema cria/vincula o perfil interno e a barbearia.
7. Usuário entra no Onboarding.
8. Preenche:
   - nome da barbearia;
   - WhatsApp;
   - endereço;
   - horários;
   - serviços;
   - produtos/bebidas, quando aplicável.
9. Sistema salva as etapas.
10. Ao concluir, redireciona ao Dashboard.

## Erros e validações

- campo obrigatório vazio;
- e-mail inválido;
- e-mail já utilizado;
- senha inválida;
- confirmação diferente;
- conta suspensa;
- falha de rede;
- falha ao criar perfil/barbearia.

## Recuperação de falha

Se o Auth tiver sido criado e o cadastro interno falhar, nova tentativa não deve criar outra barbearia.

## Ajustes nas telas atuais

### Modo Web

- cadastro centralizado;
- onboarding em etapas;
- indicador de progresso;
- Dashboard aproveita largura sem esticar conteúdo em excesso;
- sidebar pode ser usada após onboarding.

### Modo Mobile

- uma etapa por vez;
- navegação compacta;
- evitar sidebar permanente;
- ações frequentes acessíveis com uma mão.

---

# 2. Barbeiro — login

## Dados usados

- e-mail;
- senha.

## Fluxo

1. Acessa `/login`.
2. Informa e-mail e senha.
3. Sistema valida no Auth.
4. Sistema identifica a barbearia vinculada.
5. Se onboarding estiver incompleto, retoma a etapa pendente.
6. Caso contrário, redireciona ao Dashboard.

## Erros

- credenciais inválidas;
- conta suspensa, com redirecionamento para a página própria;
- sessão inválida;
- falha de rede;
- erro inesperado.

---

# 3. Barbeiro — recuperar senha por código

## Dados usados

- e-mail;
- OTP de recuperação com 6 dígitos;
- nova senha.

## Fluxo

1. No Login, seleciona **Esqueci minha senha**.
2. Informa e-mail.
3. Sistema solicita recuperação ao Supabase Auth.
4. E-mail de recuperação apresenta o código OTP de 6 dígitos.
5. Interface informa de forma neutra que, se a conta existir, o código será enviado.
6. Usuário abre **Verificar código**.
7. Digita o código.
8. Sistema valida como OTP de recuperação.
9. Se válido, abre **Redefinir senha**.
10. Usuário informa nova senha e confirmação.
11. Auth atualiza a senha.
12. Sistema informa sucesso.
13. Usuário retorna ao Login ou segue conforme a sessão segura adotada.

## Erros

- e-mail inválido;
- código incorreto;
- código expirado;
- código já utilizado;
- limite de tentativas;
- senha inválida;
- senhas diferentes;
- conexão indisponível.

## Reenvio

Usuário pode solicitar novo código respeitando limites de segurança.

---

# 4. Barbeiro — cadastrar serviço

## Dados usados

- nome;
- descrição;
- preço;
- custo estimado de insumos;
- ativo;
- visibilidade pública.

## Fluxo

1. Abre Serviços.
2. Seleciona **Novo serviço**.
3. Preenche os dados.
4. Sistema valida localmente para feedback rápido.
5. Usuário salva.
6. Backend repete validação.
7. Backend confirma propriedade da barbearia.
8. Registro é criado.
9. Interface atualiza a lista.

## Erros

- nome vazio;
- preço inválido;
- custo negativo;
- sessão expirada;
- falha no servidor.

## Web

Modal ou página lateral é aceitável.

## Mobile

Preferir tela inteira ou bottom sheet com rolagem confortável.

---

# 5. Barbeiro — cadastrar categoria de produto

## Dados usados

- nome da categoria;
- barbearia autenticada.

## Fluxo com categoria sugerida

1. Abre cadastro de produto.
2. Sistema exibe sugestões.
3. Barbeiro seleciona, por exemplo, **Bebida**.
4. Se a categoria ainda não existir para aquela barbearia, backend cria o registro.
5. Produto é vinculado à categoria.

## Fluxo com categoria personalizada

1. Seleciona **Criar categoria**.
2. Informa nome.
3. Sistema valida duplicidade.
4. Backend cria a categoria para a barbearia.
5. Categoria fica selecionada no produto.

## Erros

- nome vazio;
- categoria duplicada;
- sessão expirada;
- falha no servidor.

---

# 6. Barbeiro — cadastrar produto/bebida

## Dados usados

- nome;
- categoria;
- quantidade;
- estoque mínimo;
- custo;
- preço de venda;
- imagem;
- visibilidade.

## Fluxo

1. Abre Produtos.
2. Seleciona **Novo produto**.
3. Preenche os dados.
4. Seleciona categoria sugerida/existente ou cria uma.
5. Opcionalmente envia imagem.
6. Salva.
7. Backend valida.
8. Produto passa a aparecer no PDV se ativo.

## Estoque mínimo

Quando definido:

`estoque atual <= estoque mínimo → alerta de estoque baixo`

## Erros

- valores negativos;
- categoria inválida/de outra barbearia;
- tipo de imagem não aceito;
- arquivo grande;
- upload falhou;
- erro de banco.

## Mobile

Separar upload e campos visualmente para não criar formulário interminável.

---

# 7. Barbeiro — registrar venda

## Dados usados

- catálogo ativo;
- estoque;
- preço atual;
- custo atual;
- forma de pagamento opcional.

## Fluxo

1. Abre PDV.
2. Toca em um serviço.
3. Toca em produtos/bebidas se necessário.
4. Quantidade e subtotal são atualizados.
5. Confere total.
6. Informa forma de pagamento se desejar.
7. Toca em **Finalizar venda**.
8. Frontend envia IDs e quantidades; o total do navegador não é a fonte final.
9. Backend:
   - valida sessão;
   - identifica barbearia;
   - busca dados atuais;
   - valida itens;
   - valida estoque;
   - recalcula preços/custos;
   - cria venda com status `CONCLUIDA`;
   - cria itens;
   - baixa estoque;
   - cria movimentações.
10. Operação é confirmada de forma atômica.
11. Interface recebe sucesso.
12. Comanda é limpa.

## Erros

- estoque insuficiente;
- produto/serviço inativo;
- item inexistente;
- item de outra barbearia;
- categoria inconsistente;
- falha de conexão;
- erro transacional.

## Mobile

- total fixo próximo ao botão de concluir;
- cards tocáveis;
- sem hover como requisito;
- mínimo de navegação.

## Web

- catálogo e comanda simultâneos.

---

# 8. Barbeiro — cancelar venda

## Dados usados

- venda;
- status;
- itens de produto;
- movimentações.

## Fluxo

1. Abre Histórico.
2. Abre venda `CONCLUIDA`.
3. Clica **Cancelar venda**.
4. Modal explica impacto.
5. Confirma.
6. Backend valida.
7. Em transação:
   - marca venda como `CANCELADA`;
   - define data de cancelamento;
   - restaura estoque dos produtos;
   - registra reversão.
8. Relatórios passam a ignorar a venda cancelada.

## Erros

- venda já cancelada;
- sessão inválida;
- conflito;
- falha no servidor.

---

# 9. Barbeiro — reposição de estoque

## Dados usados

- produto;
- quantidade;
- custo;
- data.

## Fluxo

1. Abre Estoque.
2. Escolhe produto.
3. Seleciona **Registrar reposição**.
4. Informa quantidade.
5. Informa custo.
6. Decide/aceita atualização do custo unitário futuro.
7. Confirma.
8. Backend cria movimentação.
9. Estoque aumenta.
10. Saída de caixa correspondente pode ser registrada no mesmo fluxo.

## Validação

Quantidade deve ser maior que zero.

---

# 10. Barbeiro — registrar despesa

## Dados usados

- nome;
- descrição opcional;
- valor;
- categoria;
- data.

## Fluxo

1. Financeiro → **Nova despesa**.
2. Preenche os dados.
3. Salva.
4. Backend valida e grava.
5. Dashboard e relatórios refletem o período.

---

# 11. Barbeiro — configurar Vitrine

## Dados usados

- nome da marca;
- nome profissional;
- descrição;
- logo;
- capa;
- endereço completo;
- horários;
- informação de atendimento a domicílio;
- contatos;
- slug;
- seções públicas;
- itens públicos.

## Fluxo

1. Abre **Vitrine**.
2. Visualiza status e URL.
3. Edita informações públicas.
4. Escolhe seções visíveis.
5. Seleciona quais serviços/produtos aparecem.
6. Gerencia Portfólio.
7. Visualiza prévia.
8. Publica.
9. Sistema disponibiliza URL.
10. Pode copiar o link para Google, Instagram, WhatsApp, QR Code etc.

## Validações

- slug único e seguro;
- telefone/link válidos;
- uploads permitidos;
- nenhum custo, estoque interno ou dado administrativo exposto.

## Web

Prévia lado a lado pode ser usada.

## Mobile

Edição por seções e botão de pré-visualização.

---

# 12. Barbeiro — gerenciar Portfólio

## Dados usados

- imagem;
- descrição;
- serviço relacionado;
- publicado/oculto.

## Fluxo

1. Abre Portfólio.
2. Seleciona **Adicionar trabalho**.
3. Envia imagem.
4. Opcionalmente adiciona descrição/serviço.
5. Define publicação.
6. Salva.
7. Item aparece na Vitrine se publicado.

## Erros

- arquivo inválido;
- arquivo grande;
- upload falhou;
- sessão expirada.

---

# 13. Visitante — acessar Vitrine

## Dados usados

Somente informações marcadas como públicas.

## Fluxo

1. Recebe link pelo Google, Instagram, WhatsApp, QR Code etc.
2. Abre URL.
3. Sistema resolve slug.
4. Se publicada, carrega página.
5. Visitante navega:
   - apresentação;
   - serviços;
   - Portfólio;
   - produtos;
   - localização;
   - horários;
   - contato.
6. Pode abrir WhatsApp/Instagram/mapa.
7. Se IA estiver ativa, pode iniciar conversa.

## Erros

- slug inexistente;
- página despublicada;
- falha temporária.

Nunca mostrar erro de banco ou identificadores internos.

---

# 14. Visitante — Assistente IA

## Dados usados

Somente contexto público da Vitrine.

## Fluxo

1. Abre chat.
2. Envia pergunta.
3. Backend aplica limite de uso.
4. Backend identifica a Vitrine.
5. Busca contexto público.
6. Monta instrução segura.
7. Chama provedor de IA.
8. Resposta retorna ao visitante.
9. Se não souber/não puder responder, direciona ao contato.

## Validações

- mensagem não vazia;
- tamanho máximo;
- rate limit;
- Vitrine ativa;
- IA liberada e ativada.

## Erros

- limite excedido;
- provedor indisponível;
- timeout;
- configuração ausente.

## Mobile

Chat não deve cobrir permanentemente a navegação; deve respeitar teclado virtual e safe areas.

---

# 15. Administrador / Operador do SaaS — operação mínima

## Situação

O painel administrativo mínimo faz parte da versão inicial, sem um Super Admin completo.

## Funções previstas

- Dashboard geral sem dados operacionais privados;
- listar, pesquisar e filtrar barbearias;
- consultar detalhes administrativos, assinatura, pagamentos e histórico permitido;
- confirmar pagamento e conceder cortesia;
- aplicar upgrade, agendar ou cancelar downgrade e cancelar renovação;
- suspender e reativar contas;
- controlar manutenção global;
- estender excepcionalmente a cota da IA com justificativa;
- suporte operacional permitido.

Correção de bugs permanece como atividade de desenvolvimento/manutenção, não como ação funcional do painel.

## Decisões de autorização

- o operador usa o mesmo Login e é identificado por `perfis.tipo = ADMIN`;
- a atribuição de ADMIN é uma operação interna protegida;
- cada ação é validada no backend e registrada quando administrativa;
- suspensão e exclusão excepcional exigem confirmação reforçada;
- RLS não é desativada genericamente;
- o ADMIN não acessa vendas, despesas, estoque ou outros dados privados das barbearias.

## Fora deste painel no MVP

- billing automatizado;
- tela geral de assinaturas;
- métricas complexas do SaaS;
- impersonação de usuário;
- RBAC sofisticado.

---

## Fluxos comerciais e administrativos aprovados

### Primeiro acesso do barbeiro parceiro

1. O sistema é disponibilizado em produção no endereço temporário da Vercel.
2. O ADMIN ativa um ciclo mensal gratuito do Plano Normal.
3. O link é enviado ao barbeiro.
4. O barbeiro cria a própria conta, confirma o e-mail e aceita os documentos legais.
5. O barbeiro conclui o Onboarding e começa a usar dados reais.
6. Dúvidas e erros são enviados pelo WhatsApp e registrados internamente.
7. Ao fim do ciclo, pagamento confirmado mantém o Normal; sem pagamento, a conta passa ao Grátis.

### Pagamento manual

1. O barbeiro envia o Pix.
2. O ADMIN abre `Barbearias → Detalhes → Assinatura`.
3. Informa data real do pagamento e valor recebido.
4. O sistema calcula o novo vencimento conforme o dia-base.
5. Cria um pagamento permanente e um evento no histórico administrativo.

### Upgrade

1. O barbeiro solicita Plano Com IA.
2. A diferença é negociada e recebida manualmente.
3. O ADMIN confirma o upgrade.
4. A IA é liberada imediatamente.
5. O vencimento atual não muda.

### Downgrade ou cancelamento

1. O barbeiro solicita a alteração em `Minha assinatura`.
2. O plano atual continua até o vencimento.
3. A alteração futura pode ser desfeita antes da data.
4. No vencimento, sem pagamento confirmado, a conta passa ao Grátis.

### Suspensão administrativa

1. O ADMIN informa motivo e suspende a conta.
2. A área autenticada e a Vitrine ficam indisponíveis.
3. Os dados permanecem armazenados.
4. A reativação devolve o acesso sem reconstrução da conta.

### Exclusão pelo barbeiro

1. Acessa `Sua conta → Zona de perigo`.
2. Lê os efeitos sobre dados, Vitrine e período pago.
3. Informa a senha atual.
4. Digita `EXCLUIR MINHA CONTA`.
5. Confirma a exclusão definitiva.
6. O sistema remove os dados operacionais e a autenticação imediatamente.
7. Somente pagamentos e ações essenciais seguem para retenção restrita por cinco anos.

### Exclusão administrativa excepcional

1. O ADMIN suspende primeiro quando houver fraude, abuso, conteúdo ilegal ou risco de segurança.
2. Preserva somente a evidência necessária.
3. Registra justificativa e confirma com `EXCLUIR EG-XXXXXX`.
4. A conta é eliminada após a análise e o fim da necessidade de preservação.

### Falha crítica durante uso real

1. Ativar manutenção global.
2. Avisar o barbeiro pelo WhatsApp.
3. Preservar evidências técnicas e verificar a integridade dos dados.
4. Corrigir e testar.
5. Reabrir somente após validação.

## Escopo futuro do painel

Continuam fora da versão inicial: cobrança automática, gateway de pagamento, tela geral de Assinaturas, impersonação, RBAC avançado, Agendamento, Funcionários e vários ADMINs.
