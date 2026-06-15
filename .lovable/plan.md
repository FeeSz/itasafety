# Redesign Enterprise ItaSafety

## 1. Análise das referências

**ItaSafety original (itasafety.com.br)** — fonte de identidade

- Paleta: branco dominante, cinza claro industrial, azul institucional (~#1B3A6B), vermelho estratégico (~#C8102E) em CTAs e detalhes
- Tom: técnico, sério, B2B industrial, foco em EPI/segurança do trabalho
- Pontos fortes: cores corporativas reconhecíveis, segmentação clara por categoria
- Pontos fracos: layout datado (estilo CMS 2014), tipografia genérica, hero fraco, hierarquia visual pobre, sem microinterações, mobile limitado, cards inconsistentes

**Ultra EPI (ultraepi.com.br)** — fonte de estrutura/UX

- Hero forte com produto em destaque + claim curto + CTA primário
- Grid de categorias com ícones/imagens grandes
- Faixa de logos de clientes/parceiros (prova social)
- Blocos de diferenciais com ícones lineares
- Seção institucional curta com CTA secundário
- CTA comercial full-bleed antes do footer
- Footer denso e organizado em colunas
- Espaçamento generoso, tipografia display moderna, micro-hover sutis

## 2. Estratégia de mix

| Elemento            | Origem    | Como aplico                                                                                              |
| ------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| Paleta              | ItaSafety | Mantenho branco/cinza/azul institucional/vermelho como tokens semânticos                                 |
| Tipografia          | Nova      | Display industrial (Space Grotesk) + body neutro (Inter) — moderno sem ser genérico                      |
| Estrutura de seções | Ultra EPI | Hero → Categorias → Diferenciais → Produtos destaque → Certificações → Clientes → CTA → Contato → Footer |
| Identidade gráfica  | ItaSafety | Logo, eyebrow vermelha, detalhes em vermelho, autoridade técnica                                         |
| Microinterações     | Nova      | Hover sutil em cards, transições 200-300ms, reveal on scroll moderado                                    |
| Densidade           | Híbrido   | Ar do Ultra EPI + densidade técnica de catálogo B2B                                                      |

**O que preservo da Ita atual já no projeto:** paleta semântica, rotas (`/`, `/categorias`, `/sobre`, `/contato`, legais), componentes (Container, Eyebrow, CtaButton, PageHero, Header, Footer, QuoteForm), schema do banco `products`.

**O que modernizo:**

- Hero da home: redesign com claim industrial + KPI strip + CTA duplo + visual de fundo
- Grid de categorias: cards full-image com overlay e hover reveal
- Nova seção "Diferenciais" (6 pilares com ícones)
- Nova seção "Certificações & Normas" (ISO, NRs, INMETRO/CA)
- Faixa de clientes/parceiros (grayscale → color no hover)
- CTA comercial full-bleed pré-footer
- Página /sobre reformulada com timeline + valores
- Tokens em `styles.css`: refino de azul institucional, vermelho, neutros industriais; sombras suaves; raio 4–8px (não pill)

## 3. Plano de execução

### Fase A — Design system (styles.css)

- Reafinar tokens oklch: `--brand-blue`, `--brand-red`, `--surface`, `--surface-sunken`, `--ink`, `--ink-muted`, `--border-industrial`
- Sombras suaves (`--shadow-card`, `--shadow-lift`) e gradientes contidos
- Tipografia: importar Space Grotesk + Inter; classes `font-display` e `font-body`
- Raios moderados (não rounded-full em cards)

### Fase B — Componentes novos

- `src/components/sections/HeroIndustrial.tsx` — hero da home
- `src/components/sections/Differentials.tsx` — 6 pilares
- `src/components/sections/Certifications.tsx` — ISO/NR/CA com badges
- `src/components/sections/PartnersStrip.tsx` — logos clientes
- `src/components/sections/CommercialCTA.tsx` — faixa pré-footer
- Refino: `CategoryGrid` (cards image-first), `FeaturedProducts` (carrossel/grid premium)

### Fase C — Páginas

- `src/routes/index.tsx`: nova composição de seções
- `src/routes/sobre.tsx`: hero + missão/visão/valores + timeline + CTA
- `src/routes/categorias.tsx`: refino para grid premium
- `src/routes/contato.tsx`: já estrutural; pequenos ajustes visuais

### Fase D — QA

- Verificar tipagem (sem `any`), build limpo
- Responsividade 360 / 768 / 1024 / 1440
- Hierarquia de headings (1 H1 por página)
- Contraste WCAG AA nos tokens
- Lazy-load de imagens, alt em todas

## 4. Detalhes técnicos

- Stack atual mantida: TanStack Start + Tailwind v4 + shadcn + Lovable Cloud
- Imagens: reaproveitar `src/assets/*` existentes; gerar 2–3 novas para hero/CTA se necessário
- Sem libs novas pesadas; microinterações via CSS/Tailwind transitions; reveal on scroll com IntersectionObserver leve ou `framer-motion` (já comum no projeto se instalado — checar antes)
- Sem mudanças no schema do banco nesta rodada (Bloco 2 já entregue; este é puramente visual/estrutural)
- Não tocar em `client.ts`, `types.ts`, `routeTree.gen.ts`

## 5. O que NÃO faço nesta rodada

- Carrinho de cotação (Bloco 3.D) — fica para próxima rodada
- Página de produto individual (Bloco 3.E) — próxima rodada
- Painel admin de produtos — próxima rodada
- Migração de dados reais (aguarda CSV do cliente)

## 6. Critério de aceite

- Visual claramente "ItaSafety 2026" — reconhecível mas moderno
- Nenhuma seção parece template genérico ou cópia da Ultra EPI
- Mobile, tablet e desktop impecáveis
- Lighthouse mantém ≥ 90 em performance/SEO/a11y
