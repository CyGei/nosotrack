import type { ReactNode } from "react";

// Measure content rather than the iframe viewport so resizing can also shrink
// the embed without a min-height feedback loop.
const REPORT_HEIGHT = `
(function () {
  if (window.parent === window) return;
  var last = 0;
  function post() {
    var h = document.querySelector('main').scrollHeight;
    if (Math.abs(h - last) < 2) return;
    last = h;
    parent.postMessage({ type: "nt-embed-height", height: h }, "*");
  }
  new ResizeObserver(post).observe(document.querySelector('main'));
  window.addEventListener("load", post);
})();
`;

export function ImpactEmbed({ children }: { children: ReactNode }) {
  return <>
    <main className="flex min-h-0 flex-col justify-center bg-bg py-6">{children}</main>
    <script dangerouslySetInnerHTML={{ __html: REPORT_HEIGHT }} />
  </>;
}
