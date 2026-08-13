import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";

type ErrorStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title, description, action, className, ...props }: ErrorStateProps) {
  return (
    <Surface
      role="alert"
      variant="card"
      padding="lg"
      className={cn("border-danger/25 text-center", className)}
      {...props}
    >
      <span
        className="mx-auto grid size-11 place-items-center rounded-md bg-danger-muted text-danger"
        aria-hidden
      >
        <CircleAlert className="size-5" strokeWidth={1.75} />
      </span>
      <h1 className="mt-4 text-h3 font-semibold text-foreground">{title}</h1>
      <p className="mx-auto mt-2 max-w-lg text-body-sm text-foreground-muted">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </Surface>
  );
}
