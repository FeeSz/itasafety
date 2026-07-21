-- ============================================================
-- ItaSafety — Sistema de Rastreamento de Cotações B2B
-- Migration v4 — VERSÃO FINAL APROVADA PARA PRODUÇÃO
-- ============================================================
-- Execute as partes EM ORDEM. Pare entre A e B para validar.
-- ============================================================


-- ============================================================
-- PARTE A — MIGRATION NÃO-DESTRUTIVA DO STATUS
-- Execute este bloco. Após rodar, valide o SELECT antes de B.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cotacao_status') THEN
    CREATE TYPE public.cotacao_status AS ENUM (
      'enviado',
      'em_analise',
      'respondido',
      'devolvido'
    );
  END IF;
END $$;

ALTER TABLE public.cotacoes
  ADD COLUMN IF NOT EXISTS status_v2 public.cotacao_status NOT NULL DEFAULT 'enviado';

UPDATE public.cotacoes
SET status_v2 = 'enviado'
WHERE status = 'pendente';

-- ─────────────────────────────────────────────────────────────
-- ⚠️  PARAR AQUI — valide antes de continuar para a Parte B:
--
--   SELECT COUNT(*) AS sem_mapeamento
--   FROM public.cotacoes
--   WHERE status_v2 IS NULL;
--
-- Resultado esperado: 0
-- ─────────────────────────────────────────────────────────────


-- ============================================================
-- PARTE B — SWAP DE COLUNA + NOVAS COLUNAS
-- Execute apenas após validar Parte A (COUNT = 0).
-- ============================================================

ALTER TABLE public.cotacoes RENAME COLUMN status    TO status_old;
ALTER TABLE public.cotacoes RENAME COLUMN status_v2 TO status;
ALTER TABLE public.cotacoes DROP COLUMN status_old;

ALTER TABLE public.cotacoes
  ADD COLUMN IF NOT EXISTS visualizado_em    timestamptz,
  ADD COLUMN IF NOT EXISTS visualizado_por   uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS proposta_mensagem text,
  ADD COLUMN IF NOT EXISTS motivo_devolucao  text;

-- ── ROLLBACK (antes do DROP de status_old) ───────────────────
-- ALTER TABLE public.cotacoes RENAME COLUMN status     TO status_v2;
-- ALTER TABLE public.cotacoes RENAME COLUMN status_old TO status;
-- ALTER TABLE public.cotacoes DROP COLUMN status_v2;
-- DROP TYPE IF EXISTS public.cotacao_status;
-- ─────────────────────────────────────────────────────────────


-- ============================================================
-- PARTE C — TABELAS DE SUPORTE
-- ============================================================

