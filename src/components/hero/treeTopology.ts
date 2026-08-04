// Coordinates are in the shared 1000 × 600 viewBox of Scene3Tree/Scene4Stop.

export type TreeNodeKind = "p0" | "confirmed" | "superspread" | "undetected";

export type TreeNode = {
  id: string;
  x: number;
  y: number;
  kind: TreeNodeKind;
  /** Progress (0..1) at which the node transitions grey → its red kind. */
  appearAt: number;
};

export type Susceptible = {
  id: string;
  x: number;
  y: number;
};

export type TreeEdge = {
  from: string;
  to: string;
  /** Progress (0..1) at which the edge begins drawing in. */
  appearAt: number;
};

export type Projection = {
  fromNodeId: string;
  toSuscId: string;
  /** Progress on Scene4's clock at which this projection begins drawing. */
  appearAt: number;
};

// Every node turns red (0.00 → 0.40) before any edge draws (0.45 → 0.90):
// cases are identified first, then the chain between them is inferred.
export const TREE_NODES: TreeNode[] = [
  { id: "P0", x: 500, y: 90,  kind: "p0",          appearAt: 0.00 },

  { id: "C1", x: 320, y: 230, kind: "confirmed",   appearAt: 0.12 },
  { id: "C2", x: 680, y: 230, kind: "superspread", appearAt: 0.16 },

  { id: "U1", x: 220, y: 380, kind: "undetected",  appearAt: 0.28 },
  { id: "C3", x: 400, y: 380, kind: "confirmed",   appearAt: 0.31 },
  { id: "C4", x: 600, y: 380, kind: "confirmed",   appearAt: 0.34 },
  { id: "C5", x: 780, y: 380, kind: "confirmed",   appearAt: 0.37 },
];

export const TREE_EDGES: TreeEdge[] = [
  { from: "P0", to: "C1", appearAt: 0.46 },
  { from: "P0", to: "C2", appearAt: 0.52 },

  { from: "C1", to: "U1", appearAt: 0.60 },
  { from: "C1", to: "C3", appearAt: 0.66 },

  { from: "C2", to: "C4", appearAt: 0.74 },
  { from: "C2", to: "C5", appearAt: 0.80 },
];

export const SUSCEPTIBLES: Susceptible[] = [
  // A* are ambient population; S* are the Scene4 projection targets.
  { id: "A1", x: 435, y: 110 },
  { id: "A2", x: 580, y:  75 },

  { id: "A3", x: 240, y: 250 },
  { id: "A4", x: 395, y: 265 },
  { id: "A5", x: 605, y: 265 },
  { id: "A6", x: 765, y: 205 },

  { id: "A7", x: 305, y: 410 },
  { id: "A8", x: 510, y: 365 },
  { id: "A9", x: 695, y: 405 },
  { id: "A10", x: 865, y: 360 },

  { id: "S1", x: 315, y: 490 },
  { id: "S2", x: 475, y: 535 },
  { id: "S3", x: 640, y: 510 },
  { id: "S4", x: 810, y: 480 },
  { id: "S5", x: 910, y: 445 },
];

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
