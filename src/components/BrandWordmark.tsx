/**
 * BrandWordmark — the canonical Nosotrack lockup, ported verbatim from
 * main branch legacy/styles.css `.brand`, `.brand-track`, `.brand-tm`
 * and the brandify() helper in content-loader.js.
 *
 * Structure:
 *   <span.brand>
 *     NOSO
 *     <span.brand-track>TRACK</span>   ← always rendered in --alert red
 *   </span.brand>
 *   <sup.brand-tm>™</sup>              ← tiny superscript trademark
 *
 * The component renders em-relative sizes so the parent's font-size
 * controls the overall scale:
 *   - Nav parent  17 px → "Nosotrack" ≈ 16 px, ™ ≈ 9 px
 *   - Footer parent 16 px → "Nosotrack" ≈ 15 px, ™ ≈ 9 px
 *
 * "Track" always uses --color-alert (red is reserved for outbreak signal,
 * but the brand chrome is the one exception per the main DESIGN_BRIEF).
 * Other colour comes from the parent's currentColor, so the wordmark
 * inverts cleanly between cream-over-hero and ink-over-light themes.
 */

export function BrandWordmark() {
  return (
    <>
      <span className="whitespace-nowrap font-mono text-[0.94em] font-medium tracking-[-0.02em]">
        NOSO<span className="text-alert">TRACK</span>
      </span>
      <sup
        aria-label="trademark"
        className="ml-[0.15em] align-super font-mono text-[0.55em] font-medium leading-[0] tracking-normal opacity-70"
      >
        ™
      </sup>
    </>
  );
}
