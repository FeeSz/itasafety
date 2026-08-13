import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type EyebrowProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "accent" | "muted" | "onDark";
};

export default function Eyebrow({ tone = "accent", className, ...rest }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-label font-semibold tracking-wide",
        tone === "accent" && "text-primary",
        tone === "muted" && "text-foreground-subtle",
        tone === "onDark" && "text-white/75",
        className,
      )}
      {...rest}
    />
  );
}
