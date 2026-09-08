import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotrack × Cooperl · Contrôle des épizooties",
  description: "Proposition de collaboration Nosotrack pour Cooperl.",
  robots: { index: false, follow: false },
};

export default function CooperlPitchPage() {
  return (
    <iframe
      src="/cooperl-pitch/deck.html"
      title="Pitch Nosotrack pour Cooperl"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
        margin: 0,
        padding: 0,
        background: "#efeeef",
      }}
    />
  );
}
