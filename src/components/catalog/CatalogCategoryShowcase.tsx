import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";

const featuredCategories = [
  { slug: "capacetes", title: "Capacetes", image: "/images/catalog/products/574.jpg" },
  { slug: "calcados", title: "Calçados", image: "/images/catalog/products/629.jpg" },
  { slug: "luvas", title: "Luvas", image: "/images/catalog/products/549.jpg" },
  {
    slug: "protecao-visual",
    title: "Proteção visual",
    image: "/images/catalog/products/541.jpg",
  },
  {
    slug: "protecao-respiratoria",
    title: "Proteção respiratória",
    image: "/images/catalog/products/590.png",
  },
  {
    slug: "solda-facial",
    title: "Solda e facial",
    image: "/images/catalog/products/599.jpg",
  },
] as const;

export default function CatalogCategoryShowcase() {
  return (
    <section
      className="section-functional bg-background"
      aria-labelledby="featured-categories-title"
    >
      <Container>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-label font-semibold text-primary">Descubra por categoria</p>
            <h2
              id="featured-categories-title"
              className="mt-2 text-h2 font-semibold text-foreground"
            >
              Encontre pelo tipo de proteção
            </h2>
          </div>
          <Link
            to="/categorias"
            className="focus-ring motion-colors hidden min-h-11 items-center gap-2 rounded-sm text-label font-semibold text-primary hover:text-primary-hover sm:inline-flex"
          >
            Ver todas
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="catalog-category-showcase">
          {featuredCategories.map((category) => (
            <Link
              key={category.slug}
              to="/departamento/$slug"
              params={{ slug: category.slug }}
              className="focus-ring motion-control group catalog-category-showcase__item"
            >
              <span className="catalog-category-showcase__media">
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="motion-transform size-full object-contain mix-blend-multiply group-hover:scale-[1.035]"
                />
              </span>
              <span className="mt-4 text-center text-label font-semibold text-foreground">
                {category.title}
              </span>
            </Link>
          ))}
        </div>

        <Link
          to="/categorias"
          className="focus-ring motion-colors mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm text-label font-semibold text-primary hover:text-primary-hover sm:hidden"
        >
          Ver todas as categorias
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
