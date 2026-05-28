/**
 * BrandMark — the canonical NosoTrack icon, ported verbatim from the
 * original SVG that previously lived inline in Nav / Footer / SceneBrand.
 *
 * Structure:
 *   - Four corner brackets — the static "frame" (live OUTSIDE the
 *     animated group so they never move).
 *   - <g class="brand-mark-network"> — the inner triangle of dots-and-
 *     spokes. This is what the nav/footer rotate on hover (see globals.css)
 *     and what the hero spins on entry via the `heroBrandSpin` keyframe.
 *   - One red core circle pinned at the SVG centre (16, 16.6) — the
 *     "signal" dot. Hard-coded `#ff073a` because it's the single element
 *     that must stay red regardless of the ambient `currentColor`.
 *
 * Colour: the frame + network inherit `currentColor`, so the icon flips
 * between cream/ink themes via Tailwind text utilities on the parent
 * (e.g. `text-inv-hi`, `text-ink`). No need for theme-aware props.
 *
 * Animation:
 *   - Default usage (Nav / Footer): no `spinKey`. CSS hover transitions
 *     in globals.css drive the rotation.
 *   - Hero brand frame: pass `spinKey` (bumps on scene-enter) and
 *     `spinning=true` to trigger the one-time `heroBrandSpin` keyframe.
 *     The `key` on the wrapping `<g>` re-mounts it so the CSS animation
 *     replays cleanly on every re-entry.
 */

const SPIN_KEYFRAME = "heroBrandSpin";

export type BrandMarkProps = {
  /** Tailwind classes for sizing + colour. Required — the icon has no
   *  intrinsic size. */
  className?: string;
  /** Bump this number to replay the entrance spin. Required when
   *  `spinning` is true; ignored otherwise. */
  spinKey?: number;
  /** When true and a `spinKey` is provided, runs the one-time
   *  `heroBrandSpin` animation. Used by SceneBrand only. */
  spinning?: boolean;
  /** Duration of the entrance spin in ms. Default 1600 — matches
   *  `SPIN_MS` in SceneBrand. */
  spinDurationMs?: number;
};

export function BrandMark({
  className = "",
  spinKey,
  spinning = false,
  spinDurationMs = 1600,
}: BrandMarkProps) {
  const networkStyle =
    spinning && spinKey !== undefined
      ? {
          transformOrigin: "16px 16px",
          animation: `${SPIN_KEYFRAME} ${spinDurationMs}ms var(--ease-nt) both`,
        }
      : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      className={className}
      aria-hidden
    >
      {/* Corner brackets — static frame. */}
      <path d="M3 8 L3 3 L8 3" strokeWidth="1.2" />
      <path d="M24 3 L29 3 L29 8" strokeWidth="1.2" />
      <path d="M29 24 L29 29 L24 29" strokeWidth="1.2" />
      <path d="M8 29 L3 29 L3 24" strokeWidth="1.2" />

      {/* Inner network — rotates on hover (via .brand-mark-network in
          globals.css) and on entrance (via heroBrandSpin when spinning). */}
      <g
        key={spinKey}
        className="brand-mark-network"
        strokeLinecap="round"
        style={networkStyle}
      >
        <line x1="16.00" y1="11.20" x2="16.00" y2="15.60" strokeWidth="0.55" />
        <line x1="11.31" y1="19.30" x2="15.13" y2="17.10" strokeWidth="0.55" />
        <line x1="20.69" y1="19.30" x2="16.87" y2="17.10" strokeWidth="0.55" />
        <circle cx="16" cy="9" r="2.2" strokeWidth="0.35" />
        <circle cx="9.4" cy="20.4" r="2.2" strokeWidth="0.35" />
        <circle cx="22.6" cy="20.4" r="2.2" strokeWidth="0.35" />
        {/* Red signal core — stays red regardless of currentColor. */}
        <circle cx="16" cy="16.6" r="1.05" fill="#ff073a" stroke="none" />
      </g>
    </svg>
  );
}
