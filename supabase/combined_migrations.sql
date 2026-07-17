-- ============================================================
-- ItaSafety — Schema Completo (aplicar no SQL Editor do Supabase)
-- Projeto: porgyoqngtshxdxuwaft
-- Admin: felypelopes7@gmail.com
-- Versao: idempotente (seguro para re-executar)
-- ============================================================

-- ============================================================
-- 1. ENUM de roles
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. FUNCAO has_role (SECURITY INVOKER)
-- ============================================================
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

-- ============================================================
-- 3. FUNCAO tg_set_updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tg_set_updated_at() TO service_role;

-- ============================================================
-- 4. TABELA user_roles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. TABELA app_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage settings" ON public.app_settings;
CREATE POLICY "Admins manage settings"
  ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS set_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER set_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.app_settings (key, value)
VALUES ('admin_email', 'felypelopes7@gmail.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- 6. FUNCAO handle_first_user_admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_first_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  configured_admin text;
BEGIN
  SELECT value INTO configured_admin
  FROM public.app_settings
  WHERE key = 'admin_email';

  IF configured_admin IS NOT NULL
     AND lower(NEW.email) = lower(configured_admin)
     AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$func$;

REVOKE ALL ON FUNCTION public.handle_first_user_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_first_user_admin() TO service_role;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_user_admin();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_admin ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_admin
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_first_user_admin();

-- ============================================================
-- 7. TABELA products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
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

CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category) WHERE published;
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products (featured) WHERE published;
CREATE INDEX IF NOT EXISTS products_sort_idx ON public.products (sort_order);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published products" ON public.products;
DROP POLICY IF EXISTS "Admins read all products" ON public.products;
DROP POLICY IF EXISTS "Admins insert products" ON public.products;
DROP POLICY IF EXISTS "Admins update products" ON public.products;
DROP POLICY IF EXISTS "Admins delete products" ON public.products;

CREATE POLICY "Public read published products"
  ON public.products FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins read all products"
  ON public.products FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 8. TABELA categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
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

DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins delete categories" ON public.categories;

CREATE POLICY "Public read active categories"
  ON public.categories FOR SELECT TO anon, authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert categories"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update categories"
  ON public.categories FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete categories"
  ON public.categories FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Protecao da Cabeca',       'protecao-cabeca',        10),
  ('Protecao Visual',          'protecao-visual',        20),
  ('Protecao Auditiva',        'protecao-auditiva',      30),
  ('Protecao Respiratoria',    'protecao-respiratoria',  40),
  ('Protecao das Maos',        'protecao-maos',          50),
  ('Protecao dos Pes',         'protecao-pes',           60),
  ('Vestimentas',              'vestimentas',            70),
  ('Protecao contra Quedas',   'protecao-quedas',        80)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 9. TABELA brands
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brands (
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

DROP POLICY IF EXISTS "Public read active brands" ON public.brands;
DROP POLICY IF EXISTS "Admins insert brands" ON public.brands;
DROP POLICY IF EXISTS "Admins update brands" ON public.brands;
DROP POLICY IF EXISTS "Admins delete brands" ON public.brands;

CREATE POLICY "Public read active brands"
  ON public.brands FOR SELECT TO anon, authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert brands"
  ON public.brands FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update brands"
  ON public.brands FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete brands"
  ON public.brands FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS set_brands_updated_at ON public.brands;
CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 10. TABELA partners
-- ============================================================
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  href text,
  tagline text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read partners" ON public.partners;
DROP POLICY IF EXISTS "Admins insert partners" ON public.partners;
DROP POLICY IF EXISTS "Admins update partners" ON public.partners;
DROP POLICY IF EXISTS "Admins delete partners" ON public.partners;

CREATE POLICY "Public read partners"
  ON public.partners FOR SELECT
  USING (true);

CREATE POLICY "Admins insert partners"
  ON public.partners FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update partners"
  ON public.partners FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete partners"
  ON public.partners FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS set_partners_updated_at ON public.partners;
CREATE TRIGGER set_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.partners (name, logo_url, href, tagline, sort_order, active) VALUES
  ('Canada EPI',     '/partners/canada.png',   'https://www.canadaepi.com.br',    'Calcados profissionais', 10, true),
  ('Mavaro',         '/partners/mavaro.png',   'https://www.mavaro.com.br',       'Calcados de seguranca',  20, true),
  ('Conforto',       '/partners/conforto.png', 'https://www.confortoepi.com.br',  'Artefatos de couro',     30, true),
  ('Volk do Brasil', '/partners/volk.png',     'https://www.volkdobrasil.com.br', 'Protecao industrial',    40, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. TABELA auth_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  ip text,
  attempt_type text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.auth_attempts TO authenticated;
GRANT ALL ON public.auth_attempts TO service_role;

ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view attempts" ON public.auth_attempts;
CREATE POLICY "Admins view attempts"
  ON public.auth_attempts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_time ON public.auth_attempts (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_time ON public.auth_attempts (ip, created_at DESC);

-- ============================================================
-- 12. STORAGE — bucket logos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Logos public read" ON storage.objects;
DROP POLICY IF EXISTS "Admins insert logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins update logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete logos" ON storage.objects;

CREATE POLICY "Logos public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'logos');

CREATE POLICY "Admins insert logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update logos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- FIM — Schema ItaSafety v2 (idempotente)
-- ============================================================