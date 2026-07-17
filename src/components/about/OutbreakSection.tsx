"use client";

/**
 * OutbreakSection — the opening act (0.1) of the About story: the broad
 * market. Every health emergency is a forensics problem — who infected whom,
 * who's a superspreader, what's undetected or imported, who's at risk. A
 * cumulative 2025→2026 curve (right column) shows how outbreaks are becoming
 * more frequent; the nosocomial block (0.2) then narrows to the hospital wedge
 * Nosotrack starts from.
 *
 * Laid out on the same two-column AIP grid as 0.2 / 0.3 (title left, subtitle +
 * curve right) so the section reads as one system. The title uses the same
 * scroll-triggered typewriter reveal as the AboutBlock titles — kept inline here
 * so 0.1 changes never touch AboutBlock.
 */

import { useScrollReveal } from "@/lib/hooks";
import { StepIndicator } from "./AboutBlock";
import { OutbreakCurve } from "./OutbreakCurve";
import { OUTBREAKS_2026 } from "./outbreaks2026";

const TITLE = "Infectious diseases are on the rise.";

export function OutbreakSection() {
  // Trigger-on-entry typewriter — mirrors the AboutBlock titles (32 cps) so 0.1
  // reveals in lockstep with 0.2–0.4. `fractional` is a smooth char clock; each
  // char fades in over a 1-char window, and an invisible tail reserves the final
  // height so there's no layout shift as text appears.
  const { ref: titleRef, fractional } = useScrollReveal<HTMLHeadingElement>(
    TITLE.length,
    32,
  );
  const headIndex = Math.min(TITLE.length, Math.ceil(fractional));
  const visibleChars = TITLE.slice(0, headIndex);
  const hiddenChars = TITLE.slice(headIndex);
  const isStarted = fractional > 0;
  const isDone = fractional >= TITLE.length;

  return (
    <article>
      <div className="container-page section-pad">
        <StepIndicator activeId="0.1" />

        <div className="mt-14 grid grid-cols-12 gap-x-8 gap-y-10">
          {/* LEFT — title */}
          <div className="col-span-12 md:col-span-4">
            <h2
              ref={titleRef}
              className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)] max-w-[16ch]"
            >
              {visibleChars.split("").map((c, i) => {
                const alpha = Math.max(0, Math.min(1, fractional - i));
                return (
                  <span key={i} style={{ opacity: alpha }}>
                    {c}
                  </span>
                );
              })}
              {isStarted && !isDone && (
                <span className="typewriter-cursor" aria-hidden />
              )}
              {hiddenChars && (
                <span style={{ visibility: "hidden" }}>{hiddenChars}</span>
              )}
            </h2>
          </div>

          {/* RIGHT — subtitle + the live timeline */}
          <div className="col-span-12 md:col-span-8">
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
