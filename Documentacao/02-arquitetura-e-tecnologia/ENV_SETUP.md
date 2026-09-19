# ENV Setup — Sistema de Gestão para Barbearias

## Objetivo

Este documento explica quais variáveis de ambiente a aplicação utiliza na versão inicial, para que servem, onde obter seus valores e onde configurá-las.

Nenhuma chave real deve ser escrita neste documento.

---

# 1. Arquivos de ambiente

Durante o desenvolvimento local, utilizar:

```text
.env.local
```

Esse arquivo contém os valores reais do ambiente local.

Ele **não deve ser enviado ao GitHub**.

Também deverá existir:

```text
.env.example
```

O `.env.example` pode ser versionado porque contém apenas os nomes das variáveis, sem segredos reais.

---

# 2. Localização

Os arquivos deverão ficar na raiz da aplicação Next.js.

Exemplo:

```text
estilo-gestao/

├── app/
├── components/
├── public/
├── .env.local
├── .env.example
├── package.json
└── ...
```

---

# 3. Variáveis obrigatórias do Supabase

## NEXT_PUBLIC_SUPABASE_URL

```env
NEXT_PUBLIC_SUPABASE_URL=
```

### Função

Identifica a URL do projeto Supabase utilizado pela aplicação.

Exemplo de formato:

```text
https://xxxxxxxxxxxx.supabase.co
```

### Onde encontrar

No painel do Supabase:

1. abra o projeto;
2. abra **Connect**;
3. copie a **Project URL**.

Também pode ser consultada nas configurações da API do projeto.

### Pode ir para o navegador?

Sim.

O prefixo:

```text
NEXT_PUBLIC_
```

indica que a variável pode ser utilizada pelo código executado no navegador.

A URL não é um segredo.

---

## NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

