-- 1) Remove trigger duplicado
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;

-- 2) Endurece handle_first_user_admin: exige email confirmado no path do admin_email
CREATE OR REPLACE FUNCTION public.handle_first_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  configured_admin text;
BEGIN
  SELECT value INTO configured_admin FROM public.app_settings WHERE key = 'admin_email';

  IF configured_admin IS NOT NULL
     AND lower(NEW.email) = lower(configured_admin)
     AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF configured_admin IS NULL
        AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    -- Bootstrap: primeiro usuário do sistema vira admin apenas quando NÃO há
    -- admin_email configurado. Sem confirmação de email para não travar o setup inicial.
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;