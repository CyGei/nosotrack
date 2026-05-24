/**
 * DetailsList — feature list rendered inside the DETAILS tab.
 * Matches the AIP screenshot layout: tight rows with a bold title
 * over a faint description.
 */

export type DetailRow = {
  title: string;
  desc: string;
};

export function DetailsList({ rows }: { rows: DetailRow[] }) {
  return (
    <ul className="grid gap-7 py-1">
      {rows.map((row, i) => (
        <li key={i}>
          <p className="font-display text-[17px] font-semibold leading-tight text-ink">
            {row.title}
          </p>
          <p className="mt-2 text-[14px] leading-[1.55] text-mute max-w-[60ch]">
            {row.desc}
          </p>
        </li>
      ))}
    </ul>
  );
}
