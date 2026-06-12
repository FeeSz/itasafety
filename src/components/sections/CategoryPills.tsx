import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryPills() {
  return (
    <div className="w-full border-y border-[#F3F4F6] bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 py-3.5 md:px-10">
        <span className="mr-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">
          Categorias
        </span>
        {CATEGORIES.slice(0, 10).map((c) => (
          <Link
            key={c.slug}
            to="/departamento/$slug"
            params={{ slug: c.slug }}
            className="rounded-full border border-[#E5E7EB] px-3.5 py-[5px] text-[12px] text-[#374151] transition-all duration-150 hover:border-[#1B4F8A] hover:bg-[#EBF4FF] hover:text-[#1B4F8A]"
          >
            {c.title}
          </Link>
        ))}
        <Link
          to="/categorias"
          className="rounded-full border border-[#DBEAFE] bg-[#EBF4FF] px-3.5 py-[5px] text-[12px] font-bold text-[#1B4F8A]"
        >
          Ver todas →
        </Link>
      </div>
    </div>
  );
}
