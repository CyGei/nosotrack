import type { PathogenSpec } from "./types";

/**
 * Norovirus — non-enveloped icosahedral RNA virus, leading cause of
 * acute gastroenteritis outbreaks worldwide. Highly transmissible
 * (low infectious dose, environmental persistence), making it a
 * frequent culprit in hospital, cruise-ship, and long-term-care
 * facility outbreaks.
 *
 * Source: AI-assisted image-to-3D (input was 174 MB / 3.95M tris;
 * the simplifier kept the icosahedral facet structure), simplified
 * to ~1.5% triangles + meshopt-compressed (~593 KB).
 */
export const NOROVIRUS: PathogenSpec = {
  id: "norovirus",
  name: "Norovirus",
  shortLabel: "Norovirus",
  modelUrl: "/models/norovirus.glb",
  framing: { cameraZ: 6.0, tiltX: 0.2 },
  source: {
    nih3dEntryId: "nosotrack/norovirus",
    nih3dEntryUrl: "https://www.cdc.gov/norovirus/index.html",
    creator: "NosoTrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
