"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import Snap from "lenis/snap";
import { registerHeroNav } from "./heroNav";
import { useActiveScene } from "./useActiveScene";
import { TypingHeadline } from "./TypingHeadline";
import { Scene1Field } from "./Scene1Field";
import { Scene3Tree } from "./Scene3Tree";
import { Scene4Stop } from "./Scene4Stop";
import { SceneBrand } from "./SceneBrand";

type SceneId = "field" | "tree" | "stop" | "brand";

type SceneSpec = {
  id: SceneId;
  lines: string[];
  haloLastLine?: boolean;
  /** Scene renders its own copy; Hero skips the global headline overlay. */
  selfContained?: boolean;
};

const SCENES: SceneSpec[] = [
  {
    id: "field",
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
    id: "brand",
    lines: ["Track.", "Intervene.", "Protect."],
    haloLastLine: true,
    selfContained: true,
  },
];

const SCENE_COUNT = SCENES.length;

// The "+1" is required: with the sticky stage pinned at 100svh it makes
// totalScroll = N × 100svh, i.e. exactly one viewport of dwell per scene.
const WRAPPER_VH = (SCENE_COUNT + 1) * 100;

const FADE_MS = 500;
const SCENE_FADE_MS = 700;

const BRAND_SCENE = SCENES.find((s) => s.id === "brand")!;

// Prefer Lenis when mounted so its internal target stays in sync.
function scrollToId(lenis: ReturnType<typeof useLenis>, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) lenis.scrollTo(el, { immediate: reduce });
  else el.scrollIntoView({ behavior: reduce ? "instant" : "smooth" });
}

export function Hero() {
  const { wrapperRef, activeScene } = useActiveScene(SCENE_COUNT);
  const lenis = useLenis();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const snapMarkerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const completionShrinkRef = useRef(0);
  const pendingScrollIdRef = useRef<string | null>(null);

  // Reduced motion presents the final brand panel without a long scroll runway.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => {
      const wrapper = wrapperRef.current;
      if (!motion.matches || hasCompleted || !wrapper) return;
      completionShrinkRef.current =
        wrapper.offsetHeight - (wrapper.firstElementChild as HTMLElement).offsetHeight;
      setHasCompleted(true);
    };
    finish();
    motion.addEventListener("change", finish);
    return () => motion.removeEventListener("change", finish);
  }, [hasCompleted, wrapperRef]);

  // Guard: without a real scroll first, the sentinel IO fires immediately
  // on a refresh-while-past-hero and collapses the hero unprompted.
  useEffect(() => {
    const onFirstScroll = () => setHasUserScrolled(true);
    window.addEventListener("scroll", onFirstScroll, {
      once: true,
      passive: true,
    });
    return () => window.removeEventListener("scroll", onFirstScroll);
  }, []);

  useEffect(() => {
    if (hasCompleted || !hasUserScrolled) return;
    const sentinel = sentinelRef.current;
    const wrapper = wrapperRef.current;
    if (!sentinel || !wrapper) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        completionShrinkRef.current =
          wrapper.offsetHeight - (wrapper.firstElementChild as HTMLElement).offsetHeight;
        setHasCompleted(true);
      },
      { threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasCompleted, hasUserScrolled, wrapperRef]);

  // Compensate for the wrapper shrink before paint. Lenis keeps a scroll
  // target separate from window.scrollY; scrollTo({immediate, force}) sets
  // both, or the next wheel input rockets across the shrunk delta.
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
    if (pendingScrollIdRef.current) {
      const id = pendingScrollIdRef.current;
      pendingScrollIdRef.current = null;
      scrollToId(lenis, id);
    }
  }, [hasCompleted, lenis]);

  // Coarse pointers are skipped: Lenis Snap ignores touchmove by design,
  // so touch uses native CSS scroll-snap (globals.css) instead.
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

  // Collapse first, scroll after: an in-flight anchor scroll gets clobbered
  // when the completion sentinel trips mid-flight, stranding it mid-page.
  const completeAndScrollTo = useCallback(
    (id: string) => {
      const wrapper = wrapperRef.current;
      if (!hasCompleted && wrapper) {
        completionShrinkRef.current = wrapper.offsetHeight - (wrapper.firstElementChild as HTMLElement).offsetHeight;
        pendingScrollIdRef.current = id;
        setHasCompleted(true);
      } else {
        scrollToId(lenis, id);
      }
    },
    [hasCompleted, lenis, wrapperRef],
  );

  const goToAbout = () => completeAndScrollTo("about");

  useEffect(
    () =>
      registerHeroNav((hash) => {
        const id = hash.replace(/^#/, "");
        if (hasCompleted || !id || !document.getElementById(id)) return false;
        completeAndScrollTo(id);
        return true;
      }),
    [hasCompleted, completeAndScrollTo],
  );

  if (hasCompleted) {
    return (
      <section
        id="hero"
        className="on-dark relative isolate h-[100svh] overflow-hidden bg-[var(--color-bg-ink)]"
      >
        <SceneBrand active={true} lines={BRAND_SCENE.lines} frozen />
        <BrandOutro visible onLearnMore={goToAbout} />
      </section>
    );
  }

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
                transition: `opacity ${SCENE_FADE_MS}ms ease-in-out`,
                pointerEvents: i === activeScene ? "auto" : "none",
              }}
            >
              <SceneBackground scene={scene} active={i === activeScene} />
            </div>
          );
        })}

        {!SCENES[activeScene].selfContained && <HeadlineScrim />}

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

        <ScrollCue visible={activeScene === 0 && !hasUserScrolled} />
        <BrandOutro
          visible={activeScene === SCENE_COUNT - 1}
          onLearnMore={goToAbout}
        />
      </div>

      {/* Snap anchors must be direct children of the wrapper, not the
          sticky stage, so they hold fixed document offsets. */}
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

      <div
        ref={sentinelRef}
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full"
      />
    </section>
  );
}

function SceneBackground({
  scene,
  active,
}: {
  scene: SceneSpec;
  active: boolean;
}) {
  switch (scene.id) {
    case "field":
      return <Scene1Field active={active} />;
    case "tree":
      return <Scene3Tree active={active} />;
    case "stop":
      return <Scene4Stop active={active} />;
    case "brand":
      return <SceneBrand active={active} lines={scene.lines} />;
  }
}

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

function SceneCopy({
  lines,
  haloLastLine,
  active,
}: {
  lines: string[];
  haloLastLine?: boolean;
  active: boolean;
}) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-center">
      <TypingHeadline
        lines={lines}
        haloLastLine={haloLastLine}
        active={active}
        className="font-mono font-normal leading-[1.04] tracking-[-0.025em] text-inv-hi text-[clamp(2.4rem,6.4vw,5.8rem)] max-w-[22ch]"
      />
    </div>
  );
}

function ScrollCue({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className="pointer-events-none absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        color: "var(--color-inv-hi)",
      }}
    >
      <span className="whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.2em]">
        Scroll to explore
      </span>
      <svg
        width="16"
        height="24"
        viewBox="0 0 16 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M8 2v19m-5-5 5 5 5-5" />
      </svg>
    </div>
  );
}

function BrandOutro({
  visible,
  onLearnMore,
}: {
  visible: boolean;
  onLearnMore: () => void;
}) {
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

      {/* A button, not a #about anchor: the handler must force the
          completion lock before scrolling or the click lands mid-page. */}
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

