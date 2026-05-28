"use client";

/**
 * Scene 1 — Field-response video collage.
 *
 * Background: 5 short loops of PPE-clad response teams. Cross-faded
 * every ~7s. Each clip is treated:
 *   - object-cover so it fills the stage
 *   - slight scale + slow Ken-Burns drift to look intentional rather
 *     than literal/documentary
 *   - greyscale + blue-tint overlay to match the dark canvas palette
 *     ("Palantir mood" register, not "news b-roll" register)
 *   - dark vignette underneath the type to guarantee legibility
 *
 * In-clip ranges:
 *   All current clips define `startTime` / `endTime` (seconds) — the
 *   inner `ClipVideo` component seeks the source on mount AND on
 *   isActive→true, disables native autoPlay/loop, and manages playback
 *   explicitly so we never show a t=0 flash or snap back to the start
 *   of the source file on EOF. See `ClipVideo` below for the full
 *   rationale.
 *
 * Rotation cadence:
 *   We do NOT use a single fixed interval — clip windows range from 4s
 *   to 11s, and any fixed value either reloops the short clips or
 *   wastes the long ones. Instead, each clip's display duration is
 *   derived from its own window length (minus a small safety buffer
 *   before the EOF wrap). See `displayMsFor` below.
 *
 * Only TWO video elements are mounted at a time (current + next),
 * which keeps bandwidth and decoder load sane. The headline ("Outbreak
 * forensics for infection prevention and control.") is typed by the
 * parent TypingHeadline component when this scene is active.
 *
 * Active rotation (5 clips, license-clean):
 *   1. Wikimedia: Liberia Ebola labs (US Army, PD)         0:27–0:31
 *   2. Wikimedia: COVID-19 desconfinamento PPE field work (CC-BY)
 *                                                           2:12–2:22
 *   3. CDC Ebola Safety Training (PD) — donning             1:20–1:25
 *   4. CDC Ebola Safety Training (PD) — buddy-team sim      3:39–3:50
 *   5. CDC Ebola Safety Training (PD) — supervised doffing  3:59–4:07
 *
 * Benched (kept in source, currently inside a block comment so they
 * can be re-enabled without re-discovering URLs): Vigilant Guard
 * hazmat drill (Wikimedia, PD) and three Pexels CC0 decon-tent clips.
 *
 * If a clip's CDN URL changes upstream, swap it in CLIPS below; the
 * inner `ClipVideo` handles ranged playback transparently.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

type Clip = {
  /** Stable React key. */
  id: string;
  /** Video source URL (must support range requests for smooth streaming). */
  src: string;
  /** Short description for alt text / debugging. */
  description: string;
  /** Optional in-clip start (seconds). When set with `endTime`, playback
   *  loops within that window instead of the full file. */
  startTime?: number;
  /** Optional in-clip end (seconds). Must be > startTime. */
  endTime?: number;
};

