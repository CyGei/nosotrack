/**
 * Tree topology shared between Hero Frame 2 (Scene3Tree —
 * "Reconstruct the chain of transmission") and Frame 3 (Scene4Stop —
 * "Stop the spread.").
 *
 * Geometry rules (1000 × 600 viewBox, xMidYMid meet):
 *   - P0 anchored at the top centre.
 *   - Gen-1 (C1, C2) splayed left/right.
 *   - Gen-2 leaves (U1, C3, C4, C5) on the same Y so the bottom of the
 *     tree reads as a row of "latest infected."
 *   - SUSCEPTIBLES live BELOW the tree leaves (Y > 400) so the Frame 3
 *     projection arrows fan downward.
 *
 * Animation timeline rule:
 *   - `appearAt` on tree nodes / edges is the progress threshold (0..1)
 *     at which that element transitions from grey → red (nodes) or
 *     begins drawing in (edges). Top-down ordering: P0 first, then
 *     gen-1, then gen-2.
 *   - SUSCEPTIBLES are always present from t=0 — they're the "floating
 *     grey substrate" the user spec calls out.
 *   - PROJECTIONS only animate in Scene4Stop. Their `appearAt` is on a
 *     SEPARATE progress clock from the tree (Scene4 runs its own rAF).
 */

export type TreeNodeKind = "p0" | "confirmed" | "superspread" | "undetected";

export type TreeNode = {
  id: string;
  x: number;
  y: number;
  kind: TreeNodeKind;
  /** Progress (0..1) at which the node transitions grey → its red kind. */
  appearAt: number;
};

export type SusceptibleKind = "ambient" | "target";

export type Susceptible = {
  id: string;
  x: number;
  y: number;
  kind: SusceptibleKind;
};

export type TreeEdge = {
  from: string;
  to: string;
  /** Progress (0..1) at which the edge begins drawing in. */
  appearAt: number;
};

export type Projection = {
  /** Tree node id (must be a "latest infected" leaf). */
  fromNodeId: string;
  /** Susceptible id (must be kind: 'target'). */
  toSuscId: string;
  /** Progress on Scene4's clock at which this projection begins drawing. */
  appearAt: number;
};

// ─────────────────────────────────────────────────────────────────────
// Tree nodes — all start grey, transition to red kind at appearAt.
//
// Two-phase choreography (locked with Cy 2026-05-27):
//   Phase 1 (0.00 → 0.40): every node turns red top-down. Patient
//     zero first, then gen-1, then gen-2. NO edges drawn yet.
//   Phase 2 (0.45 → 0.90): edges weave the now-red nodes together,
//     top-down (see TREE_EDGES below).
//
// The narrative: cases are identified FIRST, then the transmission
// links between them are inferred — matches the Bayesian outbreak-
// reconstruction story (cases known → chain inferred).
// ─────────────────────────────────────────────────────────────────────
export const TREE_NODES: TreeNode[] = [
  // Patient zero — top centre.
  { id: "P0", x: 500, y: 90,  kind: "p0",          appearAt: 0.00 },

  // Gen 1 — second wave.
  { id: "C1", x: 320, y: 230, kind: "confirmed",   appearAt: 0.12 },
  { id: "C2", x: 680, y: 230, kind: "superspread", appearAt: 0.16 },

  // Gen 2 — the "latest infected" row, third wave.
  { id: "U1", x: 220, y: 380, kind: "undetected",  appearAt: 0.28 },
  { id: "C3", x: 400, y: 380, kind: "confirmed",   appearAt: 0.31 },
  { id: "C4", x: 600, y: 380, kind: "confirmed",   appearAt: 0.34 },
  { id: "C5", x: 780, y: 380, kind: "confirmed",   appearAt: 0.37 },
];

