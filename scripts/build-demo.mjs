// Compiles scripts/foundry-demo-src/*.jsx into public/foundry-demo/bundle.js.

import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcDir = resolve(__dirname, 'foundry-demo-src');
const outDir = resolve(root, 'public/foundry-demo');

// Order matters — later files reference globals defined in earlier ones.
const sources = [
    'animations.jsx',
    'common.jsx',
    'integration.jsx',
    'foundry.jsx',
    'dashboard.jsx',
    'main.jsx'
];

async function transform(file) {
    const result = await build({
        entryPoints: [resolve(srcDir, file)],
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
// IIFE per file so top-level `const`/`let` don't collide; cross-file refs go via window.
const wrapped = parts.map((code, i) =>
    `// ── ${sources[i]} ──\n(function(){\n${code}\n})();\n`
);
const bundle = banner + wrapped.join('\n');
writeFileSync(resolve(outDir, 'bundle.js'), bundle, 'utf8');

const sizeKB = (Buffer.byteLength(bundle, 'utf8') / 1024).toFixed(1);
console.log(`✓ wrote public/foundry-demo/bundle.js (${sizeKB} KB)`);
