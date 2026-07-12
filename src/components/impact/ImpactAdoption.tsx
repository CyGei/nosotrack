"use client";

/**
 * ImpactAdoption — the "Impact & adoption" section (id="impact"), between the
 * Research (pathogen) section and the Team section.
 *
 * One hero, everything supports it. The HERO is a living globe (see <Globe>):
 * evidence that the methods behind Nosotrack have real global reach. Below it,
 * a quiet supporting row of four figures gives the quantitative validation —
 * Downloads and Citations lead (what an investor grasps instantly), Papers and
 * Tools follow. A single live-data line closes it.
 *
 * Not a dashboard: the numbers no longer compete with each other or with the
 * globe. Every figure is live from src/data/research-metrics.json (metrics) and
 * src/data/research-geo.json (the citing/installing countries) — never
 * hand-edited.
 */

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import metricsData from "@/data/research-metrics.json";
import geoData from "@/data/research-geo.json";
import { useCountUp, fmtInt } from "@/lib/useCountUp";
import { useInViewOnce } from "@/lib/hooks";
import { Reveal } from "./Reveal";

const { people, tools } = metricsData;

// The globe (d3-geo + world-atlas topojson, ~150 KB) is below the fold and
// client-only, so it loads in its own lazy chunk — off the critical path.
const Globe = dynamic(() => import("./Globe").then((m) => m.Globe), {
  ssr: false,
});

export function ImpactAdoption() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [globeSize, setGlobeSize] = useState(460);

  // Start the count-ups once the globe zone is reached — or immediately if
  // the section already lazy-mounts on screen (mountCheck).
  const run = useInViewOnce(zoneRef, {
    rootMargin: "0px 0px -15% 0px",
    mountCheck: true,
  });

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const fit = () => setGlobeSize(Math.max(300, Math.min(520, el.clientWidth)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const countries = useCountUp(geoData.citationCountryCount, run, 1500, 200);

  return (
    <section
      id="impact"
      className="section-pad border-t border-rule bg-bg"
      aria-label="Impact and adoption"
    >
      <div className="container-page">
        <Reveal>
          <h2 className="max-w-[24ch] font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
            Built on globally adopted outbreak analytics.
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.7] text-text">
            The methods powering Nosotrack have become part of outbreak response
            worldwide.
          </p>
        </Reveal>

        {/* ── HERO: the living globe ──────────────────────────────────── */}
        <div
          ref={zoneRef}
          className="mt-14 flex flex-col items-center md:mt-20"
        >
          <div ref={fieldRef} className="w-full max-w-[520px]">
            <div className="mx-auto" style={{ width: globeSize, height: globeSize }}>
              <Globe data={geoData} size={globeSize} />
            </div>
          </div>

          <Reveal className="mt-4 flex flex-col items-center text-center">
            <p className="font-display leading-none tracking-tight text-ink tabular-nums text-[clamp(28px,3.2vw,44px)]">
              {fmtInt(countries)}{" "}
              <span className="font-normal text-mute">countries</span>
            </p>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-faint">
              Where researchers worldwide cite and download the open-source
              methods behind Nosotrack. Citations all-time; downloads over the
              past {geoData.downloadWindow.days} days.
            </p>
          </Reveal>
        </div>

        {/* ── SUPPORTING EVIDENCE: the four figures ───────────────────── */}
        <Reveal className="mt-16 border-t border-rule pt-12 md:mt-20">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
            <Metric value={tools.downloads} label="Downloads" run={run} startDelay={0} hero />
            <Metric value={people.citations} label="Citations" run={run} startDelay={120} hero />
            <Metric value={people.publications} label="Papers" run={run} startDelay={240} />
            <Metric value={tools.count} label="Tools" run={run} startDelay={360} />
          </div>
        </Reveal>

        <div className="mt-12 flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.02em] text-faint">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mute opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mute" />
          </span>
          Sourced live from OpenAlex and CRAN.
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Metric({
  value,
  label,
  run,
  startDelay,
  hero,
}: {
  value: number;
  label: string;
  run: boolean;
  startDelay: number;
  hero?: boolean;
}) {
  const v = useCountUp(value, run, hero ? 1900 : 1500, startDelay);
  return (
    <div className="group text-center transition-transform duration-300 ease-out hover:-translate-y-0.5">
      {/* Reserve the height and bottom-align, so every label lines up. */}
      <div className="flex h-[clamp(38px,4.6vw,66px)] items-end justify-center">
        <div className="font-display font-normal leading-none tracking-tight tabular-nums text-ink opacity-90 transition-opacity duration-300 group-hover:opacity-100 text-[clamp(38px,4.6vw,66px)]">
          {fmtInt(v)}
        </div>
      </div>
      <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
        {label}
      </div>
    </div>
  );
}
