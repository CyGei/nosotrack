"use client";

/**
 * useActiveScene — scroll-progress hook for the sticky-scroll hero.
 *
 * The hero-v2 narrative is a single section that the user scrolls
 * through. The OUTER wrapper is ~`SCENE_COUNT * 100vh` tall; the inner
 * stage is `position: sticky; top: 0; height: 100vh`. As the user
 * scrolls, the wrapper translates upward but the stage stays pinned —
 * which gives us a fixed canvas to swap scenes on.
 *
 * What this hook returns:
 *   - `wrapperRef`   — attach to the outer (tall) wrapper element
 *   - `activeScene`  — current scene index (0..SCENE_COUNT - 1)
 *   - `progress`     — 0..1 progress THROUGH the active scene; resets
 *                      at each scene boundary. Useful for scroll-driven
 *                      effects within a scene (e.g. tree-draw).
 *   - `isMobile`     — true if viewport is below the breakpoint.
 *                      Mobile bypasses the sticky behaviour and renders
 *                      scenes stacked, so consumers should respect this.
 *
 * The hook handles its own rAF throttle and ResizeObserver so consumers
 * can read these values every frame without performance worry.
 */

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/hooks";

export const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

type ScrollState = {
  activeScene: number;
  progress: number;
};

export function useActiveScene(sceneCount: number) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<ScrollState>({
    activeScene: 0,
    progress: 0,
  });
  // Mobile breakpoint detection — useMediaQuery handles the matchMedia
  // listener; this stays separate from the scroll effect so we don't
  // re-attach the scroll listener on every resize.
  const isMobile = useMediaQuery(MOBILE_QUERY);

  useEffect(() => {
    if (isMobile) {
      // On mobile we don't compute scroll-driven activeScene; consumers
      // render scenes stacked. Reset to scene 0 so anything that DOES
      // peek at activeScene gets a sane default.
      setState({ activeScene: 0, progress: 0 });
      return;
    }

    const el = wrapperRef.current;
    if (!el) return;

    let rafId = 0;
    let scheduled = false;

    const compute = () => {
      scheduled = false;
      const rect = el.getBoundingClientRect();
      // Total scroll distance through the wrapper = its height minus
      // the viewport (the sticky stage hits its top edge after this).
      const totalScroll = rect.height - window.innerHeight;
      if (totalScroll <= 0) {
        setState({ activeScene: 0, progress: 0 });
        return;
      }
      // -rect.top is how many pixels we've scrolled INTO the wrapper.
      // Clamp to [0, totalScroll].
      const scrolled = Math.max(0, Math.min(totalScroll, -rect.top));
      const overallP = scrolled / totalScroll;
      // Slice overall progress into N equal scene buckets.
      const sceneFloat = overallP * sceneCount;
      const activeScene = Math.min(sceneCount - 1, Math.floor(sceneFloat));
      const progress = Math.min(1, Math.max(0, sceneFloat - activeScene));
      setState((prev) => {
        // Avoid re-render thrash when nothing meaningful changed.
        if (
          prev.activeScene === activeScene &&
          Math.abs(prev.progress - progress) < 0.005
        ) {
          return prev;
        }
        return { activeScene, progress };
      });
    };

    const onScrollOrResize = () => {
      if (scheduled) return;
      scheduled = true;
      rafId = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      cancelAnimationFrame(rafId);
    };
  }, [sceneCount, isMobile]);

  return { wrapperRef, activeScene: state.activeScene, progress: state.progress, isMobile };
}
