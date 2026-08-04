"use client";

import { useEffect, useRef } from "react";

type Scene = "integration" | "endtoend";

export function FoundryFrame({ scene }: { scene: Scene }) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  // The demo's Stage listens for { source: 'nosotrack-host', cmd: 'play' | 'pause' }.
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
        title={`Nosotrack — ${scene === "integration" ? "Integration" : "Outbreak forensics"}`}
        loading="lazy"
        // pointer-events-none so wheel gestures reach the Lenis page scroller
        // instead of dead-ending in the iframe document and stalling the scroll.
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
        allow="autoplay"
      />
    </div>
  );
}
