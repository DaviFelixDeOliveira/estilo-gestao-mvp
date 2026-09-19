# FLUXO_CLIENTE — Estilo e Gestão


## Objetivo

Este documento consolida todas as regras e fluxos referentes ao **cliente/visitante da Vitrine Digital** do Estilo e Gestão. Aqui, “cliente” significa a pessoa que acessa a Vitrine pública de uma barbearia sem autenticação.

Este documento é a fonte funcional principal para a experiência **pública do cliente/visitante**. Ele cobre conteúdo da Vitrine, serviços, produtos, Portfólio, localização, contatos, Assistente IA, privacidade e estados públicos relevantes. Regras da área privada pertencem ao `FLUXO_BARBEIRO.md`, e regras administrativas ao `FLUXO_ADMIN.md`.

Nenhum fluxo público pode expor custos internos, estoque numérico, dados financeiros, credenciais, IDs técnicos, chaves, dados administrativos ou informações privadas da barbearia.

---

# 1. Ator: cliente / visitante

O cliente é a pessoa que acessa a **Vitrine Digital** sem autenticação. Ele só pode visualizar informações que a barbearia marcou como públicas.

O cliente não possui acesso ao painel privado, PDV, estoque, financeiro, relatórios, configurações, assinatura ou qualquer dado interno da barbearia.

O acesso público pode ocorrer por links divulgados no Google, Instagram, WhatsApp, QR Code ou outros canais externos.

---

# 2. Princípios globais da experiência pública

- não exigir autenticação para acessar uma Vitrine publicada;
- nunca expor erro de banco, stack trace, token, segredo, caminho interno ou chave de API;
- nunca expor UUID interno completo ou identificadores técnicos desnecessários;
- manter comportamento funcional equivalente entre Desktop e Mobile;
- no Mobile, respeitar teclado virtual, safe areas e áreas de toque adequadas;
- não depender de hover para ações essenciais;
- estados de Loading devem impedir múltiplos envios quando houver interação;
- erros temporários devem usar mensagens simples e seguras;
- conteúdos públicos devem respeitar exatamente o que a barbearia decidiu publicar.

---

# 3. O que pode existir na Vitrine Digital

A Vitrine Digital é o perfil público da barbearia. Ela existe para:

- divulgar o trabalho;
- apresentar serviços;
- apresentar produtos;
- mostrar Portfólio;
- informar localização e horários;
- informar formas de pagamento aceitas;
- facilitar contato.

A Vitrine **não realiza**:

- venda online;
- agendamento;
- pagamento online.

A disponibilidade de cada seção depende da configuração pública feita pelo barbeiro. Informações opcionais ausentes simplesmente não precisam aparecer.

---

# 4. Acessar a Vitrine

## Pré-condições

- slug existe;

- barbearia está ativa;

- Vitrine está publicada.

---

## Cabeçalho

Poderá apresentar:

- Logo;

- Capa;

- Nome da barbearia;

- Nome profissional.

---

## Sobre

Exibir descrição pública quando cadastrada.

---

## Serviços

Exibir somente serviços:

- ativos;

- marcados para exibição pública.

Dados:

- Nome;

- Descrição;

- Preço.

Nunca mostrar:

- custo estimado;

- informações internas.

---

## Produtos

Exibir somente produtos:

- ativos;

- marcados para exibição pública.

Dados:

- Imagem efetiva;

- Nome;

- Categoria;

- Descrição;

- Preço de venda;

- indicação de indisponibilidade quando aplicável.

A imagem efetiva deverá seguir:

```text

Imagem personalizada existe?
↓ Sim
Exibir personalizada

↓ Não

Produto permite imagem da categoria
+
categoria possui imagem padrão?
↓ Sim
Exibir imagem padrão da categoria

↓ Não
Exibir sem imagem / placeholder neutro

```

O visitante não precisa receber informações internas indicando se a imagem veio do produto ou da categoria.

Nunca mostrar:

- preço de custo;

- quantidade numérica em estoque;

- estoque mínimo;

- caminhos internos desnecessários do Storage;

- configurações internas de fallback.

Produtos com estoque zero seguem a configuração definida pelo barbeiro.

---

## Portfólio

Mostrar somente trabalhos publicados.

---

## Horários de funcionamento

Exibir os horários cadastrados da barbearia.

Para dias fechados, poderá apresentar:

****Fechado****

Quando houver dois intervalos:

```text

08:00 às 12:00

14:00 às 18:00

```

