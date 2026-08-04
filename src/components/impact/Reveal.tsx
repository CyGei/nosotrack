"use client";

import { useRef, useState, type ReactNode } from "react";
import { useInViewOnce, useReducedMotion } from "@/lib/hooks";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [settled, setSettled] = useState(false);
  // No mount-check: the fade-up must read as a scroll response.
  const inView = useInViewOnce(ref, { rootMargin: "0px 0px -12% 0px" });
  const shown = reduce || inView;

  return (
    <div
      ref={ref}
      className={className}
      onTransitionEnd={() => setSettled(true)}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(8px)",
        transition: reduce
          ? "none"
          : `opacity 560ms var(--ease-nt) ${delay}ms, transform 560ms var(--ease-nt) ${delay}ms`,
        // Drop the compositor hint once settled: `will-change: transform`
        // otherwise forms a containing block for descendants.
        willChange: reduce || settled ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
