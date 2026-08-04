import type { PathogenSpec } from "./types";

// Source: AI-assisted image-to-3D, textures stripped, simplified to ~8% triangles + meshopt (~381 KB).
export const CAURIS: PathogenSpec = {
  id: "cauris",
  name: "C. auris",
  common: "Invasive candidiasis",
  shortLabel: "C. auris",
  modelUrl: "/models/c-auris.glb",
  framing: { cameraZ: 6.2, tiltX: 0.18 },
  source: {
    nih3dEntryId: "nosotrack/c-auris",
    nih3dEntryUrl: "https://www.cdc.gov/candida-auris/index.html",
    creator: "Nosotrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
