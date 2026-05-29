import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MegaMenu({ open, onClose }: Props) {
  const [active, setActive] = useState(CATEGORIES[0].slug);
  if (!open) return null;
  const activeCat = CATEGORIES.find((c) => c.slug === active) ?? CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 animate-fade-in"
      />
      <div className="absolute left-0 right-0 top-0 z-10 bg-white shadow-strong animate-slide-down">
        <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
            Todas as Categorias
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 place-items-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
          <ul className="border-r border-hairline py-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = cat.slug === active;
              return (
                <li key={cat.slug}>
                  <Link
                    to="/departamento/$slug"
                    params={{ slug: cat.slug }}
                    onMouseEnter={() => setActive(cat.slug)}
                    onClick={onClose}
                    className={`flex items-center gap-3 border-l-[3px] px-5 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "border-brand-blue bg-brand-blue-tint text-brand-blue"
                        : "border-transparent text-ink hover:bg-surface-sunken"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="font-semibold uppercase tracking-wide text-[12px]">
                      {cat.title}
                    </span>
                    <ChevronRight className="ml-auto size-3.5 opacity-50" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-brand-blue-tint text-brand-blue">
                <activeCat.icon className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-bold text-lg text-ink">{activeCat.title}</h3>
                <p className="text-xs text-ink-soft">
                  Subcategorias disponíveis
                </p>
              </div>
            </div>
            {activeCat.subcategories?.length ? (
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {activeCat.subcategories.map((s) => (
                  <li key={s}>
                    <Link
                      to="/departamento/$slug"
                      params={{ slug: activeCat.slug }}
                      onClick={onClose}
                      className="block rounded-md px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-brand-blue-tint hover:text-brand-blue"
                    >
                      • {s}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Link
                to="/departamento/$slug"
                params={{ slug: activeCat.slug }}
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-hover"
              >
                Ver todos os produtos
                <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
