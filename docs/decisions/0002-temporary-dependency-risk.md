# 0002 — Tratamento temporário de advisories sem upgrade compatível

- Status: aceita
- Data: 29/07/2026

## Contexto

AUD-12 identificou advisories em dependências transitivas de MCP, build e lint.
As correções disponíveis exigem uma major do consumidor ou um override fora do
intervalo semver declarado. Aplicar `npm audit fix --force` misturaria correção
de segurança com migração de toolchain e dificultaria atribuir regressões.

## Decisão

Não aplicar majors nem overrides automáticos nesta etapa. Manter os caminhos
afetados sob mitigação, registrar a exposição real e executar cada migração
major em bloco próprio com typecheck, lint, build e smoke test.

O servidor local Windows não deve ser publicado em rede não confiável. Uma nova
consulta online e a revisão dos upstreams são gates obrigatórios antes de
release ou deploy.

## Consequências positivas

- evita quebra silenciosa do build e dos plugins;
- separa risco de runtime de risco de tooling;
- mantém o estado atual reproduzível pelo lockfile;
- estabelece critérios objetivos para retirar a exceção.

## Consequências negativas

- caminhos vulneráveis continuam presentes no lockfile;
- scanners continuam reportando risco residual;
- desenvolvimento local exige mitigação operacional;
- a decisão precisa ser revisada quando os upstreams mudarem.

## Alternativas consideradas

- `npm audit fix --force`: rejeitado por introduzir ESLint 10 sem migração
  controlada;
- override de Hono/esbuild: rejeitado por ultrapassar o contrato semver dos
  consumidores;
- ignorar os advisories: rejeitado porque ocultaria o risco e impediria revisão
  verificável.

## Critério de revisão

Revisar antes de qualquer release/deploy e quando ocorrer um destes eventos:

- MCP SDK aceitar `@hono/node-server >=2.0.5`;
- Vite suportado remover `esbuild@0.27.x`;
- o ecossistema de plugins usado pelo projeto suportar ESLint 10;
- um novo advisory ampliar a superfície ou severidade;
- o servidor de desenvolvimento precisar ser acessível em rede compartilhada.

## Revisão de 13/08/2026

A decisão permanece aceita para caminhos cuja correção ainda exija major,
override incompatível ou migração estrutural. Ela não impede correções
transitivas compatíveis, isoladas e verificáveis.

O audit atual identificou `fast-uri@3.1.4` em AJV, alcançando o bundle do Worker,
com correção compatível em `3.1.5`. A resolução foi atualizada somente no
lockfile, sem dependência direta, override, `npm audit fix --force` ou mudança
major. Os demais advisories permanecem sujeitos aos gates desta decisão.
