import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type EyebrowProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "accent" | "muted";
};

/**
 * Section/label microtype. Unifies the 3 inconsistent variants found
 * across the codebase (tracking-tighter / [0.18em] / [0.2em]) into one.
 */
export default function Eyebrow({
  tone = "accent",
  className,
  ...rest
}: EyebrowProps) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] font-medium uppercase tracking-[0.2em]",
        tone === "accent" ? "text-brand-red" : "text-white/40",
        className,
      )}
      {...rest}
    />
  );
}