// ─────────────────────────────────────────────────────────────────────
// Clips — order matters: this is the rotation sequence.
//
// NOTE on Pexels URLs:
//   The `/download/video/{id}/` form is a 302 redirect to the canonical
//   `videos.pexels.com/video-files/...` MP4. Browsers follow this
//   transparently when used as a <video> src.
//
// NOTE on Wikimedia URLs:
//   `upload.wikimedia.org/wikipedia/commons/{a}/{ab}/<filename>` where
//   `ab` are the first two hex digits of the MD5 of the underscored
//   filename. The same hashes will keep resolving even if the human-
//   facing description page moves.
// ─────────────────────────────────────────────────────────────────────
const CLIPS: Clip[] = [
  // 1 — Wikimedia: U.S. Military stands up labs / hospital in Liberia.
  //     Public domain (US Army work). 0:27–0:31.
  {
    id: "wm-liberia-labs",
    src: "https://upload.wikimedia.org/wikipedia/commons/d/d1/U.S._Military_Stands_Up_Labs%2C_Hospital_in_Liberia_141016-A-AB123-015.webm",
    description:
      "U.S. military personnel standing up biocontainment labs during the 2014 Liberia Ebola response.",
    startTime: 27,
    endTime: 31,
  },
  // 2 — Wikimedia: COVID-19 Desconfinamento — Brazilian PPE field work.
  //     CC-BY. 2:12–2:22.
  {
    id: "wm-covid-deconfinement",
    src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Covid-19-_Desconfinamento_deve_ser_por_fases_e_sem_precipita%C3%A7%C3%B5es_-_especialista.webm",
    description: "Field workers in full PPE during a COVID-19 response operation.",
    startTime: 132, // 2:12
    endTime: 142, // 2:22
  },
  // ───────────────────────────────────────────────────────────────────
  // Benched — kept in source for fast re-enable, currently off-rotation.
  // Wrap/unwrap the block comment below to toggle.
  // ───────────────────────────────────────────────────────────────────
  /*
  // Wikimedia: Vigilant Guard hazmat training drill.
  // Public domain (US National Guard). 0:32–0:47.
  {
    id: "wm-vigilant-guard",
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Vigilant_Guard_Hazmat_Training_DJtRRB-7EVU.webm",
    description:
      "National Guard Vigilant Guard hazmat training drill — Level-A PPE entry.",
    startTime: 32,
    endTime: 47,
  },
  // Pexels Fahrettin Turgut hazmat drill series (CC0). Played in full.
  {
    id: "pexels-29094730",
    src: "https://www.pexels.com/download/video/29094730/",
    description: "Emergency response team in PPE setting up decontamination tent outdoors.",
  },
  {
    id: "pexels-29094813",
    src: "https://www.pexels.com/download/video/29094813/",
    description: "Hazmat team operating decontamination tent in the field.",
  },
  {
    id: "pexels-29094815",
    src: "https://www.pexels.com/download/video/29094815/",
    description: "Emergency responders in hazmat suits — outdoor field exercise.",
  },
  */
  // 3–5 — CDC Ebola Safety Training (public domain). Three snippets
  //       from the same b-roll file: donning, buddy-team simulation,
  //       supervised doffing. Browser HTTP cache de-dupes the bytes.
  {
    id: "cdc-ebola-doffing-a",
    src: "https://www.cdc.gov/media/video/b-roll/EbolaTrainCDCAL.mp4",
    description: "CDC Ebola training — donning Level-A PPE.",
    startTime: 80, // 1:20
    endTime: 85, // 1:25
  },
  {
    id: "cdc-ebola-buddy",
    src: "https://www.cdc.gov/media/video/b-roll/EbolaTrainCDCAL.mp4",
    description: "CDC Ebola training — buddy-team patient simulation.",
    startTime: 219, // 3:39
    endTime: 230, // 3:50
  },
  {
    id: "cdc-ebola-doffing-b",
    src: "https://www.cdc.gov/media/video/b-roll/EbolaTrainCDCAL.mp4",
    description: "CDC Ebola training — controlled doffing under supervisor cueing.",
    startTime: 239, // 3:59
    endTime: 247, // 4:07
  },
];

// Per-clip display duration is derived from each clip's in-window length
// (see `displayMsFor` below). We used to use a single fixed ROTATE_MS,
// but our windows range from 4s (Liberia) to 11s (CDC buddy-sim), so the
// shorter ones reloop visibly within their visible turn. Per-clip
// scheduling guarantees the rotation always fires BEFORE the natural EOF
// wrap.
const FADE_MS = 1_400;
// How much headroom to leave before the natural EOF wrap so the rotation
// always happens before the in-clip timeupdate-driven reloop snap. The
// wrap fires at `safeEnd - 0.05s`; 800ms gives a comfortable buffer
// across timeupdate cadence variance (typically ~250ms).
const SAFETY_MS = 800;
// Floor — never display a clip for less than this, even if its window
// is shorter than SAFETY_MS would allow.
const MIN_DISPLAY_MS = 2_600;
// Fallback for full-file clips that don't define start/end (none in the
// active rotation today, but the benched Pexels entries do not).
const DEFAULT_DISPLAY_MS = 7_000;

function displayMsFor(clip: Clip): number {
  if (clip.startTime != null && clip.endTime != null) {
    const windowMs = (clip.endTime - clip.startTime) * 1000;
    return Math.max(windowMs - SAFETY_MS, MIN_DISPLAY_MS);
  }
  return DEFAULT_DISPLAY_MS;
}

