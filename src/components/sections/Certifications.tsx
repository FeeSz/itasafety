import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { Award } from "lucide-react";

const CERTS = [
  { code: "ISO 9001", desc: "Gestão de Qualidade" },
  { code: "NR-06", desc: "Equipamentos de Proteção Individual" },
  { code: "NR-10", desc: "Segurança em Eletricidade" },
  { code: "NR-18", desc: "Construção Civil" },
  { code: "NR-33", desc: "Espaço Confinado" },
  { code: "NR-35", desc: "Trabalho em Altura" },
  { code: "INMETRO", desc: "Certificação Compulsória" },
  { code: "ABNT", desc: "Normas Técnicas Brasileiras" },
] as const;

export default function Certifications() {
  return (
    <section className="border-y border-hairline bg-surface-sunken py-24 md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex"><Eyebrow>Certificações &amp; Normas</Eyebrow></div>
          <h2 className="mt-5 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-4xl">
            Conformidade auditável em cada entrega.
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-ink-muted">
            Cada equipamento sai com Certificado de Aprovação ativo, ficha
            técnica e laudo de ensaio. Preparados para auditorias do MTE,
            Ministério Público do Trabalho e perícias judiciais.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-hairline bg-hairline sm:grid-cols-4">
          {CERTS.map((c) => (
            <div
              key={c.code}
              className="group flex flex-col items-start gap-3 bg-white p-6 transition-colors hover:bg-brand-navy hover:text-white"
            >
              <Award
                className="size-6 text-brand-red transition-colors group-hover:text-white"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="font-display text-base font-bold tracking-tight text-ink transition-colors group-hover:text-white">
                {c.code}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors group-hover:text-white/70">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
