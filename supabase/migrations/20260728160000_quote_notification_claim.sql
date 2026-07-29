-- Atomic claim/finalize protocol for the new-quote email workflow.
-- Only the Edge Function's service role may call these functions.

BEGIN;

ALTER TABLE public.cotacoes
  ADD COLUMN IF NOT EXISTS notificacao_processando_em timestamptz;

CREATE OR REPLACE FUNCTION public.claim_nova_cotacao_notification(
  p_cotacao_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $function$
BEGIN
  IF p_cotacao_id IS NULL OR p_user_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.cotacoes
  SET notificacao_processando_em = now()
  WHERE id = p_cotacao_id
    AND user_id = p_user_id
    AND status = 'enviado'
    AND notificacao_enviada_em IS NULL
    AND (
      notificacao_processando_em IS NULL
      OR notificacao_processando_em < now() - interval '10 minutes'
    );

  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.finalizar_nova_cotacao_notification(
  p_cotacao_id uuid,
  p_user_id uuid,
  p_sucesso boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $function$
BEGIN
  IF p_cotacao_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Cotacao e usuario sao obrigatorios'
      USING ERRCODE = '22004';
  END IF;

  IF p_sucesso THEN
    UPDATE public.cotacoes
    SET
      notificacao_enviada_em = now(),
      notificacao_processando_em = NULL
    WHERE id = p_cotacao_id
      AND user_id = p_user_id
      AND notificacao_enviada_em IS NULL
      AND notificacao_processando_em IS NOT NULL;
  ELSE
    UPDATE public.cotacoes
    SET notificacao_processando_em = NULL
    WHERE id = p_cotacao_id
      AND user_id = p_user_id
      AND notificacao_enviada_em IS NULL;
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_nova_cotacao_notification(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.finalizar_nova_cotacao_notification(
  uuid,
  uuid,
  boolean
) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.claim_nova_cotacao_notification(uuid, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.finalizar_nova_cotacao_notification(
  uuid,
  uuid,
  boolean
) TO service_role;

-- The client no longer writes notification markers directly.
REVOKE UPDATE (notificacao_enviada_em)
  ON TABLE public.cotacoes
  FROM authenticated;
DROP POLICY IF EXISTS "user_update_own_cotacao_notificacao"
  ON public.cotacoes;

COMMIT;
