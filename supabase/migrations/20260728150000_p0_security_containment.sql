-- P0 security containment and live-schema reconciliation.
--
-- This migration is intentionally limited to authorization boundaries:
--   1. remove the recursive user_roles/has_role dependency;
--   2. remove the legacy responder_cotacao overload that trusted _admin_id;
--   3. replace implicit broad grants with an explicit application matrix;
--   4. stop future postgres-owned objects from inheriting broad app-role grants;
--   5. harden EXECUTE grants and search_path on callable/trigger functions.
--
-- It does not modify business data.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Prevent new postgres-owned objects from reopening the same exposure.
-- ---------------------------------------------------------------------------

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;

REVOKE CREATE ON SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Make has_role non-recursive and constrain it to the authenticated caller.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role public.app_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $function$
  SELECT
    _user_id IS NOT NULL
    AND _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.user_roles AS ur
      WHERE ur.user_id = _user_id
        AND ur.role = _role
    );
$function$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  TO authenticated, service_role;

-- Role assignment is not a direct client-table operation. Keeping only the
-- own-role SELECT policy also removes the circular policy graph permanently.
DROP POLICY IF EXISTS "Admins manage roles select" ON public.user_roles;
DROP POLICY IF EXISTS "Admins insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;

-- ---------------------------------------------------------------------------
-- 3. Remove the obsolete privileged RPC that accepted a caller-supplied admin.
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.responder_cotacao(
  uuid,
  uuid,
  public.cotacao_status,
  text,
  text
);

-- Reconcile columns already required by the deployed UI, Edge Function and
-- current responder_cotacao signature. These columns were present only in
-- loose SQL scripts and were not fully applied to production.
ALTER TABLE public.cotacoes
  ADD COLUMN IF NOT EXISTS impostos text,
  ADD COLUMN IF NOT EXISTS prazo_entrega text,
  ADD COLUMN IF NOT EXISTS condicoes_pagamento text,
  ADD COLUMN IF NOT EXISTS respondido_em timestamptz,
  ADD COLUMN IF NOT EXISTS respondido_por uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS notificacao_enviada_em timestamptz;

ALTER TABLE public.cotacao_itens
  ADD COLUMN IF NOT EXISTS preco_unitario numeric(15,2);

-- Canonical implementation matching the JSON contract emitted by the admin UI
-- (`id`, not the stale `item_id` key used by the loose SQL script).
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
SET search_path = pg_catalog, public, pg_temp
AS $function$
DECLARE
  v_admin_uid uuid := auth.uid();
  v_status_atual public.cotacao_status;
  v_item record;
  v_update_count integer;
BEGIN
  IF v_admin_uid IS NULL
     OR NOT public.has_role(v_admin_uid, 'admin') THEN
    RAISE EXCEPTION
      'Acesso negado: apenas administradores podem responder cotacoes'
      USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  IF p_status_novo NOT IN ('respondido', 'devolvido') THEN
    RAISE EXCEPTION 'Transicao de status invalida'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT c.status
  INTO v_status_atual
  FROM public.cotacoes AS c
  WHERE c.id = p_cotacao_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cotacao nao encontrada'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_status_atual NOT IN ('enviado', 'em_analise') THEN
    RAISE EXCEPTION
      'Cotacao ja processada ou em status incompativel: %',
      v_status_atual
      USING ERRCODE = 'P0001', HINT = 'cotacao_ja_processada';
  END IF;

  IF p_status_novo = 'respondido' THEN
    IF p_itens IS NULL
       OR jsonb_typeof(p_itens) <> 'array'
       OR jsonb_array_length(p_itens) = 0 THEN
      RAISE EXCEPTION
        'Uma resposta deve conter ao menos um item com preco'
        USING ERRCODE = 'P0001';
    END IF;

    IF p_validade_orcamento_dias IS NOT NULL
       AND p_validade_orcamento_dias <= 0 THEN
      RAISE EXCEPTION
        'A validade do orcamento deve ser maior que zero'
        USING ERRCODE = 'P0001';
    END IF;

    FOR v_item IN
      SELECT *
      FROM pg_catalog.jsonb_to_recordset(p_itens)
        AS item(id uuid, preco_unitario numeric)
    LOOP
      IF v_item.id IS NULL
         OR v_item.preco_unitario IS NULL
         OR v_item.preco_unitario <= 0 THEN
        RAISE EXCEPTION
          'Item ou preco unitario invalido na resposta'
          USING ERRCODE = 'P0001';
      END IF;

      UPDATE public.cotacao_itens
      SET preco_unitario = v_item.preco_unitario
      WHERE id = v_item.id
        AND cotacao_id = p_cotacao_id;

      GET DIAGNOSTICS v_update_count = ROW_COUNT;
      IF v_update_count <> 1 THEN
        RAISE EXCEPTION
          'Item % nao pertence a cotacao %',
          v_item.id,
          p_cotacao_id
          USING ERRCODE = 'P0001';
      END IF;
    END LOOP;
  END IF;

  PERFORM set_config('app.acted_by', v_admin_uid::text, true);

  UPDATE public.cotacoes
  SET
    status = p_status_novo,
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
$function$;

