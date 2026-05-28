import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative border-b border-hairline bg-surface-sunken pb-20 pt-28 md:pb-28 md:pt-36">
      <div className="absolute inset-0 bg-grid-faint opacity-60" aria-hidden />
      <Container className="relative">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink md:text-6xl lg:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
