"use client";

/**
 * Hero v2 — sticky-scroll cinematic, four-frame edition.
 *
 * Frame order (top → bottom of the wrapper):
 *   1. FIELD        — PPE video collage,           "outbreak forensics
 *                     real Africa-flavoured CC0     for infection prevention
 *                     + CDC public-domain footage   and control"
 *   2. TREE         — transmission tree auto-      "Reconstruct the chain
 *                     drawing on entry              of transmission."
 *   3. BLUEPRINTS   — hospital | ship | farm       "Deployable
 *                     side-by-side, all three       anywhere."
 *                     particle networks live
 *   4. BRAND        — NosoTrack lockup with a      "Track. Intervene.
 *                     one-time entrance spin       Protect."
 *                     + slide-left choreography
 *
 * Scroll mechanics (standard modern protocol — no scroll-jacking
 * libraries, no lerp, no overengineering):
 *   - Outer wrapper is (N + 1) × 100svh tall, so the sticky inner
 *     pin gives each scene exactly 100svh of scroll dwell. One screen
 *     of scroll = one frame advance.
 *   - The inner stage is `position: sticky; top: 0; height: 100svh`.
 *   - `useActiveScene` samples scrollY each rAF, computes which scene
 *     is active, and React swaps the visible background.
 *   - Cross-fade between frames is 500ms — short enough that fast
 *     scrolls don't leave partial fades visible, long enough that the
 *     transition reads as a deliberate cut.
 *
 * Completion lock (the user's "lock end state once the pin releases"):
 *   - An IntersectionObserver watches a 1px sentinel at the wrapper
 *     bottom. When the sentinel enters the viewport (the natural pin-
 *     release moment), we set `hasCompleted` and the whole hero re-
 *     renders as a 100svh static section showing only the FROZEN
 *     final composition. No re-pin on scroll-up. No replay. No reset.
 *   - `useLayoutEffect` runs immediately after the DOM mutates and
 *     applies a `scrollBy({ top: -shrinkDelta, behavior: 'instant' })`
 *     so the user's viewport content stays exactly where it was at the
 *     moment of release — no visual jump.
 *   - A `hasUserScrolled` guard prevents the IO from firing on initial
 *     mount when the user lands on the page already past the hero
 *     (e.g. hard refresh while scrolled to #contact); we only commit
 *     completion AFTER the first real scroll event from the user.
 *
 * Mobile uses the same code path. `100svh` already accounts for the
 * iOS/Android address bar resize, and touch-scroll triggers the same
 * scroll events the rAF loop is listening to. One swipe ≈ one frame.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useActiveScene } from "./useActiveScene";
import { TypingHeadline } from "./TypingHeadline";
import { Scene1Field } from "./Scene1Field";
import { Scene3Tree } from "./Scene3Tree";
import { Scene4Stop } from "./Scene4Stop";
import { SceneBlueprints } from "./SceneBlueprints";
import { SceneBrand } from "./SceneBrand";

type SceneId = "field" | "tree" | "stop" | "blueprints" | "brand";

type SceneSpec = {
  id: SceneId;
  lines: string[];
  /** Apply the cream-halo `.hero-accent` to the FINAL line only. Used
   *  on the brand frame so "Protect." picks up the breathing glow. */
  haloLastLine?: boolean;
  /** When true, the scene component renders its OWN copy internally
   *  (logo + headline two-column composition). Hero skips its
   *  global TypingHeadline overlay for these so they don't double-
   *  render. Used by the brand close-frame. */
  selfContained?: boolean;
};

const SCENES: SceneSpec[] = [
  {
    id: "field",
    // Lowercase per the brief — feels more Palantir / less marketing.
    lines: ["Outbreak forensics", "for infection prevention", "and control."],
  },
  {
    id: "tree",
    lines: ["Reconstruct the chain", "of transmission."],
  },
  {
    id: "stop",
    lines: ["Stop", "the spread."],
  },
  {
    id: "blueprints",
    lines: ["Deployable", "anywhere."],
  },
  {
    id: "brand",
    lines: ["Track.", "Intervene.", "Protect."],
    haloLastLine: true,
    selfContained: true,
  },
];

const SCENE_COUNT = SCENES.length;

// Wrapper height: (N + 1) × 100svh. With the sticky inner pinned at
// 100svh, that gives totalScroll = N × 100svh and each scene gets
// exactly 100svh of dwell. The "+1" is critical — without it each
// scene only gets (N−1)/N × 100svh = 75svh for N=4 and the pacing
// feels rushed / skip-y on fast scrolls.
const WRAPPER_VH = (SCENE_COUNT + 1) * 100;

// Cross-fade duration between scenes. Down from v1's 800ms so quick
// scrolls don't leave partial fades visible.
const FADE_MS = 500;

const BRAND_SCENE = SCENES.find((s) => s.id === "brand")!;

