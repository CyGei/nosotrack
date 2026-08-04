import type { PathogenSpec } from "./types";

// Source: AI-assisted image-to-3D, textures stripped, simplified to ~10% triangles + meshopt (~875 KB).
export const STAPH_AUREUS: PathogenSpec = {
  id: "staph-aureus",
  name: "S. aureus",
  common: "MRSA & staph infection",
  shortLabel: "S. aureus",
  modelUrl: "/models/staph-aureus.glb",
  framing: { cameraZ: 6.2, tiltX: 0.18 },
  source: {
    nih3dEntryId: "nosotrack/staph-aureus",
    nih3dEntryUrl: "https://www.cdc.gov/mrsa/index.html",
    creator: "Nosotrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
