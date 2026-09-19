# Skill — Infraestrutura, Performance e Deploy

## Objetivo

Orientar a implementação e manutenção da infraestrutura do **Estilo e Gestão**, incluindo:

- desenvolvimento local;
- ambientes;
- deploy;
- hospedagem;
- Supabase;
- Vercel;
- armazenamento de mídia;
- otimização de imagens;
- cache;
- performance;
- logs;
- monitoramento;
- disponibilidade;
- backups;
- preparação para produção.

Esta Skill contém regras práticas para desenvolvimento.

As referências completas relacionadas ao assunto são:

- `DECISOES_TECNOLOGICAS.md`;
- `ENV_SETUP.md`;
- `DIRETRIZES_SEGURANCA_PROTECAO_DADOS.md`;
- `PLANO_DE_TESTES.md`;
- `RESPONSIVIDADE.md`.

Não adicionar serviços ou tecnologias de infraestrutura sem necessidade concreta.

---

# 1. Stack de infraestrutura

A infraestrutura atual do MVP utiliza:

```text
Git
GitHub
   ↓
Next.js
   ↓
Vercel
   │
   ├── Aplicação
   ├── Server-side
   └── Deploy
   ↓
Supabase
   ├── PostgreSQL
   ├── Auth
   ├── Storage
   └── RLS
```

Integrações externas previstas:

```text
ViaCEP
```

Não adicionar no MVP sem decisão documentada:

- AWS;
- Redis;
- Docker em produção;
- Kubernetes;
- filas externas;
- microservices;
- servidor VPS próprio;
- CDN adicional;
- sistema próprio de autenticação;
- infraestrutura multi-região.

---

# 2. Princípio de simplicidade

O Estilo e Gestão é um MVP desenvolvido inicialmente por uma pessoa.

A infraestrutura deve ser:

- simples;
- segura;
- fácil de manter;
- barata enquanto houver poucos clientes;
- capaz de evoluir quando houver necessidade real.

Não criar arquitetura preparada para milhões de usuários antes de existir o primeiro grupo de clientes pagantes.

---

# 3. Fluxo de desenvolvimento

Fluxo principal:

```text
Desenvolvimento local
        ↓
Git
        ↓
GitHub
        ↓
Vercel Preview
        ↓
Validação
        ↓
Produção
```

Quando a integração GitHub + Vercel estiver configurada, a Vercel poderá gerar deployments automaticamente a partir do repositório.

Não é necessário criar um pipeline de deploy personalizado se a integração nativa atender ao projeto.

---

# 4. Branch principal

A branch utilizada para produção deverá ser definida no repositório.

Sugestão comum:

```text
main
```

O deploy de produção deverá ocorrer somente a partir da branch configurada para produção.

Branches de desenvolvimento poderão gerar ambientes de Preview.

---

# 5. Ambientes

O projeto deverá separar pelo menos:

```text
LOCAL
PREVIEW
PRODUÇÃO
```

---

# 6. Ambiente Local

Utilizado para:

- desenvolvimento;
- testes rápidos;
- mocks;
- integração inicial;
- execução do projeto.

Exemplo:

```text
localhost
```

As credenciais utilizadas localmente não deverão ser publicadas no GitHub.

---

# 7. Ambiente Preview

Utilizado para validar alterações antes da produção.

Pode ser criado automaticamente pela Vercel a partir de:

- branches;
- Pull Requests;
- deployments manuais.

Serve para verificar:

- layout;
- funcionalidades;
- responsividade;
- integração;
- comportamento em ambiente hospedado.

Preview não deverá utilizar dados reais de produção sem necessidade.

---

# 8. Ambiente Produção

É o ambiente utilizado pelos clientes reais.

Deverá possuir:

- variáveis corretas;
- domínio correto;
- banco correto;
- Storage correto;
- configurações de segurança;
- políticas RLS;
- backups avaliados;
- monitoramento mínimo;
- tratamento adequado de erros.

---
# 9. Variáveis de ambiente

A configuração completa pertence ao:

