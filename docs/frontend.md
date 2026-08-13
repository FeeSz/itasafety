# Frontend

## Stack e inicialização

- React 19;
- TypeScript;
- TanStack Router com rotas baseadas em arquivos;
- TanStack React Query;
- TanStack Start para SSR e Server Functions;
- Tailwind CSS;
- Radix UI e componentes locais;
- Motion no sistema de movimento experimental do modo visual;
- `sonner` para notificações;
- Supabase JS para Auth, banco, Storage e Edge Functions.

`src/router.tsx` cria o router e um `QueryClient`. `src/routes/__root.tsx`
instala os providers globais, layout, tratamento visual de erros, carrinho e
autenticação.

## Fundação visual compartilhada — Fase 2

Estado: **implementado localmente, não implantado**.

`src/styles.css` é a fonte canônica dos tokens compatíveis com Tailwind CSS 4.
Não foi aplicado preset externo nem adicionada dependência. Aliases antigos
continuam disponíveis apenas como ponte para superfícies ainda não migradas.

### Tipografia

Inter é a única fonte web e atende interface e display. SKU, referência e dados
usam a pilha mono do sistema (`SFMono-Regular`, `Cascadia Code`, Consolas e
fallbacks), sem baixar uma segunda família. A escala semântica é:

| Papel                          | Token                                       | Valor base                        |
| ------------------------------ | ------------------------------------------- | --------------------------------- |
| Display                        | `text-display`                              | `clamp(2rem, 7.8vw, 4.5rem)`      |
| H1                             | `text-h1`                                   | `clamp(2.25rem, 4.5vw, 4.25rem)`  |
| H2                             | `text-h2`                                   | `clamp(1.75rem, 3vw, 3rem)`       |
| H3                             | `text-h3`                                   | `clamp(1.25rem, 2vw, 1.75rem)`    |
| Title                          | `text-title`                                | `1.0625rem`                       |
| Body large / body / body small | `text-body-lg`, `text-body`, `text-body-sm` | `1.0625rem`, `1rem`, `0.875rem`   |
| Label / caption / data         | `text-label`, `text-caption`, `text-data`   | `0.8125rem`, `0.75rem`, `0.75rem` |

Uppercase e tracking amplo não são defaults de label. Mono fica reservado a
dados, não a toda microcopy.

### Cor e superfícies

| Papel                             | Valor                                                      |
| --------------------------------- | ---------------------------------------------------------- |
| Background                        | `#f4f8fb`                                                  |
| Surface / elevated                | `#ffffff`                                                  |
| Surface muted                     | `#eef3f7`                                                  |
| Surface inverse                   | `#142536`                                                  |
| Foreground                        | `#101820`                                                  |
| Foreground muted / subtle         | `#4f6170` / `#607283`                                      |
| Border / border strong            | `#d6e0e8` / `#b7c6d3`                                      |
| Primary / hover / active          | `#086caf` / `#075c96` / `#064b7a`                          |
| Brand accent                      | `#d92f26`, usado com parcimônia                            |
| Success / warning / danger / info | tokens semânticos próprios e respectivas superfícies muted |

`background`, `surface`, `surface-elevated`, `surface-muted`, texto, borda,
ação e feedback são papéis; componentes ativos não devem criar novos
hexadecimais. Dark surface padrão é `surface-inverse`; alternância claro/escuro
permanece editorial e intencional.

### Espaçamento e containers

- gutter de página: `clamp(1rem, 3vw, 2rem)`;
- seção funcional: `clamp(2.5rem, 6vw, 4.5rem)`;
- seção editorial: `clamp(4rem, 9vw, 7rem)`;
- card: `clamp(1rem, 2vw, 1.5rem)`;
- stacks: seção `2rem`, conteúdo `1rem`, controle `0.5rem`, inline `0.75rem`;
- `Container` oferece `sm`, `md`, `lg` e `xl` com 40, 48, 74 e 80 rem.

Landing compõe os tokens com densidade editorial; Catálogo usa densidade
funcional. O hero especial pode manter dimensões próprias quando elas representam
a composição aprovada, sem criar outro gutter de página.

### Radius, borda e elevação

- radius: `xs 4`, `sm 6`, `md 10`, `lg 16`, `xl 24` px e `full` somente para
  indicadores ou controles cuja forma circular tenha intenção;
