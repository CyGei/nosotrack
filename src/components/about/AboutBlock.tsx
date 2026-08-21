"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/lib/hooks";

export type StepNumber = "0.1" | "0.2" | "0.3" | "0.4";

const ALL_STEPS: StepNumber[] = ["0.1", "0.2", "0.3", "0.4"];

type Tab = "video" | "details";

export function AboutBlock({
  id,
  title,
  subtitle,
  video,
  details,
  bare,
}: {
  id: StepNumber;
  title: string;
  subtitle?: string;
  video?: React.ReactNode;
  details: React.ReactNode;
  bare?: boolean;
}) {
  const hasVideo = video != null;
  const [tab, setTab] = useState<Tab>(hasVideo ? "video" : "details");

  const { ref: titleRef, fractional } = useScrollReveal<HTMLHeadingElement>(
    title.length,
    32,
  );

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
          <div className="col-span-12 md:col-span-4">
            <h2
              ref={titleRef}
              className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)] max-w-[14ch]"
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
                // Reserves the final heading height so typing causes no layout shift.
                <span style={{ visibility: "hidden" }}>{hiddenChars}</span>
              )}
            </h2>
          </div>

          <div className="col-span-12 md:col-span-8">
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

            {bare && !hasVideo ? (
              <div
                key="details"
                className={cn("animate-tab-in", subtitle ? "mt-10" : "mt-0")}
                aria-live="polite"
              >
                {details}
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

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

export function StepIndicator({ activeId }: { activeId: string }) {
  const activeIndex = ALL_STEPS.indexOf(activeId as StepNumber);

  return (
    <div
      role="img"
      aria-label={`Section ${activeIndex + 1} of ${ALL_STEPS.length}`}
      className="flex items-center gap-2"
    >
      {ALL_STEPS.map((s, i) => (
        <span
          key={s}
          className={cn(
            "w-12 md:w-16",
            i <= activeIndex ? "h-[2px] bg-ink" : "h-px bg-rule-strong",
          )}
        />
      ))}
    </div>
  );
}

function Switch({
  tab,
  onChange,
  className,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  className?: string;
}) {
  // Inline styles, not classes: tailwind-merge collapses arbitrary values like
  // text-[10px] and text-[#efeeef] into one group and drops one of them.
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
