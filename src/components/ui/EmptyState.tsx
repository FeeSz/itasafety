import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <Surface
      variant="muted"
      padding="lg"
      className={cn("border-dashed text-center", className)}
      {...props}
    >
      <span
        className="mx-auto grid size-11 place-items-center rounded-md bg-surface text-primary shadow-subtle"
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-h3 font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-body-sm text-foreground-muted">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </Surface>
  );
}
