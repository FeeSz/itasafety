-- 1) Roles enum + user_roles table (canonical pattern; never store role on profiles)
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2) Products catalog
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  brand text,
  short_description text NOT NULL,
  long_description text,
  ca_number text,
  norms text[] NOT NULL DEFAULT '{}',
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_category_idx ON public.products (category) WHERE published;
CREATE INDEX products_featured_idx ON public.products (featured) WHERE published;
CREATE INDEX products_sort_idx ON public.products (sort_order);

-- Public catalog: anyone can read published products. Admin-only mutations.
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins read all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Fix tg_set_updated_at: pin search_path
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- has_role: revoke from PUBLIC (and anon), keep authenticated so RLS USING() works.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;


-- First signed-up user automatically receives admin role.
CREATE OR REPLACE FUNCTION public.handle_first_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_first_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_first_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_first_user_admin();

-- Allow admins to manage user_roles (assign/remove admin/moderator).
CREATE POLICY "Admins manage roles select"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));



REVOKE EXECUTE ON FUNCTION public.handle_first_user_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;



-- ============ app_settings ============
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.app_settings (key, value) VALUES ('admin_email','admin@itasafety.com.br')
ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value;

-- ============ categories ============
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update categories" ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete categories" ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ brands ============
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active brands" ON public.brands FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert brands" ON public.brands FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update brands" ON public.brands FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete brands" ON public.brands FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ auth_attempts (rate limit ad-hoc) ============
CREATE TABLE public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  ip text,
  attempt_type text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.auth_attempts TO authenticated;
GRANT ALL ON public.auth_attempts TO service_role;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view attempts" ON public.auth_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_auth_attempts_email_time ON public.auth_attempts (email, created_at DESC);
CREATE INDEX idx_auth_attempts_ip_time ON public.auth_attempts (ip, created_at DESC);

-- updated_at triggers
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ Updated admin trigger: admin by configured email ============
CREATE OR REPLACE FUNCTION public.handle_first_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  configured_admin text;
BEGIN
  SELECT value INTO configured_admin FROM public.app_settings WHERE key = 'admin_email';

  IF configured_admin IS NOT NULL AND lower(NEW.email) = lower(configured_admin) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_first_user_admin();

-- seed initial categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Proteção da Cabeça','protecao-cabeca',10),
  ('Proteção Visual','protecao-visual',20),
  ('Proteção Auditiva','protecao-auditiva',30),
  ('Proteção Respiratória','protecao-respiratoria',40),
  ('Proteção das Mãos','protecao-maos',50),
  ('Proteção dos Pés','protecao-pes',60),
  ('Vestimentas','vestimentas',70),
  ('Proteção contra Quedas','protecao-quedas',80)
ON CONFLICT (slug) DO NOTHING;


-- auth_attempts is written only by trusted server code with service_role.
-- Authenticated users may read it through the existing admin-only RLS policy.
REVOKE INSERT, UPDATE, DELETE ON public.auth_attempts FROM authenticated;
GRANT SELECT ON public.auth_attempts TO authenticated;
GRANT ALL ON public.auth_attempts TO service_role;


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


-- Restrict EXECUTE on SECURITY DEFINER functions.
-- has_role must remain callable by authenticated users because RLS policies invoke it,
-- but revoke from anon/public. Trigger-only functions are revoked from all app roles.

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.handle_first_user_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_first_user_admin() TO service_role;

REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tg_set_updated_at() TO service_role;

-- Convert has_role to SECURITY INVOKER. It only ever needs to read the caller's own
-- user_roles rows, which the existing "auth.uid() = user_id" SELECT policy allows.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;


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

-- Trigger adicional: quando email é confirmado (INSERT trigger não pega isso)
DROP TRIGGER IF EXISTS on_auth_user_confirmed_admin ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_admin
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.handle_first_user_admin();

CREATE TABLE IF NOT EXISTS public.partners (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    logo_url text NOT NULL,
    href text,
    tagline text,
    sort_order integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT partners_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone."
    ON public.partners FOR SELECT
    USING (true);

CREATE POLICY "Admin users can insert partners."
    ON public.partners FOR INSERT
    WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));

