"use client";

/**
 * Research — pathogen specimen section.
 *
 * Layout (2026-05-24 v6):
 *   - Section title (display, large) — "Pathogen agnostic, ready for
 *     disease X."
 *   - Two-column block under the heading:
 *       · left  — lead paragraph framing Nosotrack's research provenance
 *                 (outbreaker2, linktree, applied outbreak history).
 *       · right — Disease X spotlight (large clickable 3D specimen).
 *                 Pairs with the "…ready for disease X." line in the
 *                 heading. Clicking opens the standard dossier, which
 *                 is special-cased in <PathogenDossier> to show the
 *                 WHO R&D Blueprint definition + priority-diseases
 *                 context + source link.
 *   - PathogenTicker — horizontal auto-drifting strip of every other
 *     specimen. Hover pauses, wheel scrolls faster, click opens dossier.
 *   - Combined attribution footer (links the catalogue back to NIH 3D
 *     Print Exchange / NIAID Visual & Medical Arts; per-specimen
 *     attribution is preserved as a link on each ticker label).
 *
 * The catalogue is declarative: `./pathogens/index.ts`. Adding a new
 * specimen is a registry edit, not a component edit.
 */

import { PathogenTicker } from "./PathogenTicker";
import { PathogenSpotlight } from "./PathogenSpotlight";
import { PATHOGENS } from "./pathogens";

export function Research() {
  if (PATHOGENS.length === 0) return null;

  // Pull Disease X out of the strip and feature it next to the paragraph.
  const spotlight = PATHOGENS.find((p) => p.id === "disease-x") ?? null;
  const tickerPathogens = PATHOGENS.filter((p) => p.id !== "disease-x");

  return (
    <section
      id="research"
      className="section-pad border-t border-rule bg-bg"
      aria-label="Pathogen"
    >
      <div className="container-page">
        <h2 className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
          Pathogen agnostic, ready for disease X.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16 md:items-center">
          <div className="space-y-5 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink md:col-span-7 text-justify hyphens-auto [text-wrap:pretty]">
            <p>
              Nosotrack builds on over a decade of research in outbreak
              forensics, focusing on the integration of epidemiological,
              genomic and contact data to infer transmission trees.
            </p>
            <p>
              Our team and collaborators have published extensively on
              methodological advances, including the <em>outbreaker2</em> R
              package and the <em>linktree</em> method for inferring
              transmission patterns between staff and patients. These
              methods have been applied to real outbreak data, including
              SARS-CoV-2 nosocomial outbreaks in Switzerland and the UK,
              MRSA in neonatal intensive care units in the UK,{" "}
              <em>Klebsiella pneumoniae</em> in a Nepali neonatal unit,{" "}
              <em>Acinetobacter baumannii</em> in hospitals in North
              Carolina, and Ebola outbreaks in the DRC. We are committed
              to open science, with all software freely available and
              publications accessible to the public.
            </p>
          </div>

          {spotlight && (
            <div className="md:col-span-5">
              <div className="mx-auto w-full max-w-[420px]">
                <PathogenSpotlight pathogen={spotlight} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-20">
          <PathogenTicker pathogens={tickerPathogens} />

          {/* Combined attribution footer — per-specimen credit lives on
              each ticker card (the name label links to the source entry).
              This line credits the upstream catalogue uniformly. */}
          <p className="mt-16 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-faint">
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
