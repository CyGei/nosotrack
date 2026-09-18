# Shared presentation template

The slide fills the viewport. CSS adapts typography, spacing, and columns;
`deck.js` measures the remaining space between the header and footer and scales
only overflowing content as a final safeguard. There is no fixed desktop canvas
or viewer toolbar. Arrow keys, Space, Page Up/Down, Home/End, and native scroll
snapping navigate the deck. `F` enters fullscreen where supported.

## Add a partner deck

1. Copy `templates/partner-deck.html` to `public/<partner>-pitch/index.html`.
2. Set the page title, language, tagline, and partner-specific content.
3. Add `src/app/for-<partner>/page.tsx`, exporting metadata and rendering:

   ```tsx
   import { PitchDeck } from "@/components/partners/PitchDeck";

   export default function PartnerPage() {
     return <PitchDeck src="/<partner>-pitch/index.html" title="Nosotrack for partner" />;
   }
   ```

4. Add the public route to `src/app/for-partners/PartnerChoices.tsx` if appropriate.
5. Add it to `scripts/audit-responsive.mjs`, then run the audit and production build.

Use the starter, not a copy of the Cooperl deck: Cooperl retains bespoke branding
and local layout adjustments. All three decks share the viewport/navigation
runtime, playback wiring, transmission illustration, and relevant farm figures.

## Authoring slides

Each `.slide` contains `.slide-top`, `.slide-body`, and `.slide-bottom`.
The runtime supplies branding, numbering, and navigation from the actual slide
list. IDs can be descriptive; inserting a slide does not require changing the
runtime or hard-coded slide counts. Standard layout primitives:

- `.hero-split` with `.hero-left` and `.hero-right`: opening composition.
- `.split` with `.split-left` and `.split-right`: supporting text and a visual.
- `.closing-body` and `.closing-grid`: closing message.
- `.slide-title`, `.slide-lead`, `.bullets`: shared typography.

One message and one principal visual per slide usually work best. Keep supporting
copy short. Portrait layouts reflow within the full-height frame; particularly
dense material may still shrink to fit, so verify it at the smallest supported size.

## Shared files and optional figures

- `deck.css`: tokens, typography, and reusable layout components.
- `responsive.css`: viewport fitting, responsive compositions, and demo fullscreen.
- `deck.js`: branding, slide fitting, numbering, and keyboard/scroll navigation.
- `transmission-tree.js`: SVGs with `data-transmission-tree="hospital"` or `"farm"`.
  Use `"farm-hierarchy"` for a farm chain with a closer view of buildings within one farm.
  Multiple instances use independent SVG marker IDs.
- `farm-figures.css`, `farm-infection.js`, `assets/`: shared farm illustrations.
- `jigsaw.js`: the evidence puzzle; its SVG declares labels through `data-*` attributes.
  Optional `data-contacts-icon` and `data-records-icon` select icons such as `ehr` or `paper`.
- `playbar.js`, `demo.js`: shared embedded-demo controls. Load playbar before demo.

For a product demo, use a `[data-demo]` figure containing an iframe and a
`.demo-playbar` mount. Include the shared playback scripts; do not copy the
message listeners. For diagrams, only include the scripts the deck actually uses.

Load shared styles first, local figure styling next, and `responsive.css` last.
Use `defer` for scripts. Keep content in HTML, deck-specific graphics in local
CSS/JS, and reusable behavior here. Avoid slide-number selectors in new code.
Load `deck.js` before figure scripts. Use `window.observeSlideAnimation(element,
play, reset)` to start figures when their slide becomes active and cancel/reset
them on departure. Respect `prefers-reduced-motion` when animating.
`data-deck-tagline` customizes the standard header; `data-custom-chrome` preserves
Cooperl's existing headers and skips standard title animation.