-- ---------------------------------------------------------------------------
-- 4. Reset table grants, then grant only what current application flows use.
--    RLS remains the row-level authorization boundary for every table below.
-- ---------------------------------------------------------------------------

REVOKE ALL ON ALL TABLES IN SCHEMA public
  FROM PUBLIC, anon, authenticated;

-- Public catalog.
GRANT SELECT ON TABLE
  public.app_settings,
  public.products,
  public.categories,
  public.brands,
  public.partners
TO anon, authenticated;

-- Catalog administration is performed directly by authenticated admin pages
-- and is restricted by the existing admin RLS policies.
GRANT INSERT, UPDATE, DELETE ON TABLE
  public.app_settings,
  public.products,
  public.categories,
  public.brands,
  public.partners
TO authenticated;

-- Private user/admin tables.
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT SELECT ON TABLE public.auth_attempts TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.carrinho_cotacao
  TO authenticated;

GRANT SELECT
  ON TABLE public.cotacoes
  TO authenticated;

GRANT INSERT (
  user_id,
  empresa,
  cnpj,
  nome_contato,
  telefone,
  email_contato,
  observacoes
) ON TABLE public.cotacoes
TO authenticated;

-- The Edge Function needs to set only this idempotency marker as the user.
GRANT UPDATE (notificacao_enviada_em)
  ON TABLE public.cotacoes
  TO authenticated;

GRANT SELECT ON TABLE public.cotacao_itens TO authenticated;
GRANT INSERT (
  cotacao_id,
  sku,
  nome,
  categoria,
  ca_number,
  image_url,
  quantidade
) ON TABLE public.cotacao_itens
TO authenticated;

GRANT SELECT
  ON TABLE
    public.cotacao_historico_status,
    public.cotacao_notificacoes
  TO authenticated;

GRANT SELECT, INSERT, UPDATE
  ON TABLE public.empresas
  TO authenticated;

GRANT SELECT, UPDATE
  ON TABLE public.empresa_change_requests
  TO authenticated;
GRANT INSERT (
  empresa_id,
  user_id,
  campo_alterado,
  valor_atual,
  valor_proposto
) ON TABLE public.empresa_change_requests
TO authenticated;

-- service_role remains the server-side maintenance role.
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public
  FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SEQUENCE public.cotacoes_numero_cotacao_seq
  TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- The column-level UPDATE grant above still requires an UPDATE policy.
DROP POLICY IF EXISTS "user_update_own_cotacao_notificacao"
  ON public.cotacoes;
CREATE POLICY "user_update_own_cotacao_notificacao"
  ON public.cotacoes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. Function exposure and search_path hardening.
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.marcar_em_analise(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.marcar_em_analise(uuid)
  TO authenticated, service_role;
ALTER FUNCTION public.marcar_em_analise(uuid)
  SET search_path = pg_catalog, public, pg_temp;

REVOKE ALL ON FUNCTION public.responder_cotacao(
  uuid,
  public.cotacao_status,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  text,
  jsonb
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.responder_cotacao(
  uuid,
  public.cotacao_status,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  text,
  jsonb
) TO authenticated, service_role;
ALTER FUNCTION public.responder_cotacao(
  uuid,
  public.cotacao_status,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  text,
  jsonb
) SET search_path = pg_catalog, public, pg_temp;

REVOKE ALL ON FUNCTION public.aprovar_change_request(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aprovar_change_request(uuid)
  TO authenticated, service_role;
ALTER FUNCTION public.aprovar_change_request(uuid)
  SET search_path = pg_catalog, public, pg_temp;

REVOKE ALL ON FUNCTION public.atualizar_logo_empresa(text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.atualizar_logo_empresa(text)
  TO authenticated, service_role;
ALTER FUNCTION public.atualizar_logo_empresa(text)
  SET search_path = pg_catalog, public, pg_temp;

-- Trigger/event-trigger helpers must not be callable from the Data API.
REVOKE ALL ON FUNCTION public.handle_first_user_admin()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_log_cotacao_status()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_resolver_empresa_cotacao()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_set_updated_at()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable()
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.handle_first_user_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.tg_log_cotacao_status() TO service_role;
GRANT EXECUTE ON FUNCTION public.tg_resolver_empresa_cotacao() TO service_role;
GRANT EXECUTE ON FUNCTION public.tg_set_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role;

ALTER FUNCTION public.handle_first_user_admin()
  SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.tg_log_cotacao_status()
  SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.tg_resolver_empresa_cotacao()
  SET search_path = pg_catalog, public, pg_temp;

COMMIT;
