import type { ReactNode } from "react";
import Container from "@/components/ui/Container";

type Props = {
  children: ReactNode;
  className?: string;
  noContainer?: boolean;
};

/**
 * Seção com fundo dark navy + textura grid de pontos.
 * Usado em hero, KPI strip e CTA final.
 */
export default function SectionDark({ children, className = "", noContainer = false }: Props) {
  return (
    <section
      className={`relative overflow-hidden bg-[#0d1f3c] text-white ${className}`}
    >
      {/* Grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(59,125,216,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Ambient glow top-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 size-[600px] rounded-full bg-brand-blue/10 blur-[120px]"
      />
      {/* Ambient glow bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 size-[400px] rounded-full bg-brand-red/8 blur-[100px]"
      />

      <div className="relative">
        {noContainer ? children : <Container>{children}</Container>}
      </div>
    </section>
  );
}
