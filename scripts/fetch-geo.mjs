#!/usr/bin/env node
// Builds src/data/research-geo.json (per-country citations + downloads) for the globe.

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import zlib from "node:zlib";
import readline from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const MAILTO = "cyrilgeismar@gmail.com";
const OA = "https://api.openalex.org";

// Mirrors TOOLS[] in fetch-metrics.mjs.
const TOOL_METHODS = {
  EpiEstim: ["10.1093/aje/kwt133", "10.1016/j.epidem.2019.100356"],
  outbreaker2: ["10.1186/s12859-018-2330-z", "10.1371/journal.pcbi.1003457"],
  SeqTrack: ["10.1038/hdy.2010.78"],
  linktree: ["10.1371/journal.pone.0313037"],
  mixtree: ["10.1371/journal.pcbi.1014271"],
};

const COUNTRIES = {
  US: { name: "United States", lat: 39.8, lon: -98.6 },
  GB: { name: "United Kingdom", lat: 54.0, lon: -2.4 },
  CN: { name: "China", lat: 35.9, lon: 104.2 },
  FR: { name: "France", lat: 46.6, lon: 2.4 },
  DE: { name: "Germany", lat: 51.2, lon: 10.4 },
  IT: { name: "Italy", lat: 42.8, lon: 12.6 },
  CH: { name: "Switzerland", lat: 46.8, lon: 8.2 },
  CA: { name: "Canada", lat: 56.1, lon: -106.3 },
  BR: { name: "Brazil", lat: -14.2, lon: -51.9 },
  KR: { name: "South Korea", lat: 36.5, lon: 127.9 },
  JP: { name: "Japan", lat: 36.2, lon: 138.3 },
  ES: { name: "Spain", lat: 40.2, lon: -3.7 },
  IN: { name: "India", lat: 22.6, lon: 79.6 },
  AU: { name: "Australia", lat: -25.3, lon: 133.8 },
  HK: { name: "Hong Kong", lat: 22.4, lon: 114.1 },
  NL: { name: "Netherlands", lat: 52.1, lon: 5.3 },
  BE: { name: "Belgium", lat: 50.6, lon: 4.6 },
  SE: { name: "Sweden", lat: 62.2, lon: 15.6 },
  AT: { name: "Austria", lat: 47.6, lon: 14.1 },
  DK: { name: "Denmark", lat: 56.1, lon: 9.5 },
  NO: { name: "Norway", lat: 64.6, lon: 12.6 },
  FI: { name: "Finland", lat: 64.9, lon: 26.1 },
  PL: { name: "Poland", lat: 51.9, lon: 19.1 },
  PT: { name: "Portugal", lat: 39.6, lon: -8.0 },
  IE: { name: "Ireland", lat: 53.2, lon: -8.0 },
  GR: { name: "Greece", lat: 39.1, lon: 22.0 },
  CZ: { name: "Czechia", lat: 49.8, lon: 15.5 },
  RU: { name: "Russia", lat: 61.5, lon: 105.3 },
  ZA: { name: "South Africa", lat: -30.6, lon: 22.9 },
  MX: { name: "Mexico", lat: 23.6, lon: -102.5 },
  AR: { name: "Argentina", lat: -38.4, lon: -63.6 },
  CL: { name: "Chile", lat: -35.7, lon: -71.5 },
  CO: { name: "Colombia", lat: 4.6, lon: -74.3 },
  PE: { name: "Peru", lat: -9.2, lon: -75.0 },
  SG: { name: "Singapore", lat: 1.35, lon: 103.8 },
  TW: { name: "Taiwan", lat: 23.7, lon: 121.0 },
  TH: { name: "Thailand", lat: 15.9, lon: 100.9 },
  MY: { name: "Malaysia", lat: 4.2, lon: 101.9 },
  ID: { name: "Indonesia", lat: -2.5, lon: 118.0 },
  VN: { name: "Vietnam", lat: 14.1, lon: 108.3 },
  PH: { name: "Philippines", lat: 12.9, lon: 121.8 },
  IL: { name: "Israel", lat: 31.0, lon: 34.9 },
  TR: { name: "Turkey", lat: 39.0, lon: 35.2 },
  SA: { name: "Saudi Arabia", lat: 23.9, lon: 45.1 },
  AE: { name: "United Arab Emirates", lat: 23.4, lon: 53.8 },
  IR: { name: "Iran", lat: 32.4, lon: 53.7 },
  EG: { name: "Egypt", lat: 26.8, lon: 30.8 },
  NG: { name: "Nigeria", lat: 9.1, lon: 8.7 },
  KE: { name: "Kenya", lat: -0.0, lon: 37.9 },
  GH: { name: "Ghana", lat: 7.9, lon: -1.0 },
  ET: { name: "Ethiopia", lat: 9.1, lon: 40.5 },
  UG: { name: "Uganda", lat: 1.4, lon: 32.3 },
  TZ: { name: "Tanzania", lat: -6.4, lon: 34.9 },
  CD: { name: "DR Congo", lat: -4.0, lon: 21.8 },
  CM: { name: "Cameroon", lat: 7.4, lon: 12.4 },
  SN: { name: "Senegal", lat: 14.5, lon: -14.5 },
  MA: { name: "Morocco", lat: 31.8, lon: -7.1 },
  TN: { name: "Tunisia", lat: 33.9, lon: 9.6 },
  NZ: { name: "New Zealand", lat: -40.9, lon: 174.9 },
  HU: { name: "Hungary", lat: 47.2, lon: 19.5 },
  RO: { name: "Romania", lat: 45.9, lon: 24.9 },
  RS: { name: "Serbia", lat: 44.0, lon: 21.0 },
  HR: { name: "Croatia", lat: 45.1, lon: 15.2 },
  BG: { name: "Bulgaria", lat: 42.7, lon: 25.5 },
  SK: { name: "Slovakia", lat: 48.7, lon: 19.7 },
  SI: { name: "Slovenia", lat: 46.2, lon: 15.0 },
  EE: { name: "Estonia", lat: 58.6, lon: 25.0 },
  LT: { name: "Lithuania", lat: 55.2, lon: 23.9 },
  LV: { name: "Latvia", lat: 56.9, lon: 24.6 },
  UA: { name: "Ukraine", lat: 48.4, lon: 31.2 },
  PK: { name: "Pakistan", lat: 30.4, lon: 69.3 },
  BD: { name: "Bangladesh", lat: 23.7, lon: 90.4 },
  LK: { name: "Sri Lanka", lat: 7.9, lon: 80.8 },
  NP: { name: "Nepal", lat: 28.4, lon: 84.1 },
  MM: { name: "Myanmar", lat: 21.9, lon: 95.96 },
  KH: { name: "Cambodia", lat: 12.6, lon: 104.9 },
  LA: { name: "Laos", lat: 19.9, lon: 102.5 },
  QA: { name: "Qatar", lat: 25.3, lon: 51.2 },
  KW: { name: "Kuwait", lat: 29.3, lon: 47.5 },
  JO: { name: "Jordan", lat: 30.6, lon: 36.2 },
  LB: { name: "Lebanon", lat: 33.9, lon: 35.9 },
  OM: { name: "Oman", lat: 21.5, lon: 55.9 },
  ZW: { name: "Zimbabwe", lat: -19.0, lon: 29.2 },
  ZM: { name: "Zambia", lat: -13.1, lon: 27.8 },
  MW: { name: "Malawi", lat: -13.3, lon: 34.3 },
  MZ: { name: "Mozambique", lat: -18.7, lon: 35.5 },
  RW: { name: "Rwanda", lat: -1.9, lon: 29.9 },
  SD: { name: "Sudan", lat: 12.9, lon: 30.2 },
  CI: { name: "Côte d’Ivoire", lat: 7.5, lon: -5.5 },
  BF: { name: "Burkina Faso", lat: 12.2, lon: -1.6 },
  ML: { name: "Mali", lat: 17.6, lon: -4.0 },
  GN: { name: "Guinea", lat: 9.9, lon: -11.0 },
  MG: { name: "Madagascar", lat: -18.8, lon: 46.9 },
  BW: { name: "Botswana", lat: -22.3, lon: 24.7 },
  EC: { name: "Ecuador", lat: -1.8, lon: -78.2 },
  UY: { name: "Uruguay", lat: -32.5, lon: -55.8 },
  VE: { name: "Venezuela", lat: 6.4, lon: -66.6 },
  BO: { name: "Bolivia", lat: -16.3, lon: -63.6 },
  PY: { name: "Paraguay", lat: -23.4, lon: -58.4 },
  CR: { name: "Costa Rica", lat: 9.7, lon: -83.8 },
  PA: { name: "Panama", lat: 8.5, lon: -80.8 },
  GT: { name: "Guatemala", lat: 15.8, lon: -90.2 },
  CU: { name: "Cuba", lat: 21.5, lon: -77.8 },
  DO: { name: "Dominican Republic", lat: 18.7, lon: -70.2 },
  IS: { name: "Iceland", lat: 64.9, lon: -19.0 },
  LU: { name: "Luxembourg", lat: 49.8, lon: 6.1 },
  CY: { name: "Cyprus", lat: 35.1, lon: 33.4 },
  MT: { name: "Malta", lat: 35.9, lon: 14.4 },
  GE: { name: "Georgia", lat: 42.3, lon: 43.4 },
  AM: { name: "Armenia", lat: 40.1, lon: 45.0 },
  AZ: { name: "Azerbaijan", lat: 40.1, lon: 47.6 },
  KZ: { name: "Kazakhstan", lat: 48.0, lon: 66.9 },
  UZ: { name: "Uzbekistan", lat: 41.4, lon: 64.6 },
  CG: { name: "Congo", lat: -0.7, lon: 15.8 },
  SS: { name: "South Sudan", lat: 7.9, lon: 29.7 },
  IQ: { name: "Iraq", lat: 33.2, lon: 43.7 },
  MN: { name: "Mongolia", lat: 46.9, lon: 103.8 },
  BN: { name: "Brunei", lat: 4.5, lon: 114.7 },
  MO: { name: "Macao", lat: 22.2, lon: 113.5 },
  AD: { name: "Andorra", lat: 42.5, lon: 1.6 },
  BA: { name: "Bosnia & Herzegovina", lat: 43.9, lon: 17.7 },
  BH: { name: "Bahrain", lat: 26.0, lon: 50.5 },
  BY: { name: "Belarus", lat: 53.7, lon: 27.9 },
  CF: { name: "Central African Republic", lat: 6.6, lon: 20.9 },
  GM: { name: "Gambia", lat: 13.4, lon: -15.3 },
  LR: { name: "Liberia", lat: 6.4, lon: -9.4 },
  YE: { name: "Yemen", lat: 15.6, lon: 48.0 },
  BI: { name: "Burundi", lat: -3.4, lon: 29.9 },
  FJ: { name: "Fiji", lat: -17.7, lon: 178.0 },
  FO: { name: "Faroe Islands", lat: 62.0, lon: -6.8 },
  MK: { name: "North Macedonia", lat: 41.6, lon: 21.7 },
  MV: { name: "Maldives", lat: 3.2, lon: 73.2 },
  NE: { name: "Niger", lat: 17.6, lon: 8.1 },
  NI: { name: "Nicaragua", lat: 12.9, lon: -85.2 },
  ST: { name: "São Tomé & Príncipe", lat: 0.2, lon: 6.6 },
  SZ: { name: "Eswatini", lat: -26.5, lon: 31.5 },
  TD: { name: "Chad", lat: 15.5, lon: 18.7 },
  SV: { name: "El Salvador", lat: 13.8, lon: -88.9 },
  NC: { name: "New Caledonia", lat: -20.9, lon: 165.6 },
  RE: { name: "Réunion", lat: -21.1, lon: 55.5 },
  GP: { name: "Guadeloupe", lat: 16.2, lon: -61.6 },
  PR: { name: "Puerto Rico", lat: 18.2, lon: -66.4 },
};

