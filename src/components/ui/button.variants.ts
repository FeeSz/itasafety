import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "focus-ring motion-control inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-label font-semibold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[loading=true]:cursor-wait [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-subtle hover:bg-primary-hover active:bg-primary-active active:translate-y-px",
        destructive:
          "bg-brand-accent text-white shadow-subtle hover:bg-danger active:bg-danger active:translate-y-px",
        outline:
          "border border-border-strong bg-surface text-foreground hover:border-primary/45 hover:bg-accent hover:text-accent-foreground active:bg-accent-muted",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground hover:bg-accent active:bg-accent-muted",
        ghost:
          "text-foreground-muted hover:bg-accent hover:text-accent-foreground active:bg-accent-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 rounded-sm px-3 text-caption",
        lg: "h-12 px-6 text-body-sm",
        icon: "size-11 p-0",
        "icon-sm": "size-9 rounded-sm p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
