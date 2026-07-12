/**
 * Home page — DESIGN_BRIEF §7 (rev. 4).
 *
 * Section order:
 *   1. Nav            — fixed overlay, large lockup
 *   2. Hero           — dark canvas, blueprint RIGHT, motto LEFT-TOP
 *   3. Marquee        — capability tags
 *   4. About          — 5 scrolling blocks (Problem → Streams → Hospital
 *                       → Inference → Co-pilot) with foundry visuals
 *                       embedded as React
 *   5. Research       — pathogen catalogue (fixed shapes + side hover)
 *   6. Impact         — "Impact & adoption": the four count-up metrics
 *                       (publications, citations, downloads, tools) in two
 *                       whitespace movements; Downloads fans to a per-tool arc
 *   7. Team           — founder + advisors
 *   8. Roadmap        — funding phases
 *   9. Contact        — Formspree form
 *  10. Footer         — lockup + fine print
 *
 * Retired: standalone Solution iframe section, DemoCallout video modal. The
 * four research/impact figures are consolidated into <ImpactAdoption> (they
 * previously lived as inline tallies in Research + Team).
 */

import { Nav } from "@/components/Nav";
import { Hero } from "@/components/hero/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/about/About";
import { Research } from "@/components/research/Research";
import { ImpactAdoption } from "@/components/impact/ImpactAdoption";
import { Team } from "@/components/Team";
import { Roadmap } from "@/components/Roadmap";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />

      <main id="top">
        <Hero />
        <Marquee />
        <About />
        <Research />
        <ImpactAdoption />
        <Team />
        <Roadmap />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
