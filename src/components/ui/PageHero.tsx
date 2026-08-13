import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="section-editorial relative border-b border-border bg-surface-muted">
      <Container className="relative">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-balance text-h1 font-semibold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-pretty text-body-lg text-foreground-muted">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
