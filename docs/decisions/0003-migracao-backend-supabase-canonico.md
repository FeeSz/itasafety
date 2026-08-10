# 0003 — Migração do backend para o Supabase canônico `porgyoqngtshxdxuwaft`

Data: 03/08/2026; atualizada em 07/08/2026
Status: `em execução` (vínculo selecionado; publish e validação funcional congelados)

## Contexto

A documentação do projeto sempre descreveu `porgyoqngtshxdxuwaft` como o projeto
Supabase de produção. A verificação de 03/08/2026 mostrou que o runtime não
estava conectado a esse ref. Em 06/08/2026, o proprietário selecionou o projeto
externo no Lovable, e a plataforma reconheceu o catálogo canônico.

Estado anterior, verificado em 03/08/2026:

- o app usa o backend Supabase gerenciado pelo Lovable Cloud, com project ref
  distinto, resolvido pelas variáveis de ambiente da plataforma;
- `porgyoqngtshxdxuwaft` aparece apenas em documentação, em `supabase/config.toml`
  e em scripts históricos sob `supabase/`; nenhum caminho de runtime aponta para
  ele;
- consumo de configuração:
  - browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
    (`src/integrations/supabase/client.ts`);
  - servidor: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
    `SUPABASE_SERVICE_ROLE_KEY` (`client.server.ts`, `auth-middleware.ts`,
    `routes/api/public/health.ts`);
  - build: Vite e `@lovable.dev/vite-tanstack-config` resolvem as variáveis
    públicas, e `scripts/verify-build-env.mjs` bloqueia publish quando elas não
    aparecem no bundle;
- Auth/OAuth: e-mail/senha mais Google e Apple pelo gate gerenciado, com rota de
  consentimento `src/routes/[.]lovable.oauth.consent.tsx`;
- MCP: `src/lib/mcp/index.ts` deriva o issuer de `VITE_SUPABASE_PROJECT_ID`
  (`https://<ref>.supabase.co/auth/v1`), portanto o issuer acompanha
  automaticamente a variável e hoje aponta para o backend do Cloud.

## Decisão

O destino `porgyoqngtshxdxuwaft` passa a ser tratado como **fonte de verdade dos
dados de negócio**. Não haverá cópia de dados do backend do Cloud para o destino.
Usuários e roles serão migrados preservando os IDs de `auth.users`, por export
conduzido pelo proprietário.

Nenhuma migration, escrita remota ou publish foi executada nesta decisão.

Execução observada em 06/08/2026:

- o Lovable selecionou o project ref `porgyoqngtshxdxuwaft` e leu as tabelas
  esperadas do destino;
- o commit automático ficou apenas no histórico interno do Lovable e não foi
  sincronizado ao GitHub;
- esse commit incorporou configuração pública no cliente e alterou dependências
  sem atualizar o lockfile;
- a reconciliação local rejeita a configuração incorporada, preserva fail-closed,
  restaura os tipos confirmados e realinha o manifesto ao lockfile;
- `npm ci`, typecheck, lint e o build com valores públicos fictícios no ref
  canônico passaram; ausência de variáveis e ref incorreto foram bloqueados nos
  testes negativos;
- o commit de reconciliação `4982ca704f4f0ccddad33ca050266480240eb992`
  foi enviado para `origin/reconcile/lovable-supabase-20260806`;
- nenhum workflow remoto foi iniciado pelo push porque `quality.yml` restringe
  o evento `push` à `main`;
