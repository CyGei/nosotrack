import type { PathogenSpec } from "./types";

// Source: NIH 3D 3DPX-009814 WRL (36 MB), `gltfpack -si 0.10 -sa -sp -cc` → ~891 KB.
export const RHINOVIRUS: PathogenSpec = {
  id: "rhinovirus",
  name: "Rhinovirus",
  common: "Common cold",
  shortLabel: "Rhinovirus",
  modelUrl: "/models/rhinovirus.glb",
  source: {
    nih3dEntryId: "3DPX-009814",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-009814",
    creator: "James Tyrwhitt Drake",
    license: "CC-BY 4.0",
  },
};
