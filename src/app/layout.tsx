import type { Metadata, Viewport } from "next";
import { interTight, jetBrainsMono } from "@/lib/fonts";
import { meta } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  metadataBase: new URL("https://nosotrack.com"),
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: "https://nosotrack.com",
    siteName: meta.title,
    images: [
      {
        url: "/images/og-card.png",
        width: 1200,
        height: 630,
        alt: meta.title,
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
      <body>{children}</body>
    </html>
  );
}
