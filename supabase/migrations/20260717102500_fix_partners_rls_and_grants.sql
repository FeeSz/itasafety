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