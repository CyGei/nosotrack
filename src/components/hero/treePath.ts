import { TREE_STYLE } from "../story/treeDesign";

// One rounded turn is enough for the hero's top-to-bottom tree.
export function heroTreePath(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  clearance: number,
) {
  const dx = Math.sign(bx - ax);
  const dy = Math.sign(by - ay);
  if (!dy) return `M ${ax} ${ay} H ${bx - dx * clearance}`;
  const endY = by - dy * clearance;
  const r = Math.min(TREE_STYLE.corner, Math.abs(bx - ax), Math.abs(endY - ay));
  return `M ${ax} ${ay} H ${bx - dx * r} Q ${bx} ${ay} ${bx} ${ay + dy * r} V ${endY}`;
}
