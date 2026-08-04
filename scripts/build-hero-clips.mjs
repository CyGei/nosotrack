#!/usr/bin/env node
// Trims the hero source videos into small local MP4s + a poster in public/hero/.
// Requires ffmpeg on PATH. Each `id` is the filename and must match Scene1Field.tsx.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "hero");

// Order mirrors the on-screen rotation in Scene1Field; `start`/`end` are seconds
// into the source file.
const SOURCES = [
  {
    id: "covid-field",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Covid-19-_Desconfinamento_deve_ser_por_fases_e_sem_precipita%C3%A7%C3%B5es_-_especialista.webm",
    start: 132,
    end: 142,
    note: "Wikimedia (CC-BY) — COVID-19 PPE field work.",
  },
  {
    id: "cdc-donning",
    url: "https://www.cdc.gov/media/video/b-roll/EbolaTrainCDCAL.mp4",
    start: 80,
    end: 85,
    note: "CDC (PD) — donning Level-A PPE.",
  },
  {
    id: "cdc-buddy",
    url: "https://www.cdc.gov/media/video/b-roll/EbolaTrainCDCAL.mp4",
    start: 219,
    end: 230,
    note: "CDC (PD) — buddy-team patient simulation.",
  },
  {
    id: "cdc-doffing",
    url: "https://www.cdc.gov/media/video/b-roll/EbolaTrainCDCAL.mp4",
    start: 239,
    end: 247,
    note: "CDC (PD) — supervised doffing.",
  },
];

const WIDTH = 1280;
const FPS = 24;
const CRF = 28;

// Wikimedia rate-limits ffmpeg's default "Lavf/.." UA with HTTP 429.
const USER_AGENT =
  "NosotrackHeroBuild/1.0 (https://nosotrack.org; hero clip build script)";
const MAX_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 4000;

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.error) throw r.error;
  return r.status === 0;
}

function hasFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return !r.error && r.status === 0;
}

const sleep = (ms) => spawnSync("sleep", [String(ms / 1000)]);

// ffmpeg can exit 0 yet leave a 0-byte file when a ranged request is throttled.
function builtOk(path) {
  try {
    return statSync(path).size > 1024;
  } catch {
    return false;
  }
}

const httpInputArgs = [
  "-user_agent", USER_AGENT,
  "-reconnect", "1",
  "-reconnect_streamed", "1",
  "-reconnect_on_network_error", "1",
  "-reconnect_delay_max", "10",
];

function main() {
  if (!hasFfmpeg()) {
    console.error(
      "\n✗ ffmpeg not found on PATH.\n" +
        "  Install it, then re-run `npm run build:hero-clips`.\n" +
        "  macOS:  brew install ffmpeg\n" +
        "  Ubuntu: sudo apt install ffmpeg\n" +
        "  Windows: https://ffmpeg.org/download.html\n",
    );
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const succeeded = [];
  const failed = [];

  for (const clip of SOURCES) {
    const dur = (clip.end - clip.start).toFixed(3);
    const out = join(OUT_DIR, `${clip.id}.mp4`);
    console.log(`\n→ ${clip.id}  (${dur}s)  — ${clip.note}`);

    let ok = false;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS && !ok; attempt++) {
      if (attempt > 1) {
        console.log(`  ↻ retry ${attempt}/${MAX_ATTEMPTS} (last attempt was throttled/dropped)…`);
        sleep(RETRY_BACKOFF_MS * (attempt - 1));
      }
      // `-ss` before `-i`: seeks via HTTP range requests instead of pulling the whole file.
      run("ffmpeg", [
        "-y",
        ...httpInputArgs,
        "-ss", String(clip.start),
        "-i", clip.url,
        "-t", dur,
        "-an",
        "-vf", `scale=${WIDTH}:-2,fps=${FPS}`,
        "-c:v", "libx264",
        "-profile:v", "high",
        "-pix_fmt", "yuv420p",
        "-crf", String(CRF),
        "-preset", "slow",
        "-movflags", "+faststart",
        out,
      ]);
      ok = builtOk(out);
    }

    if (ok) {
      const kb = Math.round(statSync(out).size / 1024);
      console.log(`  ✓ ${clip.id}.mp4 (${kb} KB)`);
      succeeded.push(clip.id);
    } else {
      console.error(`  ✗ ${clip.id} failed after ${MAX_ATTEMPTS} attempts.`);
      failed.push(clip.id);
    }
  }

  if (succeeded.length > 0) {
    const src = join(OUT_DIR, `${succeeded[0]}.mp4`);
    console.log(`\n→ poster.jpg  (from ${succeeded[0]})`);
    run("ffmpeg", [
      "-y",
      "-ss", "0.3",
      "-i", src,
      "-frames:v", "1",
      "-update", "1", // ffmpeg 8.x requires this for single-image output
      "-vf", `scale=${WIDTH}:-2`,
      "-q:v", "4",
      join(OUT_DIR, "poster.jpg"),
    ]);
    if (!builtOk(join(OUT_DIR, "poster.jpg"))) {
      // 0.3s may be past the end of a very short clip; retry from the first frame.
      run("ffmpeg", [
        "-y", "-i", src, "-frames:v", "1",
        "-update", "1",
        "-vf", `scale=${WIDTH}:-2`, "-q:v", "4",
        join(OUT_DIR, "poster.jpg"),
      ]);
    }
  }

  console.log("\n────────────────────────────────────");
  console.log(`✓ built:  ${succeeded.join(", ") || "(none)"}`);
  if (failed.length) {
    console.log(`✗ failed: ${failed.join(", ")}`);
    console.log(
      "\nFailed clips are usually upstream rate-limiting (HTTP 429) or a\n" +
        "moved URL. Re-run `npm run build:hero-clips` in a minute — only the\n" +
        "missing clips are rebuilt-worthy, and Scene1Field skips any clip\n" +
        "whose file is absent. Update the URL in SOURCES if it 404s.",
    );
    process.exitCode = 1;
  } else {
    console.log("\nCommit public/hero/ so the clips ship with the static export.");
  }
}

main();
