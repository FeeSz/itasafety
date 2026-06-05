import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const RATE_WINDOW_MIN = 15;
const MAX_ATTEMPTS_EMAIL = 5;
const MAX_ATTEMPTS_IP = 20;

const checkSchema = z.object({
  email: z.string().email().max(254).optional(),
  attempt_type: z.enum(["login", "signup", "reset"]),
});

const recordSchema = checkSchema.extend({
  success: z.boolean(),
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

export const checkAuthRateLimit = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => checkSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - RATE_WINDOW_MIN * 60_000).toISOString();
    const ip = clientIp();

    const failedByEmail = data.email
      ? await supabaseAdmin
          .from("auth_attempts")
          .select("id", { count: "exact", head: true })
          .eq("email", data.email.toLowerCase())
          .eq("attempt_type", data.attempt_type)
          .eq("success", false)
          .gte("created_at", since)
      : { count: 0, error: null };

    const failedByIp = ip
      ? await supabaseAdmin
          .from("auth_attempts")
          .select("id", { count: "exact", head: true })
          .eq("ip", ip)
          .eq("success", false)
          .gte("created_at", since)
      : { count: 0, error: null };

    const emailCount = failedByEmail.count ?? 0;
    const ipCount = failedByIp.count ?? 0;

    const blocked = emailCount >= MAX_ATTEMPTS_EMAIL || ipCount >= MAX_ATTEMPTS_IP;
    return {
      blocked,
      retry_after_min: blocked ? RATE_WINDOW_MIN : 0,
      reason: blocked
        ? emailCount >= MAX_ATTEMPTS_EMAIL
          ? "Muitas tentativas para este e-mail. Tente novamente em alguns minutos."
          : "Muitas tentativas a partir do seu IP. Tente novamente em alguns minutos."
        : null,
    };
  });

export const recordAuthAttempt = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => recordSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = clientIp();
    await supabaseAdmin.from("auth_attempts").insert({
      email: data.email?.toLowerCase() ?? null,
      ip,
      attempt_type: data.attempt_type,
      success: data.success,
    });
    return { ok: true };
  });
