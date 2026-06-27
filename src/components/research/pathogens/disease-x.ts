import type { PathogenSpec } from "./types";

/**
 * Disease X — placeholder for the next pandemic-potential pathogen.
 *
 * The WHO uses the term "Disease X" for an unknown infectious agent that
 * could cause a future epidemic. Shipped here as a deliberately
 * speculative virion silhouette to evoke the watch-list use case — the
 * surface-bumps classifier picks up the highest-protruding vertices and
 * paints them red, which reads as projections without us having to claim
 * any specific biology.
 *
 * Source: AI-assisted image-to-3D, then stripped of baked PBR textures
 * and simplified to ~10% triangles + meshopt-compressed (~785 KB).
 */
export const DISEASE_X: PathogenSpec = {
  id: "disease-x",
  // The dossier displays "Disease X" as the heading; the right-hand
  // column of the dossier is populated with the WHO R&D Blueprint
  // definition + priority-diseases context (see PathogenDossier.tsx).
  // Disease X is featured on the homepage via <PathogenSpotlight> and
  // filtered out of the auto-drifting <PathogenTicker> so it isn't
  // shown twice.
  name: "Disease X",
  shortLabel: "Disease X",
  modelUrl: "/models/disease-x.glb",
  framing: { cameraZ: 6.0, tiltX: 0.22 },
  source: {
    nih3dEntryId: "nosotrack/disease-x",
    nih3dEntryUrl: "https://www.who.int/activities/prioritizing-diseases-for-research-and-development-in-emergency-contexts",
    creator: "Nosotrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
