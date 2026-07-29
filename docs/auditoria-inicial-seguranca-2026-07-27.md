# ItaSafety — Auditoria inicial de drift e segurança

**Data:** 27/07/2026  
**Commit auditado:** `e856b16` (`main`, igual a `origin/main` no momento da revisão)  
**Documentação confrontada:** `itasafety_documentacao_tecnica.md`, versão de 27/07/2026  
**Escopo:** repositório local, migrations SQL, RLS, grants, triggers, RPCs, Edge Function, fluxos frontend e dependências  
**Fora do escopo executado:** consultas ou testes no projeto Supabase de produção `porgyoqngtshxdxuwaft`

## 1. Parecer executivo

O repositório **não permite confirmar que o banco de produção está livre de drift**. As três camadas de segurança de 22/07, o cadastro de empresas e os change requests existem apenas como scripts soltos em `supabase/`, não como migrations do diretório canônico `supabase/migrations/`. O histórico canônico termina em 17/07 e não cria as tabelas de cotação ou empresa.

Além disso, a cadeia canônica não é reproduzível do zero sem correções: há uma policy de `partners` que compara enum com `text`, uma dependência não declarada de `public.moddatetime` e uma chamada `cron.schedule` sintaticamente inválida. Portanto, o estado documentado pode existir por aplicação manual no SQL Editor, mas não pode ser reconstruído ou comprovado pelo versionamento atual.

Os controles de anti-spoofing PJ, anti-impersonação das RPCs atuais e allowlist anti-SQL-injection estão presentes no código. O controle anti-race-condition da notificação por e-mail, porém, **não está intacto**: a marca de idempotência é obtida somente depois que os dois e-mails já foram enviados.

Antes de qualquer feature do roadmap, a prioridade deve ser:

1. executar as consultas somente leitura da seção 10 no catálogo real;
2. capturar um baseline versionado do schema efetivo;
3. corrigir a cadeia de migrations em staging;
4. tratar os achados de e-mail, rate limiting e autorização;
5. só então promover uma migration de reconciliação para produção.

## 2. Método e níveis de evidência

Cada conclusão usa uma destas classificações:

- **Confirmado no repositório:** o comportamento decorre diretamente do código versionado.
- **Condicional ao catálogo:** o risco depende dos grants, policies, overloads ou migrations efetivamente aplicados no Supabase.
- **Drift documental:** documentação, tipos, frontend e SQL descrevem estados diferentes.

Não foram executados payloads, testes concorrentes, chamadas à Edge Function nem consultas no ambiente de produção.

## 3. Achados priorizados

### AUD-01 — Estado do banco não reproduzível nem comprovável

**Severidade:** Alta operacional  
**Evidência:** confirmada no repositório  
**CVSS:** não aplicável a falha de processo/reprodutibilidade

**O que é**

Os arquivos abaixo não estão em `supabase/migrations/`:

- `20260722_camada1_schema_grants.sql`
- `20260722_camada1_5_fix_rls.sql`
- `20260722_camada2_user_roles.sql`
- `20260722_identidade_e_orcamento.sql`
- `20260723_empresa_change_requests.sql`
- `cotacao_schema.sql`
- `cotacoes_status_migration.sql`
- `cotacao_estruturada_migration.sql`
- `notificacao_enviada_migration.sql`

O histórico canônico, portanto, não cria `carrinho_cotacao`, `cotacoes`, `cotacao_itens`, `cotacao_historico_status`, `cotacao_notificacoes`, `empresas` ou `empresa_change_requests`.

**Impacto**

- Não há prova versionada de quais controles chegaram a produção.
- Um ambiente novo não reproduz o schema documentado.
- Uma restauração, staging ou onboarding pode nascer com políticas diferentes.
- Correções futuras podem partir de premissas incorretas sobre overloads de funções e grants.

**Remediação**

