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
  // Disease X is the hero specimen: it renders larger than the arced
  // specimens (see PathogenArc, and the bigger targetRadius below).
  name: "Disease X",
  shortLabel: "Disease X",
  modelUrl: "/models/disease-x.glb",
  // Bigger targetRadius than the arced specimens so the hero X fills its
  // frame more (reads larger, and its arms reach up toward the heading and
  // left toward the body text). Still inside the rotation-safe bounding
  // sphere at the default cameraZ, so it never clips.
  framing: { tiltX: 0.22, targetRadius: 1.5 },
  source: {
    nih3dEntryId: "nosotrack/disease-x",
    nih3dEntryUrl: "https://www.who.int/activities/prioritizing-diseases-for-research-and-development-in-emergency-contexts",
    creator: "Nosotrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