```text
ENV_SETUP.md
---

# 13. Deploy na Vercel

A Vercel será utilizada para hospedar a aplicação Next.js.

O fluxo preferencial é utilizar a integração direta:

```text
GitHub
↓
Vercel
↓
Build
↓
Deployment
```

Evitar criar scripts personalizados de deploy sem necessidade.

---

# 14. `vercel.json`

Não criar `vercel.json` apenas porque a Vercel aceita esse arquivo.

O Next.js já possui integração nativa com a plataforma.

Adicionar `vercel.json` somente quando houver necessidade concreta de configuração que não possa ser resolvida normalmente pelo projeto ou painel.

---

# 15. GitHub Actions

GitHub Actions **não é obrigatório para o MVP**.

A integração nativa GitHub + Vercel já pode atender ao fluxo inicial de deployment.

GitHub Actions poderá ser introduzido quando houver necessidade de automatizar:

- testes;
- lint;
- análise estática;
- verificações de segurança;
- outras validações.

Se adotado futuramente, deverá ser registrado em:

```text
DECISOES_TECNOLOGICAS.md
```

---

# 16. Validações antes de produção

Antes de considerar uma alteração pronta para produção, verificar:

```text
TypeScript
Lint
Build
Testes relevantes
```

Os comandos reais deverão acompanhar o `package.json` do projeto.

Exemplo conceitual:

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

Não inventar scripts que não existam.

---

# 17. Build

O projeto deve conseguir executar:

```bash
npm run build
```

sem erro antes de um lançamento.

Erros de TypeScript ou build não deverão ser ignorados para acelerar deployment.

---

# 18. TypeScript

O projeto utiliza TypeScript estrito.

Evitar:

```typescript
any
```

sem necessidade.

Problemas de tipagem devem ser corrigidos, não escondidos através de casts aleatórios.

---

# 19. Dependências

Antes de adicionar uma dependência:

1. verificar se o problema já é resolvido pela stack;
2. verificar manutenção do pacote;
3. verificar necessidade real;
4. considerar impacto no bundle;
5. considerar impacto de segurança.

Evitar bibliotecas enormes para resolver tarefas triviais.

---

# 20. Atualização de dependências

Dependências deverão ser revisadas periodicamente.

Não atualizar produção cegamente apenas porque uma nova versão foi lançada.

Fluxo:

```text
Atualizar
↓
Testar
↓
Validar
↓
Deploy
```

---

# 21. Node.js

A versão do Node.js deverá acompanhar a versão oficialmente suportada pelo Next.js utilizado no projeto e a configuração do ambiente de deployment.

Não fixar:

```text
Node 18
```

apenas porque uma documentação antiga utilizava essa versão.

Caso o projeto fixe uma versão específica, registrá-la em:

- `package.json`;
- configuração apropriada;
- documentação técnica.

---

# 22. Supabase

O Supabase é responsável atualmente por:

```text
PostgreSQL
Auth
Storage
RLS
```

Não duplicar essas responsabilidades através de outro fornecedor sem necessidade.

---

# 23. Banco de produção

Mudanças estruturais devem ser aplicadas de forma controlada.

Evitar alterações manuais sem histórico.

Utilizar migrations quando a implementação real do banco começar.

Fluxo recomendado:

```text
Desenvolvimento
↓
Migration
↓
Teste
↓
Produção
```

---

# 24. Dados de produção

Nunca utilizar dados reais de produção livremente em ambiente de desenvolvimento.

Quando dados forem necessários para testes:

- utilizar mocks;
- utilizar seeds;
- utilizar dados fictícios;
- anonimizar quando apropriado.

---

# 25. Supabase Storage

O Supabase Storage será utilizado para arquivos enviados pelo usuário.

Arquivos previstos:

- logo;
- capa;
- imagens de produtos;
- imagens do Portfólio.

---

# 26. Estrutura de Storage

Estrutura conceitual recomendada:

```text
barbearias/
└── {barbearia_id}/
    ├── logo/
    ├── capa/
    ├── produtos/
    └── portfolio/
