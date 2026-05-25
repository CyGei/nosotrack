# Deploy checklist — 2026-05-25 audit

Run from the repo root. The sandbox can't `rm` files inside the mounted
repo (overlay / uid mapping), so all delete + git operations are below.

## 1. Remove orphan files

```bash
# unused images
rm public/images/shaun.jpg
rm public/images/og-card.svg          # source SVG; .png is what layout.tsx ships

# session-scratch left behind
rm .Rhistory
rm tsconfig.tsbuildinfo

# one-shot script already executed
rm scripts/cleanup-audit-2026-05-25.sh

# sed backup from the pitch path-rewrite
rm public/pitch/index.html.bak

# stale build output (gitignored, but cleaning the working tree)
rm -rf out/ .next/
```

## 2. Move source-only assets out of `public/`

The website never references `public/brand/` (Nav is inline SVG,
`<BrandWordmark />` is rendered text). The website never loads the
foundry-demo `*.jsx` either — only `bundle.js`. Both were shipping ~320 KB
of dead weight to GitHub Pages on every deploy.

Canonical copies now live at repo root `/brand/` and `/foundry-demo-src/`
(already in place, with a README in `/brand/`). Remove the public dupes:

```bash
rm -rf public/brand/
rm public/foundry-demo/animations.jsx
rm public/foundry-demo/common.jsx
rm public/foundry-demo/dashboard.jsx
rm public/foundry-demo/foundry.jsx
rm public/foundry-demo/main.jsx
```

`public/foundry-demo/` will be left with just `index.html` + `bundle.js`,
which is all the iframe actually needs.

## 3. Verify

```bash
npx tsc --noEmit            # should exit 0
npm run build:demo          # rebuilds bundle.js from foundry-demo-src/
npm run build               # produces ./out for GH Pages
```

Quick sanity checks once `out/` is built:

```bash
ls out/foundry-demo/                  # only index.html + bundle.js
ls out/brand/ 2>/dev/null && echo "BAD — brand/ still being shipped"
ls out/pitch/                         # index.html + styles.css + playbar.js + assets/
```

## 4. Commit

```bash
rm -f .git/index.lock                 # in case a stale lock is hanging around
git add -A
git status                            # eyeball the diff
git commit -m "chore: pre-deploy audit — slim public/, add /privacy /terms /pitch routes"
git push origin redesign-v4
```

## What changed in this pass

**New:**
- `src/app/privacy/page.tsx` — legal page, Next.js route, v4 design tokens
- `src/app/terms/page.tsx` — legal page, Next.js route
- `public/pitch/` — full ITCAI pitch deck rehydrated as static HTML (66 KB
  HTML + 66 KB CSS + 8 KB JS + 140 KB image)
- `/brand/` (repo root) — canonical brand lockups + icons, kept in git
  but not deployed
- `/foundry-demo-src/` (repo root) — JSX source for the demo iframe,
  edited here, compiled to `public/foundry-demo/bundle.js`
- `/brand/README.md` — explains why the brand files moved
- `DEPLOY_CHECKLIST.md` — this file

**Edited:**
- `scripts/build-demo.mjs` — reads from `foundry-demo-src/`, writes
  bundle.js to `public/foundry-demo/`
- `src/components/footer/Footer.tsx` — footer links now point to
  `/privacy/`, `/terms/`, `/pitch/` (were `privacy.html` / `terms.html`)
- `.gitignore` — added `.Rhistory`

**Net deploy-size delta:**
- −320 KB (foundry-demo `*.jsx` + `public/brand/` out of `public/`)
- −172 KB (shaun.jpg + og-card.svg)
- +352 KB (pitch deck restored)
- Total: ~140 KB *smaller* deploy footprint, plus three pages back.
