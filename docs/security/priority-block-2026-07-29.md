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
|     1 | Rotacionar senha PostgreSQL exposta            | Rotacionada; validação pendente | Confirmar senha anterior rejeitada, consumidores atualizados e aplicação saudável.       |
|     2 | Confirmar catálogo P0 após rotação             | Pendente                        | Grants, policies, funções, triggers, cron e migration history salvos sem dados pessoais. |
|     3 | Testar usuário comum                           | Pendente                        | `has_role=false`, acesso próprio e negações esperadas.                                   |
|     4 | Testar admin                                   | Pendente                        | `has_role=true`, painel/RPC sem recursão.                                                |
|     5 | Testar isolamento A/B e anon                   | Pendente                        | Toda tentativa cruzada/privada é negada.                                                 |
|     6 | Confirmar concorrência de resposta/notificação | Pendente                        | Uma transição e um envio lógico.                                                         |
|     7 | Reconciliar cron de retenção                   | Pendente                        | Job remoto correto ou migration nova aplicada.                                           |
|     8 | Versionar migrations e código aplicados        | Em andamento                    | Working tree revisada e commit/push autorizado.                                          |
|     9 | Confirmar deploy Cloudflare do rate limit      | Bloqueado — credencial          | Deployment identificado e smoke test executado.                                          |
|    10 | Fechar gates                                   | Parcial                         | Typecheck, lint e build passam; correção do CI ainda requer novo run remoto.              |

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
- ainda é necessário confirmar:
  - que a credencial anterior foi invalidada;
  - que os consumidores necessários usam a credencial nova;
  - que site, Worker e automações continuam saudáveis;
- a inspeção local considerou somente nomes de variáveis, nunca valores:
  - `.env.local` contém configuração Supabase por URL, publishable key e
    `service_role`;
  - não foi encontrada variável de conexão PostgreSQL direta como `DATABASE_URL`,
    `PGPASSWORD` ou `POSTGRES_URL` no workspace;
  - portanto, o frontend e o Worker não aparentam depender da senha PostgreSQL
    rotacionada;
- nenhuma tentativa automatizada com a senha anterior será feita ou registrada.

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
[ ] senha anterior confirmada como rejeitada
[ ] consumidores e saúde da aplicação confirmados
[x] superfícies atuais e domínio legado identificados
[ ] saúde do Vercel reconciliada
[ ] URL canônica e plano de cutover definidos
[~] catálogo em coleta sequencial — consultas 1a e 1b registradas
[ ] teste usuário comum — bloqueado pela configuração do bundle Lovable
[ ] teste admin — bloqueado pela configuração do bundle Lovable
[ ] teste anon
[ ] teste A/B
[ ] teste concorrência
[ ] cron
[ ] commit/push
[ ] deploy Cloudflare
```

## Bloqueios atuais

1. falta confirmar invalidação da senha anterior e consumidores após a rotação;
2. o bundle publicado no Lovable não contém as variáveis públicas do Supabase;
3. o project ref da conexão Lovable → Supabase ainda precisa ser confirmado
   como `porgyoqngtshxdxuwaft`;
4. testes autenticados exigem sessões/contas de teste reais após a reconciliação;
5. consulta de deployment Cloudflare exige token disponível no ambiente;
6. audit npm online envia metadados de dependências ao registro externo e requer
   autorização consciente.

## Estado operacional

`STANDBY` desde 29/07/2026, por decisão do proprietário.

Motivo: a conexão Lovable → Supabase depende de tokens/créditos do Lovable, com
reset previsto para 01/08/2026.

Escopo do standby: conexão/deploy Lovable, testes autenticados e continuação
sequencial das consultas de produção. Manutenção local independente permanece
autorizada.

Critério de retomada:

1. proprietário confirmar disponibilidade dos tokens;
2. conectar o Lovable ao Supabase `porgyoqngtshxdxuwaft`;
3. publicar o build corrigido;
4. validar o login Google;
5. retomar pela consulta funcional 1c, sem saltar etapas.

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
- a confirmação no GitHub permanece pendente de commit/push e novo run;
- containers, volumes, redes, processos e arquivos temporários da rodada foram
  removidos; imagens Docker permaneceram apenas como cache reutilizável.