CREATE POLICY "Admin users can update partners."
    ON public.partners FOR UPDATE
    USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))))
    WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));

CREATE POLICY "Admin users can delete partners."
    ON public.partners FOR DELETE
    USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION public.moddatetime('updated_at');

-- Grant permissions
GRANT ALL ON TABLE public.partners TO anon;
GRANT ALL ON TABLE public.partners TO authenticated;
GRANT ALL ON TABLE public.partners TO service_role;

-- Seed Data
INSERT INTO public.partners (name, logo_url, href, tagline, sort_order, active) VALUES
('Canada EPI', '/partners/canada.png', 'https://www.canadaepi.com.br', 'Calçados profissionais', 10, true),
('Mavaro', '/partners/mavaro.png', 'https://www.mavaro.com.br', 'Calçados de segurança', 20, true),
('Conforto', '/partners/conforto.png', 'https://www.confortoepi.com.br', 'Artefatos de couro', 30, true),
('Volk do Brasil', '/partners/volk.png', 'https://www.volkdobrasil.com.br', 'Proteção industrial', 40, true);


insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "Logos Public Access"
on storage.objects for select
to public
using ( bucket_id = 'logos' );

create policy "Admin Users can insert logos"
on storage.objects for insert
with check (
  bucket_id = 'logos'
  and exists (
    select 1
    from user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);

create policy "Admin Users can update logos"
on storage.objects for update
using (
  bucket_id = 'logos'
  and exists (
    select 1
    from user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);

create policy "Admin Users can delete logos"
on storage.objects for delete
using (
  bucket_id = 'logos'
  and exists (
    select 1
    from user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);


-- Migration: fix_partners_rls_and_grants
-- Timestamp: 20260717102500
--
-- PROBLEMA: As políticas de INSERT/UPDATE/DELETE da tabela partners usavam
-- user_roles.role = 'admin'::text, mas user_roles.role é do tipo enum
-- public.app_role, causando incompatibilidade de tipo.
-- Além disso, GRANT ALL TO anon concedia INSERT/UPDATE/DELETE ao papel anônimo.
--
-- ROLLBACK:
--   DROP POLICY IF EXISTS "Admin users can insert partners." ON public.partners;
--   DROP POLICY IF EXISTS "Admin users can update partners." ON public.partners;
--   DROP POLICY IF EXISTS "Admin users can delete partners." ON public.partners;
--   CREATE POLICY "Admin users can insert partners." ON public.partners
--     FOR INSERT WITH CHECK ((EXISTS (SELECT 1 FROM user_roles
--       WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));
--   CREATE POLICY "Admin users can update partners." ON public.partners
--     FOR UPDATE USING ((EXISTS (SELECT 1 FROM user_roles
--       WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))))
--     WITH CHECK ((EXISTS (SELECT 1 FROM user_roles
--       WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));
--   CREATE POLICY "Admin users can delete partners." ON public.partners
--     FOR DELETE USING ((EXISTS (SELECT 1 FROM user_roles
--       WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));
--   GRANT INSERT, UPDATE, DELETE ON public.partners TO anon;

-- 1. Remover as políticas com cast incorreto (DROP IF EXISTS = idempotente)
DROP POLICY IF EXISTS "Admin users can insert partners." ON public.partners;
DROP POLICY IF EXISTS "Admin users can update partners." ON public.partners;
DROP POLICY IF EXISTS "Admin users can delete partners." ON public.partners;

-- 2. Recriar as políticas com has_role(), no padrão do restante do projeto
CREATE POLICY "Admin users can insert partners."
    ON public.partners FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can update partners."
    ON public.partners FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can delete partners."
    ON public.partners FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- 3. Revogar INSERT/UPDATE/DELETE do papel anon (apenas SELECT é necessário)
REVOKE INSERT, UPDATE, DELETE ON public.partners FROM anon;
