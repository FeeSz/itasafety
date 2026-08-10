# Bloco prioritário de segurança — iniciado em 29/07/2026

## Objetivo

Concluir contenção, reconciliação, testes funcionais autenticados e versionamento
antes de novas features ou migrations de negócio.

## Regras deste bloco

- operações remotas são precedidas por objetivo e critério de sucesso;
- consultas registram project ref e papel usado;
- resultados não são considerados válidos se o destino não for confirmado;
- nenhuma evidência contém senha, token, JWT ou dados pessoais;
- mudanças aplicadas recebem validação posterior;
- arquivos locais isolados não comprovam produção;
- bloqueios ficam explícitos.

## Baseline confirmado

Data da verificação: 28/07/2026, timezone America/Sao_Paulo.

- project ref local e remoto usado pela CLI: `porgyoqngtshxdxuwaft`;
- nome retornado pelo vínculo: `ItaSafety`;
- migrations remotas listadas:
  - `20260728150000`;
  - `20260728160000`;
  - `20260728170000`;
- schema `public` regenerado remotamente coincidiu exatamente com
  `src/integrations/supabase/types.ts`;
- Edge Function observada:
  - slug: `enviar-notificacao-cotacao`;
  - status: `ACTIVE`;
  - versão: 8;
  - atualização: 28/07/2026 15:52:25 -03:00;
  - JWT: habilitado;
- build local passou;
- typecheck e lint falharam;
- arquivos do bloco ainda não estavam versionados.

## Plano e estado

| Ordem | Ação                                           | Estado                          | Critério de conclusão                                                                    |
| ----: | ---------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
|     1 | Rotacionar senha PostgreSQL exposta            | Concluída                       | Nova credencial validada, consumidores inventariados e referência principal disponível. |
|     2 | Confirmar catálogo P0 após rotação             | Em andamento                    | Consultas 1a e 1b registradas; testes 1c/1d e consultas seguintes ainda pendentes.       |
|     3 | Testar usuário comum                           | Pendente                        | `has_role=false`, acesso próprio e negações esperadas.                                   |
|     4 | Testar admin                                   | Pendente                        | `has_role=true`, painel/RPC sem recursão.                                                |
|     5 | Testar isolamento A/B e anon                   | Pendente                        | Toda tentativa cruzada/privada é negada.                                                 |
|     6 | Confirmar concorrência de resposta/notificação | Pendente                        | Uma transição e um envio lógico.                                                         |
|     7 | Reconciliar cron de retenção                   | Pendente                        | Job remoto correto ou migration nova aplicada.                                           |
|     8 | Versionar migrations e código aplicados        | Em andamento — PR aberto        | Reconciliação no PR #1; merge depende de documentação atualizada e Quality verde.         |
|     9 | Confirmar deploy Cloudflare do rate limit      | Bloqueado — credencial          | Deployment identificado e smoke test executado.                                          |
|    10 | Fechar gates                                   | Controle contínuo por SHA       | O check Quality deve permanecer verde no HEAD atual do PR e depois em `main`.              |

## Ação 1 — rotação da senha

Motivo: uma senha do usuário `postgres` foi compartilhada durante a investigação.

Dependências a inventariar antes da rotação:

- conexões manuais;
- ferramentas SQL;
- variáveis locais;
- CI/CD;
- integrações ou automações;
- pooler, se usado;
- perfil Supabase CLI, quando aplicável.

Evidência permitida:

- data/hora;
- responsável;
- consumidores atualizados;
- conexão antiga rejeitada;
- conexão nova bem-sucedida.

Não registrar a nova senha.

## Ações 2 a 6 — testes

Executar somente após confirmar:

- project ref visível;
- conta de teste comum;
- conta de teste admin;
- nenhum dado real será alterado de forma irreversível;
- estratégia de limpeza;
- usuário A e B identificados apenas por aliases.

Resultados serão adicionados abaixo.

## Registro de execução

### 29/07/2026 — criação da base documental

- inventário inicial do frontend, backend, schema e integrações;
- criação de documentação do produto, arquitetura, frontend, backend, segurança e
  operações;
- criação de regra permanente em `AGENTS.md`;
- nenhuma mudança remota realizada;
- nenhuma credencial copiada;
- nenhum perfil de browser ou CLI duplicado;
- nenhum arquivo temporário de sessão criado.

### 29/07/2026 — rotação da senha PostgreSQL

