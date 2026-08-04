"use client";

import { ReactLenis } from "lenis/react";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        // Lenis must own #hash jumps, or its internal target goes stale and the next wheel notch lurches back.
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
