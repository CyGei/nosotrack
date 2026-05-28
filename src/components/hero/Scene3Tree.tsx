"use client";

/**
 * Scene "Tree" — Frame 2 of the hero. "Reconstruct the chain of
 * transmission." Open state: floating grey susceptible nodes (tree
 * positions + ambient substrate). Some go red top-down while edges
 * draw in.
 *
 * Animation is driven by an internal `t` ∈ [0, 1] over DRAW_DURATION_MS
 * once `active` flips true. Scroll position does NOT control the draw
 * (changed from earlier scroll-progress drive per design feedback) —
 * the user lands on the scene, the tree paints itself in one continuous
 * motion, and they scroll past at their own pace.
 *
 * If `active` goes false → true again, `t` resets to 0 so re-entering
 * the scene re-runs the animation. Reduced-motion users skip the
 * animation and see the final state immediately.
 *
 * Visual language is delegated to <TreeStage>; see treeTopology.ts for
 * the node + edge data.
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { TreeStage, TreeStageDefs } from "./TreeStage";

/** How long the full tree takes to draw, ms. Tuned so the last edge
 *  lands just as the user is settling in. */
const DRAW_DURATION_MS = 2_500;

export type Scene3TreeProps = {
  /** Whether the tree scene is the active one. */
  active: boolean;
  /** If true, draw the final state immediately (mobile / reduced-motion). */
  forceImmediate?: boolean;
};

export function Scene3Tree({ active, forceImmediate = false }: Scene3TreeProps) {
  const reduce = useReducedMotion();
  // Internal time-based progress 0..1. Driven by rAF when scene is active.
  const [t, setT] = useState(0);

  // Drive `t` from 0 → 1 when the scene becomes active. We cancel and
  // reset on deactivation so re-entry replays the animation cleanly.
  useEffect(() => {
    if (!active || forceImmediate || reduce) return;
    setT(0);
    let rafId = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const next = Math.min(1, elapsed / DRAW_DURATION_MS);
      setT(next);
      if (next < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, forceImmediate, reduce]);

  // p ∈ [0, 1] — what progress level should the tree be drawn at?
  //   - When inactive: 0 (next entry will replay).
  //   - When active: rAF-driven internal `t`.
  //   - When forced/reduced: full 1.
  const p = forceImmediate || reduce ? 1 : active ? t : 0;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--color-bg-ink)]">
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full text-alert"
        aria-hidden
      >
        <TreeStageDefs />
        <TreeStage progress={p} />
      </svg>
    </div>
  );
}