- proprietário informou que a senha do banco foi alterada com sucesso;
- nenhum valor de senha foi registrado;
- a inspeção local considerou somente nomes de variáveis, nunca valores:
  - `.env.local` contém configuração Supabase por URL, publishable key e
    `service_role`;
  - não foi encontrada variável de conexão PostgreSQL direta como `DATABASE_URL`,
    `PGPASSWORD` ou `POSTGRES_URL` no workspace;
  - portanto, o frontend e o Worker não aparentam depender da senha PostgreSQL
    rotacionada;
- nenhuma tentativa automatizada com a senha anterior será feita ou registrada.

### 30/07/2026 — validação da rotação da senha PostgreSQL

- a nova credencial foi validada por conexão interativa ao Session Pooler do
  project ref `porgyoqngtshxdxuwaft`;
- o endpoint direto do banco resolveu somente para IPv6 e não foi alcançável na
  rede de teste; esse resultado ocorreu antes da autenticação;
- o Session Pooler respondeu `accepting connections` na porta 5432;
- o proprietário executou `psql` em container descartável e informou a nova
  senha somente no prompt interativo;
- o `SELECT` somente leitura retornou database `postgres`, usuário efetivo
  `postgres` e timestamp `2026-07-30 15:09:37.559028+00`;
- a credencial anterior não foi reutilizada; sua invalidação decorre da rotação
  confirmada pelo proprietário;
- nenhuma conexão PostgreSQL direta foi encontrada em código, Edge Functions,
  scripts, workflows ou variáveis do ambiente atual;
- Lovable home e health responderam HTTP 200;
- Vercel home respondeu HTTP 200 e health permaneceu HTTP 503 `degraded`,
  pendência separada que não consome diretamente a senha PostgreSQL;
- nenhuma senha, token, perfil de browser ou sessão CLI foi copiada ou
  registrada.

### 29/07/2026 — tentativa de smoke test público

- foi tentado acesso somente leitura a:
  - `https://itasafety.com.br/`;
  - `https://itasafety.com.br/api/public/health`;
- o PowerShell e o `curl` recusaram a conexão antes do HTTP por falha de
  validação TLS;
- erro observado pelo `curl`: incompatibilidade do nome principal do certificado
  com o domínio solicitado;
- DNS observado localmente para `itasafety.com.br`: `187.45.195.65`;
- não foi usada a opção insegura `--insecure`;
- o resultado ainda pode ser causado por DNS, certificado do domínio ou
  interferência da rede corporativa;
- é necessário testar em navegador/rede independente e confirmar qual domínio
  aponta para o Worker publicado.

### 29/07/2026 — esclarecimento de ambientes e novo smoke test

- o proprietário confirmou que `itasafety.com.br` pertence ao site antigo e será
  retirado após a conclusão do projeto novo;
- superfícies autorizadas do projeto novo:
  - `https://itasafety.lovable.app/`;
  - `https://itasafety.vercel.app/`;
  - `http://localhost:8080/`;
- resultados somente leitura:
  - Lovable home: HTTP 200;
  - Lovable health: HTTP 200, `{"status":"ok"}`;
  - Vercel home: HTTP 200;
  - Vercel health: HTTP 503, `{"status":"degraded"}`;
  - localhost home: HTTP 200;
  - localhost health: HTTP 200, `{"status":"ok"}`;
- Lovable passa a ser a referência remota para os testes deste bloco;
- o erro TLS do domínio antigo não bloqueia o projeto novo;
- Vercel permanece pendente de reconciliação de ambiente/backend;
- referências hardcoded ao domínio antigo foram localizadas, mas não alteradas,
  pois a URL canônica definitiva do cutover ainda precisa ser decidida.

### 29/07/2026 — catálogo P0, consulta 1a

Origem informada: SQL Editor do projeto Supabase
`porgyoqngtshxdxuwaft`.

Consulta: catálogo de `public.has_role`.

Resultado completo informado:

| proname    | args                            | is_security_definer | config_settings                               |
| ---------- | ------------------------------- | ------------------- | --------------------------------------------- |
| `has_role` | `_user_id uuid, _role app_role` | `true`              | `["search_path=pg_catalog, public, pg_temp"]` |

Conclusão restrita à consulta:

- existe uma assinatura de `public.has_role` no resultado;
- a função está como `SECURITY DEFINER`;
- o `search_path` está explicitamente limitado a `pg_catalog`, `public` e
  `pg_temp`;
- este resultado ainda não substitui o teste funcional como admin e usuário
  comum.

