import type { Metadata, Viewport } from "next";
import { interTight, jetBrainsMono } from "@/lib/fonts";
import { LenisProvider } from "@/components/LenisProvider";
// Lenis's own stylesheet is REQUIRED alongside the JS, not optional. It
// supplies the rules that keep the smooth-scroll honest — most importantly
// `.lenis.lenis-smooth iframe { pointer-events: none }`, which lets wheel
// events that land over an <iframe> (the foundry-demo embeds in About) reach
// Lenis instead of being swallowed by the iframe's own document. Without it,
// scrolling stalls whenever the cursor is over an embed and then jumps once
// it leaves — the "jumpy after the hero" symptom. Also sizes the root for
// root-mode scrolling and wires `data-lenis-prevent` overscroll containment.
import "lenis/dist/lenis.css";
import "./globals.css";

// BRAND for the logo / OG card; SITE_TITLE for text (<title>, prose, alt).
const SITE_TITLE = "Nosotrack";
const BRAND = "NOSOTRACK";
const SITE_DESCRIPTION = "Outbreak forensics and control.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL("https://nosotrack.com"),
  openGraph: {
    title: BRAND,
    description: SITE_DESCRIPTION,
    url: "https://nosotrack.com",
    siteName: BRAND,
    images: [
      {
        url: "/images/og-card.png",
        width: 1200,
        height: 630,
        alt: SITE_TITLE, // read aloud, so text-cased not BRAND
      },
    ],
    locale: "en_GB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#efeeef", // matches --bg, the default cream canvas
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