---

## Atendimento a domicílio

Se a barbearia informar que atende a domicílio, essa informação poderá ser exibida publicamente.

Exemplo:

*> Atendimento a domicílio disponível.*

Se não atender, não é necessário destacar essa informação na Vitrine.

---

## Localização

Exibir:

- Rua;

- Número ou ****Sem número****;

- Bairro;

- Cidade;

- Estado;

- Complemento quando existente.

---

## Formas de pagamento

Exibir as formas de pagamento atualmente configuradas como aceitas pela barbearia.

Exemplos:

- Pix;

- Dinheiro;

- Débito;

- Crédito.

Essa informação representa os meios normalmente aceitos pelo estabelecimento e não dados de vendas específicas.

---

## Contato

Poderá apresentar:

- WhatsApp;

- Instagram quando cadastrado;

- Como chegar quando houver endereço.

---


# 5. WhatsApp

Se houver WhatsApp válido:

- exibir botão ****WhatsApp****;

- ao selecionar, abrir o WhatsApp;

- iniciar conversa com o número cadastrado.

Não é necessário preencher uma mensagem automaticamente.

Se não houver número válido:

- não exibir o botão.

---


# 6. Instagram

Se houver Instagram cadastrado:

- exibir botão ****Instagram****;

- abrir diretamente o perfil informado.

Se não houver:

- não exibir o botão.

---


# 7. Como chegar

Se houver endereço cadastrado:

- exibir botão ****Como chegar****;

- abrir o Google Maps;

- utilizar o endereço da barbearia como destino.

Se não houver endereço disponível:

- não exibir o botão.

---


# 8. Vitrine inexistente

Mensagem:

*> Esta Vitrine não foi encontrada.*

Não revelar:

- IDs;

- informações do banco;

- detalhes técnicos.

---


# 9. Vitrine despublicada

Mensagem:

*> Esta Vitrine não está disponível no momento.*

Não carregar conteúdo privado da barbearia.

---


# 10. Assistente IA

## Condições

Mostrar somente quando:

- Vitrine publicada;

- barbearia ativa;

- IA liberada para aquela barbearia;

- IA ativada pelo barbeiro.

---

## Campo

- Mensagem - obrigatória;

  - máximo 300 caracteres.

---

## Contexto permitido

Somente dados públicos necessários:

- nome público;

- descrição;

- serviços públicos;

- preços públicos;

- produtos públicos;

- horários;

- endereço público;

- atendimento a domicílio;

- formas de pagamento aceitas;

- contatos.

---

## Proibido enviar para IA

- custos;

- estoque interno;

- quantidade numérica de estoque;

- estoque mínimo;

- faturamento;

- despesas;

- vendas;

- credenciais;

- e-mail privado;

- IDs internos;

- segredos;

- chaves de API;

- dados de outra barbearia.

---

## Fluxo

1\. visitante envia mensagem;

2\. backend valida;

3\. verifica se a IA está disponível;

4\. aplica limite de uso;

5\. coleta somente contexto público permitido;

6\. monta as instruções;

7\. chama Gemini;

8\. devolve resposta.

---

## Agendamento

O Assistente IA não deverá:

- consultar agenda;

- reservar horários;

- afirmar disponibilidade;

- prometer atendimento em determinado horário.

Quando necessário:

- direcionar visitante para WhatsApp.

---

## Sem informação

*> Não tenho essa informação disponível. Você pode falar diretamente com a barbearia pelo WhatsApp.*

---

## Indisponível

*> O assistente está temporariamente indisponível. Você ainda pode falar diretamente com a barbearia pelo WhatsApp.*

---

## Histórico

Não persistir o conteúdo das conversas no banco. Ele existe somente durante a conversa atual.

---

## Rate limit

- máximo de 10 mensagens por minuto por visitante;

- máximo de 20 mensagens por conversa;

- máximo inicial de 1.000 respostas por ciclo mensal da barbearia;

- alertar o ADMIN em 80% da cota;

- bloquear em 100%, salvo extensão administrativa registrada;

- ao atingir o limite, bloquear temporariamente novas mensagens;

- informar que deverá aguardar antes de tentar novamente.

---

## Timeout

- aguardar no máximo 15 segundos pela resposta da IA;

- ao atingir o limite, encerrar a requisição;

- informar que não foi possível obter resposta naquele momento;

- permitir nova tentativa.

---


# 11. Regras públicas derivadas da configuração da Vitrine

