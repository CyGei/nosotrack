import type { PathogenSpec } from "./types";

// Source: NIH 3D 3DPX-013323 GLB (~11 MB, 566K tris), `gltfpack -si 0.30 -cc` → 649 KB / 170K tris.
export const SARS_COV_2: PathogenSpec = {
  id: "sars-cov-2",
  name: "SARS-CoV-2",
  common: "COVID-19",
  shortLabel: "SARS-CoV-2",
  modelUrl: "/models/sars-cov-2-virion.glb",
  source: {
    nih3dEntryId: "3DPX-013323",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-013323",
    creator: "NIAID Visual & Medical Arts",
    license: "CC-BY 4.0",
  },
};