### 29/07/2026 — catálogo P0, consulta 1b

Origem informada: SQL Editor do projeto Supabase
`porgyoqngtshxdxuwaft`.

Consulta: policies de `public.user_roles`.

Resultado completo informado:

| nome_policy            | comando | using_expression         | with_check_expression |
| ---------------------- | ------- | ------------------------ | --------------------- |
| `Users read own roles` | `r`     | `(auth.uid() = user_id)` | `NULL`                |

Conclusão restrita à consulta:

- foi retornada somente uma policy;
- `r` representa uma policy de `SELECT`;
- a leitura é limitada à linha cujo `user_id` corresponde a `auth.uid()`;
- não há `WITH CHECK`, esperado para uma policy somente de leitura;
- a policy histórica `Admins manage roles select` não apareceu no catálogo;
- o grafo recursivo identificado na auditoria não está presente nessa tabela.

### 29/07/2026 — bloqueio do teste funcional autenticado no Lovable

Erro informado ao tentar iniciar sessão Google pela aplicação publicada:

```text
Missing Supabase environment variable(s): VITE_SUPABASE_URL,
VITE_SUPABASE_PUBLISHABLE_KEY. Connect Supabase in Lovable Cloud.
```

Escopo da conclusão:

- a falha ocorre antes do OAuth Google e impede o teste funcional 1c;
- não é evidência de erro na conta Google, na senha PostgreSQL ou em
  `public.has_role`;
- a inspeção somente leitura do Lovable localizou o workspace `Itasafety`, o
  projeto publicado `ItaSafety` e um backend habilitado com stack `supabase`;
- a interface consultada não informou o project ref, portanto não confirma que
  o vínculo aponta para `porgyoqngtshxdxuwaft`;
- foram identificadas e removidas localmente de `vite.config.ts` substituições
  manuais que podiam incorporar strings vazias para as duas variáveis durante o
  build remoto;
- `scripts/verify-build-env.mjs` foi alterado localmente para encerrar com código
  `1` quando essas variáveis faltam, bloqueando novas publicações quebradas.

Nenhuma chave, senha, configuração remota, migration ou policy foi alterada
durante esse diagnóstico e contenção local. A correção ainda não está publicada.

Validação local:

```text
npm run build
exit code: 0
[verify-build-env] OK — VITE_SUPABASE_* inlined into .output/public.
```

## Evidências pendentes

```text
[x] senha rotacionada, conforme confirmação do proprietário
[x] credencial anterior invalidada pela rotação, sem reutilizar o segredo exposto
[x] consumidores diretos inventariados e nova credencial validada via pooler
[x] superfícies atuais e domínio legado identificados
[ ] saúde do Vercel reconciliada
[ ] URL canônica e plano de cutover definidos
[~] catálogo em coleta sequencial — consultas 1a e 1b registradas
[ ] teste usuário comum — bloqueado até build corrigido e conta aprovada
[ ] teste admin — bloqueado até build corrigido e conta aprovada
[ ] teste anon
[ ] teste A/B
[ ] teste concorrência
[ ] cron
[~] commit/push — reconciliação no PR #1; merge não autorizado
[ ] deploy Cloudflare
```

## Bloqueios atuais

1. o PR #1 precisa manter a documentação atualizada e o Quality verde no HEAD
   atual antes de qualquer merge;
2. o vínculo Lovable → Supabase foi selecionado para `porgyoqngtshxdxuwaft`, mas
   o build corrigido ainda não foi publicado nem validado no bundle remoto;
3. testes autenticados exigem sessões/contas de teste reais após a publicação;
4. as consultas da auditoria permanecem ordenadas: 1c, parada em caso de
   recursão, 1d e somente depois os passos 2 a 4;
5. consulta de deployment Cloudflare exige token disponível no ambiente.

## Estado operacional

O `STANDBY` por falta de tokens, iniciado em 29/07/2026, foi parcialmente
encerrado em 06/08/2026 quando o proprietário selecionou o Supabase externo
`porgyoqngtshxdxuwaft` no Lovable.

Estado atual: `EM EXECUÇÃO CONTROLADA`. Código e documentação podem avançar na
branch de reconciliação. Merge, publish, testes autenticados, continuação das
consultas de produção, migrations e novas features permanecem congelados por
seus gates próprios.

Sequência de retomada:

1. manter a documentação atualizada no PR #1;
2. confirmar Quality verde para o HEAD atual;
3. revisar e autorizar separadamente o merge;
4. validar o Quality de `main` após o merge;
5. confirmar Auth/OAuth, contas/roles, MCP e Storage no destino;
6. autorizar separadamente e publicar o build corrigido;
7. validar o ref canônico no bundle e o login Google;
8. retomar pela consulta funcional 1c, sem saltar etapas.

### Trabalho local independente durante o standby

Em 29/07/2026:

- o contrato de busca de `/auth` foi corrigido para parâmetros opcionais;
- casts `any` foram removidos dos fluxos auditados de autenticação, carrinho,
  cotações, empresas e parceiros;
- tratamento de erros passou a receber `unknown` e extrair mensagem/status de
  forma segura;
- `npm run typecheck` passou;
- `npm run lint` passou sem erros;
- workflow local de CI foi adicionado para typecheck e lint;
- nenhuma ação remota, query, migration, commit, push ou deploy foi executada.

### 29/07/2026 — etapa AUD-12

A árvore atual foi classificada por runtime e tooling:

- `@hono/node-server@1.19.17` é transitivo do MCP, está no intervalo afetado,
  mas não aparece no bundle Cloudflare local;
- `esbuild@0.27.7` está presente em Vite e MCP, sem uso direto do servidor
  próprio do esbuild no código;
- `brace-expansion@1.1.16` pertence ao caminho de lint do ESLint;
- as correções automáticas disponíveis atravessam majors ou contratos semver;
- `npm audit fix --force` e overrides foram rejeitados nesta etapa;
- o audit offline retornou zero, resultado registrado como não conclusivo;
- depois de consentimento específico, o audit online completo confirmou cinco
  registros altos, três moderados, um baixo e nenhum crítico;
- com `--omit=dev`, restaram três moderados e um baixo; os cinco registros altos
  pertencem exclusivamente à cadeia ESLint/minimatch/brace-expansion.

Evidência detalhada:
`docs/security/dependency-audit-2026-07-29.md`.

Nenhum pacote, lockfile, serviço remoto ou banco foi alterado nesta etapa.

### 29/07/2026 — etapa AUD-13, depreciações e Fast Refresh

- `inputValidator()` foi substituído por `validator()` nas duas Server Functions
  de autenticação;
- contextos e hooks de autenticação e carrinho foram separados;
- variantes compartilhadas de Button e Toggle foram movidas para módulos sem
  componentes;
- exports não-componentes sem consumidores foram removidos dos módulos de Badge,
  Form, Navigation Menu e Sidebar;
- a regra `react-refresh/only-export-components` não foi desabilitada, reduzida
  ou excepcionada;
- `npm run typecheck` passou;
- `npm run lint` passou com zero erros e zero avisos;
- `npm run build` passou, sem o aviso depreciado de `inputValidator()`;
- o verificador confirmou `VITE_SUPABASE_*` no bundle local.

Avisos residuais do build pertencem ao tamanho do chunk e ao toolchain/dependências
e permanecem visíveis para triagem posterior.

Nenhuma query, migration, chamada Supabase, publicação, commit, push ou deploy
foi executado nesta etapa.

### 30/07/2026 — replay efêmero e validação do workflow

- `HEAD` e `origin/main` foram confirmados em
  `694de4bd57d62e0ae5c709cde6d16f40c4435ded`;
- o replay usou somente containers locais, sem connection string ou acesso ao
  Supabase de produção;
- as 18 migrations foram copiadas com hashes idênticos;
- as 11 primeiras migrations foram aplicadas;
- `20260708000000_create_partners.sql` falhou no terceiro statement com
  `SQLSTATE 42883`, por comparar `app_role` com `text`;
- nenhuma migration foi editada ou criada;
- o run remoto `30539013879` do workflow `Quality` falhou em `npm ci`;
- a reprodução Linux com Node 22 e npm `10.9.8` retornou `EUSAGE` por ausência
  de `lru-cache@11.5.2` no lockfile;
- com npm `11.18.0`, `npm ci`, typecheck e lint passaram em container Linux
  descartável;
- `package.json` e o workflow passaram a fixar npm `11.18.0`;
- a correção foi publicada no commit
  `aec0304cdaf31e7a54492856600e32ec3dd4493b`;
- o run remoto `30544422644` concluiu com sucesso em Setup Node, Pin npm,
  `npm ci`, typecheck e lint;
- containers, volumes, redes, processos e arquivos temporários da rodada foram
  removidos; imagens Docker permaneceram apenas como cache reutilizável.

