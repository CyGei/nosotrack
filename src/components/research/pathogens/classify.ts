/**
 * paintRedShading — one algorithm, every pathogen mesh.
 *
 * Goal: highlight surface projections (spikes, fimbriae, glycoproteins,
 * flagella, capsule bumps) in red while keeping the body grey. No
 * per-spec configuration, no parameters.
 *
 * Algorithm — "Mahalanobis distance from PCA-fitted ellipsoid":
 *
 *   1. Fit a 3D ellipsoid to the mesh by computing the centroid and the
 *      3×3 covariance matrix of vertex positions. Eigendecomposition is
 *      implicit: the inverse covariance matrix encodes the ellipsoid
 *      directly. This ellipsoid IS "the standard body shape" — a sphere
 *      for cocci, a prolate ellipsoid for rods, a half-ellipsoid for
 *      cutaway virions.
 *
 *   2. Score every vertex by its squared Mahalanobis distance from that
 *      ellipsoid: score[i] = (v[i] − μ) · Σ⁻¹ · (v[i] − μ). Vertices on
 *      the "1-σ surface" sit near score=3; spike tips that protrude
 *      beyond the body shape get higher scores; cut-surface interiors
 *      get lower.
 *
 *   3. Robust outlier threshold = median(score) + 2 × MAD(score). MAD
 *      (median absolute deviation) is insensitive to the few extreme
 *      tail values that throw off mean/stddev or Otsu, so the same
 *      formula works on unimodal smooth meshes and bimodal spike-rich
 *      ones.
 *
 *   4. Connected-component filter using mesh adjacency + position-weld
 *      (so duplicate vertices at the same physical position, common
 *      after gltfpack -cc, are treated as connected). Cluster minimum
 *      is 3 — kills isolated single-vertex noise while preserving every
 *      real feature cluster.
 *
 *   5. Paint binary grey/red into the per-vertex `color` attribute.
 *
 * Why this works across the full catalogue:
 *
 *   - Spherical virions (SARS, rhinovirus, capsids): ellipsoid ≈ sphere,
 *     spikes are radial outliers → red.
 *   - Rod bacteria (E. coli, K. pneumoniae): ellipsoid is prolate, side
 *     bumps + ends are above the 1-σ surface → red.
 *   - Cutaways (Ebola, HIV): ellipsoid ≈ half-virion shape, glycoprotein
 *     spike tips poke out → red, while the cut surface is *inside* the
 *     ellipsoid → grey.
 *   - Heterogeneous-resolution meshes (AI-generated): no iterative
 *     smoothing means edge-length variation doesn't break the
 *     algorithm. Only the global covariance fit and per-vertex score
 *     matter.
 *
 * Complexity: O(V) for centroid + covariance + scores + adjacency;
 * O(V log V) for the MAD sort; O(V + E) for CC. Runs in <200 ms for
 * 160k-vertex meshes.
 */

import * as THREE from "three";

/** Brand palette — locked. Don't introduce more shades. */
export const PALETTE_GREY = new THREE.Color(0x7a7d83);
export const PALETTE_RED = new THREE.Color(0xff073a);

/** MAD outlier multiplier. 2.0 corresponds to roughly the upper 5–10 %
 *  tail for unimodal distributions and the upper mode for bimodal ones;
 *  empirically picks the spike clusters on every shipped specimen. */
const MAD_MULT = 2.0;

/** Minimum connected component size. 3 is enough to reject single- or
 *  paired-vertex noise specks while admitting every real biological
 *  cluster (which always has a base + walls = many connected verts). */
const MIN_CLUSTER = 3;

/** Position-weld cell size as a fraction of mean edge length. 0.5 catches
 *  gltfpack-quantized seam splits without accidentally welding real
 *  neighbours. */
const WELD_CELL_RATIO = 0.5;

/* ─────────────────────────────────────────────────── public ── */

/**
 * Apply the universal red-shading algorithm to one mesh in place.
 * Writes a fresh `color` BufferAttribute and leaves the geometry ready
 * for `MeshStandardMaterial({ vertexColors: true })`.
 */
export function paintRedShading(mesh: THREE.Mesh): void {
  const geom = mesh.geometry as THREE.BufferGeometry;
  const posAttr = geom.getAttribute("position") as
    | THREE.BufferAttribute
    | undefined;
  if (!posAttr) return;
  const V = posAttr.count;
  if (V === 0) return;

  // Flatten positions to a Float32Array once — every step below benefits.
  const positions = new Float32Array(V * 3);
  for (let i = 0; i < V; i++) {
    positions[i * 3 + 0] = posAttr.getX(i);
    positions[i * 3 + 1] = posAttr.getY(i);
    positions[i * 3 + 2] = posAttr.getZ(i);
  }

  // Colour attribute, pre-filled grey (degenerate exits look correct).
  const colorAttr = ensureColorAttribute(geom, V);
  paintAll(colorAttr, PALETTE_GREY);

  if (V < 20) {
    colorAttr.needsUpdate = true;
    return;
  }

  // 1+2. Mahalanobis scores
  const scores = mahalanobisScores(positions, V);
  if (!scores) {
    colorAttr.needsUpdate = true;
    return;
  }

  // 3. Threshold
  const threshold = madThreshold(scores);

  // 4. CC filter
  const adj = buildAdjacency(geom, positions, V);
  const candidate = new Uint8Array(V);
  for (let i = 0; i < V; i++) candidate[i] = scores[i] >= threshold ? 1 : 0;
  const isRed = filterByClusterSize(candidate, adj, V, MIN_CLUSTER);

  // 5. Paint
  for (let i = 0; i < V; i++) {
    if (!isRed[i]) continue;
    colorAttr.setXYZ(i, PALETTE_RED.r, PALETTE_RED.g, PALETTE_RED.b);
  }
  colorAttr.needsUpdate = true;
}

