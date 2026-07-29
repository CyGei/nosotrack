"use client";

/**
 * AdoptionReach — deck-only composition for the pitch deck's slide 6.
 *
 * Team on the LEFT (three aligned photos, each with name / position /
 * affiliation only), the living Globe with its adoption metrics arched off its
 * right on the RIGHT — mirroring the site's <ImpactAdoption> so the figures
 * (Downloads / Citations / Countries / Publications) always match the site and
 * sit BESIDE the globe (in view), not stacked below it where the iframe fold
 * would clip them.
 *
 * Team identity (name / role / photo / focus) is imported from <Team> so it
 * never drifts; only the per-person position titles live here.
 *
 * Rendered standalone at /impact-embed and iframed by the deck.
 */

import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "@/lib/hooks";
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

// Metrics arch off the globe's right edge — same treatment as ImpactAdoption.
const ARC_OFFSET = 84;
const AGG_ANGLES = [-36, -12, 12, 36];

// Position titles (deck-only). Keyed by the name in <Team> so identity data
// stays single-sourced; the affiliation comes from each person's `role`.
const POSITION: Record<string, string> = {
  "Dr Cyril Geismar": "Postdoctoral Research Fellow",
  "Dr Anne Cori": "Associate Professor",
  "Dr Thibaut Jombart": "Associate Professor",
};

const TITLE = "Peer-reviewed science, adopted globally.";

export function AdoptionReach() {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(280);
  const [run, setRun] = useState(false);

  // Scroll-triggered typewriter — same hook the About titles use, so the
  // embedded slide-6 heading types in like every other deck title. The
  // IntersectionObserver fires on mount when the lazy iframe scrolls in.
  const { ref: titleRef, fractional } = useScrollReveal<HTMLHeadingElement>(
    TITLE.length,
    32,
  );
  const headIndex = Math.min(TITLE.length, Math.ceil(fractional));
  const visibleChars = TITLE.slice(0, headIndex);
  const hiddenChars = TITLE.slice(headIndex);
  const isStarted = fractional > 0;
  const isDone = fractional >= TITLE.length;

  // Size the globe off its column so the arched metrics stay inside the track.
  // The `- 150` reserves room for the arc + figures to the globe's right.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () =>
      setSize(Math.max(230, Math.min(320, Math.round(el.clientWidth - 150))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setRun(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const R = size / 2;
  const Rm = R + ARC_OFFSET;
  const pos = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return {
      left: R + Rm * Math.cos(a),
      top: R + Rm * Math.sin(a),
      transform: "translateY(-50%)",
    };
  };

  return (
    <section className="container-page" aria-label="Adoption and team">
      <h2
        ref={titleRef}
        className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]"
      >
        {visibleChars.split("").map((c, i) => {
          const alpha = Math.max(0, Math.min(1, fractional - i));
          return (
            <span key={i} style={{ opacity: alpha }}>
              {c}
            </span>
          );
        })}
        {isStarted && !isDone && (
          <span className="typewriter-cursor" aria-hidden />
        )}
        {hiddenChars && (
          <span style={{ visibility: "hidden" }}>{hiddenChars}</span>
        )}
      </h2>

      <div className="mt-10 grid items-start gap-x-12 gap-y-12 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* ── LEFT · the team behind the methods ── */}
        <div className="grid grid-cols-3 items-start gap-x-6">
          {[FOUNDER, ...ADVISORS].map((p) => (
            <Person key={p.name} person={p} position={POSITION[p.name]} />
          ))}
        </div>

        {/* ── RIGHT · living globe + arched adoption metrics ── */}
        <div ref={box} className="relative flex justify-center lg:justify-end">
          <div
            className="relative"
            style={{ width: size + 168, height: size }}
          >
            <div
              className="absolute left-0 top-0"
              style={{ width: size, height: size }}
            >
              <Globe data={geoData} size={size} />
            </div>
            {METRICS.map((m, i) => (
              <div
                key={m.label}
                className="absolute whitespace-nowrap"
                style={pos(AGG_ANGLES[i])}
              >
                <Metric metric={m} run={run} delay={i * 120} />
              </div>
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
      {/* Site StatTally figure — arched size. */}
      <div className="font-display font-normal leading-none tracking-tight tabular-nums text-ink text-[clamp(22px,2.4vw,32px)]">
        {fmtInt(v)}
        {metric.plus && <span className="text-mute">+</span>}
      </div>
      <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
        {metric.label}
      </div>
    </div>
  );
}

function Person({
  person,
  position,
}: {
  person: TeamPerson;
  position: string;
}) {
  return (
    <article>
      <div className="relative aspect-square w-full overflow-hidden bg-bg-tint">
        <Image
          src={`/${person.photo}`}
          alt={person.name}
          width={320}
          height={320}
          className="h-full w-full object-cover grayscale"
          style={{ objectPosition: person.focus }}
        />
      </div>
      <h3 className="mt-3 font-display text-[16px] font-medium leading-tight tracking-[-0.015em] text-ink">
        {person.name}
      </h3>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mute [text-wrap:balance]">
        {position}
      </p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-mute [text-wrap:balance]">
        {person.role}
      </p>
    </article>
  );
}
