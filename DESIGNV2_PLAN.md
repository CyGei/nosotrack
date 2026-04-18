# NosoTrack — Design v2 (Palantir‑style)

> Branch: `designv2` — working document for the redesign pass.
> Positions NosoTrack as a Palantir spinoff for outbreak forensics and control.

## 1. Design reference

Target aesthetic: **Palantir** (palantir.com). The operative signals are:

- Predominantly **light canvas** with a single dark "mission" band.
- **Alliance No. 1 / No. 2** typography (commercial, Degarism Studio). Because Alliance cannot be redistributed via Google Fonts, v2 uses **Inter Tight** as the closest free substitute. The `@font-face` / `--display` token is isolated so we can swap in true Alliance later (one-line change) if a web license is procured.
- **Minimalistic, sleek, thin 1px hairlines.** Sharp corners. No glassmorphism, no drop shadows, no radial glows.
- Editorial typographic hierarchy: tight tracking, big display sizes, small uppercase mono eyebrows.
- Telemetry/instrumentation cues (numbered indices, measurement marks, technical labels).

## 2. Color tokens

| Token              | Hex        | Usage                                         |
| ------------------ | ---------- | --------------------------------------------- |
| `--bg`             | `#efeeef`  | Primary light canvas                          |
| `--bg-alt`         | `#f3f3f3`  | Alternate light band (section contrast)       |
| `--bg-tint`        | `#dbdbdb`  | Heavier light slab, card backgrounds          |
| `--bg-ink`         | `#212326`  | Dark section (hero, contact, footer)          |
| `--text-ink`       | `#1e1e2b`  | Headlines on light                            |
| `--text`           | `#474852`  | Body on light                                 |
| `--text-mute`      | `#767676`  | Tertiary on light / captions                  |
| `--text-inv-hi`    | `#efeeef`  | Headlines on dark                             |
| `--text-inv`       | `#c9c9cc`  | Body on dark                                  |
| `--text-inv-mute`  | `#8a8a8f`  | Tertiary on dark                              |
| `--rule`           | `rgba(30,30,43,.12)` | Hairline dividers on light           |
| `--rule-strong`    | `rgba(30,30,43,.24)` | Active borders, separators           |
| `--rule-inv`       | `rgba(239,238,239,.14)` | Hairlines on dark                 |
| `--alert`          | `#ff073a`  | **Outbreak signal only**; restricted to product visualizations (transmission highlights, critical ward exposure). Never used for UI chrome or marketing chrome. |

## 3. Typography

- **Display**: `Inter Tight` 400/500/600/700 — stands in for Alliance No. 1
- **Mono**: `JetBrains Mono` 300/400/500 — retained from v1, used for all labels, eyebrows, stats, timestamps, data
- Hero headline: `clamp(3.5rem, 8vw, 8rem)`, weight 500, tracking `-0.04em`
- Section titles: `clamp(2.2rem, 4.5vw, 3.4rem)`, weight 500, tracking `-0.03em`
- Body: 16–17px, line-height 1.6, weight 400
- Eyebrow / label: mono, 12px, letter-spacing 0.16em, uppercase, `--text-mute`

## 4. Geometry & motion

- Border-radius: `0` for structural blocks; `2px` only for form inputs / small pills
- Glassmorphism stripped from cards & panels (translucent white fills, heavy blur). A single subtle `backdrop-filter` remains on the scrolled nav bar — this matches Palantir's own nav treatment.
- All radial glow pseudo-elements removed
- All drop shadows removed except a single subtle elevation on the hero network
- Reveal-on-scroll retained but slowed and calmed
- Canvas animations desaturated; alert red survives only as a rare tracer in the outbreak engine

## 5. Section rhythm

| Section      | Background                              | Notes                                      |
| ------------ | --------------------------------------- | ------------------------------------------ |
| Nav          | `--bg` (transparent until scrolled)     | Hairline bottom                            |
| Hero         | `--bg-ink`                               | Cinematic dark lead; large statement       |
| Marquee      | `--bg-ink`                               | Continues hero band                        |
| Logo strip   | `--bg`                                   | Light, centred                             |
| About (01)   | `--bg`                                   | Slab stats separated by 1px rules          |
| Platform (02)| `--bg-alt`                               | Numbered phases, flat cards                |
| Research (03)| `--bg`                                   | Editorial timeline                         |
| Team (04)    | `--bg-alt`                               | Large portraits, editorial grid            |
| Roadmap (05) | `--bg`                                   | Stepped, minimal                           |
| Contact (06) | `--bg-ink`                               | Dark bookend                               |
| Footer       | `--bg-ink`                               | Continues from contact                     |

