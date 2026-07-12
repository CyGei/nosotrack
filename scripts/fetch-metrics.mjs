#!/usr/bin/env node
/**
 * fetch-metrics.mjs — build the research-impact database.
 *
 * Usage:
 *   node scripts/fetch-metrics.mjs
 *
 * The section tells two stories, in two bands:
 *
 *   BAND 1 — THE PEOPLE.  For each researcher (by ORCID) we pull their full
 *   works list from OpenAlex, drop the non-substantive "works" (Figshare
 *   figures, datasets, supplements, preprints — see NOTE), and report their
 *   career publication + citation totals, de-duplicated across the team.
 *   These cover each person's ENTIRE body of work, not just the tools.
 *
 *   BAND 2 — THE TOOLS.  Six packages/methods the platform is built on
 *   (EpiEstim, outbreaker2, o2ools, SeqTrack, linktree, mixtree). For each
 *   tool we assemble:
 *     · DOWNLOADS — CRAN downloads (summed across the tool's CRAN names).
 *       Tools with no CRAN package of their own (SeqTrack) have none.
 *     · OUR PAPERS — the paper(s) WE wrote about the tool (its methods
 *       paper[s]) PLUS the papers WE wrote that USED it. The latter are
 *       derived automatically: any team-authored work that cites the tool's
 *       methods paper and is not itself a methods paper. `appInclude` /
 *       `appExclude` (bare DOIs) override the derivation at the edges.
 *     · CITATIONS — EVERY paper that cites the tool or any of OUR papers for
 *       it. That means two hops: works citing the methods paper(s), PLUS
 *       works citing our application papers. Citers are deduped across both
 *       hops and tagged `byTeam` when authored by one of the four.
 *
 * One generated file, bundled into the site:
 *   · src/data/research-metrics.json   — both bands + per-tool detail
 *
 * The raw citing-papers list is computed to derive the counts above but is
 * NOT persisted — nothing at build- or run-time consumes it.
 *
 * Sources (both free, no API key):
 *   · OpenAlex   https://docs.openalex.org  (publications + citations)
 *   · cranlogs   https://cranlogs.r-pkg.org (package downloads)
 *
 * NOTE — why we filter works (BAND 1 only):
 *   OpenAlex ingests Crossref + DataCite, and PLOS/Figshare mint a separate
 *   DOI for every figure and supplement (e.g. …pcbi.1014271.g003). Those land
 *   as "works" on an author's profile and would inflate a naive publication
 *   count from ~12 real papers to ~90. We keep only substantive types (and
 *   drop preprints, which OpenAlex double-counts against their published
 *   versions). See SUBSTANTIVE_TYPES / isRealWork(). The tool-citation lists
 *   in BAND 2 are deliberately NOT type-filtered — the goal there is to show
 *   everyone who uses the tools, preprints included.
 *
 * Refresh cadence:
 *   Run at build time and/or on a weekly GitHub Action that commits the two
 *   files — git history then doubles as the metric time-series.
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dataDir = resolve(root, "src/data");

/* ───────────────────────────────────────────────────────── config ── */

// OpenAlex "polite pool": a contact address earns faster, more reliable
// service. https://docs.openalex.org/how-to-use-the-api/rate-limits-and-authentication
const MAILTO = "cyrilgeismar@gmail.com";
const OA = "https://api.openalex.org";
const CRANLOGS = "https://cranlogs.r-pkg.org";
const UA = `nosotrack-metrics (+https://nosotrack.com; mailto:${MAILTO})`;

// The four researchers, anchored on ORCID (authoritative — avoids the
// name-collision / profile-split problems that plague raw author.id sweeps).
const RESEARCHERS = [
  { key: "jombart", name: "Thibaut Jombart", orcid: "0000-0003-2226-8692" },
  { key: "cori", name: "Anne Cori", orcid: "0000-0002-8443-9162" },
  { key: "campbell", name: "Finlay Campbell", orcid: "0000-0002-1849-1886" },
  { key: "geismar", name: "Cyril Geismar", orcid: "0000-0002-8486-5890" },
];
// OpenAlex stamps authorships with the full ORCID URL — match on that.
const OURCID = new Set(RESEARCHERS.map((r) => `https://orcid.org/${r.orcid}`));

