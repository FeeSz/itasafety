# AUD-12 — Triagem de dependências

**Data:** 29/07/2026  
**Ambiente:** workspace local Windows  
**Consulta npm online:** 29/07/2026 16:23 BRT  
**Supabase/Lovable/deploy:** não consultados nem alterados

## Objetivo

Classificar os advisories informados pelo `npm audit` por superfície de execução,
confirmar os caminhos no lockfile atual e evitar correções automáticas que
introduzam majors ou overrides incompatíveis.

Esta triagem não declara o projeto livre de vulnerabilidades. Depois de
consentimento específico do proprietário, o agente executou a consulta online
somente leitura e comparou o resultado completo com uma instalação que omite
`devDependencies`.

## Evidências usadas

- relatório online fornecido pelo proprietário depois de `npm audit fix`;
- `npm audit --json` online, após consentimento específico;
- `npm audit --omit=dev --json` online;
- `package.json` e `package-lock.json` atuais;
- `npm ls` e `npm explain`, sem alteração de pacotes;
- `npm audit --offline --json`;
- busca de imports no código e no bundle local `.output`;
- metadados públicos de versões específicas consultados com `npm view`;
- GitHub Advisory Database.

O audit offline retornou zero achados, confirmando que o cache local não continha
os advisories atuais. Somente o resultado online abaixo deve ser usado como
evidência desta etapa.

## Resultado online

Consulta completa:

| Severidade | Quantidade |
| ---------- | ---------: |
| Crítica    |          0 |
| Alta       |          5 |
| Moderada   |          3 |
| Baixa      |          1 |
| Total      |          9 |

Consulta com `--omit=dev`:

| Severidade | Quantidade |
| ---------- | ---------: |
| Crítica    |          0 |
| Alta       |          0 |
| Moderada   |          3 |
| Baixa      |          1 |
| Total      |          4 |

Os nove registros do npm não representam nove falhas independentes:

- os cinco registros altos pertencem à cadeia
  `eslint` → `minimatch` → `brace-expansion`;
- os três moderados pertencem à cadeia
  `@lovable.dev/mcp-js` → `@modelcontextprotocol/sdk` →
  `@hono/node-server`;
- o registro baixo é o advisory de esbuild.

## Matriz de triagem

| Advisory              | Caminho instalado                                                                               | Superfície atual                         | Conclusão                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GHSA-frvp-7c67-39w9` | `@lovable.dev/mcp-js@0.20.1` → `@modelcontextprotocol/sdk@1.28.0` → `@hono/node-server@1.19.17` | Dependência transitiva de runtime do MCP | A versão está no intervalo vulnerável `<2.0.5`, mas `@hono/node-server` não foi encontrado no bundle Cloudflare local. O cenário descrito exige servidor estático em Windows com middleware montado por prefixo; esse caminho não foi identificado na aplicação. Risco residual, sem correção compatível disponível na cadeia atual. |
| `GHSA-g7r4-m6w7-qqqr` | `@lovable.dev/mcp-js` e `vite@7.3.5` usam `esbuild@0.27.7`; Wrangler usa `0.28.1`               | Build e desenvolvimento local            | `0.27.7` está no intervalo afetado `>=0.27.3, <0.28.1`. O advisory exige o servidor próprio do esbuild em Windows; não há chamada direta a `esbuild.serve()` no projeto e o runtime publicado não contém esbuild. Risco de tooling, mantido sob mitigação.                                                                           |
| `GHSA-mh99-v99m-4gvg` | `eslint@9.39.4` → `minimatch@3.1.5` → `brace-expansion@1.1.16`                                  | Lint local/CI                            | Caminho exclusivo de desenvolvimento. A entrada é o conjunto de arquivos/globs do repositório, não uma requisição da aplicação. O fix automático propõe ESLint 10, uma major; não foi aplicado nesta etapa.                                                                                                                          |

## Compatibilidade das correções

### MCP/Hono

- `@lovable.dev/mcp-js@0.24.0` ainda fixa
  `@modelcontextprotocol/sdk@1.28.0`;
- `@modelcontextprotocol/sdk@1.29.0` ainda declara
  `@hono/node-server@^1.19.9`;
- atualizar apenas `mcp-js` não remove o advisory;
- forçar `@hono/node-server@2.x` por override atravessa uma major fora do contrato
  declarado pelo SDK.

### Vite/esbuild

- Vite 7.3.5 declara `esbuild@^0.27.0`;
- `esbuild@0.28.1` contém a correção, mas está fora desse intervalo;
- Vite 8 remove esbuild da dependência direta principal e o mantém como peer
  opcional, porém é uma atualização major do toolchain;
- override isolado de esbuild não foi adotado porque quebraria o contrato
  semver do consumidor.

### ESLint/brace-expansion

- ESLint 9.39.4 ainda depende de `minimatch@^3.1.5`;
- ESLint 10.8.0 usa `minimatch@^10.2.5`, cujo caminho instalado resolve
  `brace-expansion@5.0.8`;
- a migração para ESLint 10 deve ser tratada como etapa própria, com revisão de
  plugins, configuração e gate completo.

## Scripts de instalação

`npm install-scripts ls` informou cinco scripts ainda não cobertos por
`allowScripts`:

- três instalações de esbuild;
- uma instalação de workerd;
- uma segunda cópia de esbuild usada por Wrangler.

Nenhum script foi aprovado ou negado automaticamente. Antes de mudar essa
política, é necessário revisar a origem, a finalidade do postinstall e o impacto
em builds limpos.

## Decisão desta etapa

1. não executar `npm audit fix --force`;
2. não introduzir overrides que ultrapassem os intervalos semver dos
   consumidores;
3. não expor o servidor de desenvolvimento Windows a redes não confiáveis;
4. não aceitar globs/padrões controlados por usuários em ferramentas de lint;
5. preservar o lockfile atual até existir uma atualização compatível ou uma
   etapa isolada de migração major;
6. repetir o audit online antes de release ou deploy;
7. revisar novamente quando MCP SDK, Vite ou ESLint removerem os caminhos
   vulneráveis de forma suportada.

## Validação

Executado nesta etapa:

```text
npm ls <pacotes auditados> --all
npm explain @hono/node-server
npm explain brace-expansion
npm explain esbuild
npm install-scripts ls
npm audit --offline --json
npm audit --json
npm audit --omit=dev --json
busca no código e em .output
```

Resultado:

- nenhum pacote foi instalado, removido ou atualizado;
- nenhuma query, migration, chamada Supabase, publicação, commit ou push foi
  executado;
- o bundle Cloudflare local não contém `@hono/node-server` nem esbuild;
- o audit online confirmou nove registros no total e quatro ao omitir
  `devDependencies`;
- nenhuma vulnerabilidade crítica foi reportada;
- os cinco registros altos são exclusivos do toolchain ESLint;
- o risco residual e os critérios de revisão estão documentados.

## Próximo gate

AUD-12 está triado e validado online, com risco residual aceito temporariamente.
Para remover a exceção:

1. testar upgrades major em etapa isolada;
2. executar typecheck, lint, build e smoke test local;
3. confirmar que o novo audit online não contém os caminhos anteriores;
4. atualizar esta evidência e a decisão arquitetural;
5. não promover a alteração sem concluir esses gates.
