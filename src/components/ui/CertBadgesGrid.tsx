import { ShieldCheck } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type Cert = {
  code: string;
  name: string;
  description: string;
  color: "blue" | "green" | "amber" | "purple";
};

const CERTS: Cert[] = [
  {
    code: "CA/MTE",
    name: "Certificado de Aprovação",
    description: "Todos os EPIs possuem CA emitido pelo Ministério do Trabalho.",
    color: "blue",
  },
  {
    code: "NR-6",
    name: "Norma Regulamentadora 6",
    description: "Conformidade com a NR-6 do MTE — EPIs obrigatórios em ambientes de risco.",
    color: "green",
  },
  {
    code: "INMETRO",
    name: "Instituto Nacional de Metrologia",
    description: "Produtos certificados pelo INMETRO com rastreabilidade e qualidade garantida.",
    color: "amber",
  },
  {
    code: "ABNT",
    name: "Normas Técnicas Brasileiras",
    description: "EPIs fabricados conforme especificações das normas ABNT aplicáveis.",
    color: "purple",
  },
];

const colorMap = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   icon: "text-blue-600"   },
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  icon: "text-green-600"  },
  amber:  { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  icon: "text-amber-600"  },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: "text-purple-600" },
};

export default function CertBadgesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CERTS.map((cert, i) => {
        const c = colorMap[cert.color];
        return (
          <Reveal key={cert.code} delay={i * 80}>
            <div
              className={`group relative flex flex-col gap-3 rounded-xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card ${c.bg} ${c.border}`}
            >
              <div className={`inline-flex size-10 items-center justify-center rounded-lg bg-white shadow-sm ${c.icon}`}>
                <ShieldCheck className="size-5" strokeWidth={1.8} />
              </div>
              <div>
                <p className={`font-mono text-xs font-bold uppercase tracking-wider ${c.text}`}>
                  {cert.code}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{cert.name}</p>
              </div>
              <p className="text-xs leading-relaxed text-ink-muted">{cert.description}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
