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
