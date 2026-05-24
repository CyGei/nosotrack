/**
 * Home page — DESIGN_BRIEF §7 (rev. 4).
 *
 * Section order:
 *   1. Nav            — fixed overlay, large lockup
 *   2. Hero           — dark canvas, blueprint RIGHT, motto LEFT-TOP
 *   3. LogoStrip      — institutional affiliations
 *   4. Marquee        — capability tags
 *   5. About          — 5 scrolling blocks (Problem → Streams → Hospital
 *                       → Inference → Co-pilot) with foundry visuals
 *                       embedded as React
 *   6. Research       — pathogen catalogue (fixed shapes + side hover)
 *   7. Team           — founder + advisors
 *   8. Roadmap        — funding phases
 *   9. Contact        — Formspree form
 *  10. Footer         — lockup + fine print
 *
 * Retired: standalone Solution iframe section, DemoCallout video modal.
 */

import { Nav } from "@/components/Nav";
import { Hero } from "@/components/hero/Hero";
import { LogoStrip } from "@/components/logostrip/LogoStrip";
import { Marquee } from "@/components/marquee/Marquee";
import { About } from "@/components/about/About";
import { Research } from "@/components/research/Research";
import { Team } from "@/components/team/Team";
import { Roadmap } from "@/components/roadmap/Roadmap";
import { Contact } from "@/components/contact/Contact";
import { Footer } from "@/components/footer/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />

      <main id="top">
        <Hero />
        <LogoStrip />
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