-- C1. Histórico de status (log imutável)
CREATE TABLE IF NOT EXISTS public.cotacao_historico_status (
  id              uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id      uuid                  NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  status_anterior public.cotacao_status,
  status_novo     public.cotacao_status NOT NULL,
  alterado_por    uuid                  REFERENCES auth.users(id),
  created_at      timestamptz           NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cotacao_historico_cotacao
  ON public.cotacao_historico_status (cotacao_id);

ALTER TABLE public.cotacao_historico_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_select_own_historico"  ON public.cotacao_historico_status;
DROP POLICY IF EXISTS "admin_select_all_historico" ON public.cotacao_historico_status;

CREATE POLICY "user_select_own_historico"
  ON public.cotacao_historico_status FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cotacoes c
      WHERE c.id = cotacao_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "admin_select_all_historico"
  ON public.cotacao_historico_status FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.cotacao_historico_status TO authenticated;
GRANT ALL    ON public.cotacao_historico_status TO service_role;


-- C2. ENUMs de notificação
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notificacao_status') THEN
    CREATE TYPE public.notificacao_status AS ENUM ('pendente', 'enviado', 'falhou');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notificacao_tipo') THEN
    CREATE TYPE public.notificacao_tipo AS ENUM ('respondido', 'devolvido');
  END IF;
END $$;

-- C3. Rastreamento de envio de e-mail
CREATE TABLE IF NOT EXISTS public.cotacao_notificacoes (
  id           uuid                      PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id   uuid                      NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  tipo         public.notificacao_tipo   NOT NULL,
  status_envio public.notificacao_status NOT NULL DEFAULT 'pendente',
  erro         text,
  tentativas   int                       NOT NULL DEFAULT 0,
  created_at   timestamptz               NOT NULL DEFAULT now(),
  updated_at   timestamptz               NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cotacao_notificacoes_cotacao
  ON public.cotacao_notificacoes (cotacao_id);

DROP TRIGGER IF EXISTS set_notificacoes_updated_at ON public.cotacao_notificacoes;
CREATE TRIGGER set_notificacoes_updated_at
  BEFORE UPDATE ON public.cotacao_notificacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.cotacao_notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_notificacoes" ON public.cotacao_notificacoes;

CREATE POLICY "admin_all_notificacoes"
  ON public.cotacao_notificacoes FOR ALL TO authenticated
  USING    (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.cotacao_notificacoes TO authenticated;
GRANT ALL    ON public.cotacao_notificacoes TO service_role;


-- ============================================================
-- PARTE D — FUNÇÕES E TRIGGER
-- ============================================================

-- D1. Trigger de histórico automático
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
    v_author := COALESCE(
      auth.uid(),
      NULLIF(current_setting('app.acted_by', true), '')::uuid
    );
    INSERT INTO public.cotacao_historico_status
      (cotacao_id, status_anterior, status_novo, alterado_por)
    VALUES
      (NEW.id, OLD.status, NEW.status, v_author);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_cotacao_status_change ON public.cotacoes;
CREATE TRIGGER log_cotacao_status_change
  AFTER UPDATE ON public.cotacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_log_cotacao_status();


-- D2. marcar_em_analise — transição Enviado → Em Análise
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
  SET
    status          = 'em_analise',
    visualizado_em  = now(),
    visualizado_por = auth.uid()
  WHERE id = _cotacao_id
    AND status = 'enviado';
  -- 0 linhas = cotação já avançada; sem erro intencional (idempotente).
END;
$$;

REVOKE ALL    ON FUNCTION public.marcar_em_analise(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marcar_em_analise(uuid) TO authenticated;


-- D3. responder_cotacao — transição para Respondido/Devolvido
CREATE OR REPLACE FUNCTION public.responder_cotacao(
  _cotacao_id        uuid,
  _admin_id          uuid,
  _status_novo       public.cotacao_status,
  _proposta_mensagem text DEFAULT NULL,
  _motivo_devolucao  text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_linhas_afetadas int;
BEGIN
  IF _status_novo NOT IN ('respondido', 'devolvido') THEN
    RAISE EXCEPTION 'Transição inválida: esta função só aceita respondido ou devolvido. Recebido: %',
      _status_novo
      USING ERRCODE = 'P0001';
  END IF;

  -- Defesa em profundidade: valida que _admin_id (já verificado pela Edge Function)
  -- é realmente um admin. Não é o ponto de autorização principal — o REVOKE FROM
  -- authenticated abaixo é — mas protege contra bug futuro na Edge Function.
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'admin_id informado (%) não corresponde a um administrador.', _admin_id
      USING ERRCODE = 'P0001';
  END IF;

  -- set_config e UPDATE no mesmo corpo plpgsql = mesma transação.
  -- Imune a PgBouncer transaction mode (sem risco de set_config em
  -- conexão diferente do UPDATE).
  PERFORM set_config('app.acted_by', _admin_id::text, true);

  UPDATE public.cotacoes
  SET
    status             = _status_novo,
    proposta_mensagem  = _proposta_mensagem,
    motivo_devolucao   = _motivo_devolucao
  WHERE id = _cotacao_id
    AND status IN ('enviado', 'em_analise');

  -- Correção de concorrência: se 0 linhas, cotação já foi respondida
  -- (duplo-clique ou outra sessão). Lança exceção ANTES de qualquer
  -- lógica de e-mail na Edge Function.
  GET DIAGNOSTICS v_linhas_afetadas = ROW_COUNT;

  IF v_linhas_afetadas = 0 THEN
    RAISE EXCEPTION
      'Cotação % não pôde ser atualizada: já está em um status que não '
      'admite resposta (respondido/devolvido), ou o ID não existe. '
      'Atualize a página e verifique o status atual.',
      _cotacao_id
      USING ERRCODE = 'P0001', HINT = 'cotacao_ja_respondida';
  END IF;
END;
$$;

-- Apenas service_role (Edge Function) pode executar.
REVOKE ALL ON FUNCTION public.responder_cotacao(uuid, uuid, public.cotacao_status, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.responder_cotacao(uuid, uuid, public.cotacao_status, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.responder_cotacao(uuid, uuid, public.cotacao_status, text, text) TO service_role;


-- ============================================================
-- PARTE E — RLS E PRIVILÉGIOS FINAIS EM cotacoes
-- ============================================================

DROP POLICY IF EXISTS "admin_update_all_cotacoes" ON public.cotacoes;
DROP POLICY IF EXISTS "admin_update_cotacoes"     ON public.cotacoes;
DROP POLICY IF EXISTS "user_select_own_cotacao"   ON public.cotacoes;
DROP POLICY IF EXISTS "user_insert_own_cotacao"   ON public.cotacoes;
DROP POLICY IF EXISTS "admin_select_all_cotacoes" ON public.cotacoes;

CREATE POLICY "user_select_own_cotacao"
  ON public.cotacoes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_own_cotacao"
  ON public.cotacoes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_select_all_cotacoes"
  ON public.cotacoes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT ON public.cotacoes TO authenticated;
GRANT ALL            ON public.cotacoes TO service_role;

-- Defesa em profundidade: documenta explicitamente a intenção.
REVOKE UPDATE, DELETE ON public.cotacoes FROM authenticated;


-- ============================================================
-- VERIFICAÇÕES FINAIS
-- ============================================================

-- 1. Tipo da coluna status = ENUM:
-- SELECT column_name, udt_name FROM information_schema.columns
-- WHERE table_name = 'cotacoes' AND column_name = 'status';

-- 2. Nenhuma policy de UPDATE em cotacoes:
-- SELECT policyname, cmd FROM pg_policies
-- WHERE tablename = 'cotacoes' AND cmd = 'UPDATE';

-- 3. Trigger criado:
-- SELECT trigger_name FROM information_schema.triggers
-- WHERE event_object_table = 'cotacoes';

-- 4. marcar_em_analise com 1 parâmetro:
-- SELECT proname, pronargs, proargnames FROM pg_proc
-- WHERE proname = 'marcar_em_analise';

-- 5. responder_cotacao restrita a service_role:
-- SELECT grantee, privilege_type FROM information_schema.routine_privileges
-- WHERE routine_name = 'responder_cotacao';
