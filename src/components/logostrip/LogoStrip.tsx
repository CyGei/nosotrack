/**
 * Logo strip — DESIGN_BRIEF §7.4
 *
 * A quiet, single-row band of institutional names. The legacy content
 * carries names only (no images), so each entry is rendered as a mono
 * word-mark, all caps, with the same letter-spacing as the eyebrow tags.
 *
 * The strip sits on the cream canvas, separated from neighbouring
 * sections by a single hairline rule top and bottom.
 */

import { logoStrip } from "@/lib/content";

export function LogoStrip() {
  if (!logoStrip?.length) return null;

  return (
    <section
      id="affiliations"
      aria-label="Research affiliations"
      className="border-y border-rule bg-bg"
    >
      <div className="container-page py-10">
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {logoStrip.map((logo, i) => (
            <li
              key={i}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-text"
            >
              {logo.name as string}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
