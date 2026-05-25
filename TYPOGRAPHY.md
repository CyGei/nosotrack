# NosoTrack Typography Rules

Single source of truth for type styles across the site. When in doubt,
match these classes verbatim — that's the whole point of writing them
down. If a new element doesn't fit any rule here, the design needs a
new rule, not a one-off override.

Font stack:

- `font-display` → **Inter Tight**. Everything except micro-labels.
- `font-mono` → **JetBrains Mono**. Eyebrows, captions, the hero brand
  headline, any "system" text.

Color tokens (defined in `src/app/globals.css`):

- `text-ink` — darkest, headings
- `text-text` — default body
- `text-mute` — secondary / description-under-heading
- `text-faint` — quietest, micro-labels
- On dark sections (Hero, Contact): swap `ink → inv-hi`,
  `text → inv`, `mute → inv-mute`, `faint → inv-faint`

The whole site lives on four rules. Nothing else.

---

## 1. Section heading

> Block titles and section H2s: "Nosocomial outbreaks are deadly…",
> "Pathogen agnostic, ready for disease X.", "Next Steps",
> "Let's Work Together".

```
font-display font-normal leading-[1.05] tracking-tight text-ink
text-[clamp(32px,3.6vw,56px)] max-w-[20ch]
```

One recipe for every big editorial heading on the page. Weight is
**400 (`font-normal`)** to match the Palantir AIP reference — size
carries the presence, weight stays restrained. Don't reach for
`font-medium` or `font-semibold` here. Hero brand headline (Track.
Intervene. Protect.) is exempt — it's a different beast (mono brand
display, not editorial).

## 2. Body heading / subtitle

> Anything that introduces a piece of copy below a section heading:
> the AboutBlock subtitle, DetailsList row titles, Roadmap card titles,
> the Roadmap and Research intro paragraphs, the Contact subtitle.

```
font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em]
text-ink max-w-[55ch]
```

Regular weight (400), **not** medium. Size carries the emphasis.

On dark: swap `text-ink` → `text-inv-hi`.

## 3. Body paragraph

> Description under a body heading. Mostly lives inside DetailsList rows
> and Roadmap cards. The Hero subtitle is here too (on dark).

```
text-[17px] leading-[1.55] tracking-[-0.005em] text-mute max-w-[60ch]
```

On dark: swap `text-mute` → `text-inv`.

## 4. Mono label

> Sub-column labels inside a section (Team "Founder" / "Advisors"),
> Roadmap phase badges, ticker captions, footer copy, attribution
> lines, paper-row metadata, About DetailsList headers, CTA button
> text.

```
font-mono text-[11px] uppercase tracking-[0.22em] text-faint
```

On dark: `text-inv-hi`.

For navigation links, use slightly tighter tracking (`tracking-[0.18em]`)
since the line of links carries its own rhythm.

**Not for section eyebrows.** The small mono "Roadmap" / "Team" /
"Contact" tags that used to sit above each section heading were retired
(2026-05-25) — every section now opens directly with its rule-1 H2.
Don't add them back. If a section needs a label, the H2 carries it.

---

## Special cases (don't propagate)

- **Hero brand headline** — `font-mono` 2.6→6.4rem with `.hero-accent`
  on the last line. The page's only mono display heading. Don't reuse
  for editorial text.
- **Nav wordmark** — `text-[17px] leading-none`. Brand mark, not a
  paragraph; borrows the 17px size with single-line leading.
- **AboutBlock Video / Details switch** — inline `fontSize: 10` segmented
  toggle. A control, not body text.
- **Team card name** — `font-display text-[16px] font-medium` inside a
  card with a photo. Different role (label for a portrait), not a
  heading.
- **Dossier paper rows** — 14–15px desc inside a scrollable dense list.
  Allowed to be smaller than rule 3 because of context, not because of
  preference.

## Don'ts

- No `font-bold` or `font-semibold` in body content. Body hierarchy is
  carried by size + color, never by weight.
- No new font sizes. If you need something between two existing sizes,
  pick the closer one.
- No new colors. The five tokens above + `--color-alert` are the entire
  palette. Adding a shade means amending this file first.
- No section eyebrow tags above H2s. The page used to open each section
  with a small mono "Roadmap" / "Team" / "Contact" tag; that pattern is
  retired. Sections lead with the H2 (rule 1).
