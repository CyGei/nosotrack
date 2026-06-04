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
 *   6. Team           — founder + advisors
 *   7. Roadmap        — funding phases
 *   8. Contact        — Formspree form
 *   9. Footer         — lockup + fine print
 *
 * Retired: standalone Solution iframe section, DemoCallout video modal.
 */

import { Nav } from "@/components/Nav";
import { Hero } from "@/components/hero/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/about/About";
import { Research } from "@/components/research/Research";
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
        <Team />
        <Roadmap />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
