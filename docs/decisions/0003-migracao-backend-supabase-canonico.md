# 0003 — Migração do backend para o Supabase canônico `porgyoqngtshxdxuwaft`

Data: 03/08/2026
Status: `decidido, não executado` (ações remotas congeladas)

## Contexto

A documentação do projeto sempre descreveu `porgyoqngtshxdxuwaft` como o projeto
Supabase de produção. A verificação de 03/08/2026 mostrou que o runtime **não**
está conectado a esse ref.

Estado efetivo verificado:

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
  - build: `vite.config.ts` inlina as três variáveis públicas e
    `scripts/verify-build-env.mjs` bloqueia publish se elas não estiverem no
    bundle;
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

`não confirmado`: paridade de schema, enums, RPCs, RLS, grants e bucket
`empresa_logos` no projeto `porgyoqngtshxdxuwaft`. A confirmação exige leitura do
catálogo remoto após a conexão ser autorizada.
