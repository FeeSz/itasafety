import { appHref, LANDING_FAQS } from "@/components/landing/landing-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

export default function LandingFAQ() {
  return (
    <section id="perguntas" className="section-editorial scroll-mt-4" aria-labelledby="landing-faq-title">
      <Container size="md">
        <Reveal>
          <h2 id="landing-faq-title" className="text-h1 font-semibold text-foreground">
            <span className="block text-foreground-subtle">Perguntas.</span>
            <span className="block text-primary-active">Respondidas.</span>
          </h2>

          <Accordion type="single" collapsible className="mt-12 border-t border-border sm:mt-16">
            {LANDING_FAQS.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`} className="border-border">
                <AccordionTrigger className="min-h-16 px-1 text-title font-medium hover:no-underline sm:min-h-[72px]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl px-1 pb-6 pr-12 text-body-sm text-foreground-muted">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-10 text-center text-body-sm text-foreground-muted">
            Não encontrou sua resposta?{" "}
            <a
              href={appHref("/contato")}
              className="focus-ring motion-colors rounded-sm border-b border-foreground-subtle text-foreground hover:border-brand-accent hover:text-primary"
            >
              Conte o que sua equipe precisa proteger
            </a>
            .
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