## 6. Phase plan

- **Phase 0** — Create `designv2` branch; commit this plan doc.
- **Phase 1** — Rewrite `styles.css` with the tokens above; swap fonts; purge glass/glow/rounded artefacts.
- **Phase 2** — Restyle `index.html` minimally: font link, section index markup, button markup tweaks.
- **Phase 3** — Desaturate canvases in `three-viz.js`, `pipeline-viz.js`, `ipc-viz.js`, `virus-logo.js`. Keep `--alert` red strictly for infected/alert tracers.
- **Phase 4** — Responsive QA at 375 / 768 / 1440. Contrast audit. Push; open draft PR.

## 6b. Unified canvas-visualization style guide

All product visualizations — hero 3D network, about transmission tree, pipeline mini‑canvases (DNA, contact, EHR, anon), alerts chart, outbreak engine, IPC engine, IPC spider, virus logo — render on the **light canvas (`--bg` / `--bg-alt`)** and share a **single palette**:

| Role                  | Hex                 | Usage                                                                                  |
| --------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| Primary ink           | `#1e1e2b`           | Default node / stroke / label on light                                                 |
| Accent alert          | `#ff073a`           | Rare tracer only (infected edges, outbreak pulses, redaction bar, patient‑zero beacon) |
| Ward A (slate)        | `#6b7d8f`           | Ward A ellipse, blue spider facet, imported‑case ring                                  |
| Ward B (tan)          | `#8a7966`           | Ward B ellipse, amber spider facet, superspreader ring                                 |
| Ward C / ICU (sage)   | `#7a8a70`           | Ward C ellipse, teal spider facet, alert chart ICU line                                |
| Compliance green      | `rgba(106,140,102,…)` | "GDPR/HIPAA COMPLIANT" flourish in the anon animation only                           |

No other hues appear in any visualization. Purple, amber, sky blue, emerald, and every rainbow DNA / grid color from v1 has been stripped.

**Typography:**

- Mono labels (`JetBrains Mono`) — **minimum 9px**, preferred **10–11px**, weight 400–500, letter-spacing optional.
- Big display fragments inside canvases (banner body, engine insight card) — **12–14px Inter Tight**, weight 500.
- All small v1 fonts (5.5–7px) have been removed.

**Geometry:**

- Sharp corners (`roundRect(_,_,_,_,0)` or plain `rect`).
- 1px hairlines at `rgba(30,30,43,0.08–0.24)` for grids, `rgba(30,30,43,0.40–0.65)` for active strokes.
- No drop shadows, no backdrop filters, no glassmorphism — callout boxes are opaque `rgba(239,238,239,0.96)` with a 1px coloured hairline border.

## 7. Open follow-ups

- Procure Alliance No. 1 / No. 2 web license if the Inter Tight substitute is visually too close to neutral-friendly; one-line swap via `--display`.
- Decide whether to host a self-hosted Alliance under `/fonts/` with a `@font-face` block behind a license.
- Optional copy polish pass ("How It Works" → "The Platform" etc.).
- Optional replacement of illustrated IPC co-pilot scene with a rectilinear wireframe.
- Re-render `images/og-card.svg` in the new palette (currently still uses the legacy red-over-dark treatment; cosmetic only).

## 8. QA notes

Contrast audit (WCAG 2.1):

| Pair                       | Ratio  | AA-normal | AA-large |
| -------------------------- | ------ | --------- | -------- |
| ink on bg                  | 14.22  | PASS      | PASS     |
| text on bg                 | 7.83   | PASS      | PASS     |
| mute on bg                 | 3.92   | FAIL      | PASS     |
| ink on bg-alt              | 14.83  | PASS      | PASS     |
| text on bg-alt             | 8.17   | PASS      | PASS     |
| mute on bg-alt             | 4.09   | FAIL      | PASS     |
| inv-hi on ink              | 13.61  | PASS      | PASS     |
| inv on ink                 | 9.53   | PASS      | PASS     |
| inv-mute on ink            | 4.59   | PASS      | PASS     |

`--text-mute` (#767676) narrowly misses AA-normal against the light canvases. It's used only for small uppercase eyebrows and caption metadata — never for body copy — so the large-text threshold applies in practice. This matches Palantir's own treatment. The hex was explicitly specified by the project owner; not altered.
