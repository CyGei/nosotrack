/**
 * Per-pathogen paper lookup for the Research-section dossier.
 *
 * The lookup is built at module load by reverse-mapping
 * `content.json > research.timeline[]` — every timeline entry already
 * declares which pathogens it applied to, so we get a per-pathogen
 * paper list for free without duplicating data. Manual additions cover
 * the six grid pathogens that have no timeline entries (influenza, HIV,
 * rhinovirus, enterococcus, C. auris, Disease X), sourced via a focused
 * literature pass on 2026-05-24 — see project_pathogen_registry memory.
 *
 * Aliases below collapse timeline pathogen-name strings into the grid
 * pathogen ids in `pathogens/index.ts`. A few notable folds:
 *   - SARS-CoV-1 → "sars-cov-2" (no SARS-1 spec; both are betacoronaviruses
 *     and the methods papers apply identically)
 *   - MRSA / Staphylococcus aureus → "staph-aureus"
 *   - All influenza subtypes (H1N1, H7N7, H3N8, H5N8, "Influenza") → "influenza"
 *   - "Various pathogens" → broadcast to every grid pathogen (these are
 *     truly methodological papers — outbreaker2's framework, the Campbell
 *     genome-informativeness analysis, linktree, mixtree — that apply to
 *     any specimen).
 *
 * Papers within each pathogen list are sorted by year ascending so the
 * dossier reads chronologically (methods → applications).
 */

import { research } from "@/lib/content";

/* ─────────────────────────────────────────────────────── types ── */

export type PathogenPaper = {
  year: number;
  authors: string;
  title: string;
  url: string;
  /**
   * `method` flags a methodology paper (the tool / framework itself);
   * `application` flags a paper that USES one of those methods on this
   * pathogen. Drives subtle styling in the dossier (mono tag).
   */
  kind: "method" | "application";
  /**
   * Journal name shown on the secondary line. Populated for every entry
   * (timeline-derived and manually curated) as of the 2026-05-24 audit
   * pass — the dossier looks inconsistent when some papers carry a
   * journal and others don't, so the type still permits `undefined`
   * but the lookup itself fills every paper.
   */
  journal?: string;
};

/* ─────────────────────────────────────────────────────── alias ── */

/**
 * Maps a timeline pathogen-name string to one of the grid pathogen ids
 * in `pathogens/index.ts`. Strings not in this table are dropped from
 * the per-pathogen lookup (e.g. "Mycobacterium tuberculosis", "Polio",
 * "Foot-and-mouth disease" — no specimens in the grid).
 *
 * The special key "Various pathogens" causes the paper to be broadcast
 * to every grid pathogen.
 */
const NAME_TO_ID: Record<string, string> = {
  "SARS-CoV-2": "sars-cov-2",
  // No SARS-CoV-1 specimen in the grid; the methods papers apply to
  // betacoronaviruses generically, so we fold them onto sars-cov-2.
  "SARS-CoV-1": "sars-cov-2",
  "MERS-CoV": "sars-cov-2",
  "Ebola virus": "ebola",
  Norovirus: "norovirus",
  "Klebsiella pneumoniae": "klebsiella",
  MRSA: "staph-aureus",
  HIV: "hiv",
  "H1N1 influenza": "influenza",
  "H7N7 avian influenza": "influenza",
  "H5N8 avian influenza": "influenza",
  "H3N8 equine influenza": "influenza",
  Influenza: "influenza",
};

const BROADCAST_KEY = "Various pathogens";

/* ─────────────────────────────────────── manual paper additions ── */

/**
 * Hand-curated outbreak-reconstruction papers for grid pathogens that
 * have no timeline entries. Sourced 2026-05-24 — see the
 * project_pathogen_registry memory for the research methodology. Each
 * paper has been URL-verified and is open-access or institutional-OA.
 *
 * Disease X gets no specific papers (it's WHO's placeholder for an
 * unknown future pathogen) — the broadcast "Various pathogens" methods
 * papers carry the dossier.
 */
