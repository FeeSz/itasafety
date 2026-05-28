import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.slug}
            to="/categorias"
            className="group relative flex flex-col gap-6 overflow-hidden rounded-md border border-hairline bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-navy hover:shadow-lift"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-sm bg-brand-navy/5 text-brand-navy transition-colors group-hover:bg-brand-red group-hover:text-white">
                <Icon className="size-6" strokeWidth={1.5} aria-hidden />
              </span>
              <ArrowUpRight
                className="size-5 text-ink-soft transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-red"
                aria-hidden
              />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                {cat.code}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold leading-tight tracking-tight text-ink">
                {cat.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {cat.description}
              </p>
            </div>
            <div className="mt-auto border-t border-hairline pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-navy">
                {cat.normas}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