async function oaJson(url) {
  const res = await fetch(url + (url.includes("?") ? "&" : "?") + `mailto=${MAILTO}`);
  if (!res.ok) throw new Error(`OpenAlex ${res.status} for ${url}`);
  return res.json();
}

async function resolveWorkId(doi) {
  try {
    const w = await oaJson(`${OA}/works/doi:${doi}?select=id`);
    return String(w.id).replace("https://openalex.org/", "");
  } catch {
    return null;
  }
}

const iso2 = (key) => String(key).split("/").pop().toUpperCase();

// The cranlogs API has no country field, so we tally the raw RStudio CRAN logs.
const CRAN_PKGS = new Set([
  "EpiEstim",
  "outbreaker2",
  "outbreaker",
  "o2ools",
  "linktree",
  "mixtree",
]);
// Rolling window, never all-time: by-country downloads mean streaming whole daily
// logs, so the output labels its from/to and is never conflated with all-time totals.
const WINDOW_DAYS = Number(process.env.GEO_WINDOW_DAYS || 30);
// A day's log is 50–80 MB gzipped; the timeout is IDLE-only, so a slow-but-alive
// stream is never killed mid-transfer.
const DAY_TIMEOUT_MS = Number(process.env.GEO_DAY_TIMEOUT_MS || 600000);
const DAY_RETRIES = Number(process.env.GEO_DAY_RETRIES || 4);

