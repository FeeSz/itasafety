import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-px border-2 border-white/10 bg-white/10 md:grid-cols-3 lg:grid-cols-6">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          to="/categorias"
          className="group flex aspect-square flex-col justify-between bg-brand-navy-deep p-6 transition-colors hover:bg-brand-red"
        >
          <span className="font-mono text-[10px] uppercase tracking-tighter text-white/40 group-hover:text-white/70">
            {cat.code}
          </span>
          <div>
            <h3 className="font-display text-base font-bold uppercase leading-tight tracking-tight text-white">
              {cat.title}
            </h3>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-tighter text-white/40 group-hover:text-white/80">
              {cat.normas}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
