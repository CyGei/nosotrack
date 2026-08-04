"use client";

const CAPABILITIES = [
  "Outbreak Forensics",
  "Contact Tracing",
  "Genomic Surveillance",
  "Case Detection",
  "Superspreader Detection",
  "Importation Events Detection",
  "Infection Prevention & Control",
];

export function Marquee() {
  // Duplicated so the -50% translate keyframe loops seamlessly.
  const items = [...CAPABILITIES, ...CAPABILITIES];

  return (
    <section
      aria-label="Capabilities"
      className="overflow-hidden border-y border-rule bg-bg"
    >
      <div className="marquee-track flex items-center gap-16 whitespace-nowrap py-6">
        {items.map((label, i) => (
          <span
            key={i}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            {label}
          </span>
        ))}
      </div>

      <style>{`
        .marquee-track {
          width: max-content;
          animation: marquee-scroll 52s linear infinite;
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
