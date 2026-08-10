# Operações

## Ambientes e serviços

| Componente         | Ambiente conhecido                          |
| ------------------ | ------------------------------------------- |
| Aplicação Lovable  | `https://itasafety.lovable.app/`            |
| Aplicação Vercel   | `https://itasafety.vercel.app/`             |
| Desenvolvimento    | `http://localhost:8080/`                    |
| Site legado        | `https://itasafety.com.br/`                 |
| Aplicação          | Cloudflare Worker `itasafety`               |
| Banco/Auth/Storage | Supabase externo selecionado: `porgyoqngtshxdxuwaft`; Lovable publicado, backend efetivo ainda não confirmado |
| Edge Function      | `enviar-notificacao-cotacao`                |
| E-mail             | EmailJS                                     |
| Build alternativo  | GitHub Pages em `/itasafety/`               |

Domínios, contas e IDs devem ser confirmados no painel antes de uma operação
destrutiva ou deploy.

Uso atual:

- Lovable é a referência remota principal para smoke tests e testes autenticados;
- Vercel é uma implantação secundária/preview;
- localhost é usado para desenvolvimento e testes locais;
- `itasafety.com.br` pertence ao site antigo e será retirado somente depois da
  conclusão e migração controlada para o projeto novo.

Em 29/07/2026:

- Lovable respondeu `200` na home e `200 {"status":"ok"}` no health check;
- localhost respondeu `200` na home e `200 {"status":"ok"}` no health check;
- Vercel respondeu `200` na home, mas `503 {"status":"degraded"}` no health
  check.

O Vercel não deve ser considerado saudável para fluxos de backend até que suas
variáveis e conectividade sejam reconciliadas.

## Variáveis de ambiente

### Públicas, embutidas no frontend

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_PUBLISHABLE_KEY`;
- `VITE_SUPABASE_PROJECT_ID`;
- `VITE_SITE_URL`;
- opcional: `VITE_SENTRY_DSN`.

Publishable key é própria para cliente, mas continua sujeita a rotação e não deve
ser confundida com `service_role`.

### Conexão Lovable → Supabase

Para um projeto que usa Supabase externo, existem dois vínculos distintos:

1. um owner/admin do workspace Lovable autoriza a organização Supabase;
2. um editor conecta o projeto Lovable ao projeto Supabase correto.

No ItaSafety, o vínculo deve apontar para o project ref canônico
`porgyoqngtshxdxuwaft`. A confirmação deve ser feita em **More → Cloud** no
editor do projeto e no painel Supabase; o simples estado `stack: supabase` não
identifica qual projeto está conectado.

Em 06/08/2026, o proprietário selecionou o projeto externo `ItaSafety`. O
Lovable reconheceu o catálogo esperado e gerou configuração para o ref
`porgyoqngtshxdxuwaft`. Em 10/08/2026, o código reconciliado chegou a `main` e o
Lovable registrou esse commit como publicado e `ready`. Isso confirma a versão
de código, mas não o project ref efetivamente consumido pelo runtime nem os
fluxos autenticados posteriores à troca. Ver
`decisions/0003-migracao-backend-supabase-canonico.md`.

Depois de conectar ou corrigir as variáveis, é obrigatório gerar e publicar um
novo build. Variáveis `VITE_*` são incorporadas no bundle durante o build e não
passam a existir retroativamente em uma publicação anterior.

Nunca usar nestes campos:

- senha PostgreSQL;
- `service_role`;
- token pessoal do Google;
- token de sessão do Supabase CLI.

O frontend usa somente a URL do projeto e a publishable key. Não colar valores
de credenciais em chat, documentação, issue ou commit.

### Servidor da aplicação

- `SUPABASE_URL`;
- `SUPABASE_PUBLISHABLE_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `SITE_URL`;
- opcional: `SENTRY_DSN`.

### Edge Function

