import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  Microscope,
  Headset,
  FileBarChart,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Conformidade Total",
    text: "100% dos itens com CA ativo. Rastreabilidade documental e laudo de ensaio por lote.",
  },
  {
    icon: Microscope,
    title: "Engenharia de Aplicação",
    text: "Levantamento técnico in loco, matriz de risco e especificação por função operacional.",
  },
  {
    icon: BadgeCheck,
    title: "Curadoria Premium",
    text: "Marcas líderes mundiais — MSA, Honeywell, 3M, Ansell, DuPont — validadas no nosso laboratório.",
  },
  {
    icon: Truck,
    title: "Logística Crítica",
    text: "Cotação em até 24h úteis, frota dedicada SP e reposição emergencial em todo o Brasil.",
  },
  {
    icon: FileBarChart,
    title: "Gestão por Indicador",
    text: "Painéis de consumo, vencimento de CA e troca programada por usuário.",
  },
  {
    icon: Headset,
    title: "Suporte Técnico",
    text: "Equipe própria de engenheiros SSMA para apoio em auditorias e perícias.",
  },
] as const;

export default function Differentials() {
  return (
    <section className="relative bg-white py-24 md:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:items-end">
          <div>
            <Eyebrow>Diferenciais</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-5xl">
              Mais que distribuidora. <span className="text-brand-navy">Operação técnica.</span>
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-ink-muted lg:max-w-md lg:justify-self-end">
            Operamos como extensão da equipe de SSMA dos nossos clientes — da
            especificação à reposição. Cada decisão é técnica, documentada e
            auditável.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-md border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }, i) => (
            <article
              key={title}
              className="group relative flex flex-col gap-5 bg-white p-8 transition-colors hover:bg-surface-sunken"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Icon
                className="size-9 text-brand-navy transition-colors group-hover:text-brand-red"
                strokeWidth={1.5}
                aria-hidden
              />
              <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-muted">{text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
