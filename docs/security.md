# Segurança

## Objetivo

Proteger identidade, dados empresariais, cotações e operações administrativas,
mantendo o estado de produção auditável e reproduzível.

Este documento descreve o modelo vigente e as pendências. A análise detalhada de
origem está em `auditoria-inicial-seguranca-2026-07-27.md`.

## Fronteiras de confiança

| Fronteira         | Confiança                     | Regra                                                      |
| ----------------- | ----------------------------- | ---------------------------------------------------------- |
| Browser           | Não confiável                 | Validar no servidor/banco; estado visual não autoriza.     |
| JWT Supabase      | Condicional                   | Validar assinatura/claims e aplicar RLS.                   |
| Cloudflare Worker | Servidor confiável            | Segredos apenas em runtime e operações limitadas.          |
| `service_role`    | Altamente privilegiado        | Uso mínimo, server-side e com validação própria.           |
| Edge Function     | Servidor confiável            | Validar JWT, ação e propriedade dos recursos.              |
| PostgreSQL/RLS    | Autoridade de dados           | Grants, policies, constraints e RPCs são o controle final. |
| EmailJS           | Serviço externo               | Enviar apenas dados necessários e conteúdo codificado.     |
| Storage público   | Conteúdo publicamente legível | Restringir escrita, tipo, tamanho e caminho.               |

## Autenticação

- Supabase Auth gerencia e-mail/senha e OAuth;
- Server Functions recebem bearer token anexado pelo cliente;
- o middleware valida claims;
- administradores são identificados por `user_roles`;
- o painel possui timeout de 15 minutos;
- MFA é recomendado e sinalizado, mas não está imposto pela aplicação.

O rate limit atual opera por IP. Ele não deve bloquear um e-mail com base em
telemetria controlada pelo próprio chamador.

## Autorização

### Usuário

- lê e altera apenas recursos autorizados por RLS;
- carrinho, empresa, cotações e solicitações são vinculados a `auth.uid()`;
- não atribui roles diretamente;
- não executa funções internas de trigger;
- não chama RPCs exclusivas de `service_role`.

### Administrador

- precisa de sessão válida;
- `verifyAdminAccess` consulta `has_role` no servidor;
- policies e RPCs repetem a autorização no banco;
- nenhuma operação administrativa deve confiar em parâmetro `_admin_id`.

### Anônimo

Deve acessar somente catálogo público e endpoints públicos planejados. Tabelas
privadas não podem ficar disponíveis por grants default.

## Proteções aplicadas

Migration P0 de 28/07/2026:

- `has_role` não recursiva e com `search_path` seguro;
- policies históricas recursivas removidas;
- overload legado de resposta removido;
- grants explícitos para tabelas e sequences;
- default privileges restritos;
- funções privilegiadas com `PUBLIC` revogado;
- operações administrativas vinculadas a `auth.uid()`.

Migrations complementares:

- claim atômico para notificação inicial;
- validações positivas de quantidade e preço;
- allowlist de alteração empresarial;
- limite de tamanho do valor proposto;
- validação do caminho da logo.

Código complementar:

- escape HTML em notificações;
- redução do risco de envenenamento do rate limit;
- filtro de arquivos sensíveis no build;
- verificação pós-build fail-closed para variáveis públicas do Supabase.

## Segredos

Segredos nunca devem aparecer em:

- Git;
- documentação;
- mensagens de erro públicas;
- bundle do browser;
- parâmetros de URL;
- screenshots;
- histórico de comandos compartilhado.

Uma senha do usuário PostgreSQL foi compartilhada em conversa durante a
investigação. O proprietário a rotacionou e, em 30/07/2026, a nova credencial
foi validada por conexão interativa ao Session Pooler do projeto
`porgyoqngtshxdxuwaft`. A credencial anterior não foi reutilizada no teste e
permanece proibida para novas consultas.

Durante a conexão Lovable de 06/08/2026, outra senha PostgreSQL foi colada no
chat da plataforma. O proprietário confirmou sua rotação no dashboard Supabase
no mesmo dia. A credencial exposta não foi reutilizada nem testada nesta
reconciliação.

