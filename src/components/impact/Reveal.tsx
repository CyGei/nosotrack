"use client";

/**
 * Reveal — a minimal scroll-into-view fade-up wrapper.
 *
 * Mirrors the site's motion language (the About typewriter, the ledger
 * count-up): content starts a touch low and transparent, then rises and
 * settles once on first entry. Reduced-motion users get the final, placed
 * state immediately. Purely presentational — it renders a plain block, so it
 * can wrap headings, kickers or a whole tally movement without changing the
 * document outline underneath it.
 */

import { useRef, useState, type ReactNode } from "react";
import { useInViewOnce, useReducedMotion } from "@/lib/hooks";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Extra ms before this block begins rising — used to stagger a stack. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [settled, setSettled] = useState(false);
  // No mount-check — the fade-up should read as a scroll response, not fire
  // before the section is reached.
  const inView = useInViewOnce(ref, { rootMargin: "0px 0px -12% 0px" });
  // Reduced-motion users get the placed state at once; everyone else rises
  // once on first entry.
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
        // Drop the compositor hint — and the containing block `will-change:
        // transform` forms — once this one-shot reveal has settled.
        willChange: reduce || settled ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
