import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function sendEmailJS(templateId: string, params: Record<string, string>): Promise<{ ok: boolean; erro?: string }> {
  const serviceId = Deno.env.get("EMAILJS_ADMIN_SERVICE_ID") || Deno.env.get("EMAILJS_SERVICE_ID")!;
  const privateKey = Deno.env.get("EMAILJS_ADMIN_PRIVATE_KEY") || Deno.env.get("EMAILJS_PRIVATE_KEY")!;
  const publicKey = Deno.env.get("EMAILJS_ADMIN_PUBLIC_KEY") || Deno.env.get("EMAILJS_PUBLIC_KEY")!;

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: params,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, erro: text || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, erro: err.message };
  }
}

// Handler principal
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "Método não permitido" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ erro: "Não autorizado" }, 401);

  // Client autenticado via JWT Forwarding
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr || !user) return json({ erro: "Não autorizado" }, 401);

  let body;
  try { body = await req.json(); } catch { return json({ erro: "Corpo inválido" }, 400); }

  const { acao, cotacao_id } = body;
  if (!cotacao_id) return json({ erro: "cotacao_id obrigatório" }, 400);

  const SITE_URL = Deno.env.get("SITE_URL") || "https://itasafety.com.br";

  // -------------------------------------------------------------------------
  // AÇÃO A: nova_cotacao (Cliente acabou de pedir cotação)
  // -------------------------------------------------------------------------
  if (acao === "nova_cotacao") {
    const { data: cotacao, error: fetchErr } = await supabaseUser
      .from("cotacoes")
      .select(`
        id, numero_cotacao, empresa, cnpj, nome_contato, email_contato, telefone, status, notificacao_enviada_em, observacoes,
        cotacao_itens(sku, nome, quantidade, ca_number)
      `)
      .eq("id", cotacao_id)
      .single();

    if (fetchErr || !cotacao) return json({ erro: "Cotação não encontrada ou acesso negado." }, 404);

    if (cotacao.status !== "enviado") return json({ erro: "Cotação já está em processamento." }, 400);

    // Proteção contra disparo duplicado (Duplo Clique / Retries)
    if (cotacao.notificacao_enviada_em) {
      return json({ erro: "Notificação já enviada para esta cotação anteriormente." }, 400);
    }

    const emailAdmin = Deno.env.get("ADMIN_QUOTES_EMAIL");
    if (!emailAdmin) {
      console.error("[ERRO CRÍTICO] ADMIN_QUOTES_EMAIL não está configurado nas variáveis de ambiente!");
      return json({ erro: "Falha de configuração do servidor (E-mail Admin ausente)." }, 500);
    }
    
    const templateCliente = Deno.env.get("EMAILJS_TEMPLATE_ID_COTACAO");
    const templateAdmin = Deno.env.get("EMAILJS_TEMPLATE_ID_NOVA_COTACAO_ADMIN");
    
    if (!templateCliente || !templateAdmin) {
      return json({ erro: "Templates de e-mail ausentes nas variáveis de ambiente." }, 500);
    }

    const numFormatado = String(cotacao.numero_cotacao).padStart(4, "0");
    const messageText = cotacao.cotacao_itens.map((i: any) => 
      `- ${i.nome} (SKU: ${i.sku})${i.ca_number ? ` | CA: ${i.ca_number}` : ''}\n  Quantidade: ${i.quantidade}`
    ).join("\n\n");
    const obsText = cotacao.observacoes ? `\nObservações: ${cotacao.observacoes}\n` : "";
    const linkAdmin = `${SITE_URL}/admin/cotacoes/${cotacao_id}`;
    const linkCliente = `${SITE_URL}/minhas-cotacoes/${cotacao_id}`;

    // Disparos
    const envioCliente = await sendEmailJS(templateCliente, {
      empresa: cotacao.empresa,
      cnpj: cotacao.cnpj || "Não informado",
      nome_contato: cotacao.nome_contato,
      email_contato: cotacao.email_contato,
      telefone: cotacao.telefone,
      numero_cotacao: numFormatado,
      demand_type: "Cotação de Carrinho",
      message: obsText || "Sem observações.",
      itens_texto: messageText,
      link_cotacao: linkCliente
    });

    const envioAdmin = await sendEmailJS(templateAdmin, {
      empresa: cotacao.empresa,
      cnpj: cotacao.cnpj || "Não informado",
      nome_contato: cotacao.nome_contato,
      email_contato: emailAdmin,
      telefone: cotacao.telefone,
      numero_cotacao: numFormatado,
      demand_type: "Cotação de Carrinho",
      message: obsText || "Sem observações.",
      itens_texto: messageText,
      link_cotacao: linkAdmin
    });

    // Tratamento robusto e não-silencioso de falhas parciais/totais
    const falhaCliente = !envioCliente.ok;
    const falhaAdmin = !envioAdmin.ok;

    if (falhaCliente && falhaAdmin) {
      console.error("[ERRO EmailJS] Ambos falharam:", envioCliente.erro, envioAdmin.erro);
      return json({ erro: "Falha geral ao enviar notificações por e-mail." }, 500);
    }

    // DECISÃO DE ARQUITETURA (Recomendação adotada):
    // Só atualizamos 'notificacao_enviada_em' se AMBOS os envios tiverem sucesso.
    // Isso permite que um "retry" futuro pelo front-end não seja bloqueado caso 
    // um dos e-mails (ex: o do Admin) tenha falhado por limite de cota da API.
    if (falhaCliente || falhaAdmin) {
      const msg = falhaAdmin 
        ? "Cotação salva, mas aviso ao administrador falhou."
        : "Cotação salva, mas recibo para o cliente falhou.";
      console.error("[ERRO EmailJS Parcial]", falhaAdmin ? envioAdmin.erro : envioCliente.erro);
      
      // Retornamos 207 Multi-Status e NÃO setamos a data no banco
      return json({ ok: true, warning: msg }, 207);
    }

    // Ambos tiveram sucesso: grava no banco usando o client do usuário de forma condicional.
    // Isso evita race conditions e sobrescritas duplas de outras threads no mesmo ms.
    const { data: updateData, error: updateErr } = await supabaseUser
      .from("cotacoes")
      .update({ notificacao_enviada_em: new Date().toISOString() })
      .eq("id", cotacao_id)
      .is("notificacao_enviada_em", null) // Trava de concorrência
      .select();

    if (updateErr) {
      console.error("[ERRO Update Notificação]", updateErr);
      return json({ ok: true, warning: "E-mails enviados, mas falha ao marcar flag no banco." }, 207);
    }

    if (!updateData || updateData.length === 0) {
      console.warn("[Race Condition Evitada] Outra transação já havia marcado essa cotação.");
      return json({ ok: true, warning: "E-mails enviados, mas notificação já constava como enviada." }, 207);
    }

    return json({ ok: true });
  }

  // -------------------------------------------------------------------------
  // AÇÃO B: resposta_admin (Admin está respondendo a proposta)
  // -------------------------------------------------------------------------
  if (acao === "resposta_admin") {
    const { 
      status_novo, proposta_mensagem, motivo_devolucao, 
      impostos, prazo_entrega, condicoes_pagamento, itens,
      frete, validade_orcamento_dias, endereco_entrega
    } = body;

    if (!["respondido", "devolvido"].includes(status_novo)) {
      return json({ erro: "status_novo inválido" }, 400);
    }

    const { error: rpcErr } = await supabaseUser.rpc("responder_cotacao", {
      p_cotacao_id: cotacao_id,
      p_status_novo: status_novo,
      p_proposta_mensagem: proposta_mensagem,
      p_motivo_devolucao: motivo_devolucao,
      p_impostos: impostos,
      p_prazo_entrega: prazo_entrega,
      p_condicoes_pagamento: condicoes_pagamento,
      p_frete: frete,
      p_validade_orcamento_dias: validade_orcamento_dias,
      p_endereco_entrega: endereco_entrega,
      p_itens: itens
    });

    if (rpcErr) {
      console.error("[RPC responder_cotacao falhou]", rpcErr);
      return json({ erro: rpcErr.message }, 400);
    }

    const { data: cotAtualizada, error: fetchErr } = await supabaseUser
      .from("cotacoes")
      .select(`
        id, numero_cotacao, empresa, cnpj, nome_contato, email_contato, telefone,
        status, proposta_mensagem, motivo_devolucao, impostos, prazo_entrega, condicoes_pagamento,
        frete, validade_orcamento_dias, endereco_entrega,
        cotacao_itens(sku, nome, ca_number, quantidade, preco_unitario)
      `)
      .eq("id", cotacao_id)
      .single();

    if (fetchErr || !cotAtualizada) {
      return json({ erro: "Erro ao buscar cotação atualizada para notificação." }, 500);
    }

    const itensFormatados = cotAtualizada.cotacao_itens
      .map((i: any) => `• ${i.nome} (Qtd: ${i.quantidade}) - R$ ${Number(i.preco_unitario).toFixed(2)}`)
      .join("\n");

    const templateId = status_novo === "respondido" 
      ? Deno.env.get("EMAILJS_TEMPLATE_ID_RESPONDIDO")
      : Deno.env.get("EMAILJS_TEMPLATE_ID_DEVOLVIDO");

    if (!templateId) return json({ erro: "Template de e-mail (resposta) não configurado." }, 500);

    const envioResposta = await sendEmailJS(templateId, {
      numero_cotacao: `#${String(cotAtualizada.numero_cotacao).padStart(4, "0")}`,
      nome_contato: cotAtualizada.nome_contato,
      email_contato: cotAtualizada.email_contato,
      empresa: cotAtualizada.empresa,
      telefone: cotAtualizada.telefone,
      itens_texto: itensFormatados,
      proposta_mensagem: cotAtualizada.proposta_mensagem ?? "",
      motivo_devolucao: cotAtualizada.motivo_devolucao ?? "",
      impostos: cotAtualizada.impostos ?? "",
      prazo_entrega: cotAtualizada.prazo_entrega ?? "",
      condicoes_pagamento: cotAtualizada.condicoes_pagamento ?? "",
      frete: cotAtualizada.frete ?? "",
      validade_orcamento_dias: cotAtualizada.validade_orcamento_dias ?? "",
      endereco_entrega: cotAtualizada.endereco_entrega ?? "",
      link_cotacao: `${SITE_URL}/minhas-cotacoes/${cotacao_id}`
    });

    if (!envioResposta.ok) {
      console.error("[ERRO EmailJS Resposta]", envioResposta.erro);
      return json({ ok: true, warning: "Cotação respondida no banco, mas houve falha ao notificar o cliente.", detalhes: envioResposta.erro }, 207);
    }

    return json({ ok: true });
  }

  return json({ erro: "Ação não reconhecida" }, 400);
});
