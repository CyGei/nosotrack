/**
 * Shared className for the clickable specimen tiles in the research section.
 * The ticker and the spotlight render the same viewer-in-a-button with an
 * identical hover/focus affordance — only the tile width differs.
 */
export function specimenButtonClass(width: string) {
  return [
    `group relative block ${width} cursor-pointer`,
    "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-alert)]",
    "border border-transparent transition-colors duration-200",
    "hover:border-[var(--color-alert)]/40",
    "focus-visible:border-[var(--color-alert)]/60",
  ].join(" ");
}
