import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

type ContactCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
  badge?: string;
  badgeColor?: "green" | "blue";
  delay?: number;
};

const badgeColors = {
  green: "bg-green-100 text-green-700",
  blue:  "bg-brand-blue-soft text-brand-blue",
};

export default function ContactCard({
  icon,
  label,
  value,
  href,
  badge,
  badgeColor = "blue",
  delay = 0,
}: ContactCardProps) {
  const inner = (
    <div className="group flex flex-col gap-4 rounded-xl border border-hairline bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-blue/30 hover:shadow-lift">
      {/* Icon */}
      <div className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-blue/8 text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white">
        {icon}
      </div>

      {/* Badge */}
      {badge && (
        <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColors[badgeColor]}`}>
          {badge}
        </span>
      )}

      {/* Label + Value */}
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
          {label}
        </p>
        <p className="mt-1 text-lg font-bold tracking-tight text-ink leading-snug">
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <Reveal delay={delay}>
      {href ? (
        <a href={href} className="block">
          {inner}
        </a>
      ) : (
        <div>{inner}</div>
      )}
    </Reveal>
  );
}
