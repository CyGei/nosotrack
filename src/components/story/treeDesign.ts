// MVP transmission-tree geometry, shared by the page, hero and embedded demo.
export const TREE_STYLE = {
  radius: 9,
  largeRadius: 12,
  staffRadius: 10,
  outline: 1,
  edge: 1.8,
  strongEdge: 2.6,
  corner: 7,
  clearance: 3,
} as const;

// Original at-risk target treatment from the hero's Stop the spread scene.
export const TREE_TARGET = {
  clearance: 6,
  outline: 1.2,
  dash: "3 2",
  opacity: 0.95,
} as const;

export { manhattanPath } from "./manhattanPath";
