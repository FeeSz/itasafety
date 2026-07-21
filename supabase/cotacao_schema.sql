-- ============================================================
-- ItaSafety — Sistema de Carrinho de Cotação B2B
-- Executar no SQL Editor do Supabase (porgyoqngtshxdxuwaft)
-- Seguro para re-executar (idempotente)
-- ============================================================

-- ============================================================
-- 1. TABELA carrinho_cotacao (itens ativos, por usuário)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carrinho_cotacao (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  produto_id  uuid        REFERENCES public.products(id) ON DELETE SET NULL,
  sku         text        NOT NULL,
  nome        text        NOT NULL,
  categoria   text,
  ca_number   text,
  image_url   text,
  quantidade  integer     NOT NULL DEFAULT 1
                          CHECK (quantidade > 0 AND quantidade <= 9999),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_carrinho_user ON public.carrinho_cotacao (user_id);

ALTER TABLE public.carrinho_cotacao ENABLE ROW LEVEL SECURITY;

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_carrinho_updated_at ON public.carrinho_cotacao;
CREATE TRIGGER set_carrinho_updated_at
  BEFORE UPDATE ON public.carrinho_cotacao
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- RLS: usuário só vê/edita o próprio carrinho (sem depender de has_role)
DROP POLICY IF EXISTS "user_select_own_cart"  ON public.carrinho_cotacao;
DROP POLICY IF EXISTS "user_insert_own_cart"  ON public.carrinho_cotacao;
DROP POLICY IF EXISTS "user_update_own_cart"  ON public.carrinho_cotacao;
DROP POLICY IF EXISTS "user_delete_own_cart"  ON public.carrinho_cotacao;
DROP POLICY IF EXISTS "admin_select_all_cart" ON public.carrinho_cotacao;

CREATE POLICY "user_select_own_cart"
  ON public.carrinho_cotacao FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_own_cart"
  ON public.carrinho_cotacao FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_update_own_cart"
  ON public.carrinho_cotacao FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_delete_own_cart"
  ON public.carrinho_cotacao FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_select_all_cart"
  ON public.carrinho_cotacao FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrinho_cotacao TO authenticated;
GRANT ALL ON public.carrinho_cotacao TO service_role;

-- ============================================================
-- 2. TABELA cotacoes (header da cotação finalizada)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cotacoes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  empresa         text        NOT NULL,
  cnpj            text,
  nome_contato    text        NOT NULL,
  telefone        text        NOT NULL,
  email_contato   text        NOT NULL,
  observacoes     text,
  status          text        NOT NULL DEFAULT 'pendente'
                              CHECK (status IN ('pendente','em_analise','respondida','cancelada')),
  numero_cotacao  serial,     -- número legível ex.: #0042
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cotacoes_user   ON public.cotacoes (user_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_status ON public.cotacoes (status);

ALTER TABLE public.cotacoes ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_cotacoes_updated_at ON public.cotacoes;
CREATE TRIGGER set_cotacoes_updated_at
  BEFORE UPDATE ON public.cotacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- RLS cotacoes
DROP POLICY IF EXISTS "user_select_own_cotacao"   ON public.cotacoes;
DROP POLICY IF EXISTS "user_insert_own_cotacao"   ON public.cotacoes;
DROP POLICY IF EXISTS "admin_select_all_cotacoes" ON public.cotacoes;
DROP POLICY IF EXISTS "admin_update_all_cotacoes" ON public.cotacoes;

CREATE POLICY "user_select_own_cotacao"
  ON public.cotacoes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_own_cotacao"
  ON public.cotacoes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_select_all_cotacoes"
  ON public.cotacoes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_all_cotacoes"
  ON public.cotacoes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT ON public.cotacoes TO authenticated;
GRANT ALL ON public.cotacoes TO service_role;

-- ============================================================
-- 3. TABELA cotacao_itens (snapshot dos produtos por cotação)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cotacao_itens (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id  uuid        NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  sku         text        NOT NULL,
  nome        text        NOT NULL,
  categoria   text,
  ca_number   text,
  image_url   text,
  quantidade  integer     NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cotacao_itens_cotacao ON public.cotacao_itens (cotacao_id);

ALTER TABLE public.cotacao_itens ENABLE ROW LEVEL SECURITY;

-- RLS cotacao_itens: acesso via cotacao do próprio user
DROP POLICY IF EXISTS "user_select_own_itens"   ON public.cotacao_itens;
DROP POLICY IF EXISTS "user_insert_own_itens"   ON public.cotacao_itens;
DROP POLICY IF EXISTS "admin_select_all_itens"  ON public.cotacao_itens;

CREATE POLICY "user_select_own_itens"
  ON public.cotacao_itens FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cotacoes c
      WHERE c.id = cotacao_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "user_insert_own_itens"
  ON public.cotacao_itens FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cotacoes c
      WHERE c.id = cotacao_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "admin_select_all_itens"
  ON public.cotacao_itens FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT ON public.cotacao_itens TO authenticated;
GRANT ALL ON public.cotacao_itens TO service_role;

-- ============================================================
-- FIM — Carrinho de Cotação B2B v1
-- ============================================================
