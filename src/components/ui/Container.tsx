import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
};

/**
 * Single source of truth for the horizontal page rhythm.
 * Replaces the repeated `mx-auto max-w-7xl px-6` pattern.
 */
export default function Container({
  as: Tag = "div",
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-7xl px-6", className)} {...rest}>
      {children}
    </Tag>
  );
}
