import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-white/10 bg-brand-navy-deep pb-16 pt-24 md:pb-24 md:pt-32">
      <Container>
        <div className="inline-flex items-center gap-3 border-l-4 border-brand-red bg-white/5 py-1 pl-4 backdrop-blur-sm">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h1 className="mt-6 text-balance font-display text-5xl font-black uppercase leading-[0.95] tracking-tighter text-white md:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
