import type { PathogenSpec } from "./types";

/**
 * Candida auris — emerging multidrug-resistant fungal pathogen.
 *
 * First identified in 2009; now CDC-flagged as an "urgent threat" due
 * to its frequent resistance to all three major antifungal classes and
 * its ability to persist on hospital surfaces for weeks. Globally
 * spreading nosocomial yeast — a major target for outbreak forensics.
 *
 * Source: AI-assisted image-to-3D, textures stripped, simplified to
 * ~8% triangles + meshopt-compressed (~381 KB).
 */
export const CAURIS: PathogenSpec = {
  id: "cauris",
  name: "C. auris",
  shortLabel: "C. auris",
  modelUrl: "/models/c-auris.glb",
  framing: { cameraZ: 6.2, tiltX: 0.18 },
  source: {
    nih3dEntryId: "nosotrack/c-auris",
    nih3dEntryUrl: "https://www.cdc.gov/candida-auris/index.html",
    creator: "NosoTrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
