import { useQuery } from "@tanstack/react-query";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { supabase } from "@/integrations/supabase/client";
import { IS_VISUAL_MODE } from "@/lib/visual-mode";
import { VISUAL_PARTNERS, type VisualPartner } from "@/mocks/visual-fixtures";

type Partner = VisualPartner;

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
    enabled: !IS_VISUAL_MODE,
  });

  const displayPartners = partners.length > 0 ? partners : VISUAL_PARTNERS;
  const partnerLoop = Array.from({ length: 4 }, (_, cycle) =>
    displayPartners.map((partner) => ({ partner, cycle })),
  ).flat();

  return (
    <section
      className="overflow-hidden border-y border-black/5 bg-white py-20 md:py-28"
      aria-labelledby="partners-title"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow tone="muted">Marcas do portfólio</Eyebrow>
          <h2
            id="partners-title"
            className="mt-4 text-balance font-display text-3xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-4xl md:text-5xl"
          >
            Fabricantes reconhecidos em proteção individual.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-ink-muted md:text-lg">
            Uma seleção de marcas presentes no catálogo para diferentes aplicações e ambientes de
            trabalho.
          </p>
        </div>

      </Container>

      <div
        className="relative mt-12 w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
        }}
      >
        <ul className="flex w-max animate-marquee items-stretch gap-3 px-3 motion-reduce:animate-none [&:focus-within]:[animation-play-state:paused] [&:hover]:[animation-play-state:paused]">
          {partnerLoop.map(({ partner, cycle }) => {
            const isClone = cycle > 0;
            return (
              <li
                key={`${partner.id}-${cycle}`}
                className="w-[220px] shrink-0 sm:w-[250px]"
                aria-hidden={isClone || undefined}
              >
                <PartnerCard partner={partner} isClone={isClone} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function PartnerCard({ partner, isClone }: { partner: Partner; isClone: boolean }) {
  const content = (
    <>
      <img
        src={partner.logo_url}
        alt={`Logo ${partner.name}`}
        loading="lazy"
        decoding="async"
        className="max-h-12 w-auto max-w-[82%] object-contain mix-blend-multiply grayscale opacity-65 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:opacity-100"
      />
      <span className="sr-only">{partner.name}</span>
    </>
  );

  const className =
    "group flex min-h-28 items-center justify-center rounded-[1.4rem] border border-black/5 bg-[#f5f5f7] p-4 outline-none transition duration-300 hover:border-brand-blue/15 hover:bg-white hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)] focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2";

  if (partner.href) {
    return (
      <a
        href={partner.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visitar site oficial de ${partner.name}`}
        tabIndex={isClone ? -1 : undefined}
        className={className}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