- `SUPABASE_URL`;
- `SUPABASE_ANON_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `SITE_URL`;
- `ADMIN_QUOTES_EMAIL`;
- `EMAILJS_SERVICE_ID` ou variante administrativa;
- `EMAILJS_PUBLIC_KEY` ou variante administrativa;
- `EMAILJS_PRIVATE_KEY` ou variante administrativa;
- IDs de template de nova cotação, resposta e devolução.

Os valores ficam em gerenciadores de segredo, nunca no repositório.

## Desenvolvimento

```bash
npm ci
npm run dev
```

O arquivo local esperado é `.env.local`, ignorado pelo Git.

O toolchain reproduzível usa Node.js 22 e npm `11.18.0`. O `package.json`
declara essa versão e o workflow instala explicitamente o mesmo npm antes de
executar `npm ci`. A declaração `packageManager` documenta o contrato, mas não
substitui a instalação explícita porque o Corepack não intercepta o binário npm
por padrão.

O único lockfile canônico é `package-lock.json`. Não manter `bun.lock`,
`pnpm-lock.yaml` ou `yarn.lock` em paralelo: provedores que autodetectam o
gerenciador podem escolher outro instalador e validar uma árvore diferente da
usada pelo Quality. A instalação reproduzível, local e remota, é `npm ci` com
npm `11.18.0`.

## Gates locais

```bash
npm run build
npx tsc --noEmit
npm run lint
npm audit
```

Estado observado em 28/07/2026:

- build: passa;
- typecheck: falha;
- lint: falha;
- audit offline: sem achados no cache, não equivalente a consulta online atual.

Estado local após saneamento de 29/07/2026:

- `npm run typecheck`: passa;
- `npm run lint`: passa sem erros ou avisos;
- `npm run build`: passa e confirma as variáveis Supabase no bundle;
- as duas Server Functions de autenticação usam `validator()`, sem o aviso
  depreciado de `inputValidator()`;
- hooks, contextos e variantes foram separados sem desabilitar
  `react-refresh/only-export-components`;
- workflow `.github/workflows/quality.yml`: publicado com `npm ci`, typecheck e
  lint;
- o primeiro run remoto, `30539013879`, falhou em `npm ci` porque o npm `10.9.8`
  do Node 22 considerou ausente `lru-cache@11.5.2` no lockfile; typecheck e lint
  foram pulados;
- a correção local fixa npm `11.18.0`, versão que aceitou o lockfile e passou
  `npm ci`, typecheck e lint em container Linux Node 22;
- a correção foi publicada no commit
  `aec0304cdaf31e7a54492856600e32ec3dd4493b` e o run remoto
  `30544422644` concluiu com sucesso em Setup Node, Pin npm, `npm ci`,
  typecheck e lint;
- o replay SQL foi executado em banco efêmero e parou na migration
  `20260708000000_create_partners.sql`; detalhes estão na seção de migrations;
- `npm run check`: gate local agregado para typecheck, lint e build.

Triagem AUD-12 em 29/07/2026:

- relatório detalhado em `security/dependency-audit-2026-07-29.md`;
- após consentimento específico, `npm audit --json` online reportou nove
  registros: cinco altos, três moderados, um baixo e nenhum crítico;
- com `--omit=dev`, restaram três moderados e um baixo;
- os cinco registros altos são exclusivos da cadeia de lint do ESLint;
- `npm audit --offline` retornou zero e foi descartado como evidência atual;
- os caminhos residuais estão em MCP, build/dev server e ESLint;
- não foi usado `npm audit fix --force`, override semver ou atualização major;
- antes de release/deploy, repetir a consulta online e revisar a decisão
  `decisions/0002-temporary-dependency-risk.md`.

Avisos residuais do build:

- chunk principal do cliente acima de 500 kB minificado;
- diretivas `"use client"` ignoradas pelo empacotador em dependências;
- imports não utilizados e opção `platform` originados no toolchain;
- sobrescritas esperadas de `main` e `assets` na configuração Cloudflare gerada.

Esses avisos não foram ocultados e devem ser triados em etapas próprias.

Uma entrega não deve ocultar essas falhas. Até os gates serem saneados, registre
se o erro é novo ou preexistente.

## Build

`npm run build`:

1. executa Vite/TanStack Start;
2. gera cliente e Worker em `.output`;
3. filtra arquivos de `public`;
4. roda `verify-build-env.mjs`.

O verificador deve falhar se as variáveis públicas obrigatórias estiverem ausentes
ou se o bundle contiver um project ref Supabase diferente de
`porgyoqngtshxdxuwaft`.

O diretório inspecionado é determinado pelo ambiente de build e não por uma
busca genérica em artefatos possivelmente antigos:

- Vercel (`VERCEL=1`): `.vercel/output/static`;
- GitHub Pages (`GITHUB_PAGES=true` ou lifecycle `build:github-pages`):
  `dist/github-pages/client`;
- build padrão/Cloudflare: `.output/public`.

Diagnóstico somente leitura de 07/08/2026:

- Cloudflare detectou `bun.lock`, escolheu `bun install --frozen-lockfile` e
  parou antes do build porque o lockfile divergia do manifesto;
- Vercel concluiu as etapas Vite/Nitro e gerou `.vercel/output/static`, mas o
  verificador antigo procurou `.output/public` ou `dist/client`; com cache de
  build restaurado, o erro em `dist/client` não comprova o conteúdo do artefato
  Vercel recém-gerado;
- a reconciliação local remove `bun.lock` e torna o caminho do verificador
  específico por ambiente, sem upgrade de dependências;
- após a implementação, `npm ci`, typecheck e lint passaram; o build padrão
  confirmou `.output/public` e a simulação com `VERCEL=1` confirmou
  `.vercel/output/static`, ambos com valores públicos fictícios;
- os testes negativos sem variáveis e com project ref fictício incorreto foram
  bloqueados com código `1`;
- duas ocorrências depreciadas de `inputValidator()` reapareceram no commit
  automático do Lovable e foram novamente reconciliadas para `validator()`, sem
  alterar schemas ou handlers;
- `.vercel` foi incluído nos ignores do ESLint, junto aos demais outputs de
  build; isso exclui somente código gerado e mantém todos os avisos do fonte
  visíveis;
- a revalidação local em Node `24.16.0` passou em typecheck, lint e nos builds
  Cloudflare/Vercel, sem o aviso depreciado; a repetição em Node 22 não pôde ser
  executada porque o Docker daemon não estava ativo e não havia outro runtime
  Node instalado, portanto o Quality remoto do novo SHA continuará sendo o gate
  autoritativo para Node 22;
- nenhum provedor foi alterado, nenhum build foi publicado e o health HTTP 503
  do Vercel permanece uma pendência remota separada.

Configuração Vercel Preview de 10/08/2026:

- uma inspeção autenticada confirmou inicialmente zero variáveis no escopo
  Preview do projeto `feeszs-projects/itasafety`;
- após autorização explícita, foram adicionadas somente ao alvo `preview`, para
  todas as branches Preview, as variáveis `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SERVICE_ROLE_KEY`;
- todas foram armazenadas como `sensitive`; nenhum valor foi impresso, salvo no
  repositório ou mantido em arquivo temporário;
- as variáveis públicas usam a chave `publishable` moderna e a variável
  server-side privilegiada usa a chave `secret` moderna do projeto canônico;
- uma segunda listagem independente confirmou exatamente as seis entradas no
  alvo Preview e o vínculo local temporário foi removido;
- nenhuma variável de Production ou Development, deployment, domínio, banco ou
  configuração Cloudflare foi alterada;
- a configuração não republicou retroativamente o deployment que falhou;
- o push posterior do commit documental
  `815a6a484ffea47ec409ac2ee8626173cd33b11a` gerou um novo Preview, cujo build
  terminou `Ready` e cujo `verify-build-env` confirmou `VITE_SUPABASE_*` no
  diretório correto;
- o Preview está protegido pela Vercel e seu smoke funcional não foi concluído.

Correção local de 29/07/2026:

- as substituições manuais de `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_PUBLISHABLE_KEY` foram removidas de `vite.config.ts`; a injeção
  volta a ser responsabilidade do Vite e de
  `@lovable.dev/vite-tanstack-config`;
- `scripts/verify-build-env.mjs` agora encerra com código `1` quando essas
  variáveis não foram incorporadas;
- `npm run build` passou localmente e o verificador confirmou
  `VITE_SUPABASE_*` no bundle local;
- a conexão foi selecionada em 06/08/2026; em 10/08/2026 o merge chegou ao
  Lovable publicado, mas a inspeção dos assets públicos não encontrou um project
  ref Supabase literal. O backend efetivo permanece `não confirmado` até uma
  evidência operacional ou teste autenticado controlado.

Reconciliação local de 06/08/2026, após o vínculo externo:

- o commit automático interno do Lovable incorporou a configuração pública em
  `src/integrations/supabase/client.ts`, removeu a resolução fail-closed por
  ambiente e alterou dependências sem sincronizar o lockfile;
- o commit interno não foi sincronizado ao GitHub. A reconciliação parte de
  `origin/main` e preserva a branch local de UI/UX em worktree separada;
- o cliente e o servidor continuam lazy, orientados por ambiente e fail-closed;
- a injeção manual duplicada foi removida de `vite.config.ts`;
- `package.json` voltou às versões presentes em `package-lock.json`, sem upgrade
  colateral;
- os tipos confirmados pelo catálogo canônico foram preservados;
- `verify-build-env.mjs` agora exige o ref canônico e rejeita qualquer outro ref
  Supabase encontrado no bundle;
- `npm ci`, typecheck e lint passaram;
- o build sem variáveis falhou como esperado, um ref incorreto foi rejeitado e o
  build com valores públicos fictícios no ref canônico passou;
- nenhum segredo real, publish, migration ou teste autenticado foi usado ou
  executado;
- a reconciliação foi commitada como `4982ca704f4f0ccddad33ca050266480240eb992`
  e enviada para `origin/reconcile/lovable-supabase-20260806`;
- o push isolado não disparou workflows: `quality.yml` executa em push apenas na
  `main`, além de `pull_request` e `workflow_dispatch`;
- o pull request [#1](https://github.com/FeeSz/itasafety/pull/1) foi aberto da
  branch de reconciliação para `main`, sem merge ou publicação;
- o workflow Quality `31118936956`, acionado pelo evento `pull_request` para o
  commit `bca061996dc27dcdb1514d769f0cdafa06a42069`, concluiu o job
  `static-analysis` com sucesso;
- o commit documental `1fc1a6c323f0a578e87116a7e7b6b861bb1918d4`
  atualizou o PR e acionou o run `31119315666`; durante a indisponibilidade do
  GitHub Actions de 06/08/2026, o job foi cancelado sem executar etapas e o run
  terminou como falha de infraestrutura, não como falha observada do código;
- o incidente foi resolvido pelo GitHub em 07/08/2026, e o run `31185659802`
  concluiu `static-analysis` com sucesso no commit documental
  `e3893458e996554b2617c4449895685e109dea11`;
- naquele snapshot o PR ainda estava sem merge. O check autoritativo é sempre o
  Quality do HEAD atual; cada novo commit invalida a suficiência de runs
  anteriores até obter seu próprio resultado verde;
- `npm ci` reportou 15 vulnerabilidades (1 baixa, 10 moderadas e 4 altas), que
  permanecem fora deste bloco de reconciliação e não foram mascaradas com
  `npm audit fix --force`.

### Estado remoto após o merge do PR #1 — 10/08/2026

- o PR [#1](https://github.com/FeeSz/itasafety/pull/1) foi mesclado em `main` no
  commit `0dcc6c37b6f56a211911b0d1edc5e1900a2ad1de`;
- o Quality de `main` `31383306219` passou;
- o projeto Lovable está publicado, `ready` e registra o mesmo commit como
  latest commit; home e `/api/public/health` responderam HTTP 200;
- o deployment Vercel Production de `main` falhou no `verify-build-env` por
  ausência de `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no escopo
  Production; `https://itasafety.vercel.app/api/public/health` continuou HTTP
  503 `degraded` no deployment anterior;
