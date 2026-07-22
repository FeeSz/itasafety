BEGIN;

-- ==============================================================================
-- CAMADA 2: Tratamento Específico e Prioritário de user_roles
-- ==============================================================================

-- 1. Revogar TODOS os privilégios de 'anon'
-- Motivo: Nenhum visitante não autenticado tem permissão de ver ou alterar roles
REVOKE ALL ON public.user_roles FROM anon;

-- 2. Revogar privilégios destrutivos e de escrita de 'authenticated'
-- Motivo: Atribuição de role só pode ser feita via RPC SECURITY DEFINER
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.user_roles FROM authenticated;

-- 3. Garantir explicitamente que 'authenticated' possa fazer SELECT
-- Motivo: Necessário para a policy "Users read own roles" funcionar (o usuário checa quem ele é)
GRANT SELECT ON public.user_roles TO authenticated;

COMMIT;
