import type { PathogenSpec } from "./types";

/**
 * Ebola Virus — NIH 3D entry 3DPX-007856 (James Tyrwhitt Drake cutaway).
 *
 * Source WRL was 94 MB / ~2.2M triangles. Decimated to 20% in Python
 * (see scripts/lib/decimate-wrl.py), converted via three.js VRMLLoader
 * + GLTFExporter, then `gltfpack -si 0.10 -sa -sp -cc` → ~833 KB.
 *
 * The export is a single mesh / single material — no semantic markers
 * to distinguish glycoprotein spikes from envelope. We use the
 * `surface-bumps` classifier (per-vertex local curvature ranking) so
 * the actual GP-trimer protrusions go red without polluting the cut
 * surface. `topFraction: 0.10` lands roughly on the spike tips for
 * this model — bump up to 0.15 if Cy wants more red, drop to 0.06 if
 * less.
 *
 * License: CC-BY-NC 4.0. NosoTrack ships this for research / preview
 * use; commercial use would require contacting the author.
 */
export const EBOLA: PathogenSpec = {
  id: "ebola",
  name: "Ebola virus",
  shortLabel: "Ebola",
  modelUrl: "/models/ebola-virion.glb",
  framing: { tiltX: 0.28 },
  source: {
    nih3dEntryId: "3DPX-007856",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-007856",
    creator: "James Tyrwhitt Drake",
    license: "CC-BY-NC 4.0",
  },
};
