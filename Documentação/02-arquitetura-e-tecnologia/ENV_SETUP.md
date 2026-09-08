# ENV Setup — Estilo e Gestão

## Objetivo

Este documento explica quais variáveis de ambiente o Estilo e Gestão utiliza, para que servem, onde obter seus valores e onde configurá-las.

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

A segurança dos dados não depende de esconder essa chave.

Ela depende principalmente de:

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

Pode ser necessária para funções do Operador SaaS, como gerenciamento administrativo de contas, dependendo da implementação escolhida.

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

Representa a URL base do Estilo e Gestão.

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
NEXT_PUBLIC_APP_URL=https://estiloegestao.com
```

O domínio definitivo ainda deverá ser configurado.

### Pode ir para o navegador?

Sim.

Não é segredo.

---

# 6. Gemini API

O Assistente IA é opcional.

Se não estiver sendo desenvolvido ou utilizado, as variáveis da IA não precisam possuir valor funcional.

---

## GEMINI_API_KEY

```env
GEMINI_API_KEY=
```

### Função

Autoriza o backend a chamar a Gemini API.

### Onde obter

No Google AI Studio:

1. acesse a área de chaves da Gemini API;
2. crie ou selecione um projeto;
3. crie uma API Key;
4. copie o valor;
5. salve na variável.

### Pode ir para o navegador?

**Não.**

Nunca criar:

```env
NEXT_PUBLIC_GEMINI_API_KEY=
```

A chamada à Gemini deverá ser feita no servidor.

---

## GEMINI_MODEL

```env
GEMINI_MODEL=
```

### Função

Define qual modelo Gemini será utilizado.

O nome do modelo não deverá ser espalhado pelo código.

A aplicação deverá lê-lo dessa configuração.

Isso permite trocar de modelo futuramente sem alterar diversos arquivos.

### Exemplo

O valor deverá ser escolhido no momento da implementação com base nos modelos disponíveis naquele período.

Não registrar um modelo como definitivo enquanto essa decisão não tiver sido tomada.

### É segredo?

Não necessariamente.

Mesmo assim, como o frontend não precisa utilizá-lo, não utilizar `NEXT_PUBLIC_`.

---

# 7. Configurações do Assistente IA

As variáveis abaixo somente deverão ser adicionadas se as regras correspondentes forem configuráveis por ambiente.

---

## AI_MAX_MESSAGE_LENGTH

```env
AI_MAX_MESSAGE_LENGTH=
```

### Função

Quantidade máxima de caracteres permitidos em uma mensagem enviada ao Assistente IA.

Valor:

`DECISÃO PENDENTE`

---

## AI_REQUEST_TIMEOUT_MS

```env
AI_REQUEST_TIMEOUT_MS=
```

### Função

Tempo máximo que o backend aguardará uma resposta da API Gemini antes de considerar a chamada indisponível.

Unidade:

milissegundos.

Valor:

`DECISÃO PENDENTE`

---

## AI_RATE_LIMIT_MAX

```env
AI_RATE_LIMIT_MAX=
```

### Função

Quantidade máxima de mensagens permitidas dentro da janela definida.

Valor:

`DECISÃO PENDENTE`

---

## AI_RATE_LIMIT_WINDOW_SECONDS

```env
AI_RATE_LIMIT_WINDOW_SECONDS=
```

### Função

Duração da janela utilizada pelo limite de mensagens.

Unidade:

segundos.

Valor:

`DECISÃO PENDENTE`

---

# 8. Modo de manutenção

## MAINTENANCE_MODE

```env
MAINTENANCE_MODE=false
```

### Função

Permite ativar uma página de manutenção simples.

Valores:

```text
false
true
```

### false

Sistema opera normalmente.

### true

Sistema exibe a experiência de manutenção definida.

### Observação

Como a Vercel aplica variáveis através de deployments, alterar uma variável poderá exigir novo deployment para que o valor seja refletido.

Se futuramente for necessária ativação instantânea, a configuração poderá ser migrada para uma fonte persistente.

---

## MAINTENANCE_MESSAGE

Opcional:

```env
MAINTENANCE_MESSAGE=
```

### Função

Mensagem pública adicional exibida durante a manutenção.

Não colocar nessa mensagem:

- erro técnico;
- fornecedor;
- stack;
- banco;
- chave;
- causa interna de segurança.

---

## MAINTENANCE_RETURN_AT

Opcional:

```env
MAINTENANCE_RETURN_AT=
```

### Função

Permite informar uma previsão pública de retorno.

Formato definitivo:

`DECISÃO PENDENTE`

---

# 9. ViaCEP

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

# 10. Supabase Storage

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

# 11. Supabase Auth

O Supabase Auth também utiliza as variáveis principais:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Não é necessário criar uma chave de autenticação separada.

No painel do Supabase também deverão ser configuradas as URLs permitidas para autenticação.

---

# 12. URLs de autenticação

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

# 13. E-mail de autenticação

Criação de conta, confirmação e recuperação poderão utilizar o sistema de e-mail do Supabase Auth.

No MVP inicial, não criar variáveis de SMTP no projeto Next.js sem necessidade.

Se posteriormente for contratado um provedor próprio de e-mail, as credenciais deverão ser configuradas de acordo com o serviço escolhido e documentadas nesta seção.

---

# 14. Vercel

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

# 15. Desenvolvimento

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

GEMINI_API_KEY=
GEMINI_MODEL=

MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=
MAINTENANCE_RETURN_AT=

AI_MAX_MESSAGE_LENGTH=
AI_REQUEST_TIMEOUT_MS=
AI_RATE_LIMIT_MAX=
AI_RATE_LIMIT_WINDOW_SECONDS=
```

