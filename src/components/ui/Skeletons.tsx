import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonBlock({ className }: { className?: string }) {
  return <Skeleton className={cn(className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-subtle">
      <SkeletonBlock className="aspect-square w-full" />
      <div className="space-y-2 p-4">
        <SkeletonBlock className="h-3 w-1/3" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="mt-3 h-9 w-full" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex min-h-40 flex-col rounded-lg border border-border bg-surface-muted p-4">
      <SkeletonBlock className="size-11" />
      <SkeletonBlock className="mt-auto h-4 w-2/3" />
      <SkeletonBlock className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[420px] w-full md:h-[520px]">
      <SkeletonBlock className="h-full w-full rounded-none" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-hairline bg-white shadow-card"
      role="status"
      aria-label="Carregando dados"
    >
      <span className="sr-only">Carregando dados</span>
      <div className="grid grid-cols-[72px_1.4fr_1fr_96px] gap-4 border-b border-hairline bg-surface-sunken px-4 py-3">
        {["w-10", "w-24", "w-20", "w-14"].map((width, index) => (
          <SkeletonBlock key={`${width}-${index}`} className={`h-3 ${width}`} />
        ))}
      </div>
      <div className="divide-y divide-hairline">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[72px_1.4fr_1fr_96px] items-center gap-4 px-4 py-4"
          >
            <SkeletonBlock className="size-9 rounded-lg" />
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-4/5" />
              <SkeletonBlock className="h-2.5 w-2/5" />
            </div>
            <SkeletonBlock className="h-3 w-3/4" />
            <SkeletonBlock className="h-7 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Carregando conteúdo">
      <span className="sr-only">Carregando conteúdo</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-xl border border-hairline bg-white p-4 shadow-card"
        >
          <SkeletonBlock className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3 w-2/5" />
            <SkeletonBlock className="h-3 w-4/5" />
          </div>
          <SkeletonBlock className="h-7 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-4xl space-y-6 px-5 py-10"
      role="status"
      aria-label="Carregando detalhes"
    >
      <span className="sr-only">Carregando detalhes</span>
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-11 rounded-xl" />
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="h-3 w-32" />
        </div>
      </div>
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-11 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="mt-6 h-11 w-40 rounded-full" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <section
      className="min-h-[65vh] bg-surface-sunken px-5 py-10"
      role="status"
      aria-label="Carregando página"
    >
      <span className="sr-only">Carregando página</span>
      <div className="mx-auto max-w-6xl">
        <SkeletonBlock className="h-7 w-52" />
        <SkeletonBlock className="mt-3 h-3 w-80 max-w-full" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="rounded-xl border border-hairline bg-white p-5 shadow-card">
              <SkeletonBlock className="aspect-[16/9] w-full rounded-lg" />
              <SkeletonBlock className="mt-4 h-4 w-3/4" />
              <SkeletonBlock className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
