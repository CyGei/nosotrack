/**
 * Pathogen registry — the single source of truth for what specimens are
 * shown in the Research section.
 *
 * To add a specimen:
 *   1. Source a GLB — either from NIH 3D (preferred) or any other
 *      glTF-binary file. NIH 3D entries can be ingested automatically:
 *      `npm run fetch:pathogen -- <entry-id> <slug> [si]`
 *      For external GLBs (e.g. AI image-to-3D output), drop the file
 *      into `public/models/` after stripping textures + simplifying.
 *   2. Create `pathogens/<slug>.ts` exporting a `PathogenSpec` with
 *      `modelUrl` + optional `framing` + `source`.
 *   3. Import + append below.
 *
 * The viewer + selector pick up new specimens automatically. The
 * universal grey-body / red-projection palette is enforced by the
 * single `paintRedShading` algorithm — see `./classify.ts`.
 */

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
  // Order = order in the selector tab strip. Group by taxonomy for
  // readability: enveloped RNA viruses → non-enveloped viruses →
  // retroviruses → speculative virion → gram-negative rods →
  // gram-positive rods → gram-positive cocci → fungi.
  SARS_COV_2, // 3DPX-013323 · CC-BY 4.0 · cryo-ET envelope + spikes
  INFLUENZA, // 3DPX-013373 · CC-BY 4.0 · cutaway with HA/NA spikes
  EBOLA, // 3DPX-007856 · CC-BY-NC · filamentous w/ glycoproteins
  HIV, // 3DPX-007838 · CC-BY-NC · cutaway w/ Env trimers
  RHINOVIRUS, // 3DPX-009814 · CC-BY 4.0 · icosahedral capsid
  NOROVIRUS, // AI · Public Domain · icosahedral RNA virus
  DISEASE_X, // AI · Public Domain · WHO priority unknown pathogen
  ECOLI, // AI · Public Domain · gram-negative rod
  KLEBSIELLA, // AI · Public Domain · encapsulated rod
  CDIFF, // AI · Public Domain · spore-forming rod
  STAPH_AUREUS, // AI · Public Domain · MRSA / coccus cluster
  ENTEROCOCCUS, // AI · Public Domain · VRE / cocci pairs
  CAURIS, // AI · Public Domain · multidrug-resistant yeast
];
