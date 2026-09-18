"use client";

/** The deck owns its responsive layout, scroll snapping, and keyboard navigation. */
export function PitchDeck({ src, title, lang = "en" }: { src: string; title: string; lang?: "en" | "fr" }) {
  return <main lang={lang} data-lenis-prevent>
    <iframe
      data-pitch-deck
      src={src}
      title={title}
      allowFullScreen
      onLoad={event => event.currentTarget.contentWindow?.focus()}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100dvh", border: 0, background: "#efeeef" }}
    />
  </main>;
}
