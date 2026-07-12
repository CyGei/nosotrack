"use client";

/**
 * useActiveScene — scroll-progress hook for the sticky-scroll hero.
 *
 * The hero-v2 narrative is a single section that the user scrolls
 * through. The OUTER wrapper is ~`SCENE_COUNT * 100vh` tall; the inner
 * stage is `position: sticky; top: 0; height: 100vh`. As the user
 * scrolls, the wrapper translates upward but the stage stays pinned —
 * which gives us a fixed canvas to swap scenes on. This applies on
 * mobile too — `100svh` already accounts for the address bar, and
 * sticky-scroll works the same with touch as with a mouse.
 *
 * What this hook returns:
 *   - `wrapperRef`   — attach to the outer (tall) wrapper element
 *   - `activeScene`  — current scene index (0..SCENE_COUNT - 1)
 *
 * The hook handles its own rAF throttle and ResizeObserver, and only
 * re-renders when the active scene index actually changes (a handful of
 * times across the whole hero), never on sub-scene scroll progress.
 */

import { useEffect, useRef, useState } from "react";

export function useActiveScene(sceneCount: number) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
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
        setActiveScene((prev) => (prev === 0 ? prev : 0));
        return;
      }
      // -rect.top is how many pixels we've scrolled INTO the wrapper.
      // Clamp to [0, totalScroll].
      const scrolled = Math.max(0, Math.min(totalScroll, -rect.top));
      const overallP = scrolled / totalScroll;
      // Slice overall progress into N equal scene buckets.
      const sceneFloat = overallP * sceneCount;
      const next = Math.min(sceneCount - 1, Math.floor(sceneFloat));
      // Only re-render on an actual scene change.
      setActiveScene((prev) => (prev === next ? prev : next));
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
  }, [sceneCount]);

  return { wrapperRef, activeScene };
}
