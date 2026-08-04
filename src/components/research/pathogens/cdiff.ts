import type { PathogenSpec } from "./types";

// Source: AI-assisted image-to-3D (geometry only), simplified to ~12% triangles + meshopt (~215 KB).
export const CDIFF: PathogenSpec = {
  id: "cdiff",
  name: "C. difficile",
  common: "C. difficile infection (CDI)",
  shortLabel: "C. diff",
  modelUrl: "/models/c-diff.glb",
  framing: { cameraZ: 6.5, tiltX: 0.18 },
  source: {
    nih3dEntryId: "nosotrack/c-diff",
    nih3dEntryUrl: "https://www.cdc.gov/c-diff/index.html",
    creator: "Nosotrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
