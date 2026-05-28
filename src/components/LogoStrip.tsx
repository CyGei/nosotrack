/**
 * Logo strip — DESIGN_BRIEF §7.4
 *
 * A quiet, single-row band of institutional names. Names only, no images,
 * rendered as mono word-marks, all caps, matching the eyebrow tags.
 *
 * Sits on the cream canvas with a single hairline rule top and bottom.
 */

const AFFILIATIONS = [
  "Johns Hopkins University",
  "Imperial College London",
  "R Epidemics Consortium",
];

export function LogoStrip() {
  return (
    <section
      id="affiliations"
      aria-label="Research affiliations"
      className="border-y border-rule bg-bg"
    >
      <div className="container-page py-10">
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {AFFILIATIONS.map((name) => (
            <li
              key={name}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-text"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
