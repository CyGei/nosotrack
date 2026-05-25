import type { PathogenSpec } from "./types";

/**
 * Clostridioides difficile — gram-positive, spore-forming, anaerobic
 * rod. The leading cause of antibiotic-associated diarrhoea in
 * healthcare settings; spores survive standard hand sanitiser, which
 * is why C. diff outbreaks are notoriously persistent.
 *
 * Source: AI-assisted image-to-3D (geometry only, no baked textures
 * in this one), simplified to ~12% triangles + meshopt-compressed
 * (~215 KB).
 *
 * Classifier `all-grey` — consistent with the rest of the bacteria.
 */
export const CDIFF: PathogenSpec = {
  id: "cdiff",
  name: "C. difficile",
  shortLabel: "C. diff",
  modelUrl: "/models/c-diff.glb",
  framing: { cameraZ: 6.5, tiltX: 0.18 },
  source: {
    nih3dEntryId: "nosotrack/c-diff",
    nih3dEntryUrl: "https://www.cdc.gov/c-diff/index.html",
    creator: "NosoTrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
