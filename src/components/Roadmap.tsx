type RoadmapPhase = {
  badge: string;
  title: string;
  desc: string;
};

const ROADMAP_INTRO = (
  <>
    <strong className="font-medium">
      Nosotrack is currently at the prototype stage.
    </strong>
    <br />A dashboard, live at{" "}
    <a
      href="https://nosotrack.onrender.com"
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-4 decoration-1"
    >
      nosotrack.onrender.com
    </a>
    , demonstrates the core outbreak-reconstruction engine (
    <a
      href="https://github.com/reconhub/outbreaker2"
      target="_blank"
      rel="noreferrer"
      className="italic underline underline-offset-4 decoration-1"
    >
      outbreaker2
    </a>
    ) with an integrated LLM interface. Additional modules, including
    contaminated-source (<em>e.g.</em> medical device) identification and an
    intervention simulator, are under development.
  </>
);

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
      data-story-chapter
      data-story-side="left"
      className="section-pad border-t border-rule bg-bg"
      aria-label="Roadmap"
    >
      <div className="container-page">
        <h2
          data-story-title
          className="mb-8 max-w-[20ch] font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]"
        >
          Next steps.
        </h2>

        <div data-story-fork>
          <p
            data-story-branch
            className="mb-16 max-w-[55ch] font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink [text-wrap:pretty]"
          >
            {ROADMAP_INTRO}
          </p>

          <div data-story-branch>
            {PHASES.map((phase, i) => {
              const isLast = i === PHASES.length - 1;
              return (
                <div
                  data-story-leaf
                  key={i}
                  className={`relative flex items-start ${isLast ? "pb-0" : "pb-12"}`}
                >
                  <article className="group relative w-full overflow-hidden border border-rule bg-bg-alt px-8 py-7 transition-[border-color,background] duration-[var(--transition-duration-fast)] hover:border-ink">
                    <div className="mb-[14px] inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
                      {phase.badge}
                    </div>

                    <h3
                      data-story-anchor
                      className="mb-3 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink"
                    >
                      {phase.title}
                    </h3>

                    <p
                      className="mb-5 text-[17px] leading-[1.55] tracking-[-0.005em] text-mute [text-wrap:pretty]"
                      dangerouslySetInnerHTML={{ __html: phase.desc }}
                    />
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
