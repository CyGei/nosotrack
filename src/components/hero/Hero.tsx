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
 *   4. BRAND        — Nosotrack lockup with a      "Track. Intervene.
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
import { useLenis } from "lenis/react";
import Snap from "lenis/snap";
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

/** Smooth-scroll to the About section — through Lenis when it's mounted
 *  (so its internal target stays in sync), native scrollIntoView as the
 *  pre-mount fallback. */
function scrollToAbout(lenis: ReturnType<typeof useLenis>) {
  const about = document.getElementById("about");
  if (!about) return;
  if (lenis) lenis.scrollTo(about);
  else about.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  const { wrapperRef, activeScene } = useActiveScene(SCENE_COUNT);
  // Lenis tracks its own internal scroll target independent of
  // `window.scrollY`. When the completion-lock shrinks the wrapper we
  // need to move BOTH in lock-step, otherwise Lenis's stale target
  // makes the next wheel input rocket the page across the shrunk delta.
  // Null on the server / before mount; the completion effect guards.
  const lenis = useLenis();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // One marker per scene, sitting at the centre of that scene's scroll
  // band. They feed BOTH snap mechanisms — Lenis's Snap addon on desktop
  // (below) and CSS scroll-snap on touch (globals.css). One set of
  // anchors, two consumers.
  const snapMarkerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  // Captured at the moment we commit completion so the layout-effect
  // below can compensate for the wrapper-height shrink WITHOUT having
  // to re-query DOM after the React state has flipped.
  const completionShrinkRef = useRef(0);
  // Set by the brand-frame "Scroll to learn more" cue so the completion
  // layout-effect knows to glide to About once the hero has collapsed
  // to its locked height (see goToAbout).
  const pendingAboutRef = useRef(false);

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
     BEFORE the browser paints. We move the scroll up by the same delta
     the wrapper lost so the user's viewport content stays visually
     static at the moment of release.

     Lenis is the source of truth for scroll. `lenis.scrollTo` with
     `immediate: true` and `force: true` sets BOTH `window.scrollY` AND
     Lenis's internal target in one call, keeping the two in sync —
     otherwise the next wheel input gets added to Lenis's stale target
     and rockets the page across the shrunk delta. We also call
     `lenis.resize()` so Lenis re-measures the now-shorter document.
     If Lenis isn't ready yet (SSR / pre-mount), fall back to native.
     ───────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    if (!hasCompleted) return;
    const delta = completionShrinkRef.current;
    completionShrinkRef.current = 0;
    if (delta > 0) {
      const targetY = Math.max(0, window.scrollY - delta);
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(targetY, { immediate: true, force: true });
      } else {
        window.scrollBy({
          top: -delta,
          left: 0,
          behavior: "instant" as ScrollBehavior,
        });
      }
    }
    // Deferred "Scroll to learn more": the cue forces completion first
    // (so About sits at its final position), then we glide down to it
    // here — after compensation has pinned the brand at the top. Doing
    // it post-collapse sidesteps the anchor-vs-completion race that
    // otherwise stranded the click mid-page.
    if (pendingAboutRef.current) {
      pendingAboutRef.current = false;
      scrollToAbout(lenis);
    }
  }, [hasCompleted, lenis]);

  /* ─────────────────────────────────────────────────────────────
     Frame snapping — desktop / pointer devices.
     Lenis's own Snap addon snaps the wheel to each scene's band centre
     so one scroll lands cleanly on one frame. `proximity` (not
     `mandatory`) keeps it from trapping the user on the final frame —
     once they scroll decisively past it, the completion-lock fires and
     this effect tears the Snap down. Touch is intentionally skipped:
     Lenis Snap ignores touchmove by design, so phones use native CSS
     scroll-snap instead (see globals.css). Re-runs if the Lenis
     instance arrives late or the hero completes.
     ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!lenis || hasCompleted) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const markers = snapMarkerRefs.current.filter(Boolean) as HTMLElement[];
    if (markers.length === 0) return;

    const snap = new Snap(lenis, { type: "proximity", distanceThreshold: "60%" });
    const removers = markers.map((el) => snap.addElement(el, { align: ["start"] }));
    return () => {
      removers.forEach((remove) => remove());
      snap.destroy();
    };
  }, [lenis, hasCompleted]);

  /* ─────────────────────────────────────────────────────────────
     "Scroll to learn more" — the brand-frame cue's handler. A plain
     #about anchor races the completion lock: the lock collapses the
     wrapper mid-scroll and its compensation overrides the in-flight
     anchor scroll, stranding the click. So we force completion NOW
     (capturing the same shrink delta the IO path uses, so the viewport
     stays static through the collapse) and defer the glide to About to
     the completion layout-effect, by which point About is at its final
     position. The already-completed branch is a defensive fallback —
     the cue only renders pre-completion.
     ───────────────────────────────────────────────────────────── */
  const goToAbout = () => {
    const wrapper = wrapperRef.current;
    if (!hasCompleted && wrapper) {
      completionShrinkRef.current = wrapper.offsetHeight - window.innerHeight;
      pendingAboutRef.current = true;
      setHasCompleted(true);
    } else {
      scrollToAbout(lenis);
    }
  };

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

        <AdvanceCue
          visible={activeScene < SCENE_COUNT - 1}
          hasScrolled={hasUserScrolled}
          activeScene={activeScene}
          count={SCENE_COUNT}
          wrapperRef={wrapperRef}
        />
        <BrandOutro
          visible={activeScene === SCENE_COUNT - 1}
          onLearnMore={goToAbout}
        />
      </div>

      {/* Snap anchors — one per scene at the centre of its scroll band.
          Direct children of the wrapper (NOT the sticky stage) so they
          hold fixed document offsets instead of pinning. Zero-size and
          non-interactive; they exist only to give the two snap systems
          (Lenis Snap on desktop, CSS scroll-snap on touch) a target. */}
      {SCENES.map((_, i) => (
        <div
          key={`snap-${i}`}
          ref={(el) => {
            snapMarkerRefs.current[i] = el;
          }}
          data-hero-snap
          aria-hidden
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{
            top: `calc((${i} + 0.5) * 100svh)`,
            scrollSnapAlign: "start",
          }}
        />
      ))}

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
   Scroll helpers — shared by the indicator dots and the clickable
   cues. `scrollToScene` smooth-scrolls so a scene's band centre
   reaches the top of the viewport, advancing exactly one frame. It
   reads rect.height at call time so the math holds whether the
   wrapper is full-height or mid-completion, and honours
   prefers-reduced-motion to match globals.css's scroll-behavior rule.
   ─────────────────────────────────────────────────────────────── */
