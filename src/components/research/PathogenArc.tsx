"use client";

import { useEffect, useRef, useState } from "react";
import type { PathogenSpec } from "./pathogens/types";
import { PathogenViewer } from "./PathogenViewer";
import { PathogenDossier } from "./PathogenDossier";
import { specimenButtonClass } from "./specimenButton";

type Props = {
  hero: PathogenSpec;
  others: PathogenSpec[];
};

const HERO_SIZE = 332;
const DOT_SIZE = 72;
const ARC_RADIUS = 215;
// Visible band spans -VIS_ANGLE..+VIS_ANGLE (degrees) on the right of the hero.
const VIS_ANGLE = 32;
const VISIBLE_FRAC = 0.23; // fraction of the loop on the band => ~3 shown at once
const PERIOD_S = 22;
const EDGE = 0.18; // fade in/out ramp, as a fraction of the visible sweep

export function PathogenArc({ hero, others }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = [hero, ...others].find((p) => p.id === activeId) ?? null;

  const N = others.length;

  const cx = HERO_SIZE / 2;
  const sweep = ARC_RADIUS * Math.sin((VIS_ANGLE * Math.PI) / 180);
  const stageH = Math.max(HERO_SIZE, 2 * sweep + DOT_SIZE);
  const stageW = cx + ARC_RADIUS + DOT_SIZE / 2;
  const cy = stageH / 2;

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

  // Positions are driven imperatively so the mounted viewers never re-render.
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const items = itemRefs.current;
    const wrap = wrapRef.current;

    // u in [0,1] across the visible band, top -> bottom.
    const placeAt = (el: HTMLDivElement, u: number, opacity: number) => {
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
    const speed = 1 / PERIOD_S;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!paused) elapsed += dt;
      const base = elapsed * speed;

      items.forEach((el, i) => {
        if (!el) return;
        let s = ((i / N + base) % 1 + 1) % 1;
        if (s <= VISIBLE_FRAC) {
          const u = s / VISIBLE_FRAC;
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
        <div
          className="absolute left-0 top-0"
          style={{
            width: stageW,
            height: stageH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
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
