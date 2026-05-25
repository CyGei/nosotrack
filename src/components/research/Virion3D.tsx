/**
 * Deprecated — replaced by `PathogenViewer` + the `./pathogens/` registry.
 *
 * This shim only exists because the cowork sandbox can't delete files in
 * the mounted repo; the user should `rm src/components/research/Virion3D.tsx`
 * locally and then this re-export goes away.
 *
 * Anything that still imports `Virion3D` will get the SARS-CoV-2 specimen
 * rendered through the new generic viewer.
 */

import { PathogenViewer } from "./PathogenViewer";
import { SARS_COV_2 } from "./pathogens/sars-cov-2";

/** @deprecated Use `<PathogenViewer pathogen={SARS_COV_2} />` instead. */
export function Virion3D() {
  return <PathogenViewer pathogen={SARS_COV_2} />;
}
