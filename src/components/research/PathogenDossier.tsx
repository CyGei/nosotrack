"use client";

/**
 * PathogenDossier — modal "case file" overlay opened from PathogenGrid.
 *
 * Layout (stripped-down Palantir):
 *   - Fixed full-viewport backdrop (`bg-ink/70`) that closes on click.
 *   - Centered card on top of the backdrop:
 *       · header — just a bare × close button (no "Specimen dossier" tag,
 *         no "Close" word — the symbol carries it)
 *       · body   — left: pathogen viewer + name (+ optional disease
 *                  subtitle) + NIH attribution where applicable.
 *                  right: scrollable paper list (year · authors · title ·
 *                  journal). For Disease X the right column instead
 *                  shows the WHO R&D Blueprint definition + priority-
 *                  diseases context + source link (see <DiseaseXBody>).
 *                  Single-column layout only when neither papers nor a
 *                  special right body apply.
 *
 * Interaction:
 *   - Esc closes
 *   - Click on backdrop closes
 *   - Click on card body does NOT close (stopPropagation)
 *   - Body scroll-locks while open
 *
 * Attribution rule (2026-05-24 v2):
 *   - NIH 3D entries (nih3dEntryId starts with "3DPX-") get a "Model · NIH
 *     3D Print Exchange · <license>" line that links to the entry.
 *   - AI-generated specimens (nih3dEntryId starts with "nosotrack/") get
 *     no attribution line — Cy didn't want to advertise the AI provenance,
 *     and Public-Domain works don't require credit.
 */

import { useEffect } from "react";
import { PathogenViewer } from "./PathogenViewer";
import { papersFor, type PathogenPaper } from "./papersByPathogen";
import type { PathogenSpec } from "./pathogens/types";

type Props = {
  pathogen: PathogenSpec;
  onClose: () => void;
};

const WHO_DISEASE_X_URL =
  "https://www.who.int/activities/prioritizing-diseases-for-research-and-development-in-emergency-contexts";

