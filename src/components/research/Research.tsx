"use client";

/**
 * Research — pathogen specimen section.
 *
 * Layout:
 *   - Section title (display, large) — "Pathogen agnostic, ready for
 *     Disease X."
 *   - Two-column block under the heading (shares the 1fr / 1.1fr grid with
 *     the "Validated by science" globe section below so they line up):
 *       · left  — lead paragraph framing Nosotrack's research provenance.
 *       · right — <PathogenArc>: a stage that mirrors the globe. Disease X
 *                 is the hero (large, clickable) and every other specimen
 *                 arcs off its right edge, echoing the metric labels arched
 *                 around the globe. Clicking any specimen opens the shared
 *                 <PathogenDossier> (special-cased for Disease X to show the
 *                 WHO R&D Blueprint definition).
 *
 * The catalogue is declarative: `./pathogens/index.ts`. Adding a new
 * specimen is a registry edit, not a component edit.
 */

import { PathogenArc } from "./PathogenArc";
import { PATHOGENS } from "./pathogens";

export function Research() {
  if (PATHOGENS.length === 0) return null;

  // Disease X is the hero; every other specimen arcs off its right edge.
  const hero = PATHOGENS.find((p) => p.id === "disease-x") ?? null;
  const others = PATHOGENS.filter((p) => p.id !== "disease-x");

  return (
    <section
      id="research"
      className="border-t border-rule bg-bg pt-[var(--spacing-section)] pb-[clamp(40px,5vw,72px)]"
      aria-label="Pathogen"
    >
      <div className="container-page">
        <h2 className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
          Pathogen agnostic, ready for Disease X.
        </h2>

        {/* Two-column block — shares the grid skeleton with the "Validated
            by science" section below (same 1fr / 1.1fr split + gap-12) so the
            two reading columns line up as the sections stack. The right
            column mirrors the globe stage: Disease X hero + arched catalogue. */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 md:mt-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-5 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink text-justify hyphens-auto [text-wrap:pretty]">
            <p>
              Nosotrack reconstructs transmission chains in near real-time
              by integrating epidemiological, genomic and contact data
              within a unified Bayesian inference framework. The platform
              identifies the likely source of each infection and quantifies
              the uncertainty around it.
            </p>
            <p>
              Designed to work across pathogens, healthcare settings and
              outbreak scenarios, Nosotrack enables response teams to
              understand how outbreaks spread, and determine when and where
              to intervene.
            </p>
          </div>

          {/* Lifted slightly so the tall X sits a touch higher than the
              top-aligned paragraphs (its centre nears the text's centre). */}
          <div className="md:-mt-8">
            {hero && <PathogenArc hero={hero} others={others} />}
          </div>
        </div>
      </div>
    </section>
  );
}
