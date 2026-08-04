#!/usr/bin/env node
// Removes fetch-pathogen.mjs intermediates the sandbox couldn't unlink — run before
// `npm run build`, or Next.js copies hundreds of MB of dead WRL into out/.

import { readdirSync, unlinkSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelsDir = resolve(__dirname, "..", "public/models");

const KILL_RE = /\.(raw\.[a-z0-9]+|small\.[a-z0-9]+|converted\.glb)$/i;
const KILL_PREFIX_RE = /^.*-test\./i;

let n = 0;
let bytes = 0;
for (const f of readdirSync(modelsDir)) {
  const full = resolve(modelsDir, f);
  if (KILL_RE.test(f) || KILL_PREFIX_RE.test(f)) {
    const sz = statSync(full).size;
    try {
      unlinkSync(full);
      console.log(`  rm ${f} (${(sz / 1024 / 1024).toFixed(1)} MB)`);
      n++;
      bytes += sz;
    } catch (e) {
      console.error(`  failed ${f}:`, e.message);
    }
  }
}
console.log(
  `\nRemoved ${n} file(s), freed ${(bytes / 1024 / 1024).toFixed(1)} MB.`
);
