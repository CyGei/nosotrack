/**
 * /impact-embed — a standalone, un-indexed page for the pitch deck's slide 6.
 *
 * Renders <AdoptionReach/>: the living globe + adoption figures mixed with the
 * team (photos + short descriptions), no lead paragraph. It reuses the same
 * data (research-metrics.json + research-geo.json) and the shared Globe, so the
 * deck's figures always match the site (both read the committed research JSON),
 * with no numbers frozen into the static deck. Mirrors how the deck embeds the
 * foundry demo. Consumed by public/pitch-deck/index.html · slide 6.
 *
 * Static-export friendly (`output: 'export'` + `trailingSlash: true`): builds
 * to out/impact-embed/index.html, served at /impact-embed/.
 */

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
