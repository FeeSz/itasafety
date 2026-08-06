# Documentação da ItaSafety

Este diretório é a fonte de contexto técnico e funcional do projeto. O código
continua sendo a fonte de verdade do comportamento implementado. O project ref
canônico de produção é `porgyoqngtshxdxuwaft`. Em 06/08/2026, o vínculo externo
foi selecionado no Lovable e o catálogo canônico foi reconhecido, mas o runtime
publicado ainda não foi validado após a troca — ver
[Migração de backend](decisions/0003-migracao-backend-supabase-canonico.md).


## Ordem recomendada de leitura

1. [Produto](product.md) — o que é a ItaSafety, atores e jornadas.
2. [Arquitetura](architecture.md) — sistemas, fronteiras e fluxo de requisições.
3. [Frontend](frontend.md) — rotas, componentes, estado e contratos.
4. [Backend](backend.md) — banco, RLS, RPCs, Edge Functions e integrações.
5. [Segurança](security.md) — modelo de proteção, estado da auditoria e prioridades.
6. [Operações](operations.md) — ambiente, build, deploy, migrations e incidentes.
7. [Padrão de documentação](feature-documentation-standard.md) — definição de pronto.

## Documentos de evidência

- [Auditoria inicial de segurança — 27/07/2026](auditoria-inicial-seguranca-2026-07-27.md)
- [Bloco prioritário — 29/07/2026](security/priority-block-2026-07-29.md)
- [Decisão 0001 — documentação como parte da entrega](decisions/0001-documentation-as-code.md)

## Fontes de verdade

| Tema                       | Fonte primária                                                       | Observação                                                    |
| -------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| Comportamento da aplicação | `src/`                                                               | Validar também o deploy ativo.                                |
| Schema TypeScript          | `src/integrations/supabase/types.ts`                                 | Deve ser regenerado do schema `public` remoto.                |
| Evolução futura do banco   | `supabase/migrations/`                                               | Migration aplicada não pode ser reescrita.                    |
| Estado real de produção    | catálogo remoto Supabase                                             | Arquivos locais isolados não comprovam produção.              |
| Edge Function              | `supabase/functions/` e versão implantada                            | Confirmar versão e, quando necessário, comparar fonte remoto. |
| Processo de deploy         | `package.json`, `vite.config.ts`, `wrangler.jsonc` e `operations.md` | O artefato efetivo é gerado em `.output/`.                    |
| Regras de trabalho         | `AGENTS.md`                                                          | Vale para todo o repositório.                                 |

## Convenções de estado

- `implementado`: existe no código local;
- `aplicado`: há evidência de aplicação no serviço remoto;
- `implantado`: a versão executável está publicada;
- `validado`: passou pelo teste funcional previsto;
- `não confirmado`: não há evidência suficiente;
- `pendente`: ação necessária e ainda não concluída.

Esses termos não são intercambiáveis. Uma migration local pode estar implementada
sem estar aplicada; uma Edge Function pode estar implantada sem o fonte estar
versionado; um controle aplicado pode continuar não validado.

## Atualização

Todo pull request ou bloco de trabalho deve revisar os documentos afetados. O
checklist completo está em `feature-documentation-standard.md`.
