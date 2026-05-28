"use client";

/**
 * Scene "Stop" — Frame 3 of the hero. "Stop the spread."
 *
 * Open state: a frozen copy of Frame 2's final composition, wrapped at
 * opacity 0.45 so the entire reconstructed tree + grey substrate dims
 * uniformly. Then a NEW projection layer animates in on top:
 *   - Dashed red arrows fan out from the "latest infected" leaves
 *     (C3 / C4 / C5) toward target susceptibles.
 *   - The target susceptibles re-render at full opacity with a dashed
 *     red ring, overlaying the dimmed version underneath.
 *
 * Visual rule (locked with Cy 2026-05-27):
 *   - Everything carried over from Frame 2 dims together (~0.45). No
 *     splitting historical elements across multiple opacity tiers.
 *   - No dashed line ever connects to a dimmed grey. Dashed reds are
 *     exclusive to the lit projection layer — they originate at a
 *     dimmed leaf and terminate at a vivid target.
 *
 * Animation is driven by an internal `t2` ∈ [0, 1] over DRAW_DURATION_MS.
 * Resets on scene re-entry. Reduced-motion users skip straight to the
 * final state.
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { TreeStage, TreeStageDefs } from "./TreeStage";
import {
  PROJECTIONS,
  SUSC_BY_ID,
  TREE_NODE_BY_ID,
} from "./treeTopology";

/** How long the full projection layer takes to animate in, ms. The 5
 *  projections are staggered every 0.08 of progress (= 80 ms here), so
 *  the sequence resolves in about half this duration and leaves the
 *  rest for the final composition to breathe. */
const DRAW_DURATION_MS = 1_000;

/** How much of progress an individual projection takes to draw. */
const PROJECTION_REVEAL_SPAN = 0.15;

/** Dim opacity for the carried-over Frame 2 composition. */
const DIM_OPACITY = 0.45;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export type Scene4StopProps = {
  /** Whether the stop scene is the active one. */
  active: boolean;
  /** If true, render the final state immediately (mobile / reduced-motion). */
  forceImmediate?: boolean;
};

export function Scene4Stop({ active, forceImmediate = false }: Scene4StopProps) {
  const reduce = useReducedMotion();
  const [t2, setT2] = useState(0);

  useEffect(() => {
    if (!active || forceImmediate || reduce) return;
    setT2(0);
    let rafId = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const next = Math.min(1, elapsed / DRAW_DURATION_MS);
      setT2(next);
      if (next < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, forceImmediate, reduce]);

  const p2 = forceImmediate || reduce ? 1 : active ? t2 : 0;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--color-bg-ink)]">
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full text-alert"
        aria-hidden
      >
        <TreeStageDefs />

        {/* Defs scoped to the projection layer — open-style arrow marker
            (matches the foundry-demo's risk-edge style). */}
        <defs>
          <marker
            id="heroProjArrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path
              d="M 0 0 L 10 5 L 0 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </marker>
        </defs>

        {/* ─── Dimmed Frame-2 carryover ───
            Everything from Frame 2 sits inside this single opacity wrap.
            staticDecorations=true freezes the P0 halo and superspreader
            ring so the dimmed layer reads as past-state, not live. */}
        <g opacity={DIM_OPACITY}>
          <TreeStage progress={1} staticDecorations />
        </g>

        {/* ─── Lit projection layer ───
            Drawn AFTER the dimmed layer so it sits on top. Order within
            the layer: arrows first (so they slide under the target
            rings), then target rings. */}
        <g>
          {/* Dashed red projection arrows. */}
          {PROJECTIONS.map((proj, i) => {
            const from = TREE_NODE_BY_ID[proj.fromNodeId];
            const to = SUSC_BY_ID[proj.toSuscId];
            if (!from || !to) return null;
            const reveal = clamp01((p2 - proj.appearAt) / PROJECTION_REVEAL_SPAN);
            if (reveal <= 0) return null;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            return (
              <line
                key={`proj-${i}`}
                x1={from.x}
                y1={from.y}
                x2={from.x + dx * reveal}
                y2={from.y + dy * reveal}
                stroke="currentColor"
                strokeWidth={1.3}
                strokeOpacity={0.95}
                strokeDasharray="4 3"
                // Reverse the dashed-line "growth" feel using a synced
                // dashoffset so the gap doesn't reshuffle as we extend.
                strokeDashoffset={(1 - reveal) * len}
                markerEnd={
                  reveal > 0.6 ? "url(#heroProjArrow)" : undefined
                }
              />
            );
          })}

          {/* Lit targets — grey body + dashed red ring. Same incoming
              projection drives the ring's reveal so the ring "lands" as
              the arrow tip arrives. Sits on top of the dimmed target
              underneath. */}
          {PROJECTIONS.map((proj) => {
            const to = SUSC_BY_ID[proj.toSuscId];
            if (!to) return null;
            const ringReveal = clamp01(
              (p2 - (proj.appearAt + PROJECTION_REVEAL_SPAN * 0.7)) /
                (PROJECTION_REVEAL_SPAN * 0.6),
            );
            if (ringReveal <= 0) return null;
            return (
              <g
                key={`tgt-${to.id}`}
                transform={`translate(${to.x}, ${to.y})`}
                opacity={ringReveal}
              >
                <circle
                  r={13}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                  opacity={0.95}
                />
                <circle r={7} fill="var(--color-inv)" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
