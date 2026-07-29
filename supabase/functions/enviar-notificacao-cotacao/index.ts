import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type QuoteEmailItem = {
  sku: string;
  nome: string;
  quantidade: number;
  ca_number: string | null;
  preco_unitario?: number | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

async function sendEmailJS(
  templateId: string,
  params: Record<string, string>,
): Promise<{ ok: boolean; erro?: string }> {
  const serviceId = Deno.env.get("EMAILJS_ADMIN_SERVICE_ID") || Deno.env.get("EMAILJS_SERVICE_ID")!;
  const privateKey =
    Deno.env.get("EMAILJS_ADMIN_PRIVATE_KEY") || Deno.env.get("EMAILJS_PRIVATE_KEY")!;
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
  } catch (err: unknown) {
    return { ok: false, erro: err instanceof Error ? err.message : String(err) };
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
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
    error: userErr,
  } = await supabaseUser.auth.getUser();
  if (userErr || !user) return json({ erro: "Não autorizado" }, 401);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ erro: "Corpo inválido" }, 400);
  }

  const { acao, cotacao_id } = body;
  if (!cotacao_id) return json({ erro: "cotacao_id obrigatório" }, 400);

  const SITE_URL = Deno.env.get("SITE_URL") || "https://itasafety.com.br";

  // -------------------------------------------------------------------------
  // AÇÃO A: nova_cotacao (Cliente acabou de pedir cotação)
  // -------------------------------------------------------------------------
  if (acao === "nova_cotacao") {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      console.error("[ERRO CRÍTICO] SUPABASE_SERVICE_ROLE_KEY não configurada.");
      return json({ erro: "Falha de configuração do servidor." }, 500);
    }
    const supabaseService = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: cotacao, error: fetchErr } = await supabaseUser
      .from("cotacoes")
      .select(
        `
        id, numero_cotacao, empresa, cnpj, nome_contato, email_contato, telefone, status, notificacao_enviada_em, observacoes, user_id,
        cotacao_itens(sku, nome, quantidade, ca_number)
      `,
      )
      .eq("id", cotacao_id)
      .single();

    if (fetchErr || !cotacao)
      return json({ erro: "Cotação não encontrada ou acesso negado." }, 404);

    if (cotacao.status !== "enviado")
      return json({ erro: "Cotação já está em processamento." }, 400);

    // Proteção contra disparo duplicado (Duplo Clique / Retries)
    if (cotacao.notificacao_enviada_em) {
      return json({ erro: "Notificação já enviada para esta cotação anteriormente." }, 400);
    }

    const emailAdmin = Deno.env.get("ADMIN_QUOTES_EMAIL");
    if (!emailAdmin) {
      console.error(
        "[ERRO CRÍTICO] ADMIN_QUOTES_EMAIL não está configurado nas variáveis de ambiente!",
      );
      return json({ erro: "Falha de configuração do servidor (E-mail Admin ausente)." }, 500);
    }

    const templateCliente = Deno.env.get("EMAILJS_TEMPLATE_ID_COTACAO");
    const templateAdmin = Deno.env.get("EMAILJS_TEMPLATE_ID_NOVA_COTACAO_ADMIN");

    if (!templateCliente || !templateAdmin) {
      return json({ erro: "Templates de e-mail ausentes nas variáveis de ambiente." }, 500);
    }

    // Buscando histórico de pedidos do cliente (para o SLA/Histórico)
    const { count: pedidosAnteriores } = await supabaseUser
      .from("cotacoes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", cotacao.user_id)
      .neq("id", cotacao_id);

    const qtd_pedidos = pedidosAnteriores || 0;
    const tipo_cliente = qtd_pedidos > 0 ? "Cliente Recorrente" : "Novo Cliente";

    // Cálculo de Datas (SLA de 24h)
    const agora = new Date();
    const dataHoraSolicitacao = agora.toLocaleString("pt-BR");
    const dataSla = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
    const prazoResposta = dataSla.toLocaleString("pt-BR");

    const numFormatado = String(cotacao.numero_cotacao).padStart(4, "0");

    // Geração do HTML dos itens (porque EmailJS não faz loop de array)
    let valorTotal = 0;
    const itensHtmlArray = cotacao.cotacao_itens.map((i: QuoteEmailItem) => {
      // Mock de valores conforme solicitado até a segunda ordem
      const valorUnitario = 150.0;
      valorTotal += valorUnitario * i.quantidade;
      const precoFormatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valorUnitario);
      const categoria = "EPI";
      const estoqueStatus = "Em Estoque";
      const estoqueCorFundo = "#D1FAE5"; // bg-emerald-100
      const estoqueCorTexto = "#065F46"; // text-emerald-800

      return `
                <tr>
                  <td style="padding:16px 0; border-bottom:1px solid #EFEFF1; vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 3px 0; font-size:14px; line-height:19px; color:#0A0A0A; font-weight:500;">${escapeHtml(i.nome)}</p>
                          <p style="margin:0; font-size:12.5px; line-height:18px; color:#9CA3AF; font-family: 'SF Mono', 'Roboto Mono', Consolas, monospace;">
                            ${escapeHtml(i.sku)} &middot; CA ${escapeHtml(i.ca_number || "N/A")} &middot; ${categoria}
                          </p>
                          <p style="margin:4px 0 0 0; font-size:12px; line-height:16px;">
                            <span style="display:inline-block; padding:2px 8px; border-radius:10px; font-weight:600; letter-spacing:0.02em; text-transform:uppercase; font-size:10.5px; background-color:${estoqueCorFundo}; color:${estoqueCorTexto};">${estoqueStatus}</span>
                          </p>
                        </td>
                        <td width="60" align="right" style="vertical-align:top; white-space:nowrap;">
                          <p style="margin:0; font-size:14px; line-height:19px; color:#0A0A0A; font-weight:600;">&times;${escapeHtml(i.quantidade)}</p>
                        </td>
                        <td width="90" align="right" class="price-col" style="vertical-align:top; white-space:nowrap;">
                          <p style="margin:0; font-size:13px; line-height:19px; color:#374151;">${precoFormatado}</p>
                          <p style="margin:1px 0 0 0; font-size:11px; line-height:15px; color:#9CA3AF;">un.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
      `;
    });

    const itens_html = itensHtmlArray.join("");
    const valor_total_estimado = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valorTotal);

    // Texto puro para o cliente (fallback ou se o template cliente não for HTML)
    const messageText = cotacao.cotacao_itens
      .map(
        (i: QuoteEmailItem) =>
          `- ${i.nome} (SKU: ${i.sku})${i.ca_number ? ` | CA: ${i.ca_number}` : ""}\n  Quantidade: ${i.quantidade}`,
      )
      .join("\n\n");
    const obsText = cotacao.observacoes ? `\nObservações: ${cotacao.observacoes}\n` : "";
    const linkAdmin = `${SITE_URL}/admin/cotacoes/${cotacao_id}`;
    const linkCliente = `${SITE_URL}/minhas-cotacoes/${cotacao_id}`;

    // Claim atômico: somente uma invocação pode iniciar os disparos.
    const { data: claimed, error: claimErr } = await supabaseService.rpc(
      "claim_nova_cotacao_notification",
      {
        p_cotacao_id: cotacao_id,
        p_user_id: user.id,
      },
    );

    if (claimErr) {
      console.error("[ERRO Claim Notificação]", claimErr);
      return json({ erro: "Falha ao reservar o envio da notificação." }, 500);
    }
    if (!claimed) {
      return json({ erro: "Notificação já enviada ou em processamento." }, 409);
    }

    const finalizeNotification = async (success: boolean) => {
      const { error } = await supabaseService.rpc("finalizar_nova_cotacao_notification", {
        p_cotacao_id: cotacao_id,
        p_user_id: user.id,
        p_sucesso: success,
      });
      if (error) {
        console.error("[ERRO Finalização Notificação]", error);
      }
      return error;
    };

    // Disparos
    const envioCliente = await sendEmailJS(templateCliente, {
      empresa: escapeHtml(cotacao.empresa),
      cnpj: escapeHtml(cotacao.cnpj || "Não informado"),
      nome_contato: escapeHtml(cotacao.nome_contato),
      email_contato: escapeHtml(cotacao.email_contato),
      telefone: escapeHtml(cotacao.telefone),
      numero_cotacao: numFormatado,
      demand_type: "Cotação de Carrinho",
      message: escapeHtml(obsText || "Sem observações."),
      itens_texto: escapeHtml(messageText),
      link_cotacao: linkCliente,
    });

    const envioAdmin = await sendEmailJS(templateAdmin, {
      NUMERO_COTACAO: numFormatado,
      empresa: escapeHtml(cotacao.empresa),
      qtd_itens: cotacao.cotacao_itens.length.toString(),
      data_hora_solicitacao: dataHoraSolicitacao,
      canal_origem: "Site / B2B",
      prazo_resposta: prazoResposta,
      responsavel: "Equipe de Vendas",
      nome: escapeHtml(cotacao.nome_contato),
      telefone: escapeHtml(cotacao.telefone),
      email: escapeHtml(cotacao.email_contato),
      cnpj: escapeHtml(cotacao.cnpj || "Não informado"),
      tipo_cliente: tipo_cliente,
      qtd_pedidos_anteriores: qtd_pedidos.toString(),
      observacoes: escapeHtml(cotacao.observacoes || "Nenhuma observação enviada."),
      QTD_ITENS: cotacao.cotacao_itens.length.toString(), // Por via das dúvidas caso seja case sensitive lá
      valor_total_estimado: valor_total_estimado,
      itens_html: itens_html,
      link_cotacao: linkAdmin,
    });

    // Tratamento robusto e não-silencioso de falhas parciais/totais
    const falhaCliente = !envioCliente.ok;
    const falhaAdmin = !envioAdmin.ok;

    if (falhaCliente && falhaAdmin) {
      console.error("[ERRO EmailJS] Ambos falharam:", envioCliente.erro, envioAdmin.erro);
      await finalizeNotification(false);
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
      await finalizeNotification(false);

      // Retornamos 207 Multi-Status e NÃO setamos a data no banco
      return json({ ok: true, warning: msg }, 207);
    }

    // Ambos tiveram sucesso: conclui o claim usando somente service_role.
    const finalizeErr = await finalizeNotification(true);
    if (finalizeErr) {
      return json(
        { ok: true, warning: "E-mails enviados, mas falha ao marcar flag no banco." },
        207,
      );
    }

    return json({ ok: true });
  }

  // -------------------------------------------------------------------------
  // AÇÃO B: resposta_admin (Admin está respondendo a proposta)
  // -------------------------------------------------------------------------
  if (acao === "resposta_admin") {
    const {
      status_novo,
      proposta_mensagem,
      motivo_devolucao,
      impostos,
      prazo_entrega,
      condicoes_pagamento,
      itens,
      frete,
      validade_orcamento_dias,
      endereco_entrega,
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
      p_itens: itens,
    });

    if (rpcErr) {
      console.error("[RPC responder_cotacao falhou]", rpcErr);
      return json({ erro: rpcErr.message }, 400);
    }

    const { data: cotAtualizada, error: fetchErr } = await supabaseUser
      .from("cotacoes")
      .select(
        `
        id, numero_cotacao, empresa, cnpj, nome_contato, email_contato, telefone,
        status, proposta_mensagem, motivo_devolucao, impostos, prazo_entrega, condicoes_pagamento,
        frete, validade_orcamento_dias, endereco_entrega,
        cotacao_itens(sku, nome, ca_number, quantidade, preco_unitario)
      `,
      )
      .eq("id", cotacao_id)
      .single();

    if (fetchErr || !cotAtualizada) {
      return json({ erro: "Erro ao buscar cotação atualizada para notificação." }, 500);
    }

    const itensFormatados = cotAtualizada.cotacao_itens
      .map(
        (i: QuoteEmailItem) =>
          `• ${i.nome} (Qtd: ${i.quantidade}) - R$ ${Number(i.preco_unitario).toFixed(2)}`,
      )
      .join("\n");

    const templateId =
      status_novo === "respondido"
        ? Deno.env.get("EMAILJS_TEMPLATE_ID_RESPONDIDO")
        : Deno.env.get("EMAILJS_TEMPLATE_ID_DEVOLVIDO");

    if (!templateId) return json({ erro: "Template de e-mail (resposta) não configurado." }, 500);

    const envioResposta = await sendEmailJS(templateId, {
      numero_cotacao: `#${String(cotAtualizada.numero_cotacao).padStart(4, "0")}`,
      nome_contato: escapeHtml(cotAtualizada.nome_contato),
      email_contato: escapeHtml(cotAtualizada.email_contato),
      empresa: escapeHtml(cotAtualizada.empresa),
      telefone: escapeHtml(cotAtualizada.telefone),
      itens_texto: escapeHtml(itensFormatados),
      proposta_mensagem: escapeHtml(cotAtualizada.proposta_mensagem),
      motivo_devolucao: escapeHtml(cotAtualizada.motivo_devolucao),
      impostos: escapeHtml(cotAtualizada.impostos),
      prazo_entrega: escapeHtml(cotAtualizada.prazo_entrega),
      condicoes_pagamento: escapeHtml(cotAtualizada.condicoes_pagamento),
      frete: escapeHtml(cotAtualizada.frete),
      validade_orcamento_dias: escapeHtml(cotAtualizada.validade_orcamento_dias),
      endereco_entrega: escapeHtml(cotAtualizada.endereco_entrega),
      link_cotacao: `${SITE_URL}/minhas-cotacoes/${cotacao_id}`,
    });

    if (!envioResposta.ok) {
      console.error("[ERRO EmailJS Resposta]", envioResposta.erro);
      return json(
        {
          ok: true,
          warning: "Cotação respondida no banco, mas houve falha ao notificar o cliente.",
          detalhes: envioResposta.erro,
        },
        207,
      );
    }

    return json({ ok: true });
  }

  return json({ erro: "Ação não reconhecida" }, 400);
});


