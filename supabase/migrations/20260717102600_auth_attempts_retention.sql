-- Migration: auth_attempts_retention_policy
-- Timestamp: 20260717102600
--
-- PROBLEMA: A tabela uth_attempts grava email e ip de cada tentativa
-- sem qualquer TTL/purge automático, retendo dados pessoais indefinidamente
-- em violação aos princípios de minimização de dados (LGPD Art. 6º, IV).
--
-- SOLUÇÃO: Habilitar pg_cron (se disponível no plano) e agendar purge diário
-- de registros com mais de 90 dias.
--
-- ROLLBACK:
--   SELECT cron.unschedule('purge_old_auth_attempts');

-- Habilitar pg_cron (operação idempotente; requer plano Supabase que suporte pg_cron)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Garantir que o pg_cron possa executar no schema public
GRANT USAGE ON SCHEMA cron TO postgres;

-- Agendar job diário à meia-noite (UTC) para excluir registros > 90 dias
-- Usa SELECT para ser idempotente: se o job já existir, substitui.
SELECT cron.schedule(
  'purge_old_auth_attempts',
  '0 0 * * *',  -- todo dia às 00:00 UTC
  
    DELETE FROM public.auth_attempts
    WHERE created_at < NOW() - INTERVAL '90 days';
  
);