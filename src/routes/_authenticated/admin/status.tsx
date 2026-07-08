import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/status")({
  head: () => ({
    meta: [
      { title: "Status do Sistema — ItaSafety" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StatusPage,
});

type Health = {
  status: "ok" | "degraded";
  env: Record<string, boolean>;
  missing: string[];
  supabase: { reachable: boolean; error?: string; latencyMs?: number };
  timestamp: string;
};

function StatusPage() {
  const [clientEnv, setClientEnv] = useState<Record<string, boolean> | null>(null);
  const [session, setSession] = useState<{
    ok: boolean;
    hasSession: boolean;
    error?: string;
  } | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [healthErr, setHealthErr] = useState<string | null>(null);

  useEffect(() => {
    setClientEnv({
      VITE_SUPABASE_URL: Boolean(import.meta.env.VITE_SUPABASE_URL),
      VITE_SUPABASE_PUBLISHABLE_KEY: Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
      VITE_SUPABASE_PROJECT_ID: Boolean(import.meta.env.VITE_SUPABASE_PROJECT_ID),
    });

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        setSession({
          ok: !error,
          hasSession: Boolean(data?.session),
          ...(error ? { error: error.message } : {}),
        });
      } catch (err) {
        setSession({
          ok: false,
          hasSession: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();

    fetch("/api/public/health")
      .then(async (r) => setHealth(await r.json()))
      .catch((e) => setHealthErr(e instanceof Error ? e.message : String(e)));
  }, []);

  const clientMissing = clientEnv
    ? Object.entries(clientEnv)
        .filter(([, ok]) => !ok)
        .map(([k]) => k)
    : [];

  return (
    <div className="min-h-dvh bg-surface-sunken py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink">Status do Sistema</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Diagnóstico interno de variáveis de ambiente e conectividade com o backend.
        </p>

        {clientMissing.length > 0 && (
          <div className="mt-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm text-amber-900">
              <strong>Variáveis VITE_SUPABASE_* ausentes no bundle publicado.</strong> É necessário
              republicar o site para que o frontend consiga se conectar ao Supabase.
              <div className="mt-1 font-mono text-xs">Faltando: {clientMissing.join(", ")}</div>
            </div>
          </div>
        )}

        <Section title="Cliente (browser)">
          {clientEnv ? (
            <>
              {Object.entries(clientEnv).map(([k, ok]) => (
                <Row key={k} label={k} ok={ok} />
              ))}
            </>
          ) : (
            <Loading />
          )}
        </Section>

        <Section title="Sessão Supabase (cliente)">
          {session ? (
            <>
              <Row label="Auth API alcançável" ok={session.ok} detail={session.error} />
              <Row
                label="Sessão ativa"
                ok={session.hasSession}
                detail={
                  session.hasSession ? undefined : "Nenhum usuário logado (esperado se anônimo)"
                }
                neutral={!session.hasSession && session.ok}
              />
            </>
          ) : (
            <Loading />
          )}
        </Section>

        <Section title="Servidor / Health check (/api/public/health)">
          {healthErr ? (
            <div className="text-sm text-red-600">Erro: {healthErr}</div>
          ) : health ? (
            <>
              <Row label={`Status: ${health.status}`} ok={health.status === "ok"} />
              {Object.entries(health.env).map(([k, ok]) => (
                <Row key={k} label={`env.${k}`} ok={ok} />
              ))}
              <Row
                label="Supabase alcançável do servidor"
                ok={health.supabase.reachable}
                detail={
                  health.supabase.reachable
                    ? `latência ${health.supabase.latencyMs}ms`
                    : health.supabase.error
                }
              />
              <div className="mt-2 text-xs text-ink-muted">
                Verificado em {new Date(health.timestamp).toLocaleString("pt-BR")}
              </div>
            </>
          ) : (
            <Loading />
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  ok,
  detail,
  neutral,
}: {
  label: string;
  ok: boolean;
  detail?: string;
  neutral?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {neutral ? (
        <AlertTriangle className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
      ) : ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
      )}
      <div>
        <div className="font-mono text-ink">{label}</div>
        {detail && <div className="text-xs text-ink-muted">{detail}</div>}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-muted">
      <Loader2 className="h-4 w-4 animate-spin" /> verificando…
    </div>
  );
}
