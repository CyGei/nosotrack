import type { PathogenSpec } from "./types";

/**
 * Escherichia coli — NIH 3D entry 3DPX-009810 (James Tyrwhitt Drake).
 *
 * Source WRL was 33 MB. Converted directly, then `gltfpack -si 0.10
 * -sa -sp -cc` → ~706 KB.
 *
 * This is a clear rod-shaped bacterium (post-normalisation bounding
 * box ~494 × 140 × 204 — aspect ~3.5:1 on the X axis). The earlier
 * axial classifier (cutoffRatio 0.75) tinted the fimbriae tips red,
 * but Cy bounced that look on 2026-05-24 — the red read as a
 * stylistic artefact rather than informative signal. Reverted to
 * **all-grey** for a clean monochrome silhouette consistent with
 * the rest of the bacterial / non-spiked specimens. If a future
 * model arrives with cleanly separated fimbriae/flagella meshes,
 * switch back to `axial` or `mesh-name` then.
 *
 * License: CC-BY 4.0.
 */
export const ECOLI: PathogenSpec = {
  id: "ecoli",
  name: "E. coli",
  common: "Diarrhoeal & urinary tract infection",
  shortLabel: "E. coli",
  modelUrl: "/models/ecoli.glb",
  framing: {
    // The rod is much longer than the camera framing assumes — pull
    // back a touch so both ends fit comfortably and the rotation reads.
    cameraZ: 6.5,
    tiltX: 0.18,
  },
  source: {
    nih3dEntryId: "3DPX-009810",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-009810",
    creator: "James Tyrwhitt Drake",
    license: "CC-BY 4.0",
  },
};
