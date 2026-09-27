// Shared visual routing from nosotrack-mvp/frontend/src/lib/layout.ts.
export function manhattanPath(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  r = 7,
  childR = 12,
): string {
  const dirH = bx > ax ? 1 : bx < ax ? -1 : 0;
  const dirV = by > ay ? 1 : by < ay ? -1 : 0;
  if (dirV === 0) {
    const ex = bx - dirH * childR;
    return `M ${ax} ${ay} L ${ex} ${ay}`;
  }
  if (dirH === 0) {
    const ey = by - dirV * childR;
    return `M ${ax} ${ay} L ${ax} ${ey}`;
  }
  const midX = (ax + bx) / 2;
  const ex = bx - dirH * childR;
  if (
    Math.abs(midX - ax) < r * 1.5 ||
    Math.abs(bx - midX) < r * 1.5 ||
    Math.abs(by - ay) < r * 2
  ) {
    return `M ${ax} ${ay} L ${midX} ${ay} L ${midX} ${by} L ${ex} ${by}`;
  }
  const c1x = midX - r * dirH;
  const c2x = midX + r * dirH;
  const c1y = ay + r * dirV;
  const c2y = by - r * dirV;
  return (
    `M ${ax} ${ay} ` +
    `L ${c1x} ${ay} ` +
    `Q ${midX} ${ay}, ${midX} ${c1y} ` +
    `L ${midX} ${c2y} ` +
    `Q ${midX} ${by}, ${c2x} ${by} ` +
    `L ${ex} ${by}`
  );
}
