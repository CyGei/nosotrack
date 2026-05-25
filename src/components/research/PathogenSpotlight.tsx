"use client";

/**
 * PathogenSpotlight — single featured specimen rendered larger than the
 * ticker cards. Click opens the standard <PathogenDossier>.
 *
 * Used in the Research section to pull Disease X out of the ticker and
 * pair it visually with the section heading ("ready for disease X.")
 * and the framing paragraph.
 */

import { useState } from "react";
import type { PathogenSpec } from "./pathogens/types";
import { PathogenViewer } from "./PathogenViewer";
import { PathogenDossier } from "./PathogenDossier";

type Props = {
  pathogen: PathogenSpec;
};

export function PathogenSpotlight({ pathogen }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open dossier for ${pathogen.name}`}
        className={[
          "group relative block w-full cursor-pointer",
          "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-alert)]",
          "border border-transparent transition-colors duration-200",
          "hover:border-[var(--color-alert)]/40",
          "focus-visible:border-[var(--color-alert)]/60",
        ].join(" ")}
      >
        <PathogenViewer
          pathogen={pathogen}
          className="relative aspect-square w-full"
        />
      </button>

      {open && (
        <PathogenDossier pathogen={pathogen} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
