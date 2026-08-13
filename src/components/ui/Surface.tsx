import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const surfaceVariants = cva("border text-foreground", {
  variants: {
    variant: {
      card: "rounded-lg border-border bg-surface shadow-subtle",
      elevated: "rounded-lg border-border bg-surface-elevated shadow-elevated",
      muted: "rounded-lg border-border bg-surface-muted",
      overlay: "rounded-lg border-border bg-surface-elevated shadow-overlay",
      plain: "border-transparent bg-transparent",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    },
  },
  defaultVariants: {
    variant: "card",
    padding: "md",
  },
});

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof surfaceVariants> {}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(surfaceVariants({ variant, padding }), className)} {...props} />
  ),
);
Surface.displayName = "Surface";

export { Surface };
