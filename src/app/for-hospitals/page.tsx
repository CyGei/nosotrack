// Keep the deck's keyboard and scroll handlers isolated from the main website.
import type { Metadata } from "next";
import { PitchDeck } from "@/components/partners/PitchDeck";

export const metadata: Metadata = {
  title: "Nosotrack · For hospitals",
  description: "Outbreak forensics and control for hospitals and infection prevention teams.",
  alternates: { canonical: "https://nosotrack.com/for-hospitals/" },
};

export default function PitchPage() {
  return (
    <PitchDeck
      src="/pitch-deck/index.html"
      title="Nosotrack for hospitals"
    />
  );
}
