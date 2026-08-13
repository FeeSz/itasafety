import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "focus-ring motion-surface flex min-h-24 w-full rounded-md border border-input bg-surface px-3 py-2.5 text-body text-foreground shadow-none placeholder:text-foreground-subtle focus-visible:border-primary aria-invalid:border-danger aria-invalid:bg-danger-muted disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-foreground-muted disabled:opacity-70 read-only:bg-surface-muted read-only:text-foreground-muted",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