O cliente gerado automaticamente pelo Lovable também incorporou a configuração
pública diretamente no fonte e removeu a falha fechada para ausência de
`VITE_SUPABASE_*`. A versão reconciliada rejeita essa alteração: URL e
publishable key continuam fornecidas pelo ambiente, e o build falha se o ref
canônico não estiver presente ou se outro ref Supabase for incorporado.

## Estado dos achados

| ID     | Estado em 29/07/2026                   | Próxima evidência                                                |
| ------ | -------------------------------------- | ---------------------------------------------------------------- |
| AUD-01 | Parcial                                | Catálogo e testes registrados; código versionado.                |
| AUD-02 | Replay bloqueado na migration de parceiros | Reconciliar produção antes de qualquer migration corretiva.      |
| AUD-03 | Aplicado, não retestado funcionalmente | Matriz de grants do catálogo remoto.                             |
| AUD-04 | Aplicado, não retestado funcionalmente | Admin=true e usuário comum=false sem recursão.                   |
| AUD-05 | Parcial                                | Concorrência e outbox por destinatário.                          |
| AUD-06 | Parcial                                | Snapshots server-side e limites.                                 |
| AUD-07 | Implementado localmente                | Deploy Cloudflare e teste de abuso.                              |
| AUD-08 | Pendente                               | Quota e destinatário verificado.                                 |
| AUD-09 | Pendente                               | Submissão e outbox transacionais.                                |
| AUD-10 | Parcial                                | Limites MIME/tamanho e validação de conteúdo.                    |
| AUD-11 | Parcial                                | Constraints restantes e backfill.                                |
| AUD-12 | `fast-uri` corrigido e validado localmente | Revisar o diff; tratar 16 registros residuais por lotes.         |
| AUD-13 | CI local e remoto validado               | Manter os gates e adicionar replay SQL após sanear a trilha.     |

Em 11/08/2026, a resolução transitiva de `fast-uri` foi atualizada isoladamente
de `3.1.4` para `3.1.5`. O audit online passou de 17 para 16 registros no total e
de 15 para 14 com `--omit=dev`; `fast-uri` não aparece mais nos relatórios. A
alteração permanece na branch local, sem push ou deploy. Os gates de typecheck,
lint, build e inspeção do bundle passaram; os avisos não bloqueantes do build
permanecem documentados em `operations.md`.

## Testes funcionais mínimos

Executar em staging quando existir; para produção, usar contas de teste aprovadas
e operações reversíveis.

1. usuário comum lê apenas o próprio role;
2. `has_role(uid, admin)` retorna `false` para usuário comum;
3. retorna `true` para admin sem recursão;
4. usuário comum não escreve `user_roles`;
5. anônimo não acessa tabelas privadas;
6. usuário A não acessa empresa/carrinho/cotação de B;
7. usuário só cria solicitação para a própria empresa e campo permitido;
8. admin consegue listar e responder cotação;
9. duas respostas simultâneas geram uma transição;
10. duas notificações simultâneas geram um único envio lógico;
11. `PUBLIC` não executa funções `SECURITY DEFINER`;
12. upload inválido é rejeitado no servidor.

## Processo de mudança de segurança

1. descrever ameaça e ativo;
2. coletar evidência remota somente leitura;
3. definir controle e rollback;
4. implementar migration/código;
5. validar em ambiente seguro;
6. aplicar com autorização;
7. testar como cada papel;
8. guardar resultados sem dados pessoais;
9. atualizar este documento e o bloco de evidência;
10. versionar antes de iniciar nova feature.

## Bloco ativo

O trabalho prioritário iniciado em 29/07/2026 está em
`security/priority-block-2026-07-29.md`.

Em 10/08/2026, o PR #1 foi mesclado em `main` no commit
`0dcc6c37b6f56a211911b0d1edc5e1900a2ad1de`. O Quality de `main` passou e o
Lovable registrou esse commit como publicado e `ready`; home e health responderam
HTTP 200. A inspeção dos assets públicos, porém, não revelou o project ref
Supabase, portanto o backend efetivo, OAuth, issuer do MCP e fluxos autenticados
permanecem não confirmados. A auditoria de banco continua na consulta funcional
1c; os passos posteriores não estão autorizados antes de 1c e 1d.