- o Cloudflare Worker build falhou sem annotations públicas; a causa atual exige
  o log autenticado e não deve ser inferida do incidente antigo do `bun.lock`;
- o GitHub Pages falhou em `npm ci` com `EUSAGE` e
  `Missing: lru-cache@11.5.2 from lock file`; esse workflow não fixa npm
  `11.18.0`, ao contrário do Quality;
- o Supabase Preview falhou com SQLSTATE `42710` porque o trigger
  `set_partners_updated_at` já existia; a evidência não autoriza editar migration
  aplicada nem criar correção cega;
- o PR documental [#2](https://github.com/FeeSz/itasafety/pull/2) foi aberto no
  commit `815a6a484ffea47ec409ac2ee8626173cd33b11a`; o Quality
  `31387836521` passou, mas o PR permaneceu `unstable` por causa do check
  Cloudflare com falha;
- a CLI Vercel criou acidentalmente o projeto
  `itasafety-reconcile-20260806` e um token de bypass durante uma tentativa de
  smoke protegido. A operação foi interrompida, o projeto foi excluído com
  autorização e os arquivos locais de vínculo foram removidos. Nenhum valor de
  token foi exposto ou persistido no repositório.

### Gate atual do ambiente Lovable

Em 29/07/2026, o proprietário colocou a aplicação em standby operacional porque
a conexão do projeto Lovable ao Supabase depende de tokens/créditos do Lovable,
com reset previsto para 01/08/2026.

Após o merge e a publicação observados em 10/08/2026:

- não mesclar o PR #2 enquanto a documentação não refletir o estado real e os
  checks relevantes permanecerem vermelhos;
- não configurar Production, Cloudflare ou Supabase Preview sem diagnóstico,
  rollback e autorização próprios;
- não considerar o health HTTP 200 do Lovable como prova do project ref;
- não prosseguir com os testes autenticados 1c e 1d até confirmar o backend
  efetivo e dispor das contas/sessões aprovadas;
- não executar as consultas seguintes da auditoria antes de 1c e 1d;
- não iniciar migration ou feature enquanto esses gates estiverem abertos.

Smoke check público de 07/08/2026:

- Lovable: home HTTP 200 e `/api/public/health` HTTP 200 com `{"status":"ok"}`;
- Vercel: home HTTP 200 e `/api/public/health` HTTP 503;
- localhost: um processo já em execução respondeu HTTP 200 na porta 8080; o SHA
  servido não foi identificado neste smoke check;
- a inspeção dos assets públicos de Lovable e Vercel não encontrou o ref
  canônico como literal. Naquele snapshot, o bundle corrigido continuava
  classificado como `não implantado` e `não validado`.

Smoke check público de 10/08/2026:

- Lovable: home HTTP 200 e `/api/public/health` HTTP 200 `{"status":"ok"}`;
- Vercel estável: home HTTP 200 e `/api/public/health` HTTP 503
  `{"status":"degraded"}`;
- `itasafety.com.br`: a verificação TLS falhou por incompatibilidade de
  nome/SNI; não foi usado bypass de certificado;
- os assets públicos do Lovable não expuseram project ref nem marcadores
  `VITE_SUPABASE_*`; o resultado não comprova o backend efetivo.

### Reconciliação do runtime Cloudflare — 10/08/2026

- o diagnóstico autenticado confirmou que as seis variáveis Supabase estavam
  disponíveis somente no ambiente de build, enquanto o runtime continha apenas
  `ASSETS`, `SITE_URL` e `VITE_SITE_URL`;
- por isso, `/api/public/health` parava na verificação de variáveis e respondia
  HTTP 503 `{"status":"degraded"}` antes de chamar o Supabase;
- foram adicionados exclusivamente os bindings de runtime `SUPABASE_URL` e
  `SUPABASE_PUBLISHABLE_KEY`, ambos como `secret_text`, usando valores locais
  ignorados pelo Git e previamente validados contra o project ref
  `porgyoqngtshxdxuwaft`; nenhum valor foi exibido ou persistido na
  documentação;
- o Dashboard criou a versão
  `1db139bb-8d60-4d18-b4fa-f0c472cc986d` e o deployment
  `97e9c9de-4189-49c6-83b0-8dd1c5c6dd72`, com 100% do tráfego nessa versão;
- o deployment anterior `28c60d87-1724-4303-9b7b-f58c7825b25f`, que servia a
  versão `b27ad7f8-d870-4869-af15-90dbca98c082`, foi registrado como referência
  de rollback;
- `https://itasafety.itasafety.workers.dev/api/public/health` e a URL imutável
  da nova versão responderam HTTP 200 `{"status":"ok"}`;
- uma inspeção sanitizada do bundle ativo confirmou a URL do projeto canônico,
  mas não encontrou a chave moderna `sb_publishable_*` e encontrou um único JWT
  `anon` cujo `ref` e issuer não correspondem a `porgyoqngtshxdxuwaft`; nenhum
  valor foi exibido. Como a atualização de secrets não recompila o cliente, os
  fluxos executados no browser permanecem pendentes de um build separado;
- o resultado valida a configuração mínima e a chamada básica ao Auth, mas não
  substitui testes de catálogo, RLS, OAuth ou fluxos autenticados;
- nenhum código, banco, migration, Vercel ou Lovable foi alterado neste gate.

### Reconciliação do bundle cliente Cloudflare — 10/08/2026

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID` e
  `VITE_SUPABASE_PUBLISHABLE_KEY` foram rotacionadas no ambiente de build do
  Cloudflare com os valores canônicos, mantendo o armazenamento como secret e
  sem exibir seus valores;
- o build manual de produção `12174877-dfaa-4d22-bfb3-f82420734ec9` executou o
  gatilho `Deploy default branch` sobre `main`, commit
  `0dcc6c37b6f56a211911b0d1edc5e1900a2ad1de`;
- `verify-build-env` retornou OK para `.output/public`, 60 assets foram
  processados e o deploy criou a versão
  `f65c358c-bcb0-4d2b-9f19-a29641a8b1dd`;
- o deployment `defddbf6-e606-4cc5-9f83-b7d34a956f0e` direcionou 100% do
  tráfego para essa versão e preservou `SUPABASE_URL` e
  `SUPABASE_PUBLISHABLE_KEY` como `secret_text` de runtime;
- a versão anterior `1db139bb-8d60-4d18-b4fa-f0c472cc986d` permaneceu
  registrada como referência imediata de rollback;
- a inspeção sanitizada do artefato servido confirmou a URL
  `porgyoqngtshxdxuwaft.supabase.co`, a chave moderna `sb_publishable_*` e zero
  JWTs `anon` divergentes; nenhum valor de chave foi exibido;
- home e `/api/public/health` retornaram HTTP 200 nas URLs estável e imutável da
  versão; o health respondeu `{"status":"ok"}`;
- o `verify-build-env` publicado nesse SHA reconhece uma chave pelo formato e
  não associa um JWT legado ao project ref esperado. O deploy foi validado pela
  inspeção adicional acima; o fortalecimento local posterior é registrado no
  gate seguinte;
- nenhum código, commit, push, banco, migration, Vercel ou Lovable foi alterado
  neste gate.

### Endurecimento local do gate do bundle — 10/08/2026

- `scripts/verify-build-env.mjs` agora decodifica candidatos JWT sem registrar o
  token, considera somente o papel `anon` e obtém o project ref pelo claim `ref`
  ou pelo issuer canônico do Supabase;
- um JWT `anon` legado só satisfaz o marcador de chave pública quando pertence a
  `porgyoqngtshxdxuwaft`;
- qualquer JWT `anon` de outro projeto bloqueia o build, mesmo se o bundle também
  contiver uma chave moderna `sb_publishable_*` válida;
- `scripts/verify-build-env.test.mjs` cobre cinco cenários: chave moderna correta,
  JWT legado correto, JWT legado divergente, JWT divergente acompanhado de chave
  moderna e URL Supabase divergente;
- `npm run test:build-env`, lint, typecheck e build local passaram. O primeiro
  build ficou impedido de escrever em `node_modules/.vite-temp` pelo sandbox; a
  repetição autorizada fora dele concluiu e o verificador retornou OK;
- esta mudança foi versionada localmente nesta branch. Nenhum push, build
  remoto, publicação, banco, migration, Vercel ou Lovable foi alterado neste
  gate.

O standby não impede typecheck, lint, build local, documentação, testes unitários
sem rede ou preparação de CI que não consulte nem altere serviços remotos.

## Deploy da aplicação

```bash
npm run deploy
```

Esse comando faz um novo build e publica usando:

```text
.output/server/wrangler.json
```

Antes:

- confirmar conta Cloudflare e Worker de destino;
- revisar `git diff` e documentação;
- executar gates;
- confirmar secrets;
- registrar versão anterior.

Depois:

- consultar deployment ativo;
- abrir `/api/public/health`;
- testar home, autenticação e uma rota protegida;
- registrar timestamp, versão e resultado.

Enquanto não houver domínio canônico definitivo, repetir esses testes em
Cloudflare, Lovable e Vercel e identificar explicitamente qual URL foi validada.

## Supabase

### Ver vínculo

O project ref deve ser `porgyoqngtshxdxuwaft`. Arquivos sob `supabase/.temp`
são metadados locais ignorados pelo Git; não são prova suficiente do destino.
Confirme também a saída da própria CLI antes de aplicar.

### Migrations

Regras:

1. consultar estado remoto;
2. criar arquivo novo em `supabase/migrations/`;
3. nunca reescrever uma migration aplicada;
4. revisar locks, backfill e compatibilidade;
5. aplicar;
6. listar histórico remoto;
7. consultar objetos alterados;
8. regenerar tipos;
9. executar testes por papel;
10. documentar evidências e rollback.

Replay efêmero de 30/07/2026:

- Supabase CLI `2.109.1`;
- PostgreSQL Supabase `17.6.1.143`;
- 18 migrations copiadas com hashes idênticos ao repositório;
- as 11 primeiras migrations foram registradas;
- `20260708000000_create_partners.sql` falhou no terceiro statement com
  `SQLSTATE 42883: operator does not exist: app_role = text`;
- a policy compara `user_roles.role`, do tipo `app_role`, com
  `'admin'::text`;
- migrations posteriores não foram executadas;
- nenhuma migration aplicada foi editada e nenhuma migration nova foi criada;
- o ajuste depende primeiro da reconciliação do catálogo e histórico de
  produção.

### Tipos

Gerar apenas o schema público:

```bash
npx supabase gen types typescript --linked --schema public
```

Compare antes de substituir. Divergência inesperada exige investigação.

### Edge Function

Deploy da Edge Function e migration são etapas distintas. Após implantar:

- confirmar status e versão;
- conferir `verify_jwt`;
- executar smoke test autenticado;
- testar falha parcial e concorrência;
- não inferir igualdade de fonte somente pelo número da versão.

## Rotação de credencial do banco

Quando uma senha de banco for exposta:

1. interromper seu uso;
2. identificar todos os consumidores;
3. gerar nova senha forte no painel Supabase;
4. atualizar secret managers e ferramentas autorizadas;
5. invalidar a senha anterior;
6. testar conexões;
7. registrar somente data, responsáveis e resultado;
8. nunca registrar a senha nova.

A rotação pode causar indisponibilidade se consumidores não forem inventariados.
Por isso, exige coordenação do proprietário do projeto.

Evidência de 30/07/2026:

- o código versionado, Edge Functions, scripts, workflows e ambiente atual não
  possuem `DATABASE_URL`, `PGPASSWORD`, `POSTGRES_URL`, connection string
  PostgreSQL ou outro consumidor direto da senha;
- o endpoint direto do banco possui somente endereço IPv6 e a rede de teste não
  conseguiu alcançar a porta 5432;
- o Session Pooler respondeu como disponível na porta 5432;
- o proprietário executou `psql` em container descartável, informou a nova senha
  apenas no prompt interativo e executou um `SELECT` somente leitura;
- a conexão retornou database `postgres`, usuário efetivo `postgres` e timestamp
  `2026-07-30 15:09:37.559028+00`;
- nenhuma senha foi registrada em comando, screenshot, documentação ou arquivo;
- a home e o health check do Lovable retornaram HTTP 200;
- a home do Vercel retornou HTTP 200 e o health check continuou em HTTP 503
  `degraded`, estado independente da senha PostgreSQL e ainda pendente de
  reconciliação.

## Backups e rollback

Antes de migration de risco:

- confirmar backup/PITR disponível;
- preferir mudanças aditivas;
- separar remoções destrutivas;
- documentar rollback lógico;
- estimar lock de tabela;
- evitar DDL extensa no pico.

Rollback de código não reverte automaticamente schema.

## Observabilidade

Disponível:

- logs do Worker;
- logs da Edge Function;
- logs e painéis Supabase;
- `/api/public/health`;
- tela `/admin/status`.

Pendente:

- integração real com Sentry;
- alertas de volume EmailJS;
- alertas de erro por action;
- métricas de claim abandonado;
- correlação de cotação sem expor dados pessoais.

## Arquivos temporários e perfis

- não copie perfil de Chrome/Playwright ou sessão CLI para tentar contornar login;
- se uma cópia temporária for indispensável, informe antes origem, destino,
  conteúdo, motivo, retenção e descarte;
- não apague material do usuário sem autorização;
- prefira diretórios efêmeros controlados e registre o que foi criado;
- perfis Supabase CLI ou browser podem conter tokens e devem ser tratados como
  segredos.

## Registro de incidente

Documente:

- data e timezone;
- serviço afetado;
- detecção;
- impacto;
- linha do tempo;
- contenção;
- causa;
- correção;
- validação;
- ações preventivas;
- evidências sem segredos ou dados pessoais.
