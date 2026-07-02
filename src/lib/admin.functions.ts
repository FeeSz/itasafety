import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-side verification that the current bearer token belongs to an admin.
 * Runs on the server (validates JWT + queries user_roles under RLS) so the
 * admin route cannot be reached by bypassing the client-side redirect.
 */
export const verifyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (error) {
      throw new Error("Unauthorized");
    }
    if (!data) {
      throw new Error("Forbidden");
    }
    return { isAdmin: true as const, userId };
  });
