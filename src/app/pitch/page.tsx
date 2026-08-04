// The deck lives under /pitch-deck/ because Next intercepts /pitch/ before public files resolve; iframed so its keyboard/scroll handlers stay isolated.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotrack · Pitch",
  description: "Nosotrack pitch deck.",
};

export default function PitchPage() {
  return (
    <iframe
      src="/pitch-deck/index.html"
      title="Nosotrack pitch deck"
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
