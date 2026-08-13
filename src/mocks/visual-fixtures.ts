export type VisualPartner = {
  id: string;
  name: string;
  logo_url: string;
  href: string | null;
  tagline: string | null;
};

export const VISUAL_PARTNERS: ReadonlyArray<VisualPartner> = [
  {
    id: "mavaro",
    name: "Mavaro",
    logo_url: "/logos/mavaro.png",
    href: "https://www.mavaro.com.br",
    tagline: "Proteção",
  },
  {
    id: "volk",
    name: "Volk do Brasil",
    logo_url: "/logos/volk.png",
    href: "https://www.volkdobrasil.com.br",
    tagline: "Alta Performance",
  },
  {
    id: "conforto",
    name: "Conforto",
    logo_url: "/logos/conforto.png",
    href: "https://conforto.ind.br",
    tagline: "Artefatos de Couro",
  },
  {
    id: "canada",
    name: "Canada EPI",
    logo_url: "/logos/canada_epi.png",
    href: "https://www.canadaepi.com.br",
    tagline: "Calçados Profissionais",
  },
];
