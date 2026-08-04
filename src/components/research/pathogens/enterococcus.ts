import type { PathogenSpec } from "./types";

// Source: AI-assisted image-to-3D, textures stripped, simplified to ~8% triangles + meshopt (~1.9 MB).
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
    creator: "Nosotrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