function scrollToScene(
  wrapper: HTMLElement | null,
  index: number,
  count: number,
) {
  if (!wrapper) return;
  const rect = wrapper.getBoundingClientRect();
  const totalScroll = rect.height - window.innerHeight;
  const targetP = (index + 0.5) / count;
  const y = window.scrollY + rect.top + totalScroll * targetP;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}

/* ───────────────────────────────────────────────────────────────
   Advance cue — the "how do I move to the next frame?" hint.
   On desktop it sits just LEFT of the vertical scene-indicator rail
   (see SceneIndicator), vertically centred to align with it. On mobile
   the rail-adjacent centre would collide with the overlaid headline, so
   the cue drops to bottom-centre (matching BrandOutro's placement; the
   two never show at once). The chevron always points DOWN — deliberately
   vertical motion to correct the observed behaviour of users swiping
   left↔right instead of scrolling down to advance.

   The "scroll down" label disappears once the user has scrolled for the
   first time (`hasScrolled`) — by then they've learnt the gesture, so
   only the quiet arrow remains as a direction reminder on the remaining
   frames. The label reads "Scroll down" on every platform.

   Now interactive: the chevron is a real button — click or tap
   advances exactly one frame (reusing the indicator-dot scroll math),
   and it's keyboard-focusable with an aria-label. It only accepts
   input while visible; on the final frame it's inert and aria-hidden.
   ─────────────────────────────────────────────────────────────── */
