"use client";

import { useEffect, useState } from "react";
import { TypingHeadline } from "./TypingHeadline";
import { BrandWordmark } from "@/components/BrandWordmark";
import { BrandMark } from "@/components/BrandMark";
import { useReducedMotion } from "@/lib/hooks";

const SPIN_MS = 1_300;
const SETTLE_MS = 80;
const SLIDE_MS = 700;

const POS_CENTERED = "50%";
const POS_SHIFTED = "25%";

type Phase = "centered" | "shifted";
type Mode = "stacked" | "frozen" | "animated";

export type SceneBrandProps = {
  active: boolean;
  lines: string[];
  /** Render the desktop end-state instantly, with no transitions. */
  frozen?: boolean;
};

export function SceneBrand({
  active,
  lines,
  frozen = false,
}: SceneBrandProps) {
  const reduce = useReducedMotion();
  // Bumped on every active→true: a CSS animation only replays if re-keyed.
  const [spinKey, setSpinKey] = useState(0);
  const [phase, setPhase] = useState<Phase>("centered");

  useEffect(() => {
    if (!active) return;
    setSpinKey((k) => k + 1);
    setPhase("centered");
    const t = setTimeout(() => setPhase("shifted"), SPIN_MS + SETTLE_MS);
    return () => clearTimeout(t);
  }, [active]);

  const mode: Mode = frozen ? "frozen" : reduce ? "stacked" : "animated";

  if (mode === "stacked") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[var(--color-bg-ink)]">
        <div className="container-page relative z-10 flex h-full flex-col items-center justify-center gap-8">
          <BrandLockup
            spinKey={spinKey}
            shouldSpin={false}
            iconClassName="h-[34vmin] w-[34vmin] text-inv-hi"
            wordmarkFontSize="clamp(1.3rem, 4.8vw, 2.1rem)"
          />
          <TypingHeadline
            lines={lines}
            active={true}
            forceImmediate
            haloLastLine
            className="text-center font-mono font-normal leading-[1.06] tracking-[-0.025em] text-inv-hi text-[clamp(2rem,9vw,3.6rem)]"
          />
        </div>
      </div>
    );
  }

  const shifted = mode === "frozen" ? true : phase === "shifted";
  const shouldSpin = mode === "animated" && active;
  const headlineActive = mode === "frozen" ? true : shifted;
  const lockupTransition =
    mode === "animated" ? `left ${SLIDE_MS}ms var(--ease-nt)` : "none";
  const headlineTransition =
    mode === "animated"
      ? `opacity 480ms var(--ease-nt) ${shifted ? "60ms" : "0ms"}`
      : "none";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--color-bg-ink)]">
      <div className="container-page relative z-10 h-full">
        <div
          className="absolute top-1/2"
          style={{
            left: shifted ? POS_SHIFTED : POS_CENTERED,
            transform: "translate(-50%, -50%)",
            transition: lockupTransition,
          }}
        >
          <BrandLockup
            spinKey={spinKey}
            shouldSpin={shouldSpin}
            iconClassName="h-[28vmin] w-[28vmin] text-inv-hi"
            wordmarkFontSize="clamp(1.3rem, 2.4vw, 2.1rem)"
          />
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: "52%",
            right: 0,
            opacity: shifted ? 1 : 0,
            transition: headlineTransition,
          }}
        >
          <TypingHeadline
            lines={lines}
            active={headlineActive}
            forceImmediate={mode === "frozen"}
            haloLastLine
            initialsFirst
            className="font-mono font-normal leading-[1.02] tracking-[-0.025em] text-inv-hi text-[clamp(2.2rem,5.4vw,5rem)] [&>span:first-child]:-translate-x-[0.19em]"
          />
        </div>
      </div>
    </div>
  );
}

function BrandLockup({
  spinKey,
  shouldSpin,
  iconClassName,
  wordmarkFontSize,
}: {
  spinKey: number;
  shouldSpin: boolean;
  iconClassName: string;
  /** BrandWordmark sizes in em, so this is set as the wrapper's font-size. */
  wordmarkFontSize: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <BrandMark
        spinKey={spinKey}
        spinning={shouldSpin}
        spinDurationMs={SPIN_MS}
        className={iconClassName}
      />
      <span
        className="font-mono text-inv-hi"
        style={{ fontSize: wordmarkFontSize }}
      >
        <BrandWordmark />
      </span>
    </div>
  );
}
