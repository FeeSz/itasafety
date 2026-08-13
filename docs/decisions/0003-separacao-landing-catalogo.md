# 0003 — Separação entre Landing e Catálogo

- Status: aceita
- Data: 11/08/2026

## Contexto

A rota `/` combinava marca, storytelling, categorias, produtos, parceiros e
conversão em uma única home. Uma Landing institucional já existia, mas dependia
do modo Vite `ui` e usava URLs absolutas de localhost. Mover a home antiga para
`/catalogo` apenas manteria a mistura de responsabilidades e carregaria assets
editoriais no fluxo funcional de descoberta.

## Decisão

Adotar `/` como Landing institucional e `/catalogo` como entrada funcional de
busca, categorias, produtos e seleção. Preservar `/categorias`,
`/departamento/$slug`, `/detalhes/$sku` e `/carrinho`.

Header, Footer, tokens e primitivas são compartilhados. Seções editoriais e
assets ativos da Landing permanecem route-scoped. A busca canônica fica em
`/catalogo` e usa search params. A seleção é anônima; a autenticação continua no
gate de submissão em `/carrinho`.

Atualização posterior: o `InteractivePhone` e a dependência `motion` foram
removidos quando deixaram de participar da composição aprovada. O modelo 3D
self-hosted mantém seu próprio boundary dinâmico exclusivo da Landing.

Até existir uma fonte única confirmada, o catálogo apresenta somente os dados
locais versionados e não publica como fatos status de CA, fabricante, estoque,
disponibilidade, normas, aplicações, garantia, preço ou oferta.

## Consequências positivas

- marca e descoberta de produto possuem objetivos e hierarquias próprias;
- a antiga home não se torna uma segunda Landing disfarçada;
- URLs existentes de categoria e produto permanecem compatíveis;
- busca, cards e lista anônima passam a formar uma jornada coerente;
- dependências editoriais não entram no Catálogo por reutilização de seções;
- SEO da Landing e do Catálogo possui contratos distintos.

## Consequências negativas

- componentes da antiga home e os componentes experimentais de Header/Footer
  permanecem no repositório até uma limpeza posterior;
- a busca e as contagens refletem apenas oito produtos locais;
- a taxonomia local ainda mistura critérios diferentes e limita filtros futuros;
- a Landing passa a fazer parte do build normal, aumentando a importância de
  medir seu custo de bundle e Web Vitals antes da publicação.

## Alternativas consideradas

- mover a home antiga integralmente para `/catalogo`: rejeitado por preservar
  storytelling, vídeo, parceiros e CTAs grandes antes dos produtos;
- manter a Landing apenas no modo `ui`: rejeitado porque impediria que `/`
  representasse a marca no build normal;
- criar novas URLs para departamento e produto: adiado para preservar deep
  links, bookmarks e indexação;
- criar filtros e fonte remota nesta fase: adiado até confirmar contrato e
  taxonomia de negócio.

## Critério de revisão

Revisar quando houver fonte única de produtos/categorias, telemetria real de
busca e Web Vitals, ou decisão aprovada de alterar URLs públicas. A revisão deve
preservar seleção anônima e exigir plano explícito de redirect e rollback.
