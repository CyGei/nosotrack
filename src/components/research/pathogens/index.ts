import type { PathogenSpec } from "./types";

import { SARS_COV_2 } from "./sars-cov-2";
import { INFLUENZA } from "./influenza";
import { EBOLA } from "./ebola";
import { HIV } from "./hiv";
import { RHINOVIRUS } from "./rhinovirus";
import { NOROVIRUS } from "./norovirus";
import { DISEASE_X } from "./disease-x";
import { ECOLI } from "./ecoli";
import { KLEBSIELLA } from "./klebsiella";
import { CDIFF } from "./cdiff";
import { STAPH_AUREUS } from "./staph-aureus";
import { ENTEROCOCCUS } from "./enterococcus";
import { CAURIS } from "./c-auris";

export const PATHOGENS: PathogenSpec[] = [
  SARS_COV_2, // 3DPX-013323 · CC-BY 4.0
  INFLUENZA, // 3DPX-013373 · CC-BY 4.0
  EBOLA, // 3DPX-007856 · CC-BY-NC
  HIV, // 3DPX-007838 · CC-BY-NC
  RHINOVIRUS, // 3DPX-009814 · CC-BY 4.0
  NOROVIRUS, // AI · Public Domain
  DISEASE_X, // AI · Public Domain
  ECOLI, // AI · Public Domain
  KLEBSIELLA, // AI · Public Domain
  CDIFF, // AI · Public Domain
  STAPH_AUREUS, // AI · Public Domain
  ENTEROCOCCUS, // AI · Public Domain
  CAURIS, // AI · Public Domain
];
