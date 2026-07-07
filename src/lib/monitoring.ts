// Optional Sentry integration — activates automatically when SENTRY_DSN
// (server) or VITE_SENTRY_DSN (client) is set. Until then, this is a no-op
// and does not add the SDK to the bundle.
//
// To enable:
//   1. Create a Sentry project, obtain the DSN.
//   2. Add VITE_SENTRY_DSN (client) and/or SENTRY_DSN (server) as secrets.
//   3. `bun add @sentry/react @sentry/node` and replace the dynamic import
//      stubs below with real SDK calls.

type CaptureFn = (error: unknown, context?: Record<string, unknown>) => void;

function isClient() {
  return typeof window !== "undefined";
}

function getDsn(): string | undefined {
  if (isClient()) {
    return import.meta.env.VITE_SENTRY_DSN as string | undefined;
  }
  return typeof process !== "undefined" ? process.env.SENTRY_DSN : undefined;
}

let warned = false;

export const captureException: CaptureFn = (error, context) => {
  const dsn = getDsn();
  if (!dsn) {
    if (!warned && !isClient()) {
      warned = true;
      // Server-side breadcrumb so we know monitoring is dormant.
      console.info("[monitoring] SENTRY_DSN not set — errors logged to console only.");
    }
    console.error("[monitoring]", error, context);
    return;
  }
  // Stub: real SDK wiring lands when @sentry/* is installed.
  console.error("[sentry:pending]", error, context);
};

export const isMonitoringEnabled = () => Boolean(getDsn());
