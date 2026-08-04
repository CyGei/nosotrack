"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import metricsData from "@/data/research-metrics.json";
import geoData from "@/data/research-geo.json";
import { useCountUp, fmtInt } from "@/lib/useCountUp";
import { useInViewOnce, useMediaQuery } from "@/lib/hooks";
import { Reveal } from "./Reveal";

const { people, tools } = metricsData;

const Globe = dynamic(() => import("./Globe").then((m) => m.Globe), {
  ssr: false,
});

type Pkg = { name: string; value: number };
const byValueDesc = (a: Pkg, b: Pkg) => b.value - a.value;

const DOWNLOAD_PKGS: Pkg[] = metricsData.packages
  .filter((p) => (p.downloads ?? 0) > 0)
  .map((p) => ({ name: p.name, value: p.downloads ?? 0 }))
  .sort(byValueDesc);
const CITATION_PKGS: Pkg[] = metricsData.packages
  .filter((p) => (p.citations ?? 0) > 0)
  .map((p) => ({ name: p.name, value: p.citations ?? 0 }))
  .sort(byValueDesc);

type Breakdown = {
  pkgs: Pkg[];
  unit: string;
  caption: string;
  eyebrow: string;
  blurb: string;
};
type MetricDef = {
  value: number;
  label: string;
  plus?: boolean;
  breakdown?: Breakdown;
};
const METRICS: MetricDef[] = [
  {
    value: tools.downloads,
    label: "Downloads",
    plus: true,
    breakdown: {
      pkgs: DOWNLOAD_PKGS,
      unit: "Downloads",
      caption: "CRAN downloads of our open-source R packages",
      eyebrow: "Software Downloads",
      blurb:
        "Each count is a download of one of our open-source R packages from CRAN, the Comprehensive R Archive Network. Figures come straight from the RStudio mirror logs.",
    },
  },
  {
    value: people.citations,
    label: "Citations",
    breakdown: {
      pkgs: CITATION_PKGS,
      unit: "Cited",
      caption: "Peer-reviewed papers that cite our methods",
      eyebrow: "citations",
      blurb:
      "Peer-reviewed publications citing the team's research, identified through OpenAlex. The headline captures the collective impact of the full research portfolio, while the breakdown highlights citations to the foundational papers behind Nosotrack's core methods."
    },
  },
  { value: geoData.citationCountryCount, label: "Countries" },
  { value: people.publications, label: "Publications" },
];

const ARC_OFFSET = 82;
const AGG_ANGLES = [-36, -12, 12, 36];
const arc = (n: number, maxA = 40) =>
  Array.from({ length: n }, (_, i) =>
    n === 1 ? 0 : -maxA + (2 * maxA * i) / (n - 1),
  );

