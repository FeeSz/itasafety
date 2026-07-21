import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Reveal from "@/components/ui/Reveal";

type Kpi = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
};

const KPIS: Kpi[] = [
  { value: 2000, suffix: "+", label: "Empresas atendidas", sublabel: "em todo o Brasil" },
  { value: 15,   suffix: "+", label: "Anos de mercado",    sublabel: "de experiência" },
  { value: 5000, suffix: "+", label: "SKUs disponíveis",   sublabel: "prontos para entrega" },
  { value: 98,   suffix: "%", label: "Satisfação",         sublabel: "dos nossos clientes" },
];

export default function KpiStrip() {
  return (
    <div className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-4">
      {KPIS.map((kpi, i) => (
        <Reveal key={kpi.label} delay={i * 100}>
          <div className="group flex flex-col items-center gap-1 bg-white/5 px-6 py-8 text-center backdrop-blur-sm transition-colors hover:bg-white/10">
            <p className="font-display text-4xl font-black tabular-nums text-white md:text-5xl">
              {kpi.prefix ?? ""}
              <AnimatedCounter end={kpi.value} suffix={kpi.suffix ?? ""} duration={1800} />
            </p>
            <p className="mt-1 text-sm font-bold text-white">{kpi.label}</p>
            {kpi.sublabel && (
              <p className="text-xs text-white/55">{kpi.sublabel}</p>
            )}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
