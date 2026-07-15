"use client";

/**
 * AdoptionReach — a deck-only composition for the pitch deck's slide 6.
 *
 * It "mixes the globe thing with the team": the living Globe + the four
 * adoption figures (Downloads / Citations / Countries / Publications) on the
 * left, and the team (founder + advisors, photo + short description) on the
 * right. No lead paragraph — the numbers and the faces carry it.
 *
 * Reuses the same data (research-metrics.json + research-geo.json) and the
 * shared Globe, so the figures always match the site (both read the committed
 * research JSON). Team identity (name / role / photo) is imported from <Team>
 * so it never drifts; only the slide-length descriptions live here.
 *
 * Rendered standalone at /impact-embed and iframed by the deck.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import geoData from "@/data/research-geo.json";
import metricsData from "@/data/research-metrics.json";
import { useCountUp, fmtInt } from "@/lib/useCountUp";
import { FOUNDER, ADVISORS, type TeamPerson } from "@/components/Team";

const Globe = dynamic(() => import("./Globe").then((m) => m.Globe), {
  ssr: false,
});

const { people, tools } = metricsData;

type MetricDef = { value: number; label: string; plus?: boolean };
const METRICS: MetricDef[] = [
  { value: tools.downloads, label: "Downloads", plus: true },
  { value: people.citations, label: "Citations" },
  { value: geoData.citationCountryCount, label: "Countries" },
  { value: people.publications, label: "Publications" },
];

// Slide-length descriptions (condensed from the full site bios). Keyed by the
// name in <Team> so identity data stays single-sourced.
const SHORT_BIO: Record<string, string> = {
  "Dr Cyril Geismar":
    "Postdoctoral fellow; PhD in infectious-disease modelling (Imperial). Board member of the R Epidemics Consortium; teaches outbreak analytics at Emory and LSHTM.",
  "Dr Anne Cori":
    "Associate Professor in real-time outbreak analysis. Lead author of EpiEstim.",
  "Dr Thibaut Jombart":
    "Associate Professor in outbreak analytics and population genetics. Author of outbreaker; founder of the R Epidemics Consortium.",
};

export function AdoptionReach() {
  const globeBox = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(360);
  const [run, setRun] = useState(false);

  // Size the globe off its (measured) wrapper so it fills the left column
  // cleanly without overpowering the team.
  useEffect(() => {
    const el = globeBox.current;
    if (!el) return;
    const fit = () =>
      setSize(Math.max(260, Math.min(460, Math.round(el.clientWidth))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Count-ups start once mounted (the embed loads already in view).
  useEffect(() => {
    const id = requestAnimationFrame(() => setRun(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="container-page" aria-label="Adoption and team">
      {/* Rule 1 · section heading — verbatim from ImpactAdoption's own h2. */}
      <h2 className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
        Peer-reviewed science, adopted globally.
      </h2>

      <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        {/* ── LEFT · globe + adoption figures ── */}
        <div>
          <div ref={globeBox} className="mx-auto w-full max-w-[440px]">
            <div className="mx-auto" style={{ width: size, height: size }}>
              <Globe data={geoData} size={size} />
            </div>
          </div>

          <div className="mx-auto mt-9 grid max-w-[400px] grid-cols-2 gap-x-8 gap-y-6">
            {METRICS.map((m, i) => (
              <Metric key={m.label} metric={m} run={run} delay={i * 120} />
            ))}
          </div>
        </div>

        {/* ── RIGHT · the team behind the methods ── */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
            Founder
          </p>
          <div className="mt-4">
            <Person person={FOUNDER} desc={SHORT_BIO[FOUNDER.name]} />
          </div>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
            Advisors
          </p>
          <div className="mt-4 space-y-6">
            {ADVISORS.map((p) => (
              <Person key={p.name} person={p} desc={SHORT_BIO[p.name]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Metric({
  metric,
  run,
  delay,
}: {
  metric: MetricDef;
  run: boolean;
  delay: number;
}) {
  const v = useCountUp(metric.value, run, 1900, delay);
  return (
    <div
      style={{
        opacity: run ? 1 : 0,
        transition: `opacity 640ms var(--ease-nt) ${delay}ms`,
      }}
    >
      <div className="font-display font-normal leading-none tracking-tight tabular-nums text-ink text-[clamp(24px,2.6vw,34px)]">
        {fmtInt(v)}
        {metric.plus && <span className="text-mute">+</span>}
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
        {metric.label}
      </div>
    </div>
  );
}

function Person({ person, desc }: { person: TeamPerson; desc: string }) {
  return (
    <article className="flex items-start gap-4">
      <div className="relative aspect-square w-[92px] shrink-0 overflow-hidden bg-bg-tint">
        <Image
          src={`/${person.photo}`}
          alt={person.name}
          width={220}
          height={220}
          className="h-full w-full object-cover grayscale transition-[filter] duration-300 hover:grayscale-0"
        />
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-[16px] font-medium leading-tight tracking-[-0.015em] text-ink">
          {person.name}
        </h3>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
          {person.role}
        </p>
        {/* Rule 3 · body paragraph — same as the Team bio treatment. */}
        <p className="mt-2 text-[17px] leading-[1.55] tracking-[-0.005em] text-mute">
          {desc}
        </p>
      </div>
    </article>
  );
}
