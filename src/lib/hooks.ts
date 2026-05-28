"use client";

/**
 * Small set of SSR-safe matchMedia hooks. Kept as plain hooks (no
 * provider, no context) because every consumer just wants a boolean
 * synced to a single media query.
 */

import { useEffect, useState } from "react";

/**
 * useMediaQuery — returns true when the given media query currently
 * matches. SSR-safe: starts as `false` (the conservative default for
 * "are we in a special mode?") and syncs on mount. Re-syncs whenever
 * the query string changes or the browser fires `change`.
 *
 * Example:
 *   const isMobile = useMediaQuery(`(max-width: 767px)`);
 */
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