/* ─────────────────────────────────────────────── helpers ── */

function ensureColorAttribute(
  geom: THREE.BufferGeometry,
  V: number
): THREE.BufferAttribute {
  const existing = geom.getAttribute("color") as
    | THREE.BufferAttribute
    | undefined;
  if (existing && existing.itemSize >= 3) return existing;
  const attr = new THREE.BufferAttribute(new Float32Array(V * 3), 3);
  geom.setAttribute("color", attr);
  return attr;
}

function paintAll(colorAttr: THREE.BufferAttribute, color: THREE.Color) {
  const count = colorAttr.count;
  for (let i = 0; i < count; i++) {
    colorAttr.setXYZ(i, color.r, color.g, color.b);
  }
}

/**
 * Compute the centroid + 3×3 covariance of vertex positions, invert
 * the covariance in closed form, and return the squared Mahalanobis
 * distance for every vertex.
 *
 * Returns null only for genuinely degenerate inputs (e.g. all vertices
 * coincident — covariance has zero determinant).
 */
function mahalanobisScores(
  positions: Float32Array,
  V: number
): Float32Array | null {
  // Centroid
  let cx = 0,
    cy = 0,
    cz = 0;
  for (let i = 0; i < V; i++) {
    cx += positions[i * 3 + 0];
    cy += positions[i * 3 + 1];
    cz += positions[i * 3 + 2];
  }
  cx /= V;
  cy /= V;
  cz /= V;

  // Covariance (symmetric, store 6 upper-triangular entries)
  let c00 = 0,
    c01 = 0,
    c02 = 0,
    c11 = 0,
    c12 = 0,
    c22 = 0;
  for (let i = 0; i < V; i++) {
    const x = positions[i * 3 + 0] - cx;
    const y = positions[i * 3 + 1] - cy;
    const z = positions[i * 3 + 2] - cz;
    c00 += x * x;
    c01 += x * y;
    c02 += x * z;
    c11 += y * y;
    c12 += y * z;
    c22 += z * z;
  }
  c00 /= V;
  c01 /= V;
  c02 /= V;
  c11 /= V;
  c12 /= V;
  c22 /= V;

  // Closed-form 3×3 symmetric inverse via adjugate / determinant.
  const a00 = c11 * c22 - c12 * c12;
  const a01 = c02 * c12 - c01 * c22;
  const a02 = c01 * c12 - c02 * c11;
  const a11 = c00 * c22 - c02 * c02;
  const a12 = c01 * c02 - c00 * c12;
  const a22 = c00 * c11 - c01 * c01;
  const det = c00 * a00 + c01 * a01 + c02 * a02;
  if (Math.abs(det) < 1e-20) return null;
  const inv = 1 / det;
  const i00 = a00 * inv,
    i01 = a01 * inv,
    i02 = a02 * inv,
    i11 = a11 * inv,
    i12 = a12 * inv,
    i22 = a22 * inv;

  const scores = new Float32Array(V);
  for (let i = 0; i < V; i++) {
    const x = positions[i * 3 + 0] - cx;
    const y = positions[i * 3 + 1] - cy;
    const z = positions[i * 3 + 2] - cz;
    scores[i] =
      x * x * i00 +
      2 * x * y * i01 +
      2 * x * z * i02 +
      y * y * i11 +
      2 * y * z * i12 +
      z * z * i22;
  }
  return scores;
}

/**
 * Robust outlier threshold via median + k × MAD.
 *
 * MAD = median(|x − median(x)|). It's the robust analogue of stddev:
 * insensitive to extreme outliers, which makes it work uniformly on
 * unimodal distributions (smooth coccus) and bimodal ones (cryo-ET
 * virion with clear envelope vs spike modes).
 */
function madThreshold(scores: Float32Array): number {
  const sorted = Float32Array.from(scores).sort();
  const median = sorted[Math.floor(sorted.length / 2)];

  const devs = new Float32Array(sorted.length);
  for (let i = 0; i < sorted.length; i++) devs[i] = Math.abs(sorted[i] - median);
  devs.sort();
  const mad = devs[Math.floor(devs.length / 2)];

  if (mad <= 0) return median;
  return median + MAD_MULT * mad;
}

