import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

export default function Container({
  as: Tag = "div",
  className,
  children,
  size = "xl",
  ...rest
}: ContainerProps) {
  return (
    <Tag className={cn(`layout-container-${size}`, className)} {...rest}>
      {children}
    </Tag>
  );
}
