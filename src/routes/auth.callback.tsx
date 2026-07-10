import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        // Supabase processa o hash fragment/tokens automaticamente em background
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (data.session) {
          if (mounted) {
            const userId = data.session.user.id;
            const params = new URLSearchParams(window.location.search);
            const rawNext = params.get("next");
            const safeNext =
              rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

            if (safeNext) {
              window.location.replace(safeNext);
              return;
            }

            const { data: roles } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", userId);

            const isAdmin = (roles ?? []).some((r) => r.role === "admin");

            if (isAdmin) {
              navigate({ to: "/admin", replace: true });
            } else {
              navigate({ to: "/", replace: true });
            }
          }
        } else {
          throw new Error("Não foi possível carregar a sessão do usuário.");
        }
      } catch (err) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : "Erro na autenticação social";
          setError(msg);
          toast.error(msg);
          navigate({ to: "/auth", replace: true });
        }
      }
    }

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-surface-sunken dark:bg-slate-950 px-4 py-12">
      {/* Fundo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,79,138,0.08),transparent_70%)] dark:bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,79,138,0.15),transparent_70%)]"
      />

      <div className="relative w-full max-w-md text-center">
        {/* Card de carregamento */}
        <div className="relative rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl p-8 shadow-strong dark:border-white/10 dark:bg-slate-900/80">
          <div className="flex flex-col items-center gap-5">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-ink dark:text-white">Autenticando acesso...</h2>
              <p className="mt-2 text-xs text-ink-muted dark:text-slate-400">
                Aguarde um instante enquanto validamos sua sessão segura.
              </p>
            </div>

            {error && (
              <div className="mt-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-500 font-medium border border-red-500/20">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
