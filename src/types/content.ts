// TypeScript types for content.json — generated from the live JSON's actual
// shape (see DESIGN_BRIEF §7 for the section list). Every section of the
// home page reads from a key here; the build pulls this file via lib/content.ts.

export interface Meta {
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface CTA {
  label: string;
  href: string;
  external?: boolean;
}

export interface Nav {
  logo: string;
  links: NavLink[];
  /** CTA dropped per rev. 13 (2026-05-23) — kept optional so older
   *  content.json snapshots still type-check. */
  cta?: CTA;
}

export interface DemoSection {
  trackLabel: string;
  cta: CTA;
}

export interface Hero {
  eyebrow: string;
  title: string[];          // multi-line headline (each entry is a line)
  subtitle: string;
  scrollLabel: string;
}

export interface LogoStripItem {
  name: string;
  // The legacy data may also carry a logo URL — kept loose to avoid breakage.
  [k: string]: unknown;
}

export type MarqueeItem = string;

/* ============ ABOUT — Palantir step panel (DESIGN_BRIEF §7.6) ============ */

/** A single numeric/static stat shown in the right panel of step 0.1. */
export interface AboutStat {
  value?: number;        // numeric target (counts up on enter)
  staticHead?: string;   // non-numeric headline (e.g. "AMR")
  fraction?: string;     // optional denominator displayed as "1 / 10"
  decimals?: number;     // formatting hint
  suffix?: string;       // e.g. "M", "%"
  caption: string;
  sourceLabel: string;
  sourceHref: string;
}

/** A single failure-mode row shown in the right panel of step 0.2. */
export interface AboutFailure {
  value: string;        // big mono headline (e.g. "77%")
  title: string;        // bold label
  desc: string;         // descriptive sentence
}

export interface AboutStep {
  id: string;                          // "0.1", "0.2"
  label: string;                       // mono caption used in the indicator
  headline: string;                    // typed live on the left
  subtitle: string;                    // shown on the right above details
  kind: "stats" | "failures";
  stats?: AboutStat[];
  failures?: AboutFailure[];
}

export interface About {
  tag: string;
  steps: AboutStep[];
}

/* ============ SOLUTION — Palantir step panel (DESIGN_BRIEF §7.7) ============ */

export interface SolutionStream {
  /** Lucide icon name — must exist in lucide-react. */
  icon: "Stethoscope" | "Microscope" | "Bluetooth";
  tag: string;
  name: string;
}

export interface SolutionStep {
  id: string;
  label: string;
  headline: string;
  subtitle: string;
  kind: "streams" | "tree" | "reporting" | "copilot";
  streams?: SolutionStream[];
}

export interface Solution {
  tag: string;
  steps: SolutionStep[];
}

export interface PlatformInputCard {
  tag: string;
  desc: string;
  viz: string;
}

export interface PlatformStepBase {
  stepNum: string;
  stepLabel: string;
}

export interface PlatformInputs extends PlatformStepBase {
  cards: PlatformInputCard[];
}

export interface PlatformAnonymisation extends PlatformStepBase {
  tag: string;
  desc: string;
  viz: string;
}

export interface PlatformEngineFeature {
  title: string;
  desc: string;
}

export interface PlatformEngine extends PlatformStepBase {
  tag: string;
  desc: string;
  features: PlatformEngineFeature[];
}

export interface PlatformReporting extends PlatformStepBase {
  tag: string;
  desc: string;
}

export interface PlatformIpc extends PlatformStepBase {
  tag: string;
  desc: string;
}

export interface Platform {
  tag: string;
  title: string;
  subtitle: string;
  steps: {
    inputs: PlatformInputs;
    anonymisation: PlatformAnonymisation;
    engine: PlatformEngine;
    alertsReports: PlatformReporting;
    ipcSupport: PlatformIpc;
  };
}

export interface ResearchTimelinePathogen {
  name: string;
  applicationYear: string;
  icon: string;
}

export interface ResearchTimelineEntry {
  year: string;
  type: string;
  method: string;
  authors: string;
  description: string;
  pathogens: ResearchTimelinePathogen[];
  reference_url: string;
}

// The new pathogen-grid spec from DESIGN_BRIEF §8. Hand-authored or built
// from the timeline at runtime; the schema lives here so editors can extend.
export interface ResearchPathogenLink {
  title: string;
  url: string;
  year?: number;
}

export interface ResearchPathogen {
  id: string;
  name: string;
  /** Common / colloquial name (e.g. "COVID-19") — shown below the formal name. */
  common?: string;
  type: "virus" | "bacteria";
  geometryHint: string;
  cases: string;   // global estimate, human-formatted, e.g. "~685M / year"
  deaths: string;  // global estimate, human-formatted
  research: ResearchPathogenLink[];
}

export interface Research {
  tag: string;
  title: string[];
  intro: string;
  timelineLabel: string;
  timeline: ResearchTimelineEntry[];
  pathogens?: ResearchPathogen[];   // populated for the new pathogen grid
  pathogenIntro?: string;
}

export interface TeamPerson {
  name: string;
  role: string;
  photo: string;
  bio: string;
}

export interface Team {
  tag: string;
  title: string[];
  founder: TeamPerson;
  advisorsLabel: string;
  advisors: TeamPerson[];
}

export interface RoadmapPhase {
  badge: string;
  title: string;
  desc: string;
}

export interface Roadmap {
  tag: string;
  title: string[];
  intro: string;
  phases: RoadmapPhase[];
}

export interface Contact {
  tag: string;
  title: string[];
  subtitle: string;
  github: { label: string; url: string };
  linkedin: { label: string; url: string };
  formAction: string;
  formLabels: { name: string; email: string; message: string };
  formButtons: { submit: string; reset: string };
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface Footer {
  logo: string;
  links: FooterLink[];
  copy: string;
  credit: string;
}

export interface Content {
  meta: Meta;
  nav: Nav;
  demo: DemoSection;
  hero: Hero;
  logoStrip: LogoStripItem[];
  marquee: MarqueeItem[];
  about: About;
  solution: Solution;
  platform: Platform;
  research: Research;
  team: Team;
  roadmap: Roadmap;
  contact: Contact;
  footer: Footer;
}
