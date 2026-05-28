import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const BRANDS = [
  "MSA",
  "HONEYWELL",
  "3M",
  "ANSELL",
  "DUPONT",
  "DYSTAR",
  "DELTA PLUS",
  "MARLUVAS",
  "VICSA",
  "STEELPRO",
] as const;

export default function PartnersStrip() {
  return (
    <section className="border-y border-hairline bg-white py-16">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <Eyebrow tone="muted">Marcas Parceiras</Eyebrow>
          <p className="font-display text-sm text-ink-muted">
            Trabalhamos com os fabricantes líderes mundiais em proteção
            individual.
          </p>
        </div>

        <div className="mt-10 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-16">
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                className="font-display text-2xl font-black tracking-tight text-ink-soft/60 transition-colors hover:text-brand-navy md:text-3xl"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
