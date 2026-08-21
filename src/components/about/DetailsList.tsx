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
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
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
