"use client";

/**
 * Small set of SSR-safe matchMedia hooks. Kept as plain hooks (no
 * provider, no context) because every consumer just wants a boolean
 * synced to a single media query.
 */

import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * useMediaQuery — returns true when the given media query currently
 * matches. SSR-safe: starts as `false` (the conservative default for
 * "are we in a special mode?") and syncs on mount. Re-syncs whenever
 * the query string changes or the browser fires `change`.
 *
 * Example:
 *   const isMobile = useMediaQuery(`(max-width: 767px)`);
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/**
 * useReducedMotion — true when the user has requested reduced motion at
 * the OS level (`prefers-reduced-motion: reduce`). Components driving JS
 * animations (typewriter, rAF loops, scene cross-fades) should bail to
 * a static end-state when this is true.
 *
 * The site's globals.css also has a blanket reduced-motion override
 * that flattens CSS animations to 0.001ms, but JS-driven re-renders
 * need this hook to know when to skip the animation up-front.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * useDrawProgress — a self-contained 0→1 animation clock for the hero's
 * draw-in scenes (Tree, Stop). Returns the progress the scene should be
 * drawn at:
 *   - reduced motion → 1 (final state, no animation);
 *   - active → rAF-driven progress over `durationMs`, reset to 0 on each
 *     (re)activation so re-entering the scene replays the draw;
 *   - inactive → 0.
 */
export function useDrawProgress(active: boolean, durationMs: number): number {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!active || reduce) return;
    setT(0);
    let rafId = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const next = Math.min(1, elapsed / durationMs);
      setT(next);
      if (next < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, reduce, durationMs]);

  return reduce ? 1 : active ? t : 0;
}

/**
 * useScrollReveal — a fire-once, scroll-triggered typewriter clock. When
 * the returned `ref` element scrolls comfortably into view it starts a rAF
 * loop that ramps `fractional` from 0 → `length` at `cps` characters per
 * second (fractional so per-character fades stay smooth), then disconnects
 * so the reveal never repeats. Consumers read `fractional` to drive
 * per-character opacity.
 */
export function useScrollReveal<T extends Element>(length: number, cps: number) {
  const ref = useRef<T | null>(null);
  const [fractional, setFractional] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let started = false;
    let startTs = 0;

    const animate = (now: number) => {
      if (!startTs) startTs = now;
      const elapsedSec = (now - startTs) / 1000;
      const next = Math.min(length, elapsedSec * cps);
      setFractional(next);
      if (next < length) raf = requestAnimationFrame(animate);
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          raf = requestAnimationFrame(animate);
          obs.disconnect();
        }
      },
      // Fire when the element is comfortably inside the viewport (not when
      // just its bottom pixel pokes in).
      { rootMargin: "0px 0px -18% 0px", threshold: 0 },
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [length, cps]);

  return { ref, fractional };
}

/**
 * useInViewOnce — returns `false` until `ref` first scrolls into view, then
 * flips to `true` for good (the observer disconnects on first hit, so it
 * never toggles back). With `mountCheck`, an element already sitting in the
 * viewport on mount triggers immediately instead of waiting for a scroll —
 * needed for sections that can lazy-mount already on screen.
 */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  {
    rootMargin,
    threshold = 0,
    mountCheck = false,
  }: { rootMargin?: string; threshold?: number; mountCheck?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (mountCheck) {
      const r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 0) * 0.9 && r.bottom > 0) {
        setInView(true);
        return;
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, mountCheck]);

  return inView;
}
