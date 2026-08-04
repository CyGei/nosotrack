import type { PathogenSpec } from "./types";

// Source: AI-assisted image-to-3D (input 174 MB / 3.95M tris), simplified to ~1.5% triangles + meshopt (~593 KB).
export const NOROVIRUS: PathogenSpec = {
  id: "norovirus",
  name: "Norovirus",
  common: "Acute gastroenteritis",
  shortLabel: "Norovirus",
  modelUrl: "/models/norovirus.glb",
  framing: { cameraZ: 6.0, tiltX: 0.2 },
  source: {
    nih3dEntryId: "nosotrack/norovirus",
    nih3dEntryUrl: "https://www.cdc.gov/norovirus/index.html",
    creator: "Nosotrack (AI-assisted image-to-3D)",
    license: "Public Domain",
  },
};
