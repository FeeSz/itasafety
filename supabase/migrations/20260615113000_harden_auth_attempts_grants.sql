-- auth_attempts is written only by trusted server code with service_role.
-- Authenticated users may read it through the existing admin-only RLS policy.
REVOKE INSERT, UPDATE, DELETE ON public.auth_attempts FROM authenticated;
GRANT SELECT ON public.auth_attempts TO authenticated;
GRANT ALL ON public.auth_attempts TO service_role;
