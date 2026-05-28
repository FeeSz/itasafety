import { useEffect, useState } from "react";

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
      className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-3xl rounded-md border border-hairline bg-white p-5 shadow-lift md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p
            id="cookie-title"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red"
          >
            Privacidade &amp; LGPD
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            Usamos cookies essenciais para operar o site e cookies opcionais de
            analytics para entender uso agregado. Você pode aceitar, recusar ou
            personalizar a qualquer momento.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide(false, false)}
            className="rounded-sm border border-hairline px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Apenas Essenciais
          </button>
          <button
            type="button"
            onClick={() => decide(true, true)}
            className="rounded-sm bg-brand-red px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-red-dark"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </div>
  );
}
