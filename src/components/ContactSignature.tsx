"use client";

import { useEffect, useRef, useState } from "react";
import { useInViewOnce, useReducedMotion } from "@/lib/hooks";
import { BrandMark } from "./BrandMark";
import { BrandWordmark } from "./BrandWordmark";
import { TypingHeadline } from "./hero/TypingHeadline";
import styles from "./ContactSignature.module.css";

const TIP_LINES = ["Track.", "Intervene.", "Protect."];
const SPIN_MS = 1_300;

/** The original brand sequence, sized to sit inside the contact invitation. */
export function ContactSignature() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInViewOnce(ref, { rootMargin: "0px 0px -12% 0px", threshold: 0.4, mountCheck: true });
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setRevealed(true);
      return;
    }
    const timer = setTimeout(() => setRevealed(true), SPIN_MS + 80);
    return () => clearTimeout(timer);
  }, [active, reduce]);

  return (
    <div ref={ref} className={styles.signature} data-tip-active={active} data-expanded={reduce || revealed}>
      <span className="sr-only">Nosotrack. Track. Intervene. Protect.</span>
      <div aria-hidden="true">
        <div className={styles.brand}>
          <BrandMark className={styles.mark} spinKey={active ? 1 : 0} spinning={active && !reduce} spinDurationMs={SPIN_MS} />
          <span className={styles.wordmark}><BrandWordmark /></span>
        </div>
        <TypingHeadline
          as="p"
          lines={TIP_LINES}
          active={revealed}
          forceImmediate={reduce}
          initialsFirst
          className={styles.copy}
        />
      </div>
    </div>
  );
}
