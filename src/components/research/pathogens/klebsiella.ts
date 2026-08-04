import type { PathogenSpec } from "./types";

// Source: AI-assisted image-to-3D, textures stripped, simplified to ~7% triangles + meshopt (~1.05 MB).
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
