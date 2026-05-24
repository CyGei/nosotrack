/**
 * Research — pathogen specimen section (rev. 7, 2026-05-24).
 *
 * Stripped down to a single centred 3D specimen. The catalogue grid,
 * callouts, and SVG procedural pathogens are gone — we'll build the
 * lineup back up one pathogen at a time. SARS-CoV-2 ships first.
 *
 * Layout:
 *   - Section title (display, large) — "Pathogen agnostic, ready for
 *     disease X."
 *   - Centred 3D virion (raw Three.js, auto-rotates, palette grey body
 *     with red-shaded S-protein spikes).
 *
 * Per Cy 2026-05-24: no caption, no metadata, no copy. Visual only. We
 * layer on identity / data / refs in later passes.
 */

import { Virion3D } from "./Virion3D";

export function Research() {
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
          <Virion3D />
          {/* CC-BY 4.0 attribution — the GLB asset is the NIAID Visual &
              Medical Arts virion (NIH 3D entry 3DPX-013323). License
              requires visible credit. */}
          <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-faint">
            Model ·{" "}
            <a
              href="https://3d.nih.gov/entries/3dpx-013323"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-text hover:underline"
            >
              NIAID Visual &amp; Medical Arts
            </a>{" "}
            · CC-BY 4.0
          </p>
        </div>
      </div>
    </section>
  );
}
