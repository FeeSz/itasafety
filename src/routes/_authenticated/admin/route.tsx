import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Home, Tag, Award, ShieldAlert, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

/** Tempo de inatividade em ms antes de encerrar a sessão (15 minutos) */
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [mfaAlert, setMfaAlert] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Timeout de inatividade ───────────────────────────────────────────────
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(async () => {
        await supabase.auth.signOut();
        toast.warning("Sessão encerrada por inatividade (15 min). Faça login novamente.", {
          duration: 6000,
        });
        navigate({ to: "/auth", replace: true });
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Eventos que indicam que o usuário está ativo
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

    // Inicia o timer na montagem
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [navigate]);

  // ── Verificação de MFA ───────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data, error }) => {
      if (!error && data) {
        supabase.auth.mfa.listFactors().then(({ data: factorsData, error: factorsError }) => {
          if (!factorsError && factorsData) {
            const hasActiveFactor = factorsData.all.some((f) => f.status === "verified");
            if (!hasActiveFactor) {
              setMfaAlert(true);
            }
          }
        });
      }
    });
  }, []);

  const signOut = async () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth", replace: true });
  };

  const navItem =
    "flex items-center gap-2 rounded-md px-3 py-2 font-medium text-ink-muted hover:bg-surface-sunken transition-colors";
  const activeProps = { className: "bg-brand-blue-tint text-brand-blue" };

  return (
    <div className="min-h-[100dvh] bg-surface-sunken">
      <div className="border-b border-hairline bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-ink">Painel administrativo</h1>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                to="/admin"
                activeOptions={{ exact: true }}
                activeProps={activeProps}
                className={navItem}
              >
                <LayoutDashboard className="size-4" /> Visão Geral
              </Link>
              <Link to="/admin/categories" activeProps={activeProps} className={navItem}>
                <Tag className="size-4" /> Categorias
              </Link>
              <Link to="/admin/brands" activeProps={activeProps} className={navItem}>
                <Award className="size-4" /> Marcas
              </Link>
              <Link to="/admin/partners" activeProps={activeProps} className={navItem}>
                <Award className="size-4" /> Parceiros
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-surface-sunken"
            >
              <Home className="size-4" /> Ver site
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 rounded-md border border-hairline px-3 py-2 text-sm text-ink-muted hover:bg-surface-sunken"
            >
              <LogOut className="size-4" /> Sair
            </button>
          </div>
        </div>
      </div>

      {mfaAlert && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3">
          <div className="mx-auto flex max-w-7xl items-center gap-3 text-sm text-amber-800">
            <ShieldAlert className="size-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <span className="font-semibold">Recomendação de Segurança (MFA):</span> Sua conta
              administrativa não possui Autenticação de Dois Fatores (MFA) configurada. Habilite o
              MFA no console do Supabase para garantir conformidade com as diretrizes de acesso
              seguro.
            </div>
            <button
              onClick={() => setMfaAlert(false)}
              className="ml-auto text-xs font-semibold text-amber-600 hover:text-amber-800"
            >
              Dispensar
            </button>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
}
