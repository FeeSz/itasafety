BEGIN;

-- 1. Criação do Enum e Tabela Empresas
CREATE TYPE public.empresa_status AS ENUM ('pendente_aprovacao', 'aprovada', 'rejeitada');

CREATE TABLE IF NOT EXISTS public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  razao_social text NOT NULL,
  cnpj text NOT NULL,
  telefone_contato text NOT NULL,
  nome_contato text NOT NULL,
  endereco_cadastral text, -- Adicionado para facilitar preenchimento da entrega
  status public.empresa_status NOT NULL DEFAULT 'pendente_aprovacao',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Habilitar Row Level Security
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- POLICY: Usuários veem sua própria empresa
CREATE POLICY "user_select_own_empresa"
  ON public.empresas FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- POLICY: Admin vê tudo
CREATE POLICY "admin_select_all_empresas"
  ON public.empresas FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- POLICY (Ajuste 2): Usuários inserem sua própria empresa FORÇANDO status pendente
CREATE POLICY "user_insert_own_empresa"
  ON public.empresas FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pendente_aprovacao'::public.empresa_status
  );

-- POLICY (Ajuste 3): Admin atualiza empresas (transição de status restrita a admin)
CREATE POLICY "admin_update_empresas"
  ON public.empresas FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- POLICY: Usuários atualizam a PRÓPRIA empresa APENAS quando rejeitada (para corrigir)
CREATE POLICY "user_update_rejected_empresa"
  ON public.empresas FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id 
    AND status = 'rejeitada'::public.empresa_status
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pendente_aprovacao'::public.empresa_status
  );

-- 2. Trigger para Travar a Identidade da Empresa na Cotação
CREATE OR REPLACE FUNCTION public.tg_resolver_empresa_cotacao()
RETURNS TRIGGER AS $$
DECLARE
  v_empresa public.empresas%ROWTYPE;
BEGIN
  -- Buscar a empresa vinculada ao usuário logado
  SELECT * INTO v_empresa
  FROM public.empresas
  WHERE user_id = auth.uid();
  
  -- Verificar se existe e está aprovada
  IF NOT FOUND OR v_empresa.status != 'aprovada' THEN
    RAISE EXCEPTION 'Apenas usuários com empresa aprovada podem enviar ou modificar cotações.';
  END IF;

  -- Substituir (ou forçar) os dados enviados pelo front-end pelos dados da fonte de verdade
  NEW.empresa := v_empresa.razao_social;
  NEW.cnpj := v_empresa.cnpj;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- (Ajuste 1: Trigger em BEFORE INSERT OR UPDATE OF empresa, cnpj)
DROP TRIGGER IF EXISTS tg_cotacoes_resolver_empresa ON public.cotacoes;
CREATE TRIGGER tg_cotacoes_resolver_empresa
  BEFORE INSERT OR UPDATE OF empresa, cnpj ON public.cotacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_resolver_empresa_cotacao();

-- 3. Novos Campos de Cotação (Bloco 2)
ALTER TABLE public.cotacoes
  ADD COLUMN IF NOT EXISTS frete text,
  ADD COLUMN IF NOT EXISTS validade_orcamento_dias integer,
  ADD COLUMN IF NOT EXISTS endereco_entrega text;

-- 4. Substituição da RPC responder_cotacao
-- Desfazemos a permissão anterior para recriar a assinatura com os novos parâmetros
DROP FUNCTION IF EXISTS public.responder_cotacao(uuid, public.cotacao_status, text, text, text, text, text, jsonb);

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
  FOR UPDATE; -- Lock na linha para prevenir concorrência (Race Condition)

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
      UPDATE public.cotacao_itens
      SET preco_unitario = item_rec.preco_unitario
      WHERE id = item_rec.item_id 
        AND cotacao_id = p_cotacao_id;

      GET DIAGNOSTICS v_update_count = ROW_COUNT;
      
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
    status                    = p_status_novo,
    proposta_mensagem         = p_proposta_mensagem,
    motivo_devolucao          = p_motivo_devolucao,
    impostos                  = p_impostos,
    prazo_entrega             = p_prazo_entrega,
    condicoes_pagamento       = p_condicoes_pagamento,
    frete                     = p_frete,
    validade_orcamento_dias   = p_validade_orcamento_dias,
    endereco_entrega          = p_endereco_entrega,
    respondido_em             = now(),
    respondido_por            = v_admin_uid
  WHERE id = p_cotacao_id;

END;
$$;

REVOKE ALL ON FUNCTION public.responder_cotacao(uuid, public.cotacao_status, text, text, text, text, text, text, integer, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.responder_cotacao(uuid, public.cotacao_status, text, text, text, text, text, text, integer, text, jsonb) TO authenticated, service_role;

COMMIT;
