/**
 * Roadmap — exact visual port of main branch §15 (legacy/styles.css 1739-1827
 * and legacy/index.html 595-635).
 *
 * Structure:
 *   <section id="roadmap" class="section-padding">
 *     <div class="container">
 *       <h2 class="section-title">title</h2>            ← clamp 2.4-3.75rem, mb 32, max-w 20ch
 *       <p class="roadmap-intro">intro</p>              ← 16/1.7, max-w 860, mb 64
 *       (Section eyebrow tag removed 2026-05-25 — see TYPOGRAPHY.md
 *        "Don'ts": sections lead with the H2.)
 *       <div class="roadmap-timeline">                  ← rail at left:16, flex column, pl-40
 *         <div class="roadmap-phase">                   ← pb-48 (last:0), align-start
 *           <div class="roadmap-node">                  ← absolute left:-36 top:6, 24×24, bg-bg
 *             <div class="roadmap-node-ring"/>          ← 10×10 square INK
 *           </div>
 *           <div class="roadmap-card">                  ← p:28×32, bg-alt, border-rule, hover→border-ink
 *             <div class="roadmap-phase-badge">badge    ← mono 11/0.18em MUTE, mb 14
 *             <h3 class="roadmap-card-title">title      ← display 22/500, lh 1.25, mb 12
 *             <p class="roadmap-card-desc">desc         ← 15/1.7 TEXT, mb 20
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </section>
 *
 * All spacing/typography numbers are verbatim from main.
 */

type RoadmapPhase = {
  badge: string;
  title: string;
  desc: string;
};

const ROADMAP_INTRO =
  "We are seeking collaborators and funding to validate and deploy Nosotrack in two stages.";

const PHASES: RoadmapPhase[] = [
  {
    badge: "Phase 1",
    title: "Simulation Study",
    desc: "Conduct simulation studies under realistic operational constraints to determine the conditions under which Nosotrack improves outbreak control.<br>This phase will assess Nosotrack's effectiveness across pathogens, hospital settings, and levels of data availability.",
  },
  {
    badge: "Phase 2",
    title: "Pilot Study",
    desc: "Deploy the platform in real-time in a hospital environment.<br>This phase will generate real-world evidence on reduced infections, cost savings, and improved hospital capacity management.",
  },
];

export function Roadmap() {
  return (
    <section
      id="roadmap"
      className="section-pad border-t border-rule bg-bg"
      aria-label="Roadmap"
    >
      <div className="container-page">
        {/* SECTION HEADING — TYPOGRAPHY.md rule 1. */}
        <h2 className="mb-8 max-w-[20ch] font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
          Next steps.
        </h2>

        {/* SUBTITLE — TYPOGRAPHY.md rule 2 (body heading / subtitle). */}
        <p className="mb-16 max-w-[55ch] font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink">
          {ROADMAP_INTRO}
        </p>

        {/* TIMELINE — flex column, padding-left 40, vertical rail at left 16 */}
        <div className="relative flex flex-col pl-10">
          {/* Rail */}
          <span
            aria-hidden
            className="absolute bottom-0 left-4 top-0 w-px bg-rule-strong"
          />

          {PHASES.map((phase, i) => {
            const isLast = i === PHASES.length - 1;
            return (
              <div
                key={i}
                className={`relative flex items-start ${isLast ? "pb-0" : "pb-12"}`}
              >
                {/* NODE — absolute left:-36 top:6, 24×24, bg-bg so it masks the rail */}
                <span
                  aria-hidden
                  className="absolute -left-9 top-[6px] z-[2] flex h-6 w-6 items-center justify-center bg-bg"
                >
                  {/* RING — 10×10 square ink */}
                  <span className="block h-[10px] w-[10px] bg-ink" />
                </span>

                {/* CARD — bg-alt, border-rule, hover→border-ink, padding 28×32 */}
                <article className="group relative w-full overflow-hidden border border-rule bg-bg-alt px-8 py-7 transition-[border-color,background] duration-[var(--transition-duration-fast)] hover:border-ink">
                  {/* PHASE BADGE — mono 11/0.18em MUTE, mb 14 */}
                  <div className="mb-[14px] inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
                    {phase.badge}
                  </div>

                  {/* CARD TITLE — TYPOGRAPHY.md rule 2 (body heading). */}
                  <h3 className="mb-3 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink">
                    {phase.title}
                  </h3>

                  {/* CARD DESC — TYPOGRAPHY.md rule 3 (body paragraph). */}
                  <p
                    className="mb-5 text-[17px] leading-[1.55] tracking-[-0.005em] text-mute"
                    dangerouslySetInnerHTML={{ __html: phase.desc }}
                  />
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
