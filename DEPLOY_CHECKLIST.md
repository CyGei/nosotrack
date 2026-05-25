# Deploy checklist — 2026-05-25

## 1. Pitch route fix (do this on `redesign-v4` before merging)

The old `public/pitch/` directory clashed with the `/pitch/` URL —
Next's routing layer intercepts the trailing-slash path before public
files resolve, so visitors hit a 404. The deck has been republished at
`public/pitch-deck/`, and `src/app/pitch/page.tsx` now hosts it in a
full-viewport iframe.

Remove the old copy:

```bash
rm -rf public/pitch/         # contents have been duplicated into public/pitch-deck/
```

Then rebuild + smoke-test locally:

```bash
npm run build
npx serve out                # or any static server, e.g. python -m http.server -d out 8000
# open http://localhost:3000/pitch/   — should now load the deck
```

## 2. Merge to main

Once `/pitch/` works locally:

```bash
git checkout redesign-v4
git add -A
git commit -m "fix: serve pitch deck via Next route to avoid /pitch/ 404"
git push origin redesign-v4

git checkout main
git merge redesign-v4
git push origin main
```

## 3. One-time GH Pages setup (only the first time after merging)

A new GitHub Actions workflow handles the deploy:
`.github/workflows/deploy.yml`. It runs on every push to `main`, builds
the Next.js static export, copies `CNAME` into `out/`, adds `.nojekyll`
(so Pages doesn't 404 the `_next/` chunks), and publishes.

Before it can run successfully, configure the repository once:

1. Open the repo on github.com → **Settings → Pages**
2. Under **Source**, choose **GitHub Actions** (NOT "Deploy from a
   branch"). This is the change — the old setup served from `main`
   root, but Next puts everything in `out/`, so we have to deploy via
   Actions instead.
3. Save.

That's it. Push to `main` and the workflow will deploy.

## 4. Watch the first deploy

After the merge push:

1. Open the repo → **Actions** tab
2. Click the running "Deploy to GitHub Pages" workflow
3. The `build` job takes ~2 min, `deploy` takes ~30 s
4. When it goes green, https://nosotrack.com should serve the new build
   within a minute (Pages caches briefly)

If the workflow fails, the log says exactly which step broke. Most
common issues:
- **`npm ci` fails** — `package-lock.json` out of sync with
  `package.json`. Run `npm install` locally and commit the lockfile.
- **Build fails** — same error you'd see locally. Run `npm run build`
  on your machine, fix the issue, push.
- **Deploy step succeeds but the site shows the old version** — Pages
  caches at the CDN for ~60 s. Wait and reload.

## 5. After-merge sanity check (~2 min after deploy)

Visit each route on https://nosotrack.com :
- `/` — home
- `/privacy/` — privacy policy
- `/terms/` — terms of use
- `/pitch/` — ITCAI pitch deck (vertical scroll-snap; arrow keys / pgup / pgdn)
- `/foundry-demo/index.html?embed=1` — the iframe demo (shouldn't be visited directly, but worth confirming it loads)

If anything 404s on production but works locally, double-check that
`CNAME` made it into `out/` (the workflow's "Copy CNAME" step) and
that the Pages settings point to **GitHub Actions**, not a branch.

—

## Reference: what changed in this audit pass

**Deploy footprint (post-cleanup):** ~12 MB total, ~8.5 MB of which is
the pathogen `.glb` library you knowingly ship. Application + pitch +
foundry-demo + new legal routes account for the remaining ~3.5 MB.

**New routes:** `/privacy/`, `/terms/`, `/pitch/`.

**Source-only directories now living OUTSIDE `public/`** (kept in git,
not deployed):
- `/brand/` — canonical lockup PNGs + SVGs
- `/foundry-demo-src/` — JSX source for the demo iframe (compiled by
  `npm run build:demo` into `public/foundry-demo/bundle.js`)
