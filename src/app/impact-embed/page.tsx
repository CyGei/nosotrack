// Standalone un-indexed page iframed by public/pitch-deck/index.html so the deck's figures track the site's JSON.
import type { Metadata } from "next";
import { AdoptionReach } from "@/components/impact/AdoptionReach";

export const metadata: Metadata = {
  title: "Nosotrack · Adoption & Team",
  description: "Peer-reviewed science, adopted globally.",
  robots: { index: false, follow: false },
};

// The deck sizes the iframe from this. `min-h-screen` is dropped below `sm`
// (see the page) so scrollHeight tracks the content instead of the iframe,
// which would otherwise feed back into itself and grow without bound.
const REPORT_HEIGHT = `
(function () {
  if (window.parent === window) return;
  var last = 0;
  function post() {
    var h = document.documentElement.scrollHeight;
    if (Math.abs(h - last) < 2) return;
    last = h;
    parent.postMessage({ type: "nt-embed-height", height: h }, "*");
  }
  new ResizeObserver(post).observe(document.documentElement);
  window.addEventListener("load", post);
})();
`;

export default function ImpactEmbedPage() {
  return (
    <>
      <main className="flex min-h-0 flex-col justify-center bg-bg py-[clamp(24px,5vh,64px)] sm:min-h-screen">
        <AdoptionReach />
      </main>
      <script dangerouslySetInnerHTML={{ __html: REPORT_HEIGHT }} />
    </>
  );
}
