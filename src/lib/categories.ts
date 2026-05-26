export type Category = {
  code: string;
  slug: string;
  title: string;
  description: string;
  normas: string;
};

export const CATEGORIES: ReadonlyArray<Category> = [
  {
    code: "CAT-01",
    slug: "protecao-cabeca",
    title: "Proteção Cabeça",
    description: "Capacetes, capuzes e protetores de aba para impactos e penetração.",
    normas: "NR-06 · NR-18",
  },
  {
    code: "CAT-02",
    slug: "protecao-visual",
    title: "Proteção Visual",
    description: "Óculos e protetores faciais com tratamento anti-risco e anti-embaçante.",
    normas: "NR-06 · ANSI Z87",
  },
  {
    code: "CAT-03",
    slug: "protecao-auditiva",
    title: "Proteção Auditiva",
    description: "Plugs e abafadores certificados para níveis críticos de ruído.",
    normas: "NR-15 · NR-06",
  },
  {
    code: "CAT-04",
    slug: "protecao-respiratoria",
    title: "Proteção Respiratória",
    description: "Máscaras descartáveis, semifaciais e faciais inteiras com filtros químicos.",
    normas: "NR-09 · NR-33",
  },
  {
    code: "CAT-05",
    slug: "trabalho-altura",
    title: "Trabalho em Altura",
    description: "Cinturões, talabartes, trava-quedas e linhas de vida certificadas.",
    normas: "NR-35",
  },
  {
    code: "CAT-06",
    slug: "protecao-maos",
    title: "Proteção das Mãos",
    description: "Luvas para risco mecânico, térmico, químico e elétrico.",
    normas: "NR-06 · EN 388",
  },
  {
    code: "CAT-07",
    slug: "calcados",
    title: "Calçados de Segurança",
    description: "Botas, sapatos e botinas com bico de aço, composite e PVC.",
    normas: "NR-06 · NR-32",
  },
  {
    code: "CAT-08",
    slug: "vestimentas",
    title: "Vestimentas de Proteção",
    description: "Aventais, jaquetas, uniformes antichamas e alta visibilidade.",
    normas: "NR-10 · NBR 15292",
  },
  {
    code: "CAT-09",
    slug: "impermeaveis",
    title: "Impermeáveis",
    description: "Capas, conjuntos e aventais para ambientes úmidos e químicos.",
    normas: "NR-06",
  },
  {
    code: "CAT-10",
    slug: "solda-facial",
    title: "Solda & Facial",
    description: "Máscaras de solda automáticas, aventais e perneiras de raspa.",
    normas: "NR-18",
  },
  {
    code: "CAT-11",
    slug: "sinalizacao",
    title: "Sinalização",
    description: "Cones, placas, fitas e dispositivos de bloqueio (LOTO).",
    normas: "NR-26",
  },
  {
    code: "CAT-12",
    slug: "dermatologica",
    title: "Proteção Dermatológica",
    description: "Cremes e barreiras químicas grupo 1, 2 e 3.",
    normas: "NR-06",
  },
] as const;
