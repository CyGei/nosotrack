import type { PathogenSpec } from "./types";

/**
 * Influenza A — NIAID PathogenAR cutaway virion.
 *
 * Source GLB (~7.8 MB, 300K tris, 13 named materials) was downloaded
 * from NIH 3D entry 3DPX-013373 and reduced with `gltfpack -si 0.30 -cc`
 * to 441 KB / 300K tris (~150K verts after dedup).
 *
 * The model ships one material per biological component — hemagglutinin
 * and neuraminidase are the two surface-projection spikes (red); the M2
 * ion channel, the envelope, the matrix, and all the internal RNP /
 * cytosolic proteins map to grey.
 */
export const INFLUENZA: PathogenSpec = {
  id: "influenza",
  name: "Influenza",
  common: "Seasonal & pandemic flu",
  shortLabel: "Influenza",
  modelUrl: "/models/influenza-virion.glb",
  framing: {
    // The PathogenAR model is internally larger than the SARS one; the
    // bounding-sphere normalisation handles scale, but tilting it a touch
    // less reads cleaner against the cutaway interior.
    tiltX: 0.22,
  },
  source: {
    nih3dEntryId: "3DPX-013373",
    nih3dEntryUrl: "https://3d.nih.gov/entries/3dpx-013373",
    creator: "NIAID Biovisualization Program",
    license: "CC-BY 4.0",
  },
};
