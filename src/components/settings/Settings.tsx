import { AnimatedBlueprints } from "./AnimatedBlueprints";

export function Settings() {
  return (
    <section
      id="settings"
      data-story-chapter
      data-story-side="left"
      className="border-t border-rule bg-bg py-[var(--spacing-section)]"
      aria-labelledby="settings-title"
    >
      <div className="container-page">
        <h2
          id="settings-title"
          data-story-title
          className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]"
        >
          One platform, many settings.
        </h2>
        <div data-story-fork data-story-reverse>
          <div
            data-story-branch
            className="space-y-5 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink [text-wrap:pretty]"
          >
            <p>
              <strong className="font-bold">
                Nosotrack&apos;s vision is to become the operating system for
                infectious disease response.
              </strong>
            </p>
            <p>
              We aim to build an integrated outbreak intelligence platform that
              brings together transmission analytics, contact tracing, rapid
              diagnostics, sequencing and field epidemiology to support outbreak
              response across settings and scales.
            </p>
          </div>
          <div
            data-story-branch="quiet"
            className="[container-type:inline-size]"
          >
            <AnimatedBlueprints />
          </div>
        </div>
      </div>
    </section>
  );
}
