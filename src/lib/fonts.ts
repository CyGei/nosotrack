import { Inter_Tight, JetBrains_Mono } from "next/font/google";

export const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display-stack",
  display: "swap",
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
