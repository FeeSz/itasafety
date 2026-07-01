-- Harden admin bootstrap: only the configured admin email receives admin.
-- The earlier "first signed-up user becomes admin" fallback is unsafe while public signup is open.
CREATE OR REPLACE FUNCTION public.handle_first_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  configured_admin text;
BEGIN
  SELECT value INTO configured_admin
  FROM public.app_settings
  WHERE key = 'admin_email';

  IF configured_admin IS NOT NULL AND lower(NEW.email) = lower(configured_admin) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_first_user_admin() FROM PUBLIC, anon, authenticated;

-- Remove both historical trigger names, then recreate a single canonical trigger.
DROP TRIGGER IF EXISTS on_auth_user_created_first_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;

CREATE TRIGGER on_auth_user_created_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_first_user_admin();

-- RLS already restricts these actions to admins; this GRANT lets those policies take effect.
GRANT INSERT, DELETE ON public.user_roles TO authenticated;
