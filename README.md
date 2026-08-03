# ItaSafety

Plataforma B2B da ItaSafety para apresentação de Equipamentos de Proteção
Individual (EPIs), relacionamento com empresas e gestão do ciclo de cotações.

O produto combina:

- catálogo público de produtos, categorias, marcas e parceiros;
- autenticação por e-mail e provedores OAuth;
- cadastro e aprovação de empresas;
- carrinho de cotação persistente;
- envio, acompanhamento e resposta de cotações;
- painel administrativo;
- notificações transacionais;
- endpoints de saúde, SEO e uma interface MCP para consulta do catálogo.

> Estado documental revisado em 29/07/2026. Afirmações comerciais como tempo de
> mercado, número de clientes e volume do catálogo ainda precisam de validação
> formal da área de negócio; consulte `docs/product.md`.

## Arquitetura resumida

```text
Browser
  ├─ TanStack Router + React + React Query
  ├─ Supabase JS com JWT do usuário
  └─ Server Functions com bearer token
          │
          ▼
Cloudflare Worker / TanStack Start
  ├─ SSR e rotas de servidor
  ├─ verificação administrativa
  ├─ rate limit de autenticação
  └─ endpoint público de saúde e MCP
          │
          ▼
Supabase (ref canônico pretendido: porgyoqngtshxdxuwaft;
         vínculo efetivo em 03/08/2026: Supabase do Lovable Cloud)
  ├─ Auth
  ├─ PostgreSQL + RLS + grants + RPCs
  ├─ Storage
  └─ Edge Function enviar-notificacao-cotacao
          │
          ▼
EmailJS
```

## Stack principal

- React 19, TypeScript e Vite;
- TanStack Start, Router e React Query;
- Tailwind CSS e componentes Radix UI;
- Supabase Auth, PostgreSQL, Storage e Edge Functions;
- Cloudflare Workers/Nitro para a aplicação;
- EmailJS para notificações;
- Lovable MCP para exposição controlada do catálogo.

## Desenvolvimento local

Pré-requisitos:

- Node.js compatível com as dependências do projeto;
- dependências instaladas por `npm install`;
- `.env.local` com as variáveis públicas e de servidor necessárias.

```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

O build gera `.output/` e executa `scripts/verify-build-env.mjs`, que confirma a
presença das variáveis públicas do Supabase no bundle e procura padrões de
credenciais não permitidas.

Não inclua valores de segredos em documentação. A lista de nomes de variáveis está
em `docs/operations.md`.

## Documentação

O índice e a ordem recomendada de leitura estão em [docs/README.md](docs/README.md).

- [Produto e jornadas](docs/product.md)
- [Arquitetura](docs/architecture.md)
- [Frontend](docs/frontend.md)
- [Backend e modelo de dados](docs/backend.md)
- [Segurança](docs/security.md)
- [Operação e deploy](docs/operations.md)
- [Padrão obrigatório para documentar features](docs/feature-documentation-standard.md)
- [Auditoria inicial de segurança](docs/auditoria-inicial-seguranca-2026-07-27.md)

## Regras de contribuição

Antes de considerar uma alteração concluída:

1. atualize a documentação do domínio afetado;
2. execute build, typecheck e lint;
3. documente qualquer falha preexistente;
4. para banco, use migrations novas e confirme o estado remoto;
5. registre deploy, evidências e pendências.

As regras permanentes para agentes e automações estão em `AGENTS.md`.
