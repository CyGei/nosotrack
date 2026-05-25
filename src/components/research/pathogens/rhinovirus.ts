import type { PathogenSpec } from "./types";

/**
 * Rhinovirus — NIH 3D entry 3DPX-009814 (James Tyrwhitt Drake).
 *
 * Source WRL was 36 MB. Converted directly (under the 60 MB Python-
 * decimation threshold), then `gltfpack -si 0.10 -sa -sp -cc` → ~891 KB.
 *
 * Rhinovirus is a non-enveloped icosahedral picornavirus — the capsid
 * is smooth at the resolution this model uses, with no protruding
 * spikes or fibres. Per the universal palette rule (smooth capsid →
 * entirely grey), this one uses the `all-grey` classifier rather than
 * inventing surface detail that isn't there.
 *
 * License: CC-BY 4.0.
 */
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
