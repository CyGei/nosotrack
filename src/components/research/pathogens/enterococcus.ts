import type { PathogenSpec } from "./types";

/**
 * Enterococcus (E. faecium / E. faecalis) — gram-positive cocci, often
 * arranged in pairs or short chains. A major nosocomial pathogen,
 * particularly the vancomycin-resistant strains (VRE).
 *
 * Source: AI-assisted image-to-3D, textures stripped and simplified to
 * ~8% triangles + meshopt-compressed (~1.9 MB).
 *
 * Classifier is `all-grey` — Enterococcus has no surface projections to
 * highlight, and per the [[feedback_pathogen_colors]] rule we don't tint
 * geometry just for visual interest (see ecoli for the precedent).
 */
export const ENTEROCOCCUS: PathogenSpec = {
  id: "enterococcus",
  name: "Enterococcus",
  common: "VRE & enterococcal infection",
  shortLabel: "Enterococcus",
  modelUrl: "/models/enterococcus.glb",
  framing: { cameraZ: 6.2, tiltX: 0.18 },
  source: {
    nih3dEntryId: "nosotrack/enterococcus",
    nih3dEntryUrl: "https://www.cdc.gov/healthcare-associated-infections/about/vre.html",
    creator: "NosoTrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
