import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Package, LogOut, Home } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-[calc(100dvh-200px)] bg-surface-sunken">
      <div className="border-b border-hairline bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-ink">Painel administrativo</h1>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                to="/admin"
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-brand-blue-tint text-brand-blue" }}
                className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-ink-muted hover:bg-surface-sunken"
              >
                <Package className="size-4" /> Produtos
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
      <Outlet />
    </div>
  );
}
