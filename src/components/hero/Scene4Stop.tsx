"use client";

import { useDrawProgress } from "@/lib/hooks";
import { clamp01 } from "@/lib/utils";
import { TreeStage, TreeStageDefs } from "./TreeStage";
import {
  PROJECTIONS,
  SUSC_BY_ID,
  TREE_NODE_BY_ID,
} from "./treeTopology";

const DRAW_DURATION_MS = 1_000;

const PROJECTION_REVEAL_SPAN = 0.15;

const DIM_OPACITY = 0.45;

export type Scene4StopProps = {
  active: boolean;
};

export function Scene4Stop({ active }: Scene4StopProps) {
  const p2 = useDrawProgress(active, DRAW_DURATION_MS);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--color-bg-ink)]">
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full text-alert"
        aria-hidden
      >
        <TreeStageDefs />

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

        <g opacity={DIM_OPACITY}>
          <TreeStage progress={1} staticDecorations />
        </g>

        {/* Drawn after the dimmed layer so it sits on top; arrows before
            rings so they slide under them. */}
        <g>
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
                // Synced dashoffset keeps the gaps from reshuffling as the
                // line extends.
                strokeDashoffset={(1 - reveal) * len}
                markerEnd={
                  reveal > 0.6 ? "url(#heroProjArrow)" : undefined
                }
              />
            );
          })}

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