export function Hero() {
  const { wrapperRef, activeScene } = useActiveScene(SCENE_COUNT);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  // Captured at the moment we commit completion so the layout-effect
  // below can compensate for the wrapper-height shrink WITHOUT having
  // to re-query DOM after the React state has flipped.
  const completionShrinkRef = useRef(0);

  /* ─────────────────────────────────────────────────────────────
     "Has the user actually scrolled?" guard. Without this, the IO
     below would fire immediately on a refresh-while-past-hero (because
     the sentinel is already in view) and we'd shrink the hero before
     the user has done anything. We just wait for one real scroll
     event before allowing completion to be committed.
     ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const onFirstScroll = () => setHasUserScrolled(true);
    window.addEventListener("scroll", onFirstScroll, {
      once: true,
      passive: true,
    });
    return () => window.removeEventListener("scroll", onFirstScroll);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     Completion detector. The sentinel sits at the very bottom of the
     wrapper. IntersectionObserver fires when its top edge crosses
     into the viewport — i.e. the user has scrolled to or past the
     wrapper bottom, which is the natural pin-release point.
     ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (hasCompleted || !hasUserScrolled) return;
    const sentinel = sentinelRef.current;
    const wrapper = wrapperRef.current;
    if (!sentinel || !wrapper) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Capture the shrink amount BEFORE setState so useLayoutEffect
        // below can read it without racing the re-render.
        completionShrinkRef.current =
          wrapper.offsetHeight - window.innerHeight;
        setHasCompleted(true);
      },
      { threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasCompleted, hasUserScrolled, wrapperRef]);

  /* ─────────────────────────────────────────────────────────────
     Scroll compensation. Runs synchronously AFTER React has committed
     the DOM change (wrapper shrunk from WRAPPER_VH×svh to 100svh) but
     BEFORE the browser paints. Scrolling up by the same delta the
     wrapper lost keeps the user's viewport content visually static
     at the moment of release — no jump.
     ───────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    if (!hasCompleted) return;
    const delta = completionShrinkRef.current;
    if (delta > 0) {
      // `behavior: "instant"` (vs default "auto") side-steps any user-
      // preferred smooth-scroll setting; we need this to land in one
      // paint, not animate.
      window.scrollBy({
        top: -delta,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
      completionShrinkRef.current = 0;
    }
  }, [hasCompleted]);

  /* ─────────────────────────────────────────────────────────────
     Render branch 1: completed — the locked final composition. One
     100svh section, no sticky, no scene indicator, no choreography.
     Scrolling past it (in either direction) is native page scroll.
     ───────────────────────────────────────────────────────────── */
  if (hasCompleted) {
    return (
      <section
        id="hero"
        className="on-dark relative isolate h-[100svh] overflow-hidden bg-[var(--color-bg-ink)]"
      >
        <SceneBrand active={true} lines={BRAND_SCENE.lines} frozen />
      </section>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     Render branch 2: active — sticky-scroll cinematic. Same path on
     desktop and mobile.
     ───────────────────────────────────────────────────────────── */
  return (
    <section
      ref={wrapperRef}
      id="hero"
      className="on-dark relative isolate bg-[var(--color-bg-ink)]"
      style={{ height: `${WRAPPER_VH}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {SCENES.map((scene, i) => {
          const opacity = i === activeScene ? 1 : 0;
          return (
            <div
              key={scene.id}
              aria-hidden={i !== activeScene}
              className="absolute inset-0"
              style={{
                opacity,
                transition: `opacity ${FADE_MS}ms var(--ease-nt)`,
                pointerEvents: i === activeScene ? "auto" : "none",
              }}
            >
              <SceneBackground scene={scene} active={i === activeScene} />
            </div>
          );
        })}

        {/* Left-side gradient scrim — sits between the scene background
            (z-implicit) and the headline overlay (z-10) so the title
            has a soft dark wash behind it on busy frames (video).
            On already-dark frames (tree, stop) the scrim blends
            invisibly into the ink background. Skipped on the self-
            contained brand frame which has no overlay headline AND on
            the blueprints frame — its leftmost column (hospital) sits
            directly under the scrim's darkest band, which read as the
            hospital being dimmed vs. the cruise ship at the right. */}
        {!SCENES[activeScene].selfContained &&
          SCENES[activeScene].id !== "blueprints" && <HeadlineScrim />}

        {/* Global headline overlay — used for every scene EXCEPT the
            self-contained brand frame, which renders its own headline
            inside its two-column choreography. */}
        {!SCENES[activeScene].selfContained && (
          <div className="container-page absolute inset-0 z-10 flex flex-col justify-center">
            <SceneCopy
              key={SCENES[activeScene].id}
              lines={SCENES[activeScene].lines}
              haloLastLine={SCENES[activeScene].haloLastLine}
              active={true}
            />
          </div>
        )}

        <SceneIndicator
          count={SCENE_COUNT}
          activeScene={activeScene}
          wrapperRef={wrapperRef}
        />

        <ScrollCue visible={activeScene === SCENE_COUNT - 1} />
      </div>

      {/* Sentinel — 1px tall, at the absolute bottom of the wrapper.
          When this crosses into the viewport from below, the user has
          scrolled to the natural pin-release point and we commit to
          the completion lock. */}
      <div
        ref={sentinelRef}
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full"
      />
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   Scene chooser — returns the background visual for a given scene.
   Self-contained scenes (brand) receive their `lines` through here
   so Hero's SCENES array stays the single source of truth.
   ─────────────────────────────────────────────────────────────── */
function SceneBackground({
  scene,
  active,
  forceImmediate = false,
}: {
  scene: SceneSpec;
  active: boolean;
  forceImmediate?: boolean;
}) {
  switch (scene.id) {
    case "field":
      return <Scene1Field active={active} />;
    case "tree":
      return <Scene3Tree active={active} forceImmediate={forceImmediate} />;
    case "stop":
      return <Scene4Stop active={active} forceImmediate={forceImmediate} />;
    case "blueprints":
      return <SceneBlueprints />;
    case "brand":
      return (
        <SceneBrand
          active={active}
          lines={scene.lines}
          forceImmediate={forceImmediate}
        />
      );
  }
}

/* ───────────────────────────────────────────────────────────────
   Headline scrim — left-side dark gradient that boosts title-text
   contrast on busy frames (Field video, Blueprints).
   On already-dark frames (Tree, Stop) the scrim's left edge sits at
   70% ink which is visually identical to the 100% ink background, so
   it has zero visible cost. Sized to roughly the text column width
   (text uses max-w-[22ch] inside container-page — the gradient fades
   to transparent just past where the longest line ends).
   ─────────────────────────────────────────────────────────────── */
function HeadlineScrim() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[5]"
      style={{
        background:
          "linear-gradient(to right, rgba(33, 35, 38, 0.7) 0%, rgba(33, 35, 38, 0.45) 25%, rgba(33, 35, 38, 0) 55%)",
      }}
    />
  );
}

/* ───────────────────────────────────────────────────────────────
   Scene copy — typing headline.
   ─────────────────────────────────────────────────────────────── */
function SceneCopy({
  lines,
  haloLastLine,
  active,
  forceImmediate = false,
}: {
  lines: string[];
  haloLastLine?: boolean;
  active: boolean;
  forceImmediate?: boolean;
}) {
  return (
    <div className="container-page relative z-10 flex h-full flex-col justify-center">
      <TypingHeadline
        lines={lines}
        haloLastLine={haloLastLine}
        active={active}
        forceImmediate={forceImmediate}
        className="font-mono font-normal leading-[1.04] tracking-[-0.025em] text-inv-hi text-[clamp(2.4rem,6.4vw,5.8rem)] max-w-[22ch]"
      />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Scroll cue — small mono label + chevron sitting just above the
   scene-indicator dots on the FINAL (brand) frame. Signals "you've
   reached the end of the cinematic, keep scrolling for the rest of
   the site." Hidden on every other scene; the entire hero re-renders
   without it once `hasCompleted` flips and the pin releases. Purely
   decorative — aria-hidden.
   ─────────────────────────────────────────────────────────────── */
function ScrollCue({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2"
      style={{
        opacity: visible ? 0.7 : 0,
        transition: `opacity ${FADE_MS}ms var(--ease-nt)`,
        color: "var(--color-inv-faint)",
      }}
    >
      <div className="hero-scroll-cue-bob flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
          Scroll to explore
        </span>
        <svg
          width="14"
          height="8"
          viewBox="0 0 14 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="1 1 7 7 13 1" />
        </svg>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Scene indicator dots — clicking jumps you to a scene.
   Hidden in completed mode (single frame, nothing to jump to) and
   on mobile (no sticky stage). Math still works with the new
   wrapper height because we read `rect.height` at click time.
   ─────────────────────────────────────────────────────────────── */
function SceneIndicator({
  count,
  activeScene,
  wrapperRef,
}: {
  count: number;
  activeScene: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  const jumpTo = (i: number) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const totalScroll = rect.height - window.innerHeight;
    const targetP = (i + 0.5) / count;
    const y = window.scrollY + rect.top + totalScroll * targetP;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="pointer-events-auto absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
      <div className="flex items-center gap-2">
        {Array.from({ length: count }).map((_, i) => {
          const isActive = i === activeScene;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Scene ${i + 1}`}
              onClick={() => jumpTo(i)}
              className="group relative h-6 w-6 cursor-pointer"
            >
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-[var(--transition-duration-base)]"
                style={{
                  height: isActive ? "8px" : "5px",
                  width: isActive ? "24px" : "5px",
                  background: isActive
                    ? "var(--color-inv-hi)"
                    : "var(--color-inv-faint)",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
