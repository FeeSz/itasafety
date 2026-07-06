import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_company_info",
  title: "Get ItaSafety company info",
  description:
    "Return public company information about ItaSafety: what the company does, contact channels, and the main website URL.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "ItaSafety",
      description:
        "Distribuidora brasileira de Equipamentos de Proteção Individual (EPI) e soluções de segurança do trabalho.",
      website: "https://itasafety.com.br",
      channels: {
        quoteForm: "https://itasafety.com.br/contato",
        whatsapp: "https://itasafety.com.br (botão WhatsApp)",
      },
      language: "pt-BR",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