const MANUAL_PAPERS: Record<string, PathogenPaper[]> = {
  influenza: [
    {
      year: 2011,
      authors: "Bataille et al.",
      title:
        "Evolutionary Analysis of Inter-Farm Transmission Dynamics in a Highly Pathogenic Avian Influenza Epidemic",
      journal: "PLoS Pathogens",
      url: "https://journals.plos.org/plospathogens/article?id=10.1371/journal.ppat.1002094",
      kind: "application",
    },
    {
      year: 2012,
      authors: "Ypma et al.",
      title:
        "Unravelling transmission trees of infectious diseases by combining genetic and epidemiological data",
      journal: "Proceedings of the Royal Society B",
      url: "https://royalsocietypublishing.org/doi/10.1098/rspb.2011.0913",
      kind: "method",
    },
    {
      year: 2016,
      authors: "Poon et al.",
      title:
        "Quantifying influenza virus diversity and transmission in humans",
      journal: "Nature Genetics",
      url: "https://www.nature.com/articles/ng.3479",
      kind: "application",
    },
  ],
  hiv: [
    {
      year: 2015,
      authors: "Bezemer et al.",
      title:
        "Dispersion of the HIV-1 Epidemic in Men Who Have Sex with Men in the Netherlands: A Combined Mathematical Model and Phylogenetic Analysis",
      journal: "PLoS Medicine",
      url: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1001898",
      kind: "application",
    },
    {
      year: 2018,
      authors: "Kosakovsky Pond et al.",
      title:
        "HIV-TRACE (TRAnsmission Cluster Engine): a Tool for Large Scale Molecular Epidemiology of HIV-1 and Other Rapidly Evolving Pathogens",
      journal: "Molecular Biology and Evolution",
      url: "https://academic.oup.com/mbe/article/35/7/1812/4833215",
      kind: "method",
    },
    {
      year: 2019,
      authors: "Ratmann et al.",
      title:
        "Inferring HIV-1 transmission networks and sources of epidemic spread in Africa with deep-sequence phylogenetic analysis",
      journal: "Nature Communications",
      url: "https://www.nature.com/articles/s41467-019-09139-4",
      kind: "application",
    },
  ],
  rhinovirus: [
    {
      year: 2016,
      authors: "Reese et al.",
      title:
        "Evidence of nosocomial transmission of human rhinovirus in a neonatal intensive care unit",
      journal: "American Journal of Infection Control",
      url: "https://pubmed.ncbi.nlm.nih.gov/26775935/",
      kind: "application",
    },
    // Sparse literature on WGS-based rhinovirus transmission inference —
    // fall back to the general-purpose methods trio so the dossier still
    // gives the visitor real machinery to follow up on.
  ],
  enterococcus: [
    {
      year: 2016,
      authors: "Brodrick et al.",
      title:
        "Whole-genome sequencing reveals transmission of vancomycin-resistant Enterococcus faecium in a healthcare network",
      journal: "Genome Medicine",
      url: "https://link.springer.com/article/10.1186/s13073-015-0259-7",
      kind: "application",
    },
    {
      year: 2017,
      authors: "Raven et al.",
      title:
        "Complex Routes of Nosocomial Vancomycin-Resistant Enterococcus faecium Transmission Revealed by Genome Sequencing",
      journal: "Clinical Infectious Diseases",
      url: "https://academic.oup.com/cid/article/64/7/886/3051757",
      kind: "application",
    },
    {
      year: 2021,
      authors: "Gouliouris et al.",
      title:
        "Quantifying acquisition and transmission of Enterococcus faecium using genomic surveillance",
      journal: "Nature Microbiology",
      url: "https://www.nature.com/articles/s41564-020-00806-7",
      kind: "application",
    },
  ],
  // Note: the registry id is "cauris" (no hyphen), not "c-auris" — must
  // match `pathogens/c-auris.ts > id`. Earlier draft used the hyphenated
  // form and the papers silently dropped on the floor.
  cauris: [
    {
      year: 2016,
      authors: "Schelenz et al.",
      title:
        "First hospital outbreak of the globally emerging Candida auris in a European hospital",
      journal: "Antimicrobial Resistance & Infection Control",
      url: "https://pubmed.ncbi.nlm.nih.gov/27777756/",
      kind: "application",
    },
    {
      year: 2017,
      authors: "Lockhart et al.",
      title:
        "Simultaneous Emergence of Multidrug-Resistant Candida auris on 3 Continents Confirmed by Whole-Genome Sequencing and Epidemiological Analyses",
      journal: "Clinical Infectious Diseases",
      url: "https://academic.oup.com/cid/article/64/2/134/2706620",
      kind: "application",
    },
    {
      year: 2018,
      authors: "Eyre et al.",
      title:
        "A Candida auris Outbreak and Its Control in an Intensive Care Setting",
      journal: "New England Journal of Medicine",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1714373",
      kind: "application",
    },
  ],
  // Disease X is WHO's placeholder for an unknown future pathogen.
  // No specific application papers exist; the dossier falls back to
  // the broadcast methods papers via the "Various pathogens" tag.
  "disease-x": [],
  // E. coli and ecoli papers — the Acinetobacter outbreaker application
  // is the closest, but it isn't E. coli. Leave empty so the broadcast
  // methods papers carry it; if Cy wants specifics we can add Stoesser
  // et al. or Toleman et al. later.
  ecoli: [],
  cdiff: [],
};