O gate fail-closed do bundle também é específico por plataforma: Vercel valida
`.vercel/output/static`, Cloudflare valida `.output/public` e GitHub Pages valida
`dist/github-pages/client`. Isso impede que um diretório antigo de outro preset
produza falso sucesso ou falso diagnóstico. A remoção local de `bun.lock`
preserva npm `11.18.0` e `package-lock.json` como contrato único; não houve
upgrade de dependências, alteração de segredo, publicação ou mudança remota.

Em 10/08/2026, as seis variáveis Supabase foram configuradas somente no Preview
da Vercel para todas as branches Preview e marcadas como `sensitive`. O frontend
usa a chave `publishable` moderna; o servidor usa a chave `secret` moderna sob o
nome de compatibilidade `SUPABASE_SERVICE_ROLE_KEY`. Nenhum valor foi registrado
em log, chat, arquivo ou commit. Naquele gate, Production, Development e
Cloudflare não foram alterados. O Preview posterior do commit
`815a6a484ffea47ec409ac2ee8626173cd33b11a` passou no verificador, mas o smoke
funcional permaneceu bloqueado pela proteção da Vercel.

Em um gate posterior de 10/08/2026, o Cloudflare recebeu somente
`SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` como segredos de runtime. Nenhum
`service_role` foi adicionado. A versão
`1db139bb-8d60-4d18-b4fa-f0c472cc986d` foi publicada com 100% do tráfego, e o
health check estável e o imutável retornaram HTTP 200 `{"status":"ok"}`. Isso
prova a configuração mínima e a chamada básica ao Auth, não a matriz de
autorização ou os fluxos autenticados. O bundle cliente ativo ainda não contém a
chave moderna `sb_publishable_*` e inclui um JWT `anon` cujo `ref` e issuer não
correspondem ao projeto canônico; os valores não foram expostos. Portanto, o
runtime de servidor está reconciliado, mas o cliente Cloudflare requer novo
build e validação em gate próprio.

Esse gate foi executado em seguida: as três variáveis `VITE_SUPABASE_*` do build
foram rotacionadas sem exposição, e o build de produção
`12174877-dfaa-4d22-bfb3-f82420734ec9` publicou a versão
`f65c358c-bcb0-4d2b-9f19-a29641a8b1dd`. A inspeção do bundle servido confirmou
o ref canônico, a chave moderna `sb_publishable_*` e nenhuma chave `anon`
divergente; os dois secrets de runtime permaneceram vinculados. Home e health
estável/imutável responderam HTTP 200. Nenhum `service_role` foi adicionado.

O verificador publicado no SHA desse deploy ainda aceita qualquer literal com
formato JWT como publishable key e não decodifica seu `ref`; por isso, a inspeção
sanitizada foi mantida como evidência adicional. Em 10/08/2026, o script foi
endurecido localmente para decodificar apenas JWTs `anon`, associar o token ao
project ref por `ref` ou issuer e rejeitar refs divergentes mesmo na presença de
uma chave moderna válida. Cinco testes automatizados, lint, typecheck e build
local passaram. A proteção foi versionada localmente nesta branch, mas ainda não
foi enviada nem publicada e, portanto, não altera a evidência nem o artefato
remoto atual.

O deployment Vercel Production de `main` continua falhando fechado por ausência
das duas variáveis públicas no escopo Production. GitHub Pages falhou em
`npm ci`; e Supabase Preview encontrou o trigger `set_partners_updated_at` já
existente. Esses resultados ainda impedem classificar toda a cadeia de entrega
como verde, mesmo com o cliente e o health Cloudflare reconciliados e o Quality
aprovado.

Durante a tentativa de smoke protegido, a CLI Vercel criou indevidamente o
projeto `itasafety-reconcile-20260806` e um token de bypass. A operação foi
interrompida, o projeto foi excluído com autorização, os artefatos locais de
vínculo foram removidos e nenhum valor de token foi exposto. O PR documental
[#2](https://github.com/FeeSz/itasafety/pull/2) permanece aberto para registrar
essa reconciliação; cada novo commit precisa de seu próprio Quality.
