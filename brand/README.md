# Nosotrack brand assets

Canonical brand marks. **Do not regenerate these files.** They are the
source-of-truth lockups and icons for any marketing or partner-supplied
material. The website itself does *not* load them at runtime — the Nav
renders an inline SVG and `<BrandWordmark />` is hand-rolled text — so
they are deliberately kept out of `public/` to avoid shipping ~140 KB of
PNG/SVG that nothing consumes.

Use them when:
- An external party (press, partner, conference) needs the logo
- We need to regenerate the OG card (`public/images/og-card.png`)
- We need a favicon / app icon in a future pass

Files:
- `nosotrack_lockup_{light,dark}.{svg,png}` — primary horizontal lockup
- `nosotrack_icon_{light,dark}.{svg,png}` — square mark only
