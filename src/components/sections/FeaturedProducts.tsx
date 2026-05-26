import { Link } from "@tanstack/react-router";
import { FEATURED_PRODUCTS } from "@/lib/products";

export default function FeaturedProducts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {FEATURED_PRODUCTS.map((p) => (
        <article
          key={p.sku}
          className="group flex flex-col border-t-4 border-brand-red bg-brand-navy-deep p-6 transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="mb-6 aspect-square overflow-hidden bg-white/5">
            <img
              src={p.image}
              alt={p.name}
              width={800}
              height={800}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
            <span>{p.category}</span>
            <span className="text-brand-red">{p.sku}</span>
          </div>
          <h3 className="font-display text-lg font-bold uppercase italic leading-tight tracking-tight text-white">
            {p.name}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">
            {p.description}
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <span className="font-mono text-xs text-brand-red">{p.ca}</span>
            <Link
              to="/contato"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:text-brand-red"
            >
              Solicitar →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
