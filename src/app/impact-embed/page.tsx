// Standalone un-indexed page iframed by public/pitch-deck/index.html so the deck's figures track the site's JSON.
import type { Metadata } from "next";
import { ImpactEmbed } from "@/components/impact/ImpactEmbed";
import { AdoptionReach } from "@/components/impact/AdoptionReach";

export const metadata: Metadata = {
  title: "Nosotrack · Adoption & Team",
  description: "Peer-reviewed science, adopted globally.",
  robots: { index: false, follow: false },
};

export default function ImpactEmbedPage() {
  return <ImpactEmbed><AdoptionReach /></ImpactEmbed>;
}