Exportar o catálogo efetivo, comparar com o conjunto desejado e criar migrations novas, monotônicas e idempotentes de reconciliação. Não mover ou renomear scripts antigos como se ainda não tivessem sido aplicados; registrar explicitamente o baseline de produção.

---

### AUD-02 — A cadeia canônica contém migrations que não podem ser reaplicadas com segurança

**Severidade:** Alta operacional  
**Evidência:** confirmada no repositório  
**CVSS:** não aplicável

**Como foi identificada**

1. `20260708000000_create_partners.sql` compara `public.app_role` com `'admin'::text`; a migration posterior de 17/07 reconhece essa incompatibilidade, mas uma execução do zero precisa concluir a migration defeituosa antes de alcançar o fix.
2. A mesma migration usa `public.moddatetime('updated_at')`, sem criar ou declarar a extensão/função.
3. `20260717102600_auth_attempts_retention.sql:22-29` passa um `DELETE` sem string/dollar quoting para `cron.schedule`, resultando em SQL inválido.
4. `combined_migrations.sql` se declara idempotente, mas cria `has_role()` consultando `public.user_roles` antes de criar a tabela em uma instalação limpa.

**Impacto**

Falha de bootstrap/staging, falsa confiança em migrations “aplicadas” e dificuldade de validar RLS por replay.

**Remediação**

Criar uma suíte de replay em banco efêmero e bloquear merge quando `supabase db reset`/lint falhar. A correção deve ser feita em migrations novas quando houver possibilidade de arquivos antigos já terem sido aplicados.

---

### AUD-03 — `empresas` depende de privilégios default e não satisfaz “grants explícitos”

**Severidade:** Alta, condicional ao catálogo  
**Evidência:** confirmada no script; exposição efetiva depende do banco  
**CWE:** CWE-266/CWE-269 (gestão incorreta de privilégios)  
**CVSS:** deve ser calculado após consultar os grants reais

**O que é**

`20260722_identidade_e_orcamento.sql` habilita RLS e cria policies em `empresas`, mas não contém `REVOKE`/`GRANT` para `PUBLIC`, `anon` ou `authenticated`. A Camada 1 foi criada antes dessa tabela e também não a cobre.

**Impacto**

Há dois resultados possíveis, ambos indesejados:

- sem default grants, o frontend não consegue selecionar/inserir/atualizar empresas;
- com default grants amplos, podem existir privilégios como `TRUNCATE`, que não é controlado por RLS.

**Remediação**

Após ler o catálogo real, aplicar privilégios mínimos e explícitos. RLS e grants são controles complementares; `TRUNCATE` não passa por policies de linha.

---

### AUD-04 — Plano de autorização de `user_roles` pode entrar em recursão

**Severidade:** Alta funcional/segurança  
**Evidência:** composição confirmada nos arquivos; execução deve ser validada no catálogo/staging  
**CWE:** CWE-863 (autorização incorreta)

**O que é**

`has_role()` foi convertido para `SECURITY INVOKER` em `20260702131849...sql` e consulta `user_roles`. A policy histórica `"Admins manage roles select"` da própria `user_roles` chama `has_role()` e nunca é removida pelas migrations seguintes ou pelo script da Camada 2.

Essa composição pode produzir `infinite recursion detected in policy for relation "user_roles"` e afetar todas as policies administrativas que dependem de `has_role()`.

**Impacto**

Indisponibilidade do painel administrativo e falha das decisões RLS baseadas em role. Não foi identificada elevação direta de privilégio; o risco principal é a quebra do plano de autorização.

**Remediação**

Validar imediatamente em staging com os testes da seção 10. Consolidar uma única implementação não recursiva de `has_role`, com owner controlado, `search_path` seguro, `PUBLIC` revogado e testes de usuário comum/admin. Remover policies históricas redundantes.

---

### AUD-05 — A proteção anti-duplicata de e-mail ocorre depois do efeito externo

