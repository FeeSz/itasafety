import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Package, LogOut, Home, Tag, Award } from "lucide-react";
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
              <Link to="/admin" activeOptions={{ exact: true }} activeProps={activeProps} className={navItem}>
                <Package className="size-4" /> Produtos
              </Link>
              <Link to="/admin/categories" activeProps={activeProps} className={navItem}>
                <Tag className="size-4" /> Categorias
              </Link>
              <Link to="/admin/brands" activeProps={activeProps} className={navItem}>
                <Award className="size-4" /> Marcas
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-surface-sunken">
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
