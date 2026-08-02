-- ============================================================
-- Restauração do esquema de negócio ItaSafety
-- ============================================================

-- ---------- PARTNERS ----------
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

CREATE POLICY "partners_select_public" ON public.partners
  FOR SELECT USING (true);
CREATE POLICY "partners_admin_insert" ON public.partners
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "partners_admin_update" ON public.partners
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "partners_admin_delete" ON public.partners
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_partners_updated_at BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.partners (name, logo_url, href, tagline, sort_order, active) VALUES
  ('Canada EPI', '/partners/canada.png', 'https://www.canadaepi.com.br', 'Calçados profissionais', 10, true),
  ('Mavaro', '/partners/mavaro.png', 'https://www.mavaro.com.br', 'Calçados de segurança', 20, true),
  ('Conforto', '/partners/conforto.png', 'https://www.confortoepi.com.br', 'Artefatos de couro', 30, true),
  ('Volk do Brasil', '/partners/volk.png', 'https://www.volkdobrasil.com.br', 'Proteção industrial', 40, true),
  ('Super Safety', '/partners/supersafety.png', 'https://www.supersafety.com.br', 'Luvas e proteção', 50, true);

-- ---------- EMPRESAS ----------
DO $$ BEGIN
  CREATE TYPE public.empresa_status AS ENUM ('pendente_aprovacao', 'aprovada', 'rejeitada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  razao_social text NOT NULL,
  cnpj text NOT NULL,
  telefone_contato text NOT NULL,
  nome_contato text NOT NULL,
  endereco_cadastral text,
  logo_url text,
  status public.empresa_status NOT NULL DEFAULT 'pendente_aprovacao',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.empresas TO authenticated;
GRANT ALL ON public.empresas TO service_role;

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_empresa" ON public.empresas
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin_select_all_empresas" ON public.empresas
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_insert_own_empresa" ON public.empresas
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pendente_aprovacao'::public.empresa_status);
CREATE POLICY "admin_update_empresas" ON public.empresas
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_update_rejected_empresa" ON public.empresas
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'rejeitada'::public.empresa_status)
  WITH CHECK (auth.uid() = user_id AND status = 'pendente_aprovacao'::public.empresa_status);

CREATE TRIGGER set_empresas_updated_at BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- CHANGE REQUESTS ----------
DO $$ BEGIN
  CREATE TYPE public.change_request_status AS ENUM ('pendente', 'aprovada', 'rejeitada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.empresa_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campo_alterado text NOT NULL,
  valor_atual text,
  valor_proposto text,
  status public.change_request_status NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_request
  ON public.empresa_change_requests (empresa_id, campo_alterado) WHERE status = 'pendente';

GRANT SELECT, INSERT, UPDATE ON public.empresa_change_requests TO authenticated;
GRANT ALL ON public.empresa_change_requests TO service_role;

ALTER TABLE public.empresa_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_requests" ON public.empresa_change_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_requests" ON public.empresa_change_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pendente'::public.change_request_status
    AND EXISTS (SELECT 1 FROM public.empresas e WHERE e.id = empresa_id AND e.user_id = auth.uid())
  );
