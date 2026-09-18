"use client";

import { useEffect } from "react";

// GitHub Pages has no server redirect rules. Retain shared links in the static export.
export function LegacyPitchRedirect({ href, label }: { href: string; label: string }) {
  useEffect(() => {
    window.location.replace(`${href}${window.location.search}${window.location.hash}`);
  }, [href]);

  return <main className="container-page" style={{ paddingTop: 100 }}>
    <noscript><meta httpEquiv="refresh" content={`0;url=${href}`} /></noscript>
    <a href={href}>Continue to Nosotrack · {label} →</a>
  </main>;
}
