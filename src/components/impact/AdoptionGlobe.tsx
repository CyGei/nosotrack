"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import geoData from "@/data/research-geo.json";
import metricsData from "@/data/research-metrics.json";
import { useInViewOnce } from "@/lib/hooks";
import { useCountUp, fmtInt } from "@/lib/useCountUp";

const Globe = dynamic(() => import("./Globe").then(m => m.Globe), { ssr: false });
export const ADOPTION_METRICS = [
  { value: metricsData.tools.downloads, label: "Downloads", plus: true },
  { value: metricsData.people.citations, label: "Citations" },
  { value: geoData.citationCountryCount, label: "Countries" },
  { value: metricsData.people.publications, label: "Publications" },
];
const ANGLES = [-36, -12, 12, 36];

/** The same responsive overview on the website and in both pitch decks. */
export function AdoptionGlobe({ onSelectMetric }: { onSelectMetric?: (label: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const run = useInViewOnce(box, { threshold: .1 });
  useEffect(() => {
    const element = box.current!;
    const measure = () => setWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const narrow = width < 520;
  const size = narrow ? Math.min(260, width || 260) : Math.min(320, width - 220);
  const radius = size / 2;
  return <div ref={box} className="w-full" aria-label="Global adoption">
    <div className="relative mx-auto" style={{ width: narrow ? "100%" : size + 220, minHeight: size }}>
      <div className={narrow ? "mx-auto" : ""} style={{ width: size, height: size }}>
        <Globe data={geoData} size={size} />
      </div>
      <div className={narrow ? "mt-7 grid grid-cols-2 gap-x-4 gap-y-6" : ""}>
        {ADOPTION_METRICS.map((metric, i) => {
          const angle = ANGLES[i] * Math.PI / 180;
          const content = <Metric metric={metric} run={run} delay={i * 120} />;
          const interactive = onSelectMetric && (metric.label === "Downloads" || metric.label === "Citations");
          return <div key={metric.label} className={narrow ? "text-center" : "absolute whitespace-nowrap"} style={narrow ? undefined : {
            left: radius + (radius + 72) * Math.cos(angle),
            top: radius + (radius + 72) * Math.sin(angle),
            transform: "translateY(-50%)",
          }}>
            {interactive ? <button type="button" onClick={() => onSelectMetric(metric.label)} aria-expanded={false}
              className="text-inherit outline-offset-4 hover:underline focus-visible:outline" aria-label={`${metric.label}: view breakdown`}>
              {content}
            </button> : content}
          </div>;
        })}
      </div>
    </div>
  </div>;
}

function Metric({ metric, run, delay }: { metric: typeof ADOPTION_METRICS[number]; run: boolean; delay: number }) {
  const value = useCountUp(metric.value, run, 1900, delay);
  return <>
    <div className="font-display font-normal leading-none tracking-tight tabular-nums text-ink text-[clamp(22px,2.4vw,32px)]">
      {fmtInt(value)}{metric.plus && <span className="text-mute">+</span>}
    </div>
    <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">{metric.label}</div>
  </>;
}
