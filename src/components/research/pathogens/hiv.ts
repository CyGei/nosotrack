import type { PathogenSpec } from "./types";

// Source: NIH 3D 3DPX-007838 WRL (69 MB / 1.6M tris), decimated 20% then `gltfpack -si 0.10 -sa -sp -cc` → ~528 KB.
export const HIV: PathogenSpec = {
  id: "hiv",
  name: "HIV",
  common: "AIDS",
  shortLabel: "HIV",
  modelUrl: "/models/hiv-virion.glb",
  source: {
    nih3dEntryId: "3DPX-007838",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-007838",
    creator: "James Tyrwhitt Drake",
    license: "CC-BY-NC 4.0",
  },
};