/* ──────────────────────────────────────────── derived lookup ── */

/** Build the lookup once at module load. */
function build(): Record<string, PathogenPaper[]> {
  const out: Record<string, PathogenPaper[]> = {};

  // Collect every known grid id by walking the manual additions plus
  // the union of NAME_TO_ID values. (We can't import PATHOGENS here
  // without a circular dependency, and we don't need to — any id we
  // encounter as we walk gets a bucket.)
  const knownIds = new Set<string>([
    ...Object.keys(MANUAL_PAPERS),
    ...Object.values(NAME_TO_ID),
  ]);
  for (const id of knownIds) out[id] = [];

  /** Add a paper to a bucket, deduping by URL. */
  const push = (id: string, paper: PathogenPaper) => {
    out[id] ??= [];
    if (out[id].some((p) => p.url === paper.url)) return;
    out[id].push(paper);
  };

  // Walk the timeline, assigning each paper to the matching grid ids.
  // We prefer the verbatim published `fullTitle` (added to content.json
  // 2026-05-24) over the method nickname (`method`), so the dossier
  // shows real paper titles rather than tool names. Falling back to
  // `method` keeps the lookup robust against future entries that haven't
  // been title-enriched yet.
  //
  // `journal` was added to every timeline entry in the 2026-05-24
  // consistency audit so all papers — derived + manual — render with
  // the publication name underneath the title.
  for (const entry of research.timeline) {
    const paper: PathogenPaper = {
      year: parseInt(entry.year, 10) || 0,
      authors: entry.authors,
      title: entry.fullTitle ?? entry.method,
      url: entry.reference_url,
      kind: entry.type === "application" ? "application" : "method",
      journal: entry.journal,
    };

    const hasBroadcast = entry.pathogens.some(
      (p) => p.name.replace(/<br>?/g, " ").trim() === BROADCAST_KEY
    );

    if (hasBroadcast) {
      // Broadcast to every known pathogen id (including manual-only
      // ones like "disease-x" and "c-auris").
      for (const id of knownIds) push(id, paper);
      continue;
    }

    for (const p of entry.pathogens) {
      const clean = p.name.replace(/<br>?/g, " ").trim();
      const id = NAME_TO_ID[clean];
      if (id) push(id, paper);
    }
  }

  // Merge in manual additions.
  for (const [id, papers] of Object.entries(MANUAL_PAPERS)) {
    for (const paper of papers) push(id, paper);
  }

  // Chronological order per bucket.
  for (const id of Object.keys(out)) {
    out[id].sort((a, b) => a.year - b.year);
  }

  return out;
}

const PAPERS = build();

/**
 * Pathogens that intentionally have NO papers, even if the broadcast
 * "Various pathogens" methods would otherwise push entries into their
 * bucket. The dossier renders these as a question-mark specimen with
 * the paper column collapsed away — Disease X is the WHO placeholder
 * for "we don't know what's next", so a paper list would be dishonest.
 */
const SUPPRESS_PAPERS = new Set(["disease-x"]);

/** Return the paper list for a pathogen id (empty array if none). */
export function papersFor(pathogenId: string): PathogenPaper[] {
  if (SUPPRESS_PAPERS.has(pathogenId)) return [];
  return PAPERS[pathogenId] ?? [];
}
