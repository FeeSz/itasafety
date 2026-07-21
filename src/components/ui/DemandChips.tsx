import { useState } from "react";

const DEMANDS = [
  "Compra pontual",
  "Contrato mensal",
  "Licitação pública",
  "Auditoria técnica",
] as const;

type Demand = (typeof DEMANDS)[number];

type Props = {
  name?: string;
  defaultValue?: Demand;
};

export default function DemandChips({ name = "demand_type", defaultValue = "Compra pontual" }: Props) {
  const [selected, setSelected] = useState<Demand>(defaultValue);

  return (
    <div role="radiogroup" aria-label="Tipo de demanda">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft mb-2">
        Tipo de Demanda
      </p>
      <div className="flex flex-wrap gap-2">
        {DEMANDS.map((d) => {
          const isSelected = selected === d;
          return (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(d)}
              className={`
                rounded-full border px-4 py-1.5 text-sm font-semibold
                transition-all duration-150 active:scale-95
                ${isSelected
                  ? "border-brand-blue bg-brand-blue text-white shadow-sm"
                  : "border-hairline bg-white text-ink-muted hover:border-brand-blue/50 hover:text-ink"
                }
              `}
            >
              {d}
            </button>
          );
        })}
      </div>
      {/* Hidden input so the value is submitted with the form */}
      <input type="hidden" name={name} value={selected} />
    </div>
  );
}
