"use client";

import { useEffect, useState } from "react";
import { useReducedMotion, useScrollReveal } from "@/lib/hooks";

/** The original title typewriter, with its final height reserved throughout. */
export function AnimatedTitle({ text, enabled = true, rootMargin }: { text: string; enabled?: boolean; rootMargin?: string }) {
  const { ref, fractional } = useScrollReveal<HTMLSpanElement>(text.length, 32, enabled, rootMargin);
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const progress = !enabled ? 0 : !mounted || reduce ? text.length : fractional;
  const count = Math.ceil(progress);

  return (
    <span ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text
          .slice(0, count)
          .split("")
          .map((char, i) => (
            <span key={i} style={{ opacity: Math.min(1, progress - i) }}>
              {char}
            </span>
          ))}
        {progress > 0 && progress < text.length && (
          <span className="relative">
            <span
              className="typewriter-cursor"
              style={{ position: "absolute" }}
            />
          </span>
        )}
        <span style={{ visibility: "hidden" }}>{text.slice(count)}</span>
      </span>
    </span>
  );
}