function AdvanceCue({
  visible,
  hasScrolled,
  activeScene,
  count,
  wrapperRef,
}: {
  visible: boolean;
  hasScrolled: boolean;
  activeScene: number;
  count: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 md:bottom-auto md:left-auto md:right-16 md:top-1/2 md:translate-x-0 md:-translate-y-1/2"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms var(--ease-nt)`,
        color: "var(--color-inv-hi)",
      }}
    >
      {/* Real button so the chevron is clickable / tappable / focusable.
          `-m-3 p-3` grows the touch target ~12px on every side without
          shifting the chevron a pixel. Pointer + focus are switched off
          while the cue is hidden so the final frame can't trap a tab
          stop or a stray tap. */}
      <button
        type="button"
        aria-label="Go to next frame"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        onClick={() =>
          scrollToScene(wrapperRef.current, activeScene + 1, count)
        }
        className="group -m-3 flex cursor-pointer flex-row items-center gap-3 rounded-md p-3 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-inv-hi)]"
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        {/* Label — bright + legible, fades out for good after the user's
            first scroll but keeps its space so the arrow stays put. */}
        <span
          className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{
            opacity: hasScrolled ? 0 : 1,
            transition: `opacity ${FADE_MS}ms var(--ease-nt)`,
          }}
        >
          Scroll down
        </span>
        {/* Bold double-chevron sliding downward — the clearly-visible
            direction signal; nudges further down on hover / press. */}
        <svg
          width="26"
          height="34"
          viewBox="0 0 26 34"
          fill="none"
          aria-hidden
          className="transition-transform duration-[var(--transition-duration-fast)] group-hover:translate-y-0.5 group-active:translate-y-1"
        >
          <polyline
            className="hero-arrow-chevron"
            points="4 6 13 15 22 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            className="hero-arrow-chevron hero-arrow-chevron-2"
            points="4 16 13 25 22 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Brand outro — the two ways out of the cinematic, shown only on the
   FINAL (brand) frame as a matched pair sitting SIDE-BY-SIDE at
   bottom-centre. Identical treatment (mono cream label + arrow on the
   transparent dark hero); they differ only in where the arrow points:

     • "Explore the platform" → arrow OUTWARD (↗). Off-site jump to the
       live MVP dashboard, opened in a new tab (same target + rel as the
       nav "Platform" link) so the marketing site stays put behind it.
     • "Scroll to learn more" → arrow DOWN (↓). Releases the cinematic
       (forces the completion lock) then glides down to the About
       section — see `onLearnMore` / `goToAbout` in <Hero>.

   Cream-on-transparent (not a filled button) keeps both legible on the
   dark canvas without a background that could swallow the label. Both
   are inert + aria-hidden whenever this isn't the active frame; the
   whole hero re-renders without them once `hasCompleted` flips and the
   pin releases.
   ─────────────────────────────────────────────────────────────── */
function BrandOutro({
  visible,
  onLearnMore,
}: {
  visible: boolean;
  /** Releases the cinematic and scrolls to About; wired from <Hero>. */
  onLearnMore: () => void;
}) {
  // One shared treatment so the two read as a matched pair — only the
  // label + arrow direction differ. `-m-3 p-3` enlarges the tap target
  // in place; pointer + focus gate on `visible` so neither is
  // interactive off the final frame.
  const itemClass =
    "group -m-3 flex cursor-pointer flex-col items-center gap-2 rounded-md p-3 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-inv-hi)]";
  const labelClass =
    "font-mono text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]";
  const gate = {
    "aria-hidden": !visible,
    tabIndex: visible ? 0 : -1,
    style: { pointerEvents: visible ? ("auto" as const) : ("none" as const) },
  };

  return (
    <div
      className="pointer-events-none absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 flex-row items-start justify-center gap-6 sm:gap-12"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms var(--ease-nt)`,
        color: "var(--color-inv-hi)",
      }}
    >
      {/* Platform — outward arrow (↗), off-site jump in a new tab. */}
      <a
        href="https://nosotrack.onrender.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Explore the Nosotrack platform (opens in a new tab)"
        className={itemClass}
        {...gate}
      >
        <span className={labelClass}>Explore the platform</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="transition-transform duration-[var(--transition-duration-fast)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          <line x1="3" y1="11" x2="11" y2="3" />
          <polyline points="4.5 3 11 3 11 9.5" />
        </svg>
      </a>

      {/* Scroll — down arrow (↓). A button (not a #about anchor) so its
          handler can force the completion lock BEFORE scrolling; a raw
          anchor scroll races that lock and lands mid-page. */}
      <button
        type="button"
        onClick={onLearnMore}
        aria-label="Scroll to learn more about Nosotrack"
        className={itemClass}
        {...gate}
      >
        <span className={labelClass}>Scroll to learn more</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="transition-transform duration-[var(--transition-duration-fast)] group-hover:translate-y-0.5"
        >
          <line x1="7" y1="2.5" x2="7" y2="11" />
          <polyline points="3 7 7 11 11 7" />
        </svg>
      </button>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Scene indicator rail — a VERTICAL column of dots pinned to the right
   edge of the hero, vertically centred. Clicking a dot jumps you to
   that scene. The vertical orientation reinforces that frames advance
   downward (a horizontal row read like a carousel and invited sideways
   swipes). The active dot stretches into a tall pill; the AdvanceCue
   arrow sits immediately to its left. Math still works with the wrapper
   height because we read `rect.height` at click time.
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
  const jumpTo = (i: number) => scrollToScene(wrapperRef.current, i, count);

  return (
    <div className="pointer-events-auto absolute right-8 top-1/2 z-20 -translate-y-1/2">
      <div className="flex flex-col items-center gap-3">
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
                  width: "5px",
                  height: isActive ? "24px" : "5px",
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
