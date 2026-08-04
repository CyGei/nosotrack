// Standalone un-indexed page iframed by public/pitch-deck/index.html so the deck's figures track the site's JSON.
import type { Metadata } from "next";
import { AdoptionReach } from "@/components/impact/AdoptionReach";

export const metadata: Metadata = {
  title: "Nosotrack · Adoption & Team",
  description: "Peer-reviewed science, adopted globally.",
  robots: { index: false, follow: false },
};

export default function ImpactEmbedPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-bg py-[clamp(24px,5vh,64px)]">
      <AdoptionReach />
    </main>
  );
}