// The six tools the platform is built on. Each may carry:
//   · crans        — CRAN name(s) whose downloads are SUMMED. Empty ⇒ the
//                    tool has no package of its own (SeqTrack lives in a
//                    method, not a standalone CRAN release) ⇒ no downloads.
//   · methodsDois  — the paper(s) WE wrote describing the tool. Empty ⇒ a
//                    companion utility with no standalone paper (o2ools).
//   · appInclude / appExclude — bare DOIs to force in / out of the derived
//                    "papers we wrote that USED this tool" set.
//   · repo         — canonical code home, or null (SeqTrack has none of its
//                    own — deliberately not attributed to another package).
const TOOLS = [
  {
    id: "epiestim",
    name: "EpiEstim",
    crans: ["EpiEstim"],
    methodsDois: ["10.1093/aje/kwt133", "10.1016/j.epidem.2019.100356"],
    appInclude: [],
    appExclude: [],
    repo: "https://github.com/mrc-ide/EpiEstim",
    blurb:
      "Estimates the time-varying reproduction number Rₜ from incidence and the serial interval — the standard tool for tracking transmissibility in real time.",
  },
  {
    id: "outbreaker2",
    name: "outbreaker2",
    crans: ["outbreaker2", "outbreaker"],
    methodsDois: ["10.1186/s12859-018-2330-z", "10.1371/journal.pcbi.1003457"],
    appInclude: [],
    appExclude: [],
    repo: "https://github.com/reconhub/outbreaker2",
    blurb:
      "A modular, extensible platform for outbreak reconstruction — consolidating the original outbreaker (2014) and its ground-up rewrite (2018).",
  },
  {
    id: "o2ools",
    name: "o2ools",
    crans: ["o2ools"],
    methodsDois: [], // companion utility package — no standalone methods paper
    appInclude: [],
    appExclude: [],
    repo: "https://github.com/CyGei/o2ools",
    blurb:
      "Helper tools for post-processing, summarising and visualising outbreaker2 output.",
  },
  {
    id: "seqtrack",
    name: "SeqTrack",
    crans: [], // a method, not a standalone CRAN package — no downloads
    methodsDois: ["10.1038/hdy.2010.78"],
    appInclude: [],
    appExclude: [],
    repo: null,
    blurb:
      "A graph approach to reconstructing who-infected-whom from pathogen genetic data — the genetic backbone of outbreak reconstruction.",
  },
  {
    id: "linktree",
    name: "linktree",
    crans: ["linktree"],
    methodsDois: ["10.1371/journal.pone.0313037"],
    appInclude: [],
    appExclude: [],
    repo: "https://github.com/CyGei/linktree",
    blurb:
      "Estimates transmission assortativity — the tendency to transmit within vs. across groups (e.g. staff ↔ patient).",
  },
  {
    id: "mixtree",
    name: "mixtree",
    crans: ["mixtree"],
    methodsDois: ["10.1371/journal.pcbi.1014271"],
    appInclude: [],
    appExclude: [],
    repo: "https://github.com/CyGei/mixtree",
    blurb:
      "A statistical framework for comparing epidemic forests — sets of transmission trees.",
  },
];

// Every tool's methods DOI, bare + lowercased. A team-authored work that IS
// one of these is a methods paper, never an "application" paper of another
// tool (keeps the mixtree paper from being logged as an outbreaker2 app).
const ALL_METHODS_DOIS = new Set(
  TOOLS.flatMap((t) => t.methodsDois.map((d) => d.toLowerCase()))
);

