import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY =
          process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        let ok = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

        if (ok && SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
          try {
            const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
              auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
            });
            const { error } = await client.auth.getSession();
            if (error) {
              console.warn("[Health Check] Supabase error:", error.message);
              ok = false;
            }
          } catch (err) {
            console.warn("[Health Check] Exception:", err instanceof Error ? err.message : err);
            ok = false;
          }
        } else {
          console.warn("[Health Check] Missing env vars");
        }

        return Response.json(
          { status: ok ? "ok" : "degraded" },
          { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
