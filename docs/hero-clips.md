# Hero clips

Self-hosted, pre-trimmed MP4s for the hero's first frame (`Scene1Field`),
plus `poster.jpg` for instant first paint.

**These files are generated, not hand-edited.** Run:

```
npm run build:hero-clips
```

(requires `ffmpeg` on PATH). The script — `scripts/build-hero-clips.mjs` —
fetches each source once, trims it to the window shown, compresses it, and
writes the results here. Commit the output so it ships with the static
export.

To change the collage, edit `SOURCES` in `scripts/build-hero-clips.mjs`
(the clip `id`s must match `CLIPS` in `src/components/hero/Scene1Field.tsx`),
then re-run.

Expected files: `covid-field.mp4`, `cdc-donning.mp4`, `cdc-buddy.mp4`,
`cdc-doffing.mp4`, `poster.jpg`.
