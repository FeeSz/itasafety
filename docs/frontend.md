# Frontend

## Stack e inicialização

- React 19;
- TypeScript;
- TanStack Router com rotas baseadas em arquivos;
- TanStack React Query;
- TanStack Start para SSR e Server Functions;
- Tailwind CSS;
- Radix UI e componentes locais;
- `sonner` para notificações;
- Supabase JS para Auth, banco, Storage e Edge Functions.

`src/router.tsx` cria o router e um `QueryClient`. `src/routes/__root.tsx`
instala os providers globais, layout, tratamento visual de erros, carrinho e
autenticação.

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

Header, footer e botão flutuante de cotação são omitidos nas rotas de
autenticação.

## Rotas públicas

| Rota                   | Finalidade                                                           |
| ---------------------- | -------------------------------------------------------------------- |
| `/`                    | Página inicial, catálogo em destaque e posicionamento institucional. |
| `/categorias`          | Lista de categorias de EPI.                                          |
| `/departamento/$slug`  | Produtos de uma categoria.                                           |
| `/detalhes/$sku`       | Detalhe de produto.                                                  |
| `/carrinho`            | Revisão e submissão da cotação.                                      |
| `/contato`             | Contato comercial.                                                   |
| `/localizacao`         | Endereço e canais de atendimento.                                    |
| `/sobre`               | Apresentação institucional histórica.                                |
| `/quemsomos`           | Missão, visão, valores e posicionamento.                             |
| `/privacidade`         | Política de privacidade.                                             |
| `/termos`              | Termos de uso.                                                       |
| `/cookies`             | Política e preferências de cookies.                                  |
| `/auth`                | Login, cadastro e recuperação.                                       |
| `/auth/callback`       | Conclusão de OAuth e redirecionamento por role.                      |
| `/reset-password`      | Definição de nova senha.                                             |
| `/login` e `/cadastro` | Redirecionamentos de compatibilidade para `/auth`.                   |
| `/sitemap.xml`         | Sitemap.                                                             |
| `/api/public/health`   | Sinal mínimo de disponibilidade.                                     |

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

A home adiciona dados estruturados de organização e website. Existem ainda
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
- a tela `/admin/status` espera um payload de health mais rico do que o endpoint
  público atualmente retorna;
- o bundle principal do cliente ainda supera 500 kB minificado;
- o build ainda apresenta avisos originados no toolchain e em dependências, sem
  aviso de API TanStack depreciada no código da aplicação.
