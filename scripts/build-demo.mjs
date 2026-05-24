// scripts/build-demo.mjs
// Pre-compiles the Foundry demo's JSX files into a single bundle.js.
// Replaces the runtime Babel-standalone transform that used to live in
// foundry-demo/index.html (which pulled ~3 MB of Babel and a slow per-file
// transform on every page load). Run via `npm run build:demo`.
//
// Source-of-truth lives in `public/foundry-demo/`. Next's static export
// copies everything under `public/` to `out/`, so the iframe at
// `/foundry-demo/index.html` is served straight from there. Edit the .jsx
// files in `public/foundry-demo/` and re-run this script to regenerate
// the bundle alongside them.

import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const demoDir = resolve(root, 'public/foundry-demo');

// Order matters — later files reference globals defined in earlier ones.
const sources = [
    'animations.jsx',  // Stage, Sprite, Timeline, easing helpers
    'common.jsx',      // BrandIntro and shared component primitives
    'foundry.jsx',     // FoundryStack
    'dashboard.jsx',   // DashboardScene
    'main.jsx'         // root render
];

async function transform(file) {
    const result = await build({
        entryPoints: [resolve(demoDir, file)],
        bundle: false,
        write: false,
        loader: { '.jsx': 'jsx' },
        jsx: 'transform',
        target: 'es2020',
        minify: true,
        legalComments: 'none',
        sourcemap: false
    });
    return result.outputFiles[0].text;
}

const banner = `// foundry-demo bundle.js — DO NOT EDIT BY HAND.
// Built from ${sources.join(', ')}. Regenerate with \`npm run build:demo\`.
`;

const parts = await Promise.all(sources.map(transform));
// Wrap each file in an IIFE so top-level `const`/`let` don't collide. Cross-
// file refs already go through window via `Object.assign(window, {...})`.
const wrapped = parts.map((code, i) =>
    `// ── ${sources[i]} ──\n(function(){\n${code}\n})();\n`
);
const bundle = banner + wrapped.join('\n');
writeFileSync(resolve(demoDir, 'bundle.js'), bundle, 'utf8');

const sizeKB = (Buffer.byteLength(bundle, 'utf8') / 1024).toFixed(1);
console.log(`✓ wrote public/foundry-demo/bundle.js (${sizeKB} KB)`);
