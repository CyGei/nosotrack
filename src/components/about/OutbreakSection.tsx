"use client";

import { OutbreakCurve } from "./OutbreakCurve";
import { OUTBREAKS_2026 } from "./outbreaks2026";

const TITLE = "Infectious diseases are on the rise.";

export function OutbreakSection() {
  return (
    <article data-story-chapter data-story-side="right">
      <div className="container-page section-pad">
        <h2
          data-story-title
          className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]"
        >
          {TITLE}
        </h2>
        <div data-story-fork>
          <div data-story-branch>
            <p className="font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink max-w-[55ch]">
              <strong style={{ fontWeight: 500 }}>
                Every outbreak is different.
              </strong>{" "}
              Effective control requires rapidly identifying the specific
              drivers of transmission: who infected whom, who the superspreaders
              are, which cases are undetected or imported, where and how
              transmission occurred, and who is most at risk.
            </p>
          </div>
          <div data-story-branch data-story-chart>
            <OutbreakCurve outbreaks={OUTBREAKS_2026} />
          </div>
        </div>
      </div>
    </article>
  );
}
