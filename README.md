# Nosotrack

Next.js App Router site with a static export for GitHub Pages. React/TypeScript
implements the website; HTML/CSS and small browser scripts implement the decks.

## Development

- `npm ci` installs the locked dependencies.
- `npm run dev` starts the local website.
- `npm run build` type-checks and exports the site to `out/`.
- `npm run build:demo` rebuilds the embedded product demo from `scripts/foundry-demo-src/`.
- `npm run audit:responsive` checks layouts and presentation navigation with Playwright.
- `npm run audit:animations` checks hospital chart playback and replay with motion enabled.

Stop the development server before building: Next.js shares `.next/` between
those processes. Deployment is defined in `.github/workflows/deploy.yml`.

## Where changes belong

| Location | Responsibility |
| --- | --- |
| `src/app/` | Routes, metadata, website styles |
| `src/components/` | Reusable website components |
| `public/deck-template/` | Shared slide layouts, navigation, figures, and playback |
| `public/pitch-deck/` | Hospital content and charts |
| `public/farm-pitch-deck/` | Farm content and partner-specific adjustments |
| `public/cooperl-pitch/` | French Cooperl content and its bespoke styling |
| `templates/partner-deck.html` | Starting point for a new partner presentation |
| `scripts/` | Asset/data generation and browser audit |
| `docs/`, `brand/` | Maintainer notes and brand source assets |

See [the deck guide](public/deck-template/README.md) to add slides or a new partner.
Each deck route uses the same small `PitchDeck` component; the deck itself owns
its viewport layout and keyboard navigation.

`out/`, `.next/`, and `tmp/` are generated or temporary and are ignored.
Keep the generated runtime assets in `public/`: the site uses the demo bundle,
hero clips, model files, and research data. PDF exports are deliverables, not
website source. Legacy `/pitch/` and `/farm-pitch/` redirects preserve shared URLs.
