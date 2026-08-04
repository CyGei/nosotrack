#!/usr/bin/env node
// Builds src/data/research-metrics.json from OpenAlex (publications, citations)
// and cranlogs (downloads).

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dataDir = resolve(root, "src/data");

// OpenAlex "polite pool": a contact address earns faster, more reliable service.
const MAILTO = "cyrilgeismar@gmail.com";
const OA = "https://api.openalex.org";
const CRANLOGS = "https://cranlogs.r-pkg.org";
const UA = `nosotrack-metrics (+https://nosotrack.com; mailto:${MAILTO})`;

// Anchored on ORCID: raw author.id sweeps hit OpenAlex name collisions / split profiles.
const RESEARCHERS = [
  { key: "jombart", name: "Thibaut Jombart", orcid: "0000-0003-2226-8692" },
  { key: "cori", name: "Anne Cori", orcid: "0000-0002-8443-9162" },
  { key: "campbell", name: "Finlay Campbell", orcid: "0000-0002-1849-1886" },
  { key: "geismar", name: "Cyril Geismar", orcid: "0000-0002-8486-5890" },
];
const OURCID = new Set(RESEARCHERS.map((r) => `https://orcid.org/${r.orcid}`));

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
    methodsDois: [],
    appInclude: [],
    appExclude: [],
    repo: "https://github.com/CyGei/o2ools",
    blurb:
      "Helper tools for post-processing, summarising and visualising outbreaker2 output.",
  },
  {
    id: "seqtrack",
    name: "SeqTrack",
    crans: [],
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

const ALL_METHODS_DOIS = new Set(
  TOOLS.flatMap((t) => t.methodsDois.map((d) => d.toLowerCase()))
);

// Preprints excluded: OpenAlex keeps a preprint AND its published article as separate works.
const SUBSTANTIVE_TYPES = new Set([
  "article",
  "review",
  "book",
  "book-chapter",
  "report",
  "dissertation",
  "letter",
]);

const WORK_SELECT =
  "id,doi,display_name,publication_year,type,cited_by_count,authorships,primary_location";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
// PLOS/Figshare mint a DOI per figure/supplement: `<base>.g003`, `.s007`, `.t002`…
const isComponentDoi = (doi) => /\.[a-z]{1,4}\d{3,}$/i.test(doi || "");
const isTeam = (w) => !!w.authorships?.some((a) => OURCID.has(a.author?.orcid));

const authorsOf = (w) => {
  const first = w.authorships?.[0]?.author?.display_name || null;
  const n = w.authorships?.length ?? 0;
  return first ? (n > 1 ? `${first} et al.` : first) : "Unknown";
};

function isRealWork(w) {
  if (!SUBSTANTIVE_TYPES.has(w.type)) return false;
  if (isFigshare(w)) return false;
  if (isComponentDoi(bareDoi(w.doi))) return false;
  return true;
}

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

async function fetchResearchers() {
  const perPerson = [];
  const unionWorks = new Map();

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

async function fetchTool(tool) {
  let primary = null;
  const methodsWorks = [];
  const citerMap = new Map();

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

  const appMap = new Map();
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

async function fetchDownloads(crans) {
  if (!crans.length) return { total: null, monthly: [] };
  const today = new Date().toISOString().slice(0, 10);
  const range = `2012-10-01:${today}`;
  const buckets = new Map();

  for (const cran of crans) {
    try {
      const d = await getJSON(`${CRANLOGS}/downloads/daily/${range}/${cran}`);
      for (const row of d?.[0]?.downloads || []) {
        const m = String(row.day).slice(0, 7);
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

console.log("Building research-impact database…\n");
console.log("BAND 1 — the people (career totals):");
const researchers = await fetchResearchers();

console.log("\nBAND 2 — the tools:");
const packages = [];
const citationDb = new Map();
const papersDb = new Map();

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
    if (p.role === "methods") e.role = "methods";
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
  people: {
    publications: researchers.groupPublications,
    citations: researchers.groupCitations,
    perPerson: researchers.perPerson,
  },
  tools: {
    count: TOOLS.length,
    papers: papersDb.size,
    downloads: toolDownloads,
    citations: citations.length,
    teamCiting,
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