// ─────────────────────────────────────────────────────────────────────
// Tree edges — solid red, drawn ONLY after all nodes have turned red
// (Phase 2: 0.45 → 0.90). Top-down order so the chain reads naturally.
// ─────────────────────────────────────────────────────────────────────
export const TREE_EDGES: TreeEdge[] = [
  // P0 → gen 1
  { from: "P0", to: "C1", appearAt: 0.46 },
  { from: "P0", to: "C2", appearAt: 0.52 },

  // C1 → gen 2
  { from: "C1", to: "U1", appearAt: 0.60 },
  { from: "C1", to: "C3", appearAt: 0.66 },

  // C2 (superspreader) → gen 2
  { from: "C2", to: "C4", appearAt: 0.74 },
  { from: "C2", to: "C5", appearAt: 0.80 },
];

// ─────────────────────────────────────────────────────────────────────
// Susceptible substrate — floating grey nodes around the tree. Present
// from t=0 in Frame 2. In Frame 3, ambients dim with the tree; targets
// stay vivid and receive a dashed red incoming arrow.
//
// Targets are placed near the leaves (C3/C4/C5) so the projection
// arrows fan naturally downward. Ambients sit on the canvas edges as
// population context — they have NO links in either frame.
// ─────────────────────────────────────────────────────────────────────
export const SUSCEPTIBLES: Susceptible[] = [
  // Ambient population — laid out as four loose "rows of patients" that
  // mirror the tree's generational structure. The tree nodes sit AMONG
  // these ambients so the pre-tree state reads as a corridor of
  // patients, not a tree skeleton. Slight Y-jitter keeps it from
  // looking like a strict grid.

  // Row 1 — around P0 (tree Y=90).
  { id: "A1", x: 435, y: 110, kind: "ambient" },
  { id: "A2", x: 580, y:  75, kind: "ambient" },

  // Row 2 — around C1 / C2 (tree Y=230).
  { id: "A3", x: 240, y: 250, kind: "ambient" },
  { id: "A4", x: 395, y: 265, kind: "ambient" },
  { id: "A5", x: 605, y: 265, kind: "ambient" },
  { id: "A6", x: 765, y: 205, kind: "ambient" },

  // Row 3 — leaf row (tree Y=380), ambients interspersed between
  // U1 / C3 / C4 / C5 with Y-jitter so the row breathes.
  { id: "A7", x: 305, y: 410, kind: "ambient" },
  { id: "A8", x: 510, y: 365, kind: "ambient" },
  { id: "A9", x: 695, y: 405, kind: "ambient" },
  { id: "A10", x: 865, y: 360, kind: "ambient" },

  // Targets — receive Frame 3 dashed projections from C3 / C4 / C5.
  // Sit on a separate row below the tree (Y=445-535) so they read as
  // "next at-risk row."
  { id: "S1", x: 315, y: 490, kind: "target" },
  { id: "S2", x: 475, y: 535, kind: "target" },
  { id: "S3", x: 640, y: 510, kind: "target" },
  { id: "S4", x: 810, y: 480, kind: "target" },
  { id: "S5", x: 910, y: 445, kind: "target" },
];

// ─────────────────────────────────────────────────────────────────────
// Projections — Scene4Stop only. Dashed red arrows from latest-infected
// leaves to target susceptibles. Staggered every 0.08 progress for the
// punchy "forecasting" beat the user asked for.
// ─────────────────────────────────────────────────────────────────────
export const PROJECTIONS: Projection[] = [
  { fromNodeId: "C3", toSuscId: "S1", appearAt: 0.05 },
  { fromNodeId: "C3", toSuscId: "S2", appearAt: 0.13 },
  { fromNodeId: "C4", toSuscId: "S3", appearAt: 0.21 },
  { fromNodeId: "C5", toSuscId: "S4", appearAt: 0.29 },
  { fromNodeId: "C5", toSuscId: "S5", appearAt: 0.37 },
];

export const TREE_NODE_BY_ID: Record<string, TreeNode> = Object.fromEntries(
  TREE_NODES.map((n) => [n.id, n]),
);

export const SUSC_BY_ID: Record<string, Susceptible> = Object.fromEntries(
  SUSCEPTIBLES.map((s) => [s.id, s]),
);

export const TARGET_IDS: Set<string> = new Set(
  PROJECTIONS.map((p) => p.toSuscId),
);
