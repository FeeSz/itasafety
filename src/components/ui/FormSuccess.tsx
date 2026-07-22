import { MessageCircle } from "lucide-react";

export default function FormSuccess() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Animated checkmark */}
      <div className="relative flex size-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-green-100 animate-in zoom-in duration-300" />
        <svg
          viewBox="0 0 52 52"
          className="relative size-12 text-green-600"
          fill="none"
          strokeWidth={3}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="26" cy="26" r="24" className="opacity-20" />
          <path
            d="M14 27 L22 35 L38 18"
            style={{
              strokeDasharray: 40,
              strokeDashoffset: 0,
              animation: "drawCheck 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both",
            }}
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-2xl font-bold text-ink">
          Solicitação recebida!
        </h3>
        <p className="text-sm text-ink-muted max-w-xs">
          Nossa equipe responde em até{" "}
          <strong className="text-ink">24h úteis</strong>. Verifique sua caixa de entrada.
        </p>
      </div>
    </div>
  );
}
