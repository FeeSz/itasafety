import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type EyebrowProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "accent" | "muted" | "onDark";
};

/**
 * Section/label microtype. Single canonical style with three tone options.
 */
export default function Eyebrow({
  tone = "accent",
  className,
  ...rest
}: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.22em]",
        tone === "accent" && "text-brand-red",
        tone === "muted" && "text-ink-soft",
        tone === "onDark" && "text-white/70",
        "before:block before:h-px before:w-6 before:bg-current",
        className,
      )}
      {...rest}
    />
  );
}