**Severidade:** Média  
**Evidência:** confirmada no repositório  
**CWE:** CWE-362 (race condition)  
**CVSS estimado:** 5.4 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:L`

**O que é**

Na Edge Function:

1. a cotação é lida com `notificacao_enviada_em IS NULL`;
2. os e-mails do cliente e do admin são enviados;
3. somente depois ocorre `UPDATE ... IS NULL`.

Duas requisições concorrentes podem passar pelas etapas 1 e 2. A segunda perderá o `UPDATE`, mas os e-mails já terão sido enviados.

**Impacto**

Mensagens duplicadas, consumo de quota EmailJS e ruído operacional. Em falha parcial, o retry reenvia também o e-mail que já teve sucesso, pois há apenas uma flag para dois destinatários.

**Remediação**

Adotar outbox/idempotency key por `(cotacao_id, tipo_notificacao, destinatario)`, adquirida atomicamente antes do envio. Registrar estados `pendente`, `processando`, `enviado`, `falhou` e permitir retry apenas do destinatário que falhou. A tabela `cotacao_notificacoes` já existe, mas atualmente não é usada pela função.

---

### AUD-06 — HTML não confiável é inserido no e-mail administrativo

**Severidade:** Média  
**Evidência:** confirmada no repositório  
**CWE:** CWE-116; relacionado a CWE-79  
**CVSS estimado:** 5.5 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N`

**O que é**

Usuários podem inserir snapshots em `cotacao_itens` desde que a cotação pai seja deles. `nome`, `sku` e `ca_number` são interpolados diretamente em `itens_html`, enviado a um placeholder de HTML sem escape.

**Impacto**

Injeção de conteúdo, links/imagens de tracking e possível HTML ativo no e-mail aberto pelo administrador. O impacto exato depende da sanitização do EmailJS e do cliente de e-mail, mas não deve ser delegado a eles.

**Remediação**

- Resolver snapshots de produto no servidor a partir de IDs/SKUs autorizados.
- Aplicar encoding HTML contextual a toda string não confiável.
- Sanitizar somente quando HTML intencional for permitido.
- Definir limites de tamanho e formato no banco/RPC.

---

### AUD-07 — Endpoint de registro de tentativas permite envenenar o rate limit

**Severidade:** Média  
**Evidência:** confirmada no repositório  
**CWE:** CWE-841; consequência de disponibilidade relacionada a CWE-400  
**CVSS estimado:** 5.3 — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L`

**O que é**

`recordAuthAttempt` é uma server function sem middleware de autenticação. O chamador fornece `email` e `success`; o servidor grava esses valores com `service_role`. Cinco registros `success=false` para um e-mail fazem `checkAuthRateLimit` bloquear esse alvo por 15 minutos.

**Impacto**

Negação de serviço direcionada contra contas, inclusive administrativas, renovável por chamadas repetidas.

**Remediação**

Não aceitar do cliente o resultado da autenticação. Executar tentativa e registro em uma única fronteira server-side, ou emitir um comprovante não forjável que vincule tentativa, IP e resultado. Aplicar proteção contra automação sem criar lockout controlável por terceiros.

---

### AUD-08 — Disparo de cotações/e-mails não tem quota e aceita destinatário controlável via API

**Severidade:** Média/Alta  
**Evidência:** confirmada no repositório  
**CWE:** CWE-770 (recursos sem limites/throttling)  
**CVSS estimado:** 6.5 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H`

**O que é**

O frontend usa o e-mail autenticado, mas o banco aceita `email_contato` enviado pelo cliente e a trigger PJ só sobrescreve `empresa`/`cnpj`. Uma conta cadastrada pode criar cotações com destinatários arbitrários e invocar a Edge Function repetidamente. Não há quota por usuário/IP/janela nem limite diário antes da chamada ao EmailJS.

**Impacto**

Abuso como relay de e-mail transacional, spam, consumo de quota e indisponibilidade das notificações legítimas.

**Remediação**

Derivar o destinatário de `auth.users`/claim verificada quando a confirmação for destinada ao titular; implementar quota server-side, backoff, idempotency key e alertas de volume. Se e-mail alternativo for requisito, exigir verificação explícita.

