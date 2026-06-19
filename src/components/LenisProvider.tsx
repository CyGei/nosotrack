"use client";

/**
 * LenisProvider — global smooth-scroll, mounted once at the root.
 *
 * Why we need it:
 *   The hero's sticky-scroll cinematic is driven by `scrollY` sampled
 *   each rAF (see `useActiveScene`). With native scroll, fast inputs
 *   (a trackpad flick, a single mouse-wheel notch) deliver large
 *   discrete `scrollY` jumps — which jump the hero past intermediate
 *   scenes and produce the "skipped frames" feel. Lenis interpolates
 *   scroll position frame-by-frame, turning discrete jumps into a
 *   continuous ramp so the hero advances at a stable pace regardless
 *   of input speed.
 *
 * Why `<ReactLenis root>` (not a hand-rolled provider):
 *   The official React adapter wires Lenis up correctly AND exposes the
 *   instance through a React context (`useLenis()`). Hero.tsx needs that
 *   instance to sync Lenis's internal scroll target when the completion-
 *   lock shrinks the wrapper — without that sync, Lenis's target falls
 *   out of step with the actual scroll position and the next wheel
 *   delta rockets the page hundreds of pixels in one frame.
 *
 * Tuning:
 *   - `lerp: 0.12` — premium-calm smoothness without crossing into the
 *     over-smoothed Awwwards register where the page lags noticeably
 *     behind the wheel.
 *   - `smoothWheel: true` — the whole point on desktop.
 *   - `syncTouch: false` — keep iOS Safari's native momentum. Hijacking
 *     touch typically feels worse than native, not better.
 *   - `anchors: true` — route same-page `#section` link clicks (the nav
 *     links, the hero "scroll to explore" cue) through Lenis itself.
 *     Without this they fall back to the browser's native
 *     `scroll-behavior: smooth`, which moves `scrollY` but leaves Lenis's
 *     internal target stale — so the FIRST wheel notch after a nav click
 *     lurches the page back toward the pre-click position. Lenis only
 *     intercepts same-host/same-path hash links, so the external
 *     "Platform" link and the /privacy, /terms routes are unaffected.
 */

import { ReactLenis } from "lenis/react";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
