import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-1 text-caption font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-info-muted text-info",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-danger-muted text-danger",
        outline: "border-border-strong bg-surface text-foreground-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
