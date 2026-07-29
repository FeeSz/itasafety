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
|    10 | Fechar gates                                   | Pendente                        | Typecheck, lint e build integrados ao processo.                                          |

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

## Evidências pendentes

```text
[x] senha rotacionada, conforme confirmação do proprietário
[ ] senha anterior confirmada como rejeitada
[ ] consumidores e saúde da aplicação confirmados
[x] superfícies atuais e domínio legado identificados
[ ] saúde do Vercel reconciliada
[ ] URL canônica e plano de cutover definidos
[~] catálogo em coleta sequencial — consultas 1a e 1b registradas
[ ] teste usuário comum
[ ] teste admin
[ ] teste anon
[ ] teste A/B
[ ] teste concorrência
[ ] cron
[ ] commit/push
[ ] deploy Cloudflare
```

## Bloqueios atuais

1. falta confirmar invalidação da senha anterior e consumidores após a rotação;
2. testes autenticados exigem sessões/contas de teste reais;
3. consulta de deployment Cloudflare exige token disponível no ambiente;
4. audit npm online envia metadados de dependências ao registro externo e requer
   autorização consciente.