---

### AUD-09 — Criação e resposta de cotação não têm uma outbox transacional

**Severidade:** Média operacional  
**Evidência:** confirmada no repositório  
**CVSS:** não aplicável

**O que é**

- O frontend cria o cabeçalho, depois insere itens e depois chama a Edge Function em três transações.
- Uma falha nos itens deixa cabeçalho órfão.
- Uma chamada antecipada da Edge Function pode enviar uma cotação sem itens e marcar a notificação.
- Na resposta administrativa, a RPC confirma a alteração no banco antes do e-mail. Se o EmailJS falhar, o retry da mesma ação pode ser bloqueado pelo status já terminal.

**Remediação**

Criar RPC de submissão atômica que derive `auth.uid()`, valide itens e grave cabeçalho/itens/outbox na mesma transação. Separar persistência da resposta e entrega de e-mail por outbox reprocessável.

---

### AUD-10 — Bucket público de logos aceita upload sem restrição server-side de tipo/tamanho

**Severidade:** Média  
**Evidência:** confirmada no repositório  
**CWE:** CWE-434 e CWE-770  
**CVSS estimado:** 5.5 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N`

**O que é**

O frontend limita 2 MB e tipos de imagem, mas o bucket `empresa_logos` é público e as policies validam apenas bucket e pasta `auth.uid()`. Não há `file_size_limit`, `allowed_mime_types` ou validação server-side de conteúdo. A RPC `atualizar_logo_empresa` também aceita URL arbitrária sem validar bucket/pasta.

**Impacto**

Hospedagem de conteúdo não previsto, consumo de storage e referências externas de tracking/conteúdo.

**Remediação**

Configurar limites do bucket, validar MIME real/assinatura, usar nomes gerados no servidor e fazer a RPC aceitar um path relativo que pertença ao usuário, não uma URL arbitrária.

---

### AUD-11 — Validações de integridade estão incompletas

**Severidade:** Média  
**Evidência:** confirmada no repositório

Pontos principais:

- `cotacao_itens.quantidade` não tem o `CHECK (1..9999)` existente no carrinho.
- `preco_unitario` aceita valores negativos e não há validação de todos os itens da cotação.
- `validade_orcamento_dias` não tem faixa válida.
- `empresas.cnpj` não tem validação/normalização/unicidade server-side.
- `empresa_change_requests` não restringe `campo_alterado` no INSERT; a allowlist só é aplicada na aprovação.
- Campos de contato/change request não têm limites de comprimento consistentes no banco.
- `cotacoes.user_id` é `NOT NULL`, mas a FK usa `ON DELETE SET NULL`, combinação incompatível com a ação referencial desejada.

**Remediação**

Adicionar constraints e validações server-side com backfill/checagem prévia. Manter a allowlist dentro da RPC e também como constraint/policy de entrada para reduzir lixo e DoS lógico.

---

### AUD-12 — Dependências com advisories conhecidos

**Severidade:** Alta no scanner; explorabilidade da aplicação requer triagem  
**Evidência:** `npm audit --omit=dev` executado em 27/07/2026

Resultado:

- 13 pacotes vulneráveis;
- 9 de severidade alta;
- 3 moderados;
- 1 baixo;
- nenhum crítico.

Entre os caminhos reportados estão `@cloudflare/vite-plugin`, `wrangler`, `miniflare`, `undici`, `ws`, `sharp`, `postcss`, `js-yaml`, `fast-uri` e a cadeia `@lovable.dev/mcp-js` → `@modelcontextprotocol/sdk` → `@hono/node-server`.

Grande parte parece estar em tooling/build/local runtime, e o advisory Windows de `@hono/node-server` não implica automaticamente exposição no Worker de produção. Ainda assim, a triagem deve confirmar quais módulos entram no bundle/runtime e atualizar lockfile/dependências em PR separada.

---

### AUD-13 — Os gates locais não detectam quebra de tipos

**Severidade:** Média operacional  
**Evidência:** confirmada por execução local

- `npm run build`: passou, com avisos.
- `tsc --noEmit`: falhou em `src/integrations/supabase/types.ts:374`.
- `npm run lint`: falhou com 2.011 problemas (2.002 erros e 9 warnings).
- O build não executa `tsc`, portanto aceita o arquivo de tipos estruturalmente quebrado.
- Os tipos não contêm as tabelas de cotação e aninham incorretamente `partners` dentro de `empresas`.

**Impacto**

Perda da proteção estática justamente nos acessos a banco, uso recorrente de casts `as any` e risco de drift não detectado.

**Remediação**

Adicionar `typecheck`, lint e replay/lint SQL como gates obrigatórios de CI.

## 4. Estado de RLS/grants por tabela

A tabela abaixo descreve o **estado pretendido pelos scripts em ordem cronológica**, não uma afirmação sobre o catálogo de produção.

| Tabela                     | RLS no SQL | `anon` pretendido                               | `authenticated` pretendido                                                  | Drift/risco principal                                                                                        |
| -------------------------- | ---------: | ----------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `products`                 |        Sim | SELECT de publicados                            | SELECT; INSERT/UPDATE via policy admin; DELETE revogado pela Camada 1       | Policy de DELETE e UI existem, mas o grant foi revogado; schema documentado não corresponde às colunas reais |
| `categories`               |        Sim | SELECT de ativos                                | SELECT; INSERT/UPDATE admin; DELETE revogado                                | UI/policy de delete ficam inoperantes; `icon` documentado não existe                                         |
| `brands`                   |        Sim | SELECT de ativos                                | SELECT; INSERT/UPDATE admin; DELETE revogado                                | UI/policy de delete ficam inoperantes                                                                        |
| `partners`                 |        Sim | SELECT de todas as linhas                       | SELECT; INSERT/UPDATE admin; DELETE revogado                                | Migration inicial não é replayable; SELECT não filtra `active`; UI delete inoperante após Camada 1           |
| `user_roles`               |        Sim | Nenhum após Camada 2                            | SELECT; escrita revogada                                                    | Não existe a RPC de atribuição descrita; risco de recursão em `has_role`                                     |
| `empresas`                 |        Sim | Não definido explicitamente                     | Não definido explicitamente; policies own/admin                             | Falha do checklist de grants; efeito real depende de default privileges                                      |
| `empresa_change_requests`  |        Sim | Nenhum                                          | SELECT/INSERT do próprio; SELECT/UPDATE admin; sem DELETE/TRUNCATE          | `motivo_rejeicao` documentado não existe; falta allowlist/limites no INSERT                                  |
| `carrinho_cotacao`         |        Sim | Nenhum após Camada 1                            | CRUD somente do próprio; admin SELECT                                       | Controle de ownership está correto; snapshots continuam controláveis pelo cliente                            |
| `cotacoes`                 |        Sim | Nenhum após Camada 1                            | SELECT/INSERT próprio; UPDATE só da coluna de notificação; admin SELECT/RPC | Trigger PJ está fora do histórico canônico; sequence grants não são explícitos; PF não existe                |
| `cotacao_itens`            |        Sim | Nenhum após Camada 1                            | SELECT/INSERT se a cotação pai for própria                                  | Snapshot arbitrário e falta CHECK de quantidade                                                              |
| `cotacao_historico_status` |        Sim | Nenhum                                          | SELECT próprio/admin; sem UPDATE/DELETE/TRUNCATE                            | Imutabilidade para cliente está preservada se grants foram aplicados                                         |
| `cotacao_notificacoes`     |        Sim | Nenhum                                          | SELECT somente com policy admin                                             | Tabela não é usada pela Edge Function; não cumpre o papel de outbox/log descrito                             |
| `app_settings`             |        Sim | Camada 1 concede SELECT, mas não há policy anon | Administração via policy admin; DELETE revogado                             | Documentação chama de leitura pública, porém RLS efetivo é default-deny para anon                            |
| `auth_attempts`            |        Sim | Nenhum                                          | SELECT admin; escrita via service role                                      | Retenção não é aplicada pela migration inválida; endpoint público pode envenenar o rate limit                |

### Observação sobre DELETE administrativo

RLS não concede privilégios; ele apenas restringe privilégios já concedidos. Ao revogar `DELETE` de `authenticated` nas tabelas públicas, a Camada 1 impede também admins autenticados de usar as policies de DELETE. Isso conflita com a documentação e com as telas administrativas, que chamam `.delete()`.

## 5. Revisão das três camadas

| Camada            | Resultado                                                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Camada 1 — grants | **Parcial e não confirmada em produção.** Revoga `anon` das tabelas privadas e reduz catálogo, mas não cobre tabelas criadas depois, não revoga `PUBLIC`, não trata sequences e quebra DELETE administrativo existente.  |
| Camada 1.5 — RLS  | **Correta no objetivo restrito**, adicionando `WITH CHECK` explícito para UPDATE de `products`, `categories` e `brands`. Está fora do diretório canônico; `partners` depende do fix separado de 17/07.                   |
| Camada 2 — roles  | **Protege contra escrita direta se aplicada**, mas a atribuição “exclusivamente via RPC” não existe. A combinação com `has_role SECURITY INVOKER` e policies históricas precisa de teste imediato por risco de recursão. |

## 6. Controles defensivos críticos

| Controle                                      | Estado                                      | Evidência                                                                                                          |
| --------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Anti-spoofing PJ                              | Presente no script, não confirmado no banco | `tg_resolver_empresa_cotacao` usa `auth.uid()`, exige empresa aprovada e sobrescreve empresa/CNPJ                  |
| Anti-spoofing PF/CPF                          | Ausente                                     | Não existem `document_type`, `validar_cpf(text)` ou branch CPF                                                     |
| Anti-impersonação — `responder_cotacao` atual | Preservado                                  | Usa `auth.uid()` e valida role no topo                                                                             |
| Anti-impersonação — change request/logo       | Preservado com ressalvas                    | Ambas usam `auth.uid()`; logo aceita URL arbitrária                                                                |
| RPCs `SECURITY DEFINER` + `search_path`       | Parcial                                     | RPCs atuais usam `SET search_path = public`; trigger functions não têm todos os `EXECUTE` explicitamente revogados |
| Anti-race — resposta de cotação               | Preservado                                  | `SELECT ... FOR UPDATE` e validação de status                                                                      |
| Anti-race — aprovação de change request       | Preservado                                  | `SELECT ... FOR UPDATE` e status pendente                                                                          |
| Anti-race — envio de e-mail                   | **Falho**                                   | A aquisição condicional ocorre depois dos dois envios                                                              |
| Anti-SQL-injection                            | Preservado                                  | Allowlist fixa antes de `format('%I', ...)` e valor passado por bind `$1`                                          |
| Ownership de change request                   | Preservado                                  | Policy exige `user_id = auth.uid()` e empresa pertencente ao mesmo usuário                                         |

### Overload legado

O SQL histórico criou `responder_cotacao(uuid, uuid, cotacao_status, text, text)`, que aceitava `_admin_id`. A migration estruturada tenta removê-lo, mas a migration de identidade remove outra assinatura antiga. O catálogo deve ser consultado para garantir que nenhum overload legado permaneceu. A assinatura antiga era restrita a `service_role`, reduzindo exposição direta, mas conflita com a regra documental de nunca aceitar identidade administrativa do chamador.

## 7. Drift entre documentação e implementação

### Schema/segurança

- `products` usa `category text`, `brand text`, `short_description` e `published`; a documentação descreve FKs `category_id`/`brand_id`, `description` e `active`.
- `categories` não possui `icon`; possui `description`, `active` e `updated_at`.
- A documentação alterna entre “app_settings público” e uma implementação RLS admin-only.
- A documentação registra `motivo_rejeicao` em change requests, mas a coluna não existe.
- A documentação afirma fluxo PF/CPF na descrição de trigger e no modelo de negócio; código, SQL, tipos e frontend são somente PJ.
- `cotacao_notificacoes` é descrita como rastreamento ativo, mas não recebe writes.
- A atribuição de role via RPC é descrita, mas nenhuma RPC correspondente existe.
- O nome da trigger aparece como `tg_resolver_empresa_cotacao` em alguns trechos, enquanto esse é o nome da função; a trigger é `tg_cotacoes_resolver_empresa`.

### Frontend/tipos

- O formulário do carrinho continua exigindo empresa e não oferece toggle PJ/PF.
- `src/integrations/supabase/types.ts` não representa o schema de cotação e falha no TypeScript.
- O frontend usa `as any` nos inserts de cotação, ocultando drift.
- A tela de admin rejeita change request sem registrar `reviewed_by` e não há motivo de rejeição.

### Stack resolvida

A documentação mistura versões declaradas com versões antigas. O `npm ls` local resolveu, entre outras:

- React `19.2.7`;
- TypeScript `5.9.3`;
- Vite `7.3.5`;
- TanStack Router `1.170.15`;
- Supabase JS `2.108.1`;
- Tailwind CSS `4.3.1`;
- Wrangler `4.100.0`.

Versões com `^` podem mudar após instalação; a documentação deve distinguir versão declarada da versão do lockfile.

## 8. Pontos positivos confirmados

- RLS está habilitado em todas as tabelas listadas nos scripts.
- As policies de carrinho, cotações e itens vinculam acesso ao usuário autenticado.
- A trigger PJ resolve a identidade empresarial no servidor e ignora os valores livres do cliente.
- As RPCs atuais de resposta/aprovação usam `auth.uid()` e `SET search_path`.
- A aprovação de change request combina allowlist de coluna com bind de valor.
- Locks de linha existem nas duas RPCs concorrentes críticas.
- O painel administrativo usa verificação server-side de role, além do redirecionamento.
- Há timeout de UI de 15 minutos e alerta de ausência de MFA.
- Nenhum arquivo `.env` está versionado; `.env.local` existe apenas localmente e seus valores não foram lidos para o relatório.
- O build filtra arquivos sensíveis da cópia de `public/`.

## 9. Plano de remediação recomendado

### P0 — antes de qualquer feature

1. Rodar as consultas da seção 10 no projeto real e salvar o resultado anonimizado.
2. Confirmar migrations aplicadas, overloads, grants, policies, triggers e cron.
3. Corrigir em staging a cadeia de migrations e criar baseline reproduzível.
4. Resolver grants explícitos de `empresas`, `PUBLIC` e sequences.
5. Testar/corrigir `has_role` e remover policies históricas redundantes.

### P1 — segurança de negócio

1. Substituir a flag pós-envio por outbox idempotente.
2. Escapar/sanitizar HTML e derivar snapshots no servidor.
3. Corrigir o envenenamento de `auth_attempts`.
4. Aplicar quotas de cotação/e-mail e derivar destinatário verificado.
5. Restringir bucket/RPC de logos.
6. Adicionar constraints de quantidade, preço, validade e comprimentos.

### P2 — confiabilidade e governança

1. Gerar tipos Supabase a partir do schema efetivo.
2. Adicionar `typecheck`, lint, testes SQL e replay ao CI.
3. Triar/atualizar dependências reportadas pelo npm audit.
4. Atualizar a documentação somente após reconciliar banco e código.
5. Implementar PF/CPF como migration nova seguindo “banco primeiro”.

## 10. Consultas somente leitura para confirmar o catálogo

Executar primeiro em staging. Em produção, usar somente após autorização explícita e salvar o resultado sem dados de negócio.

```sql
-- 1. Ledger de migrations
select version, name, statements
from supabase_migrations.schema_migrations
order by version;

