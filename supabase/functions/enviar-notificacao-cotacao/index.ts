import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Tipos ────────────────────────────────────────────────────────────────────

type CotacaoStatus = "respondido" | "devolvido";

interface RequestBody {
  cotacao_id: string;
  status_novo?: CotacaoStatus;
  proposta_mensagem?: string;
  motivo_devolucao?: string;
  apenas_email?: boolean; // true = reenvio, pula UPDATE de status
}

interface CotacaoData {
  id: string;
  numero_cotacao: number;
  empresa: string;
  cnpj: string | null;
  nome_contato: string;
  email_contato: string;
  telefone: string;
  proposta_mensagem: string | null;
  motivo_devolucao: string | null;
  status: CotacaoStatus;
  cotacao_itens: Array<{
    sku: string;
    nome: string;
    ca_number: string | null;
    quantidade: number;
    categoria: string | null;
  }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Envio via EmailJS REST API (server-side, chave privada nunca no bundle) ──

async function sendEmailJS(
  templateId: string,
  params: Record<string, string>
): Promise<{ ok: boolean; erro?: string }> {
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
      return { ok: false, erro: `EmailJS ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, erro: String(err) };
  }
}

function buildTemplateParams(cotacao: CotacaoData): Record<string, string> {
  const itensTexto = cotacao.cotacao_itens
    .map(
      (i) =>
        `• ${i.nome} (SKU: ${i.sku})${i.ca_number ? ` | CA: ${i.ca_number}` : ""}\n  Qtd: ${i.quantidade}`
    )
    .join("\n\n");

  const numFormatado = String(cotacao.numero_cotacao).padStart(4, "0");

  return {
    numero_cotacao:    `#${numFormatado}`,
    empresa:           cotacao.empresa,
    cnpj:              cotacao.cnpj ?? "Não informado",
    nome_contato:      cotacao.nome_contato,
    email_contato:     cotacao.email_contato,
    telefone:          cotacao.telefone,
    itens_texto:       itensTexto,
    proposta_mensagem: cotacao.proposta_mensagem ?? "",
    motivo_devolucao:  cotacao.motivo_devolucao ?? "",
    link_cotacao:      `${Deno.env.get("SITE_URL") ?? "https://itasafety.com.br"}/minhas-cotacoes/${cotacao.id}`,
  };
}

// ── Handler principal ─────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "Método não permitido" }, 405);

  // 1. Extrair e validar JWT do admin ─────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ erro: "Não autorizado" }, 401);

  // Client de usuário — usado para verificar a identidade do chamador
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr || !user) return json({ erro: "Não autorizado" }, 401);

  // Client service_role — usado para chamadas privilegiadas ao banco
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verificar que o usuário autenticado é admin via has_role
  const { data: isAdminRow } = await supabaseAdmin
    .rpc("has_role", { _user_id: user.id, _role: "admin" });

  if (!isAdminRow) return json({ erro: "Acesso negado: apenas administradores." }, 403);

  // admin_id extraído do JWT validado — nunca do corpo da requisição
  const adminId = user.id;

  // 2. Ler e validar corpo ────────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ erro: "Corpo inválido" }, 400);
  }

  const { cotacao_id, status_novo, proposta_mensagem, motivo_devolucao, apenas_email } = body;

  if (!cotacao_id) return json({ erro: "cotacao_id obrigatório" }, 400);

  if (!apenas_email) {
    // Fluxo normal: precisa de status_novo
    if (!status_novo || !["respondido", "devolvido"].includes(status_novo)) {
      return json({ erro: "status_novo deve ser 'respondido' ou 'devolvido'" }, 400);
    }
    if (status_novo === "devolvido" && !motivo_devolucao?.trim()) {
      return json({ erro: "motivo_devolucao é obrigatório ao devolver" }, 400);
    }

    // 3. Chamar responder_cotacao (set_config + UPDATE na mesma transação) ────
    const { error: rpcErr } = await supabaseAdmin.rpc("responder_cotacao", {
      _cotacao_id:        cotacao_id,
      _admin_id:          adminId,
      _status_novo:       status_novo,
      _proposta_mensagem: proposta_mensagem ?? null,
      _motivo_devolucao:  motivo_devolucao ?? null,
    });

    if (rpcErr) {
      // Usa o HINT em vez de substring para diferenciar das outras exceções P0001
      const jaRespondida = (rpcErr as any).hint === "cotacao_ja_respondida";
      return json({
        ok: false,
        erro: jaRespondida
          ? "Esta cotação já foi respondida ou está em outro status. Atualize a página."
          : rpcErr.message,
      }, 400);
    }

    // 4. Registrar notificação como pendente ──────────────────────────────────
    await supabaseAdmin.from("cotacao_notificacoes").insert({
      cotacao_id,
      tipo: status_novo as "respondido" | "devolvido",
      status_envio: "pendente",
      tentativas: 0,
    });
  }

  // 5. Buscar dados completos da cotação (incluindo itens) ──────────────────
  const { data: cotacao, error: fetchErr } = await supabaseAdmin
    .from("cotacoes")
    .select(`
      id, numero_cotacao, empresa, cnpj, nome_contato,
      email_contato, telefone, proposta_mensagem, motivo_devolucao, status,
      cotacao_itens(sku, nome, ca_number, quantidade, categoria)
    `)
    .eq("id", cotacao_id)
    .single();

  if (fetchErr || !cotacao) {
    return json({ ok: false, erro: "Cotação não encontrada após update." }, 404);
  }

  const cotacaoTyped = cotacao as unknown as CotacaoData;

  if (apenas_email && !["respondido", "devolvido"].includes(cotacaoTyped.status)) {
    return json({ 
      ok: false, 
      erro: "A cotação precisa estar respondida ou devolvida para reenviar e-mail." 
    }, 400);
  }

  // 6. Selecionar template e disparar e-mail ────────────────────────────────
  const templateId =
    cotacaoTyped.status === "respondido"
      ? Deno.env.get("EMAILJS_TEMPLATE_ID_RESPONDIDO")!
      : Deno.env.get("EMAILJS_TEMPLATE_ID_DEVOLVIDO")!;

  const emailResult = await sendEmailJS(templateId, buildTemplateParams(cotacaoTyped));

  // 7. Atualizar registro de notificação ────────────────────────────────────
  const { data: notifRow } = await supabaseAdmin
    .from("cotacao_notificacoes")
    .select("id, tentativas")
    .eq("cotacao_id", cotacao_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (notifRow) {
    await supabaseAdmin
      .from("cotacao_notificacoes")
      .update({
        status_envio: emailResult.ok ? "enviado" : "falhou",
        erro:         emailResult.ok ? null : emailResult.erro,
        tentativas:   (notifRow.tentativas ?? 0) + 1,
      })
      .eq("id", notifRow.id);
  }

  // 8. Responder ao painel admin ────────────────────────────────────────────
  if (emailResult.ok) {
    return json({ ok: true, email_enviado: true });
  }

  return json({
    ok: true,
    email_enviado: false,
    aviso: "Status da cotação salvo com sucesso, mas o e-mail não pôde ser enviado. Use o botão 'Reenviar' no painel.",
    erro_email: emailResult.erro,
  });
});
