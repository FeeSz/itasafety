BEGIN;

-- ==============================================================================
-- CAMADA 1.5: Fix RLS explícito (Preenchimento do WITH CHECK)
-- ==============================================================================
-- Transforma o comportamento implícito do Postgres (fallback pro USING) 
-- em uma trava explícita gravada no catálogo.

-- 1. PRODUCTS
DROP POLICY IF EXISTS "Admins update products" ON public.products;
CREATE POLICY "Admins update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. CATEGORIES
DROP POLICY IF EXISTS "Admins update categories" ON public.categories;
CREATE POLICY "Admins update categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. BRANDS
DROP POLICY IF EXISTS "Admins update brands" ON public.brands;
CREATE POLICY "Admins update brands" ON public.brands
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMIT;