export function ImpactAdoption() {
  const reachRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [globeSize, setGlobeSize] = useState(340);
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const wide = useMediaQuery("(min-width: 1100px)");

  const run = useInViewOnce(reachRef, {
    rootMargin: "0px 0px -15% 0px",
    mountCheck: true,
  });

  // `- 250` reserves room for the arc + figures to the globe's right.
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      setGlobeSize(
        wide
          ? Math.max(300, Math.min(380, Math.round(w - 250)))
          : Math.max(280, Math.min(440, w)),
      );
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  const close = useCallback(() => setOpenLabel(null), []);
  useEffect(() => {
    if (!openLabel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openLabel, close]);

  const open = METRICS.find((m) => m.label === openLabel)?.breakdown ?? null;
  // Keep the last breakdown mounted so its text survives the closing fade.
  const lastBreakdown = useRef<Breakdown | null>(open);
  if (open) lastBreakdown.current = open;
  const para = open ?? lastBreakdown.current;

  // px from the stage's left edge; globe centre = (R, R).
  const R = globeSize / 2;
  const Rm = R + ARC_OFFSET;
  const pos = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return {
      left: R + Rm * Math.cos(a),
      top: R + Rm * Math.sin(a),
      transform: "translateY(-50%)",
    };
  };
  const dlAngles = arc(DOWNLOAD_PKGS.length);
  const ciAngles = arc(CITATION_PKGS.length);

  const backArrow = openLabel && <BackArrow onClick={close} />;
  const caption = open ? open.caption : "";

  const globeStage = (
    <div className="relative" style={{ height: globeSize }}>
      <div
        className="absolute left-0 top-0"
        style={{ width: globeSize, height: globeSize }}
      >
        <Globe data={geoData} size={globeSize} />
        {backArrow}
      </div>

      {METRICS.map((m, i) => (
        <div
          key={m.label}
          className="absolute transition-opacity duration-[var(--transition-duration-base)]"
          style={{
            ...pos(AGG_ANGLES[i]),
            opacity: openLabel ? 0 : 1,
            pointerEvents: openLabel ? "none" : "auto",
          }}
        >
          {m.breakdown ? (
            <button
              type="button"
              onClick={() => setOpenLabel(m.label)}
              aria-expanded={openLabel === m.label}
              className="group block text-left outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              <Metric metric={m} run={run} delay={i * 120} arched trigger />
            </button>
          ) : (
            <Metric metric={m} run={run} delay={i * 120} arched />
          )}
        </div>
      ))}

      {DOWNLOAD_PKGS.map((p, i) => (
        <div
          key={`dl-${p.name}`}
          className="absolute transition-opacity duration-[var(--transition-duration-base)]"
          style={{
            ...pos(dlAngles[i]),
            opacity: openLabel === "Downloads" ? 1 : 0,
            pointerEvents: openLabel === "Downloads" ? "auto" : "none",
            transitionDelay: openLabel === "Downloads" ? `${i * 55}ms` : "0ms",
          }}
        >
          <PackageMetric
            pkg={p}
            unit="Downloads"
            run={openLabel === "Downloads"}
            delay={i * 70}
          />
        </div>
      ))}

      {CITATION_PKGS.map((p, i) => (
        <div
          key={`ci-${p.name}`}
          className="absolute transition-opacity duration-[var(--transition-duration-base)]"
          style={{
            ...pos(ciAngles[i]),
            opacity: openLabel === "Citations" ? 1 : 0,
            pointerEvents: openLabel === "Citations" ? "auto" : "none",
            transitionDelay: openLabel === "Citations" ? `${i * 55}ms` : "0ms",
          }}
        >
          <PackageMetric
            pkg={p}
            unit="Cited"
            run={openLabel === "Citations"}
            delay={i * 70}
          />
        </div>
      ))}
    </div>
  );

  return (
    <section
      id="impact"
      className="scroll-mt-28 bg-bg pb-[var(--spacing-section)]"
      aria-label="Impact and adoption"
    >
      <div className="container-page">
        <Reveal>
          <h2 className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
            Peer-reviewed science, adopted globally.
          </h2>
        </Reveal>

        <Reveal className="mt-12 md:mt-16">
          <div ref={reachRef}>
            {wide ? (
              <div
                className="grid items-center gap-12"
                style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)" }}
              >
                <TextSwap open={open} para={para} />

                <div ref={measureRef} className="relative">
                  {globeStage}
                  <div
                    className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-faint"
                    style={{ width: globeSize }}
                  >
                    {caption}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <LeadCopy />

                <div ref={measureRef}>
                  <div
                    className="relative mx-auto"
                    style={{ width: globeSize, height: globeSize }}
                  >
                    <Globe data={geoData} size={globeSize} />
                    {backArrow}
                  </div>

                  {open && (
                    <div className="mt-10">
                      <Methodology para={open} />
                    </div>
                  )}

                  {open ? (
                    <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8">
                      {open.pkgs.map((p, i) => (
                        <PackageMetric
                          key={p.name}
                          pkg={p}
                          unit={open.unit}
                          run
                          delay={i * 70}
                          centered
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9">
                      {METRICS.map((m, i) =>
                        m.breakdown ? (
                          <button
                            key={m.label}
                            type="button"
                            onClick={() => setOpenLabel(m.label)}
                            className="group outline-none focus-visible:ring-1 focus-visible:ring-ink"
                          >
                            <Metric metric={m} run={run} delay={i * 120} trigger />
                          </button>
                        ) : (
                          <div key={m.label}>
                            <Metric metric={m} run={run} delay={i * 120} />
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <div className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                    {caption}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LeadCopy() {
  return (
    <div className="space-y-5 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink text-justify hyphens-auto [text-wrap:pretty]">
      <p>
        Built on over a decade of peer-reviewed methodological research by our team and collaborators. 
        Its inference engine is grounded in scientifically validated methods that have become part of the standard toolkit for outbreak response worldwide.
      </p>
      <p>
        These methods have supported real-world outbreak investigations by hospitals, research
        institutions and public health agencies, including SARS-CoV-2 nosocomial
        outbreaks in Switzerland and the UK, <em>Klebsiella pneumoniae</em> in a
        Nepali neonatal unit, vancomycin-resistant <em>Enterococcus faecium</em>{" "}
        in an Australian tertiary hospital, multidrug-resistant{" "}
        <em>Acinetobacter baumannii</em> at a burn centre in North Carolina, and
        Ebola in Guinea.
      </p>
    </div>
  );
}

function Methodology({ para }: { para: Breakdown }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
        {para.eyebrow}
      </div>
      <p className="mt-5 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink">
        {para.blurb}
      </p>
    </div>
  );
}

function TextSwap({
  open,
  para,
}: {
  open: Breakdown | null;
  para: Breakdown | null;
}) {
  return (
    <div className="relative">
      <div
        className="transition-opacity duration-[var(--transition-duration-base)]"
        style={{ opacity: open ? 0 : 1, pointerEvents: open ? "none" : "auto" }}
        aria-hidden={open ? true : undefined}
      >
        <LeadCopy />
      </div>
      <div
        className="absolute inset-0 flex flex-col justify-center transition-opacity duration-[var(--transition-duration-base)]"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        aria-hidden={open ? undefined : true}
      >
        {para && <Methodology para={para} />}
      </div>
    </div>
  );
}

function BackArrow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back to totals"
      className="absolute left-0 top-0 z-20 flex h-9 w-9 items-center justify-center text-mute outline-none transition-colors hover:text-ink focus-visible:ring-1 focus-visible:ring-ink"
    >
      <svg width="21" height="14" viewBox="0 0 22 14" fill="none" aria-hidden>
        <path
          d="M7.5 1 L1 7 L7.5 13 M1 7 H21"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Metric({
  metric,
  run,
  delay,
  arched,
  trigger,
}: {
  metric: MetricDef;
  run: boolean;
  delay: number;
  arched?: boolean;
  trigger?: boolean;
}) {
  const v = useCountUp(metric.value, run, 1900, delay);
  return (
    <div
      className={arched ? "whitespace-nowrap text-left" : "text-center"}
      style={{
        opacity: run ? 1 : 0,
        transition: `opacity 640ms var(--ease-nt) ${delay}ms`,
      }}
    >
      <div
        className={`relative inline-block font-display font-normal leading-none tracking-tight tabular-nums text-ink ${arched
            ? "text-[clamp(24px,2.6vw,34px)]"
            : "text-[clamp(30px,4.6vw,44px)]"
          }`}
      >
        {fmtInt(v)}
        {metric.plus && <span className="text-mute">+</span>}
        {trigger && (
          <span
            aria-hidden
            className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-[width] duration-[var(--transition-duration-base)] ease-[var(--ease-nt)] group-hover:w-full"
          />
        )}
      </div>
      <div
        className={`mt-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-mute ${arched ? "" : "justify-center"
          }`}
      >
        {metric.label}
        {trigger && (
          <svg
            aria-hidden
            width="9"
            height="9"
            viewBox="0 0 10 10"
            className="text-faint transition-colors group-hover:text-ink"
          >
            <path
              d="M2 3.5 L5 6.5 L8 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

function PackageMetric({
  pkg,
  unit,
  run,
  delay,
  centered,
}: {
  pkg: Pkg;
  unit: string;
  run: boolean;
  delay: number;
  centered?: boolean;
}) {
  const v = useCountUp(pkg.value, run, 1500, delay);
  return (
    <div className={centered ? "text-center" : "whitespace-nowrap text-left"}>
      <div className="font-mono text-[14px] leading-none text-ink">{pkg.name}</div>
      <div className="mt-1.5 font-display text-[clamp(19px,2.2vw,26px)] font-normal leading-none tracking-tight tabular-nums text-ink">
        {fmtInt(v)}
      </div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        {unit}
      </div>
    </div>
  );
}
