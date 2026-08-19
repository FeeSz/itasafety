import { Link } from "@tanstack/react-router";
import Container from "@/components/ui/Container";
import heroIndustrial from "@/assets/landing-factory-worker.jpg";
import { CATEGORIES } from "@/lib/categories";

export default function CatalogHero() {
  return (
    <>
      <nav className="catalog-category-nav bg-surface-inverse" aria-label="Categorias do catálogo">
        <Container className="catalog-category-nav__track">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              to="/departamento/$slug"
              params={{ slug: category.slug }}
              className="focus-ring-inverse catalog-category-nav__link"
            >
              {category.title}
            </Link>
          ))}
        </Container>
      </nav>

      <section className="bg-surface py-4 sm:py-6" aria-labelledby="catalog-title">
        <Container>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,2.15fr)_minmax(17rem,0.85fr)]">
            <article className="relative min-h-[30rem] overflow-hidden rounded-xl bg-surface-inverse shadow-subtle sm:min-h-[32rem]">
              <img
                src={heroIndustrial}
                alt="Profissional utilizando equipamentos de proteção em ambiente industrial"
                className="absolute inset-0 size-full object-cover object-center"
                fetchPriority="high"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,27,0.96)_0%,rgba(7,17,27,0.84)_40%,rgba(7,17,27,0.16)_78%)]"
                aria-hidden
              />

              <div className="relative flex min-h-[30rem] max-w-2xl flex-col justify-center px-6 py-10 sm:min-h-[32rem] sm:px-10 lg:px-12">
                <p className="text-label font-semibold text-primary-muted">Catálogo corporativo</p>
                <h1
                  id="catalog-title"
                  className="mt-3 max-w-xl text-balance text-h1 font-semibold leading-[1.02] text-foreground-inverse"
                >
                  Proteção certa para cada frente de trabalho.
                </h1>
                <p className="mt-4 max-w-lg text-body text-white/78">
                  O portfólio real da ItaSafety, organizado para sua equipe comparar aplicações e
                  preparar uma cotação com clareza.
                </p>
                <Link
                  to="/categorias"
                  className="focus-ring-inverse mt-7 inline-flex min-h-11 items-center self-start rounded-sm text-label font-semibold text-white hover:text-primary-muted"
                >
                  Explorar categorias <span aria-hidden>→</span>
                </Link>
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <CatalogEditorialCard
                eyebrow="Leitura do ambiente"
                title="Proteção começa antes da escolha."
                image="/images/catalog/safety-briefing.jpg"
                imageAlt="Profissional conduzindo uma orientação de segurança em ambiente industrial"
                imagePosition="object-[62%_center]"
              />
              <CatalogEditorialCard
                eyebrow="Rotina industrial"
                title="Cada operação pede um critério claro."
                image="/images/catalog/industrial-inspection.jpg"
                imageAlt="Profissional com EPI inspecionando uma chapa de vidro na linha de produção"
                imagePosition="object-center"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function CatalogEditorialCard({
  eyebrow,
  title,
  image,
  imageAlt,
  imagePosition,
}: {
  eyebrow: string;
  title: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
}) {
  return (
    <Link
      to="/categorias"
      className="focus-ring motion-control group relative min-h-60 overflow-hidden rounded-xl bg-surface-inverse shadow-subtle hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        className={`motion-transform absolute inset-0 size-full object-cover ${imagePosition} group-hover:scale-[1.015]`}
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,13,22,0.86)_0%,rgba(5,13,22,0.5)_48%,rgba(5,13,22,0.12)_78%)]"
        aria-hidden
      />
      <div className="relative z-10 max-w-[16rem] p-6 text-white">
        <p className="text-caption font-semibold text-white/72">{eyebrow}</p>
        <h2 className="mt-2 text-title font-semibold leading-tight">{title}</h2>
        <span className="mt-4 inline-flex text-label font-semibold text-white">
          Ver categorias <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
