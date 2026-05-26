import capacete from "@/assets/product-capacete.jpg";
import oculos from "@/assets/product-oculos.jpg";
import respirador from "@/assets/product-respirador.jpg";
import cinturao from "@/assets/product-cinturao.jpg";
import luvas from "@/assets/product-luvas.jpg";
import calcado from "@/assets/product-calcado.jpg";

export type Product = {
  sku: string;
  name: string;
  category: string;
  ca: string;
  description: string;
  image: string;
};

export const FEATURED_PRODUCTS: ReadonlyArray<Product> = [
  {
    sku: "CAP-V8829",
    name: "Capacete Aba Frontal Classe B",
    category: "Proteção Cabeça",
    ca: "CA 31.469",
    description:
      "Polietileno de alta densidade com suspensão articulada de seis pontos e jugular antimicrobiana.",
    image: capacete,
  },
  {
    sku: "OCU-X441",
    name: "Óculos Ampla Visão Anti-embaçante",
    category: "Proteção Visual",
    ca: "CA 39.882",
    description:
      "Lentes em policarbonato com tratamento AF/AS e armação envolvente de baixo perfil.",
    image: oculos,
  },
  {
    sku: "RSP-FF2000",
    name: "Respirador Facial Inteiro 2000",
    category: "Proteção Respiratória",
    ca: "CA 41.220",
    description:
      "Silicone grau médico, visor panorâmico e compatibilidade com filtros P2/P3 e gases ácidos.",
    image: respirador,
  },
  {
    sku: "CNT-PRO5",
    name: "Cinturão Paraquedista 5 Pontos",
    category: "Trabalho em Altura",
    ca: "CA 44.512",
    description:
      "Fitas em poliamida 45 mm, ancoragem dorsal e frontal, costuras com indicador de impacto.",
    image: cinturao,
  },
  {
    sku: "LVA-NTR07",
    name: "Luva Nitrílica Punho Tricotado",
    category: "Proteção das Mãos",
    ca: "CA 28.404",
    description:
      "Banho integral de nitrila com alta abrasão (nível 4) e excelente sensibilidade tátil.",
    image: luvas,
  },
  {
    sku: "BTN-STL10",
    name: "Botina de Segurança Bico de Aço",
    category: "Calçados",
    ca: "CA 27.001",
    description:
      "Couro hidrofugado, palmilha PU bidensidade e solado antiderrapante SRC.",
    image: calcado,
  },
] as const;
