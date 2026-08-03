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

### Estado do cliente

- `AuthContext`: sessão, usuário e indicação visual de admin;
- `QuoteCartContext`: carrinho local e sincronizado;
- React Query: leitura, cache e invalidação de dados remotos;
- `localStorage`: carrinho anônimo e sessão Supabase;
- `sessionStorage`: cache de conveniência de `isAdmin`, sem autoridade.

O cache `ita_is_admin` nunca deve ser usado como controle de autorização.
Autorização efetiva ocorre no servidor, nas RPCs e nas policies RLS.

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

### Notificações

`supabase/functions/enviar-notificacao-cotacao/index.ts` valida o JWT do chamador,
consulta a cotação sob RLS, usa RPCs server-side e envia mensagens por EmailJS.

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
- project ref canônico pretendido: `porgyoqngtshxdxuwaft`;
- project ref efetivamente conectado hoje: backend gerenciado do Lovable Cloud
  (ref distinto, resolvido pelas variáveis de ambiente da plataforma);
- a divergência e o plano de troca estão em
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
