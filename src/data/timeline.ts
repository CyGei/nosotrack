/**
 * Outbreak-forensics research timeline.
 *
 * Used by `src/components/research/papersByPathogen.ts` to build the
 * per-pathogen paper lookup. Pathogen-name strings are matched against
 * `NAME_TO_ID` in that file; "Various pathogens" is the broadcast key.
 *
 * Wording is verbatim from the original content.json — this file
 * replaces the JSON-as-CMS pattern with structured data colocated with
 * its consumer.
 */

export type TimelinePathogen = {
  name: string;
  applicationYear: string;
  icon: string;
};

export type TimelineEntry = {
  year: string;
  type: "method" | "application";
  /** Short tag — falls back here if `fullTitle` is absent. */
  method: string;
  /** Verbatim published paper title — preferred display name. */
  fullTitle?: string;
  authors: string;
  description: string;
  pathogens: TimelinePathogen[];
  reference_url: string;
  journal?: string;
};

export const TIMELINE: TimelineEntry[] = [
  {
    year: "2008",
    type: "method",
    method: "Cottam et al. method",
    fullTitle:
      "Integrating genetic and epidemiological data to determine transmission pathways of foot-and-mouth disease virus",
    authors: "Cottam et al.",
    description:
      "Integrates genetic and epidemiological data using an SEIR model for transmission; assumes complete bottleneck and all cases observed/sampled; inference via maximum likelihood.",
    pathogens: [
      {
        name: "Foot-and-mouth disease<br>(FMD)",
        applicationYear: "2001",
        icon: "🐄",
      },
    ],
    reference_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2599933/",
    journal: "Proceedings of the Royal Society B",
  },
  {
    year: "2011",
    type: "method",
    method: "SeqTrack",
    fullTitle:
      "Reconstructing disease outbreaks from genetic data: a graph approach",
    authors: "Jombart et al.",
    description:
      "Reconstructs transmission trees from genetic data using a graph approach; minimizes total genetic distance; no explicit transmission model.",
    pathogens: [
      { name: "H1N1 influenza", applicationYear: "2009", icon: "🦠" },
      { name: "H3N8 equine influenza", applicationYear: "N/A", icon: "🐴" },
      { name: "Mycobacterium tuberculosis", applicationYear: "N/A", icon: "🦠" },
      { name: "Klebsiella pneumoniae", applicationYear: "N/A", icon: "🦠" },
    ],
    reference_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3183872/",
    journal: "Heredity",
  },
  {
    year: "2012",
    type: "method",
    method: "Ypma et al. method",
    fullTitle:
      "Genetic data provide evidence for wind-mediated transmission of highly pathogenic avian influenza",
    authors: "Ypma et al.",
    description:
      "Bayesian method using mutations; SEIR transmission model with spatial kernel; single introduction.",
    pathogens: [
      { name: "H7N7 avian influenza", applicationYear: "N/A", icon: "🐔" },
    ],
    reference_url: "https://pubmed.ncbi.nlm.nih.gov/23230058/",
    journal: "Proceedings of the Royal Society B",
  },
  {
    year: "2013",
    type: "method",
    method: "Teunis et al. method",
    fullTitle:
      "Infectious disease transmission as a forensic problem: who infected whom?",
    authors: "Teunis et al.",
    description:
      "Frames infectious disease transmission as a forensic problem; uses likelihood-based approach to identify who infected whom from epidemiological data; models serial interval and infectious period distributions.",
    pathogens: [{ name: "Norovirus", applicationYear: "N/A", icon: "🦠" }],
    reference_url:
      "https://royalsocietypublishing.org/doi/10.1098/rsif.2012.0955",
    journal: "Journal of the Royal Society Interface",
  },
  {
    year: "2014",
    type: "method",
    method: "outbreaker",
    fullTitle:
      "Bayesian Reconstruction of Disease Outbreaks by Combining Epidemiologic and Genomic Data",
    authors: "Jombart et al.",
    description:
      "Bayesian reconstruction combining epidemiologic and genomic data; SI transmission model; handles multiple introductions and sampled cases.",
    pathogens: [
      { name: "SARS-CoV-1", applicationYear: "N/A", icon: "[Spike]" },
      { name: "Bovine viral diarrhea virus", applicationYear: "N/A", icon: "🐄" },
      { name: "Klebsiella pneumoniae", applicationYear: "N/A", icon: "🦠" },
      { name: "Acinetobacter baumannii", applicationYear: "N/A", icon: "🦠" },
    ],
    reference_url:
      "https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003457",
    journal: "PLOS Computational Biology",
  },
  {
    year: "2015",
    type: "method",
    method: "beastlier",
    fullTitle:
      "Epidemic Reconstruction in a Phylogenetics Framework: Transmission Trees as Partitions of the Node Set",
    authors: "Hall et al.",
    description:
      "Simultaneous inference in BEAST framework; coalescent process; SEIR model with spatial kernel.",
    pathogens: [
      { name: "H7N7 avian influenza", applicationYear: "N/A", icon: "🐔" },
      { name: "H5N8 avian influenza", applicationYear: "N/A", icon: "🐔" },
    ],
    reference_url:
      "https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1004613",
    journal: "PLOS Computational Biology",
  },
  {
    year: "2015",
    type: "method",
    method: "Famulare et al. method",
    fullTitle:
      "Extracting transmission networks from phylogeographic data for epidemic and endemic diseases: Ebola virus in Sierra Leone, 2009 H1N1 pandemic influenza and polio in Nigeria",
    authors: "Famulare et al.",
    description:
      "Uses likelihood ratio test for time of most recent common ancestor; Poisson mutation model; no explicit transmission model.",
    pathogens: [
      { name: "Ebola virus", applicationYear: "2014", icon: "🦠" },
      { name: "H1N1 influenza", applicationYear: "2009", icon: "🦠" },
      { name: "Polio", applicationYear: "2005-2008", icon: "🦠" },
    ],
    reference_url:
      "https://academic.oup.com/inthealth/article/7/2/130/663364",
    journal: "International Health",
  },
  {
    year: "2017",
    type: "method",
    method: "TransPhylo",
    fullTitle:
      "Genomic Infectious Disease Epidemiology in Partially Sampled and Ongoing Outbreaks",
    authors: "Didelot et al.",
    description:
      "Bayesian method in R package; coalescent process; SI model; handles ongoing outbreaks and proportion of sampled cases.",
    pathogens: [
      { name: "Mycobacterium tuberculosis", applicationYear: "N/A", icon: "🦠" },
      { name: "Klebsiella pneumoniae", applicationYear: "N/A", icon: "🦠" },
      { name: "SARS-CoV-2", applicationYear: "2020", icon: "[Spike]" },
      { name: "Mumps", applicationYear: "N/A", icon: "🦠" },
    ],
    reference_url:
      "https://academic.oup.com/mbe/article/34/4/997/2919386",
    journal: "Molecular Biology and Evolution",
  },
  {
    year: "2017",
    type: "method",
    method: "phybreak",
    fullTitle:
      "Simultaneous inference of phylogenetic and transmission trees in infectious disease outbreaks",
    authors: "Klinkenberg et al.",
    description:
      "Simultaneous inference in R package; coalescent process; SI model; all cases observed but not always sampled.",
    pathogens: [
      { name: "Mycobacterium tuberculosis", applicationYear: "N/A", icon: "🦠" },
      { name: "MRSA", applicationYear: "N/A", icon: "🦠" },
      { name: "FMD", applicationYear: "N/A", icon: "🐄" },
      { name: "H7N7 avian influenza", applicationYear: "N/A", icon: "🐔" },
    ],
    reference_url:
      "https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1005495",
    journal: "PLOS Computational Biology",
  },
  {
    year: "2018",
    type: "method",
    method: "outbreaker2",
    fullTitle:
      "outbreaker2: a modular platform for outbreak reconstruction",
    authors: "Campbell et al.",
    description:
      "A modular platform for outbreak forensics; extends outbreaker with a flexible, module-based architecture allowing custom likelihood functions, movement models, and prior distributions; implemented as an R package.",
    pathogens: [
      { name: "SARS-CoV-1", applicationYear: "N/A", icon: "[Spike]" },
      { name: "Influenza", applicationYear: "N/A", icon: "🦠" },
      { name: "Ebola virus", applicationYear: "2014", icon: "🦠" },
    ],
    reference_url:
      "https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-018-2330-z",
    journal: "BMC Bioinformatics",
  },
  {
    year: "2018",
    type: "method",
    method: "Genome informativeness",
    fullTitle:
      "When are pathogen genome sequences informative of transmission events?",
    authors: "Campbell et al.",
    description:
      "Investigates when pathogen genome sequences are informative of transmission events; quantifies the relationship between genomic diversity, mutation rates, and the ability to resolve transmission links; provides guidance on when genomic data adds value to epidemiological investigation.",
    pathogens: [{ name: "Various pathogens", applicationYear: "N/A", icon: "🦠" }],
    reference_url:
      "https://journals.plos.org/plospathogens/article?id=10.1371/journal.ppat.1006885",
    journal: "PLOS Pathogens",
  },
  {
    year: "2019",
    type: "method",
    method: "Adding contact data to outbreaker2",
    fullTitle:
      "Bayesian inference of transmission chains using timing of symptoms, pathogen genomes and contact data",
    authors: "Campbell et al.",
    description:
      "Bayesian inference of transmission chains combining timing of symptoms, pathogen genomes, and contact data; extends outbreaker2 framework to integrate contact tracing data as an additional source of information for transmission tree reconstruction.",
    pathogens: [
      { name: "SARS-CoV-1", applicationYear: "N/A", icon: "[Spike]" },
      { name: "MERS-CoV", applicationYear: "N/A", icon: "[Spike]" },
      { name: "Ebola virus", applicationYear: "2014", icon: "🦠" },
    ],
    reference_url:
      "https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1006930",
    journal: "PLOS Computational Biology",
  },
  {
    year: "2020",
    type: "method",
    method: "TiTUS",
    fullTitle:
      "Sampling and summarizing transmission trees with multi-strain infections",
    authors: "Sashittal et al.",
    description:
      "Labels internal nodes in phylogenetic tree; weak bottleneck; no explicit transmission model.",
    pathogens: [{ name: "HIV", applicationYear: "N/A", icon: "🦠" }],
    reference_url:
      "https://academic.oup.com/bioinformatics/article/36/Supplement_1/i362/5870507",
    journal: "Bioinformatics",
  },
  {
    year: "2020",
    type: "method",
    method: "Montazeri et al. method",
    fullTitle:
      "Bayesian reconstruction of transmission trees from genetic sequences and uncertain infection times",
    authors: "Montazeri et al.",
    description:
      "Reconstructs phylogenetic tree from transmission tree; Jukes-Cantor model; all cases observed and sampled.",
    pathogens: [
      { name: "HIV", applicationYear: "N/A", icon: "🦠" },
      { name: "Ebola virus", applicationYear: "2014", icon: "🦠" },
    ],
    reference_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8212962/",
    journal: "Statistical Applications in Genetics and Molecular Biology",
  },
  {
    year: "2021",
    type: "application",
    method: "Rehabilitation clinic outbreak",
    fullTitle:
      "Explosive nosocomial outbreak of SARS-CoV-2 in a rehabilitation clinic: the limits of genomics for outbreak reconstruction",
    authors: "Abbas et al.",
    description:
      "Bayesian framework combining genomic and epidemiological data using outbreaker2 to reconstruct transmission trees in a nosocomial SARS-CoV-2 outbreak; assesses limits of genomics for outbreak forensics.",
    pathogens: [{ name: "SARS-CoV-2", applicationYear: "2020", icon: "[Spike]" }],
    reference_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8393517/",
    journal: "Journal of Hospital Infection",
  },
  {
    year: "2022",
    type: "application",
    method: "Within-hospital transmission across two pandemic waves",
    fullTitle:
      "Characterising within-hospital SARS-CoV-2 transmission events using epidemiological and viral genomic data across two pandemic waves",
    authors: "Lindsey, Villabona-Arenas, Campbell et al.",
    description:
      "Combines viral genomic and epidemiological data from 2,181 participants across two pandemic waves at a UK NHS Trust using Bayesian transmission reconstruction; reveals a shift from staff-to-staff to patient-to-patient transmissions between waves, and finds that hospital-onset cases drove most onward transmission.",
    pathogens: [
      { name: "SARS-CoV-2", applicationYear: "2020–2021", icon: "[Spike]" },
    ],
    reference_url: "https://www.nature.com/articles/s41467-022-28291-y",
    journal: "Nature Communications",
  },
  {
    year: "2022",
    type: "application",
    method: "Geriatric acute-care hospital outbreak",
    fullTitle:
      "Reconstruction of transmission chains of SARS-CoV-2 amidst multiple outbreaks in a geriatric acute-care hospital: a combined retrospective epidemiological and genomic study",
    authors: "Abbas et al.",
    description:
      "Combined retrospective epidemiological and genomic study using outbreaker2 to reconstruct transmission chains of SARS-CoV-2 amidst multiple outbreaks in a geriatric acute-care hospital.",
    pathogens: [{ name: "SARS-CoV-2", applicationYear: "2020", icon: "[Spike]" }],
    reference_url: "https://elifesciences.org/articles/76854",
    journal: "eLife",
  },
  {
    year: "2023",
    type: "application",
    method: "SARS-CoV-2 household transmissions",
    fullTitle:
      "Bayesian reconstruction of SARS-CoV-2 transmissions highlights substantial proportion of negative serial intervals",
    authors: "Geismar et al.",
    description:
      "Uses a Bayesian framework to infer transmission pairs by exploring all compatible transmission trees based on symptom dates, incorporating a wide range of incubation period and generation time distributions; derives serial intervals from reconstructed pairs, stratified by variants, to account for negative serial intervals.",
    pathogens: [
      { name: "SARS-CoV-2", applicationYear: "2020–2022", icon: "[Spike]" },
    ],
    reference_url: "https://pubmed.ncbi.nlm.nih.gov/37579586/",
    journal: "Epidemics",
  },
  {
    year: "2024",
    type: "method",
    method: "linktree",
    fullTitle:
      "Sorting out assortativity: When can we assess the contributions of different population groups to epidemic transmission?",
    authors: "Geismar et al.",
    description:
      "A framework to estimate group transmission assortativity from transmission chain data, quantifying the extent of within-group vs. between-group transmissions while accounting for group sizes and depletion of susceptibles; implemented in an R package.",
    pathogens: [{ name: "Various pathogens", applicationYear: "N/A", icon: "🦠" }],
    reference_url:
      "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0313037",
    journal: "PLOS ONE",
  },
  {
    year: "2025",
    type: "method",
    method: "mixtree",
    fullTitle: "A statistical framework for comparing epidemic forests",
    authors: "Geismar et al.",
    description:
      "A statistical framework implemented in the R package mixtree to compare epidemic forests (collections of plausible transmission trees) using chi-square test and PERMANOVA for detecting differences in transmission dynamics.",
    pathogens: [{ name: "Various pathogens", applicationYear: "N/A", icon: "🦠" }],
    reference_url: "https://arxiv.org/html/2511.20819v1",
    journal: "arXiv (preprint)",
  },
];
