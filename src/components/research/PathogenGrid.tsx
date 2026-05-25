"use client";

/**
 * PathogenGrid — renders every PathogenSpec at once in a responsive grid.
 *
 * Each cell is a clickable button that opens the per-pathogen
 * <PathogenDossier> modal. The grid itself stays mounted underneath,
 * so closing the dossier returns the visitor exactly where they were
 * without a layout shift.
 *
 * Grid responsive breakpoints (Tailwind v4):
 *   - mobile          → 2 columns
 *   - md (≥768)       → 3 columns
 *   - lg (≥1024)      → 4 columns
 *   - xl (≥1280)      → 5 columns (15 cells fit the 13-specimen catalogue
 *                                   cleanly with 2 spacers in the final row)
 *
 * Performance note: each <PathogenViewer> instantiates its own WebGL
 * context. 13 specimens in the grid + 1 in the dossier (when open) is
 * within Chrome's ~16-context cap, but borderline on older Safari (~8).
 * If we push the catalogue beyond ~14 we should refactor to a shared
 * renderer.
 */

import { useState } from "react";
import type { PathogenSpec } from "./pathogens/types";
import { PathogenViewer } from "./PathogenViewer";
import { PathogenDossier } from "./PathogenDossier";

type Props = {
  pathogens: PathogenSpec[];
};

export function PathogenGrid({ pathogens }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pathogens.find((p) => p.id === activeId) ?? null;

  return (
    <>
      <ul
        className={[
          "grid list-none gap-x-6 gap-y-10 p-0",
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        ].join(" ")}
        aria-label="Pathogen catalogue"
      >
        {pathogens.map((p) => (
          <li key={p.id} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setActiveId(p.id)}
              aria-label={`Open dossier for ${p.name}`}
              className={[
                "group relative block w-full max-w-[220px] cursor-pointer",
                "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-alert)]",
                // Subtle hairline border that lights up alert-red on
                // hover/focus — signals the cell is interactive without
                // breaking the floating-specimen aesthetic.
                "border border-transparent transition-colors duration-200",
                "hover:border-[var(--color-alert)]/40",
                "focus-visible:border-[var(--color-alert)]/60",
              ].join(" ")}
            >
              <PathogenViewer
                pathogen={p}
                className="relative aspect-square w-full"
              />
              {/* Tiny corner brackets that appear on hover — a Palantir
                  "you can interact with this" tell. */}
              <span aria-hidden className="pointer-events-none absolute inset-0">
                <span className="absolute left-1 top-1 h-2 w-2 border-l border-t border-[var(--color-alert)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="absolute right-1 top-1 h-2 w-2 border-r border-t border-[var(--color-alert)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="absolute left-1 bottom-1 h-2 w-2 border-l border-b border-[var(--color-alert)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="absolute right-1 bottom-1 h-2 w-2 border-r border-b border-[var(--color-alert)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </span>
            </button>

            {/* Micro label — same line links out to the source entry to
                preserve CC-BY attribution at the grid level. The whole
                card click opens the in-app dossier; the label-link is a
                secondary affordance that goes to the model's NIH 3D
                entry directly. */}
            <a
              href={p.source.nih3dEntryUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={[
                "mt-3 block font-mono text-[10px] uppercase",
                "tracking-[0.22em] text-faint",
                "underline-offset-4 hover:text-text hover:underline",
              ].join(" ")}
            >
              {p.shortLabel ?? p.name}
            </a>
          </li>
        ))}
      </ul>

      {active && (
        <PathogenDossier
          pathogen={active}
          onClose={() => setActiveId(null)}
        />
      )}
    </>
  );
}
