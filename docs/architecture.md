# Arquitetura

## Visão geral

A aplicação é um monólito web full-stack com serviços gerenciados externos.
Frontend e rotas de servidor são construídos pelo TanStack Start e publicados
como Worker Cloudflare. O Supabase concentra identidade, banco, autorização,
storage e uma Edge Function.

```text
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│ React · TanStack Router · React Query · Supabase JS         │
└───────────────┬───────────────────────┬─────────────────────┘
                │ HTTPS/JWT             │ Server Function
                ▼                       ▼
┌──────────────────────────────┐  ┌────────────────────────────┐
│ Supabase Data/Auth/Storage   │  │ Cloudflare Worker          │
│ RLS + grants + RPCs          │  │ TanStack Start + Nitro     │
└───────────────┬──────────────┘  └──────────────┬─────────────┘
                │                                 │
                ├──────────────┬──────────────────┘
                ▼              ▼
┌────────────────────────┐  ┌─────────────────────────────────┐
│ Supabase Edge Function │  │ MCP / Health / SSR              │
│ notificação de cotação │  │ rotas HTTP do próprio Worker    │
└──────────────┬─────────┘  └─────────────────────────────────┘
               ▼
        ┌─────────────┐
        │ EmailJS     │
        └─────────────┘
```

## Camadas

### Apresentação

- `src/routes/`: roteamento baseado em arquivos;
- `src/components/`: componentes de layout, catálogo, formulários e UI;
- `src/styles.css`: tema e estilos globais;
- `src/assets/` e `public/`: ativos empacotados ou publicados.

### Arquitetura de informação pública

Estado: **implementado localmente, não implantado**.

```text
/                         Landing institucional
/catalogo                 descoberta e seleção geral
/categorias               índice completo da taxonomia local
/departamento/$slug       seleção local por categoria
/detalhes/$sku            dados locais do produto
/carrinho                 revisão e submissão com gate final
```

Landing e Catálogo compartilham Header, Footer, tokens, focus rings e
primitivas. Eles não compartilham responsabilidade de página: `LandingReasons`
e seus assets entram somente pelo grafo da Landing. O Catálogo usa `CatalogHero`,
`CatalogCategoryShowcase` e `CatalogProductCard`, sem importar
seções promocionais da antiga home.

Na composição atual, `CatalogHero` concentra a faixa navegável de categorias e a
abertura industrial;
`CatalogCategoryShowcase` apresenta categorias prioritárias com mídia local.
Esses módulos pertencem ao grafo de `/catalogo` e não são importados pela
Landing. Os contratos de URL, produto e lista de cotação permanecem os mesmos.

O inventário versionado em `src/lib/products.ts` contém 96 registros recuperados
do catálogo público legado em 14/08/2026. As 94 imagens disponíveis são preservadas
em `public/images/catalog/products`; as 96 apresentações normalizadas são servidas
por `public/images/catalog/products-enhanced`. Dois produtos cuja origem já retorna
arquivo quebrado usam referências equivalentes explicitamente marcadas como
ilustrativas. `ITA-{legacyId}` é apenas um identificador interno de migração e não é
apresentado como SKU comercial da fonte.

O Header expõe a única entrada de busca: um campo sobreposto, expansível para a
esquerda e com sugestões locais contidas na mesma largura, sem alterar o fluxo
das ações do header.
O estado completo da busca permanece navegável pelo search param `q` em `/catalogo`.

### Fundação visual

Estado: **implementado localmente, não implantado**.

```text
src/styles.css
├─ tokens semânticos de cor, tipo, spacing, radius, sombra, foco e motion
├─ aliases temporários para consumidores legados
└─ utilidades de container, densidade, foco e transição

src/components/ui
├─ Button, Input, Textarea, Card e Surface
├─ Skeleton, EmptyState e ErrorState
└─ Radix: Dropdown, Sheet, Dialog e Accordion

src/components/catalog
├─ CatalogHero
├─ CatalogCategoryShowcase
├─ CategoryCard
└─ CatalogProductCard
```

Inter é a única família web. Mono usa fontes do sistema e só representa dados.
Tokens CSS são a fonte de verdade para Tailwind 4, inclusive para duração e
easing. A composição ativa não depende de biblioteca JavaScript de motion nem
mantém uma camada paralela de tokens.

O sistema suporta duas composições: editorial para Landing e funcional para
Catálogo. Componentes editoriais continuam route-scoped.

