import type { PathogenSpec } from "./types";

/**
 * Klebsiella pneumoniae — gram-negative encapsulated rod with Type 3
 * fimbriae. A core nosocomial pathogen, especially the
 * carbapenem-resistant strains (CRKP).
 *
 * Source: AI-assisted image-to-3D, textures stripped and simplified to
 * ~7% triangles + meshopt-compressed (~1.05 MB).
 *
 * Classifier `all-grey` — consistent with the ecoli precedent (Cy
 * rejected axial-tipped fimbriae as stylistic noise). If a future
 * source ships with cleanly separated fimbriae meshes, switch to
 * mesh-name then.
 */
export const KLEBSIELLA: PathogenSpec = {
  id: "klebsiella",
  name: "K. pneumoniae",
  common: "Pneumonia & bloodstream infection",
  shortLabel: "K. pneumoniae",
  modelUrl: "/models/k-pneumoniae.glb",
  framing: { cameraZ: 6.5, tiltX: 0.18 },
  source: {
    nih3dEntryId: "nosotrack/k-pneumoniae",
    nih3dEntryUrl: "https://www.cdc.gov/klebsiella/index.html",
    creator: "Nosotrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
