# 0001 — Documentação como parte da entrega

- Status: aceita
- Data: 29/07/2026

## Contexto

O projeto acumulou comportamento em frontend, scripts SQL soltos, migrations,
estado remoto e integrações sem uma visão única. Auditorias anteriores mostraram
que inferir produção apenas pelos arquivos locais produz conclusões incompletas.

## Decisão

Manter documentação versionada no repositório e exigir sua atualização em toda
feature, correção, migration e operação relevante.

O estado remoto continuará sendo verificado diretamente. A documentação registra
evidência e contexto, mas não substitui o catálogo ou o deployment ativo.

## Consequências positivas

- onboarding e retomada de contexto mais rápidos;
- menor dependência de memória individual;
- decisões e riscos ficam rastreáveis;
- diferença entre implementado, aplicado, implantado e validado fica explícita;
- auditorias futuras começam com baseline melhor.

## Consequências negativas

- toda entrega possui custo adicional de manutenção;
- documentação pode ficar obsoleta se a regra não for aplicada;
- algumas mudanças exigirão atualizar vários documentos.

## Alternativas consideradas

- usar apenas comentários no código: insuficiente para fluxos e operações;
- manter documentos fora do Git: perde sincronização com versões;
- documentar somente depois do projeto: repete o risco de drift.

## Critério de revisão

Revisar esta decisão se a documentação se tornar redundante, não for utilizada ou
se uma ferramenta automatizada assumir a rastreabilidade com igual qualidade.