Na Fase 2.5, `EntryLanding` compõe somente `LandingHero`, `LandingReasons` e
`LandingFAQ`. `LandingHero` carrega `SafetyVisorVisual` com `React.lazy`; esse
boundary pertence exclusivamente à rota `/` e não entra no grafo do Catálogo.
O componente registra `<model-viewer>` 3.5.0 por import dinâmico do módulo apenas
quando o Hero se aproxima da viewport e o browser está ocioso. O modelo e o
poster são assets locais; somente o runtime vem de `unpkg.com`. O poster constitui
a experiência base e permanece em falha, timeout, bloqueio do runtime ou telas
abaixo de 480 px. Não existe nova dependência npm, estado transversal ou import
do viewer no shell compartilhado. O stage visual é transparente e não cria uma
nova superfície de card; modelo e fallback compartilham a mesma geometria sobre
o fundo do Hero. O `Footer` compartilhado consulta o pathname apenas para exibir
a atribuição CC BY 4.0 na área legal quando a rota ativa é `/`; não importa nem
inicializa o viewer. Essa decisão está registrada na ADR 0005.

A variante transparente de `Header` é selecionada pelo pathname `/`; o header
funcional permanece nas demais rotas. O Catálogo não importa os
cards editoriais nem os assets exclusivos da Landing.

### Estado do cliente

- `AuthContext`: sessão, usuário e indicação visual de admin;
- `QuoteCartContext`: carrinho local e sincronizado;
- React Query: leitura, cache e invalidação de dados remotos;
- `localStorage`: carrinho anônimo e sessão Supabase;
- `sessionStorage`: cache de conveniência de `isAdmin`, sem autoridade.

O cache `ita_is_admin` nunca deve ser usado como controle de autorização.
Autorização efetiva ocorre no servidor, nas RPCs e nas policies RLS.

### Isolamento visual local

O modo Vite `ui` adiciona uma fronteira local de desenvolvimento antes da camada
de integração:

```text
Componentes/rotas → fixtures e estados simulados
                  ↘ guard de fetch → requisição bloqueada no browser
```

Essa fronteira existe apenas para revisão de UI/UX. Ela mantém o visitante
anônimo, evita inicialização dos fluxos automáticos de autenticação e troca dados
remotos já identificados por fixtures locais. O comportamento normal, os
contratos Supabase e a autoridade de RLS não são alterados.

Na rota `/`, os modos normal e `ui` usam `EntryLanding`. A diferença do modo
`ui` permanece restrita ao isolamento local de rede e sessão; ele não seleciona
mais uma home alternativa. A Landing usa conteúdo local tipado e Radix Accordion
no FAQ. Todos os destinos internos são caminhos
relativos, sem vínculo a uma porta local específica.

O modo visual não é uma implantação alternativa: a configuração Vite impede a
geração de build com `mode=ui`. O build normal inclui a Landing na rota `/`, mas
mantém suas dependências fora do grafo da rota `/catalogo` por meio das
fronteiras de arquivos do TanStack Router.

### Aplicação full-stack

- `src/start.ts`: middleware global de erros e anexação do JWT a Server Functions;
- `src/server.ts`: adaptador do Worker e normalização de erros SSR;
- `src/lib/*.functions.ts`: Server Functions;
- `src/routes/api/`: endpoints HTTP;
- `src/routes/mcp.ts` e `src/lib/mcp/`: servidor MCP.

### Persistência e autorização

- Supabase Auth emite e valida JWTs;
- PostgreSQL armazena catálogo, empresas e cotações;
- grants definem quais operações chegam ao banco;
- RLS restringe as linhas;
- RPCs `SECURITY DEFINER` encapsulam operações privilegiadas;
- triggers mantêm integridade e histórico;
- Storage guarda logos.

No projeto publicado pelo Lovable existe temporariamente uma divergência de
ambiente: o código e `supabase/config.toml` reconhecem `porgyoqngtshxdxuwaft`
como destino canônico, mas as variáveis gerenciadas do runtime ainda pertencem
ao backend Lovable Cloud. O conector de Supabase externo é a fronteira que deve
substituir essas variáveis de forma controlada; editar `.env` no repositório não
resolve o vínculo e pode ser sobrescrito no build seguinte.

### Notificações

`supabase/functions/enviar-notificacao-cotacao/index.ts` valida o JWT do chamador,
consulta a cotação sob RLS, usa RPCs server-side e envia mensagens por EmailJS.

