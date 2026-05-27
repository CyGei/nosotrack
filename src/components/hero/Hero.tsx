/**
 * Hero — DESIGN_BRIEF §7.2 (rev. 5).
 *
 * Two-column dark canvas.
 *   - LEFT: headline + subtitle, vertically centred in the column so it
 *     sits in the visual middle of the hero (not under the nav, not at
 *     the foot of the page).
 *   - RIGHT: defence-tech blueprint with live particle network.
 *
 * The headline never overlaps the blueprint — they live in separate
 * columns. Mobile collapses to a stacked layout with the blueprint
 * below the headline.
 */

import { HeroBackdrop } from "./HeroBackdrop";

// Note: the product descriptor ("Outbreak forensics · Healthcare
// facilities") lives in the Nav as a brand-lockup tagline now, so the
// hero deliberately opens with the H1 — no eyebrow to compete with the
// "Track. Intervene. Protect." moment.
const HERO_TITLE = ["Track.", "Intervene.", "Protect."];
const HERO_SUBTITLE =
  "NosoTrack infers who infected whom in near real-time, enabling hospital control teams to stop outbreaks before they escalate.";

// Primary action opens the deployed Shiny dashboard in a new tab.
// Secondary scrolls to the first editorial block (#about) — global
// scroll-behavior: smooth in globals.css makes it glide rather than jump.
const HERO_CTA_PRIMARY = {
  label: "Live dashboard",
  href: "https://cygeismar.shinyapps.io/nosotrack-ui/",
};
const HERO_CTA_SECONDARY = {
  label: "Scroll to explore",
  href: "#about",
};

export function Hero() {
  return (
    <section
      id="hero"
      className="on-dark relative isolate min-h-[100svh] overflow-hidden"
    >
      <div className="container-page relative z-10 grid min-h-[100svh] grid-cols-12 gap-6 pb-16 pt-32 md:pb-20 md:pt-28">
        {/* LEFT — headline, vertically centred */}
        <div className="col-span-12 flex flex-col justify-center md:col-span-7 lg:col-span-6">
          {/* Hero title — JetBrains Mono per main branch legacy/styles.css §8.
              "Protect." picks up the breathing cream halo via .hero-accent.
              No top margin: the H1 is the first child of the centred column
              so the headline lands where the eye expects it. */}
          <h1 className="font-mono font-normal leading-[1.02] tracking-[-0.025em] text-inv-hi text-[clamp(2.6rem,7vw,6.4rem)] max-w-[20ch]">
            {HERO_TITLE.map((line, i) => {
              const isLast = i === HERO_TITLE.length - 1;
              return (
                <span key={i} className={isLast ? "block hero-accent" : "block"}>
                  {line}
                </span>
              );
            })}
          </h1>

          <p className="mt-14 max-w-[60ch] text-[18px] leading-[1.55] tracking-[-0.005em] text-inv">
            {HERO_SUBTITLE}
          </p>

          {/* CTA pair — primary (filled cream) opens the live dashboard
              in a new tab, secondary (outlined) scrolls to #about.
              Mono caps/tracking matches the Contact submit button so
              all hero-style CTAs across the site read as one family. */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={HERO_CTA_PRIMARY.href}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 border border-inv-hi bg-inv-hi px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink! transition-colors duration-[var(--transition-duration-fast)] hover:bg-transparent hover:text-inv-hi!"
            >
              {HERO_CTA_PRIMARY.label}
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className="h-3 w-3 transition-transform duration-[var(--transition-duration-fast)] group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
              >
                <path
                  d="M3 9 L9 3 M4.5 3 H9 V7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="square"
                />
              </svg>
            </a>

            <a
              href={HERO_CTA_SECONDARY.href}
              className="group inline-flex items-center gap-2 border border-inv-hi/40 bg-transparent px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-inv-hi transition-colors duration-[var(--transition-duration-fast)] hover:border-inv-hi hover:bg-inv-hi/5"
            >
              {HERO_CTA_SECONDARY.label}
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className="h-3 w-3 transition-transform duration-[var(--transition-duration-fast)] group-hover:translate-y-[2px]"
              >
                <path
                  d="M6 2 V10 M2.5 6.5 L6 10 L9.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="square"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* RIGHT — blueprint, square-ish so the whole drawing reads */}
        <div className="col-span-12 md:col-span-5 lg:col-span-6 relative">
          <div className="relative mx-auto aspect-square h-auto w-full max-w-[680px] md:absolute md:inset-0 md:h-full md:max-w-none md:aspect-auto">
            <HeroBackdrop />
          </div>
        </div>
      </div>
    </section>
  );
}
