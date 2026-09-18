import type { Metadata } from "next";
import { PitchDeck } from "@/components/partners/PitchDeck";

export const metadata: Metadata = {
  title: "Nosotrack · Outbreak forensics and control for farms",
  description:
    "Reconstruct how infections spread within and between farms, and identify targeted control strategies.",
  alternates: { canonical: "https://nosotrack.com/for-farms/" },
  openGraph: {
    title: "Nosotrack for farms",
    description: "Outbreak forensics and control for animal health teams.",
    url: "https://nosotrack.com/for-farms/",
    locale: "en_GB",
    images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "Nosotrack" }],
  },
};

export default function FarmPitchPage() {
  return (
    <PitchDeck
      src="/farm-pitch-deck/index.html"
      title="Nosotrack farm pitch deck"
    />
  );
}
