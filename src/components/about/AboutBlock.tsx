"use client";

/**
 * AboutBlock — Palantir AIP block with optional VIDEO | DETAILS switch.
 *
 * Layout matches the AIP reference:
 *   [0.1] ─ 0.2 ─ 0.3
 *
 *   ┌────────────────────┐  Subtitle paragraph …
 *   │ Huge display title │
 *   │ on the LEFT        │  ╭─ VIDEO ─╮ ╭ DETAILS ╮      ← switch (when video present)
 *   │ (col-span-5)       │  ╰─────────╯ ╰─────────╯
 *   └────────────────────┘  ┌───────────────────────────┐
 *                           │ active panel content      │
 *                           │ (rounded border, padding) │
 *                           └───────────────────────────┘
 *
 * If `video` is omitted, the switch is hidden and the details panel
 * renders directly — used for the Problem block where there's nothing
 * to animate.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type StepNumber = "0.1" | "0.2" | "0.3";

const ALL_STEPS: StepNumber[] = ["0.1", "0.2", "0.3"];

type Tab = "video" | "details";

export function AboutBlock({
  id,
  title,
  subtitle,
  video,
  details,
}: {
  id: StepNumber;
  title: string;
  subtitle?: string;
  /** Omit to render the details panel directly with no Video/Details switch. */
  video?: React.ReactNode;
  details: React.ReactNode;
}) {
  const hasVideo = video != null;
  const [tab, setTab] = useState<Tab>(hasVideo ? "video" : "details");

  // Trigger-on-entry typewriter — fires once when the title scrolls into
  // view, then types at a fixed pace. The rAF loop drives a fractional
  // character count from elapsed-since-start, so the rendered alphas vary
  // smoothly even inside a single character (per-char fade window = 1).
  // IntersectionObserver disconnects after first hit so the animation
  // never repeats on re-scroll.
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [fractional, setFractional] = useState(0);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const CPS = 32; // characters per second — relaxed, elegant pace
    let raf = 0;
    let started = false;
    let startTs = 0;

    const animate = (now: number) => {
      if (!startTs) startTs = now;
      const elapsedSec = (now - startTs) / 1000;
      const next = Math.min(title.length, elapsedSec * CPS);
      setFractional(next);
      if (next < title.length) {
        raf = requestAnimationFrame(animate);
      }
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          raf = requestAnimationFrame(animate);
          obs.disconnect();
        }
      },
      // Fire when the title is comfortably inside the viewport (not when
      // just its bottom pixel pokes in).
      { rootMargin: "0px 0px -18% 0px", threshold: 0 },
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [title]);

  // Each char fades in over a 1-char-wide window of `fractional`, so the
  // leading edge is a soft fade instead of a hard step.
  const headIndex = Math.min(title.length, Math.ceil(fractional));
  const visibleChars = title.slice(0, headIndex);
  const hiddenChars = title.slice(headIndex);
  const isStarted = fractional > 0;
  const isDone = fractional >= title.length;

  return (
    <article>
      <div className="container-page section-pad">
        <StepIndicator activeId={id} />

        <div className="mt-14 grid grid-cols-12 gap-x-8 gap-y-10">
          {/* LEFT — title (typed in lockstep with scroll position) */}
          <div className="col-span-12 md:col-span-5">
            <h2
              ref={titleRef}
              className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)] max-w-[14ch]"
            >
              {visibleChars.split("").map((c, i) => {
                // Linear per-char alpha; the chase-easing on `progress`
                // is what gives the overall motion its smoothness.
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
                // Invisible tail — reserves the final heading height so
                // there's no layout shift as text appears.
                <span style={{ visibility: "hidden" }}>{hiddenChars}</span>
              )}
            </h2>
          </div>

          {/* RIGHT — subtitle + (switch) + content panel */}
          <div className="col-span-12 md:col-span-7">
            {subtitle && (
              <p className="font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink max-w-[55ch]">
                {subtitle}
              </p>
            )}

            {hasVideo && (
              <Switch
                tab={tab}
                onChange={setTab}
                className={subtitle ? "mt-7" : "mt-0"}
              />
            )}

            <div
              className={cn(
                "rounded-[14px] border border-rule-strongest bg-bg overflow-hidden",
                hasVideo ? "mt-6" : subtitle ? "mt-8" : "mt-0",
              )}
            >
              <div
                key={hasVideo ? tab : "details"}
                className="animate-tab-in p-4 lg:p-6"
                aria-live="polite"
              >
                {hasVideo && tab === "video" ? video : details}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped fade-in for the swapping panel content */}
      <style>{`
        @keyframes tabIn {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-tab-in { animation: tabIn 220ms cubic-bezier(.2,0,0,1) both; }
      `}</style>
    </article>
  );
}

