// Typed loader for content.json. Imported by server components at build
// time (App Router RSC) — zero JS shipped to the client for static copy.
//
// The JSON file is the source of truth for marketing copy (per
// DESIGN_BRIEF.md hard rule #2). Components should never inline strings
// that belong in here.

import contentJson from "../../content.json";
import type { Content } from "@/types/content";

// Cast: the JSON is structurally compatible with the Content interface,
// but `import ... from "*.json"` resolves to a heavily-typed structural
// type by default. The assertion narrows it.
export const content: Content = contentJson as unknown as Content;

// Convenience accessors. Each section component imports its slice via
// these. Retired sections (demo / solution / platform / about) still
// exist in content.json but are not exposed here — the About section
// uses inline copy now. Re-add accessors here only when a component
// actually reads the slice.
export const meta = content.meta;
export const nav = content.nav;
export const hero = content.hero;
export const logoStrip = content.logoStrip;
export const marquee = content.marquee;
export const research = content.research;
export const team = content.team;
export const roadmap = content.roadmap;
export const contact = content.contact;
export const footer = content.footer;