CREATE POLICY "admin_select_all_requests" ON public.empresa_change_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_requests" ON public.empresa_change_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- CARRINHO ----------
CREATE TABLE IF NOT EXISTS public.carrinho_cotacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  sku text NOT NULL,
  nome text NOT NULL,
  categoria text,
  ca_number text,
  image_url text,
  quantidade integer NOT NULL DEFAULT 1 CHECK (quantidade > 0 AND quantidade <= 9999),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_carrinho_user ON public.carrinho_cotacao (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrinho_cotacao TO authenticated;
GRANT ALL ON public.carrinho_cotacao TO service_role;

ALTER TABLE public.carrinho_cotacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_cart" ON public.carrinho_cotacao
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_insert_own_cart" ON public.carrinho_cotacao
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_update_own_cart" ON public.carrinho_cotacao
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_delete_own_cart" ON public.carrinho_cotacao
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin_select_all_cart" ON public.carrinho_cotacao
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_carrinho_updated_at BEFORE UPDATE ON public.carrinho_cotacao
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- COTACOES ----------
DO $$ BEGIN
  CREATE TYPE public.cotacao_status AS ENUM ('enviado', 'em_analise', 'respondido', 'devolvido');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.cotacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_cotacao serial,
  empresa text NOT NULL,
  cnpj text,
  nome_contato text NOT NULL,
  telefone text NOT NULL,
  email_contato text NOT NULL,
  observacoes text,
  status public.cotacao_status NOT NULL DEFAULT 'enviado',
  visualizado_em timestamptz,
  visualizado_por uuid REFERENCES auth.users(id),
  proposta_mensagem text,
  motivo_devolucao text,
  impostos text,
  prazo_entrega text,
  condicoes_pagamento text,
  frete text,
  validade_orcamento_dias integer,
  endereco_entrega text,
  respondido_em timestamptz,
  respondido_por uuid REFERENCES auth.users(id),
  notificacao_enviada_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cotacoes_user ON public.cotacoes (user_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_status ON public.cotacoes (status);

GRANT SELECT, INSERT ON public.cotacoes TO authenticated;
GRANT UPDATE (notificacao_enviada_em) ON public.cotacoes TO authenticated;
GRANT ALL ON public.cotacoes TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.cotacoes_numero_cotacao_seq TO authenticated, service_role;

ALTER TABLE public.cotacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_cotacao" ON public.cotacoes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_insert_own_cotacao" ON public.cotacoes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_select_all_cotacoes" ON public.cotacoes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_all_cotacoes" ON public.cotacoes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_update_own_cotacao_notificacao" ON public.cotacoes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_cotacoes_updated_at BEFORE UPDATE ON public.cotacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- COTACAO ITENS ----------
CREATE TABLE IF NOT EXISTS public.cotacao_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id uuid NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  sku text NOT NULL,
  nome text NOT NULL,
  categoria text,
  ca_number text,
  image_url text,
  quantidade integer NOT NULL DEFAULT 1,
  preco_unitario numeric(15,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cotacao_itens_cotacao ON public.cotacao_itens (cotacao_id);

GRANT SELECT, INSERT ON public.cotacao_itens TO authenticated;
GRANT ALL ON public.cotacao_itens TO service_role;

ALTER TABLE public.cotacao_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_itens" ON public.cotacao_itens
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cotacoes c WHERE c.id = cotacao_id AND c.user_id = auth.uid()));
CREATE POLICY "user_insert_own_itens" ON public.cotacao_itens
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.cotacoes c WHERE c.id = cotacao_id AND c.user_id = auth.uid()));
CREATE POLICY "admin_select_all_itens" ON public.cotacao_itens
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---------- HISTORICO ----------
CREATE TABLE IF NOT EXISTS public.cotacao_historico_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id uuid NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  status_anterior public.cotacao_status,
  status_novo public.cotacao_status NOT NULL,
  alterado_por uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cotacao_historico_cotacao
  ON public.cotacao_historico_status (cotacao_id);

GRANT SELECT ON public.cotacao_historico_status TO authenticated;
GRANT ALL ON public.cotacao_historico_status TO service_role;

ALTER TABLE public.cotacao_historico_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_historico" ON public.cotacao_historico_status
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cotacoes c WHERE c.id = cotacao_id AND c.user_id = auth.uid()));
CREATE POLICY "admin_select_all_historico" ON public.cotacao_historico_status
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---------- NOTIFICACOES ----------
DO $$ BEGIN
  CREATE TYPE public.notificacao_status AS ENUM ('pendente', 'enviado', 'falhou');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.notificacao_tipo AS ENUM ('respondido', 'devolvido');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.cotacao_notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id uuid NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  tipo public.notificacao_tipo NOT NULL,
  status_envio public.notificacao_status NOT NULL DEFAULT 'pendente',
  erro text,
  tentativas int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cotacao_notificacoes_cotacao
  ON public.cotacao_notificacoes (cotacao_id);

GRANT SELECT ON public.cotacao_notificacoes TO authenticated;
GRANT ALL ON public.cotacao_notificacoes TO service_role;

ALTER TABLE public.cotacao_notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_notificacoes" ON public.cotacao_notificacoes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_notificacoes_updated_at BEFORE UPDATE ON public.cotacao_notificacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- TRIGGERS DE NEGOCIO ----------
CREATE OR REPLACE FUNCTION public.tg_resolver_empresa_cotacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa public.empresas%ROWTYPE;
BEGIN
  SELECT * INTO v_empresa FROM public.empresas WHERE user_id = auth.uid();

  IF NOT FOUND OR v_empresa.status <> 'aprovada' THEN
    RAISE EXCEPTION 'Apenas usuários com empresa aprovada podem enviar ou modificar cotações.';
  END IF;

  NEW.empresa := v_empresa.razao_social;
  NEW.cnpj := v_empresa.cnpj;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.tg_resolver_empresa_cotacao() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tg_resolver_empresa_cotacao() TO service_role;

CREATE TRIGGER tg_cotacoes_resolver_empresa
  BEFORE INSERT OR UPDATE OF empresa, cnpj ON public.cotacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_resolver_empresa_cotacao();

CREATE OR REPLACE FUNCTION public.tg_log_cotacao_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author uuid;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    v_author := COALESCE(auth.uid(), NULLIF(current_setting('app.acted_by', true), '')::uuid);
    INSERT INTO public.cotacao_historico_status
      (cotacao_id, status_anterior, status_novo, alterado_por)
    VALUES (NEW.id, OLD.status, NEW.status, v_author);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.tg_log_cotacao_status() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tg_log_cotacao_status() TO service_role;

