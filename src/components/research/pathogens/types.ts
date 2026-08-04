export type PathogenFraming = {
  targetRadius?: number;
  cameraZ?: number;
  fov?: number;
  tiltX?: number;
  tiltY?: number;
  tiltZ?: number;
  rotationSpeed?: number;
  rotationAxis?: "x" | "y" | "z";
};

export type PathogenLicense =
  | "CC-BY 4.0"
  | "CC-BY-NC 4.0"
  | "CC0"
  | "Public Domain";

export type PathogenSource = {
  nih3dEntryId: string;
  nih3dEntryUrl: string;
  // Licensing/attribution provenance for the GLB; intentionally not rendered.
  creator: string;
  license: PathogenLicense;
};

export type PathogenSpec = {
  id: string;
  name: string;
  common?: string;
  shortLabel?: string;
  modelUrl: string;
  framing?: PathogenFraming;
  source: PathogenSource;
};
