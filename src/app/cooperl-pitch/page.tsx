import type { Metadata } from "next";
import { PitchViewer } from "./PitchViewer";

export const metadata: Metadata = {
  title: "Nosotrack × Cooperl · Contrôle des épizooties",
  description: "Proposition de collaboration Nosotrack pour Cooperl.",
  robots: { index: false, follow: false },
};

export default function CooperlPitchPage() {
  return <PitchViewer />;
}
