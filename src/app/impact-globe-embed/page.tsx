import { AdoptionGlobe } from "@/components/impact/AdoptionGlobe";
import { ImpactEmbed } from "@/components/impact/ImpactEmbed";

export const metadata = { title: "Nosotrack · Global adoption", robots: { index: false, follow: false } };

export default function GlobeEmbedPage() {
  return <ImpactEmbed><div className="px-5"><AdoptionGlobe /></div></ImpactEmbed>;
}