---

# 16. Preview

O ambiente Preview é utilizado pelos deployments de teste da Vercel.

Preferir:

- Supabase de desenvolvimento/teste;
- chaves que não sejam as mesmas da produção quando possível;
- IA com controle de uso.

Não utilizar dados reais de clientes sem necessidade.

---

# 17. Produção

O ambiente Production utiliza os valores reais da aplicação.

Exemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=VALOR_PRODUCAO
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=VALOR_PRODUCAO

NEXT_PUBLIC_APP_URL=https://SEU_DOMINIO

SUPABASE_SECRET_KEY=SEGREDO_PRODUCAO

GEMINI_API_KEY=SEGREDO_PRODUCAO
GEMINI_MODEL=MODELO_ESCOLHIDO

MAINTENANCE_MODE=false
```

Os valores reais nunca devem aparecer em documentação pública.

---

# 18. `.env.example`

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

# ============================================================
# GEMINI — ASSISTENTE IA OPCIONAL
# ============================================================

GEMINI_API_KEY=
GEMINI_MODEL=

# Regras ainda dependentes de decisão.
AI_MAX_MESSAGE_LENGTH=
AI_REQUEST_TIMEOUT_MS=
AI_RATE_LIMIT_MAX=
AI_RATE_LIMIT_WINDOW_SECONDS=

# ============================================================
# MANUTENÇÃO
# ============================================================

MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=
MAINTENANCE_RETURN_AT=
```

---

# 19. `.gitignore`

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

# 20. O que nunca colocar em `NEXT_PUBLIC_*`

Nunca utilizar o prefixo público em:

```text
SUPABASE_SECRET_KEY
GEMINI_API_KEY
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

# 21. APIs e serviços que precisam ser configurados

## Obrigatórios para o MVP

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

## Somente com Assistente IA

### Google AI / Gemini API

Configurar:

- Projeto/chave;
- variável `GEMINI_API_KEY`;
- modelo;
- controle de uso.

---

# 22. Serviços que não precisam de ENV no MVP

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

# 23. Checklist de configuração

## Local

- [ ] Criar `.env.local`.
- [ ] Inserir URL do Supabase.
- [ ] Inserir Publishable Key.
- [ ] Definir URL local.
- [ ] Inserir Gemini Key somente se necessário.
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
- [ ] Gemini API é chamada somente pelo servidor.
- [ ] Produção e desenvolvimento utilizam configurações separadas quando apropriado.

---

# 24. Regra para novas variáveis

Uma nova variável de ambiente somente deverá ser criada quando existir uma configuração real que precise mudar entre ambientes ou quando houver um segredo que não possa ficar no código.

Não transformar toda constante do sistema em variável de ambiente.

Antes de criar uma nova ENV, verificar:

1. é segredo?
2. muda entre desenvolvimento e produção?
3. precisa ser alterada sem editar código?
4. realmente é configuração e não regra fixa de negócio?

Se a resposta for não para todos esses pontos, provavelmente ela não precisa estar no `.env`.