# How the research metrics are collected

The **"Open science, by the numbers"** section (`#impact` on the home page) is
generated entirely by one script — `scripts/fetch-metrics.mjs` — which pulls
from two free public databases and writes the results to
`src/data/research-metrics.json` and `public/research-citations.json`. The
website only ever reads those two files; **no figure is typed by hand.**

The section tells its story in **two bands**:

- **Band 1 — the people.** The four researchers' whole-career publication and
  citation totals. A credibility signal, honestly labelled as their *entire*
  body of work — not the tools.
- **Band 2 — the tools.** The six packages/methods the platform is built on,
  each with its downloads, the papers *we* wrote about it, and every paper that
  cites it.

## Sources

- **OpenAlex** (`api.openalex.org`) — an open catalogue of the world's
  scholarly papers. Used for every publication and citation number. Free, no
  API key.
- **cranlogs** (`cranlogs.r-pkg.org`) — the download logs of the Posit/RStudio
  CRAN mirror. Used for every package download number. Free, no API key.

## Band 1 — the people

Each researcher is identified by their **ORCID** — a permanent researcher ID —
rather than by name, which avoids confusing them with other authors who share a
name.

| Researcher | ORCID |
| --- | --- |
| Thibaut Jombart | 0000-0003-2226-8692 |
| Anne Cori | 0000-0002-8443-9162 |
| Finlay Campbell | 0000-0002-1849-1886 |
| Cyril Geismar | 0000-0002-8486-5890 |

For each ORCID we download the person's full works list and keep only genuine
publications — articles, reviews, books and chapters, reports, dissertations
and letters. We deliberately drop **figures, datasets and supplements** (PLOS/
Figshare mint a separate DOI for every figure, which would inflate a ~12-paper
record to ~90) and **preprints** (OpenAlex often stores a preprint and its
published version as two records, double-counting both). The team totals are
de-duplicated across the four, so a co-authored paper counts once.

## Band 2 — the tools

The six tools, each defined in the script's `TOOLS` config:

| Tool | CRAN package(s) | Methods paper DOI(s) |
| --- | --- | --- |
| EpiEstim | `EpiEstim` | `10.1093/aje/kwt133` (2013) + `10.1016/j.epidem.2019.100356` (2019) |
| outbreaker2 | `outbreaker2` + `outbreaker` | `10.1186/s12859-018-2330-z` (2018) + `10.1371/journal.pcbi.1003457` (2014) |
| o2ools | `o2ools` | — (companion utility, no standalone paper) |
| SeqTrack | — (a method, no package of its own) | `10.1038/hdy.2010.78` (2011) |
| linktree | `linktree` | `10.1371/journal.pone.0313037` (2024) |
| mixtree | `mixtree` | `10.1371/journal.pcbi.1014271` (2025) |

### Downloads

For each tool with a CRAN package we ask cranlogs for the all-time total and
the month-by-month history, summing where a tool spans more than one package
name (outbreaker2 = `outbreaker` + `outbreaker2`). The monthly history drives
the sparkline on each card. **SeqTrack has no CRAN package of its own** — it is
a method, so its card shows citations only and no download figure. (We
deliberately do **not** attribute another package's downloads to it.)

### Our papers (methods + application)

"Our papers" for a tool is a curated-but-mostly-automatic set:

- the **methods paper(s)** we wrote to describe the tool, plus
- the **application papers** — the studies *we* wrote that **used** the tool.
  These are derived automatically: any **team-authored** work that cites the
  tool's methods paper and is not itself a methods paper. `appInclude` /
  `appExclude` (bare DOIs) in the config override the derivation at the edges.

The browsable "papers behind the tools" list on the page is this set, deduped
across tools (a study that used two tools appears once, tagged with both) and
badged **Methods** vs **Used it**.

### Citations to each tool

A tool's citation list is **every paper that cites the tool or any of our
papers for it** — two hops in OpenAlex:

1. works that cite the **methods paper(s)**, plus
2. works that cite our **application papers** (from the step above).

Citers are de-duplicated across both hops and across a tool's papers, so the
count is the number of **unique** citing works — the same list you can browse
in the citation database. Each citer authored by one of the four is flagged
`byTeam` (a self / follow-on citation), so the explorer can badge and hide
them. This list is **not** type-filtered — the goal is to show everyone who
uses the tools, preprints included.

## The generated file

- `src/data/research-metrics.json` — both bands plus per-tool detail
  (downloads, monthly series, the tool's own papers, citation count). Small
  (~60 KB), so it is **bundled** into the page. The headline counts and the
  per-tool chips all read from this one file.

The raw citing-papers database (~4,000 rows) is computed only to derive the
citation counts above; it is **not** persisted or shipped — nothing at build-
or run-time consumes it, so writing it out would just bloat the deploy.

## Automation

The script runs at build time and on a scheduled GitHub Action
(`.github/workflows/refresh-metrics.yml`) every Monday: it regenerates
`research-metrics.json` (and, via `fetch:geo`, `research-geo.json`), commits
them, and triggers a redeploy. Because the files are committed, their git
history is also a free week-by-week record of how the numbers change.

## Things to keep in mind

- The citation figures are **OpenAlex's**, typically more conservative than
  Google Scholar's.
- Downloads come from **one CRAN mirror** (the only one that publishes logs) —
  the standard proxy for R-package usage, not a literal global count.
- ORCID coverage is only as complete as each profile; a thin profile can
  under-count (Finlay Campbell currently shows ~16 works).
- **EpiEstim dominates the tool numbers** — it alone accounts for ~217k of the
  ~312k downloads and ~3.7k of the ~4k citing papers, because it is the most
  widely used of the six and the team has applied it in ~50 of its own studies.
  Only ~100 of the ~4k citing papers are the team's own, so the citation net is
  overwhelmingly external adoption, not self-citation.
