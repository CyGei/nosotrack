import type { Metadata } from "next";
import { PitchDeck } from "@/components/partners/PitchDeck";

export const metadata: Metadata = {
  title: "Nosotrack × Cooperl · Contrôle des épizooties",
  description: "Proposition de collaboration Nosotrack pour Cooperl.",
  robots: { index: false, follow: false },
};

export default function CooperlPitchPage() {
  return <PitchDeck src="/cooperl-pitch/deck.html" title="Pitch Nosotrack pour Cooperl" lang="fr" />;
}
