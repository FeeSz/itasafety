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
| AUD-12 | Triado online, risco residual aceito   | Remover exceção por upgrades major isolados.                     |
| AUD-13 | CI local e remoto validado               | Manter os gates e adicionar replay SQL após sanear a trilha.     |

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
em log, chat, arquivo ou commit. Production, Development e Cloudflare não foram
alterados nessa configuração. O Preview posterior do commit
`815a6a484ffea47ec409ac2ee8626173cd33b11a` passou no verificador, mas o smoke
funcional permaneceu bloqueado pela proteção da Vercel.

O deployment Vercel Production de `main` falhou fechado por ausência das duas
variáveis públicas no escopo Production. Cloudflare também falhou sem diagnóstico
público; GitHub Pages falhou em `npm ci`; e Supabase Preview encontrou o trigger
`set_partners_updated_at` já existente. Esses resultados impedem classificar a
cadeia de entrega como verde, mesmo com o Quality aprovado.

Durante a tentativa de smoke protegido, a CLI Vercel criou indevidamente o
projeto `itasafety-reconcile-20260806` e um token de bypass. A operação foi
interrompida, o projeto foi excluído com autorização, os artefatos locais de
vínculo foram removidos e nenhum valor de token foi exposto. O PR documental
[#2](https://github.com/FeeSz/itasafety/pull/2) permanece aberto para registrar
essa reconciliação; cada novo commit precisa de seu próprio Quality.