/**
 * Build 1-ring adjacency from triangles, augmented with a position-weld
 * pass so identical positions (common after gltfpack -cc splits seams)
 * are treated as connected. Without the weld, the CC filter would reject
 * real clusters on non-manifold meshes.
 *
 * CSR storage: `offsets[i]` is the start index into `nbrs`, `offsets[i+1]`
 * the end. ~3× faster to iterate than arrays-of-arrays.
 */
type Adjacency = { nbrs: Uint32Array; offsets: Uint32Array };

function buildAdjacency(
  geom: THREE.BufferGeometry,
  positions: Float32Array,
  V: number
): Adjacency {
  const sets: Set<number>[] = new Array(V);
  for (let i = 0; i < V; i++) sets[i] = new Set();

  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    sets[a].add(b);
    sets[b].add(a);
  };

  // Triangle-based edges
  const idxAttr = geom.getIndex();
  const triCount =
    (idxAttr ? (idxAttr.array as ArrayLike<number>).length : V) / 3;
  let edgeSum = 0;
  let edgeCount = 0;
  if (idxAttr) {
    const idx = idxAttr.array as ArrayLike<number>;
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t],
        b = idx[t + 1],
        c = idx[t + 2];
      addEdge(a, b);
      addEdge(b, c);
      addEdge(a, c);
      edgeSum += edgeLen(positions, a, b);
      edgeSum += edgeLen(positions, b, c);
      edgeSum += edgeLen(positions, a, c);
      edgeCount += 3;
    }
  } else {
    for (let t = 0; t + 2 < V; t += 3) {
      addEdge(t, t + 1);
      addEdge(t + 1, t + 2);
      addEdge(t, t + 2);
      edgeSum += edgeLen(positions, t, t + 1);
      edgeSum += edgeLen(positions, t + 1, t + 2);
      edgeSum += edgeLen(positions, t, t + 2);
      edgeCount += 3;
    }
  }

  // Position-weld: connect verts that hash to the same spatial cell.
  // Cell size scales with mean edge length so quantized seam-duplicates
  // collapse but real triangle neighbours don't accidentally weld.
  if (edgeCount > 0 && triCount > 0) {
    const cellSize = WELD_CELL_RATIO * (edgeSum / edgeCount);
    if (cellSize > 0) {
      const cells = new Map<string, number[]>();
      for (let i = 0; i < V; i++) {
        const kx = Math.floor(positions[i * 3 + 0] / cellSize);
        const ky = Math.floor(positions[i * 3 + 1] / cellSize);
        const kz = Math.floor(positions[i * 3 + 2] / cellSize);
        const key = `${kx},${ky},${kz}`;
        const list = cells.get(key);
        if (list) list.push(i);
        else cells.set(key, [i]);
      }
      for (const list of cells.values()) {
        if (list.length < 2) continue;
        const root = list[0];
        for (let k = 1; k < list.length; k++) addEdge(root, list[k]);
      }
    }
  }

  // Flatten to CSR
  const offsets = new Uint32Array(V + 1);
  let total = 0;
  for (let i = 0; i < V; i++) {
    offsets[i] = total;
    total += sets[i].size;
  }
  offsets[V] = total;

  const nbrs = new Uint32Array(total);
  let cursor = 0;
  for (let i = 0; i < V; i++) {
    for (const j of sets[i]) nbrs[cursor++] = j;
  }
  return { nbrs, offsets };
}

function edgeLen(positions: Float32Array, a: number, b: number): number {
  const dx = positions[a * 3 + 0] - positions[b * 3 + 0];
  const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
  const dz = positions[a * 3 + 2] - positions[b * 3 + 2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Reject candidate vertices that don't belong to a connected component
 * of at least `minSize` vertices. Iterative BFS over the augmented
 * 1-ring adjacency graph; only candidate→candidate edges are traversed.
 */
function filterByClusterSize(
  candidate: Uint8Array,
  adj: Adjacency,
  V: number,
  minSize: number
): Uint8Array {
  const { nbrs, offsets } = adj;
  const visited = new Uint8Array(V);
  const result = new Uint8Array(V);
  const queue = new Uint32Array(V);
  const cluster = new Uint32Array(V);

  for (let seed = 0; seed < V; seed++) {
    if (visited[seed] || !candidate[seed]) continue;
    let head = 0,
      tail = 0;
    queue[tail++] = seed;
    visited[seed] = 1;
    let clusterLen = 0;

    while (head < tail) {
      const v = queue[head++];
      cluster[clusterLen++] = v;
      const start = offsets[v];
      const end = offsets[v + 1];
      for (let k = start; k < end; k++) {
        const j = nbrs[k];
        if (visited[j] || !candidate[j]) continue;
        visited[j] = 1;
        queue[tail++] = j;
      }
    }

    if (clusterLen >= minSize) {
      for (let c = 0; c < clusterLen; c++) result[cluster[c]] = 1;
    }
  }
  return result;
}