CREATE TRIGGER log_cotacao_status_change
  AFTER UPDATE ON public.cotacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_log_cotacao_status();

-- ---------- RPCS ----------
CREATE OR REPLACE FUNCTION public.marcar_em_analise(_cotacao_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem chamar marcar_em_analise.';
  END IF;

  UPDATE public.cotacoes
  SET status = 'em_analise', visualizado_em = now(), visualizado_por = auth.uid()
  WHERE id = _cotacao_id AND status = 'enviado';
END;
$$;

REVOKE ALL ON FUNCTION public.marcar_em_analise(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.marcar_em_analise(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.responder_cotacao(
  p_cotacao_id uuid,
  p_status_novo public.cotacao_status,
  p_proposta_mensagem text DEFAULT NULL,
  p_motivo_devolucao text DEFAULT NULL,
  p_impostos text DEFAULT NULL,
  p_prazo_entrega text DEFAULT NULL,
  p_condicoes_pagamento text DEFAULT NULL,
  p_frete text DEFAULT NULL,
  p_validade_orcamento_dias integer DEFAULT NULL,
  p_endereco_entrega text DEFAULT NULL,
  p_itens jsonb DEFAULT '[]'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_uid uuid;
  v_status_atual public.cotacao_status;
  item_rec record;
  v_update_count int;
BEGIN
  v_admin_uid := auth.uid();
  IF NOT public.has_role(v_admin_uid, 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem responder cotações'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_status_novo NOT IN ('respondido', 'devolvido') THEN
    RAISE EXCEPTION 'Transição inválida: esta função só aceita respondido ou devolvido.'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT status INTO v_status_atual FROM public.cotacoes WHERE id = p_cotacao_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cotação não encontrada.' USING ERRCODE = 'P0001';
  END IF;

  IF v_status_atual = 'respondido' THEN
    RAISE EXCEPTION 'Cotação já respondida. Ação bloqueada.' USING ERRCODE = 'P0001';
  END IF;

  IF p_status_novo = 'respondido' AND jsonb_array_length(p_itens) > 0 THEN
    FOR item_rec IN
      SELECT * FROM jsonb_to_recordset(p_itens) AS x(item_id uuid, preco_unitario numeric)
    LOOP
      UPDATE public.cotacao_itens
      SET preco_unitario = item_rec.preco_unitario
      WHERE id = item_rec.item_id AND cotacao_id = p_cotacao_id;

      GET DIAGNOSTICS v_update_count = ROW_COUNT;
      IF v_update_count = 0 THEN
        RAISE EXCEPTION 'Item % não pertence à cotação % ou não existe.', item_rec.item_id, p_cotacao_id
          USING ERRCODE = 'P0001';
      END IF;
    END LOOP;
  END IF;

  PERFORM set_config('app.acted_by', v_admin_uid::text, true);

  UPDATE public.cotacoes
  SET status = p_status_novo,
      proposta_mensagem = p_proposta_mensagem,
      motivo_devolucao = p_motivo_devolucao,
      impostos = p_impostos,
      prazo_entrega = p_prazo_entrega,
      condicoes_pagamento = p_condicoes_pagamento,
      frete = p_frete,
      validade_orcamento_dias = p_validade_orcamento_dias,
      endereco_entrega = p_endereco_entrega,
      respondido_em = now(),
      respondido_por = v_admin_uid
  WHERE id = p_cotacao_id;
END;
$$;

REVOKE ALL ON FUNCTION public.responder_cotacao(uuid, public.cotacao_status, text, text, text, text, text, text, integer, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.responder_cotacao(uuid, public.cotacao_status, text, text, text, text, text, text, integer, text, jsonb) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.atualizar_logo_empresa(p_logo_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.empresas SET logo_url = p_logo_url WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.atualizar_logo_empresa(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.atualizar_logo_empresa(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.aprovar_change_request(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.empresa_change_requests%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem aprovar change requests'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO v_request FROM public.empresa_change_requests WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Change request não encontrada.' USING ERRCODE = 'P0002';
  END IF;

  IF v_request.status <> 'pendente' THEN
    RAISE EXCEPTION 'A solicitação já foi processada (status: %)', v_request.status;
  END IF;

  IF v_request.campo_alterado NOT IN
     ('razao_social', 'cnpj', 'telefone_contato', 'nome_contato', 'endereco_cadastral') THEN
    RAISE EXCEPTION 'Tentativa de alteração de coluna não permitida: %', v_request.campo_alterado
      USING ERRCODE = 'P0001';
  END IF;

  EXECUTE format('UPDATE public.empresas SET %I = $1 WHERE id = $2', v_request.campo_alterado)
    USING v_request.valor_proposto, v_request.empresa_id;

  UPDATE public.empresa_change_requests
  SET status = 'aprovada', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.aprovar_change_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aprovar_change_request(uuid) TO authenticated, service_role;