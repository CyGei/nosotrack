"use client";

import { AnimatedTitle } from "./AnimatedTitle";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type StepNumber = "0.1" | "0.2" | "0.3" | "0.4";

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
  subtitle?: React.ReactNode;
  video?: React.ReactNode;
  details: React.ReactNode;
  bare?: boolean;
}) {
  const hasVideo = video != null;
  const [tab, setTab] = useState<Tab>(hasVideo ? "video" : "details");

  return (
    <article
      data-story-chapter
      data-story-side={(id === "0.2" || id === "0.4") ? "right" : "left"}
      aria-label={`Section ${id}`}
    >
      <div className="container-page section-pad">
        <div data-story-fork data-story-reverse={(id === "0.2" || id === "0.4") ? "" : undefined}>
          <div data-story-branch data-story-intro>
            <h2
              data-story-title
              className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]"
            >
              <AnimatedTitle text={title} />
            </h2>
            {subtitle && (
              <p className="font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink max-w-[55ch]">
                {subtitle}
              </p>
            )}
          </div>
          <div data-story-branch>
            {hasVideo && (
              <Switch tab={tab} onChange={setTab} className="mb-6" />
            )}

            {bare && !hasVideo ? (
              <div key="details" className="animate-tab-in" aria-live="polite">
                {details}
              </div>
            ) : (
              <div className="rounded-[14px] border border-rule-strongest bg-bg overflow-hidden">
                <div
                  key={hasVideo ? tab : "details"}
                  className={cn("animate-tab-in", hasVideo && tab === "video" ? "p-2 sm:p-3" : "p-4 lg:p-6")}
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
      <SwitchButton
        active={tab === "details"}
        onClick={() => onChange("details")}
      >
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
      className="relative z-10 flex-1 whitespace-nowrap font-mono uppercase"
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
