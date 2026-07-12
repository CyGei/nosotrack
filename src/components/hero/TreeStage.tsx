"use client";

/**
 * TreeStage — shared SVG renderer for the transmission tree and the
 * grey susceptible substrate. Used by:
 *   - Scene3Tree (Frame 2 "Reconstruct the chain") at animated progress 0→1
 *   - Scene4Stop (Frame 3 "Stop the spread") at progress=1, wrapped in a
 *     dim-everything <g opacity="0.45">.
 *
 * The `progress` prop (0..1) drives:
 *   - Each tree node's grey → red colour transition (it crosses at its
 *     own `appearAt` threshold, taking 0.06 of progress to finish).
 *   - Each tree edge's stroke-dashoffset draw-in (crosses at the edge's
 *     `appearAt`, takes 0.10 of progress to finish).
 *
 * Susceptibles are ALWAYS rendered at full opacity here — the dimming
 * for Frame 3 happens at the parent's wrapper, not inside the stage.
 *
 * Tree nodes are rendered as two stacked layers:
 *   1. A grey "ghost" circle, always at full opacity (the susceptible
 *      pre-state).
 *   2. A kind-specific colour overlay (red fill / halo / superspreader
 *      ring / undetected dashed outline), at `opacity = colorReveal`.
 *      For undetected, the overlay's body uses ink-bg so as it fades
 *      in it covers the grey ghost and leaves only the dashed red
 *      outline visible.
 */

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

/** Uniform radius for ALL grey dots in the pre-tree state — every node
 *  reads as one of a population. The kind-specific radius (P0 larger,
 *  superspreader larger) only takes effect once the colour overlay
 *  fades in, so the size growth is part of the "becoming red"
 *  transition. */
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
  /** When true, suppress P0/superspreader animated SMIL halos. Used by
   *  Scene4Stop so the dimmed final state is visually still — no
   *  pulsing inside the dim layer. */
  staticDecorations?: boolean;
};

export function TreeStage({ progress, staticDecorations = false }: TreeStageProps) {
  const p = clamp01(progress);

  return (
    <>
      {/* ─── Susceptible substrate — floating grey dots, uniform size
           and opacity (one population, before anything has happened). ─── */}
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

      {/* ─── Tree edges — draw in via stroke-dashoffset ─── */}
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

      {/* ─── Tree nodes — grey ghost + colour overlay ─── */}
      <g>
        {TREE_NODES.map((n) => {
          const r = baseRadius(n.kind);
          const colorReveal = clamp01((p - n.appearAt) / 0.06);
          const labelReveal = clamp01((colorReveal - 0.4) / 0.6);

          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              {/* 1. Grey ghost — uniform with every other susceptible.
                  Stays at GREY_RADIUS / GREY_OPACITY regardless of the
                  node's eventual kind, so the pre-tree state reads as
                  one homogenous population. The colour overlay below
                  uses the kind-specific radius once it fades in, so the
                  size growth is part of the "becoming red" moment. */}
              <circle r={GREY_RADIUS} fill={COLOR_GREY} opacity={GREY_OPACITY} />

              {/* 2. Kind-specific colour overlay — fades in over 0.06 of
                  progress starting at appearAt. */}
              <g opacity={colorReveal}>
                {/* Patient zero — slow breathing halo. */}
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

                {/* Superspreader — faster pulsing ring. */}
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

                {/* Core overlay circle. Undetected uses ink fill + dashed
                    red outline so the grey ghost disappears under it. */}
                <circle
                  r={r}
                  fill={n.kind === "undetected" ? COLOR_INK : "currentColor"}
                  stroke="currentColor"
                  strokeWidth={n.kind === "undetected" ? 1.5 : 1}
                  strokeDasharray={n.kind === "undetected" ? "3 2" : undefined}
                />
              </g>

              {/* Label — fades in once the node is mostly coloured. */}
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

/** Shared <defs> for the arrow markers. Render once at the SVG root. */
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
