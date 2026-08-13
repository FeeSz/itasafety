import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import CategoryGrid from "@/components/sections/CategoryGrid";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/categorias")({
  head: () =>
    pageMeta({
      title: "Categorias de EPI — ItaSafety",
      description:
        "Consulte o índice de categorias atualmente publicado pela ItaSafety e acesse os produtos relacionados a cada área de proteção.",
      path: "/categorias",
    }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <section className="section-functional bg-surface">
      <Container>
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/catalogo">
            <ArrowLeft className="size-4" aria-hidden />
            Voltar ao catálogo
          </Link>
        </Button>
        <Eyebrow className="mt-6">Índice completo</Eyebrow>
        <h1 className="mt-3 text-h1 font-semibold text-foreground">Todas as categorias</h1>
        <p className="mt-3 max-w-2xl text-body text-foreground-muted">
          Este é o índice completo da taxonomia atualmente versionada. Selecione uma categoria para
          ver os produtos publicados nela.
        </p>
        <div className="mt-8">
          <CategoryGrid />
        </div>
      </Container>
    </section>
  );
}