const ymd = (d) => d.toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Tallies into a FRESH per-day Map, never the shared one: a retry after a
// mid-stream failure would otherwise double-count the rows already seen.
function fetchDayDownloads(date) {
  // http, not https — https to cran-logs.rstudio.com hangs.
  const url = `http://cran-logs.rstudio.com/${date.slice(0, 4)}/${date}.csv.gz`;
  return new Promise((resolveDay) => {
    let done = false;
    let req;
    const finish = (v) => {
      if (done) return;
      done = true;
      if (v === null && req) req.destroy();
      resolveDay(v);
    };
    const fail = () => finish(null);
    req = http.get(url, (r) => {
      if (r.statusCode === 404) {
        r.resume();
        return finish({ rows: 0, day: new Map(), missing: true });
      }
      if (r.statusCode !== 200) {
        r.resume();
        return fail();
      }
      const day = new Map();
      let rows = 0;
      const gunzip = zlib.createGunzip();
      const rl = readline.createInterface({ input: r.pipe(gunzip) });
      // A truncated day surfaces as Z_BUF_ERROR, and readline re-emits its input's
      // errors — without all three handlers it goes unhandled and crashes the process.
      r.on("error", fail);
      gunzip.on("error", fail);
      rl.on("error", fail);
      rl.on("line", (line) => {
        // date,time,size,r_version,r_arch,r_os,package,version,country,ip_id
        const f = line.split(",");
        if (f.length < 9) return;
        const pkg = f[6].replace(/"/g, "");
        if (!CRAN_PKGS.has(pkg)) return;
        const c = f[8].replace(/"/g, "").toUpperCase();
        if (!c || c === "NA") return;
        day.set(c, (day.get(c) ?? 0) + 1);
        rows++;
      });
      rl.on("close", () => finish({ rows, day }));
    });
    req.on("error", fail);
    req.setTimeout(DAY_TIMEOUT_MS, fail);
  });
}

async function fetchDownloadsByCountry() {
  const tally = new Map();
  const end = new Date(Date.now() - 2 * 864e5); // CRAN logs lag ~1–2 days
  const days = [];
  for (let i = 0; i < WINDOW_DAYS; i++)
    days.push(ymd(new Date(end.getTime() - i * 864e5)));
  let got = 0;
  let noLog = 0;
  let failed = 0;
  for (const d of days) {
    let result = null;
    for (let attempt = 1; attempt <= DAY_RETRIES; attempt++) {
      result = await fetchDayDownloads(d);
      if (result) break;
      if (attempt < DAY_RETRIES) {
        process.stdout.write(`  · ${d}: attempt ${attempt}/${DAY_RETRIES} failed, retrying…\n`);
        await sleep(2000 * attempt);
      }
    }
    if (!result) {
      failed++;
      process.stdout.write(`  · ${d}: UNAVAILABLE after ${DAY_RETRIES} attempts\n`);
      continue;
    }
    for (const [c, n] of result.day) tally.set(c, (tally.get(c) ?? 0) + n);
    if (result.missing) {
      noLog++;
      process.stdout.write(`  · ${d}: no log published\n`);
    } else {
      got++;
      process.stdout.write(`  · ${d}: ${result.rows} downloads\n`);
    }
  }
  const total = [...tally.values()].reduce((s, n) => s + n, 0);
  process.stdout.write(
    `> downloads: ${tally.size} countries, ${total} downloads over ${got}/${WINDOW_DAYS} days` +
      ` (${noLog} no-log, ${failed} failed)\n`,
  );
  return { tally, daysCovered: got, from: days[days.length - 1], to: days[0], total };
}

async function main() {
  const cites = new Map();
  for (const [tool, dois] of Object.entries(TOOL_METHODS)) {
    const ids = (await Promise.all(dois.map(resolveWorkId))).filter(Boolean);
    if (!ids.length) {
      process.stdout.write(`! ${tool}: no work ids resolved\n`);
      continue;
    }
    const data = await oaJson(
      `${OA}/works?filter=cites:${ids.join("%7C")}&group_by=authorships.countries`,
    );
    let sum = 0;
    for (const g of data.group_by) {
      if (!g.key) continue;
      cites.set(iso2(g.key), (cites.get(iso2(g.key)) ?? 0) + g.count);
      sum += g.count;
    }
    process.stdout.write(`> ${tool}: ${data.group_by.length} countries, ${sum} citer-slots\n`);
  }

  const dl = await fetchDownloadsByCountry();

  const codes = new Set([...cites.keys(), ...dl.tally.keys()]);
  const skipped = [];
  const countries = [...codes]
    .map((code) => {
      const c = COUNTRIES[code];
      if (!c) {
        skipped.push(code);
        return null;
      }
      return {
        code,
        name: c.name,
        citations: cites.get(code) ?? 0,
        downloads: dl.tally.get(code) ?? 0,
        lat: c.lat,
        lon: c.lon,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.citations - a.citations || b.downloads - a.downloads);
  if (skipped.length)
    process.stdout.write(`  (no centroid for ${skipped.length}: ${skipped.join(",")})\n`);

  const out = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: `OpenAlex (author countries citing the methods papers, all-time) + RStudio CRAN logs (downloads by country, ${dl.from} to ${dl.to})`,
    // Countries actually placed on the globe — those without a centroid are dropped above.
    citationCountryCount: countries.filter((c) => c.citations > 0).length,
    downloadCountryCount: countries.filter((c) => c.downloads > 0).length,
    downloadWindow: { days: dl.daysCovered, from: dl.from, to: dl.to, total: dl.total },
    maxCitations: Math.max(0, ...countries.map((c) => c.citations)),
    countries,
  };

  const outPath = resolve(root, "src/data/research-geo.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
  process.stdout.write(
    `\n✓ ${countries.length} countries → ${outPath}\n` +
      `  citations: ${cites.size} countries · downloads: ${dl.tally.size} countries (${dl.total} downloads / ${dl.daysCovered}d)\n`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
