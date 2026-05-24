// Fonts — Inter Tight (display) + JetBrains Mono (mono labels).
// Self-hosted via next/font for zero CLS and offline-safe.
//
// The fallback chain in DESIGN_BRIEF.md §3 reads:
//   --display: 'Inter Tight', 'Alliance No. 1', 'Neue Haas Grotesk', 'Helvetica Neue', Arial, sans-serif;
//   --mono:    'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
// next/font handles fallback metrics so the swap is invisible.

import { Inter_Tight, JetBrains_Mono } from "next/font/google";

export const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display-stack",
  display: "swap",
  // Cover the legacy fallbacks until Inter Tight has loaded.
  fallback: [
    "Alliance No. 1",
    "Neue Haas Grotesk",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-mono-stack",
  display: "swap",
  fallback: ["IBM Plex Mono", "ui-monospace", "monospace"],
});
