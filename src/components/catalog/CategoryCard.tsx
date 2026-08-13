import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/categories";

export default function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;

  return (
    <Link
      to="/departamento/$slug"
      params={{ slug: category.slug }}
      aria-label={`Ver produtos de ${category.title}`}
      className="focus-ring motion-surface group flex min-h-40 flex-col rounded-lg border border-border bg-surface-muted p-4 hover:border-primary/30 hover:bg-surface hover:shadow-subtle"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="motion-colors grid size-11 place-items-center rounded-md border border-border bg-surface text-primary group-hover:border-primary/20 group-hover:bg-primary group-hover:text-white">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <ArrowUpRight
          className="motion-transform size-4 text-foreground-subtle group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </div>
      <h3 className="mt-auto text-pretty text-title font-semibold text-foreground">
        {category.title}
      </h3>
      <span className="mt-1 text-caption text-foreground-muted">Explorar categoria</span>
    </Link>
  );
}
