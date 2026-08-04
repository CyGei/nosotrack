// Paper lookup for the dossier, built from TIMELINE plus MANUAL_PAPERS below.

import { TIMELINE } from "@/data/timeline";

export type PathogenPaper = {
  year: number;
  authors: string;
  title: string;
  url: string;
  journal?: string;
};

// Timeline pathogen-name → grid pathogen id. Unlisted names are dropped from the
// lookup (no specimen to hang them on: A. baumannii, measles, mpox, TB, polio, FMD).
const NAME_TO_ID: Record<string, string> = {
  "SARS-CoV-2": "sars-cov-2",
  // No SARS-CoV-1 specimen; its methods papers apply to betacoronaviruses generically.
  "SARS-CoV-1": "sars-cov-2",
  "MERS-CoV": "sars-cov-2",
  "Ebola virus": "ebola",
  Norovirus: "norovirus",
  "Klebsiella pneumoniae": "klebsiella",
  "Enterococcus faecium": "enterococcus",
  MRSA: "staph-aureus",
  HIV: "hiv",
  "H1N1 influenza": "influenza",
  "H7N7 avian influenza": "influenza",
  "H5N8 avian influenza": "influenza",
  "H3N8 equine influenza": "influenza",
  Influenza: "influenza",
};

// Broadcast key: a timeline entry tagged this way applies to every grid pathogen.
const BROADCAST_KEY = "Various pathogens";

// Hand-curated outbreak-reconstruction papers for grid pathogens with no timeline
// entries. Sourced + URL-verified 2026-05-24.
const MANUAL_PAPERS: Record<string, PathogenPaper[]> = {
  influenza: [
    {
      year: 2011,
      authors: "Bataille et al.",
      title:
        "Evolutionary Analysis of Inter-Farm Transmission Dynamics in a Highly Pathogenic Avian Influenza Epidemic",
      journal: "PLoS Pathogens",
      url: "https://journals.plos.org/plospathogens/article?id=10.1371/journal.ppat.1002094",
    },
    {
      year: 2012,
      authors: "Ypma et al.",
      title:
        "Unravelling transmission trees of infectious diseases by combining genetic and epidemiological data",
      journal: "Proceedings of the Royal Society B",
      url: "https://royalsocietypublishing.org/doi/10.1098/rspb.2011.0913",
    },
    {
      year: 2016,
      authors: "Poon et al.",
      title:
        "Quantifying influenza virus diversity and transmission in humans",
      journal: "Nature Genetics",
      url: "https://www.nature.com/articles/ng.3479",
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
    },
    {
      year: 2018,
      authors: "Kosakovsky Pond et al.",
      title:
        "HIV-TRACE (TRAnsmission Cluster Engine): a Tool for Large Scale Molecular Epidemiology of HIV-1 and Other Rapidly Evolving Pathogens",
      journal: "Molecular Biology and Evolution",
      url: "https://academic.oup.com/mbe/article/35/7/1812/4833215",
    },
    {
      year: 2019,
      authors: "Ratmann et al.",
      title:
        "Inferring HIV-1 transmission networks and sources of epidemic spread in Africa with deep-sequence phylogenetic analysis",
      journal: "Nature Communications",
      url: "https://www.nature.com/articles/s41467-019-09139-4",
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
    },
    // Sparse literature on WGS-based rhinovirus transmission inference; the
    // broadcast methods papers carry the rest.
  ],
  enterococcus: [
    {
      year: 2016,
      authors: "Brodrick et al.",
      title:
        "Whole-genome sequencing reveals transmission of vancomycin-resistant Enterococcus faecium in a healthcare network",
      journal: "Genome Medicine",
      url: "https://link.springer.com/article/10.1186/s13073-015-0259-7",
    },
    {
      year: 2017,
      authors: "Raven et al.",
      title:
        "Complex Routes of Nosocomial Vancomycin-Resistant Enterococcus faecium Transmission Revealed by Genome Sequencing",
      journal: "Clinical Infectious Diseases",
      url: "https://academic.oup.com/cid/article/64/7/886/3051757",
    },
    {
      year: 2021,
      authors: "Gouliouris et al.",
      title:
        "Quantifying acquisition and transmission of Enterococcus faecium using genomic surveillance",
      journal: "Nature Microbiology",
      url: "https://www.nature.com/articles/s41564-020-00806-7",
    },
  ],
  // Key must match `pathogens/c-auris.ts > id` — "cauris", no hyphen, or the
  // papers silently drop.
  cauris: [
    {
      year: 2016,
      authors: "Schelenz et al.",
      title:
        "First hospital outbreak of the globally emerging Candida auris in a European hospital",
      journal: "Antimicrobial Resistance & Infection Control",
      url: "https://pubmed.ncbi.nlm.nih.gov/27777756/",
    },
    {
      year: 2017,
      authors: "Lockhart et al.",
      title:
        "Simultaneous Emergence of Multidrug-Resistant Candida auris on 3 Continents Confirmed by Whole-Genome Sequencing and Epidemiological Analyses",
      journal: "Clinical Infectious Diseases",
      url: "https://academic.oup.com/cid/article/64/2/134/2706620",
    },
    {
      year: 2018,
      authors: "Eyre et al.",
      title:
        "A Candida auris Outbreak and Its Control in an Intensive Care Setting",
      journal: "New England Journal of Medicine",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1714373",
    },
  ],
  // No application papers exist for WHO's unknown-pathogen placeholder.
  "disease-x": [],
  // No E. coli-specific application paper; the broadcast methods papers carry it.
  ecoli: [],
  cdiff: [],
};

function build(): Record<string, PathogenPaper[]> {
  const out: Record<string, PathogenPaper[]> = {};

  // Ids are derived rather than imported from PATHOGENS — that import would be circular.
  const knownIds = new Set<string>([
    ...Object.keys(MANUAL_PAPERS),
    ...Object.values(NAME_TO_ID),
  ]);
  for (const id of knownIds) out[id] = [];

  const push = (id: string, paper: PathogenPaper) => {
    out[id] ??= [];
    if (out[id].some((p) => p.url === paper.url)) return;
    out[id].push(paper);
  };

  for (const entry of TIMELINE) {
    const paper: PathogenPaper = {
      year: parseInt(entry.year, 10) || 0,
      authors: entry.authors,
      title: entry.fullTitle ?? entry.method,
      url: entry.reference_url,
      journal: entry.journal,
    };

    const hasBroadcast = entry.pathogens.some(
      (p) => p.name.replace(/<br>?/g, " ").trim() === BROADCAST_KEY
    );

    if (hasBroadcast) {
      for (const id of knownIds) push(id, paper);
      continue;
    }

    for (const p of entry.pathogens) {
      const clean = p.name.replace(/<br>?/g, " ").trim();
      const id = NAME_TO_ID[clean];
      if (id) push(id, paper);
    }
  }

  for (const [id, papers] of Object.entries(MANUAL_PAPERS)) {
    for (const paper of papers) push(id, paper);
  }

  for (const id of Object.keys(out)) {
    out[id].sort((a, b) => a.year - b.year);
  }

  return out;
}

const PAPERS = build();

// Suppressed even against the broadcast papers: Disease X is unknown by definition.
const SUPPRESS_PAPERS = new Set(["disease-x"]);

export function papersFor(pathogenId: string): PathogenPaper[] {
  if (SUPPRESS_PAPERS.has(pathogenId)) return [];
  return PAPERS[pathogenId] ?? [];
}
