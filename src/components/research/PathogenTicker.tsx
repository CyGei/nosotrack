"use client";

/**
 * PathogenTicker — horizontal auto-drifting strip of every PathogenSpec.
 *
 * Behaviour:
 *   - Auto-drifts right-to-left at ~30 px/sec.
 *   - Ping-pongs at the edges (no visible jump, no duplicated WebGL contexts).
 *   - Pauses on pointer hover / keyboard focus so a click can land cleanly.
 *   - Wheel / trackpad horizontal scroll moves through the strip faster
 *     (native scroll); auto-drift resumes ~1.5s after the last wheel event.
 *   - Click a specimen → opens <PathogenDossier> (same flow as PathogenGrid).
 *   - prefers-reduced-motion disables the auto-drift entirely.
 *
 * Implementation note: drift is driven by a rAF loop that mutates
 * `scrollLeft` directly, so the user's native wheel scroll cooperates
 * with the drift instead of fighting a CSS animation.
 */

import { useEffect, useRef, useState } from "react";
import type { PathogenSpec } from "./pathogens/types";
import { PathogenViewer } from "./PathogenViewer";
import { PathogenDossier } from "./PathogenDossier";

type Props = {
  pathogens: PathogenSpec[];
};

/** Drift speed in CSS pixels per second. Calm, readable pace. */
const DRIFT_PX_PER_SEC = 28;
/** Resume auto-drift this long after the user's last wheel event. */
const WHEEL_RESUME_MS = 1500;

export function PathogenTicker({ pathogens }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pathogens.find((p) => p.id === activeId) ?? null;

  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let raf = 0;
    let lastT = performance.now();
    let direction: 1 | -1 = 1; // 1 = drift content leftward (scrollLeft↑)
    let paused = false;
    let wheelLockUntil = 0;

    // Fractional accumulator — `Element.scrollLeft` is read back as an
    // integer in most browsers, so directly doing `scrollLeft += 0.47`
    // every frame rounds to 0 each time and the strip never moves.
    // We keep the true sub-pixel position here and only assign the
    // rounded value to `scrollLeft`.
    let offset = el.scrollLeft;

    // Resync the accumulator whenever the user (or wheel scroll) jumps
    // the strip themselves, so we don't fight their input.
    const onScroll = () => {
      // If the rendered scrollLeft drifts noticeably from our accumulator
      // (user dragged / wheeled), snap the accumulator to the real value.
      if (Math.abs(el.scrollLeft - offset) > 1) offset = el.scrollLeft;
    };

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };
    const onWheel = (e: WheelEvent) => {
      // Only treat as a "user is scrolling the strip" gesture when the
      // wheel has a meaningful horizontal component. Vertical page-scroll
      // wheels passing over the strip used to lock the drift for 1.5s
      // each tick, effectively freezing it whenever the cursor was nearby.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        wheelLockUntil = performance.now() + WHEEL_RESUME_MS;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastT) / 1000, 0.1);
      lastT = now;

      const driving = !paused && now >= wheelLockUntil;
      if (driving) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          offset += direction * DRIFT_PX_PER_SEC * dt;
          if (offset >= max) {
            offset = max;
            direction = -1;
          } else if (offset <= 0) {
            offset = 0;
            direction = 1;
          }
          el.scrollLeft = Math.round(offset);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", onEnter);
    el.addEventListener("focusout", onLeave);
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onEnter);
      el.removeEventListener("focusout", onLeave);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={scrollerRef}
        className={[
          "no-scrollbar overflow-x-auto overflow-y-hidden",
          // Hint that there's more to the right by letting the last item
          // sit close to the edge — no fade, no arrows, no ornament.
        ].join(" ")}
        aria-label="Pathogen catalogue"
        role="region"
      >
        <ul className="flex list-none gap-8 p-0">
          {pathogens.map((p) => (
            <li key={p.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveId(p.id)}
                aria-label={`Open dossier for ${p.name}`}
                className={[
                  "group relative block w-[200px] cursor-pointer",
                  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-alert)]",
                  "border border-transparent transition-colors duration-200",
                  "hover:border-[var(--color-alert)]/40",
                  "focus-visible:border-[var(--color-alert)]/60",
                ].join(" ")}
              >
                <PathogenViewer
                  pathogen={p}
                  className="relative aspect-square w-full"
                />
              </button>
              <a
                href={p.source.nih3dEntryUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={[
                  "mt-3 block text-center font-mono text-[11px] uppercase",
                  "tracking-[0.22em] text-faint",
                  "underline-offset-4 hover:text-text hover:underline",
                ].join(" ")}
              >
                {p.shortLabel ?? p.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {active && (
        <PathogenDossier
          pathogen={active}
          onClose={() => setActiveId(null)}
        />
      )}
    </>
  );
}
