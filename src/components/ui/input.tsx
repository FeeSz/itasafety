import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "focus-ring motion-surface flex h-11 w-full rounded-md border border-input bg-surface px-3 text-body text-foreground shadow-none file:border-0 file:bg-transparent file:text-body-sm file:font-medium file:text-foreground placeholder:text-foreground-subtle focus-visible:border-primary focus-visible:outline-offset-2 aria-invalid:border-danger aria-invalid:bg-danger-muted disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-foreground-muted disabled:opacity-70 read-only:bg-surface-muted read-only:text-foreground-muted",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
