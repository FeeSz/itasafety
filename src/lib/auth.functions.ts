import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RATE_WINDOW_MIN = 15;
const MAX_ATTEMPTS_IP = 20;
const RECORD_WINDOW_MIN = 1;
const MAX_RECORDS_PER_IP = 30;

const checkSchema = z.object({
  email: z.string().email().max(254).optional(),
  attempt_type: z.enum(["login", "signup", "reset"]),
});

const recordSchema = z.object({
  attempt_type: z.enum(["login", "signup", "reset"]),
  success: z.boolean().optional(),
  email: z.string().email().max(254).optional(),
});

function clientIp() {
  try {
    return (
      getRequestIP({ xForwardedFor: true }) ||
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-real-ip") ||
      null
    );
  } catch {
    return null;
  }
}

// Helper to safely get supabaseAdmin or return graceful degradation response
async function getSafeSupabaseAdmin() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return supabaseAdmin;
  } catch (error) {
    console.warn("[Auth] Supabase Admin client not available - rate limiting disabled");
    return null;
  }
}

export const checkAuthRateLimit = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => checkSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      const supabaseAdmin = await getSafeSupabaseAdmin();

      // If admin client not available, allow request to proceed (graceful degradation)
      if (!supabaseAdmin) {
        return {
          blocked: false,
          retry_after_min: 0,
          reason: null,
        };
      }

      const since = new Date(Date.now() - RATE_WINDOW_MIN * 60_000).toISOString();
      const ip = clientIp();

      const failedByIp = ip
        ? await supabaseAdmin
            .from("auth_attempts")
            .select("id", { count: "exact", head: true })
            .eq("ip", ip)
            .eq("success", false)
            .gte("created_at", since)
        : { count: 0, error: null };

      const ipCount = failedByIp.count ?? 0;
      const blocked = ipCount >= MAX_ATTEMPTS_IP;
      return {
        blocked,
        retry_after_min: blocked ? RATE_WINDOW_MIN : 0,
        reason: blocked
          ? "Muitas tentativas a partir do seu IP. Tente novamente em alguns minutos."
          : null,
      };
    } catch (error) {
      console.error("[Auth] Error checking rate limit:", error);
      // Gracefully degrade on error
      return {
        blocked: false,
        retry_after_min: 0,
        reason: null,
      };
    }
  });

export const recordAuthAttempt = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => recordSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      const supabaseAdmin = await getSafeSupabaseAdmin();

      // If admin client not available, silently skip recording
      if (!supabaseAdmin) {
        console.warn("[Auth] Skipping attempt recording - admin client unavailable");
        return { ok: true };
      }

      const ip = clientIp();

      // This endpoint is public by design because it records failed sign-in
      // attempts. Never let caller-supplied email/success fields become an
      // authorization decision, and cap telemetry writes by server-observed IP.
      if (!ip) {
        return { ok: true };
      }

      const recordSince = new Date(Date.now() - RECORD_WINDOW_MIN * 60_000).toISOString();
      const recentRecords = await supabaseAdmin
        .from("auth_attempts")
        .select("id", { count: "exact", head: true })
        .eq("ip", ip)
        .gte("created_at", recordSince);

      if ((recentRecords.count ?? 0) >= MAX_RECORDS_PER_IP) {
        return { ok: true };
      }

      await supabaseAdmin.from("auth_attempts").insert({
        email: data.email?.toLowerCase() ?? null,
        ip,
        attempt_type: data.attempt_type,
        success: data.success ?? true,
      });
      return { ok: true };
    } catch (error) {
      console.error("[Auth] Error recording auth attempt:", error);
      // Silently fail - don't block auth because of logging error
      return { ok: true };
    }
  });
