"use client";

import { PathogenArc } from "./PathogenArc";
import { PATHOGENS } from "./pathogens";

export function Research() {
  if (PATHOGENS.length === 0) return null;

  const hero = PATHOGENS.find((p) => p.id === "disease-x") ?? null;
  const others = PATHOGENS.filter((p) => p.id !== "disease-x");

  return (
    <section
      id="research"
      data-story-chapter
      data-story-side="right"
      className="border-t border-rule bg-bg pt-[var(--spacing-section)] pb-[clamp(40px,5vw,72px)]"
      aria-label="Pathogen"
    >
      <div className="container-page">
        <h2
          data-story-title
          className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]"
        >
          Pathogen agnostic, ready for Disease X.
        </h2>

        <div data-story-fork>
          <div
            data-story-branch
            className="space-y-5 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink [text-wrap:pretty]"
          >
            <p>
              Nosotrack reconstructs transmission chains in near real-time by
              integrating epidemiological, genomic and contact data using the
              open-source Bayesian inference framework{" "}
              <a
                href="https://github.com/reconhub/outbreaker2"
                target="_blank"
                rel="noreferrer"
                className="italic underline underline-offset-4 decoration-1"
              >
                outbreaker2
              </a>
              . It identifies the likely source of each infection and quantifies
              the uncertainty around it.
            </p>
            <p>
              Designed to work across pathogens, healthcare settings and
              outbreak scenarios,{" "}
              <strong style={{ fontWeight: 500 }}>
                Nosotrack enables response teams to understand how outbreaks
                spread, and determine when and where to intervene.
              </strong>
            </p>
          </div>

          <div data-story-branch="quiet">
            {hero && <PathogenArc hero={hero} others={others} />}
          </div>
        </div>
      </div>
    </section>
  );
}
