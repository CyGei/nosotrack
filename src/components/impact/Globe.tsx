"use client";

import { useEffect, useRef, useState } from "react";
import {
  geoOrthographic,
  geoPath,
  geoGraticule10,
  geoDistance,
  geoInterpolate,
} from "d3-geo";
import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";
import { useReducedMotion } from "@/lib/hooks";

export type GeoCountry = {
  code: string;
  name: string;
  citations: number;
  downloads: number;
  lat: number;
  lon: number;
};
export type GeoData = {
  countries: GeoCountry[];
  maxCitations: number;
  citationCountryCount: number;
  downloadCountryCount: number;
  downloadWindow: { days: number; from: string; to: string; total: number };
};

const LAND = feature(
  worldTopo as never,
  (worldTopo as never as { objects: { countries: unknown } }).objects
    .countries as never,
);
const GRAT = geoGraticule10();
// rgb() triplet of --color-ink (#1e1e2b, globals.css) — keep in sync.
const INK = "30,30,43";
const fmt = (n: number) => n.toLocaleString("en-US");
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
type LL = [number, number];

export function Globe({
  data,
  size = 460,
  paused = false,
  className = "",
}: {
  data: GeoData;
  size?: number;
  paused?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [hover, setHover] = useState<{ c: GeoCountry; x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const { countries, maxCitations } = data;
    const projection = geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(size / 2 - 3)
      .clipAngle(90);
    const path = geoPath(projection, ctx);
    const dotR = (c: GeoCountry) =>
      1.4 + 4.6 * Math.sqrt((c.citations || c.downloads * 4) / maxCitations || 0);

    const byCit = [...countries].sort((a, b) => b.citations - a.citations);
    // Smallest-first, so the largest dots draw on top.
    const byCitAsc = [...countries].sort((a, b) => a.citations - b.citations);
    const appearAt = new Map<string, number>();
    byCit.forEach((c, i) => appearAt.set(c.code, Math.min(2500, i * 140)));

    const hub = countries.find((c) => c.code === "GB") ?? byCit[0];
    const arcs = byCit
      .filter((c) => c.code !== hub.code)
      .slice(0, 7)
      .map((d) => ({
        line: {
          type: "LineString" as const,
          coordinates: [
            [hub.lon, hub.lat],
            [d.lon, d.lat],
          ],
        },
        interp: geoInterpolate([hub.lon, hub.lat], [d.lon, d.lat]),
      }));
    const pulseCandidates = byCit.slice(0, 16);

    let placed: { c: GeoCountry; x: number; y: number; r: number }[] = [];

    function draw(spin: number, t: number, hoverCode: string | null) {
      if (!ctx) return;
      projection.rotate([spin, -18]);
      const rot = projection.rotate();
      const center: LL = [-rot[0], -rot[1]];
      const front = (ll: LL) => geoDistance(ll, center) < Math.PI / 2 - 0.02;

      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = `rgba(${INK},0.02)`;
      ctx.fill();
      ctx.beginPath();
      path(LAND);
      ctx.fillStyle = `rgba(${INK},0.05)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${INK},0.16)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.beginPath();
      path(GRAT);
      ctx.strokeStyle = `rgba(${INK},0.05)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = `rgba(${INK},0.2)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const arcA = clamp((t - 2000) / 900, 0, 1);
      if (arcA > 0) {
        ctx.strokeStyle = `rgba(${INK},${0.1 * arcA})`;
        ctx.lineWidth = 0.7;
        for (const a of arcs) {
          ctx.beginPath();
          path(a.line);
          ctx.stroke();
        }
        for (let i = 0; i < arcs.length; i++) {
          const p = (t / 3400 + i / arcs.length) % 1;
          const ll = arcs[i].interp(p) as LL;
          if (!front(ll)) continue;
          const pt = projection(ll);
          if (!pt) continue;
          const fade = Math.sin(p * Math.PI);
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${INK},${0.75 * fade * arcA})`;
          ctx.fill();
        }
      }

      placed = [];
      for (const c of byCitAsc) {
        const ll: LL = [c.lon, c.lat];
        if (!front(ll)) continue;
        const introA = clamp((t - (appearAt.get(c.code) ?? 0)) / 420, 0, 1);
        if (introA <= 0) continue;
        const pt = projection(ll);
        if (!pt) continue;
        const r = dotR(c);
        const hovered = hoverCode === c.code;
        const a =
          (0.32 + 0.55 * Math.min(1, c.citations / maxCitations)) * introA;
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], hovered ? r + 1.2 : r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${INK},${hovered ? 0.95 : a})`;
        ctx.fill();
        if (hovered) {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${INK},0.5)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        placed.push({ c, x: pt[0], y: pt[1], r });
      }

      for (const pl of pulses) {
        const age = t - pl.t;
        if (age < 0 || age > 1100) continue;
        const ll: LL = [pl.lon, pl.lat];
        if (!front(ll)) continue;
        const pt = projection(ll);
        if (!pt) continue;
        const k = age / 1100;
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 3 + k * 15, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${INK},${0.5 * (1 - k)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    let raf = 0;
    let spinBase = -15;
    let introStart: number | null = null;
    let hoverPaused = false;
    let inView = false;
    let hoverCode: string | null = null;
    let last = 0;
    let lastDraw = 0;
    let pulses: { lon: number; lat: number; t: number }[] = [];
    let nextPulse = 3000;
    let pulseIdx = 0;

    const scrollNudge = () => {
      const el = wrapRef.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      return clamp(1 - (r.top + r.height / 2) / vh, 0, 1) * 16; // up to ~16°
    };

    const setInView = (v: boolean) => {
      inView = v;
      if (v && introStart === null) introStart = performance.now();
    };
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0,
      rootMargin: "0px 0px -10% 0px",
    });
    if (wrapRef.current) {
      io.observe(wrapRef.current);
      // Lazy-loaded, so it can mount already on screen: start the intro now.
      const r = wrapRef.current.getBoundingClientRect();
      if (r.top < (window.innerHeight || 0) && r.bottom > 0) setInView(true);
    }

    const paintStatic = () => draw(spinBase, 1e9, hoverCode);

    if (reduce) {
      paintStatic();
    } else {
      draw(spinBase, 0, null);
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (!inView) {
          last = now;
          return;
        }
        if (now - lastDraw < 40) return; // ~25 fps
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        lastDraw = now;
        if (!hoverPaused && !pausedRef.current) spinBase += dt * 6; // one turn / 60s
        const t = introStart === null ? 0 : now - introStart;
        if (t > nextPulse) {
          const c = pulseCandidates[pulseIdx++ % pulseCandidates.length];
          pulses.push({ lon: c.lon, lat: c.lat, t });
          pulses = pulses.filter((p) => t - p.t < 1100);
          nextPulse = t + 2200;
        }
        draw(spinBase + scrollNudge(), t, hoverCode);
      };
      raf = requestAnimationFrame(tick);
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let best: (typeof placed)[number] | null = null;
      let bestD = Infinity;
      for (const d of placed) {
        const dist = Math.hypot(d.x - mx, d.y - my);
        if (dist < Math.max(d.r + 6, 10) && dist < bestD) {
          bestD = dist;
          best = d;
        }
      }
      const prev = hoverCode;
      if (best) {
        hoverPaused = true;
        hoverCode = best.c.code;
        setHover({ c: best.c, x: best.x, y: best.y });
        canvas.style.cursor = "pointer";
      } else {
        hoverPaused = false;
        hoverCode = null;
        setHover(null);
        canvas.style.cursor = "default";
      }
      if (reduce && prev !== hoverCode) paintStatic();
    };
    const onLeave = () => {
      hoverPaused = false;
      hoverCode = null;
      setHover(null);
      if (reduce) paintStatic();
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [data, size, reduce]);

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, display: "block" }}
        role="img"
        aria-label={`Globe: the tools are cited from ${data.citationCountryCount} countries and downloaded in ${data.downloadCountryCount} in 2025`}
      />
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border border-rule bg-bg/95 px-3 py-2 backdrop-blur-sm"
          style={{ left: hover.x, top: hover.y - 12 }}
        >
          <div className="font-display text-[14px] leading-none text-ink">
            {hover.c.name}
          </div>
          <div className="mt-1.5 space-y-0.5 font-mono text-[11px] leading-relaxed text-mute">
            <div>
              <span className="text-ink tabular-nums">
                {fmt(hover.c.citations)}
              </span>{" "}
              citation{hover.c.citations === 1 ? "" : "s"}{" "}
              <span className="text-faint">· all-time</span>
            </div>
            {hover.c.downloads > 0 && (
              <div>
                <span className="text-ink tabular-nums">
                  {fmt(hover.c.downloads)}
                </span>{" "}
                download{hover.c.downloads === 1 ? "" : "s"}{" "}
                <span className="text-faint">
                  · in 2025
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <ol className="sr-only">
        {data.countries.slice(0, 12).map((c) => (
          <li key={c.code}>
            {c.name}: {fmt(c.citations)} citing works
            {c.downloads > 0
              ? `, ${fmt(c.downloads)} downloads in 2025`
              : ""}
          </li>
        ))}
      </ol>
    </div>
  );
}
