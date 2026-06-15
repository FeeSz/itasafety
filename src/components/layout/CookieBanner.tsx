import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "itasafety_cookie_consent_v1";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: "1";
};

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function writeConsent(analytics: boolean, marketing: boolean) {
  const value: Consent = {
    essential: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
    version: "1",
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const decide = (analytics: boolean, marketing: boolean) => {
    writeConsent(analytics, marketing);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-3xl rounded-xl border border-white/10 bg-[#1A1A2E] p-5 text-white shadow-strong animate-slide-down md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-blue/20 text-brand-blue-light">
            <Cookie className="size-5" />
          </span>
          <div>
            <p
              id="cookie-title"
              className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-blue-light"
            >
              Privacidade · LGPD
            </p>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/75">
              Usamos cookies essenciais para operar o site e cookies opcionais de analytics para
              entender uso agregado. Você pode aceitar ou manter apenas os essenciais.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          <button
            type="button"
            onClick={() => decide(false, false)}
            className="rounded-md border border-white/15 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-white/85 transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Apenas Essenciais
          </button>
          <button
            type="button"
            onClick={() => decide(true, true)}
            className="rounded-md bg-brand-blue px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-blue-hover"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </div>
  );
}
