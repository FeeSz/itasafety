# Operações

## Ambientes e serviços

| Componente         | Ambiente conhecido                          |
| ------------------ | ------------------------------------------- |
| Aplicação Lovable  | `https://itasafety.lovable.app/`            |
| Aplicação Vercel   | `https://itasafety.vercel.app/`             |
| Desenvolvimento    | `http://localhost:8080/`                    |
| Site legado        | `https://itasafety.com.br/`                 |
| Aplicação          | Cloudflare Worker `itasafety`               |
| Banco/Auth/Storage | Supabase project ref `porgyoqngtshxdxuwaft` |
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

No ItaSafety, o vínculo deve apontar para o project ref
`porgyoqngtshxdxuwaft`. A confirmação deve ser feita em **More → Cloud** no
editor do projeto e no painel Supabase; o simples estado `stack: supabase` não
identifica qual projeto está conectado.

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
npm install
npm run dev
```

O arquivo local esperado é `.env.local`, ignorado pelo Git.

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
- workflow `.github/workflows/quality.yml`: implementado localmente com
  `npm ci`, typecheck e lint;
- replay SQL e validação do workflow remoto: pendentes;
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
ou se padrões de credenciais inesperadas aparecerem no bundle.

Correção local de 29/07/2026:

- as substituições manuais de `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_PUBLISHABLE_KEY` foram removidas de `vite.config.ts`; a injeção
  volta a ser responsabilidade do Vite e de
  `@lovable.dev/vite-tanstack-config`;
- `scripts/verify-build-env.mjs` agora encerra com código `1` quando essas
  variáveis não foram incorporadas;
- `npm run build` passou localmente e o verificador confirmou
  `VITE_SUPABASE_*` no bundle local;
- a publicação no Lovable continua pendente; o bundle remoto existente permanece
  inválido até que a conexão seja confirmada e um novo build seja publicado.

### Standby do ambiente Lovable

Em 29/07/2026, o proprietário colocou a aplicação em standby operacional porque
a conexão do projeto Lovable ao Supabase depende de tokens/créditos do Lovable,
com reset previsto para 01/08/2026.

Até a retomada autorizada:

- não publicar o build local;
- não tentar conectar ou trocar o backend no Lovable;
- não prosseguir com os testes autenticados 1c e 1d;
- não executar as consultas seguintes da auditoria;
- preservar as correções locais e a documentação já produzida.

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
