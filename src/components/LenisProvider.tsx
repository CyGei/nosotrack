"use client";

import { useReducedMotion } from "@/lib/hooks";
import { ReactLenis } from "lenis/react";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        smoothWheel: !reduce,
        syncTouch: false,
        // Lenis must own #hash jumps, or its internal target goes stale and the next wheel notch lurches back.
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
