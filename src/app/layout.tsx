import type { Metadata, Viewport } from "next";
import { interTight, jetBrainsMono } from "@/lib/fonts";
import { LenisProvider } from "@/components/LenisProvider";
import "./globals.css";

const SITE_TITLE = "NosoTrack";
const SITE_DESCRIPTION = "Outbreak forensics and control.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL("https://nosotrack.com"),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "https://nosotrack.com",
    siteName: SITE_TITLE,
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
