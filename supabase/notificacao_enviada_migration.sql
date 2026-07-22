-- Adiciona a coluna para proteção de duplicidade
ALTER TABLE public.cotacoes
  ADD COLUMN IF NOT EXISTS notificacao_enviada_em timestamptz;

-- Libera o UPDATE EXCLUSIVAMENTE para a coluna notificacao_enviada_em.
-- Isso impede que um usuário autenticado altere outras colunas críticas (como status)
-- enviando requisições forjadas via API.
GRANT UPDATE (notificacao_enviada_em) ON public.cotacoes TO authenticated;

-- Cria a policy permitindo que o usuário só consiga fazer esse UPDATE na própria cotação
CREATE POLICY "user_update_own_cotacao_notificacao"
  ON public.cotacoes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