-- 2. RLS e owner das tabelas em escopo
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  pg_get_userbyid(c.relowner) as owner
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;

-- 3. Policies efetivas
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- 4. Grants de tabela, incluindo PUBLIC/anon/authenticated
select table_schema, table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema in ('public', 'storage')
order by table_schema, table_name, grantee, privilege_type;

-- 5. Grants por coluna (necessário para notificacao_enviada_em)
select table_schema, table_name, column_name, grantee, privilege_type
from information_schema.column_privileges
where table_schema = 'public'
order by table_name, column_name, grantee;

-- 6. Grants de sequences
select object_schema, object_name, grantee, privilege_type
from information_schema.role_usage_grants
where object_schema = 'public'
order by object_name, grantee;

-- 7. Funções, overloads, SECURITY DEFINER, search_path e ACL
select
  n.nspname,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as identity_args,
  p.prosecdef as security_definer,
  p.proconfig,
  p.proacl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'has_role',
    'handle_first_user_admin',
    'tg_set_updated_at',
    'tg_log_cotacao_status',
    'tg_resolver_empresa_cotacao',
    'marcar_em_analise',
    'responder_cotacao',
    'atualizar_logo_empresa',
    'aprovar_change_request',
    'validar_cpf'
  )
order by p.proname, identity_args;

