"use client";

import { clamp01 } from "@/lib/utils";
import {
  TREE_NODES,
  TREE_EDGES,
  SUSCEPTIBLES,
  TREE_NODE_BY_ID,
  type TreeNode,
} from "./treeTopology";

const COLOR_GREY = "var(--color-inv)";
const COLOR_INK = "var(--color-bg-ink)";

const GREY_RADIUS = 7;
const GREY_OPACITY = 0.85;

function baseRadius(kind: TreeNode["kind"]) {
  if (kind === "p0") return 14;
  if (kind === "superspread") return 12;
  return 9;
}

export type TreeStageProps = {
  /** 0..1. Drives the tree-node colour reveal and the edge draw-in. */
  progress: number;
  /** Suppress the P0/superspreader animated SMIL halos. */
  staticDecorations?: boolean;
};

export function TreeStage({ progress, staticDecorations = false }: TreeStageProps) {
  const p = clamp01(progress);

  return (
    <>
      <g>
        {SUSCEPTIBLES.map((s) => (
          <circle
            key={s.id}
            cx={s.x}
            cy={s.y}
            r={GREY_RADIUS}
            fill={COLOR_GREY}
            opacity={GREY_OPACITY}
          />
        ))}
      </g>

      <g>
        {TREE_EDGES.map((e, i) => {
          const a = TREE_NODE_BY_ID[e.from];
          const b = TREE_NODE_BY_ID[e.to];
          if (!a || !b) return null;
          const reveal = clamp01((p - e.appearAt) / 0.1);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          return (
            <line
              key={`tree-edge-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="currentColor"
              strokeWidth={1.4}
              strokeOpacity={0.85}
              strokeDasharray={`${len}`}
              strokeDashoffset={len * (1 - reveal)}
              opacity={reveal}
              markerEnd={reveal > 0.9 ? "url(#heroTreeArrow)" : undefined}
            />
          );
        })}
      </g>

      <g>
        {TREE_NODES.map((n) => {
          const r = baseRadius(n.kind);
          const colorReveal = clamp01((p - n.appearAt) / 0.06);
          const labelReveal = clamp01((colorReveal - 0.4) / 0.6);

          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              <circle r={GREY_RADIUS} fill={COLOR_GREY} opacity={GREY_OPACITY} />

              <g opacity={colorReveal}>
                {n.kind === "p0" && (
                  <circle
                    r={r + 10}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    opacity={0.55}
                  >
                    {!staticDecorations && (
                      <>
                        <animate
                          attributeName="r"
                          values={`${r + 6};${r + 16};${r + 6}`}
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.6;0.0;0.6"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </>
                    )}
                  </circle>
                )}

                {n.kind === "superspread" && (
                  <circle
                    r={r + 6}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity={0.6}
                  >
                    {!staticDecorations && (
                      <>
                        <animate
                          attributeName="r"
                          values={`${r + 4};${r + 14};${r + 4}`}
                          dur="1.6s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.7;0;0.7"
                          dur="1.6s"
                          repeatCount="indefinite"
                        />
                      </>
                    )}
                  </circle>
                )}

                {/* Undetected fills with ink so the grey ghost is hidden
                    under it, leaving only the dashed outline. */}
                <circle
                  r={r}
                  fill={n.kind === "undetected" ? COLOR_INK : "currentColor"}
                  stroke="currentColor"
                  strokeWidth={n.kind === "undetected" ? 1.5 : 1}
                  strokeDasharray={n.kind === "undetected" ? "3 2" : undefined}
                />
              </g>

              <text
                x="0"
                y={r + 16}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="11"
                fill="currentColor"
                opacity={labelReveal}
                letterSpacing="0.06em"
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </g>
    </>
  );
}

/** Render once at the SVG root. */
export function TreeStageDefs() {
  return (
    <defs>
      <marker
        id="heroTreeArrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
      </marker>
    </defs>
  );
}