## URL pública e slug

A Vitrine utiliza URL no formato:

```text
/{slug}
```

O slug é gerado automaticamente a partir do nome normalizado da barbearia e de um identificador público curto e único. Deve usar letras minúsculas, números e hífens, sem espaços, acentos ou caracteres especiais. Palavras reservadas do sistema não podem ser usadas isoladamente. O UUID interno completo nunca deve aparecer na URL pública.

Depois que a Vitrine é criada, alterar o nome da barbearia não deve mudar automaticamente o slug existente, evitando quebrar links já divulgados.

## Serviços públicos

Exibir somente serviços:

- ativos;
- marcados para exibição pública.

Podem aparecer nome, descrição e preço. Nunca mostrar custo estimado ou dados internos.

## Produtos públicos

Exibir somente produtos:

- ativos;
- marcados para exibição pública.

Podem aparecer imagem efetiva, nome, categoria, descrição, preço de venda e indicação de indisponibilidade quando aplicável.

Nunca mostrar:

- preço de custo;
- quantidade numérica em estoque;
- estoque mínimo;
- caminhos internos do Storage;
- configurações internas de fallback de imagem.

Quando o estoque estiver zerado, a Vitrine segue a regra definida pelo barbeiro: ocultar o produto ou mostrar como **Indisponível**.

## Imagem efetiva do produto

A resolução visual segue esta prioridade:

```text
1. Imagem personalizada do produto
2. Imagem padrão da categoria, quando permitida
3. Placeholder neutro / sem imagem
```

O visitante não precisa saber se a imagem veio do produto ou da categoria.

## Portfólio

Mostrar apenas trabalhos publicados. Um item ocultado pelo barbeiro deixa de aparecer publicamente sem precisar ser excluído do painel privado.

---

# 12. Fluxo consolidado de acesso do visitante

1. O cliente recebe ou encontra o link da Vitrine.
2. Abre a URL pública.
3. O sistema resolve o slug.
4. Verifica se a barbearia pode possuir conteúdo público disponível e se a Vitrine está publicada.
5. Carrega somente dados públicos permitidos.
6. O cliente pode navegar por apresentação, serviços, Portfólio, produtos, localização, horários, formas de pagamento e contato.
7. Quando disponíveis, pode abrir WhatsApp, Instagram e Como chegar.
8. Se o Plano Com IA estiver vigente e o Assistente estiver habilitado, o cliente pode iniciar conversa com a IA.

Em falhas públicas, nunca mostrar erro de banco ou identificadores internos.

---

# 13. Responsividade da Vitrine

## Desktop

A Vitrine pode aproveitar largura maior para distribuir conteúdo em grades, colunas e seções visuais, desde que preserve leitura e hierarquia.

## Mobile

- utilizar uma coluna quando necessário;
- manter botões adequados para toque;
- evitar tabelas horizontais;
- não depender de hover;
- respeitar safe areas;
- manter ações de contato acessíveis;
- no Assistente IA, o chat não deve cobrir permanentemente a navegação e deve respeitar o teclado virtual.

---

# 14. Estados públicos do sistema

Os estados abaixo precisam existir também na experiência do cliente. Eles não devem revelar informações administrativas privadas.

## 14.1 Vitrine indisponível por conta suspensa

Quando a barbearia estiver administrativamente suspensa, a Vitrine pública fica indisponível.

O visitante **não deve ser informado de que a barbearia foi suspensa** e não deve receber o motivo administrativo.

Usar uma mensagem pública neutra, por exemplo:

> **Vitrine indisponível**  
> Esta Vitrine não está disponível no momento.

Regras:

- não carregar serviços, produtos, Portfólio, contatos ou outros dados públicos;
- não exibir “Conta suspensa”, “fraude”, “violação”, “inadimplência” ou qualquer justificativa interna;
- não mostrar IDs, protocolos ou referências administrativas;
- não transformar esse estado em 404 se a Vitrine existe, mas está temporariamente indisponível por condição administrativa;
- manter apenas a identidade visual pública necessária do Estilo e Gestão.

## 14.2 Manutenção global

Quando o Estilo e Gestão estiver em manutenção global, a Vitrine utiliza **o mesmo estado global de manutenção usado pelo restante do sistema**. Não existe uma segunda lógica ou uma segunda tela de manutenção exclusiva para a Vitrine.

Mensagem principal:

> **Estamos em manutenção**  
> Estamos realizando melhorias no Estilo e Gestão.

