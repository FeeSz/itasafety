import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";

type AuthOAuthClient = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{
    data: {
      client?: { name?: string; client_name?: string; redirect_uri?: string } | null;
      scopes?: string[] | null;
      requested_scopes?: string[] | null;
      redirect_url?: string | null;
      redirect_to?: string | null;
    } | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{
    data: { redirect_url?: string | null; redirect_to?: string | null } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{
    data: { redirect_url?: string | null; redirect_to?: string | null } | null;
    error: { message: string } | null;
  }>;
};

function authOAuth(): AuthOAuthClient {
  return (supabase.auth as unknown as { oauth: AuthOAuthClient }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) {
      throw new Error("Solicitação de autorização inválida (authorization_id ausente).");
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } as never });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await authOAuth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) {
      window.location.href = immediate;
    }
    return data;
  },
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <main className="flex min-h-[100dvh] items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-lg">
        <h1 className="text-lg font-bold text-red-600">Não foi possível carregar a autorização</h1>
        <p className="mt-2 text-sm text-slate-600">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientName =
    details?.client?.name ?? details?.client?.client_name ?? "um aplicativo externo";
  const scopes = details?.scopes ?? details?.requested_scopes ?? [];

  async function decide(approve: boolean) {
    setBusy(approve ? "approve" : "deny");
    setError(null);
    const oauth = authOAuth();
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (error) {
      setBusy(null);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(null);
      setError("O servidor de autorização não retornou um endereço de redirecionamento.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface-sunken px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white/90 p-6 shadow-strong backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink dark:text-white">
              Conectar {clientName} à ItaSafety
            </h1>
            <p className="text-xs text-ink-muted dark:text-slate-400">
              Este acesso permite que {clientName} utilize as ferramentas do MCP da ItaSafety em seu nome.
            </p>
          </div>
        </div>

        {details?.client?.redirect_uri && (
          <p className="mt-4 break-all rounded-lg bg-slate-50 p-2 text-[11px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            Redirecionamento: {details.client.redirect_uri}
          </p>
        )}

        {scopes.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-ink dark:text-slate-200">
            {scopes.map((s: string) => (
              <li key={s} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                {s}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-ink-muted dark:text-slate-400">
          Isto não substitui as políticas de acesso e permissões do site.
        </p>

        {error && (
          <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => decide(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-blue/90 disabled:opacity-60"
          >
            {busy === "approve" && <Loader2 className="h-4 w-4 animate-spin" />}
            Autorizar
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => decide(false)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {busy === "deny" && <Loader2 className="h-4 w-4 animate-spin" />}
            Cancelar
          </button>
        </div>
      </div>
    </main>
  );
}