/* -------------------------------------------------------------------------- */

function StepIndicator({ activeId }: { activeId: StepNumber }) {
  // Scroll-triggered reveal — mirrors the title typewriter so the
  // indicator and title feel like a single staged motion. Each step
  // label fades in char-by-char and each separator rule "draws" from
  // left to right via scaleX on the same fractional clock.
  const ref = useRef<HTMLOListElement>(null);
  const [fractional, setFractional] = useState(0);

  // Pre-render labels (active gets square brackets), then compute each
  // step's start offset in the reveal sequence:
  //   step0_chars · 1-unit separator · step1_chars · 1-unit separator · step2_chars
  const stepLabels = ALL_STEPS.map((s) => (s === activeId ? `[${s}]` : s));
  const lengths = stepLabels.map((l) => l.length);
  const stepStarts = lengths.reduce<number[]>((acc, len, i) => {
    const prevEnd = i === 0 ? 0 : acc[i - 1] + lengths[i - 1] + 1; // +1 for sep
    acc.push(prevEnd);
    return acc;
  }, []);
  const total = lengths.reduce((a, b) => a + b, 0) + (ALL_STEPS.length - 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const CPS = 40; // slightly snappier than the title (32 cps)
    let raf = 0;
    let started = false;
    let startTs = 0;

    const animate = (now: number) => {
      if (!startTs) startTs = now;
      const elapsedSec = (now - startTs) / 1000;
      const next = Math.min(total, elapsedSec * CPS);
      setFractional(next);
      if (next < total) raf = requestAnimationFrame(animate);
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          raf = requestAnimationFrame(animate);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0 },
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [total]);

  return (
    <ol
      ref={ref}
      className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.18em] text-faint"
    >
      {ALL_STEPS.map((s, i) => {
        const isActive = s === activeId;
        const label = stepLabels[i];
        const start = stepStarts[i];
        const sepAlpha =
          i > 0 ? Math.max(0, Math.min(1, fractional - (start - 1))) : 1;

        return (
          <li key={s} className="flex items-center gap-3">
            {i > 0 && (
              <span
                className="h-px w-12 bg-rule-strong md:w-16"
                aria-hidden
                style={{
                  opacity: sepAlpha,
                  transform: `scaleX(${sepAlpha})`,
                  transformOrigin: "left center",
                }}
              />
            )}
            <span
              className={cn(
                "transition-colors",
                isActive ? "text-ink" : "text-faint",
              )}
            >
              {label.split("").map((c, ci) => {
                const alpha = Math.max(
                  0,
                  Math.min(1, fractional - (start + ci)),
                );
                return (
                  <span key={ci} style={{ opacity: alpha }}>
                    {c}
                  </span>
                );
              })}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Switch — single pill with a sliding dark thumb (segmented toggle).         */
/* -------------------------------------------------------------------------- */

function Switch({
  tab,
  onChange,
  className,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  className?: string;
}) {
  // Everything visual is inline-styled to bypass tailwind-merge collapsing
  // arbitrary-value classes like text-[10px] + text-[#efeeef] into the same
  // group. Only positioning/layout primitives stay as Tailwind classes.
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className={cn("relative inline-flex items-center", className)}
      style={{
        padding: 2,
        borderRadius: 9999,
        border: "1px solid rgba(30,30,43,0.24)",
        background: "#efeeef",
      }}
    >
      {/* Sliding thumb */}
      <span
        aria-hidden
        className="absolute"
        style={{
          top: 2,
          bottom: 2,
          left: 2,
          width: "calc(50% - 2px)",
          borderRadius: 9999,
          background: "#1e1e2b",
          transform: tab === "details" ? "translateX(100%)" : "translateX(0)",
          transition: "transform 320ms cubic-bezier(0.2, 0, 0, 1)",
        }}
      />
      <SwitchButton active={tab === "video"} onClick={() => onChange("video")}>
        Video
      </SwitchButton>
      <SwitchButton active={tab === "details"} onClick={() => onChange("details")}>
        Details
      </SwitchButton>
    </div>
  );
}

function SwitchButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={onClick}
      className="relative z-10 flex-1 font-mono uppercase"
      style={{
        padding: "4px 14px",
        borderRadius: 9999,
        fontSize: 10,
        letterSpacing: "0.14em",
        lineHeight: 1,
        color: active ? "#efeeef" : "#767676",
        transition: "color 160ms cubic-bezier(0.2, 0, 0, 1)",
        background: "transparent",
        border: "none",
      }}
    >
      {children}
    </button>
  );
}
