"use client";

import { OutbreakCurve } from "./OutbreakCurve";
import { OUTBREAKS_2026 } from "./outbreaks2026";

const TITLE = "Infectious diseases are on the rise.";

export function OutbreakSection() {
  return (
    <article>
      <div className="container-page section-pad">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-12">
          <div className="min-w-0 md:col-span-4">
            <h2
              className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)] max-w-[16ch]"
            >
              {TITLE}
            </h2>
          </div>

          <div className="min-w-0 md:col-span-8">
            <p className="font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink max-w-[55ch]">
              Every outbreak is different. Effective control requires rapidly identifying the specific drivers of transmission: 
              who infected whom, who the superspreaders are, which cases are undetected or imported, where and how transmission occurred, 
              and who is most at risk.
            </p>

            <div className="mt-6">
              <OutbreakCurve outbreaks={OUTBREAKS_2026} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