// OpenAlex `type` values we count as real, peer-reviewed publications (BAND 1
// only). Preprints are excluded on purpose: OpenAlex frequently keeps a
// medRxiv/bioRxiv preprint AND its published article as separate works, so
// counting preprints double-counts both the paper and its citations.
const SUBSTANTIVE_TYPES = new Set([
  "article",
  "review",
  "book",
  "book-chapter",
  "report",
  "dissertation",
  "letter",
]);

// Fields we pull for any citing / paper work — enough to render a row AND to
// decide team authorship (authorships[].author.orcid).
const WORK_SELECT =
  "id,doi,display_name,publication_year,type,cited_by_count,authorships,primary_location";

/* ─────────────────────────────────────────────────────── helpers ── */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET JSON with polite retry/backoff on 429 / 5xx. */
async function getJSON(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA } });
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(800 * (i + 1));
      continue;
    }
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) {
      await sleep(1000 * (i + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  throw new Error(`failed after ${tries} tries: ${url}`);
}

const shortId = (id) => (id ? String(id).replace("https://openalex.org/", "") : null);
const bareDoi = (doi) => (doi ? String(doi).replace("https://doi.org/", "") : null);
const venueOf = (w) => w?.primary_location?.source?.display_name ?? null;
const isFigshare = (w) => /figshare/i.test(venueOf(w) || "");
// PLOS/Figshare component DOIs look like `<base>.g003`, `.s007`, `.t002`…
const isComponentDoi = (doi) => /\.[a-z]{1,4}\d{3,}$/i.test(doi || "");
// Authored by one of the four? (used to derive app papers + tag self-cites)
const isTeam = (w) => !!w.authorships?.some((a) => OURCID.has(a.author?.orcid));

const authorsOf = (w) => {
  const first = w.authorships?.[0]?.author?.display_name || null;
  const n = w.authorships?.length ?? 0;
  return first ? (n > 1 ? `${first} et al.` : first) : "Unknown";
};

/** Keep only substantive, non-component, non-Figshare works (BAND 1). */
function isRealWork(w) {
  if (!SUBSTANTIVE_TYPES.has(w.type)) return false;
  if (isFigshare(w)) return false;
  if (isComponentDoi(bareDoi(w.doi))) return false;
  return true;
}

/** Page an OpenAlex works query to exhaustion via cursor pagination. */
async function oaWorks(filter, select) {
  const out = [];
  let cursor = "*";
  while (cursor) {
    const url =
      `${OA}/works?filter=${filter}` +
      `&select=${select}&per-page=200&cursor=${encodeURIComponent(cursor)}` +
      `&mailto=${MAILTO}`;
    const data = await getJSON(url);
    out.push(...(data.results || []));
    cursor = data.meta?.next_cursor || null;
    if (!data.results?.length) break;
    await sleep(120); // be gentle
  }
  return out;
}

/** Compress an OpenAlex work into a stored paper / citing-paper record. */
function paperRec(w) {
  return {
    id: shortId(w.id),
    doi: bareDoi(w.doi),
    title: w.display_name || "(untitled)",
    year: w.publication_year ?? null,
    venue: venueOf(w),
    authors: authorsOf(w),
    byTeam: isTeam(w),
  };
}

/* ───────────────────────────────────────────────── BAND 1: people ── */

async function fetchResearchers() {
  const perPerson = [];
  const unionWorks = new Map(); // openalex id -> cited_by_count

  for (const r of RESEARCHERS) {
    process.stdout.write(`> ${r.name} (ORCID ${r.orcid})… `);
    const works = await oaWorks(`author.orcid:${r.orcid}`, WORK_SELECT);
    const real = works.filter(isRealWork);
    const citations = real.reduce((s, w) => s + (w.cited_by_count || 0), 0);
    for (const w of real) {
      if (!unionWorks.has(w.id)) unionWorks.set(w.id, w.cited_by_count || 0);
    }
    perPerson.push({
      key: r.key,
      name: r.name,
      orcid: r.orcid,
      publications: real.length,
      citations,
    });
    console.log(
      `${real.length} pubs / ${citations.toLocaleString()} cites  (raw works: ${works.length})`
    );
  }

  const groupPublications = unionWorks.size;
  const groupCitations = [...unionWorks.values()].reduce((s, n) => s + n, 0);
  return { perPerson, groupPublications, groupCitations };
}

/* ──────────────────────────────────────────────────── BAND 2: tools ── */

/**
 * For one tool: resolve its methods paper(s), collect everyone who cites them
 * (hop 1), derive the team's own application papers from those citers, then
 * collect everyone who cites THOSE (hop 2). Return the merged, deduped citer
 * set plus the tool's own paper list (methods + application).
 */
async function fetchTool(tool) {
  let primary = null;
  const methodsWorks = [];
  const citerMap = new Map(); // openalex id -> citing work (deduped, both hops)

  // Hop 1 — the methods paper(s) and their citers.
  for (const doi of tool.methodsDois) {
    const paper = await getJSON(`${OA}/works/doi:${doi}?select=${WORK_SELECT}&mailto=${MAILTO}`);
    methodsWorks.push(paper);
    if (!primary) {
      primary = {
        doi: bareDoi(paper.doi),
        title: paper.display_name,
        year: paper.publication_year,
        venue: venueOf(paper),
      };
    }
    const citers = await oaWorks(`cites:${shortId(paper.id)}`, WORK_SELECT);
    for (const w of citers) if (w.id && !citerMap.has(w.id)) citerMap.set(w.id, w);
  }

  // Derive OUR application papers: team-authored citers that are not
  // themselves any tool's methods paper. Then apply manual overrides.
  const appMap = new Map(); // openalex id -> work
  for (const w of citerMap.values()) {
    if (!isTeam(w)) continue;
    if (ALL_METHODS_DOIS.has((bareDoi(w.doi) || "").toLowerCase())) continue;
    appMap.set(w.id, w);
  }
  for (const doi of tool.appExclude) {
    const bare = doi.toLowerCase();
    for (const [id, w] of appMap)
      if ((bareDoi(w.doi) || "").toLowerCase() === bare) appMap.delete(id);
  }
  for (const doi of tool.appInclude) {
    const w = await getJSON(`${OA}/works/doi:${doi}?select=${WORK_SELECT}&mailto=${MAILTO}`);
    if (w?.id) appMap.set(w.id, w);
  }

  // Hop 2 — everyone who cites our application papers.
  for (const app of appMap.values()) {
    const citers = await oaWorks(`cites:${shortId(app.id)}`, WORK_SELECT);
    for (const w of citers) if (w.id && !citerMap.has(w.id)) citerMap.set(w.id, w);
    await sleep(80);
  }

  const papers = [
    ...methodsWorks.map((w) => ({ ...paperRec(w), role: "methods" })),
    ...[...appMap.values()].map((w) => ({ ...paperRec(w), role: "application" })),
  ];

  return {
    primary,
    papers,
    appCount: appMap.size,
    citers: [...citerMap.values()],
    citations: citerMap.size,
  };
}

/**
 * Merged monthly CRAN-download series across one or more package names
 * (outbreaker2 sums outbreaker + outbreaker2), plus the cumulative total.
 * Returns { total: null } for tools with no CRAN package (SeqTrack).
 */
async function fetchDownloads(crans) {
  if (!crans.length) return { total: null, monthly: [] };
  const today = new Date().toISOString().slice(0, 10);
  const range = `2012-10-01:${today}`;
  const buckets = new Map(); // YYYY-MM -> downloads (summed across crans)

  for (const cran of crans) {
    try {
      const d = await getJSON(`${CRANLOGS}/downloads/daily/${range}/${cran}`);
      for (const row of d?.[0]?.downloads || []) {
        const m = String(row.day).slice(0, 7); // YYYY-MM
        buckets.set(m, (buckets.get(m) || 0) + (Number(row.downloads) || 0));
      }
    } catch {
      /* skip this package's series */
    }
  }

  const monthly = [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([m, downloads]) => ({ month: m, downloads }));
  const total = monthly.reduce((s, m) => s + m.downloads, 0);
  return { total, monthly };
}

/* ─────────────────────────────────────────────────────── main ── */

console.log("Building research-impact database…\n");
console.log("BAND 1 — the people (career totals):");
const researchers = await fetchResearchers();

console.log("\nBAND 2 — the tools:");
const packages = [];
const citationDb = new Map(); // openalex id -> { ...rec, cites: Set, byTeam }
const papersDb = new Map(); //   openalex id -> { ...rec, tools: Set, role }

for (const tool of TOOLS) {
  process.stdout.write(`> ${tool.name}: `);
  const { primary, papers, appCount, citers, citations } = await fetchTool(tool);
  const { total, monthly } = await fetchDownloads(tool.crans);

  for (const w of citers) {
    const rec = paperRec(w);
    if (!rec.id) continue;
    if (!citationDb.has(rec.id))
      citationDb.set(rec.id, { ...rec, cites: new Set() });
    citationDb.get(rec.id).cites.add(tool.id);
  }

  for (const p of papers) {
    if (!p.id) continue;
    if (!papersDb.has(p.id)) papersDb.set(p.id, { ...p, tools: new Set() });
    const e = papersDb.get(p.id);
    e.tools.add(tool.id);
    if (p.role === "methods") e.role = "methods"; // methods wins over application
  }

  packages.push({
    id: tool.id,
    name: tool.name,
    crans: tool.crans,
    repo: tool.repo,
    blurb: tool.blurb,
    methodsPaper: primary,
    papers: papers.map(({ doi, title, year, venue, role, byTeam }) => ({
      doi,
      title,
      year,
      venue,
      role,
      byTeam,
    })),
    paperCount: papers.length,
    citations,
    downloads: total,
    downloadsMonthly: monthly,
  });

  const dl = total === null ? "no CRAN pkg" : `${total.toLocaleString()} downloads`;
  console.log(
    `${papers.length} papers (${appCount} ours used it) · ` +
      `${citations.toLocaleString()} citing works · ${dl}`
  );
}

// Flatten the citation database, newest first.
const citations = [...citationDb.values()]
  .map((c) => ({
    id: c.id,
    doi: c.doi,
    title: c.title,
    year: c.year,
    venue: c.venue,
    authors: c.authors,
    cites: [...c.cites],
    byTeam: c.byTeam,
  }))
  .sort((a, b) => (b.year || 0) - (a.year || 0));

const generatedAt = new Date().toISOString().slice(0, 10);
const toolDownloads = packages.reduce((s, p) => s + (p.downloads || 0), 0);
const teamCiting = citations.filter((c) => c.byTeam).length;

const metrics = {
  generatedAt,
  source: "OpenAlex (publications & citations) + cranlogs (downloads)",
  // BAND 1 — the people: whole-career totals, deduped across the four.
  people: {
    publications: researchers.groupPublications,
    citations: researchers.groupCitations,
    perPerson: researchers.perPerson,
  },
  // BAND 2 — the tools: tool-scoped aggregates.
  tools: {
    count: TOOLS.length,
    papers: papersDb.size, // unique papers WE wrote across the tools
    downloads: toolDownloads,
    citations: citations.length, // unique papers citing the tools / our tool-papers
    teamCiting, // of which authored by the team (self / follow-on)
  },
  packages,
};

writeFileSync(
  resolve(dataDir, "research-metrics.json"),
  JSON.stringify(metrics, null, 2) + "\n"
);

console.log("\n─────────────────────────────────────────────");
console.log(
  `People : ${metrics.people.publications} publications · ` +
    `${metrics.people.citations.toLocaleString()} citations`
);
console.log(
  `Tools  : ${metrics.tools.count} tools · ${metrics.tools.papers} of our papers · ` +
    `${toolDownloads.toLocaleString()} downloads · ` +
    `${citations.length.toLocaleString()} citing papers (${teamCiting} by the team)`
);
console.log(`Wrote src/data/research-metrics.json`);
