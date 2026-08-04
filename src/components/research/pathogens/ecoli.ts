import type { PathogenSpec } from "./types";

// Source: NIH 3D 3DPX-009810 WRL (33 MB), `gltfpack -si 0.10 -sa -sp -cc` → ~706 KB.
export const ECOLI: PathogenSpec = {
  id: "ecoli",
  name: "E. coli",
  common: "Diarrhoeal & urinary tract infection",
  shortLabel: "E. coli",
  modelUrl: "/models/ecoli.glb",
  framing: {
    cameraZ: 6.5,
    tiltX: 0.18,
  },
  source: {
    nih3dEntryId: "3DPX-009810",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-009810",
    creator: "James Tyrwhitt Drake",
    license: "CC-BY 4.0",
  },
};