```

A estrutura definitiva deverá acompanhar as policies de Storage.

---

# 27. Isolamento no Storage

Uma barbearia não deverá conseguir:

- sobrescrever arquivo de outra;
- excluir arquivo de outra;
- listar conteúdo privado de outra.

O caminho do arquivo não substitui autorização.

Policies e validação devem proteger o acesso.

---

# 28. Nome dos arquivos

Não utilizar diretamente o nome original como identificador definitivo.

Preferir identificador gerado.

Exemplo:

```text
UUID.webp
```

ou estrutura equivalente.

Isso reduz:

- colisões;
- caracteres inválidos;
- manipulação de caminhos.

---

# 29. Formatos de imagem

Formatos atualmente previstos:

```text
JPEG
PNG
WebP
```

A aplicação deverá validar os formatos permitidos.

Não confiar exclusivamente na extensão do arquivo.

---

# 30. Limite de upload

O tamanho máximo das imagens ainda precisa ser definido.

```text
DECISÃO PENDENTE
```

Não assumir automaticamente:

```text
5 MB
```

ou qualquer outro valor sem decisão.

---

# 31. Quantidade de imagens

A quantidade máxima de arquivos por barbearia ou Portfólio ainda não está definida.

```text
DECISÃO PENDENTE
```

Não criar limites comerciais por plano sem decisão no Modelo de Negócio.

---

# 32. Armazenamento por plano

O MVP não possui atualmente limites definidos como:

```text
Básico = 100 MB
Pro = 500 MB
Premium = 2 GB
```

Não implementar esses limites.

Se forem necessários futuramente, deverão ser definidos em:

```text
MODELO_DE_NEGOCIO.md
```

antes da implementação.

---

# 33. Otimização de imagens

Imagens deverão ser tratadas com foco em:

- carregamento rápido;
- qualidade adequada;
- tamanho reduzido;
- responsividade.

Não enviar imagens gigantes para o navegador quando apenas um thumbnail pequeno for necessário.

---

# 34. Next.js Image

Sempre que apropriado, utilizar:

```typescript
import Image from 'next/image';
```

O componente pode ajudar com:

- dimensionamento;
- carregamento;
- otimização;
- responsividade.

A configuração deverá respeitar os domínios/fontes de imagem realmente utilizados pelo projeto.

---

# 35. `sizes`

Ao utilizar imagens responsivas, fornecer informação adequada sobre o espaço esperado.

Exemplo conceitual:

```tsx
<Image
  src={imagem}
  alt={descricao}
  fill
  sizes="(max-width: 768px) 50vw, 25vw"
