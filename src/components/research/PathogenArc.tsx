"use client";

/**
 * PathogenArc — the Research section's specimen display, composed to mirror
 * the "Impact & adoption" globe stage below it:
 *
 *   Disease X is the hero (large, static, like the globe) and the rest of the
 *   catalogue drifts along an arc off its RIGHT edge — a live "conveyor" that
 *   shows only ~3-4 specimens at once, fading each in at the top of the arc
 *   and out at the bottom, looping through every specimen. Echoes both the
 *   globe's arched metric labels and the old ticker's motion.
 *
 * Geometry mirrors ImpactAdoption's arched-metrics stage: items ride a circle
 * of radius ARC_RADIUS centred on the hero, sweeping the right side (angle
 * 0 = 3 o'clock, negative = up). Positions/opacities are driven imperatively
 * by a rAF loop (no per-frame React renders); the specimens themselves stay
 * mounted the whole time, so there is no WebGL context churn.
 *
 * A ResizeObserver scales the fixed-size stage down to fit narrow columns /
 * phones (same idea as the globe measuring its track).
 */

import { useEffect, useRef, useState } from "react";
import type { PathogenSpec } from "./pathogens/types";
import { PathogenViewer } from "./PathogenViewer";
import { PathogenDossier } from "./PathogenDossier";
import { specimenButtonClass } from "./specimenButton";

type Props = {
  hero: PathogenSpec;
  others: PathogenSpec[];
};

/* ── geometry / motion (px · degrees · seconds) — tune here ───────────── */
const HERO_SIZE = 332; // Disease X — matched to the globe below, static
const DOT_SIZE = 72; // arched specimens
const ARC_RADIUS = 215; // distance of each specimen from the hero centre
// Kept small so the band's vertical sweep stays WITHIN the hero's height
// (like the globe's metric labels), so the arc never sprawls past the X.
const VIS_ANGLE = 32; // visible band spans -VIS_ANGLE..+VIS_ANGLE on the right
const VISIBLE_FRAC = 0.23; // fraction of the loop on the band => ~3 shown (fewer
//                            so the bigger specimens keep breathing room)
const PERIOD_S = 22; // seconds for one specimen to travel the whole loop
const EDGE = 0.18; // fade-in / fade-out ramp (fraction of the visible sweep)

export function PathogenArc({ hero, others }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = [hero, ...others].find((p) => p.id === activeId) ?? null;

  const N = others.length;

  // Intrinsic (unscaled) stage dimensions.
  const cx = HERO_SIZE / 2;
  const sweep = ARC_RADIUS * Math.sin((VIS_ANGLE * Math.PI) / 180);
  const stageH = Math.max(HERO_SIZE, 2 * sweep + DOT_SIZE);
  const stageW = cx + ARC_RADIUS + DOT_SIZE / 2;
  const cy = stageH / 2;

  // Scale the fixed-size stage down to fit its container (never up).
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / stageW));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageW]);

  // Drive the arc conveyor imperatively.
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const items = itemRefs.current;
    const wrap = wrapRef.current;

    const placeAt = (el: HTMLDivElement, u: number, opacity: number) => {
      // u in [0,1] across the visible band, top -> bottom.
      const a = ((-VIS_ANGLE + 2 * VIS_ANGLE * u) * Math.PI) / 180;
      const left = cx + ARC_RADIUS * Math.cos(a);
      const top = cy + ARC_RADIUS * Math.sin(a);
      el.style.transform = `translate(${left}px, ${top}px) translate(-50%, -50%)`;
      el.style.opacity = String(opacity);
      el.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
    };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced || N === 0) {
      // Static fallback: a few specimens evenly spread across the band.
      const count = Math.max(1, Math.min(N, Math.round(N * VISIBLE_FRAC)));
      items.forEach((el, i) => {
        if (!el) return;
        if (i < count) placeAt(el, count === 1 ? 0.5 : i / (count - 1), 1);
        else el.style.opacity = "0";
      });
      return;
    }

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let paused = false;
    const speed = 1 / PERIOD_S; // loops per second

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!paused) elapsed += dt;
      const base = elapsed * speed;

      items.forEach((el, i) => {
        if (!el) return;
        let s = ((i / N + base) % 1 + 1) % 1; // phase in [0,1)
        if (s <= VISIBLE_FRAC) {
          const u = s / VISIBLE_FRAC; // 0..1 across the visible band
          const opacity = Math.max(0, Math.min(u / EDGE, (1 - u) / EDGE, 1));
          placeAt(el, u, opacity);
        } else {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        }
      });

      raf = requestAnimationFrame(tick);
    };

    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    wrap?.addEventListener("pointerenter", onEnter);
    wrap?.addEventListener("pointerleave", onLeave);
    wrap?.addEventListener("focusin", onEnter);
    wrap?.addEventListener("focusout", onLeave);

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      wrap?.removeEventListener("pointerenter", onEnter);
      wrap?.removeEventListener("pointerleave", onLeave);
      wrap?.removeEventListener("focusin", onEnter);
      wrap?.removeEventListener("focusout", onLeave);
    };
  }, [N, cx, cy]);

  return (
    <>
      <div
        ref={wrapRef}
        className="relative mx-auto w-full"
        style={{ height: stageH * scale }}
      >
        {/* Left-aligned so the X's left edge lines up with the globe's. */}
        <div
          className="absolute left-0 top-0"
          style={{
            width: stageW,
            height: stageH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Hero — Disease X, static, vertically centred on the arc. */}
          <div
            className="absolute left-0"
            style={{
              top: cy - HERO_SIZE / 2,
              width: HERO_SIZE,
              height: HERO_SIZE,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveId(hero.id)}
              aria-label={`Open dossier for ${hero.name}`}
              className={specimenButtonClass("h-full w-full")}
            >
              <PathogenViewer
                pathogen={hero}
                className="relative aspect-square w-full"
              />
            </button>
          </div>

          {/* Conveyor — the rest of the catalogue drifts along the arc. */}
          {others.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="group absolute left-0 top-0 will-change-transform"
              style={{ width: DOT_SIZE, opacity: 0 }}
            >
              <button
                type="button"
                onClick={() => setActiveId(p.id)}
                aria-label={`Open dossier for ${p.name}`}
                className={specimenButtonClass("w-full")}
              >
                <PathogenViewer
                  pathogen={p}
                  className="relative aspect-square w-full"
                />
              </button>
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                {p.shortLabel ?? p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {active && (
        <PathogenDossier pathogen={active} onClose={() => setActiveId(null)} />
      )}
    </>
  );
}
