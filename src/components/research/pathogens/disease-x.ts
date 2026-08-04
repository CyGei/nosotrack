import type { PathogenSpec } from "./types";

// Source: AI-assisted image-to-3D, PBR textures stripped, simplified to ~10% triangles + meshopt (~785 KB).
export const DISEASE_X: PathogenSpec = {
  id: "disease-x",
  name: "Disease X",
  shortLabel: "Disease X",
  modelUrl: "/models/disease-x.glb",
  framing: { tiltX: 0.22, targetRadius: 1.5 },
  source: {
    nih3dEntryId: "nosotrack/disease-x",
    nih3dEntryUrl: "https://www.who.int/activities/prioritizing-diseases-for-research-and-development-in-emergency-contexts",
    creator: "Nosotrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
