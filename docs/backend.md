# Backend

## Componentes

O backend está distribuído em três fronteiras:

1. Cloudflare Worker/TanStack Start;
2. Supabase PostgreSQL, Auth e Storage;
3. Supabase Edge Function para notificações.

O projeto Supabase de produção usa o project ref:

```text
porgyoqngtshxdxuwaft
```

Não registre neste documento senha, connection string completa, JWT, anon key,
publishable key ou `service_role`.

## Cloudflare e Server Functions

### `verifyAdminAccess`

- exige bearer token;
- valida claims Supabase;
- chama `has_role` sob o contexto autenticado;
- protege a árvore `/admin`.

### `checkAuthRateLimit`

- conta falhas pelo IP observado pelo servidor;
- janela atual: 15 minutos;
- limite atual: 20 falhas;
- falha aberta se o cliente administrativo não estiver configurado.

### `recordAuthAttempt`

- registra telemetria de login/cadastro/recuperação;
- obtém o IP do request;
- limita a 30 gravações por IP por minuto;
- campos informados pelo chamador não são usados para bloquear um e-mail
  específico.

### `/api/public/health`

Verifica apenas:

- existência das variáveis mínimas;
- capacidade de construir um cliente;
- chamada básica ao Auth.

Não deve retornar segredos, usuários, schema ou diagnósticos internos detalhados.

## Modelo de dados

Os tipos do schema `public`, regenerados e comparados com produção em 28/07/2026,
contêm as tabelas abaixo.

| Tabela                     | Responsabilidade                                                         |
| -------------------------- | ------------------------------------------------------------------------ |
| `app_settings`             | Configurações editáveis da aplicação.                                    |
| `auth_attempts`            | Telemetria e apoio ao rate limit de autenticação.                        |
| `brands`                   | Marcas do catálogo.                                                      |
| `carrinho_cotacao`         | Carrinho persistente por usuário e SKU.                                  |
| `categories`               | Categorias do catálogo.                                                  |
| `cotacao_historico_status` | Histórico imutável de transições.                                        |
| `cotacao_itens`            | Snapshots e preços dos itens solicitados.                                |
| `cotacao_notificacoes`     | Registros de entrega de resposta/devolução; integração ainda incompleta. |
| `cotacoes`                 | Cabeçalho, contato, status e condições comerciais.                       |
| `empresa_change_requests`  | Solicitações controladas de alteração cadastral.                         |
| `empresas`                 | Identidade empresarial vinculada ao usuário.                             |
| `partners`                 | Parceiros exibidos no site.                                              |
| `products`                 | Produtos publicados e administrados.                                     |
| `user_roles`               | Roles do usuário.                                                        |

### Enums

- `app_role`: `admin`, `editor`, `user`;
- `change_request_status`: `pendente`, `aprovada`, `rejeitada`;
- `cotacao_status`: `enviado`, `em_analise`, `respondido`, `devolvido`;
- `empresa_status`: `pendente_aprovacao`, `aprovada`, `rejeitada`;
- `notificacao_status`: `pendente`, `enviado`, `falhou`;
- `notificacao_tipo`: `respondido`, `devolvido`.

## RPCs

### `has_role(_user_id, _role)`

- `SECURITY DEFINER`;
- exige que `_user_id` corresponda a `auth.uid()`;
- consulta `user_roles` sem depender da policy recursiva removida;
- executável somente por `authenticated` e `service_role`;
- usa `search_path` explícito.

### `marcar_em_analise(_cotacao_id)`

Realiza a transição administrativa inicial da cotação. A autorização é validada
no banco.

### `responder_cotacao(...)`

- deriva o administrador de `auth.uid()`;
- aceita apenas transição para `respondido` ou `devolvido`;
- bloqueia cotações em estado incompatível;
- trava a cotação com `FOR UPDATE`;
- valida item e preço;
- registra responsável e instante da resposta.

A assinatura antiga que aceitava `_admin_id` foi removida pela migration de
contenção.

### `aprovar_change_request(p_request_id)`

Aplica uma solicitação pendente sob autorização administrativa e controle de
concorrência.

### `atualizar_logo_empresa(p_logo_url)`

Permite atualizar a URL apenas quando ela pertence ao bucket
`empresa_logos` e à pasta do próprio `auth.uid()`.

### `claim_nova_cotacao_notification`

Adquire um claim atômico para impedir duas execuções simultâneas da notificação
inicial. Claims abandonados expiram após dez minutos.

### `finalizar_nova_cotacao_notification`

Marca sucesso ou libera o claim após falha. Somente `service_role` pode chamar as
duas RPCs de claim/finalização.

## Grants e RLS

A migration `20260728150000_p0_security_containment.sql`:

- revoga privilégios default amplos para objetos futuros;
- revoga `CREATE` do schema `public` para papéis da aplicação;
- redefine uma matriz explícita de tabelas e colunas;
- revoga sequences e concede apenas o necessário;
- reserva manutenção ampla ao `service_role`;
- restringe execução de funções privilegiadas;
- remove policies recursivas de `user_roles`.

RLS e grants são controles complementares:

- grant determina se uma operação pode alcançar a tabela;
- RLS determina quais linhas são permitidas;
- RPCs controlam operações privilegiadas ou multi-etapa.

Não assumir que uma policy concede o privilégio correspondente.

## Integridade aplicada em 28/07/2026

- quantidade de item deve ser positiva;
- preço unitário é nulo ou positivo;
- `campo_alterado` possui allowlist;
- `valor_proposto` deve conter de 1 a 500 caracteres úteis;
- inserção de change request exige empresa do próprio usuário;
- resposta de cotação valida IDs e preços;
- URL de logo é limitada ao caminho do usuário.

