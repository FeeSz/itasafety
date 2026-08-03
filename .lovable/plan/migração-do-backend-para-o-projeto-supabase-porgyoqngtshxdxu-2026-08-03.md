# Migração do backend para o projeto Supabase `porgyoqngtshxdxuwaft`

Análise somente leitura. Nenhum arquivo do projeto, banco, migration ou publicação foi alterado.

## 1) Backend efetivamente conectado hoje

- O app está conectado ao **backend gerenciado do Lovable Cloud**, cujo project ref começa com `wdudf…` (valor lido de `.env`, não exibido por completo).
- `porgyoqngtshxdxuwaft` aparece **apenas em documentação e em `supabase/config.toml`**: `AGENTS.md`, `README.md`, `docs/*`, scripts históricos em `supabase/`. Nenhum código de runtime aponta para ele.
- Runtime e build leem exclusivamente:
  - cliente browser: `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (`src/integrations/supabase/client.ts`);
  - servidor: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (`client.server.ts`, `auth-middleware.ts`, `api/public/health.ts`);
  - build: `vite.config.ts` inlina `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, e `scripts/verify-build-env.mjs` bloqueia publish se não estiverem no bundle.
- Auth/OAuth: login e-mail/senha mais Google/Apple através do gate gerenciado, mais rota de consentimento `src/routes/[.]lovable.oauth.consent.tsx`.
- Issuer do MCP: `src/lib/mcp/index.ts` deriva `https://<VITE_SUPABASE_PROJECT_ID>.supabase.co/auth/v1`. Ou seja, o issuer segue automaticamente a variável — hoje aponta para o projeto do Cloud, não para `porgyoqngtshxdxuwaft`.
- Consequência: **todos os dados atuais de produção (empresas, cotações, produtos, usuários, roles) vivem no projeto do Cloud**, não no ref canônico da documentação.

## 2) Passos necessários para apontar runtime e build a `porgyoqngtshxdxuwaft`

1. **Decisão de vínculo.** O Lovable Cloud não pode ser desligado neste projeto. Apontar para um projeto Supabase próprio exige usar a conexão de Supabase externo (BYO) na configuração do projeto, autorizada pelo proprietário. Sem isso, as variáveis gerenciadas voltam a ser reescritas em cada build.
2. **Rebind das variáveis** (feito pela plataforma ao conectar, não por edição manual de `.env`): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` passam a ser do ref canônico.
3. **Paridade de schema no destino.** Confirmar no projeto destino: tabelas (`empresas`, `cotacoes`, `cotacao_itens`, `cotacao_historico_status`, `cotacao_notificacoes`, `carrinho_cotacao`, `empresa_change_requests`, `partners`, `products`, `categories`, `brands`, `app_settings`, `auth_attempts`, `user_roles`), enums, triggers, RPCs (`has_role`, `marcar_em_analise`, `responder_cotacao`, `aprovar_change_request`, `atualizar_logo_empresa`), RLS + grants, e bucket `empresa_logos`. Qualquer diferença exige migration nova — proposta, não aplicada, enquanto o congelamento vigorar.
4. **Migração de dados**, se os dados atuais precisarem seguir: export/import por tabela respeitando ordem de FK, mais decisão sobre usuários de `auth.users` (IDs de usuário não migram sozinhos; roles e `empresas.user_id` dependem deles).
5. **Auth/OAuth no destino:** habilitar provedores Google/Apple, definir Site URL e allow-list de redirect (`https://itasafety.lovable.app`, preview, `itasafety.com.br`, `/.lovable/oauth/consent`, `/auth/callback`), reativar o servidor OAuth e conferir emissão de chaves assimétricas (JWKS) para o MCP.
6. **MCP:** com `VITE_SUPABASE_PROJECT_ID` novo, o issuer muda automaticamente; validar `/.well-known/oauth-protected-resource` e `/mcp` após o rebind e regenerar o manifest.
7. **Documentação e limpeza:** atualizar `docs/backend.md`, `docs/architecture.md`, `docs/operations.md`, `docs/security.md` e `AGENTS.md` para descrever o backend real, e revisar `supabase/config.toml`.
8. **Rebuild + publish** com `verify-build-env` verde, após validação.

## 3) O que o agente pode fazer vs. o que exige o proprietário

Agente (após liberação, dentro do escopo autorizado):
- inventário e diff de schema entre origem e destino (leitura);
- redação de migrations de paridade, sem aplicar;
- scripts de export/import de dados e checklist de validação;
- ajuste de documentação e de `supabase/config.toml`;
- verificação pós-troca de rotas, health, MCP e login.

Proprietário no painel/configurações:
- autorizar a conexão do Supabase externo `porgyoqngtshxdxuwaft` ao projeto (única forma de trocar o vínculo);
- fornecer credenciais **apenas** pelos campos seguros da plataforma, nunca no chat;
- habilitar Google/Apple, Site URL e redirects no projeto destino;
- criar/ajustar bucket de storage e políticas onde o painel for necessário;
- autorizar o descongelamento de migrations e o publish.

## 4) Pré-requisitos, riscos, rollback e validações

Pré-requisitos: acesso de owner ao ref canônico; backup recente de ambos os projetos; definição sobre migrar ou não usuários e dados; janela de manutenção; descongelamento explícito antes de qualquer escrita remota.

Riscos:
- **perda de sessões e de vínculo de usuário** — IDs de `auth.users` diferentes quebram `user_roles`, `empresas.user_id`, `cotacoes`;
- **divergência de schema/RLS** causando telas em branco ou erro de permissão;
- **OAuth/MCP fora do ar** se Site URL, redirects ou JWKS não estiverem prontos;
- **build bloqueado** por `verify-build-env` se as variáveis não forem inlinadas;
- **reversão do rebind** se o Cloud continuar gerenciando as variáveis;
- **dados órfãos** se export/import for parcial;
- **logo/anexos indisponíveis** sem o bucket `empresa_logos` no destino.

Rollback: reconectar o backend do Cloud (dados originais preservados, pois a migração é cópia, não movimentação), reverter variáveis, republicar a build anterior conhecida como boa, e desfazer somente alterações de documentação. Nenhuma migration deve ser editada; correções sempre por versão nova.

Validações após a troca: `/api/public/health` 200; login e-mail/senha, Google e Apple; `/admin/status`; leitura pública de `partners`/`products`; fluxo de cotação ponta a ponta; teste de RLS para `anon`, usuário A vs. B, admin; `/.well-known/oauth-protected-resource` e `/mcp` com issuer do ref canônico; `verify-build-env` verde no build.

## Questões abertas

1. Os dados atuais do Cloud devem ser migrados para `porgyoqngtshxdxuwaft`, ou o destino já é a fonte de verdade?
2. Usuários e roles devem ser migrados, ou os clientes farão novo cadastro?
3. Deseja que eu prepare já os scripts de diff/export (sem executar escrita remota)?