Comportamento:

- substituir temporariamente a Vitrine pelo componente global de manutenção;
- não carregar dados da barbearia enquanto o estado global estiver ativo;
- motivo público pode aparecer somente se o ADMIN tiver autorizado sua exibição;
- previsão de retorno é opcional;
- pode oferecer **Tentar novamente**;
- não exibir countdown obrigatório;
- não mostrar incident ID, protocolo, servidor, banco, região, logs ou detalhes técnicos;
- não mostrar dados da conta ou do plano da barbearia;
- reutilizar o mesmo componente e as mesmas regras globais, evitando uma implementação duplicada apenas para a Vitrine.

## 14.3 Offline do visitante

Quando o dispositivo do visitante estiver sem conexão:

> **Sem conexão com a internet**  
> Verifique sua conexão e tente novamente.

Comportamento:

- substituir temporariamente a Vitrine pelo estado Offline;
- oferecer **Tentar novamente**;
- quando a conexão voltar, restaurar a Vitrine/rota anterior sempre que possível;
- não confundir Offline com manutenção ou Vitrine indisponível;
- não mostrar códigos do navegador como `ERR_INTERNET_DISCONNECTED`.

## 14.4 Página não encontrada / 404

Para uma rota pública inexistente que não represente uma Vitrine válida:

> **Página não encontrada**  
> O endereço pode estar incorreto ou a página pode não existir.

Ações:

- **Voltar**;
- **Ir para o início**.

Não exibir detalhes técnicos.

## 14.5 Vitrine não encontrada

Para slug público inexistente, utilizar o padrão de 404 com mensagem específica:

> **Vitrine não encontrada**  
> Esta Vitrine pode não existir ou o endereço informado pode estar incorreto.

Não revelar se algum identificador interno semelhante existe.

## 14.6 Vitrine despublicada

Quando a Vitrine existe, mas foi despublicada pelo barbeiro:

> **Esta Vitrine não está disponível no momento.**

Não carregar conteúdo privado ou dados que estavam anteriormente públicos.

## 14.7 Assistente IA indisponível

Se a Vitrine estiver acessível, mas o Assistente IA não puder responder:

> **O assistente está temporariamente indisponível. Você ainda pode falar diretamente com a barbearia pelo WhatsApp.**

Quando o Assistente não possuir a informação solicitada:

> **Não tenho essa informação disponível. Você pode falar diretamente com a barbearia pelo WhatsApp.**

Essas mensagens só devem apontar para WhatsApp quando houver um contato público válido disponível.

---

# 15. Privacidade e limites do Assistente IA

O Assistente IA só pode receber contexto público necessário, incluindo:

- nome público;
- descrição;
- serviços públicos;
- preços públicos;
- produtos públicos;
- horários;
- endereço público;
- atendimento a domicílio;
- formas de pagamento aceitas;
- contatos.

É proibido enviar para a IA:

- custos;
- estoque interno;
- quantidade numérica de estoque;
- estoque mínimo;
- faturamento;
- despesas;
- vendas;
- credenciais;
- e-mail privado;
- IDs internos;
- segredos;
- chaves de API;
- dados de outra barbearia.

O Assistente não consulta agenda, não reserva horários, não afirma disponibilidade e não promete atendimento em determinado horário. Quando necessário, direciona o visitante ao contato público da barbearia.

O conteúdo da conversa não é persistido no banco. Ele existe somente durante a conversa atual.

Regras iniciais de uso:

- máximo de 10 mensagens por minuto por visitante;
- máximo de 20 mensagens por conversa;
- máximo inicial de 1.000 respostas por ciclo mensal da barbearia;
- alerta administrativo em 80% da cota;
- bloqueio em 100%, salvo extensão administrativa registrada;
- timeout funcional de 15 segundos por resposta.

---

# 16. Estados de carregamento e erro na experiência pública

## Loading

Quando uma ação pública estiver em processamento:

- impedir múltiplos envios;
- manter feedback visual claro;
- não apagar conteúdo já preenchido antes da confirmação;
- no chat, manter a conversa atual enquanto a resposta estiver sendo aguardada.

## Erro temporário

Erros técnicos nunca devem expor SQL, stack trace, token, segredo, caminho interno ou chave de API.

Mensagem genérica aceitável:

> Não foi possível concluir esta operação. Tente novamente.

O estado público deve sempre priorizar linguagem simples e recuperável.

---
