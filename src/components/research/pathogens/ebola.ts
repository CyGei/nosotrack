import type { PathogenSpec } from "./types";

// Source: NIH 3D 3DPX-007856 WRL (94 MB / 2.2M tris), decimated 20% (scripts/lib/decimate-wrl.py) then `gltfpack -si 0.10 -sa -sp -cc` → ~833 KB.
export const EBOLA: PathogenSpec = {
  id: "ebola",
  name: "Ebola virus",
  common: "Ebola virus disease",
  shortLabel: "Ebola",
  modelUrl: "/models/ebola-virion.glb",
  framing: { tiltX: 0.28 },
  source: {
    nih3dEntryId: "3DPX-007856",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-007856",
    creator: "James Tyrwhitt Drake",
    license: "CC-BY-NC 4.0",
  },
};
