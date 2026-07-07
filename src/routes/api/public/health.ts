import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const started = Date.now();
        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY =
          process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const envCheck = {
          SUPABASE_URL: Boolean(SUPABASE_URL),
          SUPABASE_PUBLISHABLE_KEY: Boolean(SUPABASE_PUBLISHABLE_KEY),
        };

        const missing = Object.entries(envCheck)
          .filter(([, ok]) => !ok)
          .map(([k]) => k);

        let supabase: { reachable: boolean; error?: string; latencyMs?: number } = {
          reachable: false,
        };

        if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
          try {
            const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
              auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
            });
            const t0 = Date.now();
            const { error } = await client.auth.getSession();
            supabase = {
              reachable: !error,
              latencyMs: Date.now() - t0,
              ...(error ? { error: error.message } : {}),
            };
          } catch (err) {
            supabase = {
              reachable: false,
              error: err instanceof Error ? err.message : String(err),
            };
          }
        }

        const ok = missing.length === 0 && supabase.reachable;

        return Response.json(
          {
            status: ok ? "ok" : "degraded",
            timestamp: new Date().toISOString(),
            uptimeMs: Date.now() - started,
            env: envCheck,
            missing,
            supabase,
          },
          {
            status: ok ? 200 : 503,
            headers: { "cache-control": "no-store" },
          },
        );
      },
    },
  },
});
