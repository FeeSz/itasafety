import { useState } from "react";
import { Eye, X } from "lucide-react";

import { IS_VISUAL_MODE } from "@/lib/visual-mode";

export default function VisualModeBadge() {
  const [visible, setVisible] = useState(true);

  if (!IS_VISUAL_MODE || !visible) return null;

  return (
    <aside
      aria-label="Modo visual local"
      className="fixed bottom-3 right-3 z-[200] flex items-center gap-2 rounded-full border border-cyan-300/50 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-white shadow-strong backdrop-blur-md"
    >
      <Eye className="size-4 text-cyan-300" aria-hidden />
      <span className="sm:hidden">Modo visual</span>
      <span className="hidden sm:inline">Modo visual · backend isolado</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-1 rounded-full p-0.5 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        aria-label="Ocultar aviso de modo visual"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </aside>
  );
}
