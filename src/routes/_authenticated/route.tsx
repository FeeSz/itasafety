import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { verifyAdminAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    // Rota apenas para usuários autenticados.
    // A verificação de admin foi movida para as rotas filhas específicas de admin.
    return { user: data.user, isAdmin: true as const };
  },
  component: () => <Outlet />,
});
