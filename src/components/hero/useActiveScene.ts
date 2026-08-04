"use client";

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
      const totalScroll = rect.height - window.innerHeight;
      if (totalScroll <= 0) {
        setActiveScene((prev) => (prev === 0 ? prev : 0));
        return;
      }
      // -rect.top is how far we've scrolled into the wrapper.
      const scrolled = Math.max(0, Math.min(totalScroll, -rect.top));
      const overallP = scrolled / totalScroll;
      const sceneFloat = overallP * sceneCount;
      const next = Math.min(sceneCount - 1, Math.floor(sceneFloat));
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
