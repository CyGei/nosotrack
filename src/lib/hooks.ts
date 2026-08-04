"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

// SSR-safe: starts false and syncs on mount.
export function useMediaQuery(query: string): boolean {
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

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

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
      // -18% so it fires once the element is properly in view, not at its first pixel.
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

// mountCheck covers sections that lazy-mount already on screen (no scroll event will follow).
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
