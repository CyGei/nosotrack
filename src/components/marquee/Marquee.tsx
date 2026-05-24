"use client";

/**
 * Marquee — DESIGN_BRIEF §7.5
 *
 * Infinite horizontal marquee of mono-typeset capability tags. Two
 * copies of the list are concatenated so the keyframe animation loops
 * seamlessly (translate from 0 → -50% over ~52 s). Hairline rules top
 * and bottom keep the band quiet on the cream canvas.
 *
 * Reduced-motion: animation is suspended; the list is shown statically
 * with horizontal overflow allowed.
 */

import { marquee } from "@/lib/content";

export function Marquee() {
  if (!marquee?.length) return null;
  // Duplicate for seamless loop.
  const items = [...marquee, ...marquee];

  return (
    <section
      aria-label="Capabilities"
      className="overflow-hidden border-y border-rule bg-bg"
    >
      <div className="marquee-track flex items-center gap-16 whitespace-nowrap py-6">
        {items.map((label, i) => (
          <span
            key={i}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            {label}
          </span>
        ))}
      </div>

      <style>{`
        .marquee-track {
          width: max-content;
          animation: marquee-scroll 52s linear infinite;
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
