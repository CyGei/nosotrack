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

import { useDrawProgress } from "@/lib/hooks";
import { TreeStage, TreeStageDefs } from "./TreeStage";

/** How long the full tree takes to draw, ms. Tuned so the last edge
 *  lands just as the user is settling in. */
const DRAW_DURATION_MS = 2_500;

export type Scene3TreeProps = {
  /** Whether the tree scene is the active one. */
  active: boolean;
};

export function Scene3Tree({ active }: Scene3TreeProps) {
  // p ∈ [0, 1] — rAF-driven while active, 1 under reduced motion, 0 when
  // inactive (so re-entering the scene replays the draw).
  const p = useDrawProgress(active, DRAW_DURATION_MS);

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
