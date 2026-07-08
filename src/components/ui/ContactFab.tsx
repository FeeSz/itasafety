import { useState, useRef, useEffect } from "react";
import { Phone, X, Building2, Headset } from "lucide-react";

export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" ref={menuRef}>
      {open && (
        <div className="w-64 animate-in slide-in-from-bottom-4 fade-in duration-200 overflow-hidden rounded-2xl border border-hairline bg-white shadow-lift">
          <div className="bg-brand-blue-tint px-4 py-3 border-b border-hairline">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-blue">
              Fale Conosco
            </p>
            <p className="mt-0.5 text-sm text-ink font-medium leading-snug">
              Atendimento em horário comercial
            </p>
          </div>
          <div className="flex flex-col p-2 gap-1">
            <a
              href="tel:+551151785655"
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-sunken"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-blue/10 text-brand-blue">
                <Building2 className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-ink">Central de Vendas</span>
                <span className="text-xs text-ink-muted">(11) 5178-5655</span>
              </div>
            </a>
            <a
              href="tel:+551129630303"
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-sunken"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-blue/10 text-brand-blue">
                <Headset className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-ink">Linha Alternativa</span>
                <span className="text-xs text-ink-muted">(11) 2963-0303</span>
              </div>
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group relative flex size-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-lift ring-4 ring-brand-blue/20 transition-all hover:scale-105 hover:bg-brand-blue-hover active:scale-95"
        aria-label="Opções de contato"
      >
        <div className="relative flex size-full items-center justify-center">
          <Phone
            className={`absolute size-6 transition-all duration-300 ${open ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
          />
          <X
            className={`absolute size-6 transition-all duration-300 ${open ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"}`}
          />
        </div>
      </button>
    </div>
  );
}