O formulário público de `/contato` usa um componente próprio e permanece no
browser. Ele envia somente assunto, nome, telefone opcional, e-mail e mensagem
ao serviço EmailJS já adotado. A configuração client-side é centralizada em
`src/lib/emailjs-config.ts`; cotação e contato possuem IDs de template distintos.
O contato exige `VITE_EMAILJS_TEMPLATE_ID_CONTATO` e falha de forma segura quando
o valor não existe, sem fallback para `EMAILJS_TEMPLATE_ID_COTACAO`. O contrato
do template está versionado em `docs/email-templates/contato.html`. A criação do
template e a configuração do ID no ambiente remoto continuam operações externas
independentes. Esse fluxo não escreve no Supabase e não altera a fronteira
autenticada de cotação.

## Fluxos de autenticação

### Browser para Supabase

O cliente público usa URL e publishable key. O JWT da sessão é enviado pelo SDK e
o banco aplica RLS.

### Browser para Server Function

`attachSupabaseAuth` obtém o access token da sessão e adiciona
`Authorization: Bearer`. `requireSupabaseAuth` valida claims no servidor e
constrói um cliente Supabase vinculado ao usuário.

### Servidor privilegiado

`client.server.ts` usa `SUPABASE_SERVICE_ROLE_KEY`. Esse cliente ignora RLS e só
pode ser importado em código de servidor. Cada uso deve possuir validação própria,
limite de abuso e registro de erro.

## Deploy

### Aplicação

`npm run build` gera:

- `.output/public`: assets do cliente;
- `.output/server`: Worker e configuração Nitro;
- `.output/server/wrangler.json`: configuração efetiva para deploy.

Na Vercel, o preset gera os assets públicos em `.vercel/output/static` e as
funções em `.vercel/output/functions`. O gate `verify-build-env` inspeciona
somente o diretório correspondente ao provedor atual; ele não usa artefatos de
outro preset como fallback. No GitHub Pages, o diretório verificado é
`dist/github-pages/client`.

`npm run deploy` executa o build e publica com Wrangler.

Superfícies atualmente autorizadas:

- `https://itasafety.lovable.app/`: implantação remota principal;
- `https://itasafety.vercel.app/`: implantação secundária, com health degradado
  em 29/07/2026;
- `http://localhost:8080/`: desenvolvimento local.

`https://itasafety.com.br/` pertence ao site legado. Ele não comprova o estado do
projeto novo e só deve ser redirecionado ou retirado após o cutover documentado.

### Supabase

- migrations canônicas: `supabase/migrations/`;
- Edge Functions: `supabase/functions/`;
- project ref canônico: `porgyoqngtshxdxuwaft`;
- vínculo selecionado no Lovable em 06/08/2026: projeto Supabase externo com o
  ref canônico; o catálogo esperado foi reconhecido;
- runtime publicado, OAuth, issuer do MCP e comportamento autenticado após a
  troca: `não confirmados`;
- a reconciliação e o plano de validação estão em
  `decisions/0003-migracao-backend-supabase-canonico.md`.

Aplicar migration e implantar Edge Function são operações independentes.

## Decisões relevantes

- autorização administrativa é confirmada por `has_role`, não por estado do
  frontend;
- chamadas do usuário permanecem sob RLS;
- `service_role` é reservado para fronteiras server-side;
- arquivos sensíveis são excluídos da cópia de `public/`;
- falhas SSR catastróficas recebem uma página de erro controlada;
- documentação e evidência fazem parte da definição de pronto.

## Limitações arquiteturais conhecidas

- cotação ainda é criada em múltiplas operações;
- notificação possui claim global, não outbox completa por destinatário;
- o rate limit falha aberto quando a configuração administrativa não existe;
- observabilidade Sentry é apenas um stub;
- build não executa typecheck;
- `wrangler.jsonc` histórico aponta para `dist`, enquanto o deploy atual usa a
  configuração gerada em `.output/server/wrangler.json`;
- `wrangler.jsonc`, a Edge Function, dados estruturados de contato e ferramentas
  MCP ainda contêm referências ao domínio legado;
- é necessário escolher a URL canônica de cada ambiente antes de reconciliar
  links de e-mail, OAuth, SEO, sitemap e MCP;
- catálogo possui dados locais e remotos, exigindo disciplina para evitar drift.
- a Fase 1 usa oito produtos e 14 categorias locais; a completude, a taxonomia e
  a correspondência com o catálogo remoto permanecem não confirmadas;
- a autenticação só ocorre ao finalizar a cotação, mas a criação transacional da
  cotação permanece como débito independente e não foi alterada nesta fase.
