"use client";

import { useDrawProgress } from "@/lib/hooks";
import { heroTreePath } from "./treePath";
import { TREE_STYLE } from "../story/treeDesign";
import { clamp01 } from "@/lib/utils";
import { TreeStage, TreeStageDefs } from "./TreeStage";
import { PROJECTIONS, SUSC_BY_ID, TREE_NODE_BY_ID } from "./treeTopology";

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
        className="absolute inset-0 h-full w-full text-[var(--color-inv)]"
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
              stroke="var(--color-alert)"
              strokeWidth="1.2"
            />
          </marker>
        </defs>

        {/* Connections are painted beneath the nodes and their target rings. */}
        <g>
          {PROJECTIONS.map((proj, i) => {
            const from = TREE_NODE_BY_ID[proj.fromNodeId];
            const to = SUSC_BY_ID[proj.toSuscId];
            if (!from || !to) return null;
            const reveal = clamp01(
              (p2 - proj.appearAt) / PROJECTION_REVEAL_SPAN,
            );
            if (reveal <= 0) return null;
            const d = heroTreePath(from.x, from.y, to.x, to.y, 10);
            return (
              <g key={`proj-${i}`}>
                <mask
                  id={`hero-projection-${i}`}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="1000"
                  height="600"
                >
                  <path
                    d={d}
                    fill="none"
                    stroke="white"
                    strokeWidth={8}
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - reveal}
                  />
                  {/* Keep dashes out of the source even while its fill is dimmed. */}
                  <circle
                    cx={from.x}
                    cy={from.y}
                    r={TREE_STYLE.radius + TREE_STYLE.outline}
                    fill="black"
                  />
                </mask>
                <path
                  d={d}
                  fill="none"
                  stroke="var(--color-alert)"
                  strokeWidth={TREE_STYLE.edge}
                  strokeOpacity={0.85}
                  strokeDasharray="4 3"
                  mask={`url(#hero-projection-${i})`}
                  markerEnd={reveal > 0.9 ? "url(#heroProjArrow)" : undefined}
                />
              </g>
            );
          })}

          <g opacity={DIM_OPACITY}>
            <TreeStage progress={1} staticDecorations />
          </g>

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
                  stroke="var(--color-alert)"
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
