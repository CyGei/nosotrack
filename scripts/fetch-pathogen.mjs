#!/usr/bin/env node
// Downloads a NIH 3D entry, converts + optimizes it to public/models/<slug>.glb,
// and prints a PathogenSpec stub. Requires `gltfpack` (falls back to npx).

import { writeFileSync, mkdirSync, existsSync, statSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { convertToGlb } from "./lib/convert-to-glb.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const modelsDir = resolve(root, "public/models");

const [entryArg, slugArg, siArg] = process.argv.slice(2);
if (!entryArg || !slugArg) {
  console.error(
    "Usage: node scripts/fetch-pathogen.mjs <nih3d-entry-id> <slug> [si=auto]"
  );
  process.exit(1);
}

const entryId = String(entryArg).toLowerCase().replace(/^3dpx-?/, "");

console.log(`> Fetching NIH 3D entry ${entryId}…`);
const metaRes = await fetch(`https://3d.nih.gov/api/entries/${entryId}`);
if (!metaRes.ok) {
  console.error(`  failed (HTTP ${metaRes.status})`);
  process.exit(1);
}
const meta = await metaRes.json();

const subs = (meta.submissions || []).filter(
  (s) => s.submissionStatus === "Published"
);
subs.sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
const latest = subs[0];
if (!latest) {
  console.error("  no published submission on this entry");
  process.exit(1);
}

const allFiles = [
  ...(latest.inputFiles || []),
  ...(latest.outputFiles || []),
];

const PREF = ["GLB", "WRL", "STL"];
let chosen = null;
for (const fmt of PREF) {
  const f = allFiles.find((x) => x.fileFormat === fmt);
  if (f) {
    chosen = { ...f, format: fmt };
    break;
  }
}
if (!chosen) {
  console.error(
    `  no supported source on entry ${entryId} (had: ${allFiles
      .map((f) => f.fileFormat)
      .filter(Boolean)
      .join(", ")})`
  );
  process.exit(1);
}

const md = latest.metadata || {};
const title = md.title || "(untitled)";
const license = md.license || "unknown";
const creator = (md.userInfo || {}).createdBy || "(unknown)";
console.log(`  ${title}  ·  ${license}  ·  by ${creator}`);
console.log(
  `  source: ${chosen.name} (${chosen.format}, ${(chosen.fileSize / 1024 / 1024).toFixed(1)} MB)`
);

// /api/files/<id> is the direct-file endpoint; entries/download/… returns HTML.
console.log(`> Downloading…`);
const dlRes = await fetch(`https://3d.nih.gov/api/files/${chosen.fileId}`);
if (!dlRes.ok) {
  console.error(`  failed (HTTP ${dlRes.status})`);
  process.exit(1);
}
const ab = await dlRes.arrayBuffer();
if (!existsSync(modelsDir)) mkdirSync(modelsDir, { recursive: true });
const ext = chosen.format.toLowerCase();
const rawPath = resolve(modelsDir, `${slugArg}.raw.${ext}`);
writeFileSync(rawPath, Buffer.from(ab));
console.log(`  wrote ${rawPath} (${(ab.byteLength / 1024 / 1024).toFixed(1)} MB)`);

let preGltfpackPath = rawPath;
const isGlbSource = chosen.format === "GLB";
if (!isGlbSource) {
  // three's VRMLLoader holds the whole vertex set at once — past ~60 MB of raw
  // WRL it OOMs an 8 GB Node heap, so pre-decimate by vertex clustering.
  let loaderInput = rawPath;
  if (chosen.format === "WRL" && ab.byteLength > 60 * 1024 * 1024) {
    const sizeMB = ab.byteLength / 1024 / 1024;
    const grid = sizeMB > 130 ? 64 : sizeMB > 80 ? 96 : 128;
    console.log(
      `> Pre-decimating ${chosen.format} (${sizeMB.toFixed(0)} MB) with vertex clustering grid=${grid}…`
    );
    const decimated = resolve(modelsDir, `${slugArg}.small.wrl`);
    const dec = spawnSync(
      "python3",
      [
        resolve(__dirname, "lib/decimate-wrl.py"),
        rawPath,
        decimated,
        String(grid),
      ],
      { stdio: "inherit" }
    );
    if (dec.status !== 0) {
      console.error("  decimation failed");
      process.exit(1);
    }
    loaderInput = decimated;
  }

  console.log(`> Converting ${chosen.format} → GLB via three.js…`);
  const convertedPath = resolve(modelsDir, `${slugArg}.converted.glb`);
  const r = await convertToGlb(loaderInput, convertedPath, ext);
  console.log(
    `  ${r.meshes} mesh(es), ${r.verts.toLocaleString()} verts → ${(r.bytes / 1024 / 1024).toFixed(1)} MB`
  );
  preGltfpackPath = convertedPath;
}

const si = siArg ?? (isGlbSource ? "0.30" : "0.10");

console.log(`> Running gltfpack -si ${si} ${isGlbSource ? "" : "-sa -sp "}-cc…`);
const outPath = resolve(modelsDir, `${slugArg}.glb`);
const baseArgs = ["-i", preGltfpackPath, "-o", outPath, "-si", si, "-cc"];
// -sa -sp: converted cutaways are disjoint surfaces gltfpack won't simplify otherwise.
const gltfpackArgs = isGlbSource ? baseArgs : [...baseArgs, "-sa", "-sp"];

let res = spawnSync("gltfpack", gltfpackArgs, { stdio: "inherit" });
if (res.error || res.status !== 0) {
  console.log("  gltfpack not on PATH, falling back to `npx gltfpack`…");
  res = spawnSync("npx", ["--yes", "gltfpack", ...gltfpackArgs], {
    stdio: "inherit",
  });
}
if (res.status !== 0) {
  console.error("  optimization failed");
  process.exit(1);
}

// Best-effort: some sandboxes deny unlink on mounted dirs.
const safeUnlink = (p) => {
  try { unlinkSync(p); } catch { /* noop */ }
};
safeUnlink(rawPath);
if (preGltfpackPath !== rawPath) safeUnlink(preGltfpackPath);

const sizeKb = Math.round(statSync(outPath).size / 1024);
console.log(`  optimized → ${outPath} (${sizeKb} KB)`);

const upperSlug = slugArg
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, "_")
  .replace(/^_|_$/g, "");

