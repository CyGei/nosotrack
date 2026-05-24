/**
 * Roadmap — exact visual port of main branch §15 (legacy/styles.css 1739-1827
 * and legacy/index.html 595-635).
 *
 * Structure:
 *   <section id="roadmap" class="section-padding">
 *     <div class="container">
 *       <span class="section-tag">tag</span>            ← mono 11/0.22em INK, mb 28
 *       <h2 class="section-title">title</h2>            ← clamp 2.4-3.75rem, mb 32, max-w 20ch
 *       <p class="roadmap-intro">intro</p>              ← 16/1.7, max-w 860, mb 64
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
 * All spacing/typography numbers are verbatim from main. The optional tags
 * row is preserved for future phases that supply `tags`; current
 * content.json omits it so no row renders.
 */

import { roadmap } from "@/lib/content";

interface RoadmapPhase {
  badge: string;
  title: string;
  desc: string;
  tags?: string[];
}

export function Roadmap() {
  const phases = roadmap.phases as RoadmapPhase[];

  return (
    <section
      id="roadmap"
      className="section-pad bg-bg"
      aria-label={roadmap.tag}
    >
      <div className="container-page">
        {/* SECTION TAG — mono 11/0.22em, ink, mb 28 */}
        <span className="mb-7 inline-block font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink">
          {roadmap.tag}
        </span>

        {/* SECTION TITLE — display 500, clamp 2.4-3.75rem, ink, lh 1.02, ls -.035em, max-w 20ch, mb 32 */}
        <h2 className="mb-8 max-w-[20ch] font-display font-medium leading-[1.02] tracking-[-0.035em] text-ink text-[clamp(2.4rem,5vw,3.75rem)]">
          {roadmap.title.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>

        {/* INTRO — 16/1.7, ls -.005em, text, max-w 860, mb 64 */}
        {roadmap.intro && (
          <p
            className="mb-16 max-w-[860px] text-[16px] leading-[1.7] tracking-[-0.005em] text-text"
            dangerouslySetInnerHTML={{ __html: roadmap.intro }}
          />
        )}

        {/* TIMELINE — flex column, padding-left 40, vertical rail at left 16 */}
        <div className="relative flex flex-col pl-10">
          {/* Rail */}
          <span
            aria-hidden
            className="absolute bottom-0 left-4 top-0 w-px bg-rule-strong"
          />

          {phases.map((phase, i) => {
            const isLast = i === phases.length - 1;
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

                  {/* CARD TITLE — display 22/500, lh 1.25, ls -.02em, ink, mb 12 */}
                  <h3 className="mb-3 font-display text-[22px] font-medium leading-[1.25] tracking-[-0.02em] text-ink">
                    {phase.title}
                  </h3>

                  {/* CARD DESC — 15/1.7, text, mb 20 */}
                  <p
                    className="mb-5 text-[15px] leading-[1.7] text-text"
                    dangerouslySetInnerHTML={{ __html: phase.desc }}
                  />

                  {/* OPTIONAL TAGS — border-top + tag list (only if tags exist) */}
                  {phase.tags && phase.tags.length > 0 && (
                    <div className="flex flex-wrap border-t border-rule pt-4">
                      {phase.tags.map((tag, j) => (
                        <span
                          key={j}
                          className={`mr-3 inline-flex items-center gap-1 py-[3px] pr-3 font-mono text-[11px] tracking-[0.08em] text-mute ${
                            j < phase.tags!.length - 1 ? "border-r border-rule" : ""
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
