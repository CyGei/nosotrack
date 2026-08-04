import type { Metadata, Viewport } from "next";
import { interTight, jetBrainsMono } from "@/lib/fonts";
import { LenisProvider } from "@/components/LenisProvider";
// Required with the JS: without it, wheel events over an <iframe> never reach Lenis and scrolling stalls.
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
        alt: SITE_TITLE,
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
