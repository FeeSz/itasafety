import { forwardRef, type ElementType, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Unified industrial CTA button. Replaces ~7 hand-rolled `bg-brand-red px-X py-Y...`
 * variants spread across pages. Use `asChild`-style polymorphism via the `as` prop
 * so we can render <Link>, <a>, or <button> without losing styling.
 */
const cta = cva(
  "inline-flex items-center justify-center gap-3 font-display font-bold uppercase tracking-tighter transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy-deep disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-brand-red text-white hover:bg-brand-red-dark",
        outline: "border-2 border-white/20 text-white hover:bg-white/10",
        ghost: "text-white hover:text-brand-red",
      },
      size: {
        sm: "px-5 py-3 text-xs",
        md: "px-7 py-4 text-sm",
        lg: "px-8 py-5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type CtaButtonProps = VariantProps<typeof cta> & {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
};

const CtaButton = forwardRef<HTMLElement, CtaButtonProps>(function CtaButton(
  { as: Tag = "button", variant, size, className, children, ...rest },
  ref,
) {
  return (
    <Tag ref={ref} className={cn(cta({ variant, size }), className)} {...rest}>
      {children}
    </Tag>
  );
});

export default CtaButton;
