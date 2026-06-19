"use client";

/**
 * FoundryFrame — embeds the live foundry-demo (the same React app that
 * powers the legacy site) inside an iframe with `?embed=1`. The demo's
 * Stage auto-scales its 1280×720 canvas to fit the iframe, hides the
 * playback bar in embed mode and paints a transparent background so we
 * blend into the host card.
 *
 * The `scene` prop maps to a URL parameter the demo's main.jsx reads to
 * decide what to mount:
 *
 *   • integration  → only <FoundryStack mode="steady" />, looping
 *                    indefinitely with no build-up, no robot, no alert.
 *   • endtoend     → BrandIntro skipped; FoundryStack picks up at the
 *                    alert moment, click → dashboard expand → tree →
 *                    A3 popup → IPC Co-Pilot chat → strategy drawer →
 *                    deploy, then loops.
 *
 * If the demo source / bundle.js is rebuilt later, this component
 * doesn't need to change — it's a thin wrapper.
 */

import { useEffect, useRef } from "react";

type Scene = "integration" | "endtoend";

export function FoundryFrame({ scene }: { scene: Scene }) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  // Pause the demo via postMessage when off-screen so background tabs
  // / scrolled-past blocks don't burn cycles. The Stage in animations.jsx
  // listens for { source: 'nosotrack-host', cmd: 'play' | 'pause' }.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        try {
          el.contentWindow?.postMessage(
            {
              source: "nosotrack-host",
              cmd: entry.isIntersecting ? "play" : "pause",
            },
            "*",
          );
        } catch {
          /* iframe may not be loaded yet */
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-white"
      style={{ aspectRatio: "1280 / 720" }}
    >
      <iframe
        ref={frameRef}
        src={`/foundry-demo/index.html?embed=1&scene=${scene}`}
        title={`NosoTrack — ${scene === "integration" ? "Integration" : "Outbreak forensics"}`}
        loading="lazy"
        // The demo is a scripted, auto-playing animation — there's nothing to
        // click. Making the iframe pointer-transparent guarantees a wheel /
        // trackpad gesture over it always reaches the page scroller (Lenis)
        // instead of dead-ending in the iframe's document and stalling the
        // scroll. Complements Lenis's own `.lenis-smooth iframe` rule, and
        // also covers the first wheel tick before that class engages.
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
        // The demo is first-party; sandbox left open so postMessage works
        allow="autoplay"
      />
    </div>
  );
}
