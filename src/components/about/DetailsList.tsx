/**
 * DetailsList — feature list rendered inside the DETAILS tab.
 * Matches the AIP screenshot layout: tight rows with a bold title
 * over a faint description.
 *
 * Two row kinds:
 *   - default: bold title + faint description.
 *   - kind: "header" — mono uppercase eyebrow sitting on a hairline rule,
 *     used to introduce a group of body rows (e.g. "The 3 i's" above
 *     Integration / Inference / Intervention). No description.
 *
 * `desc` accepts ReactNode so descriptions can embed inline links or
 * other JSX (e.g. <a>, <em>) without falling back to dangerouslySetInnerHTML.
 */

import type { ReactNode } from "react";

type DetailRow = {
  title: string;
  desc?: ReactNode;
  kind?: "header";
};

export function DetailsList({ rows }: { rows: DetailRow[] }) {
  return (
    <ul className="grid gap-7 py-1">
      {rows.map((row, i) =>
        row.kind === "header" ? (
          <li key={i} className="-mb-1 border-b border-rule pb-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink">
              {row.title}
            </p>
          </li>
        ) : (
          <li key={i}>
            <p className="font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink">
              {row.title}
            </p>
            {row.desc != null && row.desc !== "" && (
              <p className="mt-3 text-[17px] leading-[1.55] tracking-[-0.005em] text-mute max-w-[60ch]">
                {row.desc}
              </p>
            )}
          </li>
        ),
      )}
    </ul>
  );
}
