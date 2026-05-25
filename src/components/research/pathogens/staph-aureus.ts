import type { PathogenSpec } from "./types";

/**
 * Staphylococcus aureus — gram-positive coccus, characteristic
 * grape-like clusters. The methicillin-resistant strain (MRSA) is one
 * of the most-tracked nosocomial pathogens in the world.
 *
 * Source: AI-assisted image-to-3D, textures stripped and simplified to
 * ~10% triangles + meshopt-compressed (~875 KB).
 *
 * Classifier `all-grey` — no surface projections worth differentiating
 * (consistent with the other bacterial specimens; see ecoli precedent).
 */
export const STAPH_AUREUS: PathogenSpec = {
  id: "staph-aureus",
  name: "S. aureus",
  shortLabel: "S. aureus",
  modelUrl: "/models/staph-aureus.glb",
  framing: { cameraZ: 6.2, tiltX: 0.18 },
  source: {
    nih3dEntryId: "nosotrack/staph-aureus",
    nih3dEntryUrl: "https://www.cdc.gov/mrsa/index.html",
    creator: "NosoTrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
