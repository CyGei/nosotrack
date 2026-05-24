"use client";

/**
 * About — DESIGN_BRIEF §7.5 (rev. 8).
 *
 * Three editorial blocks:
 *
 *   0.1  Nosocomial outbreaks are deadly, costly and poorly managed.
 *        → Details-only (no video toggle). The Problem is established
 *          with WHO/CDC figures alone.
 *
 *   0.2  Integration unlocks intelligence.
 *        → Video shows the three-layer stack: data sources, the
 *          hospital floor with patient/staff movement, and the
 *          NosoTrack analytics layer at the bottom.
 *
 *   0.3  Outbreak forensics, end to end.
 *        → Video walks through the cursor clicking the NosoTrack logo
 *          and the dashboard expanding to the full forensics view.
 */

import { AboutBlock } from "./AboutBlock";
import { DetailsList } from "./DetailsList";
import { FoundryFrame } from "./foundry/FoundryFrame";

export function About() {
  return (
    <section id="about" className="bg-bg" aria-label="How NosoTrack works">
      {/* 0.1 — Problem */}
      <AboutBlock
        id="0.1"
        title="Nosocomial outbreaks are deadly, costly and poorly managed."
        subtitle="Healthcare-associated infections kill more people than malaria and HIV combined — and the case data needed to stop them sits scattered across systems that don't talk to each other."
        details={
          <DetailsList
            rows={[
              {
                title: "1 in 10 patients",
                desc: "are affected by healthcare-associated infections globally — the WHO's Hand-Hygiene-Day key statistic, unchanged for a decade.",
              },
              {
                title: "136M antibiotic-resistant HAIs / year",
                desc: "occur worldwide every year, accelerating the antimicrobial-resistance crisis the WHO's 2024 IPC report calls a top-ten global health threat.",
              },
              {
                title: "3.5M annual deaths without action",
                desc: "is the WHO's projected mortality from HAIs unless infection-prevention investment scales meaningfully in the next decade.",
              },
              {
                title: "AMR's most underrated driver",
                desc: "Hospital outbreaks are the breeding ground for resistant strains. Stopping them earlier is the cheapest, most direct lever the system has.",
              },
            ]}
          />
        }
      />

      {/* 0.2 — Integration unlocks intelligence */}
      <AboutBlock
        id="0.2"
        title="Integration unlocks intelligence."
        subtitle="NosoTrack stacks three live data layers — clinical, lab and hardware — onto a single hospital ontology, with the forensics engine sitting underneath. The streams aren't reports: they're the substrate for inference."
        video={<FoundryFrame scene="integration" />}
        details={
          <DetailsList
            rows={[
              {
                title: "Layer 1 — data streams",
                desc: "EHR feeds, microbiology and full-length sequencing, plus minute-level Bluetooth / RTLS contact data flow into the engine through HL7 / FHIR connectors.",
              },
              {
                title: "Layer 2 — the live hospital",
                desc: "Every event is projected onto a digital twin of the building: patients in beds, staff between wards, contacts on the floor — all keyed to the same identity graph.",
              },
              {
                title: "Layer 3 — the NosoTrack engine",
                desc: "Underneath the building sits the Bayesian forensics layer that watches the population in real time, ready to fire when a transmission signal crosses threshold.",
              },
              {
                title: "One ontology, many questions",
                desc: "Because the layers share an ontology, the same fact base answers contact-tracing, surveillance and IPC-committee questions without bespoke pipelines.",
              },
            ]}
          />
        }
      />

      {/* 0.3 — Outbreak forensics, end to end */}
      <AboutBlock
        id="0.3"
        title="Outbreak forensics, end to end."
        subtitle="When the engine fires, the IPC team gets a complete forensic view: the inferred transmission tree, the patients and staff involved, and the next intervention queued up — one click away from the source data."
        video={<FoundryFrame scene="endtoend" />}
        details={
          <DetailsList
            rows={[
              {
                title: "Bayesian transmission engine",
                desc: "Built on the outbreaker2 lineage, the engine fuses genetic distance, contact proximity and admission timing into a posterior over plausible transmission trees.",
              },
              {
                title: "Posterior probabilities, not point estimates",
                desc: "Every edge carries a confidence score. IPC teams see not just the most-likely chain, but how strong the evidence is for each link.",
              },
              {
                title: "Super-spreader detection",
                desc: "Hosts with anomalously high secondary transmissions are flagged automatically — like patient A3 in the demo, whose chain seeded both wards.",
              },
              {
                title: "IPC co-pilot",
                desc: "A retrieval-augmented agent reads the inferred tree, your local IPC protocols and current guidelines, then surfaces the next intervention with a containment score — human approved, fully audited.",
              },
            ]}
          />
        }
      />
    </section>
  );
}