/>
```

O valor real depende do layout.

Não copiar o mesmo `sizes` para todas as imagens.

---

# 36. Lazy Loading

Imagens fora da primeira área visível podem utilizar carregamento tardio quando apropriado.

Evitar marcar dezenas de imagens como prioritárias.

---

# 37. Imagens prioritárias

Utilizar prioridade apenas quando a imagem realmente fizer parte do conteúdo inicial importante.

Exemplos possíveis:

- logo principal;
- imagem principal da Vitrine.

Mesmo nesses casos, avaliar necessidade real.

---

# 38. Conversão de imagens

Não tornar `Sharp` uma dependência obrigatória sem decisão técnica.

Se houver necessidade de:

- redimensionar;
- converter;
- comprimir;

no servidor antes do Storage, avaliar a solução mais adequada naquele momento.

Possibilidades podem incluir:

- recursos do Next.js;
- recursos do fornecedor;
- processamento server-side.

A tecnologia adotada deverá ser documentada.

---

# 39. Dimensão máxima de imagem

Não fixar automaticamente:

```text
1200px
```

como regra global.

Logo, capa, produto e Portfólio podem possuir necessidades diferentes.

Os tamanhos definitivos deverão ser definidos no Design System/implementação.

---

# 40. Qualidade de compressão

Não fixar:

```text
quality: 80
```

como regra universal.

A qualidade deverá equilibrar:

- aparência;
- tamanho;
- função da imagem.

---

# 41. Vitrine pública e performance

A Vitrine é uma das páginas com maior necessidade de desempenho porque pode ser acessada diretamente através de:

- Instagram;
- WhatsApp;
- Google;
- outros links.

Priorizar:

- carregamento inicial rápido;
- imagens otimizadas;
- JavaScript necessário;
- estrutura simples;
- conteúdo público eficiente.

---

# 42. JavaScript no cliente

Evitar transformar componentes em Client Components sem necessidade.

Usar:

```text
Server Component
```

quando a funcionalidade não exigir interação no navegador.

Isso pode reduzir JavaScript enviado ao cliente.

---

# 43. `"use client"`

Não adicionar:

```typescript
'use client';
```

automaticamente em todas as páginas.

Utilizar apenas quando necessário para:

- estado;
- eventos;
- APIs do navegador;
- interação dinâmica.

---

# 44. Consultas

Evitar:

- consultas duplicadas;
- carregar campos não utilizados;
- consultar toda tabela sem necessidade;
- consultas sequenciais que poderiam ser organizadas melhor.

Buscar somente os dados necessários à tela.

---

# 45. Vitrine e consultas públicas

Nunca executar:

```sql
SELECT *
```

em dados administrativos e depois esconder campos no frontend.

A consulta pública deve retornar apenas os dados necessários.

Isso melhora:

- segurança;
- tamanho da resposta;
- performance.

---

# 46. Paginação

Listas que podem crescer significativamente deverão estar preparadas para paginação ou carregamento controlado.

Exemplos futuros:

- vendas;
- movimentações;
- despesas;
- Portfólio muito grande.

Não carregar anos de vendas de uma vez.

---

# 47. Dashboard

O Dashboard deve consultar apenas os dados necessários ao período selecionado.

Evitar carregar histórico completo para calcular tudo no navegador.

Agregações relevantes deverão ocorrer no backend/banco quando apropriado.

---

# 48. Relatórios

Consultas de relatório deverão utilizar:

- período;
- filtros;
- índices apropriados;
- agregação no servidor/banco quando útil.

Não enviar milhares de registros para o browser apenas para somar valores.

---

# 49. Índices do banco

Índices devem existir para consultas realmente importantes.

Exemplos já previstos:

- tenant;
- data;
- produto;
- vendas por período.

Não criar índice para toda coluna indiscriminadamente.

---

# 50. Cache

Cache deverá ser utilizado apenas quando os dados permitirem.

Perguntar:

```text
Este dado pode ficar desatualizado por algum tempo?
```

antes de aplicar cache.

---

# 51. Dados privados administrativos

Dados como:

- estoque;
- vendas;
- despesas;
- Dashboard;
- financeiro;

não devem receber cache público compartilhado.

---

# 52. Dados públicos

Alguns dados da Vitrine podem futuramente se beneficiar de cache.

Exemplos:

- descrição;
- serviços públicos;
- Portfólio;
- horários.

Entretanto, a estratégia definitiva deverá garantir que alterações importantes possam ser refletidas de maneira adequada.

---

# 53. Cache não é banco

Não introduzir:

- Redis;
- cache distribuído;
- camada externa de cache;

sem evidência de necessidade.

Primeiro medir.

Depois otimizar.

---

# 54. Revalidação

Caso seja utilizado cache do Next.js para conteúdo público, definir estratégia coerente de:

- revalidação;
- invalidação;
- atualização após edição.

Não utilizar cache infinito em conteúdo que o barbeiro precisa atualizar.

---

# 55. Performance antes de otimização

Fluxo correto:

```text
Medir
↓
Encontrar gargalo
↓
Corrigir
↓
Medir novamente
```

Não:

```text
Imaginar gargalo
↓
Adicionar 4 tecnologias
```

---

# 56. Web Vitals

Métricas de experiência do usuário poderão ser utilizadas para acompanhar performance.

Exemplos relevantes incluem métricas de:

- carregamento;
- responsividade;
- estabilidade visual.

O método de coleta definitivo ainda deverá ser escolhido.

---

# 57. Vercel Analytics

Vercel Analytics **não é obrigatório no MVP**.

Antes de adicionar analytics, revisar:

- necessidade real;
- custos;
- privacidade;
- Política de Privacidade;
- cookies ou mecanismos relacionados quando aplicável.

Se adotado, registrar a decisão.

---

# 58. Analytics não essenciais

Não adicionar automaticamente:

- Google Analytics;
- Meta Pixel;
- Hotjar;
- ferramentas de tracking;

apenas porque são comuns em sites.

Essas ferramentas alteram:

- privacidade;
- documentação;
- comportamento da Vitrine.

Precisam de decisão específica.

---

# 59. Lighthouse

O Lighthouse poderá ser utilizado durante os testes para avaliar aspectos como:

- performance;
- acessibilidade;
- boas práticas;
- SEO.

A estratégia completa pertence ao:

```text
PLANO_DE_TESTES.md
```

---

# 60. Logs

Logs devem ajudar a identificar problemas sem armazenar informações desnecessárias.

Registrar quando útil:

- tipo do erro;
- momento;
- módulo;
- identificador de correlação;
- contexto técnico seguro.

---

# 61. Dados proibidos nos logs

Não registrar:

- senha;
- token;
- cookie;
- API Key;
- Secret Key;
- Authorization header;
- dados financeiros completos sem necessidade;

---

# 62. `console.log`

Durante desenvolvimento pode ser utilizado para diagnóstico.

Antes da produção:

- remover logs inúteis;
- remover dados sensíveis;
- manter apenas registros realmente úteis.

Não transformar o console de produção em diário pessoal da aplicação.

---

# 63. Tabela própria de logs

Não criar automaticamente uma tabela:

```text
logs
```

no PostgreSQL.

Isso acrescentaria:

- armazenamento;
- retenção;
- dados pessoais;
- manutenção;
- consultas;
- preocupação jurídica.

Primeiro utilizar os recursos disponíveis da infraestrutura.

Criar armazenamento próprio de logs somente se houver necessidade real.

---

# 64. Monitoramento

O MVP deverá possuir monitoramento mínimo suficiente para detectar falhas relevantes.

A ferramenta definitiva ainda não está escolhida.

```text
DECISÃO PENDENTE
```

O monitoramento poderá evoluir conforme:

- número de clientes;
- impacto comercial;
- volume de requisições.

---

# 65. Alertas

Não tornar Slack obrigatório.

Alertas poderão futuramente utilizar:

- e-mail;
- painel do fornecedor;
- ferramenta de monitoramento;
- outro canal adequado.

O canal definitivo dependerá da operação real.

---

# 66. Health Check

Um endpoint simples de saúde poderá ser criado caso exista necessidade operacional.

Exemplo conceitual:

```text
GET /api/health
```

Resposta saudável:

```json
{
  "status": "ok"
}
```

O endpoint não deverá revelar:

- credenciais;
- versão de banco;
- tabelas;
- URLs privadas;
- nomes internos;
- stack trace.

---

# 67. Health Check profundo

Não é necessário executar consultas caras ou listar buckets do Storage a cada chamada de health check.

Começar simples.

Se futuramente houver monitoramento externo, podem existir verificações específicas.

---

# 68. Página de manutenção

O projeto prevê suporte a:

```env
MAINTENANCE_MODE=
```

Quando ativado, o comportamento deverá seguir a regra definida pelo sistema.

A página de manutenção deverá ser:

- simples;
- leve;
- clara;
- responsiva.

---

# 69. Manutenção e área administrativa

Uma manutenção global não deverá expor informações internas.

Mensagem pública adequada:

```text
Estamos realizando uma manutenção.
Tente novamente em alguns minutos.
```

Não exibir:

```text
Supabase database connection failed.
```

---

# 70. Estado offline

O sistema poderá detectar perda de conexão para melhorar a experiência.

No MVP isso não significa funcionamento offline completo.

O usuário poderá receber aviso como:

```text
Sem conexão com a internet.
Algumas ações estão temporariamente indisponíveis.
```

---

# 71. Venda offline

Não permitir sincronização offline de vendas no MVP.

Esse recurso permanece em:

```text
IDEIAS_FUTURAS.md
```

Venda envolve estoque e concorrência, portanto uma implementação offline incompleta pode gerar inconsistência.

---

# 72. Timeout

Integrações externas deverão possuir tratamento de espera excessiva quando apropriado.

Especialmente:

```text
```

A variável prevista:

```env
AI_REQUEST_TIMEOUT_MS=
```

terá valor definido posteriormente.

---

# 73. Falha de serviço externo

O sistema deverá degradar de forma segura.

Exemplo:

```text
provedor externo indisponível
```

não deve derrubar:

```text
Vitrine inteira
```

---

# 74. Falha do ViaCEP

Se o ViaCEP não responder:

```text
permitir preenchimento manual
```

A integração auxilia o formulário.

Ela não deve ser dependência obrigatória para cadastrar endereço.

---

# 75. Rate Limiting de IA — recurso futuro

Não há endpoint de IA na versão inicial. Rate limiting específico desse módulo será definido quando o recurso voltar ao escopo, conforme `ASSISTENTE_IA_FUTURO.md`.

---

# 76. Rate Limit geral

Não criar limite global arbitrário para toda a aplicação sem analisar o fluxo.

Rotas possuem necessidades diferentes.

Exemplo:

```text
Login
≠
Vitrine
≠
PDV
≠
recurso futuro de IA
```

---

# 77. CORS

Não adicionar configuração CORS ampla sem necessidade.

Se frontend e backend funcionarem dentro da mesma aplicação Next.js, não há motivo para liberar origens arbitrárias.

Nunca utilizar:

```text
Access-Control-Allow-Origin: *
```

em endpoints privados por conveniência.

---

# 78. Headers de segurança

Configurações de segurança relevantes poderão ser aplicadas conforme necessidade e compatibilidade da aplicação.

Exemplos conceituais:

- proteção contra MIME sniffing;
- políticas de frame;
- política de referência;
- Content Security Policy quando apropriada.

A implementação deverá ser testada para não quebrar recursos legítimos.

---

# 79. Backup do banco

Antes do lançamento comercial deverá existir uma estratégia conhecida para backup e recuperação.

Não apenas:

```text
"Supabase faz backup."
```

É necessário verificar o que realmente está disponível no plano utilizado.

---

# 80. Estratégia de backup

Antes da produção real definir:

- quais backups existem;
- frequência;
- retenção;
- responsável;
- procedimento de restauração;
- comportamento do Storage.

Os valores concretos dependem da infraestrutura contratada.

---

# 81. Teste de restauração

Backup sem restauração testada oferece uma quantidade surpreendentemente criativa de falsa segurança.

Quando a operação justificar, testar:

```text
Backup
↓
Restauração
↓
Verificação
```

---

# 82. Backup do Storage

Imagens também fazem parte dos dados operacionais.

A estratégia deverá considerar:

- arquivos;
- banco;
- referências entre banco e Storage.

Não verificar apenas PostgreSQL e esquecer as imagens.

---

# 83. Exclusão de arquivos

Quando um registro que possui mídia for removido, avaliar também o ciclo de vida do arquivo correspondente.

Evitar acumular arquivos órfãos indefinidamente.

Entretanto, não excluir arquivo imediatamente quando houver necessidade de histórico ou recuperação.

A regra depende da funcionalidade.

---

# 84. Domínio

O domínio definitivo ainda deverá ser configurado.

Quando existir:

- configurar na Vercel;
- atualizar `NEXT_PUBLIC_APP_URL`;
- verificar redirects;
- verificar HTTPS;
- atualizar URLs de autenticação quando necessário;
- testar Vitrine;
- testar recuperação de senha.

---

# 85. HTTPS

Produção deverá utilizar HTTPS.

Não enviar:

- senha;
- sessão;
- token;
- dados administrativos;

através de conexão insegura.

---

# 86. DNS

Configurações DNS devem ser documentadas quando o domínio for adquirido/configurado.

Evitar manter registros antigos ou conflitantes sem necessidade.

---

# 87. SEO da Vitrine

A Vitrine pública poderá ser preparada para mecanismos de busca.

Considerar futuramente ou durante a implementação:

- título;
- descrição;
- metadata;
- URLs legíveis;
- conteúdo semântico;
- imagens adequadas.

Não expor dados privados para melhorar SEO.

---

# 88. SEO da área administrativa

Páginas privadas não precisam ser indexadas por mecanismos de busca.

Rotas administrativas devem ser tratadas adequadamente.

---

# 89. Slug da Vitrine

A rota pública poderá utilizar estrutura como:

```text
/b/{slug}
```

A rota definitiva ainda deverá acompanhar a decisão funcional.

O slug deverá:

- ser único;
- ser validado;
- não substituir autorização;
- não expor dados privados.

---

# 90. Performance de IA — recurso futuro

Não é requisito de performance da versão inicial. Métricas de latência, timeout, streaming e fallback de IA serão definidas antes de uma futura implementação.

---

# 91. Loading

Operações remotas devem mostrar feedback.

Exemplos:

```text
Carregando...
Salvando...
Enviando...
Gerando resposta...
```

Isso reduz múltiplos envios e melhora a percepção de performance.

---

# 92. Optimistic UI

Não utilizar atualização otimista em operações críticas sem avaliar risco.

Evitar em ações como:

- finalizar venda;
- ações futuras de cancelamento de venda, somente após fluxo aprovado;
- alterar estoque.

Nesses casos, confirmar resultado do servidor.

---

# 93. Operações menos críticas

Optimistic UI poderá ser avaliada em interações onde uma falha seja simples de reverter.

Não utilizar apenas para parecer rápido.

---

# 94. Bundles

Evitar importar bibliotecas inteiras quando apenas pequena parte é necessária.

Também evitar grandes componentes Client-side nas páginas públicas sem necessidade.

---

# 95. Code Splitting

Aproveitar os mecanismos do Next.js.

Componentes pesados que não são necessários inicialmente poderão ser carregados de forma adequada quando existir benefício comprovado.

---

# 96. Fontes

Fontes utilizadas deverão ser carregadas de maneira otimizada.

A fonte definitiva ainda está pendente no Design System.

Quando escolhida:

- evitar muitos pesos;
- evitar múltiplas famílias sem necessidade;
- considerar recursos de otimização do Next.js.

---

# 97. Portfólio

O Portfólio poderá concentrar grande quantidade de imagens.

Quando crescer, considerar:

- paginação;
- carregamento incremental;
- thumbnails;
- otimização.

Não carregar todo histórico de fotos de uma barbearia se apenas uma pequena parte estiver visível.

---

# 98. Produtos

Imagens de produto deverão possuir comportamento equivalente:

- dimensões adequadas;
- carregamento controlado;
- fallback quando não houver imagem.

Produto não deverá depender da imagem para funcionar no PDV.

---

# 99. Dashboard e gráficos

Bibliotecas de gráficos deverão ser avaliadas pelo impacto de bundle e utilidade real.

Não adicionar biblioteca pesada para exibir um único número que poderia ser mostrado em um card.

---

# 100. Monitoramento de custos

Conforme o SaaS crescer, acompanhar custos de:

- Vercel;
- Supabase;
- Storage;
- tráfego;
- domínio;
- demais fornecedores.

Isso é especialmente importante para manter margem positiva nos planos.

A análise comercial completa pertence ao:

```text
MODELO_DE_NEGOCIO.md
```

---

# 101. Custos de IA — recurso futuro

Não existem custos de provedor de IA na versão inicial. Caso o módulo seja retomado, seu custo deverá ser acompanhado separadamente antes da definição comercial.

---

# 102. Escalabilidade

Não adicionar infraestrutura avançada antecipadamente.

Fluxo correto:

```text
Sistema começa simples
↓
Uso real cresce
↓
Métricas mostram gargalo
↓
Gargalo é analisado
↓
Infraestrutura evolui
```

---

# 103. Infraestrutura futura

Recursos como os seguintes permanecem fora do MVP enquanto não houver necessidade:

- Redis;
- filas;
- workers dedicados;
- múltiplas regiões;
- microservices;
- Kubernetes;
- observabilidade avançada;
- pipelines complexos;
- processamento distribuído;
- CDN adicional;
- replicação avançada.

Caso algum se torne necessário, deverá ser analisado e registrado antes da adoção.

---

# 104. Checklist de desenvolvimento

Antes de concluir uma alteração:

- [ ] TypeScript sem erros relevantes.
- [ ] Lint revisado.
- [ ] Testes relacionados executados.
- [ ] Build verificado quando necessário.
- [ ] Nenhum segredo adicionado ao código.
- [ ] Nenhum `.env` commitado.
- [ ] Nenhum dado privado exposto.
- [ ] Não foi adicionada dependência desnecessária.
- [ ] Mobile continua funcionando.
- [ ] Loading e erro foram considerados.

---

# 105. Checklist de Preview

Antes de aprovar para produção:

- [ ] Página abre corretamente.
- [ ] Auth funciona.
- [ ] Rotas privadas continuam protegidas.
- [ ] Banco utilizado é o ambiente correto.
- [ ] Upload funciona.
- [ ] Vitrine pública funciona.
- [ ] Responsividade revisada.
- [ ] Console sem erros relevantes.
- [ ] Integrações testadas.
- [ ] Nenhuma variável privada aparece no navegador.

---

# 106. Checklist de produção

Antes do primeiro lançamento comercial:

## Vercel

- [ ] Projeto conectado corretamente.
- [ ] Branch de produção definida.
- [ ] Variáveis configuradas.
- [ ] Domínio configurado.
- [ ] HTTPS funcionando.

## Supabase

- [ ] Projeto de produção definido.
- [ ] Migrations aplicadas.
- [ ] RLS habilitada.
- [ ] Policies testadas.
- [ ] Storage configurado.
- [ ] Policies de Storage testadas.
- [ ] Estratégia de backup conhecida.

## Aplicação

- [ ] Build passa.
- [ ] Fluxos críticos passam.
- [ ] Tratamento de erro funciona.
- [ ] Loading funciona.
- [ ] Página de manutenção funciona.
- [ ] Não há mocks de produção.
- [ ] Não há dados fictícios indevidos.

## Segurança

- [ ] Segredos somente server-side.
- [ ] `.env` fora do Git.
- [ ] Uploads validados.
- [ ] Teste entre tenants realizado.

## Performance

- [ ] Vitrine avaliada.
- [ ] Imagens otimizadas.
- [ ] Nenhuma imagem desnecessariamente enorme.
- [ ] Consultas principais revisadas.
- [ ] Listas grandes controladas.
- [ ] Lighthouse executado quando aplicável.

## Jurídico

- [ ] Política de Privacidade revisada.
- [ ] Termos de Uso revisados.
- [ ] Fornecedores confirmados.
- [ ] Analytics revisado antes de eventual ativação.

---

# 107. Checklist após deployment

Após colocar uma versão relevante em produção:

- [ ] aplicação abre;
- [ ] Login funciona;
- [ ] Dashboard carrega;
- [ ] PDV pode ser acessado;
- [ ] Vitrine abre;
- [ ] arquivos carregam;
- [ ] nenhuma variável privada está exposta;
- [ ] logs não apresentam falha crítica;
- [ ] integração externa principal funciona.

Não considerar deployment concluído apenas porque a Vercel exibiu:

```text
Deployment Ready
```

A aplicação ainda precisa funcionar.

---

# 108. Rollback

Antes de alterações críticas, entender como retornar para uma versão anterior.

A plataforma de deployment poderá permitir restauração/redeployment de versão anterior.

Mudanças de banco exigem cuidado adicional porque reverter código não necessariamente reverte schema ou dados.

---

# 109. Migration incompatível

Evitar migration destrutiva junto com código que dependa imediatamente da nova estrutura sem estratégia adequada.

Principalmente quando o sistema já possuir usuários reais.

Mudanças futuras podem exigir:

```text
Migration compatível
↓
Deploy
↓
Migração dos dados
↓
Remoção da estrutura antiga
```

quando necessário.

---

# 110. Falha em produção

Caso uma atualização cause erro importante:

1. identificar impacto;
2. interromper mudança quando necessário;
3. realizar rollback quando seguro;
4. verificar banco;
5. corrigir;
6. testar;
7. realizar novo deployment;
8. registrar incidente quando aplicável.

---

# 111. Regra final

A infraestrutura deverá evoluir baseada em problemas medidos.

Não adicionar uma tecnologia apenas porque:

- apareceu em um tutorial;
- outra empresa utiliza;
- parece profissional;
- uma IA sugeriu;
- pode ser útil algum dia.

A solução preferida é a mais simples que:

- resolve o problema atual;
- mantém os dados seguros;
- suporta o uso esperado;
- pode ser mantida pelo projeto.

Quando essa solução deixar de ser suficiente, medir o problema e evoluir a arquitetura de forma documentada.