### 06 e 07/08/2026 — reconciliação Lovable e gate do pull request

- o proprietário selecionou no Lovable o projeto Supabase externo com project
  ref `porgyoqngtshxdxuwaft`;
- a alteração automática do Lovable que incorporava configuração no cliente,
  removia o fail-closed e dessincronizava manifesto e lockfile foi rejeitada e
  reconciliada na branch `reconcile/lovable-supabase-20260806`;
- `npm ci`, typecheck e lint passaram; os testes negativos bloquearam ausência
  de variáveis e ref incorreto, e o build com valores públicos fictícios no ref
  canônico passou;
- a reconciliação foi enviada e abriu o PR
  [#1](https://github.com/FeeSz/itasafety/pull/1), sem merge ou publicação;
- o run Quality `31118936956` passou no commit
  `bca061996dc27dcdb1514d769f0cdafa06a42069`;
- o run `31119315666`, acionado pelo commit documental
  `1fc1a6c323f0a578e87116a7e7b6b861bb1918d4`, foi cancelado sem executar etapas
  durante o incidente do GitHub Actions de 06/08/2026;
- o GitHub declarou o incidente resolvido em 07/08/2026 e o run `31185659802`
  passou no commit documental `e3893458e996554b2617c4449895685e109dea11`;
- cada novo commit substitui essa evidência como HEAD do PR e deve obter seu
  próprio Quality verde antes de qualquer merge;
- smoke checks de 07/08 retornaram Lovable home/health HTTP 200, Vercel home HTTP
  200 e health HTTP 503. O bundle corrigido ainda não foi publicado nem validado;
- nenhuma migration, escrita no banco, teste autenticado, merge ou deploy foi
  executado nesta reconciliação.

### 07/08/2026 — reconciliação local dos builds Cloudflare e Vercel

- o log do Cloudflare mostra falha em `bun install --frozen-lockfile`, antes de
  qualquer build, porque `bun.lock` divergia de `package.json`;
- o log do Vercel mostra geração em `.vercel/output/static`, mas o verificador
  antigo leu `.output/public` ou `dist/client`; o resultado não é evidência
  válida sobre as variáveis do artefato Vercel recém-gerado;
- npm `11.18.0` e `package-lock.json` foram mantidos como contrato único, sem
  upgrade de dependências, e `bun.lock` foi removido localmente;
- `verify-build-env.mjs` passou a selecionar exclusivamente
  `.vercel/output/static` na Vercel, `dist/github-pages/client` no GitHub Pages e
  `.output/public` no build padrão/Cloudflare;
- `npm ci`, typecheck, lint, build padrão/Cloudflare e simulação local do build
  Vercel passaram; o verificador reportou o diretório correto nos dois builds;
- os testes negativos sem variáveis e com ref fictício incorreto falharam com
  código `1`, como exigido pelo gate fail-closed;
- duas ocorrências de `inputValidator()` voltaram a ser observadas em
  `src/lib/auth.functions.ts` e foram reconciliadas para `validator()` sem
  alterar schemas ou handlers;
- o output gerado `.vercel` foi excluído do escopo do ESLint, sem desabilitar ou
  reduzir regras aplicadas ao código-fonte;
- typecheck, lint e os builds locais Cloudflare/Vercel passaram em Node `24.16.0`
  sem avisos de `inputValidator()`; a validação adicional em Node 22 ficou
  pendente porque o Docker daemon não estava ativo e não havia outro runtime
  Node instalado;
- commit, push, merge, publicação, alteração de provedor, query e migration
  permanecem fora desta etapa.

### 10/08/2026 — configuração segura do Preview Vercel

- o deployment do commit `f6a7c19c62d78981816537ac78ad4aa27eb04916`
  compilou, mas o gate correto em `.vercel/output/static` bloqueou a ausência de
  `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`;
- uma inspeção autenticada confirmou zero variáveis no alvo Preview;
- após autorização explícita, as seis variáveis Supabase esperadas foram
  adicionadas somente ao Preview, para todas as branches Preview, e armazenadas
  como `sensitive`;
- foram usadas as chaves modernas `publishable` e `secret` do projeto canônico
  `porgyoqngtshxdxuwaft`, sem revelar ou persistir seus valores localmente;
- uma segunda listagem confirmou exatamente seis entradas e os vínculos locais
  temporários foram removidos;
- Production, Development, Cloudflare, banco, deployment, commit, push e merge
  não foram alterados; o próximo gate é um novo Preview build autorizado.
