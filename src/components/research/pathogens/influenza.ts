import type { PathogenSpec } from "./types";

// Source: NIH 3D 3DPX-013373 GLB (~7.8 MB, 300K tris), `gltfpack -si 0.30 -cc` → 441 KB / 300K tris.
export const INFLUENZA: PathogenSpec = {
  id: "influenza",
  name: "Influenza",
  common: "Seasonal & pandemic flu",
  shortLabel: "Influenza",
  modelUrl: "/models/influenza-virion.glb",
  framing: {
    tiltX: 0.22,
  },
  source: {
    nih3dEntryId: "3DPX-013373",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-013373",
    creator: "NIAID Biovisualization Program",
    license: "CC-BY 4.0",
  },
};