const normLicense =
  license === "CC-BY"
    ? "CC-BY 4.0"
    : license === "CC-BY-NC"
      ? "CC-BY-NC 4.0"
      : license === "Public Domain"
        ? "Public Domain"
        : license;

const defaultClassifier = `{ kind: "radial", cutoffRatio: 0.78 }`;

console.log("");
console.log(
  "─────────────────── Paste into src/components/research/pathogens/"
);
console.log("");
console.log(`// src/components/research/pathogens/${slugArg}.ts`);
console.log(`import type { PathogenSpec } from "./types";`);
console.log("");
console.log(`export const ${upperSlug}: PathogenSpec = {`);
console.log(`  id: ${JSON.stringify(slugArg)},`);
console.log(`  name: ${JSON.stringify(title)},`);
console.log(`  modelUrl: ${JSON.stringify(`/models/${slugArg}.glb`)},`);
console.log(`  // TODO: pick the right classifier for this specimen.`);
console.log(`  //   - radial      → spherical virion with surface projections`);
console.log(`  //   - axial       → filamentous virion (Ebola, Marburg)`);
console.log(`  //   - material-name → cutaway with one material per component`);
console.log(`  //   - mesh-name   → cutaway with named nodes but shared material`);
console.log(`  //   - all-grey    → smooth capsid with no projections`);
console.log(`  classifier: ${defaultClassifier},`);
console.log(`  source: {`);
console.log(
  `    nih3dEntryId: ${JSON.stringify(meta.threedpxId || `3DPX-${entryId.padStart(6, "0")}`)},`
);
console.log(
  `    nih3dEntryUrl: ${JSON.stringify(`https://3d.nih.gov/entries/${(meta.threedpxId || `3dpx-${entryId.padStart(6, "0")}`).toLowerCase()}`)},`
);
console.log(`    creator: ${JSON.stringify(creator)},`);
console.log(`    license: ${JSON.stringify(normLicense)},`);
console.log(`  },`);
console.log(`};`);
console.log("");
console.log(
  "Then append it to PATHOGENS in src/components/research/pathogens/index.ts."
);