- bordas usam `border` por padrão e `border-strong` para controle/estado;
- sombras: `subtle`, `elevated` e `overlay`; cards comuns usam `subtle`;
- nenhuma superfície ativa combina borda forte, sombra forte e glow decorativo.

### Primitives e estados

- `Button`: `default`, `secondary`, `outline`, `ghost`, `destructive` e `link`;
  alturas de 44 px por padrão e 48 px em `lg`, com hover, pressed, disabled,
  `aria-busy` e loading;
- `Input` e `Textarea`: 44 px mínimos, texto de 16 px, estados focus, invalid,
  disabled e read-only;
- `Surface`: `card`, `elevated`, `muted`, `overlay` e `plain`;
- `CatalogProductCard`: seleção de produto, imagem estável, CTA e sucesso local;
- `CategoryCard`: navegação, ícone e hierarquia próprios, sem CTA de seleção;
- `Skeleton` usa shimmer discreto e geometria aproximada dos cards;
- `EmptyState` explica o estado e aceita próximo passo; `ErrorState` usa
  `role=alert` e ação recuperável;
- Sonner usa 4 segundos por padrão, close button e borda semântica por tipo.

Focus usa outline de 2 px e offset de 3 px; superfícies inversas usam variante
branca. Dropdown, Sheet e Dialog continuam em Radix, com overlay, elevação,
targets e foco normalizados.

### Motion

Tokens CSS: `instant 80ms`, `fast 140ms`, `normal 220ms`, `slow 360ms` e
`editorial 560ms`. Esses tokens CSS são a fonte única para o motion atualmente
ativo; a dependência `motion` e seu espelho TypeScript foram removidos por não
possuírem consumidor na árvore renderizada.
Controles funcionais animam somente cor, borda, sombra, opacidade e transform.
Não há `transition-all` nos primitives e consumidores públicos tocados na Fase 2.
O padrão global de `prefers-reduced-motion` reduz animações e transições.

## Composição editorial da Landing — Fase 2.5

Estado: **implementado e validado visualmente no ambiente local, não
implantado**.

`LandingHero` preserva headline, contexto e ações em uma malha editorial de 12
colunas. Contexto e CTAs ficam imediatamente abaixo da headline; a área visual
à direita apresenta o modelo interativo “PPE VISOR”, de Lanzaman, em
`<model-viewer>`. O GLB licenciado em CC BY 4.0 é servido localmente em
`/models/ppe-visor.glb`, convertido de Spec/Gloss para Metal/Rough e otimizado
com texturas WebP de 1024 px e Draco. O
componente é carregado dinamicamente somente na Landing, inicializa após
proximidade da viewport e tempo ocioso e mantém um poster PNG de 640 × 400 px
no mesmo espaço durante carregamento ou falha. O objeto aparece diretamente
sobre o fundo do Hero, sem moldura, card, borda, radius ou sombra de container;
um gradiente ambiental e uma sombra de contato radiais preservam a leitura
física da peça sem criar uma nova superfície.

Em até 479 px a Landing não solicita runtime nem GLB: o poster é a apresentação
definitiva para preservar dados móveis e o gesto de scroll. A partir de 480 px o
viewer suporta órbita manual com zoom desabilitado e raio de câmera travado. A
auto-rotação é limitada a 2 graus por segundo, começa após 2,6 segundos e é
desativada por `prefers-reduced-motion`; `touch-action` preserva o scroll vertical.
Para acomodar a silhueta completa nos ângulos extremos, o canvas interativo usa
120% da geometria visível do stage e a câmera fica travada em 2,64 m, preservando
a escala aparente anterior com 20% de margem adicional. Após o carregamento, o
produto recebe uma entrada curta por opacidade e deslocamento vertical, seguida
por um deslocamento ocioso de até 5 px em 7 segundos com sombra de contato
sincronizada. Todo esse motion editorial, além da auto-rotação, é removido por
`prefers-reduced-motion`; a órbita manual continua disponível.
O poster possui
dimensões explícitas, texto alternativo e permanece visível até o evento `load`;
timeout, bloqueio do runtime ou ausência de WebGL nunca produzem área vazia. A
atribuição CC BY 4.0 a Lanzaman e Sketchfab permanece visível na área legal do
Footer somente na Landing, sem competir com a apresentação do produto. A
inspeção visual em rotação completa não encontrou marca de fabricante no asset;
o modelo continua sendo referência visual, não SKU, certificação ou CA ItaSafety.