Ainda faltam limites superiores, validação de CNPJ e contatos, revisão da FK de
usuário e limites server-side completos do Storage.

## Edge Function `enviar-notificacao-cotacao`

Endpoint protegido por JWT com duas ações.

### `nova_cotacao`

1. valida usuário;
2. lê uma cotação pertencente a ele;
3. exige status `enviado`;
4. adquire claim com cliente `service_role`;
5. escapa conteúdo usado em HTML;
6. envia mensagens ao cliente e ao admin por EmailJS;
7. finaliza ou libera o claim.

### `resposta_admin`

1. valida o JWT;
2. chama `responder_cotacao`;
3. relê a cotação;
4. escapa os campos;
5. envia resposta ou devolução ao contato.

A versão remota observada em 28/07/2026 era `ACTIVE`, versão 8. A listagem de
versão não equivale a uma comparação byte a byte do fonte.

## Storage

Bucket funcional:

- `empresa_logos`, público para leitura.

Policies vinculam escrita à pasta do usuário. Permanecem pendentes:

- `file_size_limit`;
- `allowed_mime_types`;
- verificação de assinatura/conteúdo;
- nomes gerados no servidor;
- revisão da necessidade de bucket público.

## Histórico e migrations

- apenas `supabase/migrations/` é a trilha canônica;
- scripts soltos em `supabase/` são históricos e não comprovam aplicação;
- migration aplicada não deve ser editada;
- correções usam nova versão;
- depois de aplicar, compare o schema remoto e regenere `types.ts`;
- guarde evidência do `migration list` e dos testes.

Existe hoje uma alteração local em
`20260717102600_auth_attempts_retention.sql`, apesar de essa versão já constar no
histórico remoto. O estado do job `purge_old_auth_attempts` deve ser confirmado e
qualquer correção precisa de migration nova.

Em 30/07/2026, um replay desde zero em PostgreSQL Supabase `17.6.1.143` aplicou
as 11 primeiras migrations e parou em
`20260708000000_create_partners.sql`. O terceiro statement compara
`user_roles.role` (`app_role`) com `'admin'::text` e retorna `SQLSTATE 42883`.
As migrations posteriores não foram exercitadas. Esse resultado comprova uma
falha da trilha histórica local, não o estado de produção; qualquer solução
continua condicionada à reconciliação remota e não autoriza reescrever a
migration aplicada.

## Pendências estruturais

- RPC transacional para criar cabeçalho, itens e outbox;
- outbox independente por destinatário e tipo;
- quota de cotação/e-mail;
- destinatário derivado de identidade verificada;
- constraints restantes de negócio;
- replay limpo de toda a trilha em banco efêmero;
- teste funcional autenticado de RLS;
- observabilidade e alertas de volume.

## Restauração do esquema de negócio — 02/08/2026

Estado: `aplicado` no projeto Supabase ativo do ambiente Lovable Cloud.

O banco ativo continha apenas `app_settings`, `auth_attempts`, `brands`, `categories`,
`products` e `user_roles`. As tabelas de negócio referenciadas pelo código estavam
ausentes, o que quebrava o typecheck e as telas de cotação, empresas e parceiros.

Objetos recriados em uma única migration:

- tabelas: `partners`, `empresas`, `empresa_change_requests`, `carrinho_cotacao`,
  `cotacoes`, `cotacao_itens`, `cotacao_historico_status`, `cotacao_notificacoes`;
- enums: `empresa_status`, `change_request_status`, `cotacao_status`,
  `notificacao_status`, `notificacao_tipo`;
- triggers: `tg_set_updated_at` nas tabelas com `updated_at`,
  `tg_cotacoes_resolver_empresa`, `log_cotacao_status_change`;
- RPCs: `marcar_em_analise`, `responder_cotacao` (assinatura com frete, validade e
  endereço de entrega), `atualizar_logo_empresa`, `aprovar_change_request`.

RLS habilitada em todas as tabelas, com grants explícitos: leitura anônima apenas em
`partners`; demais tabelas restritas a `authenticated` (escopo `auth.uid()`) e
`service_role`. Em `cotacoes`, `authenticated` recebe `UPDATE` apenas na coluna
`notificacao_enviada_em`.

Pendências: `não confirmado` o bucket de storage `empresa_logos` (não recriado nesta
migration) e a validação funcional ponta a ponta das telas de cotação.

## Reconciliação do vínculo — 03 a 06/08/2026

O runtime e o build consomem exclusivamente as
variáveis `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_SUPABASE_PROJECT_ID`. Em 06/08/2026, o
Lovable selecionou o projeto externo `porgyoqngtshxdxuwaft`, reconheceu seu
catálogo e gerou configuração apontando para esse ref. O issuer do MCP
(`src/lib/mcp/index.ts`) continua derivado de `VITE_SUPABASE_PROJECT_ID`.

Decisão registrada: `porgyoqngtshxdxuwaft` é a fonte de verdade dos dados de
negócio; não haverá cópia de dados a partir do Cloud, e usuários e roles serão
migrados preservando IDs. Sequência, responsabilidades, riscos, rollback e
validações estão em `decisions/0003-migracao-backend-supabase-canonico.md`.

Estado: o vínculo foi selecionado, mas o cliente automático que incorporava a
configuração no fonte foi rejeitado. A branch de reconciliação mantém resolução
por ambiente, falha fechada e tipos alinhados ao catálogo observado. Migrations,
publish e testes autenticados permanecem congelados; RLS, grants, OAuth, issuer
do MCP e o bucket `empresa_logos` continuam `não confirmados` funcionalmente.
