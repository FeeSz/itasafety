-- ========================================================================================
-- 1. ADICIONAR COLUNA LOGO E BUCKET DEDICADO
-- ========================================================================================

-- Adiciona a coluna para a logo. Sem restrição NOT NULL para manter compatibilidade.
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS logo_url text;

-- Criação do Bucket isolado para as logos de empresas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('empresa_logos', 'empresa_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies do Bucket de Storage
CREATE POLICY "Users can upload their own company logo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'empresa_logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
  
CREATE POLICY "Users can update their own company logo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'empresa_logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own company logo"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'empresa_logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admin has full access to empresa_logos"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'empresa_logos' AND 
    public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id = 'empresa_logos' AND 
    public.has_role(auth.uid(), 'admin')
  );

-- ========================================================================================
-- 2. RPC SEGURA PARA ATUALIZAR APENAS A LOGO
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.atualizar_logo_empresa(p_logo_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.empresas
  SET logo_url = p_logo_url
  WHERE user_id = auth.uid();
END;
$$;

-- Aplicação da Camada de Segurança (Funções)
REVOKE ALL ON FUNCTION public.atualizar_logo_empresa(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.atualizar_logo_empresa(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.atualizar_logo_empresa(text) TO authenticated;

-- ========================================================================================
-- 3. TABELA DE CHANGE REQUESTS
-- ========================================================================================

DO $$ BEGIN
  CREATE TYPE public.change_request_status AS ENUM ('pendente', 'aprovada', 'rejeitada');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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

-- Constraint para prevenir solicitações pendentes duplicadas do mesmo campo para a mesma empresa
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_request 
  ON public.empresa_change_requests (empresa_id, campo_alterado) 
  WHERE status = 'pendente';

-- ========================================================================================
-- 4. RLS DA TABELA DE CHANGE REQUESTS
-- ========================================================================================

ALTER TABLE public.empresa_change_requests ENABLE ROW LEVEL SECURITY;

-- Aplicação da Camada de Segurança (Tabela) - Removendo grants automáticos do public/anon
REVOKE ALL ON public.empresa_change_requests FROM PUBLIC;
REVOKE ALL ON public.empresa_change_requests FROM anon;
REVOKE DELETE, TRUNCATE ON public.empresa_change_requests FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.empresa_change_requests TO authenticated;

-- Usuário lê as próprias solicitações
CREATE POLICY "user_select_own_requests"
  ON public.empresa_change_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Usuário insere solicitações como 'pendente' garantindo que a empresa é dele
CREATE POLICY "user_insert_own_requests"
  ON public.empresa_change_requests FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() 
    AND status = 'pendente'::change_request_status
    AND EXISTS (
      SELECT 1 FROM public.empresas 
      WHERE id = empresa_id AND user_id = auth.uid()
    )
  );

-- Admin lê todas as solicitações
CREATE POLICY "admin_select_all_requests"
  ON public.empresa_change_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin atualiza solicitações (usada explicitamente para rejeição)
CREATE POLICY "admin_update_requests"
  ON public.empresa_change_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========================================================================================
-- 5. RPC SEGURA PARA APROVAR CHANGE REQUESTS E APLICAR EM `empresas`
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.aprovar_change_request(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.empresa_change_requests%ROWTYPE;
BEGIN
  -- 1. Verifica permissão de admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem aprovar change requests'
      USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  -- 2. Busca e faz o lock da linha para evitar concorrência (FOR UPDATE)
  SELECT * INTO v_request
  FROM public.empresa_change_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Change request não encontrada.' USING ERRCODE = 'P0002';
  END IF;

  IF v_request.status != 'pendente' THEN
    RAISE EXCEPTION 'A solicitação já foi processada (status: %)', v_request.status;
  END IF;

  -- 3. Validação rígida (Allowlist) antes de executar SQL dinâmico
  -- Impede que campos não mapeados (como 'status' ou 'user_id') sejam alterados maliciosamente.
  IF v_request.campo_alterado NOT IN ('razao_social', 'cnpj', 'telefone_contato', 'nome_contato', 'endereco_cadastral') THEN
    RAISE EXCEPTION 'Tentativa de alteração de coluna não permitida: %', v_request.campo_alterado
      USING ERRCODE = 'P0001';
  END IF;

  -- 4. Atualiza a tabela `empresas` dinamicamente de forma segura (gate já passou)
  EXECUTE format('UPDATE public.empresas SET %I = $1 WHERE id = $2', v_request.campo_alterado)
    USING v_request.valor_proposto, v_request.empresa_id;

  -- 5. Atualiza o status da request
  UPDATE public.empresa_change_requests
  SET 
    status = 'aprovada',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_request_id;

END;
$$;

-- Aplicação da Camada de Segurança (Funções)
REVOKE ALL ON FUNCTION public.aprovar_change_request(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.aprovar_change_request(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.aprovar_change_request(uuid) TO authenticated;
