BEGIN;

-- ==============================================================================
-- 1. TABELAS DE CATÁLOGO PÚBLICO (anon precisa ler, ninguem trunca/apaga)
-- ==============================================================================

-- Tabela: products
REVOKE ALL ON public.products FROM anon;
GRANT SELECT ON public.products TO anon;
REVOKE TRUNCATE, DELETE ON public.products FROM authenticated;

-- Tabela: categories
REVOKE ALL ON public.categories FROM anon;
GRANT SELECT ON public.categories TO anon;
REVOKE TRUNCATE, DELETE ON public.categories FROM authenticated;

-- Tabela: brands
REVOKE ALL ON public.brands FROM anon;
GRANT SELECT ON public.brands TO anon;
REVOKE TRUNCATE, DELETE ON public.brands FROM authenticated;

-- Tabela: partners
REVOKE ALL ON public.partners FROM anon;
GRANT SELECT ON public.partners TO anon;
REVOKE TRUNCATE, DELETE ON public.partners FROM authenticated;

-- Tabela: app_settings
REVOKE ALL ON public.app_settings FROM anon;
GRANT SELECT ON public.app_settings TO anon;
REVOKE TRUNCATE, DELETE ON public.app_settings FROM authenticated;


-- ==============================================================================
-- 2. TABELAS DE COTAÇÃO E DADOS PRIVADOS (anon totalmente bloqueado)
-- ==============================================================================

-- Tabela: carrinho_cotacao
REVOKE ALL ON public.carrinho_cotacao FROM anon;
REVOKE TRUNCATE ON public.carrinho_cotacao FROM authenticated;
-- (DELETE mantido para authenticated pois usuários removem itens do carrinho)

-- Tabela: cotacoes (Reforço da migração anterior caso algo tenha faltado)
REVOKE ALL ON public.cotacoes FROM anon;
REVOKE TRUNCATE, DELETE ON public.cotacoes FROM authenticated;

-- Tabela: cotacao_itens
REVOKE ALL ON public.cotacao_itens FROM anon;
REVOKE TRUNCATE, DELETE ON public.cotacao_itens FROM authenticated;

-- Tabela: cotacao_historico_status
REVOKE ALL ON public.cotacao_historico_status FROM anon;
REVOKE TRUNCATE, DELETE, UPDATE ON public.cotacao_historico_status FROM authenticated;

-- Tabela: cotacao_notificacoes
REVOKE ALL ON public.cotacao_notificacoes FROM anon;
REVOKE TRUNCATE, DELETE ON public.cotacao_notificacoes FROM authenticated;

-- Tabela: auth_attempts
REVOKE ALL ON public.auth_attempts FROM anon;
REVOKE TRUNCATE, DELETE, UPDATE ON public.auth_attempts FROM authenticated;

COMMIT;
