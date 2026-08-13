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
      className="border-t border-rule bg-bg pt-[var(--spacing-section)] pb-[clamp(40px,5vw,72px)]"
      aria-label="Pathogen"
    >
      <div className="container-page">
        <h2 className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
          Pathogen agnostic, ready for Disease X.
        </h2>

        <div className="mt-12 grid grid-cols-1 items-start gap-12 md:mt-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-5 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink text-justify hyphens-auto [text-wrap:pretty]">
            <p>
              Nosotrack reconstructs transmission chains in near real-time
              by integrating epidemiological, genomic and contact data
              using the open-source Bayesian inference framework{" "}
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
              outbreak scenarios, Nosotrack enables response teams to
              understand how outbreaks spread, and determine when and where
              to intervene.
            </p>
          </div>

          <div className="md:-mt-8">
            {hero && <PathogenArc hero={hero} others={others} />}
          </div>
        </div>
      </div>
    </section>
  );
}
