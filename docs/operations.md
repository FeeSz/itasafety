# Operações

## Ambientes e serviços

| Componente         | Ambiente conhecido                          |
| ------------------ | ------------------------------------------- |
| Aplicação Lovable  | `https://itasafety.lovable.app/`            |
| Aplicação Vercel   | `https://itasafety.vercel.app/`             |
| Desenvolvimento    | `http://localhost:8080/`                    |
| Site legado        | `https://itasafety.com.br/`                 |
| Aplicação          | Cloudflare Worker `itasafety`               |
| Banco/Auth/Storage | Supabase externo selecionado: `porgyoqngtshxdxuwaft`; runtime publicado ainda não validado |
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
`porgyoqngtshxdxuwaft`. A seleção está confirmada; o runtime publicado e os
fluxos autenticados posteriores à troca ainda não estão validados. Ver
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

Correção local de 29/07/2026:

- as substituições manuais de `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_PUBLISHABLE_KEY` foram removidas de `vite.config.ts`; a injeção
  volta a ser responsabilidade do Vite e de
  `@lovable.dev/vite-tanstack-config`;
- `scripts/verify-build-env.mjs` agora encerra com código `1` quando essas
  variáveis não foram incorporadas;
- `npm run build` passou localmente e o verificador confirmou
  `VITE_SUPABASE_*` no bundle local;
- a conexão foi selecionada em 06/08/2026, mas a publicação no Lovable continua
  pendente; o bundle remoto existente não comprova a incorporação do ref canônico
  até que um novo build seja publicado e inspecionado.

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
- o incidente foi resolvido pelo GitHub em 07/08/2026. O PR continua sem merge e
  exige um novo Quality verde para o SHA documental final;
- `npm ci` reportou 15 vulnerabilidades (1 baixa, 10 moderadas e 4 altas), que
  permanecem fora deste bloco de reconciliação e não foram mascaradas com
  `npm audit fix --force`.

### Gate atual do ambiente Lovable

Em 29/07/2026, o proprietário colocou a aplicação em standby operacional porque
a conexão do projeto Lovable ao Supabase depende de tokens/créditos do Lovable,
com reset previsto para 01/08/2026.

Após a seleção do vínculo em 06/08/2026:

- não realizar merge até a documentação do PR estar atualizada e o Quality do
  SHA final estar verde;
- não publicar o build antes do merge e da validação das configurações do
  destino;
- não prosseguir com os testes autenticados 1c e 1d;
- não executar as consultas seguintes da auditoria;
- preservar as correções locais e a documentação já produzida.

Smoke check público de 07/08/2026:

- Lovable: home HTTP 200 e `/api/public/health` HTTP 200 com `{"status":"ok"}`;
- Vercel: home HTTP 200 e `/api/public/health` HTTP 503;
- localhost: um processo já em execução respondeu HTTP 200 na porta 8080; o SHA
  servido não foi identificado neste smoke check;
- a inspeção dos assets públicos de Lovable e Vercel não encontrou o ref
  canônico como literal. Esse resultado não identifica outro ref nem valida a
  configuração do browser; o bundle corrigido continua classificado como
  `não implantado` e `não validado`.

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

Enquanto não houver domínio canônico definitivo, repetir esses testes em Lovable
e Vercel e identificar explicitamente qual URL foi validada.

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
