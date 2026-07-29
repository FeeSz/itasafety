-- Retain authentication-attempt telemetry for at most 90 days.
-- The named pg_cron schedule is idempotent: rerunning this migration updates
-- the existing job instead of creating duplicates.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'purge_old_auth_attempts',
  '0 0 * * *',
  $command$
    DELETE FROM public.auth_attempts
    WHERE created_at < now() - interval '90 days';
  $command$
);

COMMIT;

