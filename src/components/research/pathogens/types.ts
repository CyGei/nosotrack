/**
 * PathogenSpec — declarative configuration for a single 3D specimen.
 *
 * Every pathogen visual in Nosotrack's Research section is described by
 * one of these objects. The shared <PathogenViewer> renders any spec;
 * adding a new pathogen is purely a registry edit.
 *
 * See `src/components/research/pathogens/index.ts` for the catalogue,
 * `scripts/fetch-pathogen.mjs` for the helper that downloads + optimizes
 * a GLB straight from a NIH 3D entry ID into this shape.
 *
 * Universal palette rule (locked 2026-05-24 — see feedback memory):
 *   - Body / envelope / membrane / capsid → grey #7a7d83
 *   - Surface projections (spikes, glycoproteins, fimbriae)  → red #ff073a
 *   - Nothing else gets a colour. Period.
 *
 * Red-shading is fully automatic — see `./classify.ts` for the algorithm.
 * Specs no longer declare a classifier; the same shader runs on every mesh.
 */

/* ─────────────────────────────────────────────────────── framing ── */

export type PathogenFraming = {
  /** Target bounding-sphere radius after centring + uniform scale. Default 1.05. */
  targetRadius?: number;
  /** Perspective camera distance on Z. Default 6.0. */
  cameraZ?: number;
  /** Field of view in degrees. Default 34. */
  fov?: number;
  /** Pre-rotation applied to the model group (radians). Default (0.32, 0, -0.1). */
  tiltX?: number;
  tiltY?: number;
  tiltZ?: number;
  /** Auto-rotation speed in radians/sec around `rotationAxis`. Default 0.175 (~10°/s). */
  rotationSpeed?: number;
  rotationAxis?: "x" | "y" | "z";
};

/* ─────────────────────────────────────────────────────── source ── */

export type PathogenLicense =
  | "CC-BY 4.0"
  | "CC-BY-NC 4.0"
  | "CC0"
  | "Public Domain";

export type PathogenSource = {
  /**
   * NIH 3D entry ID, e.g. "3DPX-013323". For non-NIH GLBs, use a
   * descriptive identifier (creator/title) that traces the file back
   * to its origin.
   */
  nih3dEntryId: string;
  /** Direct link to the entry page on 3d.nih.gov (or the model's origin URL). */
  nih3dEntryUrl: string;
  /** Creator label (typically a NIAID unit or named contributor). */
  creator: string;
  license: PathogenLicense;
};

/* ───────────────────────────────────────────────────── full spec ── */

export type PathogenSpec = {
  /** Kebab-case stable identifier used in URLs and React keys. */
  id: string;
  /** Formal scientific name (e.g. "SARS-CoV-2"). */
  name: string;
  /** Optional common name shown as subtitle (e.g. "COVID-19"). */
  common?: string;
  /** Short tab label — defaults to `name` if omitted. */
  shortLabel?: string;
  /** Absolute URL of the optimized GLB under `/public/models/`. */
  modelUrl: string;
  framing?: PathogenFraming;
  source: PathogenSource;
};
