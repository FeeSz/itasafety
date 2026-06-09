import { cn } from "@/lib/utils";

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-white">
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
    <div className="flex flex-col items-center gap-3 rounded-lg border border-hairline bg-white p-5">
      <SkeletonBlock className="size-14 rounded-full" />
      <SkeletonBlock className="h-3 w-2/3" />
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
