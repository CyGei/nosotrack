import type { PathogenSpec } from "./types";

/**
 * SARS-CoV-2 — NIAID Visual & Medical Arts cryo-ET-derived virion.
 *
 * Source GLB (~11 MB, 566K tris) was downloaded from NIH 3D entry
 * 3DPX-013323 and reduced with `gltfpack -si 0.30 -cc` to 649 KB / 170K
 * tris. The shipped file has no materials — just per-vertex POSITION +
 * COLOR_0 — so the radial classifier (everything past 78% of the
 * bounding-sphere radius is a spike) is the right strategy here.
 */
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
