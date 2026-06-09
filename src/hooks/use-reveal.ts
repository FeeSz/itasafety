import { useEffect, useRef, useState } from "react";

type Options = {
  /** Trigger threshold (0..1). Default 0.15 */
  threshold?: number;
  /** Trigger once and disconnect. Default true */
  once?: boolean;
  /** rootMargin to anticipate the reveal */
  rootMargin?: string;
};

/**
 * Intersection-observer powered reveal hook.
 * Returns a ref to attach to the element and a boolean `visible`.
 *
 * Usage:
 *   const { ref, visible } = useReveal();
 *   <div ref={ref} className={visible ? "animate-reveal" : "opacity-0"} />
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts: Options = {}) {
  const { threshold = 0.15, once = true, rootMargin = "0px 0px -10% 0px" } = opts;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [threshold, once, rootMargin]);

  return { ref, visible } as const;
}
