# Operações

## Ambientes e serviços

| Componente         | Ambiente conhecido                          |
| ------------------ | ------------------------------------------- |
| Aplicação Lovable  | `https://itasafety.lovable.app/`            |
| Aplicação Vercel   | `https://itasafety.vercel.app/`             |
| Desenvolvimento    | `http://localhost:8080/`                    |
| Site legado        | `https://itasafety.com.br/`                 |
| Aplicação          | Cloudflare Worker `itasafety`               |
| Banco/Auth/Storage | Supabase project ref `porgyoqngtshxdxuwaft` |
| Edge Function      | `enviar-notificacao-cotacao`                |
| E-mail             | EmailJS                                     |
| Build alternativo  | GitHub Pages em `/itasafety/`               |

Domínios, contas e IDs devem ser confirmados no painel antes de uma operação
destrutiva ou deploy.

Uso atual:

- Lovable é a referência remota principal para smoke tests e testes autenticados;
- Vercel é uma implantação secundária/preview;
- localhost é usado para desenvolvimento e testes locais;
- `itasafety.com.br` pertence ao site antigo e será retirado somente depois da
  conclusão e migração controlada para o projeto novo.

Em 29/07/2026:

- Lovable respondeu `200` na home e `200 {"status":"ok"}` no health check;
- localhost respondeu `200` na home e `200 {"status":"ok"}` no health check;
- Vercel respondeu `200` na home, mas `503 {"status":"degraded"}` no health
  check.

O Vercel não deve ser considerado saudável para fluxos de backend até que suas
variáveis e conectividade sejam reconciliadas.

## Variáveis de ambiente

### Públicas, embutidas no frontend

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_PUBLISHABLE_KEY`;
- `VITE_SUPABASE_PROJECT_ID`;
- `VITE_SITE_URL`;
- opcional: `VITE_SENTRY_DSN`.

Publishable key é própria para cliente, mas continua sujeita a rotação e não deve
ser confundida com `service_role`.

### Servidor da aplicação

- `SUPABASE_URL`;
- `SUPABASE_PUBLISHABLE_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `SITE_URL`;
- opcional: `SENTRY_DSN`.

### Edge Function

- `SUPABASE_URL`;
- `SUPABASE_ANON_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `SITE_URL`;
- `ADMIN_QUOTES_EMAIL`;
- `EMAILJS_SERVICE_ID` ou variante administrativa;
- `EMAILJS_PUBLIC_KEY` ou variante administrativa;
- `EMAILJS_PRIVATE_KEY` ou variante administrativa;
- IDs de template de nova cotação, resposta e devolução.

Os valores ficam em gerenciadores de segredo, nunca no repositório.

## Desenvolvimento

```bash
npm install
npm run dev
```

O arquivo local esperado é `.env.local`, ignorado pelo Git.

## Gates locais

```bash
npm run build
npx tsc --noEmit
npm run lint
npm audit
```

Estado observado em 28/07/2026:

- build: passa;
- typecheck: falha;
- lint: falha;
- audit offline: sem achados no cache, não equivalente a consulta online atual.

Uma entrega não deve ocultar essas falhas. Até os gates serem saneados, registre
se o erro é novo ou preexistente.

## Build

`npm run build`:

1. executa Vite/TanStack Start;
2. gera cliente e Worker em `.output`;
3. filtra arquivos de `public`;
4. roda `verify-build-env.mjs`.

O verificador deve falhar se as variáveis públicas obrigatórias estiverem ausentes
ou se padrões de credenciais inesperadas aparecerem no bundle.

## Deploy da aplicação

```bash
npm run deploy
```

Esse comando faz um novo build e publica usando:

```text
.output/server/wrangler.json
```

Antes:

- confirmar conta Cloudflare e Worker de destino;
- revisar `git diff` e documentação;
- executar gates;
- confirmar secrets;
- registrar versão anterior.

Depois:

- consultar deployment ativo;
- abrir `/api/public/health`;
- testar home, autenticação e uma rota protegida;
- registrar timestamp, versão e resultado.

Enquanto não houver domínio canônico definitivo, repetir esses testes em Lovable
e Vercel e identificar explicitamente qual URL foi validada.

## Supabase

### Ver vínculo

O project ref deve ser `porgyoqngtshxdxuwaft`. Arquivos sob `supabase/.temp`
são metadados locais ignorados pelo Git; não são prova suficiente do destino.
Confirme também a saída da própria CLI antes de aplicar.

### Migrations

Regras:

1. consultar estado remoto;
2. criar arquivo novo em `supabase/migrations/`;
3. nunca reescrever uma migration aplicada;
4. revisar locks, backfill e compatibilidade;
5. aplicar;
6. listar histórico remoto;
7. consultar objetos alterados;
8. regenerar tipos;
9. executar testes por papel;
10. documentar evidências e rollback.

### Tipos

Gerar apenas o schema público:

```bash
npx supabase gen types typescript --linked --schema public
```

Compare antes de substituir. Divergência inesperada exige investigação.

### Edge Function

Deploy da Edge Function e migration são etapas distintas. Após implantar:

- confirmar status e versão;
- conferir `verify_jwt`;
- executar smoke test autenticado;
- testar falha parcial e concorrência;
- não inferir igualdade de fonte somente pelo número da versão.

## Rotação de credencial do banco

Quando uma senha de banco for exposta:

1. interromper seu uso;
2. identificar todos os consumidores;
3. gerar nova senha forte no painel Supabase;
4. atualizar secret managers e ferramentas autorizadas;
5. invalidar a senha anterior;
6. testar conexões;
7. registrar somente data, responsáveis e resultado;
8. nunca registrar a senha nova.

A rotação pode causar indisponibilidade se consumidores não forem inventariados.
Por isso, exige coordenação do proprietário do projeto.

## Backups e rollback

Antes de migration de risco:

- confirmar backup/PITR disponível;
- preferir mudanças aditivas;
- separar remoções destrutivas;
- documentar rollback lógico;
- estimar lock de tabela;
- evitar DDL extensa no pico.

Rollback de código não reverte automaticamente schema.

## Observabilidade

Disponível:

- logs do Worker;
- logs da Edge Function;
- logs e painéis Supabase;
- `/api/public/health`;
- tela `/admin/status`.

Pendente:

- integração real com Sentry;
- alertas de volume EmailJS;
- alertas de erro por action;
- métricas de claim abandonado;
- correlação de cotação sem expor dados pessoais.

## Arquivos temporários e perfis

- não copie perfil de Chrome/Playwright ou sessão CLI para tentar contornar login;
- se uma cópia temporária for indispensável, informe antes origem, destino,
  conteúdo, motivo, retenção e descarte;
- não apague material do usuário sem autorização;
- prefira diretórios efêmeros controlados e registre o que foi criado;
- perfis Supabase CLI ou browser podem conter tokens e devem ser tratados como
  segredos.

## Registro de incidente

Documente:

- data e timezone;
- serviço afetado;
- detecção;
- impacto;
- linha do tempo;
- contenção;
- causa;
- correção;
- validação;
- ações preventivas;
- evidências sem segredos ou dados pessoais.
