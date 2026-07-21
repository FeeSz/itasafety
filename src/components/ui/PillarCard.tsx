import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

type PillarCardProps = {
  number: string;        // "01", "02", "03"
  label: string;         // "MISSÃO", "VISÃO", "VALORES"
  icon: ReactNode;
  title: string;
  description: string;
  accentColor: "blue" | "red" | "amber";
  delay?: number;
  flip?: boolean;        // true = ícone à direita, número à direita
};

const accentMap = {
  blue:  { border: "border-l-brand-blue",  iconBg: "bg-brand-blue/10",  iconText: "text-brand-blue",  numText: "text-brand-blue/5"  },
  red:   { border: "border-l-brand-red",   iconBg: "bg-brand-red/10",   iconText: "text-brand-red",   numText: "text-brand-red/5"   },
  amber: { border: "border-l-amber-500",   iconBg: "bg-amber-500/10",   iconText: "text-amber-500",   numText: "text-amber-500/5"   },
};

export default function PillarCard({
  number,
  label,
  icon,
  title,
  description,
  accentColor,
  delay = 0,
  flip = false,
}: PillarCardProps) {
  const acc = accentMap[accentColor];

  return (
    <Reveal delay={delay}>
      <div
        className={`
          group relative overflow-hidden rounded-xl border border-hairline border-l-4
          bg-white p-8 shadow-card transition-all duration-300
          hover:-translate-y-1 hover:shadow-lift
          ${acc.border}
          ${flip ? "flex flex-row-reverse gap-8 md:flex-row-reverse" : ""}
        `}
      >
        {/* Number watermark */}
        <span
          aria-hidden
          className={`pointer-events-none absolute right-4 top-0 select-none font-black leading-none ${acc.numText}`}
          style={{ fontSize: "clamp(80px, 12vw, 140px)" }}
        >
          {number}
        </span>

        <div className="relative flex flex-col gap-5">
          {/* Icon */}
          <div className={`inline-flex size-14 items-center justify-center rounded-xl ${acc.iconBg} ${acc.iconText} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>

          {/* Label + Title */}
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-soft">
              {label}
            </p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">{title}</h3>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
        </div>
      </div>
    </Reveal>
  );
}
