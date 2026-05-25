"use client";

/**
 * Research — pathogen specimen section.
 *
 * Renders the entire pathogen catalogue at once as a responsive grid
 * (see <PathogenGrid>). Each cell is a smaller auto-rotating 3D viewer,
 * so the whole catalogue floats on the page with no interaction needed.
 *
 * The catalogue is declarative: `./pathogens/index.ts`. Adding a new
 * specimen is a registry edit, not a component edit.
 *
 * Layout:
 *   - Section title (display, large) — "Pathogen agnostic, ready for
 *     disease X."
 *   - PathogenGrid (all specimens, smaller viewers, auto-rotating)
 *   - Combined attribution footer (links the catalogue back to NIH 3D
 *     Print Exchange / NIAID Visual & Medical Arts; per-specimen
 *     attribution is preserved as a link on each name label).
 */

import { PathogenGrid } from "./PathogenGrid";
import { PATHOGENS } from "./pathogens";

export function Research() {
  if (PATHOGENS.length === 0) return null;

  return (
    <section
      id="research"
      className="section-pad border-t border-rule bg-bg"
      aria-label="Pathogen"
    >
      <div className="container-page">
        <h2 className="font-display font-medium leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
          Pathogen agnostic, ready for disease X.
        </h2>

        <div className="mt-20">
          <PathogenGrid pathogens={PATHOGENS} />

          {/* Combined attribution footer — per-specimen credit lives on
              each grid card (the name label links to the source entry).
              This line credits the upstream catalogue uniformly. */}
          <p className="mt-16 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-faint">
            Models ·{" "}
            <a
              href="https://3d.nih.gov/"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-text hover:underline"
            >
              NIH 3D Print Exchange
            </a>{" "}
            · NIAID Visual &amp; Medical Arts · CC-BY 4.0 / Public Domain
          </p>
        </div>
      </div>
    </section>
  );
}
