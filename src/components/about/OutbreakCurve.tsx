"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { useScrollReveal } from "@/lib/hooks";
import { fmtInt, useCountUp } from "@/lib/useCountUp";
import type { Outbreak } from "./outbreaks2026";

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthIndex(date: string) {
  const [y, m] = date.split("-").map(Number);
  return (y - 2025) * 12 + (m - 1);
}
function fullDate(date: string) {
  const [y, m] = date.split("-").map(Number);
  return `${MONTHS_FULL[m - 1]} ${y}`;
}
function shortPlace(country: string) {
  return country.includes(" & ") ? `${country.split(" & ")[0]} +` : country;
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Pt = { x: number; y: number };

// Catmull-Rom → cubic bézier; per-segment y is clamped so the cumulative series never dips.
function smoothPath(pts: Pt[]) {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const lo = Math.min(p1.y, p2.y);
    const hi = Math.max(p1.y, p2.y);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = clamp(p1.y + (p2.y - p0.y) / 6, lo, hi);
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = clamp(p2.y - (p3.y - p1.y) / 6, lo, hi);
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// viewBox is 0..100 in both axes (preserveAspectRatio="none").
const X0 = 12, X1 = 75, Y_TOP = 10, Y_BOT = 80, Y_AXIS = 87, QX = 88, QY = 3, MIN_DX = 2;
const HEIGHT = 430;

export function OutbreakCurve({ outbreaks }: { outbreaks: Outbreak[] }) {
  const ordered = [...outbreaks].sort(
    (a, b) => monthIndex(a.date) - monthIndex(b.date),
  );
  const n = ordered.length;
  const mis = ordered.map((o) => monthIndex(o.date));
  const minMI = Math.min(...mis);
  const maxMI = Math.max(...mis);
  const rawX = mis.map((mi) => X0 + ((mi - minMI) / (maxMI - minMI)) * (X1 - X0));

  // Strictly-increasing x so the spline never has to draw a vertical.
  const pts: Pt[] = [];
  let prevX = -Infinity;
  ordered.forEach((_, i) => {
    const x = Math.max(rawX[i], prevX + MIN_DX);
    prevX = x;
    pts.push({ x, y: Y_BOT - (i / (n - 1)) * (Y_BOT - Y_TOP) });
  });

  const sides: boolean[] = []; // true = label on the left
  ordered.forEach((_, i) => {
    if (i === 0) {
      sides.push(false);
      return;
    }
    const crowded = pts[i].x - pts[i - 1].x < 9;
    sides.push(crowded ? !sides[i - 1] : pts[i].x >= (X0 + X1) / 2);
  });

  const LABEL_GAP = 8.6;
  const REACH = 12; // approx label width in viewBox units
  const labelY: Record<number, number> = {};
  const placed: { x0: number; x1: number; y: number }[] = [];
  ordered
    .map((_, i) => i)
    .sort((a, b) => pts[a].y - pts[b].y)
    .forEach((i) => {
      const px = pts[i].x;
      const x0 = sides[i] ? px - REACH : px;
      const x1 = sides[i] ? px : px + REACH;
      let y = pts[i].y;
      // MUST stay bounded — an unbounded loop here once hung `next build`.
      for (let pass = 0; pass < placed.length + 2; pass++) {
        let bumped = false;
        for (const p of placed) {
          if (x1 > p.x0 && x0 < p.x1 && y < p.y + LABEL_GAP && y > p.y - LABEL_GAP) {
            y = p.y + LABEL_GAP;
            bumped = true;
          }
        }
        if (!bumped) break;
      }
      labelY[i] = y;
      placed.push({ x0, x1, y });
    });
  // The rising curve passes below a node on its left and above it on its right,
  // so labels must be biased away from the line or it strikes through them.
  const LINE_CLEAR = 4;
  ordered.forEach((_, i) => (labelY[i] += sides[i] ? -LINE_CLEAR : LINE_CLEAR));
  const over = Math.max(...Object.values(labelY)) - (Y_AXIS - 3);
  if (over > 0) Object.keys(labelY).forEach((k) => (labelY[+k] -= over));
  const under = 2 - Math.min(...Object.values(labelY));
  if (under > 0) Object.keys(labelY).forEach((k) => (labelY[+k] += under));

  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[n - 1].x.toFixed(2)} ${Y_AXIS} L ${pts[0].x.toFixed(2)} ${Y_AXIS} Z`;

  const a = pts[n - 2], b = pts[n - 1];
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const c1x = b.x + ((b.x - a.x) / len) * 9;
  const c1y = b.y + ((b.y - a.y) / len) * 9;
  const c2x = QX - (QX - b.x) * 0.45;
  const c2y = QY + (b.y - QY) * 0.35;
  const futurePath = `M ${b.x.toFixed(2)} ${b.y.toFixed(2)} C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${QX} ${QY}`;

  const monthX = (mi: number) => X0 + ((mi - minMI) / (maxMI - minMI)) * (X1 - X0);
  const boundaryX = clamp(monthX(12), X0, X1); // Jan 2026
  const monthMarks = [3, 6, 9, 15]
    .filter((mi) => mi > minMI && mi < maxMI)
    .map((mi) => ({ mi, x: monthX(mi), label: MONTH_ABBR[mi % 12] }));
  const year25X = (X0 + boundaryX) / 2;
  const year26X = (boundaryX + X1) / 2;

  const { ref, fractional } = useScrollReveal<HTMLDivElement>(n + 1, 6);
  const revealW = Math.min(100, (fractional / (n + 1)) * 100);

  const [openId, setOpenId] = useState<string | null>(null);
  const open = ordered.find((o) => o.id === openId) ?? null;
  const openIdx = open ? ordered.indexOf(open) : -1;
  const counted = useCountUp(open?.cases ?? 0, true, 900);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const cardBelow = open ? pts[openIdx].y < 56 : true;
  const anchorY = open ? (cardBelow ? pts[openIdx].y + 5 : pts[openIdx].y - 5) : 0;

  return (
    <div ref={ref} className="relative" style={{ height: HEIGHT }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="ocFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0" />
          </linearGradient>
          <clipPath id="ocReveal">
            <rect x="0" y="0" width={revealW} height="100" />
          </clipPath>
        </defs>

        <line
          x1={pts[0].x} y1={Y_AXIS} x2={QX} y2={Y_AXIS}
          stroke="var(--color-rule-strong)" strokeWidth="1.25" vectorEffect="non-scaling-stroke"
        />

        <g clipPath="url(#ocReveal)">
          <path d={areaPath} fill="url(#ocFill)" />
          <path
            d={linePath}
            fill="none" stroke="var(--color-ink)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
          />
          <path
            d={futurePath}
            fill="none" stroke="var(--color-ink)" strokeWidth="1.5"
            strokeDasharray="0.6 3" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          />
        </g>

      </svg>

      {ordered.map((o, i) => {
        const p = pts[i];
        const op = Math.max(0, Math.min(1, fractional - i));
        const isOpen = o.id === openId;
        const left = sides[i];
        const ly = labelY[i];
        return (
          <div key={o.id} style={{ opacity: op }}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : o.id)}
              className={`absolute flex -translate-y-1/2 flex-col whitespace-nowrap leading-tight ${left ? "-translate-x-full items-end pr-3.5 text-right" : "items-start pl-3.5"}`}
              style={{ left: `${p.x}%`, top: `${ly}%` }}
            >
              <span className="font-display text-[15px] font-normal leading-[1.1] tracking-[-0.01em] text-ink">
                {o.short}
              </span>
              <span className="text-[12.5px] leading-[1.2] text-mute">
                {shortPlace(o.country)}
              </span>
            </button>
            {isOpen && (
              <span
                aria-hidden
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-rule-strongest"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: 22, height: 22 }}
              />
            )}
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : o.id)}
              aria-label={`${o.short} — ${fullDate(o.date)}`}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: isOpen ? 15 : 8,
                height: isOpen ? 15 : 8,
                background: "var(--color-ink)",
              }}
            />
          </div>
        );
      })}

      <span
        aria-hidden
        className="absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink bg-bg font-display text-[22px] font-normal leading-none text-ink"
        style={{ left: `${QX}%`, top: `${QY}%`, opacity: Math.max(0, Math.min(1, fractional - (n - 1))) }}
      >
        ?
      </span>

      <div
        className="absolute w-px -translate-x-1/2 bg-rule"
        style={{ left: `${boundaryX}%`, top: `${Y_AXIS}%`, height: 40 }}
      />
      {monthMarks.map((m) => (
        <div
          key={m.mi}
          className="absolute -translate-x-1/2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-faint"
          style={{ left: `${m.x}%`, top: `calc(${Y_AXIS}% + 11px)` }}
        >
          {m.label}
        </div>
      ))}
      <span
        className="absolute -translate-x-1/2 font-display text-[clamp(15px,1.5vw,18px)] font-normal leading-none tracking-[0.01em] tabular-nums text-mute"
        style={{ left: `${year25X}%`, top: `calc(${Y_AXIS}% + 30px)` }}
      >
        2025
      </span>
      <span
        className="absolute -translate-x-1/2 font-display text-[clamp(15px,1.5vw,18px)] font-normal leading-none tracking-[0.01em] tabular-nums text-ink"
        style={{ left: `${year26X}%`, top: `calc(${Y_AXIS}% + 30px)` }}
      >
        2026
      </span>
      <span
        aria-hidden
        className="absolute -translate-y-1/2"
        style={{ left: `${QX}%`, top: `${Y_AXIS}%` }}
      >
        <svg width="8" height="11" viewBox="0 0 8 11" fill="none" className="-translate-x-px block">
          <path
            d="M1.5 1.5 L6.5 5.5 L1.5 9.5"
            stroke="var(--color-rule-strong)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {open && (
        <div
          className="animate-pop absolute z-40 w-[340px] max-w-full -translate-x-1/2 rounded-[12px] border border-rule-strongest bg-bg px-6 py-5 shadow-[0_10px_34px_-14px_rgba(30,30,43,0.28)]"
          style={{
            left: `clamp(170px, ${pts[openIdx].x}%, calc(100% - 170px))`,
            ...(cardBelow
              ? { top: `calc(${anchorY}% + 6px)` }
              : { top: `calc(${anchorY}% - 6px)`, transform: "translate(-50%, -100%)" }),
          }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-[20px] font-normal leading-none tracking-[-0.02em] text-ink">
              {open.short}
              <span className="ml-2 text-[13px] text-mute">{open.country}</span>
            </span>
            <button
              type="button"
              onClick={() => setOpenId(null)}
              aria-label="Close"
              className="-mr-1.5 -mt-1.5 shrink-0 rounded p-1 text-faint transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-[clamp(30px,3vw,40px)] font-normal leading-none tracking-[-0.03em] tabular-nums text-ink">
              {fmtInt(counted)}+
            </span>
            <span className="font-display text-[15px] font-normal leading-none tracking-[-0.01em] text-mute">
              cases
            </span>
            <span className="ml-auto self-center font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              {fullDate(open.date)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-y-2.5 border-t border-rule pt-3.5">
            {open.headlines.slice(0, 2).map((h) => (
              <a
                key={h.text}
                href={h.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start justify-between gap-2"
              >
                <span className="text-[12px] leading-[1.4] text-mute transition-colors group-hover:text-ink">
                  <span className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                    {h.outlet}
                  </span>
                  <span className="underline underline-offset-2 decoration-1">
                    {h.text}
                  </span>
                </span>
                <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 text-faint transition-colors group-hover:text-ink" />
              </a>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .animate-pop { animation: ocPop 200ms cubic-bezier(.2,0,0,1) both; }
        @keyframes ocPop { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .animate-pop { animation: none; } }
      `}</style>
    </div>
  );
}
