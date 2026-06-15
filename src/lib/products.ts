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
  categorySlug: string;
  ca: string;
  description: string;
  image: string;
  tags?: ReadonlyArray<"destaque" | "novo" | "mais-vendido" | "certificado">;
};

export const FEATURED_PRODUCTS: ReadonlyArray<Product> = [
  {
    sku: "CAP-V8829",
    name: "Capacete Aba Frontal Classe B",
    category: "Capacetes",
    categorySlug: "capacetes",
    ca: "31469",
    description:
      "Polietileno de alta densidade com suspensão articulada de seis pontos e jugular antimicrobiana.",
    image: capacete,
    tags: ["destaque", "mais-vendido", "certificado"],
  },
  {
    sku: "OCU-X441",
    name: "Óculos Ampla Visão Anti-embaçante",
    category: "Proteção Visual",
    categorySlug: "protecao-visual",
    ca: "39882",
    description:
      "Lentes em policarbonato com tratamento AF/AS e armação envolvente de baixo perfil.",
    image: oculos,
    tags: ["destaque", "novo", "certificado"],
  },
  {
    sku: "RSP-FF2000",
    name: "Respirador Facial Inteiro 2000",
    category: "Proteção Respiratória",
    categorySlug: "protecao-respiratoria",
    ca: "41220",
    description:
      "Silicone grau médico, visor panorâmico e compatibilidade com filtros P2/P3 e gases ácidos.",
    image: respirador,
    tags: ["destaque", "certificado"],
  },
  {
    sku: "CNT-PRO5",
    name: "Cinturão Paraquedista 5 Pontos",
    category: "Diversos",
    categorySlug: "diversos",
    ca: "44512",
    description:
      "Fitas em poliamida 45 mm, ancoragem dorsal e frontal, costuras com indicador de impacto.",
    image: cinturao,
    tags: ["destaque", "mais-vendido", "certificado"],
  },
  {
    sku: "LVA-NTR07",
    name: "Luva Nitrílica Punho Tricotado",
    category: "Luvas",
    categorySlug: "luvas",
    ca: "28404",
    description:
      "Banho integral de nitrila com alta abrasão (nível 4) e excelente sensibilidade tátil.",
    image: luvas,
    tags: ["destaque", "mais-vendido", "certificado"],
  },
  {
    sku: "BTN-STL10",
    name: "Botina de Segurança Bico de Aço",
    category: "Calçados",
    categorySlug: "calcados",
    ca: "27001",
    description: "Couro hidrofugado, palmilha PU bidensidade e solado antiderrapante SRC.",
    image: calcado,
    tags: ["destaque", "novo", "certificado"],
  },
  {
    sku: "OCU-Y552",
    name: "Óculos de Solda Tonalidade 5",
    category: "Solda e Facial",
    categorySlug: "solda-facial",
    ca: "39123",
    description: "Lente verde tonalidade 5, ideal para operações de solda oxiacetilênica leve.",
    image: oculos,
    tags: ["novo", "certificado"],
  },
  {
    sku: "PRT-AUD09",
    name: "Protetor Auditivo Tipo Plug",
    category: "Proteção Auditiva",
    categorySlug: "protecao-auditiva",
    ca: "16234",
    description: "Silicone hipoalergênico, atenuação NRRsf 17 dB, com cordão e estojo.",
    image: capacete,
    tags: ["mais-vendido", "certificado"],
  },
] as const;