- o pull request [#1](https://github.com/FeeSz/itasafety/pull/1) foi aberto para
  `main`, sem merge ou publicação, e acionou o workflow Quality;
- o run `31118936956`, para o commit
  `bca061996dc27dcdb1514d769f0cdafa06a42069`, concluiu o job
  `static-analysis` com sucesso;
- o run seguinte, `31119315666`, para o commit documental
  `1fc1a6c323f0a578e87116a7e7b6b861bb1918d4`, foi cancelado sem executar etapas
  durante a indisponibilidade do GitHub Actions de 06/08/2026;
- em 07/08/2026, com o incidente resolvido, o run `31185659802` passou no commit
  documental `e3893458e996554b2617c4449895685e109dea11`;
- o gate de merge usa sempre o Quality do HEAD atual do PR; qualquer commit novo
  precisa obter seu próprio resultado verde;
- o diagnóstico posterior dos provedores identificou dois problemas locais:
  Cloudflare autodetectou o `bun.lock` divergente e Vercel gerou o cliente em
  `.vercel/output/static`, fora dos caminhos consultados pelo verificador antigo;
- a decisão é manter npm `11.18.0` e `package-lock.json` como contrato único,
  remover `bun.lock` sem upgrade e vincular a inspeção ao output real de cada
  plataforma, sem fallback para artefatos de outro preset;
- a validação local confirmou `npm ci`, typecheck, lint e os builds
  padrão/Cloudflare e Vercel; os cenários sem variáveis e com ref incorreto foram
  bloqueados com código `1`;
- a senha exposta durante a operação foi rotacionada pelo proprietário;
- runtime publicado, OAuth, issuer do MCP, RLS e fluxos autenticados permanecem
  não confirmados.

## Sequência de execução acordada

1. Proprietário autoriza a conexão do Supabase externo `porgyoqngtshxdxuwaft` nas
   configurações do projeto. Essa é a única forma de trocar o vínculo; o Lovable
   Cloud não pode ser desligado neste projeto e, sem a conexão externa, as
   variáveis gerenciadas são reescritas em cada build.
2. A plataforma faz o rebind de `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_SUPABASE_PROJECT_ID`. Não há edição
   manual de `.env`. Credenciais são fornecidas apenas pelos campos seguros da
   plataforma, nunca no chat.
3. Diff de schema entre o destino e o que o código espera: tabelas
   (`app_settings`, `auth_attempts`, `brands`, `carrinho_cotacao`, `categories`,
   `cotacao_historico_status`, `cotacao_itens`, `cotacao_notificacoes`,
   `cotacoes`, `empresa_change_requests`, `empresas`, `partners`, `products`,
   `user_roles`), enums, triggers, RPCs (`has_role`, `marcar_em_analise`,
   `responder_cotacao`, `aprovar_change_request`, `atualizar_logo_empresa`), RLS,
   grants e bucket `empresa_logos`. Divergências geram migration nova; migration
   aplicada não é editada.
4. Migração de usuários e roles preservando IDs, para não quebrar
   `user_roles.user_id`, `empresas.user_id` e `cotacoes`.
5. Auth/OAuth no destino: provedores Google e Apple habilitados, Site URL e
   allow-list de redirect cobrindo `https://itasafety.lovable.app`, a URL de
   preview, `itasafety.com.br`, `/.lovable/oauth/consent` e `/auth/callback`;
   servidor OAuth ativo e JWKS assimétrico disponível para o MCP.
6. Validação do MCP após o rebind: `/.well-known/oauth-protected-resource` e
   `/mcp` devem anunciar o issuer do ref canônico; manifest regenerado.
7. Atualização final da documentação e revisão de `supabase/config.toml`.
8. Rebuild e publish somente com `verify-build-env` verde.

## Divisão de responsabilidades

Agente: diffs de schema em leitura, redação de migrations sem aplicar, checklist
de validação, ajustes de documentação e verificação pós-troca.

Proprietário: conexão do Supabase externo, credenciais, provedores sociais, Site
URL e redirects, storage no painel, descongelamento de migrations e autorização
de publish.

## Riscos

- IDs de `auth.users` divergentes quebram roles, empresas e cotações;
- divergência de schema, RLS ou grants gera tela em branco ou erro de permissão;
- OAuth e MCP indisponíveis se Site URL, redirects ou JWKS não estiverem prontos;
- publish bloqueado por `verify-build-env` se as variáveis não forem inlinadas;
- rebind revertido se o Cloud continuar gerenciando as variáveis;
- logos indisponíveis sem o bucket `empresa_logos` no destino.

## Rollback

Reconectar o backend do Lovable Cloud, reverter variáveis pela plataforma e
republicar a última build boa conhecida. Como não há movimentação de dados do
Cloud para o destino, os dados de ambos os lados permanecem intactos. Correções
de banco sempre por migration nova.

## Validações obrigatórias após a troca

- `/api/public/health` responde 200;
- login e-mail/senha, Google e Apple;
- `/admin/status` acessível apenas para admin;
- leitura pública de `partners` e `products`;
- fluxo de cotação ponta a ponta;
- RLS testada para `anon`, usuário A versus B, admin e `service_role`;
- issuer do MCP igual ao do ref canônico;
- `verify-build-env` verde.

## Pendências

`parcialmente confirmado`: tabelas, coluna de claim e RPCs de notificação foram
reconhecidos no catálogo do projeto `porgyoqngtshxdxuwaft`. Permanecem não
confirmados RLS, grants, triggers, cron, bucket `empresa_logos`, usuários/roles,
OAuth, issuer do MCP e comportamento funcional autenticado.
