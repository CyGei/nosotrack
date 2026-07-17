"use client";

/**
 * About — DESIGN_BRIEF §7.5 (rev. 9).
 *
 * Four editorial blocks — market → wedge → product:
 *
 *   0.1  Every outbreak is unique… (OutbreakSection)
 *        → A looping arch of the real 2026 outbreaks. Every health emergency
 *          is a forensics problem; this is the broad market (public-health
 *          agencies / governments Nosotrack scales out to).
 *
 *   0.2  Nosocomial outbreaks are deadly, costly and difficult to manage.
 *        → The hospital wedge, established with WHO figures alone.
 *
 *   0.3  Integration unlocks intelligence.  → the 3 I's, integration video.
 *   0.4  Outbreak forensics, end to end.    → end-to-end forensics video.
 */

import { AboutBlock } from "./AboutBlock";
import { DetailsList } from "./DetailsList";
import { OutbreakSection } from "./OutbreakSection";
import { ProblemStats } from "./ProblemStats";
import { FoundryFrame } from "./FoundryFrame";

/** Inline external link — used inside detail rows. */
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="about-link">
      {children}
    </a>
  );
}

export function About() {
  return (
    <section
      id="about"
      className="border-t border-rule bg-bg"
      aria-label="How Nosotrack works"
    >
      {/* 0.1 — Outbreaks everywhere: every health emergency is a forensics problem */}
      <OutbreakSection />

      {/* 0.2 — Nosocomial: the hospital wedge Nosotrack starts from */}
      <AboutBlock
        id="0.2"
        title="Nosocomial outbreaks are deadly, costly and difficult to manage."
        subtitle="Healthcare facilities are among the highest-risk environments for infectious disease transmission, bringing together vulnerable populations, frequent close contact, and diverse pathogens. Healthcare-associated infections (HAIs) remain among the most common adverse events in healthcare delivery."
        bare
        details={
          <ProblemStats
            stats={[
              {
                figure: "1 in 10",
                phrase: "patients develop an HAI",
                desc: (
                  <>
                    A{" "}
                    <A href="https://www.who.int/campaigns/world-hand-hygiene-day/key-facts-and-figures">
                      WHO
                    </A>{" "}
                    global estimate that has not improved in over 15 years.
                  </>
                ),
              },
              {
                figure: "136M",
                phrase: "antibiotic-resistant HAIs / year",
                desc: (
                  <>
                    HAIs are a major driver of the antimicrobial resistance
                    (AMR) crisis, one of the{" "}
                    <A href="https://www.who.int/news-room/spotlight/10-global-health-issues-to-track-in-2021">
                      WHO
                    </A>
                    &apos;s top global health threat.
                  </>
                ),
              },
              {
                figure: "3.5M",
                phrase: "annual deaths",
                desc: (
                  <>
                    The{" "}
                    <A href="https://www.who.int/campaigns/world-hand-hygiene-day/key-facts-and-figures">
                      WHO&apos;s
                    </A>{" "}
                    projected mortality from HAIs unless infection-prevention
                    investment scales meaningfully in the next decade.
                  </>
                ),
              },
            ]}
            thesis={{
              title: "AMR's most underrated driver",
              desc: "Hospital outbreaks are the breeding ground for resistant strains. Stopping them earlier is the cheapest and most efficient solution.",
            }}
          />
        }
      />

      {/* 0.3 — Integration unlocks intelligence */}
      <AboutBlock
        id="0.3"
        title="Integration unlocks intelligence."
        subtitle="Current tools work in silos. Nosotrack fuses their data streams into a unified analytical engine."
        video={<FoundryFrame scene="integration" />}
        details={
          <DetailsList
            rows={[
              {
                kind: "header",
                title: "The 3 I's",
              },
              {
                title: "Integration",
                desc: "Electronic Health Records (EHR), diagnostic lab results and Real-Time Location Systems (RTLS) unified into a single engine.",
              },
              {
                title: "Inference",
                desc: "Bayesian inference reconstructs who-infected-whom, and who is at risk.",
              },
              {
                title: "Intervention",
                desc: "An AI co-pilot scores intervention scenarios in seconds, ranked by containment, cost, and bed-days saved.",
              },
            ]}
          />
        }
      />

      {/* 0.4 — Outbreak forensics, end to end */}
      <AboutBlock
        id="0.4"
        title="Outbreak forensics, end to end."
        subtitle="Nosotrack infers who-infected-whom in real-time, enabling infection prevention and control teams to identify how infections spread and design targeted interventions before outbreaks escalate"
        video={<FoundryFrame scene="endtoend" />}
        details={
          <DetailsList
            rows={[
              {
                kind: "header",
                title: "The Solution",
              },
              {
                title: "Actionable intelligence, for every outbreak",
                desc: "Identifies patient 0, superspreaders, undetected cases, imported cases, estimates the dates of infection and individuals at risk.",
              },
              {
                title: "Probabilities, not point estimates",
                desc: "Every transmission chain carries a confidence score indicative of how strong the evidence is for each link.",
              },
              {
                title: "Your protocols, your call",
                desc: "The IPC co-pilot incorporates your guidelines and operational constraints to simulate interventions and identify optimal control strategies.",
              },
            ]}
          />
        }
      />

      {/* Inline-link styling for `<A>` inside detail rows — inherits the
          surrounding text color, just adds an underline so it's recognisable. */}
      <style>{`
        .about-link {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1px;
        }
      `}</style>
    </section>
  );
}
