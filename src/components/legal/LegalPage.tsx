import type { ReactNode } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Prose } from "./Prose";

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Nav />

      <main id="top" className="bg-bg">
        <article className="mx-auto max-w-[720px] px-6 pb-[clamp(64px,10vh,120px)] pt-[clamp(96px,12vh,160px)]">
          <Link
            href="/"
            className="mb-8 inline-block font-mono text-[12px] text-mute transition-colors hover:text-ink"
          >
            ← Back to Nosotrack
          </Link>

          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
            Legal
          </div>

          <h1 className="mb-2 font-display text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-tight text-ink">
            {title}
          </h1>

          <p className="mb-12 font-mono text-[12px] text-mute">
            Last updated: {lastUpdated}
          </p>

          <Prose>{children}</Prose>
        </article>
      </main>

      <Footer />
    </>
  );
}
