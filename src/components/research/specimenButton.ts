export function specimenButtonClass(width: string) {
  return [
    `group relative block ${width} cursor-pointer`,
    "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-alert)]",
    "border border-transparent transition-colors duration-200",
    "hover:border-[var(--color-alert)]/40",
    "focus-visible:border-[var(--color-alert)]/60",
  ].join(" ");
}
