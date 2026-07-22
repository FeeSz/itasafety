-- 1. ADD COLUMNS TO cotacoes
ALTER TABLE public.cotacoes
  ADD COLUMN IF NOT EXISTS impostos text,
  ADD COLUMN IF NOT EXISTS prazo_entrega text,
  ADD COLUMN IF NOT EXISTS condicoes_pagamento text,
  ADD COLUMN IF NOT EXISTS respondido_em timestamptz,
  ADD COLUMN IF NOT EXISTS respondido_por uuid REFERENCES auth.users(id);

-- 2. ADD COLUMN TO cotacao_itens
ALTER TABLE public.cotacao_itens
  ADD COLUMN IF NOT EXISTS preco_unitario numeric(15,2);

-- 3. RECREATE responder_cotacao
-- Precisamos fazer o DROP da antiga porque a assinatura (parâmetros) mudou.
DROP FUNCTION IF EXISTS public.responder_cotacao(uuid, uuid, public.cotacao_status, text, text);

CREATE OR REPLACE FUNCTION public.responder_cotacao(
  p_cotacao_id uuid,
  p_status_novo public.cotacao_status,
  p_proposta_mensagem text DEFAULT NULL,
  p_motivo_devolucao text DEFAULT NULL,
  p_impostos text DEFAULT NULL,
  p_prazo_entrega text DEFAULT NULL,
  p_condicoes_pagamento text DEFAULT NULL,
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
  -- =========================================================================
  -- SEGURANÇA 1: Validação explícita de role via auth.uid() no topo da função
  -- =========================================================================
  v_admin_uid := auth.uid();
  IF NOT public.has_role(v_admin_uid, 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem responder cotações'
      USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  -- Valida a transição permitida
  IF p_status_novo NOT IN ('respondido', 'devolvido') THEN
    RAISE EXCEPTION 'Transição inválida: esta função só aceita respondido ou devolvido.'
      USING ERRCODE = 'P0001';
  END IF;

  -- =========================================================================
  -- SEGURANÇA 2: Idempotência e bloqueio de reexecução
  -- =========================================================================
  SELECT status INTO v_status_atual
  FROM public.cotacoes
  WHERE id = p_cotacao_id
  FOR UPDATE; -- Dá um lock na linha para prevenir concorrência (Race Condition)

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cotação não encontrada.' USING ERRCODE = 'P0001';
  END IF;

  IF v_status_atual = 'respondido' THEN
    RAISE EXCEPTION 'Cotação já respondida. Ação bloqueada.' USING ERRCODE = 'P0001';
  END IF;

  -- Processa os itens se houver preços sendo enviados
  IF p_status_novo = 'respondido' AND jsonb_array_length(p_itens) > 0 THEN
    FOR item_rec IN SELECT * FROM jsonb_to_recordset(p_itens) AS x(item_id uuid, preco_unitario numeric)
    LOOP
      -- =========================================================================
      -- SEGURANÇA 3: Validação de pertinência do item à cotação no próprio UPDATE
      -- =========================================================================
      UPDATE public.cotacao_itens
      SET preco_unitario = item_rec.preco_unitario
      WHERE id = item_rec.item_id 
        AND cotacao_id = p_cotacao_id;

      GET DIAGNOSTICS v_update_count = ROW_COUNT;
      
      -- Aborta a transação e impede atualizações parciais
      IF v_update_count = 0 THEN
        RAISE EXCEPTION 'Falha de segurança/integridade: item % não pertence à cotação % ou não existe.', item_rec.item_id, p_cotacao_id
          USING ERRCODE = 'P0001';
      END IF;
    END LOOP;
  END IF;

  -- Define o autor da ação para o trigger de histórico
  PERFORM set_config('app.acted_by', v_admin_uid::text, true);

  -- =========================================================================
  -- SEGURANÇA 4: Atualização atômica do status e dos dados na mesma transação
  -- =========================================================================
  UPDATE public.cotacoes
  SET
    status                = p_status_novo,
    proposta_mensagem     = p_proposta_mensagem,
    motivo_devolucao      = p_motivo_devolucao,
    impostos              = p_impostos,
    prazo_entrega         = p_prazo_entrega,
    condicoes_pagamento   = p_condicoes_pagamento,
    respondido_em         = now(),
    respondido_por        = v_admin_uid
  WHERE id = p_cotacao_id;

END;
$$;

-- =========================================================================
-- SEGURANÇA 5: GRANT explícito
-- =========================================================================
-- A proteção real vem da checagem de role interna, não desse GRANT.
REVOKE ALL ON FUNCTION public.responder_cotacao(uuid, public.cotacao_status, text, text, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.responder_cotacao(uuid, public.cotacao_status, text, text, text, text, text, jsonb) TO authenticated, service_role;
