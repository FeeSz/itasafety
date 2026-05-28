import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FEATURED_PRODUCTS } from "@/lib/products";

export default function FeaturedProducts() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURED_PRODUCTS.map((p) => (
        <article
          key={p.sku}
          className="group flex flex-col overflow-hidden rounded-md border border-hairline bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
            <img
              src={p.image}
              alt={p.name}
              width={800}
              height={600}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-sm bg-white/95 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-navy shadow-card backdrop-blur">
              {p.ca}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              {p.category} · {p.sku}
            </p>
            <h3 className="mt-3 font-display text-lg font-bold leading-tight tracking-tight text-ink">
              {p.name}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
              {p.description}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-red">
                Em estoque
              </span>
              <Link
                to="/contato"
                className="inline-flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-brand-navy transition-colors hover:text-brand-red"
              >
                Cotar
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