```env
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

### Função

É a chave publicável utilizada pelos clientes normais do Supabase.

Ela será utilizada junto com:

- Supabase Auth;
- consultas permitidas pelo usuário;
- operações controladas pelas políticas do banco.

### Onde encontrar

No Supabase:

1. abra o projeto;
2. abra **Connect**;
3. copie a **Publishable key**.

Também pode ser encontrada em:

**Settings → API Keys**

### Pode ir para o navegador?

Sim.

Essa chave foi criada para uso em aplicações cliente.

A segurança dos dados não depende de esconder essa chave. Ela depende principalmente de:

- autenticação;
- RLS;
- policies corretas.

---

# 4. Chave administrativa do Supabase

## SUPABASE_SECRET_KEY

```env
SUPABASE_SECRET_KEY=
```

### Status

Configurar somente quando uma operação administrativa de servidor realmente precisar dela.

### Função

Permite operações administrativas com privilégios elevados.

Pode ser necessária para funções do painel ADMIN, como gerenciamento administrativo de contas, dependendo da implementação escolhida.

### Onde encontrar

No Supabase:

**Settings → API Keys**

Copiar uma **Secret key** apropriada.

### Pode ir para o navegador?

**Não. Nunca.**

Não utilizar:

```env
NEXT_PUBLIC_SUPABASE_SECRET_KEY=
```

Isso seria um erro crítico.

### Importante

A Secret Key ignora as proteções normais de RLS.

Por isso:

- utilizar somente no servidor;
- não utilizar em operações comuns do barbeiro;
- não utilizar como atalho para policies mal configuradas;
- nunca enviar em resposta da API;
- nunca registrar em log.

---

# 5. URL da aplicação

## NEXT_PUBLIC_APP_URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Função

Representa a URL base da aplicação.

Pode ser utilizada para:

- montar URLs públicas;
- redirecionamentos de autenticação;
- recuperação de conta;
- compartilhamento da Vitrine.

### Desenvolvimento

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Produção

Exemplo:

```env
NEXT_PUBLIC_APP_URL=https://SEU_DOMINIO
```

O domínio definitivo ainda deverá ser configurado.

### Pode ir para o navegador?

Sim.

Não é segredo.

---

# 6. Assistente IA

O Assistente IA é um recurso futuro e **não faz parte da versão inicial**.

Nenhuma variável de ambiente relacionada a esse recurso deve ser criada ou configurada nesta etapa.

Quando o módulo entrar novamente no escopo, consultar:

```text
Documentacao/02-arquitetura-e-tecnologia/ASSISTENTE_IA_FUTURO.md
```

Esse documento será o ponto oficial para revisar a integração, limites, segurança, variáveis de ambiente e demais decisões necessárias no momento da implementação.

---

# 7. Modo de manutenção

O modo de manutenção global **não é controlado por variável de ambiente** na arquitetura atual.

A fonte de verdade é a configuração persistida no banco de dados, na tabela:

```text
configuracoes_sistema
```

Isso permite que o ADMIN ative ou desative a manutenção sem depender de alteração de variável na Vercel ou de novo deployment.

A configuração contempla:

- manutenção ativa ou inativa;
- motivo interno;
- opção de exibir uma mensagem pública;
- mensagem pública;
- previsão de retorno;
- responsável pela última alteração.

Portanto, não criar na versão inicial variáveis como:

```text
MAINTENANCE_MODE
MAINTENANCE_MESSAGE
MAINTENANCE_RETURN_AT
```

A aplicação deverá consultar a configuração persistida e aplicar o estado global de manutenção conforme as regras do sistema.

---

# 8. ViaCEP

O ViaCEP será utilizado para auxiliar no preenchimento de endereços.

## Precisa de chave?

Não.

## Precisa de variável de ambiente?

Não.

A integração não exige API Key.

Portanto, não criar algo desnecessário como:

```env
VIACEP_API_KEY=
```

A URL do serviço pode ficar centralizada na camada de integração do código.

---

# 9. Supabase Storage

O Supabase Storage utiliza o mesmo projeto Supabase.

Não é necessária uma variável adicional de Storage para o frontend.

A aplicação utilizará:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

e as permissões configuradas no Supabase.

O acesso administrativo, quando necessário, ocorrerá somente no servidor.

---

# 10. Supabase Auth

O Supabase Auth também utiliza as variáveis principais:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Não é necessário criar uma chave de autenticação separada.

No painel do Supabase também deverão ser configuradas as URLs permitidas para autenticação.

---

# 11. URLs de autenticação

No Supabase Auth, configurar as URLs utilizadas pelo sistema.

## Desenvolvimento

Exemplo:

```text
http://localhost:3000
```

## Produção

Exemplo:

```text
https://SEU_DOMINIO
```

As rotas exatas de:

- confirmação;
- recuperação;
- retorno de autenticação;

serão definidas durante a implementação.

---

# 12. E-mail de autenticação

Criação de conta, confirmação e recuperação poderão utilizar o sistema de e-mail do Supabase Auth.

Na versão inicial, não criar variáveis de SMTP no projeto Next.js sem necessidade.

Se posteriormente for contratado um provedor próprio de e-mail, as credenciais deverão ser configuradas de acordo com o serviço escolhido e documentadas nesta seção.

---

# 13. Vercel

As variáveis de produção deverão ser cadastradas no projeto Vercel.

Caminho:

```text
Projeto
→ Settings
→ Environment Variables
```

A Vercel permite separar valores por ambiente:

- Development;
- Preview;
- Production.

---

# 14. Desenvolvimento

As variáveis locais ficam no:

```text
.env.local
```

Exemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SECRET_KEY=
```

A `SUPABASE_SECRET_KEY` pode permanecer vazia enquanto nenhuma operação administrativa realmente precisar dela.

---

# 15. Preview

O ambiente Preview é utilizado pelos deployments de teste da Vercel.

Preferir:

- Supabase de desenvolvimento/teste;
- chaves que não sejam as mesmas da produção quando possível.

Não utilizar dados reais de clientes sem necessidade.

---

# 16. Produção

O ambiente Production utiliza os valores reais da aplicação.

Exemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=VALOR_PRODUCAO
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=VALOR_PRODUCAO
NEXT_PUBLIC_APP_URL=https://SEU_DOMINIO
SUPABASE_SECRET_KEY=SEGREDO_PRODUCAO
```

A Secret Key somente deverá ser configurada se uma operação administrativa server-side realmente exigir seu uso.

Os valores reais nunca devem aparecer em documentação pública.

---

# 17. `.env.example`

Arquivo recomendado:

```env
# ============================================================
# SUPABASE
# ============================================================

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Opcional. Somente para ações administrativas server-side.
SUPABASE_SECRET_KEY=

# ============================================================
# APLICAÇÃO
# ============================================================

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

# 18. `.gitignore`

Confirmar que existe:

```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

O `.env.example` não deve ser ignorado.

Ele deve permanecer no GitHub.

---

# 19. O que nunca colocar em `NEXT_PUBLIC_*`

Nunca utilizar o prefixo público em:

```text
SUPABASE_SECRET_KEY
```

Também nunca colocar em variável pública futura:

- senha;
- token administrativo;
- segredo de webhook;
- chave privada;
- credencial de banco;
- segredo de provedor.

Tudo que utiliza `NEXT_PUBLIC_` pode chegar ao navegador.

---

# 20. APIs e serviços que precisam ser configurados

## Obrigatórios para a versão inicial

### Supabase

Configurar:

- Projeto;
- PostgreSQL;
- Auth;
- Storage;
- RLS;
- Policies.

### Vercel

Configurar:

- Projeto;
- repositório GitHub;
- variáveis de ambiente;
- domínio quando definido.

### ViaCEP

Não exige conta nem chave.

---

## Recurso futuro: Assistente IA

Nenhuma configuração é necessária na versão inicial.

Quando esse recurso for implementado, consultar:

```text
ASSISTENTE_IA_FUTURO.md
```

---

# 21. Serviços que não precisam de ENV na versão inicial

Não criar configuração para serviços que não fazem parte do escopo atual.

Não são necessários neste momento:

- WhatsApp Cloud API;
- Instagram Graph API;
- Google Maps API;
- Stripe;
- Mercado Pago;
- Redis;
- serviço externo de OTP;
- Prisma;
- servidor próprio de e-mail;
- Docker de produção;
- fila externa.

Se um deles entrar futuramente, sua configuração deverá ser adicionada somente depois da decisão correspondente.

---

# 22. Checklist de configuração

## Local

- [ ] Criar `.env.local`.
- [ ] Inserir URL do Supabase.
- [ ] Inserir Publishable Key.
- [ ] Definir URL local.
- [ ] Confirmar `.env.local` no `.gitignore`.
- [ ] Reiniciar servidor após alterações.

## Supabase

- [ ] Criar projeto.
- [ ] Copiar Project URL.
- [ ] Copiar Publishable Key.
- [ ] Configurar Auth.
- [ ] Configurar Storage.
- [ ] Criar RLS.
- [ ] Criar Policies.
- [ ] Configurar URLs de autenticação.

## Vercel

- [ ] Criar projeto.
- [ ] Conectar ao GitHub.
- [ ] Adicionar variáveis de Development.
- [ ] Adicionar variáveis de Preview.
- [ ] Adicionar variáveis de Production.
- [ ] Configurar domínio quando definido.
- [ ] Fazer novo deployment após alterar variáveis relevantes.

## Segurança

- [ ] Nenhum segredo possui prefixo `NEXT_PUBLIC_`.
- [ ] Nenhuma chave real existe no `.env.example`.
- [ ] Nenhuma chave real foi commitada.
- [ ] Secret Key do Supabase é utilizada somente no servidor.
- [ ] Produção e desenvolvimento utilizam configurações separadas quando apropriado.

---

# 23. Regra para novas variáveis

Uma nova variável de ambiente somente deverá ser criada quando existir uma configuração real que precise mudar entre ambientes ou quando houver um segredo que não possa ficar no código.

Não transformar toda constante do sistema em variável de ambiente.

Antes de criar uma nova ENV, verificar:

1. é segredo?
2. muda entre desenvolvimento e produção?
3. precisa ser alterada sem editar código?
4. realmente é configuração e não regra fixa de negócio?

Se a resposta for não para todos esses pontos, provavelmente ela não precisa estar no `.env`.
