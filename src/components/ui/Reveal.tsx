import type { ReactNode, ElementType, CSSProperties } from "react";
import { useReveal } from "@/hooks/use-reveal";

type Props = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
};

/**
 * Wraps children with an intersection-observer driven fade/translate reveal.
 * Respects prefers-reduced-motion (handled in styles.css).
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const style: CSSProperties = { animationDelay: `${delay}ms` };
  return (
    <Tag
      ref={ref}
      style={style}
      className={`${visible ? "animate-reveal" : "opacity-0"} ${className}`}
    >
      {children}
    </Tag>
  );
}
