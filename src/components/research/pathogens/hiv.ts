import type { PathogenSpec } from "./types";

/**
 * HIV — NIH 3D entry 3DPX-007838 (James Tyrwhitt Drake cutaway).
 *
 * Source WRL was 69 MB / 1.6M triangles. Decimated to 20% in Python,
 * converted via three.js, then `gltfpack -si 0.10 -sa -sp -cc` → ~528 KB.
 *
 * Single mesh / single material — no semantic markers in the export.
 * Uses the `surface-bumps` classifier (local curvature ranking) so the
 * actual Env-trimer protrusions go red without polluting the envelope
 * or the cut surface. `topFraction: 0.12` matches the gp120/gp41
 * spike density on this model. Bump higher for more red, lower for
 * less.
 *
 * License: CC-BY-NC 4.0.
 */
export const HIV: PathogenSpec = {
  id: "hiv",
  name: "HIV",
  common: "AIDS",
  shortLabel: "HIV",
  modelUrl: "/models/hiv-virion.glb",
  source: {
    nih3dEntryId: "3DPX-007838",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-007838",
    creator: "James Tyrwhitt Drake",
    license: "CC-BY-NC 4.0",
  },
};
