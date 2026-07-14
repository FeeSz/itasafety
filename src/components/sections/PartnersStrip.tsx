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

const MAVARO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 150">
  <g fill="#1B2871">
    <path d="M 30 75 L 30 55 L 100 55 L 160 10 L 200 50 L 240 10 L 300 55 L 370 55 L 370 75 L 290 75 L 240 35 L 200 75 L 160 35 L 110 75 Z" />
    <rect x="30" y="85" width="340" height="15" />
    <!-- Removido o translate perigoso e ajustado a escala para a fonte bold expandida -->
    <text x="200" y="155" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="52" text-anchor="middle" letter-spacing="4" transform="scale(1, 0.85)">MAVARO</text>
  </g>
</svg>`;

const VOLK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 150">
  <rect width="400" height="150" fill="#2E3378" />
  <g fill="#FFFFFF">
    <polygon points="50,25 90,25 140,125 100,125" />
    <!-- E shape right side -->
    <polygon points="175,25 220,25 220,50 160,50" />
    <polygon points="150,60 200,60 200,85 135,85" />
    <polygon points="125,95 180,95 180,125 110,125" />
  </g>
  <text x="235" y="70" font-family="Arial, sans-serif" font-weight="900" font-size="52" fill="#FFFFFF" letter-spacing="-1">VOLK</text>
  <text x="235" y="115" font-family="Arial, sans-serif" font-weight="normal" font-size="34" fill="#FFFFFF" letter-spacing="-1">do Brasil</text>
</svg>`;

const CONFORTO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 150">
  <!-- Sombra/Borda extra suave para simular a suavidade da imagem original -->
  <text x="200" y="90" font-family="'Brush Script MT', 'Comic Sans MS', cursive" font-style="italic" font-weight="normal" font-size="80" fill="#E22E39" text-anchor="middle">Conforto</text>
  <text x="200" y="125" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#666666" text-anchor="middle" letter-spacing="1.5">ARTEFATOS DE COURO LTDA.</text>
</svg>`;

const CANADA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 150">
  <!-- Folha de plátano simétrica e refinada -->
  <g fill="#C13319" transform="translate(10, 20) scale(1.1)">
    <path d="M 50 10 L 60 35 L 75 30 L 65 55 L 90 60 L 80 75 L 95 85 L 65 85 L 55 100 L 55 110 L 45 110 L 45 100 L 35 85 L 5 85 L 20 75 L 10 60 L 35 55 L 25 30 L 40 35 Z" />
  </g>
  <text x="135" y="75" font-family="Arial, sans-serif" font-weight="900" font-size="46" fill="#111111" text-anchor="start" letter-spacing="-1">CANADA EPI</text>
  <text x="135" y="110" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#777777" text-anchor="start" letter-spacing="1">CALÇADOS PROFISSIONAIS</text>
</svg>`;

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

  // Fallbacks usando os SVGs detalhados
  const displayPartners = partners.length > 0 ? partners : [
    { 
      id: 'mavaro', 
      name: 'Mavaro', 
      logo_url: `data:image/svg+xml;utf8,${encodeURIComponent(MAVARO_SVG)}`, 
      href: 'https://www.mavaro.com.br', 
      tagline: 'Proteção' 
    },
    { 
      id: 'volk', 
      name: 'Volk do Brasil', 
      logo_url: `data:image/svg+xml;utf8,${encodeURIComponent(VOLK_SVG)}`, 
      href: 'https://www.volkdobrasil.com.br', 
      tagline: 'Alta Performance' 
    },
    { 
      id: 'conforto', 
      name: 'Conforto', 
      logo_url: `data:image/svg+xml;utf8,${encodeURIComponent(CONFORTO_SVG)}`, 
      href: 'https://conforto.ind.br', 
      tagline: 'Artefatos de Couro' 
    },
    { 
      id: 'canada', 
      name: 'Canada EPI', 
      logo_url: `data:image/svg+xml;utf8,${encodeURIComponent(CANADA_SVG)}`, 
      href: 'https://www.canadaepi.com.br', 
      tagline: 'Calçados Profissionais' 
    },
  ];

  // Duplicamos para garantir o loop contínuo do marquee fluindo na tela inteira
  const loop = [...displayPartners, ...displayPartners, ...displayPartners, ...displayPartners];

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

        {/* Marquee Global para Todas as Telas — infinite scroll, pausa no hover */}
        <div
          className="relative mt-12 overflow-hidden w-full max-w-[100vw]"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
          }}
        >
          <ul className="flex w-max animate-marquee items-stretch gap-6 [&:hover]:[animation-play-state:paused]">
            {loop.map((p, i) => (
              <li key={`${p.id}-${i}`} className="w-[240px] shrink-0">
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
