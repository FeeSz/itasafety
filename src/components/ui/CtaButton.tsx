import { forwardRef, type ElementType, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Unified industrial CTA. Light theme — works on white surfaces and on
 * dark navy backgrounds via the `onDark` flag. Polymorphic via `as`.
 */
const cta = cva(
  "inline-flex items-center justify-center gap-2.5 font-display font-semibold uppercase tracking-wider rounded-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-red text-white hover:bg-brand-red-dark shadow-[0_2px_0_oklch(0.40_0.18_25)] hover:shadow-none focus-visible:ring-brand-red",
        navy: "bg-brand-navy text-white hover:bg-brand-navy-deep focus-visible:ring-brand-navy",
        outline:
          "border border-hairline text-ink hover:border-brand-navy hover:text-brand-navy focus-visible:ring-brand-navy",
        outlineLight:
          "border border-white/30 text-white hover:bg-white hover:text-brand-navy-deep focus-visible:ring-white",
        ghost: "text-ink hover:text-brand-red focus-visible:ring-brand-navy",
      },
      size: {
        sm: "px-4 py-2.5 text-[11px]",
        md: "px-6 py-3.5 text-xs",
        lg: "px-8 py-4 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type CtaButtonOwnProps = VariantProps<typeof cta> & {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CtaButton = forwardRef<HTMLElement, CtaButtonOwnProps & Record<string, any>>(
  function CtaButton({ as: Tag = "button", variant, size, className, children, ...rest }, ref) {
    return (
      <Tag ref={ref} className={cn(cta({ variant, size }), className)} {...rest}>
        {children}
      </Tag>
    );
  },
);

export default CtaButton;