export function PathogenDossier({ pathogen, onClose }: Props) {
  const papers = papersFor(pathogen.id);
  const hasPapers = papers.length > 0;
  const isDiseaseX = pathogen.id === "disease-x";
  // The right column is present whenever there's papers OR a special
  // per-pathogen body (Disease X).
  const hasRightBody = hasPapers || isDiseaseX;
  // Real NIH 3D entries — show source link. AI specimens are hidden.
  const isNih = pathogen.source.nih3dEntryId.startsWith("3DPX-");

  // Esc-to-close + body scroll lock. Cleanup restores scroll on unmount.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${pathogen.name} dossier`}
      onClick={onClose}
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center",
        // Asymmetric vertical padding: enough top room to clear the 72px
        // fixed nav even on short viewports (≤700px) where items-center
        // would otherwise pull the card under the nav.
        "px-4 pt-20 pb-4 sm:px-8 sm:pt-24 sm:pb-8",
        "bg-[rgba(33,35,38,0.78)] backdrop-blur-[2px]",
        "animate-[fadeIn_180ms_ease-out]",
      ].join(" ")}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={[
          "relative w-full max-w-[1080px] max-h-[78vh] overflow-hidden",
          "bg-bg border border-rule-strong",
          // Narrow the card when there's no right column at all so the
          // lone left column doesn't look stranded inside an empty
          // 1080px shell. Disease X gets the WHO body in the right
          // column, so it keeps the full width.
          hasRightBody ? "" : "max-w-[560px]",
          "grid grid-rows-[auto_1fr]",
          "animate-[dossierIn_240ms_cubic-bezier(0.16,1,0.3,1)]",
        ].join(" ")}
      >
        {/* ──────────────────── header (bare close) ──────────────────── */}
        <header className="flex items-center justify-end border-b border-rule px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={[
              "flex h-8 w-8 items-center justify-center border border-rule",
              "text-faint text-lg leading-none",
              "transition-colors hover:border-ink hover:bg-ink hover:text-bg",
            ].join(" ")}
          >
            ×
          </button>
        </header>

        {/* ──────────────────── body ──────────────────── */}
        <div
          className={[
            "overflow-hidden grid grid-cols-1",
            hasRightBody ? "md:grid-cols-[minmax(280px,420px)_1fr]" : "",
          ].join(" ")}
        >
          {/* Left — viewer + name */}
          <div
            className={[
              "p-6 flex flex-col",
              hasRightBody
                ? "border-b md:border-b-0 md:border-r border-rule"
                : "",
            ].join(" ")}
          >
            <h3 className="font-display font-medium text-ink text-[clamp(22px,2.4vw,32px)] leading-[1.05] tracking-tight">
              {pathogen.name}
            </h3>
            {pathogen.common && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-faint">
                {pathogen.common}
              </p>
            )}

            <div className="mt-4 flex-1 min-h-[260px] relative">
              <PathogenViewer
                key={`dossier-${pathogen.id}`}
                pathogen={pathogen}
                initialSpinBurst
                className="absolute inset-0"
              />
            </div>

            {isNih && (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-faint">
                Model ·{" "}
                <a
                  href={pathogen.source.nih3dEntryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 hover:text-text hover:underline"
                >
                  NIH 3D Print Exchange
                </a>{" "}
                · {pathogen.source.license}
              </p>
            )}
          </div>

          {/* Right — papers, or the Disease X / WHO callout. */}
          {hasPapers && (
            <div className="overflow-y-auto p-6 sm:p-8">
              <ul className="list-none p-0">
                {papers.map((p) => (
                  <PaperRow key={p.url} paper={p} />
                ))}
              </ul>
            </div>
          )}
          {!hasPapers && isDiseaseX && (
            <div className="overflow-y-auto p-6 sm:p-8">
              <DiseaseXBody />
            </div>
          )}
        </div>
      </div>

      {/* Keyframes scoped inline because Tailwind v4 isn't configured
          with a tailwind.config.js for custom keyframes. */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dossierIn {
          from { opacity: 0; transform: translateY(8px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────── components ── */

/**
 * DiseaseXBody — WHO R&D Blueprint definition, priority-diseases
 * context, and source link. Renders in the right column of the dossier
 * for the special-case `disease-x` pathogen (which has no paper list).
 */
function DiseaseXBody() {
  return (
    <div>
      <blockquote className="font-display font-medium text-ink leading-[1.25] text-[clamp(18px,1.6vw,24px)] tracking-tight">
        “Disease X represents the knowledge that a serious international
        epidemic could be caused by a pathogen currently unknown to cause
        human disease.”
      </blockquote>
      <p className="mt-7 text-text text-[14px] leading-[1.65]">
        Listed alongside COVID-19, Ebola and Marburg, Lassa fever, MERS-CoV
        and SARS, Nipah, Rift Valley fever, and Zika as priority pathogens
        for emergency research and development.
      </p>
      <a
        href={WHO_DISEASE_X_URL}
        target="_blank"
        rel="noreferrer"
        className={[
          "mt-7 inline-flex items-center gap-2",
          "font-mono text-[11px] uppercase tracking-[0.22em] text-text",
          "underline-offset-4 hover:text-[var(--color-alert)] hover:underline",
        ].join(" ")}
      >
        WHO source
        <span aria-hidden>→</span>
      </a>
    </div>
  );
}

function PaperRow({ paper }: { paper: PathogenPaper }) {
  return (
    <li className="border-b border-rule">
      <a
        href={paper.url}
        target="_blank"
        rel="noreferrer"
        className={[
          "group block py-4 transition-colors",
          "hover:bg-[rgba(122,125,131,0.06)]",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.18em] text-ink">
            {paper.year}
          </span>
          <span
            className={[
              "font-mono text-[11px] uppercase tracking-[0.22em] truncate",
              // Author name carries the affordance — fades to alert-red
              // on row hover. Replaces the old explicit "Read paper →"
              // chip (removed 2026-05-24) so the row reads cleaner.
              "text-faint group-hover:text-[var(--color-alert)] transition-colors",
            ].join(" ")}
          >
            {paper.authors}
          </span>
        </div>
        <p className="mt-2 text-text leading-snug group-hover:text-ink transition-colors">
          {paper.title}
        </p>
        {paper.journal && (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-faint italic">
            {paper.journal}
          </p>
        )}
      </a>
    </li>
  );
}
