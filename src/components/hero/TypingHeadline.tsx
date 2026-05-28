"use client";

/**
 * TypingHeadline — Anduril / Shield AI / Boom-style character-typer.
 *
 * Types the headline one character at a time once `active` is true. A
 * blinking caret follows the typed text and stays after completion (so
 * the headline always reads as "live", not "settled into prose").
 *
 * Behaviour rules:
 *   - When `active` flips from false → true, typing starts from index 0.
 *   - When it flips true → false, the text resets so re-entering the
 *     scene restarts the typing (matches the Anduril/Shield AI feel).
 *   - `prefers-reduced-motion` users see the full headline immediately,
 *     with the caret simply blinking on it. No typing animation.
 *   - On mobile (`forceImmediate`), we also skip the animation since the
 *     mobile layout shows all scenes stacked — the typing-then-scroll
 *     dance doesn't apply.
 *
 * Multi-line headlines: pass `lines` as an array. Each line is typed
 * sequentially; line breaks are real <br/>s so wrapping behaves.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

export type TypingHeadlineProps = {
  /** Lines of the headline. Each is typed one after another. */
  lines: string[];
  /** Whether this scene is currently active and should be typing. */
  active: boolean;
  /** Skip the animation entirely (mobile / reduced-motion). */
  forceImmediate?: boolean;
  /** Milliseconds per character. Default 26ms — fast enough that the
   *  whole headline lands in well under a second, slow enough to read
   *  as "live type-in" rather than instant text. Tuned down from 38ms
   *  after the v2 design pass asked for a snappier feel. */
  charDelayMs?: number;
  /** Extra pause between lines, in ms. Default 140ms. */
  lineDelayMs?: number;
  /** Optional Tailwind classes for outer styling. */
  className?: string;
  /** Apply the cream-halo `.hero-accent` to the final line. Used by the
   *  brand close ("Protect.") to match the legacy hero treatment. */
  haloLastLine?: boolean;
};

export function TypingHeadline({
  lines,
  active,
  forceImmediate = false,
  charDelayMs = 26,
  lineDelayMs = 140,
  className = "",
  haloLastLine = false,
}: TypingHeadlineProps) {
  // Number of chars typed across all lines (running counter).
  const [typed, setTyped] = useState(0);
  const reduce = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Total character count across all lines (excluding line break inserts).
  const totalChars = lines.reduce((acc, line) => acc + line.length, 0);

  // Drive the typing animation.
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!active) {
      // Reset so re-entering the scene restarts the typing.
      setTyped(0);
      return;
    }

    if (forceImmediate || reduce) {
      // Skip animation, show everything at once.
      setTyped(totalChars);
      return;
    }

    setTyped(0);
    let next = 0;

    const step = () => {
      next += 1;
      setTyped(next);
      if (next >= totalChars) return;
      // Compute delay — is the NEXT character at the start of a new line?
      let chars = 0;
      let isLineStart = false;
      for (let i = 0; i < lines.length; i++) {
        chars += lines[i].length;
        if (next === chars && i < lines.length - 1) {
          // We just finished a line and the next char starts a new one.
          isLineStart = true;
          break;
        }
      }
      const delay = isLineStart ? lineDelayMs : charDelayMs;
      timerRef.current = setTimeout(step, delay);
    };

    timerRef.current = setTimeout(step, charDelayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, forceImmediate, reduce, lines, totalChars, charDelayMs, lineDelayMs]);

  // Slice each line by how many chars have been typed so far. Empty
  // lines reserve their height with a non-breaking space so the
  // headline never reflows as later lines fill in (would otherwise
  // cause the page-paint to jump on the first character of each new
  // line).
  let remaining = typed;
  const rendered = lines.map((line) => {
    if (remaining <= 0) return "";
    if (remaining >= line.length) {
      remaining -= line.length;
      return line;
    }
    const slice = line.slice(0, remaining);
    remaining = 0;
    return slice;
  });

  return (
    <h1 className={className}>
      {rendered.map((line, i) => {
        // Halo treatment on the final line only — matches the legacy
        // .hero-accent breathing-cream glow used on "Protect." in the
        // original hero.
        const isFinalLine = i === lines.length - 1;
        const haloClass = haloLastLine && isFinalLine ? "block hero-accent" : "block";
        return (
          <span key={i} className={haloClass}>
            {/* When a line hasn't started yet, render   so it still
                occupies vertical space and the layout doesn't jump as
                later lines begin to fill in. */}
            {line || " "}
          </span>
        );
      })}
    </h1>
  );
}