`LandingReasons` adota o ritmo solicitado pela referência: superfície
`#f5f5f7`, trilho horizontal e quatro cards de `372 × 492 px` com radius de
30 px. Cada mídia agora ocupa a superfície completa do card. Um veil superior
combina gradiente tonal e `backdrop-filter` progressivo para preservar a leitura
da copy curta sem separar texto e fotografia em duas caixas. O hover movimenta
somente o item ativo em 4 px e aplica zoom de mídia de 1,8%. A mesma etapa
termina com uma composição editorial larga: título externo, mídia full-bleed,
copy curta e uma única ação comercial.

O header possui uma variante exclusiva da rota `/`: transparente, sem busca,
cotação, conta, dropdowns ou menu hambúrguer. Início, Motivos e Perguntas são
âncoras semânticas de 44 px com underline progressivo em hover e foco. A
navegação fica agrupada junto à marca, com logo maior somente na Landing. O
header funcional das demais rotas permanece inalterado.

`InteractivePhone`, Product Family, full-bleed, jornada intermediária e CTA final
não participam mais da árvore ativa da Landing. A página renderizada contém
somente Hero, Motivos, FAQ e o Footer global. O trilho dos motivos preserva o
tamanho dos cards em desktop e revela os itens horizontalmente em telas menores,
sem criar overflow na página.

## Modo visual local

`npm run dev:ui` inicia a aplicação no modo Vite `ui`, destinado exclusivamente
à revisão local de UI/UX sem usar o backend.

Nesse modo:

- `src/lib/visual-mode.ts` instala o bloqueio de `fetch` antes da criação do
  router;
- `AuthProvider` representa um visitante anônimo sem consultar sessão ou roles;
- a faixa de parceiros usa fixtures de `src/mocks/visual-fixtures.ts`;
- autenticação, recuperação de senha e formulário público simulam seus estados
  visuais sem enviar dados;
- callbacks OAuth e a tela de consentimento externo não executam o fluxo real;
- a rota `/` apresenta o mesmo `EntryLanding` usado pelo build normal;
- links internos permanecem relativos e navegáveis no ambiente atual;
- um indicador removível informa `Modo visual · backend isolado`.

O modo é opt-in: `npm run dev` e os builds normais preservam integrações; o modo
`ui` altera somente as fronteiras locais de rede e sessão. O Vite rejeita
`vite build --mode ui`, portanto esse modo não produz artefato publicável.

Limitações atuais:

- o primeiro cenário é o de visitante anônimo;
- telas autenticadas e administrativas ainda exigem fixtures próprias antes de
  serem revisadas com conteúdo representativo;
- o bloqueio cobre chamadas `fetch` iniciadas pela aplicação; links externos,
  imagens, iframes e navegação manual para endpoints não são uma sandbox de rede;
- o modo visual não substitui testes funcionais, RLS ou validação de produção.

## Estrutura visual global

Em rotas comuns:

```text
AuthProvider
└─ QuoteCartProvider
   ├─ Header
   ├─ Outlet da rota
   ├─ Footer
   ├─ CookieBanner
   ├─ QuoteFab
   └─ Toaster
```

Header, Footer e o acesso flutuante à cotação são omitidos nas rotas de
autenticação. Landing e Catálogo compartilham Header e Footer. O `QuoteFab` é
renderizado para visitante ou usuário autenticado quando a lista possui itens;
o modo `ui` mantém o indicador de isolamento e omite apenas o banner de cookies
na entrada `/`.

## Rotas públicas

