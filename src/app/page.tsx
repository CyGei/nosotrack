import { TransmissionStory } from "@/components/story/TransmissionStory";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/about/About";
import { Settings } from "@/components/settings/Settings";
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
        <TransmissionStory>
          <About />
          <Research />
          <Settings />
          <ImpactAdoption />
          <Team />
          <Roadmap />
          <Contact />
        </TransmissionStory>
      </main>

      <Footer />
    </>
  );
}
