import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Partner = {
  id: string;
  name: string;
  logo_url: string;
  href: string | null;
  tagline: string | null;
};

export default function PartnersStrip() {
  const { data: partners = [] } = useQuery({
    queryKey: ["partners-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("active", true)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data as Partner[];
    },
  });

  // Se não tivermos parceiros, não renderiza a seção
  if (partners.length === 0) return null;

  // Duplicamos para loop contínuo do marquee
  const loop = [...partners, ...partners];

  return (
    <section className="relative overflow-hidden border-y border-hairline bg-gradient-to-b from-white to-brand-blue-tint/40 py-16">
      {/* halos decorativos */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,79,138,0.06),transparent_70%)]"
      />

      <Container className="relative">
        <div className="flex flex-col items-center gap-3 text-center">
          <Eyebrow tone="muted">Marcas Parceiras</Eyebrow>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink md:text-3xl">
            Fabricantes que confiam na ItaSafety
          </h2>
          <p className="max-w-xl font-display text-sm text-ink-muted">
            Trabalhamos com as marcas líderes em proteção individual — todas certificadas e com
            Certificado de Aprovação (CA) do MTE.
          </p>
        </div>

        {/* Grid fixo em desktop — cada logo é clicável com hover premium */}
        <ul className="mx-auto mt-12 hidden max-w-6xl grid-cols-5 gap-5 lg:grid">
          {partners.map((p) => (
            <li key={p.id}>
              <PartnerCard partner={p} />
            </li>
          ))}
        </ul>

        {/* Marquee em mobile/tablet — infinite scroll, pausa no hover */}
        <div
          className="relative mt-12 overflow-hidden lg:hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
          }}
        >
          <ul className="flex w-max animate-marquee items-stretch gap-5 [&:hover]:[animation-play-state:paused]">
            {loop.map((p, i) => (
              <li key={`${p.id}-${i}`} className="w-[220px] shrink-0">
                <PartnerCard partner={p} />
              </li>
            ))}
          </ul>
        </div>

        {/* Selo de confiança */}
        <p className="mt-10 text-center text-xs font-semibold uppercase tracking-widest text-ink-soft">
          + de 50 fabricantes homologados · Distribuição autorizada
        </p>
      </Container>
    </section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  const CardContent = (
    <>
      {/* Brilho diagonal no hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      {/* Halo azul no hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 100%, rgba(27,79,138,0.10), transparent 70%)",
        }}
      />

      <div className="relative flex h-16 w-full items-center justify-center">
        <img
          src={partner.logo_url}
          alt={`Logo ${partner.name}`}
          loading="lazy"
          decoding="async"
          className="max-h-14 w-auto max-w-[85%] object-contain grayscale opacity-70 transition-all duration-500 ease-out group-hover:scale-[1.08] group-hover:grayscale-0 group-hover:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:opacity-100"
        />
      </div>

      <span className="relative mt-auto text-[10px] font-bold uppercase tracking-wider text-ink-soft transition-colors duration-300 group-hover:text-brand-blue">
        {partner.tagline || ""}
      </span>

      {/* Barra inferior azul revela no hover */}
      <span
        aria-hidden
        className="absolute inset-x-4 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-blue transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
    </>
  );

  const className = "group relative flex h-[132px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-hairline bg-white px-4 py-5 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-blue/40 hover:shadow-strong";

  if (partner.href) {
    return (
      <a
        href={partner.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visitar site oficial de ${partner.name}`}
        className={className}
      >
        {CardContent}
      </a>
    );
  }

  return <div className={className}>{CardContent}</div>;
}