-- 8. Triggers críticos
select
  event_object_schema,
  event_object_table,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
from information_schema.triggers
where event_object_schema in ('public', 'auth')
order by event_object_schema, event_object_table, trigger_name, event_manipulation;

-- 9. Colunas que comprovam features/documentação
select table_name, column_name, data_type, udt_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('cotacoes', 'empresa_change_requests', 'empresas', 'cotacao_itens')
order by table_name, ordinal_position;

-- 10. Retenção de auth_attempts
select jobid, jobname, schedule, command, active
from cron.job
where jobname = 'purge_old_auth_attempts';
```

Testes funcionais mínimos em staging, com usuários descartáveis:

1. usuário comum lê apenas o próprio role e `has_role(..., 'admin') = false`;
2. admin obtém `true` sem erro de recursão;
3. usuário comum não insere/altera/remove `user_roles`;
4. `anon` não acessa nenhuma tabela privada;
5. usuário A não lê/insere itens na cotação de B;
6. empresa/CNPJ enviados pelo cliente são sobrescritos pela trigger PJ;
7. duas respostas administrativas simultâneas produzem uma única transição;
8. duas notificações simultâneas produzem uma única outbox por destinatário;
9. campo fora da allowlist não é inserido/aprovado;
10. `PUBLIC` não executa funções `SECURITY DEFINER`.

## 11. Referências primárias

- [OWASP ASVS 5.0](https://github.com/OWASP/ASVS)
- [OWASP — Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP — XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MITRE CWE-362 — Race Condition](https://cwe.mitre.org/data/definitions/362.html)
- [MITRE CWE-770 — Allocation Without Limits or Throttling](https://cwe.mitre.org/data/definitions/770.html)
- [MITRE CWE-863 — Incorrect Authorization](https://cwe.mitre.org/data/definitions/863.html)
- [PostgreSQL — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL — Writing SECURITY DEFINER Functions Safely](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [PostgreSQL — Privileges](https://www.postgresql.org/docs/current/ddl-priv.html)
- [Supabase — Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)

## 12. Conclusão

O projeto possui decisões defensivas boas e reconhecíveis, mas o nível atual é **“controles presentes no código, estado de produção não atestado”**. O principal risco não é um único bypass: é a distância entre documentação, scripts manuais, migrations canônicas, tipos e comportamento efetivo.

O próximo passo seguro é obter evidência somente leitura do catálogo, reconciliar o banco em staging e transformar essa evidência em migrations e testes reproduzíveis. Até isso ocorrer, não é possível afirmar que as Camadas 1, 1.5 e 2 continuam corretamente aplicadas em produção.