| Rota                   | Finalidade                                                     |
| ---------------------- | -------------------------------------------------------------- |
| `/`                    | Landing institucional da marca ItaSafety.                      |
| `/catalogo`            | Busca, categorias principais, produtos e seleção para cotação. |
| `/categorias`          | Lista de categorias de EPI.                                    |
| `/departamento/$slug`  | Produtos de uma categoria.                                     |
| `/detalhes/$sku`       | Detalhe de produto.                                            |
| `/carrinho`            | Revisão e submissão da cotação.                                |
| `/contato`             | Contato comercial.                                             |
| `/localizacao`         | Endereço e canais de atendimento.                              |
| `/sobre`               | Apresentação institucional histórica.                          |
| `/quemsomos`           | Missão, visão, valores e posicionamento.                       |
| `/privacidade`         | Política de privacidade.                                       |
| `/termos`              | Termos de uso.                                                 |
| `/cookies`             | Política e preferências de cookies.                            |
| `/auth`                | Login, cadastro e recuperação.                                 |
| `/auth/callback`       | Conclusão de OAuth e redirecionamento por role.                |
| `/reset-password`      | Definição de nova senha.                                       |
| `/login` e `/cadastro` | Redirecionamentos de compatibilidade para `/auth`.             |
| `/sitemap.xml`         | Sitemap.                                                       |
| `/api/public/health`   | Sinal mínimo de disponibilidade.                               |

### Separação Landing e Catálogo

`src/routes/index.tsx` monta exclusivamente `EntryLanding`. A antiga composição
híbrida com `HeroSlider`, `TrustSignals`, `HomeValueSection`, `PartnersStrip` e
`CommercialCTA` não foi transportada para outra rota e não participa mais da
árvore ativa da home. Os arquivos permanecem locais para avaliação posterior.

`src/routes/catalogo.tsx` concentra a descoberta funcional nesta ordem:

1. contexto compacto e busca;
2. categorias principais por `CategoryGrid`;
3. produtos locais publicados por `CatalogProductCard`;
4. ajuda comercial discreta.

A busca usa o parâmetro `q` da URL e filtra nome, SKU, categoria, descrição e o
número de CA informado nos oito registros locais. O estado vazio é explícito e
não representa essa seleção como o catálogo completo da empresa.

`CatalogProductCard` é a base única usada em `/catalogo`, departamento, produtos
relacionados e na seção legada `FeaturedProducts`. A inclusão chama diretamente
`QuoteCartContext.add` sem gate de autenticação. Login e empresa aprovada
continuam necessários apenas para a submissão efetiva em `/carrinho`.

### Landing editorial publicada localmente

`src/components/landing/EntryLanding.tsx` orquestra a homepage institucional
renderizada na rota `/` tanto no modo normal quanto no modo `ui`.

Características:

- Hero, Motivos e FAQ formam a sequência institucional ativa;
- headline, contexto e ações permanecem fora de cards;
- Motivos usa quatro cards editoriais com tamanho constante, mídia real e trilho
  horizontal responsivo inspirado na referência fornecida;
- Motivos inclui um banner editorial largo com a mensagem "O EPI certo começa
  antes do risco" e uma única ação para contato;
- hover movimenta somente o card ativo em 4 px e adiciona shadow de 5,5%;
- o header da Landing é transparente, agrupa as âncoras junto à marca e amplia a
  assinatura visual sem afetar o header funcional;
- todos os destinos comerciais e institucionais usam caminhos internos relativos;
- `LandingFAQ` usa Radix Accordion com estados ARIA e suporte de teclado;
- Header e Footer globais continuam compartilhados com o Catálogo.

A versão atual não renderiza o componente experimental
`src/components/landing/LandingHeader.tsx`, `MinimalBenefits` nem
`HeroEpiStage`; esses componentes permanecem isolados no diretório experimental
e não afetam a composição atual. O FAQ continua em uma seção editorial estreita.

O Header e o Footer globais continuam sendo a base compartilhada. O Header
seleciona a variante transparente somente em `/`; nas demais rotas mantém busca,
lista de cotação, conta, DropdownMenu e Sheet. A rota `/catalogo` continua sem
importar seções editoriais da Landing.

Estado: atualizado e validado localmente em 12/08/2026; implantação não executada.

#### Assets editoriais da Landing

