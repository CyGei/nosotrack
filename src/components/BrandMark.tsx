const SPIN_KEYFRAME = "heroBrandSpin";

export type BrandMarkProps = {
  className?: string;
  spinKey?: number;
  spinning?: boolean;
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
      <path d="M3 8 L3 3 L8 3" strokeWidth="1.2" />
      <path d="M24 3 L29 3 L29 8" strokeWidth="1.2" />
      <path d="M29 24 L29 29 L24 29" strokeWidth="1.2" />
      <path d="M8 29 L3 29 L3 24" strokeWidth="1.2" />

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
        {/* Signal core: hard-coded red, the one element that must not follow currentColor. */}
        <circle cx="16" cy="16.6" r="1.05" fill="#ff073a" stroke="none" />
      </g>
    </svg>
  );
}
