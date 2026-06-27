/**
 * /pitch — ITCAI pitch deck.
 *
 * The deck itself is a self-contained static HTML app
 * (`public/pitch-deck/index.html` + its own `styles.css` / `playbar.js` /
 * `assets/`). It can't live at `public/pitch/index.html` because Next's
 * routing layer intercepts `/pitch/` before public files resolve — so
 * we host the deck under `/pitch-deck/` and serve it from this route via
 * a full-viewport iframe. The URL stays clean (`/pitch/`) and the deck
 * gets its own document so its scroll-snap chrome and keyboard handlers
 * don't fight with the host site.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotrack · Pitch",
  description: "Nosotrack ITCAI pitch deck.",
};

export default function PitchPage() {
  return (
    <iframe
      src="/pitch-deck/index.html"
      title="Nosotrack pitch deck"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
        margin: 0,
        padding: 0,
        background: "#efeeef",
      }}
    />
  );
}
