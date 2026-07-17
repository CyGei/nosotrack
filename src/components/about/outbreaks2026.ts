/**
 * OUTBREAKS_2026 — major person-to-person disease outbreaks of 2025-2026, taken
 * from WHO Disease Outbreak News (DON). Every headline is a WHO DON item
 * (who.int/emergencies/disease-outbreak-news/item/...) — the single source of
 * truth for this timeline; each URL was fetched and verified. `cases` is the
 * outbreak total from the latest DON; `date` is "YYYY-MM" for placement on the
 * 2025→2026 curve. Vector-borne / water-borne / non-person-to-person events are
 * excluded (Nosotrack reconstructs who-infected-whom, which needs a
 * person-to-person chain), as are duplicate DON updates of the same outbreak.
 */

export type OutbreakHeadline = { outlet: string; text: string; href: string };

export type Outbreak = {
  id: string;
  /** Disease name shown at the node. */
  short: string;
  /** Short country/scope. */
  country: string;
  /** Case tally (rendered as "N+"). */
  cases: number;
  /** "YYYY-MM" of the DON — position on the 2025→2026 axis. */
  date: string;
  /** WHO Disease Outbreak News headline(s). */
  headlines: OutbreakHeadline[];
};

const DON = "https://www.who.int/emergencies/disease-outbreak-news/item/";

export const OUTBREAKS_2026: Outbreak[] = [
  {
    id: "marburg-tanzania",
    short: "Marburg",
    country: "Tanzania",
    cases: 10,
    date: "2025-01",
    headlines: [
      {
        outlet: "WHO",
        text: "Outbreak of suspected Marburg virus disease – United Republic of Tanzania",
        href: `${DON}2025-DON552`,
      },
    ],
  },
  {
    id: "ebola-uganda",
    short: "Ebola",
    country: "Uganda",
    cases: 14,
    date: "2025-02",
    headlines: [
      {
        outlet: "WHO",
        text: "Sudan virus disease – Uganda",
        href: `${DON}2025-DON566`,
      },
    ],
  },
  {
    id: "measles-2025",
    short: "Measles",
    country: "United States",
    cases: 378,
    date: "2025-03",
    headlines: [
      {
        outlet: "WHO",
        text: "Measles – United States of America",
        href: `${DON}2025-DON561`,
      },
    ],
  },
  {
    id: "meningococcal",
    short: "Meningococcal",
    country: "Saudi Arabia",
    cases: 17,
    date: "2025-04",
    headlines: [
      {
        outlet: "WHO",
        text: "Invasive meningococcal disease – Kingdom of Saudi Arabia",
        href: `${DON}2025-DON563`,
      },
    ],
  },
  {
    id: "measles-morocco",
    short: "Measles",
    country: "Morocco",
    cases: 25000,
    date: "2025-05",
    headlines: [
      {
        outlet: "WHO",
        text: "Measles – Morocco",
        href: `${DON}2025-DON568`,
      },
    ],
  },
  {
    id: "mers",
    short: "MERS",
    country: "Saudi Arabia",
    cases: 9,
    date: "2025-05",
    headlines: [
      {
        outlet: "WHO",
        text: "Middle East respiratory syndrome coronavirus – Kingdom of Saudi Arabia",
        href: `${DON}2025-DON569`,
      },
    ],
  },
  {
    id: "polio-png",
    short: "Polio",
    country: "Papua New Guinea",
    cases: 2,
    date: "2025-05",
    headlines: [
      {
        outlet: "WHO",
        text: "Circulating vaccine-derived poliovirus type 2 (cVDPV2) – Papua New Guinea",
        href: `${DON}2025-DON571`,
      },
    ],
  },
  {
    id: "nipah",
    short: "Nipah",
    country: "India",
    cases: 4,
    date: "2025-08",
    headlines: [
      {
        outlet: "WHO",
        text: "Nipah virus infection – India",
        href: `${DON}2025-DON577`,
      },
    ],
  },
  {
    id: "ebola-drc",
    short: "Ebola",
    country: "DR Congo",
    cases: 64,
    date: "2025-09",
    headlines: [
      {
        outlet: "WHO",
        text: "Ebola virus disease – Democratic Republic of the Congo",
        href: `${DON}2025-DON589`,
      },
    ],
  },
  {
    id: "marburg",
    short: "Marburg",
    country: "Ethiopia",
    cases: 19,
    date: "2025-11",
    headlines: [
      {
        outlet: "WHO",
        text: "Marburg virus disease – Ethiopia",
        href: `${DON}2026-DON592`,
      },
    ],
  },
  {
    id: "diphtheria",
    short: "Diphtheria",
    country: "Africa",
    cases: 20412,
    date: "2025-11",
    headlines: [
      {
        outlet: "WHO",
        text: "Diphtheria – African Region (AFRO)",
        href: `${DON}DON588`,
      },
    ],
  },
  {
    id: "mpox",
    short: "Mpox",
    country: "Global",
    cases: 43,
    date: "2025-12",
    headlines: [
      {
        outlet: "WHO",
        text: "Broader transmission of mpox due to clade Ib MPXV – Global situation",
        href: `${DON}2025-DON587`,
      },
    ],
  },
  {
    id: "measles-2026",
    short: "Measles",
    country: "Bangladesh",
    cases: 19161,
    date: "2026-04",
    headlines: [
      {
        outlet: "WHO",
        text: "Measles – Bangladesh",
        href: `${DON}2026-DON598`,
      },
    ],
  },
  {
    id: "ebola-bundibugyo",
    short: "Ebola",
    country: "DR Congo & Uganda",
    cases: 1481,
    date: "2026-05",
    headlines: [
      {
        outlet: "WHO",
        text: "Ebola disease caused by Bundibugyo virus – Democratic Republic of the Congo & Uganda",
        href: `${DON}2026-DON612`,
      },
    ],
  },
  {
    id: "hantavirus",
    short: "Hantavirus",
    country: "Cruise ship",
    cases: 13,
    date: "2026-06",
    headlines: [
      {
        outlet: "WHO",
        text: "Hantavirus outbreak linked to cruise ship travel",
        href: `${DON}2026-DON611`,
      },
    ],
  },
];
