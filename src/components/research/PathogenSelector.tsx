"use client";

/**
 * PathogenSelector — small horizontal tab strip beneath the viewer.
 *
 * Palantir-spinoff styling: hairline rule, JetBrains Mono uppercase
 * micro-labels, alert-red dot on the active tab. The strip is hidden
 * automatically when only one specimen is registered, so the section
 * stays single-focus until the catalogue actually has multiple entries.
 */

import type { PathogenSpec } from "./pathogens/types";

type Props = {
  pathogens: PathogenSpec[];
  activeId: string;
  onChange: (id: string) => void;
};

export function PathogenSelector({ pathogens, activeId, onChange }: Props) {
  if (pathogens.length <= 1) return null;

  return (
    <div
      className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-rule pt-6"
      role="tablist"
      aria-label="Specimen"
    >
      {pathogens.map((p) => {
        const isActive = p.id === activeId;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(p.id)}
            className={[
              "group flex items-center gap-2 font-mono text-[10px] uppercase",
              "tracking-[0.28em] transition-colors duration-200",
              isActive
                ? "text-ink"
                : "text-faint hover:text-text",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "h-1.5 w-1.5 rounded-full transition-colors duration-200",
                isActive
                  ? "bg-[var(--color-alert)]"
                  : "bg-[var(--color-rule-strong)] group-hover:bg-text",
              ].join(" ")}
            />
            {p.shortLabel ?? p.name}
          </button>
        );
      })}
    </div>
  );
}
