"use client";

import { useEffect, useRef } from "react";

type Scene = "integration" | "endtoend";

export function FoundryFrame({ scene }: { scene: Scene }) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  // The demo's Stage listens for { source: 'nosotrack-host', cmd: 'play' | 'pause' }.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    // Integration may finish loading after the first intersection notification.
    // Resend its playback state on ready/load, and suspend for reduced motion.
    let visible = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncIntegration = () => {
      if (scene !== "integration") return;
      el.contentWindow?.postMessage({ source: "nosotrack-host", cmd:
        visible && !document.hidden && !motion.matches ? "play" : "pause",
      }, window.location.origin);
    };
    const onReady = (event: MessageEvent) => {
      if (event.source === el.contentWindow && event.data?.source === "nosotrack-demo" && event.data?.type === "ready") syncIntegration();
    };
    if (scene === "integration") {
      el.addEventListener("load", syncIntegration);
      window.addEventListener("message", onReady);
      document.addEventListener("visibilitychange", syncIntegration);
      motion.addEventListener("change", syncIntegration);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (scene === "integration") { syncIntegration(); return; }
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
    return () => {
      io.disconnect();
      el.removeEventListener("load", syncIntegration);
      window.removeEventListener("message", onReady);
      document.removeEventListener("visibilitychange", syncIntegration);
      motion.removeEventListener("change", syncIntegration);
    };
  }, [scene]);

  return (
    <div
      className="relative w-full overflow-hidden bg-white"
      style={{ aspectRatio: scene === "endtoend" ? "1120 / 560" : "1280 / 720" }}
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
