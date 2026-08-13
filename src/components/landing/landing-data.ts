export function appHref(path = "/") {
  return path;
}

export const MINIMAL_BENEFITS = [
  {
    title: "Seleção organizada",
    description:
      "Produtos reunidos por categoria e necessidade.",
  },
  {
    title: "Cotação direcionada",
    description:
      "Uma lista clara para iniciar o atendimento.",
  },
  {
    title: "Atendimento B2B",
    description:
      "Uma jornada comercial pensada para empresas.",
  },
] as const;

export const LANDING_FAQS = [
  {
    question: "Como solicito uma cotação?",
    answer:
      "Explore o catálogo, reúna os EPIs de interesse e avance para a cotação na aplicação. O envio final acontece após autenticação e validação do cadastro empresarial.",
  },
  {
    question: "Preciso de cadastro para consultar os produtos?",
    answer:
      "Não. O catálogo pode ser explorado sem login. O cadastro é solicitado quando você decide enviar e acompanhar uma cotação.",
  },
  {
    question: "Onde encontro o Certificado de Aprovação do EPI?",
    answer:
      "Quando disponível no cadastro, o CA é apresentado nos detalhes do produto. A equipe também pode apoiar a conferência da documentação necessária para a sua aplicação.",
  },
  {
    question: "Como encontro o EPI adequado para minha necessidade?",
    answer:
      "Você pode navegar por categorias e aplicações ou falar com o atendimento para organizar a seleção conforme o contexto da sua empresa.",
  },
  {
    question: "Os preços aparecem no catálogo?",
    answer:
      "A jornada é comercial e orientada por cotação. Valores e condições são apresentados na resposta preparada para a solicitação da empresa.",
  },
  {
    question: "Como acompanho uma cotação enviada?",
    answer:
      "Após o envio, o andamento e a resposta comercial ficam disponíveis na área de cotações da conta utilizada na solicitação.",
  },
  {
    question: "Posso falar com a equipe antes de montar a lista?",
    answer:
      "Sim. A página de contato oferece o caminho direto para iniciar uma conversa comercial antes de concluir a seleção.",
  },
] as const;