As cinco fotografias adicionadas nesta etapa foram obtidas no Pexels e são
marcadas pela plataforma como livres para uso sob a [licença do
Pexels](https://www.pexels.com/license/). Os arquivos são locais e não criam
dependência de hotlink:

- `landing-hardhat-gloves.jpg` — [Kindel Media](https://www.pexels.com/photo/close-up-photo-of-yellow-hardhat-and-red-protective-gloves-8488037/);
- `landing-safety-glasses.jpg` — [Kindel Media](https://www.pexels.com/photo/person-holding-safety-glasses-8487719/);
- `landing-protected-worker.jpg` — [AI25.Studio](https://www.pexels.com/photo/a-man-wearing-safety-glasses-and-safety-helmet-4981769/);
- `landing-woman-ppe.jpg` — [Mikael Blomkvist](https://www.pexels.com/photo/woman-in-work-clothes-wearing-hard-hat-and-gloves-8961396/);
- `landing-factory-worker.jpg` — [ThisIsEngineering](https://www.pexels.com/photo/factory-worker-in-a-safety-helmet-19895881/).

### Skeletons e espera assíncrona

`src/components/ui/Skeletons.tsx` concentra skeletons de página, detalhes,
listas e tabelas. `src/router.tsx` usa `PageSkeleton` como
`defaultPendingComponent`, com atraso curto para evitar piscar em navegações
instantâneas.

Consultas iniciais de perfil, cotações, empresas, solicitações, configurações e
cadastros administrativos usam skeletons coerentes com a estrutura final. O
dashboard administrativo também reserva métricas e linhas da tabela durante a
consulta. Indicadores giratórios continuam nas mutações e nos fluxos de Auth,
onde o estado representa uma ação bloqueante e não conteúdo ainda desconhecido.

Todos os skeletons possuem rótulo acessível, conteúdo decorativo oculto de
tecnologia assistiva e reutilizam a classe `skeleton` já existente. A regra global
de `prefers-reduced-motion` reduz a animação do shimmer.

## Rotas autenticadas

| Rota                   | Finalidade                                            |
| ---------------------- | ----------------------------------------------------- |
| `/perfil`              | Cadastro e consulta do perfil empresarial.            |
| `/configuracoes`       | Dados pessoais, empresa, logo e pedidos de alteração. |
| `/minhas-cotacoes`     | Lista das cotações do usuário.                        |
| `/minhas-cotacoes/$id` | Detalhe e histórico da cotação do usuário.            |

O layout `_authenticated` valida a existência do usuário Supabase antes de
carregar as páginas filhas.

## Rotas administrativas

| Rota                           | Finalidade                                 |
| ------------------------------ | ------------------------------------------ |
| `/admin`                       | Visão geral e administração de conteúdo.   |
| `/admin/categories`            | CRUD de categorias.                        |
| `/admin/brands`                | CRUD de marcas.                            |
| `/admin/partners`              | CRUD de parceiros.                         |
| `/admin/cotacoes`              | Lista de cotações.                         |
| `/admin/cotacoes/$id`          | Análise, resposta e devolução de cotação.  |
| `/admin/empresas`              | Gestão de empresas.                        |
| `/admin/empresas/solicitacoes` | Aprovação/rejeição de mudanças cadastrais. |
| `/admin/status`                | Diagnóstico da aplicação.                  |

Antes de carregar o painel, `verifyAdminAccess` executa no servidor e chama
`has_role` com o JWT do usuário. A indicação `isAdmin` no browser é apenas de
interface.

## Rotas MCP e OAuth

- `/mcp`: endpoint MCP;
- `/.mcp/list-tools`: listagem de ferramentas;
- `/.mcp/invoke-tool/$tool`: invocação;
- `/.well-known/oauth-protected-resource`: metadados OAuth;
- `/.lovable/oauth/consent`: consentimento.

Ferramentas atuais:

- listar categorias;
- listar produtos em destaque;
- pesquisar produtos;
- consultar informações públicas da empresa.

## Autenticação no browser

### Contrato de navegação

A rota `/auth` aceita os parâmetros de busca opcionais:

- `mode`: modo inicial, como `login` ou `signup`;
- `next`: caminho interno seguro para retorno após a autenticação.

Os dois parâmetros são opcionais no contrato TypeScript. Links e redirects podem
abrir `/auth` sem fabricar parâmetros vazios. O parâmetro `next` continua sujeito
à validação contra redirects externos.

Os formulários de autenticação, carrinho, cotações e parceiros usam os tipos
concretos do React e do cliente Supabase; casts genéricos para `any` foram
removidos do caminho auditado em 29/07/2026.

`AuthContext`:

- obtém a sessão inicial;
- acompanha `onAuthStateChange`;
- expõe `user`, `session`, `loading` e `isAdmin`;
- consulta `user_roles` para ajustar a interface;
- armazena somente um cache visual de admin em `sessionStorage`.

Fronteiras de módulo:

- `contexts/AuthContext.tsx` exporta somente `AuthProvider`;
- `contexts/auth-context.ts` mantém o contrato e a instância do contexto;
- `hooks/use-auth.ts` expõe a leitura do contexto para os consumidores.

Essa separação preserva o Fast Refresh sem desabilitar regras do ESLint.

O fluxo suporta:

- e-mail e senha;
- cadastro;
- recuperação de senha;
- OAuth configurado no Supabase;
- redirecionamento pós-login;
- alerta de MFA para administradores.

O painel administrativo encerra a sessão após 15 minutos de inatividade.

## Carrinho

`QuoteCartContext` mantém:

- `items`;
- quantidade total;
- operações de adicionar, remover, alterar quantidade e limpar;
- estado visual do carrinho;
- estado de sincronização.

O provider permanece em `components/quote/QuoteCartContext.tsx`; contrato e
instância ficam em `contexts/quote-cart-context.ts`; consumidores usam
`hooks/use-quote-cart.ts`.

Persistência:

- anônimo: chave `itasafety:quote` em `localStorage`;
- autenticado: `carrinho_cotacao`, com sincronização local;
- após login: migração dos itens locais para o banco.

O banco e RLS, não o contexto React, são responsáveis por impedir acesso ao
carrinho de outro usuário.

## Envio de cotação

Na implementação atual de `/carrinho`:

1. valida formulário com Zod;
2. exige usuário e empresa aprovada;
3. insere cabeçalho em `cotacoes`;
4. insere snapshots em `cotacao_itens`;
5. invoca a Edge Function;
6. limpa o carrinho e mostra o número da cotação.

Esse processo ainda não é atômico. Não reimplementar ou expandir o fluxo sem
considerar a RPC transacional pendente.

## Painel de cotação

O admin:

- consulta dados, itens, histórico e notificações;
- marca automaticamente uma cotação `enviado` como `em_analise`;
- informa valores e condições;
- solicita resposta ou devolução pela Edge Function;
- apresenta falhas de notificação quando existentes.

O usuário acompanha estados e conteúdo da resposta nas rotas
`/minhas-cotacoes`.

## SEO e conteúdo

`src/lib/seo.ts` padroniza:

- title e description;
- canonical;
- Open Graph;
- Twitter cards;
- `noindex` quando solicitado.

A Landing adiciona somente dados estruturados `Organization` e `WebSite`. O
Catálogo possui title, description e canonical próprios; `/catalogo` também foi
incluído no sitemap. A página de produto deixou de publicar `Product`, `Offer`,
estoque, marca ou disponibilidade sem fonte confirmada. Existem ainda
`robots.txt`, `sitemap.xml`, `llms.txt` e verificação Google.

## Segurança do bundle

`vite.config.ts` desativa a cópia automática e usa uma allowlist operacional
para não publicar `.env`, arquivos de configuração, Git, dependências e outros
artefatos sensíveis.

`scripts/verify-build-env.mjs` verifica o bundle após o build.

## Fronteiras de Fast Refresh

Arquivos que exportam componentes React não exportam hooks ou configurações de
variantes usadas por outros módulos:

- hooks de autenticação e carrinho ficam em `src/hooks/`;
- contextos compartilhados ficam em `src/contexts/`;
- variantes de `Button` e `Toggle` ficam em `button.variants.ts` e
  `toggle.variants.ts`;
- variantes internas e hooks internos não utilizados fora do próprio componente
  deixaram de fazer parte da API pública do módulo.

Em 29/07/2026, `react-refresh/only-export-components` passou sem avisos e sem
alteração ou exceção na regra.

## Débitos conhecidos

- dados editoriais locais podem divergir do banco;
- os oito produtos e as 14 categorias locais não comprovam o portfólio remoto;
- status de CA, fabricante, estoque, normas, aplicações e garantia permanecem
  não confirmados;
- a taxonomia local mistura tipo, proteção, ambiente, material, aplicação e
  atributo e precisa de decisão de negócio antes de filtros avançados;
- a tela `/admin/status` espera um payload de health mais rico do que o endpoint
  público atualmente retorna;
- o bundle principal do cliente ainda supera 500 kB minificado;
- o build ainda apresenta avisos originados no toolchain e em dependências, sem
  aviso de API TanStack depreciada no código da aplicação.
