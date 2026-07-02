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
    // Server-side admin verification (validates JWT + role check on the server).
    // This ensures the admin route cannot be reached by tampering with the client.
    try {
      await verifyAdminAccess();
    } catch {
      throw redirect({ to: "/" });
    }
    return { user: data.user, isAdmin: true as const };
  },
  component: () => <Outlet />,
});
