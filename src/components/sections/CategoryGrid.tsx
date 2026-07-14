import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.slug}
            to="/departamento/$slug"
            params={{ slug: cat.slug }}
            className="group flex flex-col items-center rounded-xl border border-hairline bg-white px-3 py-5 text-center shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-brand-blue-light hover:shadow-strong"
          >
            <span className="grid size-16 place-items-center rounded-full bg-brand-blue-tint text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:scale-110 group-hover:-rotate-3 shadow-sm group-hover:shadow-md">
              <Icon className="size-7 transition-transform duration-300" strokeWidth={1.6} aria-hidden />
            </span>
            <h3 className="mt-3 line-clamp-2 text-[12px] font-bold uppercase tracking-wide text-ink">
              {cat.title}
            </h3>
          </Link>
        );
      })}
    </div>
  );
}
