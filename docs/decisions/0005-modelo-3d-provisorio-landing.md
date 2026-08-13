# 0005 — Modelo 3D self-hosted na Landing

- Status: aceita
- Data: 13/08/2026

## Contexto

O Hero da Landing precisa apresentar uma viseira de proteção facial como objeto
3D interativo sem reintroduzir o celular removido e sem contaminar o bundle do
Catálogo. O modelo “PPE VISOR”, publicado por Lanzaman no Sketchfab sob licença
CC BY 4.0, foi fornecido como GLB autorizado para processamento local.

O arquivo de origem possui 4.669.544 bytes e não deve ser versionado no estado
bruto. O projeto não possui outro caso de uso 3D que justifique a infraestrutura
e o custo de manutenção de Three.js.

## Decisão

Usar `<model-viewer>` 3.5.0 com modelo self-hosted, encapsulado em
`SafetyVisorVisual` e carregado por `React.lazy` apenas no Hero da rota `/`.

- o GLB otimizado é servido em `/models/ppe-visor.glb`, fora do pipeline do
  bundler, com 160.436 bytes, material convertido de Spec/Gloss para Metal/Rough,
  texturas WebP de 1024 px e Draco;
- o módulo de `model-viewer` é importado dinamicamente de `unpkg.com` após
  `IntersectionObserver` e uma janela de tempo ocioso;
- o viewer usa `camera-controls`, `interaction-prompt="none"`, `disable-zoom`,
  canvas interativo de 120% do stage, câmera travada em 2,64 m,
  `environment-image="neutral"`, `loading="lazy"` e `reveal="auto"`; a combinação
  preserva a escala aparente e adiciona 20% de margem nos ângulos extremos;
- a auto-rotação é limitada a 2 graus por segundo após 2,6 segundos e é
  desativada quando `prefers-reduced-motion` está ativo;
- após o evento de carregamento, uma entrada curta e um deslocamento ocioso de
  até 5 px em 7 segundos animam somente `transform`/`opacity` e a sombra de
  contato; `prefers-reduced-motion` também remove esses movimentos;
- um poster PNG local de 640 × 400 px ocupa a geometria final desde a primeira
  renderização e continua em timeout, falha, bloqueio ou ausência de WebGL;
- abaixo de 480 px o runtime e o GLB não são solicitados e o poster é definitivo;
- a atribuição com links para Lanzaman, o modelo no Sketchfab e a licença
  CC BY 4.0 permanece visível na área legal do Footer somente na Landing;
- a inspeção visual em rotação completa não encontrou marca de fabricante;
- o objeto é apresentado diretamente sobre o fundo do Hero, sem frame, card,
  borda, radius ou sombra de container, com gradiente ambiental e sombra de
  contato discretos;
- o modelo é referência visual e não certificação, CA ou SKU ItaSafety.

## Alternativas já avaliadas

### Three.js ou `@react-three/fiber`

Descartada porque aumentaria bundle e manutenção sem existir outro fluxo 3D que
justifique a infraestrutura.

### Sketchfab Viewer API ou iframe

Descartada porque expõe chrome e branding de terceiro, reduz o controle de
fallback e mantém o asset visual dependente do provedor durante a experiência.

## Consequências positivas

- remove chrome, watermark e iframe do Sketchfab da composição;
- mantém o asset 3D sob controle de cache e disponibilidade da ItaSafety;
- não adiciona dependência npm nem JavaScript 3D ao bundle principal;
- preserva LCP e CLS com poster local e progressive enhancement;
- Catálogo e demais rotas permanecem sem referência ao viewer;
- falha do runtime externo degrada para uma composição estática completa;
- preserva a atribuição exigida pela CC BY 4.0;
- reduz o risco de o modelo visual ser interpretado como produto certificado ou
  endossado por um fabricante específico.

## Consequências negativas

- a partir de 480 px, a interação depende do módulo servido por `unpkg.com`;
- o GLB de 160.436 bytes é uma transferência adicional exclusiva da Landing;
- o componente precisa ser revisto se a API do custom element mudar;
- o modelo é referência visual, não um SKU ItaSafety validado.

## Critério de revisão

Revisar se a origem do runtime, a licença, a atribuição, o modelo ou a estratégia
de cache mudar. Caso o runtime seja internalizado no futuro, manter o boundary da
Landing, o fallback estático e a atribuição CC BY 4.0.
