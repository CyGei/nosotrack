"use client";

/**
 * Scene "Brand" — closing frame: Nosotrack mark + motto.
 *
 * Choreographed sequence (Pattern C) on desktop:
 *
 *   t=0          Logo appears CENTRED (horizontal middle of the
 *                container), inner .brand-mark-network begins its
 *                360° rotation around the SVG centre (16,16).
 *                Corner brackets stay fixed.
 *
 *   t=SPIN_MS    Spin completes. After a small settle pause, the
 *                logo's `left` transitions from 50% (centre) to 25%
 *                (centre of the left half) over SLIDE_MS.
 *
 *   t=SPIN_MS    Motto fades in on the right and starts typing line-
 *     +SLIDE_MS  by-line ("Track." / "Intervene." / "Protect." with
 *                the cream halo on the final line).
 *
 * Render modes (collapsed into one render path, selected by `mode`):
 *   - "stacked"   — mobile / reduced-motion. Pattern-B vertical stack,
 *                   logo above motto, both centred. No spin, no typing.
 *   - "frozen"    — desktop completion-lock end-state. Same as the
 *                   final frame of "animated" but with no transitions.
 *   - "animated"  — desktop active path: logo spins, slides left, motto
 *                   fades + types in.
 *
 * The mark itself reuses the navbar/footer idiom via the shared
 * <BrandMark> component — same `.brand-mark-network` class, same
 * transform-origin, so all logo instances on the page read as one
 * piece of brand chrome.
 */

import { useEffect, useState } from "react";
import { TypingHeadline } from "./TypingHeadline";
import { BrandWordmark } from "@/components/BrandWordmark";
import { BrandMark } from "@/components/BrandMark";
import { useReducedMotion } from "@/lib/hooks";

const SPIN_MS = 1_300;       // spin ends a touch sooner (was 1600)
const SETTLE_MS = 80;        // tiny breath between spin end and slide start
const SLIDE_MS = 700;

// Lockup positions. The lockup `left` transitions between these in
// the animated path; frozen jumps straight to SHIFTED.
const POS_CENTERED = "50%";
const POS_SHIFTED = "25%";

type Phase = "centered" | "shifted";
type Mode = "stacked" | "frozen" | "animated";

export type SceneBrandProps = {
  active: boolean;
  /** Motto lines to type in. Final line picks up the cream halo. */
  lines: string[];
  /** Render the DESKTOP final composition instantly: logo at the
   *  shifted (25%) position, motto fully typed on the right, no spin,
   *  no slide, no typing animation. Used by the completion lock after
   *  the user has scrolled through the sticky-scroll sequence once. */
  frozen?: boolean;
};

export function SceneBrand({
  active,
  lines,
  frozen = false,
}: SceneBrandProps) {
  const reduce = useReducedMotion();
  // `spinKey` bumps on every active→true so the CSS animation replays
  // (CSS animations only fire once unless the element is re-keyed).
  const [spinKey, setSpinKey] = useState(0);
  // Layout phase. Stays at "centered" while the spin plays, then
  // flips to "shifted" so the logo slides left and the motto types in.
  const [phase, setPhase] = useState<Phase>("centered");

  // Run the sequence whenever the scene becomes active. Re-entering
  // the scene replays it from scratch (centred → spin → slide → type).
  useEffect(() => {
    if (!active) return;
    setSpinKey((k) => k + 1);
    setPhase("centered");
    const t = setTimeout(() => setPhase("shifted"), SPIN_MS + SETTLE_MS);
    return () => clearTimeout(t);
  }, [active]);

  // `frozen` takes priority — it represents the locked end-state and
  // must use the desktop choreographed-end layout regardless of size.
  const mode: Mode = frozen ? "frozen" : reduce ? "stacked" : "animated";

  /* ─────────────────────────────────────────────────────────────
     Stacked: mobile / reduced-motion. No choreography, no spin,
     headline shown in full immediately.
     ───────────────────────────────────────────────────────────── */
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

  /* ─────────────────────────────────────────────────────────────
     Frozen + Animated share the same two-column composition. They
     differ only in:
     - Frozen jumps the lockup straight to SHIFTED, no transitions.
     - Animated drives `left` from CENTERED → SHIFTED via state and
       runs the headline's typing animation tied to the phase flip.
     ───────────────────────────────────────────────────────────── */
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
        {/* LOCKUP — icon + "Nosotrack" wordmark stacked as one unit,
            following the nav/footer brand convention. The whole
            lockup translates together via `left`; `translate(-50%,
            -50%)` keeps the lockup's centre aligned with the `left`
            anchor point throughout. */}
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

        {/* HEADLINE — pinned to the right half of the container, fades
            in once the logo has finished sliding (animated only). The
            TypingHeadline itself only starts typing when its `active`
            prop flips, so we tie that flip to the shifted phase. */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            // Right-half column: starts at 52% from the left so the
            // headline left-edge "addresses" the slid-left logo.
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
            // Reveal the T·I·P initials as a column first (the "tip"),
            // then unfold each into Track./Intervene./Protect.
            initialsFirst
            className="font-mono font-normal leading-[1.02] tracking-[-0.025em] text-inv-hi text-[clamp(2.2rem,5.4vw,5rem)]"
          />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   BrandLockup — vertical stack of the spinning mark above the
   "Nosotrack" wordmark. Same lockup pattern the nav and footer use,
   just at hero scale. Renders as one unit so the slide animation
   moves both together.
   ─────────────────────────────────────────────────────────────── */
function BrandLockup({
  spinKey,
  shouldSpin,
  iconClassName,
  wordmarkFontSize,
}: {
  spinKey: number;
  shouldSpin: boolean;
  iconClassName: string;
  /** Drives the BrandWordmark's em-relative size — the wordmark scales
   *  with its parent's `font-size`, so we set it here on the wrapper. */
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
      {/* BrandWordmark uses em-relative sizing, so this wrapper's
          font-size drives how big "Nosotrack" reads. text-inv-hi
          gives the cream colour to "Noso"; "Track" picks up red from
          the wordmark's own .text-alert class. */}
      <span
        className="font-mono text-inv-hi"
        style={{ fontSize: wordmarkFontSize }}
      >
        <BrandWordmark />
      </span>
    </div>
  );
}