// ─────────────────────────────────────────────────────────────────────
// ClipVideo — single video layer.
//
// All clips use native autoPlay + muted + playsInline, which is the
// canonical "always works without a gesture" combo. We never disable
// autoPlay — doing so leaves the video frozen on its first frame
// when programmatic play() doesn't fire reliably (event-ordering
// differs across browsers).
//
// Ranged clips (startTime / endTime defined) use:
//   - A `#t=start,end` Media Fragments URI on the src — browsers
//     that honour it (Chrome, Firefox) begin decoding at `start`,
//     skipping the pre-roll. Safari ignores the fragment but our
//     defensive seek on `loadedmetadata` catches that.
//   - `loop={false}` + a JS-driven `timeupdate` loop that wraps to
//     `start` when we hit the (possibly clamped) `end`. This is what
//     stops native loop from snapping to t=0 when the file ends
//     before `end` (the COVID webm's container overshoots its actual
//     stream — this was the source of the "loops after a few seconds"
//     break).
//   - `ended` as a backstop in case we miss the wrap via timeupdate.
// ─────────────────────────────────────────────────────────────────────
function ClipVideo({ clip, isActive }: { clip: Clip; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ranged = clip.startTime != null && clip.endTime != null;
  // Real end clamped to file duration. Initialised to the configured
  // end so the timeupdate handler still works before metadata loads.
  const safeEndRef = useRef<number>(clip.endTime ?? 0);

  // `#t=start,end` is the W3C Media Fragments URI form. Browsers that
  // honour it both START at `start` and PAUSE at `end` — which is fine
  // because our `ended` handler kicks playback back to `start`.
  const src = ranged
    ? `${clip.src}#t=${clip.startTime},${clip.endTime}`
    : clip.src;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !ranged) return;
    const start = clip.startTime!;
    const end = clip.endTime!;

    const onLoadedMetadata = () => {
      // Container duration sometimes overshoots the actual stream
      // (seen on the COVID webm). Clamp so timeupdate's wrap fires
      // BEFORE the browser hits real EOF.
      safeEndRef.current = Math.min(end, v.duration || end);
      // Safari ignores #t= so defensively snap to start if the cold-
      // open didn't honour the fragment.
      if (v.currentTime < start - 0.5 || v.currentTime > safeEndRef.current) {
        v.currentTime = start;
      }
    };

    const onTimeUpdate = () => {
      if (v.currentTime >= safeEndRef.current - 0.05) {
        v.currentTime = start;
      }
    };

    const onEnded = () => {
      // Backstop for short files where timeupdate cadence misses the
      // wrap point. Seek + replay manually so we never show t=0.
      v.currentTime = start;
      v.play().catch(() => {});
    };

    v.addEventListener("loadedmetadata", onLoadedMetadata);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, [ranged, clip.startTime, clip.endTime]);

  // Seek to startTime whenever this clip becomes the active one.
  //
  // Without this, a ranged clip that was preloading silently as the
  // `neighbor` (opacity 0, autoPlay still running so the buffer is warm)
  // would join its visible turn already mid-window — and would then hit
  // the EOF wrap a couple of seconds into being on-screen. That looked
  // like "the video keeps reloop'ing right after it appears." The seek
  // here re-bases every visible turn at the start of the in-source
  // window, so the user always sees the clip from its intended t=start.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !ranged || !isActive) return;
    const start = clip.startTime!;
    // Only seek if we're meaningfully off the start — guards against a
    // no-op seek on first mount (the #t= fragment + onLoadedMetadata
    // path already places us there) and avoids hiccups if the browser
    // is mid-buffer.
    if (Math.abs(v.currentTime - start) > 0.5) {
      v.currentTime = start;
    }
    // Background autoPlay can be paused by the browser when the element
    // was off-screen for long; nudge it back.
    if (v.paused) v.play().catch(() => {});
  }, [isActive, ranged, clip.startTime]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      // Full-file clips loop natively; ranged clips manage looping
      // in JS so we never see a t=0 snap on file-EOF.
      loop={!ranged}
      playsInline
      preload="auto"
      aria-label={clip.description}
      className="absolute inset-0 h-full w-full object-cover"
      style={{
        opacity: isActive ? 1 : 0,
        transition: `opacity ${FADE_MS}ms var(--ease-nt)`,
        // Treatment: desaturate + cool tint so footage reads as
        // "atmospheric" rather than literal documentary. The blue
        // shift ties it to the ink/inv palette of the rest of the
        // page.
        filter: "grayscale(0.7) contrast(1.05) brightness(0.78) hue-rotate(190deg)",
        transform: "scale(1.06)",
      }}
    />
  );
}

export type Scene1FieldProps = {
  /** Whether this scene is the active one (controls rotation timer). */
  active: boolean;
};

export function Scene1Field({ active }: Scene1FieldProps) {
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();

  // Rotate clips while scene is active. We schedule the next rotation
  // based on the CURRENT clip's window length (see `displayMsFor`) so
  // that we always cut to the next clip BEFORE the active clip's
  // in-source EOF wrap — that wrap is what was producing the "lots of
  // reloop" feel under a single fixed 7s interval. The dependency on
  // `idx` here is what makes this a per-clip schedule rather than a
  // tick-based interval.
  useEffect(() => {
    if (!active || reduce) return;
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % CLIPS.length);
    }, displayMsFor(CLIPS[idx]));
    return () => clearTimeout(t);
  }, [active, reduce, idx]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--color-bg-ink)]">
      {/* Stacked video layers, only the active one is opaque. */}
      {CLIPS.map((clip, i) => {
        const isActive = i === idx;
        // Render only the current and the next clip in the DOM. This
        // keeps the decoder count low — important on mid-range devices.
        const isNeighbor = i === (idx + 1) % CLIPS.length;
        if (!isActive && !isNeighbor) return null;
        return <ClipVideo key={clip.id} clip={clip} isActive={isActive} />;
      })}

      {/* Cool overlay tint — pulls the colour toward the page palette
          and adds a subtle dark vignette underneath the headline. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(33,35,38,0.55) 0%, rgba(33,35,38,0.40) 40%, rgba(33,35,38,0.70) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 25% 60%, rgba(33,35,38,0.55) 0%, rgba(33,35,38,0) 60%)",
        }}
      />
    </div>
  );
}
