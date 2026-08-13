# 0004 — Fundação visual compartilhada

- Status: aceita
- Data: 11/08/2026

## Contexto

O frontend carregava Inter, Nunito Sans e JetBrains Mono, enquanto o shell usava
Nunito, a Landing sobrescrevia a fonte com Inter e um card ativo solicitava uma
serif não carregada. Cores, radii, sombras, foco e motion também eram definidos
de formas diferentes entre Landing, Catálogo e primitives herdados do shadcn.
Essa fragmentação tornava componentes tecnicamente equivalentes visualmente
incompatíveis e ampliava o custo de evolução.

## Decisão

Manter um único sistema semântico compatível com Tailwind CSS 4 em
`src/styles.css`:

- Inter é a família principal e de display; a pilha mono do sistema fica restrita
  a SKU, referências e dados;
- azul ItaSafety é `primary`; vermelho é `brand-accent` e permanece raro;
- cores de superfície, texto, borda e feedback usam papéis semânticos;
- spacing, containers, tipografia, radius, sombras, foco e motion possuem escalas
  pequenas e nomeadas;
- Landing usa densidade editorial e Catálogo usa densidade funcional, sem criar
  dois design systems;
- `Button`, `Input`, `Textarea`, `Card`, `Surface`, `Skeleton`, `EmptyState`,
  `ErrorState`, Dropdown, Sheet e Dialog são os primitives canônicos;
- `CatalogProductCard` e `CategoryCard` compartilham foundations, mas preservam
  responsabilidades visuais distintas;
- tokens CSS são a fonte única de duração e easing para o motion ativo;
- aliases antigos permanecem temporariamente para evitar uma migração visual em
  massa de auth e admin nesta fase.

Na revisão posterior da Landing, o `InteractivePhone` foi retirado da árvore
ativa e substituído por uma apresentação 3D self-hosted. Componentes e assets das
composições descartadas foram removidos, assim como a dependência `motion`, que
ficou sem consumidor. Os cards do Hero deixam de compartilhar um template
icon-led e passam a ser composições de mídia específicas para cada história.

## Consequências positivas

- Landing e Catálogo usam a mesma fonte, cor, foco, controles e profundidade;
- novos componentes não precisam inventar hexadecimais, radii ou timings;
- a redução para uma única fonte web diminui requisições e pesos de fonte;
- estados loading, empty, error, success, disabled e loading de ação possuem
  bases reutilizáveis;
- vermelho ganha hierarquia por aparecer apenas em atenção e consequência.

## Consequências negativas

- superfícies legadas ainda dependem de aliases até fases posteriores;
- a mudança global de Nunito para Inter afeta auth e admin, embora essas páginas
  não tenham sido redesenhadas;
- validação visual e contraste renderizado ainda dependem de navegador real;
- componentes editoriais descartados não permanecem como código órfão.

## Alternativas consideradas

- manter Nunito no shell e Inter na Landing: rejeitado por perpetuar dois DNAs;
- aplicar um preset shadcn: rejeitado porque substituiria identidade por um
  visual genérico e poderia sobrescrever componentes existentes;
- migrar todas as rotas e valores arbitrários de uma vez: rejeitado por risco de
  regressão e por exceder a Fase 2;
- adicionar nova biblioteca de design ou motion: rejeitado porque a stack atual
  já oferece Tailwind, Radix, CVA e Motion.

## Critério de revisão

Revisar quando a Fase 3 concluir o catálogo, quando auth/admin forem migrados para
os primitives ou quando medições em navegador indicarem necessidade de ajuste de
contraste, tipografia, densidade ou motion.
