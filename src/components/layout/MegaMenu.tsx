import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MegaMenu({ open, onClose }: Props) {
  const [active, setActive] = useState(CATEGORIES[0].slug);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const activeCat = CATEGORIES.find((c) => c.slug === active) ?? CATEGORIES[0];

  return (
    <div 
      className={`fixed inset-0 z-[60] transition-all duration-300 ${
        open ? "visible" : "invisible pointer-events-none"
      }`} 
      role="dialog" 
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={`absolute inset-0 bg-black/25 backdrop-blur-[8px] transition-opacity ${
          open ? "opacity-100 duration-200 ease-out" : "opacity-0 duration-[180ms] ease-in"
        }`}
      />
      <div
        className={`absolute left-0 right-0 z-10 overflow-y-auto rounded-b-[20px] border-b border-hairline bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15),0_8px_24px_-8px_rgba(0,0,0,0.1)] transition-all origin-top mt-1 ${
          open 
            ? "opacity-100 translate-y-0 scale-100 duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)]" 
            : "opacity-0 -translate-y-2 scale-[0.98] duration-[180ms] ease-in"
        }`}
        style={{
          top: "clamp(64px, 10vw, 136px)",
          maxHeight: "calc(100dvh - clamp(64px, 10vw, 136px))",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
            Todas as Categorias
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 place-items-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
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
                    className={`flex items-center gap-3 border-l-[3px] px-5 py-2.5 text-sm transition-all duration-150 ease-out ${
                      isActive
                        ? "border-brand-blue bg-brand-blue-tint text-brand-blue"
                        : "border-transparent text-ink hover:bg-surface-sunken hover:text-brand-blue"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="font-semibold uppercase tracking-wide text-[12px]">
                      {cat.title}
                    </span>
                    <ChevronRight
                      className={`ml-auto size-3.5 transition-transform duration-200 ${
                        isActive ? "translate-x-0.5 opacity-80" : "opacity-45"
                      }`}
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
          <div key={activeCat.slug} className="p-8 animate-fade-in">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-brand-blue-tint text-brand-blue">
                <activeCat.icon className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-bold text-lg text-ink">{activeCat.title}</h3>
                <p className="text-xs text-ink-soft">Subcategorias disponíveis</p>
              </div>
            </div>
            {activeCat.subcategories?.length ? (
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {activeCat.subcategories.map((s, idx) => (
                  <li 
                    key={s}
                    className="opacity-0 animate-[fade-slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                    style={{ animationDelay: `${idx * 20}ms` }}
                  >
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
