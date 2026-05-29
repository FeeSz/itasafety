import type { LucideIcon } from "lucide-react";
import {
  Footprints,
  HardHat,
  Droplets,
  Package,
  Grid3X3,
  Snowflake,
  CloudRain,
  Hand,
  Ear,
  Wind,
  Eye,
  TriangleAlert,
  Flame,
  Shirt,
} from "lucide-react";

export type Category = {
  slug: string;
  title: string;
  icon: LucideIcon;
  subcategories?: ReadonlyArray<string>;
};

export const CATEGORIES: ReadonlyArray<Category> = [
  {
    slug: "calcados",
    title: "Calçados",
    icon: Footprints,
    subcategories: [
      "Bota de PVC/Borracha",
      "Canadá",
      "Conforto",
      "Palmilhas",
      "Sapato Feminino",
      "Sapato Social",
    ],
  },
  { slug: "capacetes", title: "Capacetes", icon: HardHat },
  { slug: "creme-protecao", title: "Creme de Proteção", icon: Droplets },
  { slug: "descartaveis", title: "Descartáveis", icon: Package },
  { slug: "diversos", title: "Diversos", icon: Grid3X3 },
  { slug: "frigorifica", title: "Frigorífica", icon: Snowflake },
  { slug: "impermeaveis", title: "Impermeáveis", icon: CloudRain },
  {
    slug: "luvas",
    title: "Luvas",
    icon: Hand,
    subcategories: [
      "Aventais",
      "Capas",
      "Nitrílica / Látex / Neoprene",
      "Raspa / Vaqueta / Malha",
    ],
  },
  { slug: "protecao-auditiva", title: "Proteção Auditiva", icon: Ear },
  { slug: "protecao-respiratoria", title: "Proteção Respiratória", icon: Wind },
  { slug: "protecao-visual", title: "Proteção Visual", icon: Eye },
  { slug: "sinalizacao", title: "Sinalização", icon: TriangleAlert },
  { slug: "solda-facial", title: "Solda e Facial", icon: Flame },
  { slug: "vestimenta", title: "Vestimenta de Proteção", icon: Shirt },
] as const;
