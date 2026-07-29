-- Enforce server-side integrity for user-controlled business data.

BEGIN;

DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.cotacao_itens'::regclass
      AND conname = 'cotacao_itens_quantidade_positive'
  ) THEN
    ALTER TABLE public.cotacao_itens
      ADD CONSTRAINT cotacao_itens_quantidade_positive
      CHECK (quantidade > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.cotacao_itens'::regclass
      AND conname = 'cotacao_itens_preco_positive'
  ) THEN
    ALTER TABLE public.cotacao_itens
      ADD CONSTRAINT cotacao_itens_preco_positive
      CHECK (preco_unitario IS NULL OR preco_unitario > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.empresa_change_requests'::regclass
      AND conname = 'empresa_change_requests_campo_allowlist'
  ) THEN
    ALTER TABLE public.empresa_change_requests
      ADD CONSTRAINT empresa_change_requests_campo_allowlist
      CHECK (
        campo_alterado IN (
          'razao_social',
          'cnpj',
          'telefone_contato',
          'nome_contato',
          'endereco_cadastral'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.empresa_change_requests'::regclass
      AND conname = 'empresa_change_requests_valor_proposto_valid'
  ) THEN
    ALTER TABLE public.empresa_change_requests
      ADD CONSTRAINT empresa_change_requests_valor_proposto_valid
      CHECK (
        valor_proposto IS NOT NULL
        AND length(btrim(valor_proposto)) BETWEEN 1 AND 500
      );
  END IF;
END;
$block$;

DROP POLICY IF EXISTS "user_insert_own_requests"
  ON public.empresa_change_requests;
CREATE POLICY "user_insert_own_requests"
  ON public.empresa_change_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pendente'::public.change_request_status
    AND campo_alterado IN (
      'razao_social',
      'cnpj',
      'telefone_contato',
      'nome_contato',
      'endereco_cadastral'
    )
    AND valor_proposto IS NOT NULL
    AND length(btrim(valor_proposto)) BETWEEN 1 AND 500
    AND EXISTS (
      SELECT 1
      FROM public.empresas AS e
      WHERE e.id = empresa_id
        AND e.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.atualizar_logo_empresa(p_logo_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_expected_prefix text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autenticacao obrigatoria'
      USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  IF p_logo_url IS NOT NULL AND btrim(p_logo_url) <> '' THEN
    v_expected_prefix :=
      'https://porgyoqngtshxdxuwaft.supabase.co/storage/v1/object/public/empresa_logos/'
      || v_user_id::text
      || '/';

    IF left(p_logo_url, length(v_expected_prefix)) <> v_expected_prefix THEN
      RAISE EXCEPTION 'URL de logo fora do bucket ou pasta autorizada'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  UPDATE public.empresas
  SET logo_url = NULLIF(btrim(p_logo_url), '')
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empresa do usuario nao encontrada'
      USING ERRCODE = 'P0002';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.atualizar_logo_empresa(text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.atualizar_logo_empresa(text)
  TO authenticated, service_role;

COMMIT;
