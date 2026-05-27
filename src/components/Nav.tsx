"use client";

/* =========================================================================
   Nav — structural + visual port of main branch legacy/styles.css §7.
   ----------------------------------------------------------------------
   HTML structure (mirrors main):
     <nav class="main-nav">
       <div class="nav-inner">                  ← 72 px, flex space-between
         <div class="nav-brand">                ← div (not link); 10 px gap
           <span class="nav-mark">SVG</span>    ← only the mark is a span
           <a class="nav-logo">                 ← only the wordmark is a link
             <BrandWordmark />
           </a>
         </div>
         <ul class="nav-links">                 ← ul; links only (CTA dropped rev.13)
           <li><a>Link</a></li>
           …
         </ul>
         <button class="nav-hamburger">         ← 3 spans, animate to X
           <span/><span/><span/>
         </button>
       </div>
     </nav>

   Theme toggles independently of scroll:
     overHero  — hero element overlaps the nav band → cream text
     scrolled  — page scrolled > 8 px → cream backdrop + blur + border
   Inverted text only when (overHero && !scrolled), exactly matching
   main's `body.nav-on-dark nav.main-nav:not(.scrolled)` cascade.
   ========================================================================= */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/BrandWordmark";

const NAV_LOGO = "NosoTrack";
// Brand-lockup tagline — the product category descriptor that previously
// lived as the hero eyebrow. Pinned under the wordmark so it's visible on
// every page (defence-tech lockup pattern: Anduril/Shield AI). Hidden on
// mobile to avoid crowding the hamburger; the wordmark alone carries the
// brand on narrow screens.
const NAV_TAGLINE = "Outbreak forensics for healthcare facilities";
const NAV_LINKS: { label: string; href: string }[] = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research" },
  { label: "Team", href: "#team" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Contact", href: "#contact" },
];

// Verbatim from main.js: nav becomes "scrolled" at scrollY > 60, and the
// dark/inverted theme drops once scrollY > hero.offsetHeight - 80.
const SCROLLED_THRESHOLD = 60;
const PAST_HERO_PAD = 80;

export function Nav() {
  const [overHero, setOverHero] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // One single scroll handler that mirrors main.js — both flags driven
  // off window.scrollY so the trigger points match exactly. Defensive:
  // when the hero element isn't measurable yet (e.g. during hydration
  // before layout settles), assume we're still on it as long as scrollY
  // is near the top, so the "Noso" wordmark stays cream on the dark hero.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLLED_THRESHOLD);
      const hero = document.getElementById("hero");
      const heroH = hero?.offsetHeight ?? 0;
      if (heroH > 0) {
        const past = window.scrollY > heroH - PAST_HERO_PAD;
        setOverHero(!past);
      } else {
        // Hero not laid out yet — stay on-dark while the page is near
        // the top; flip to light only once the user has scrolled well
        // beyond a typical viewport.
        setOverHero(window.scrollY < 200);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const dark = overHero && !scrolled;
  const closeMobile = () => setMobileOpen(false);

  return (
    <nav
      className={cn(
        "main-nav fixed inset-x-0 top-0 z-[1000] border-b",
        "transition-[background-color,border-color] duration-[var(--transition-duration-base)] ease-[var(--ease-nt)]",
        scrolled
          ? "border-rule bg-[rgba(239,238,239,0.92)] backdrop-blur-[8px] backdrop-saturate-[140%]"
          : "border-transparent bg-transparent",
      )}
      data-theme={dark ? "dark" : "light"}
      aria-label="Primary"
    >
      <div className="nav-inner container-page flex h-[72px] items-center justify-between">
        {/* ── BRAND lockup: mark + (wordmark over tagline) ──
            The tagline pins the product descriptor underneath the wordmark
            so it persists across every page. Mark and lockup are vertically
            centred against each other; the lockup column stacks the
            (linked) wordmark with a small mono caption. */}
        <div className="nav-brand flex items-center gap-[12px]">
          <span
            aria-hidden
            className="nav-mark inline-flex h-10 w-10 shrink-0 items-center justify-center transition-colors duration-[var(--transition-duration-fast)]"
          >
            <svg
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeLinecap="square"
              className="block h-full w-full"
            >
              <path d="M3 8 L3 3 L8 3" strokeWidth="1.2" />
              <path d="M24 3 L29 3 L29 8" strokeWidth="1.2" />
              <path d="M29 24 L29 29 L24 29" strokeWidth="1.2" />
              <path d="M8 29 L3 29 L3 24" strokeWidth="1.2" />
              <g className="brand-mark-network" strokeLinecap="round">
                <line x1="16.00" y1="11.20" x2="16.00" y2="15.60" strokeWidth="0.55" />
                <line x1="11.31" y1="19.30" x2="15.13" y2="17.10" strokeWidth="0.55" />
                <line x1="20.69" y1="19.30" x2="16.87" y2="17.10" strokeWidth="0.55" />
                <circle cx="16" cy="9" r="2.2" strokeWidth="0.35" />
                <circle cx="9.4" cy="20.4" r="2.2" strokeWidth="0.35" />
                <circle cx="22.6" cy="20.4" r="2.2" strokeWidth="0.35" />
                <circle cx="16" cy="16.6" r="1.05" fill="#ff073a" stroke="none" />
              </g>
            </svg>
          </span>
          <div className="flex flex-col">
            <a
              href="#top"
              aria-label={`${NAV_LOGO} — home`}
              className="nav-logo text-[17px] leading-none transition-colors duration-[var(--transition-duration-fast)]"
            >
              <BrandWordmark />
            </a>
            <span
              aria-hidden
              className="nav-tagline mt-[5px] hidden whitespace-nowrap font-mono text-[10px] font-normal leading-none tracking-[0.04em] transition-colors duration-[var(--transition-duration-fast)] md:block"
            >
              {NAV_TAGLINE}
            </span>
          </div>
        </div>

        {/* ── DESKTOP nav-links UL ── */}
        <ul
          className="nav-links hidden list-none items-center gap-9 md:flex"
          role="list"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-link-underline relative font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-[var(--transition-duration-fast)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* ── HAMBURGER — 3 spans (top + middle + bottom), morph to X ── */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          className="nav-hamburger flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span
            className={cn(
              "block h-px w-[22px] bg-current transition-transform duration-[var(--transition-duration-fast)]",
              mobileOpen && "translate-y-[6px] rotate-45",
            )}
          />
          <span
            className={cn(
              "block h-px w-[22px] bg-current transition-opacity duration-[var(--transition-duration-fast)]",
              mobileOpen && "opacity-0",
            )}
          />
          <span
            className={cn(
              "block h-px w-[22px] bg-current transition-transform duration-[var(--transition-duration-fast)]",
              mobileOpen && "-translate-y-[6px] -rotate-45",
            )}
          />
        </button>
      </div>

      {/* ── MOBILE sheet — drops below the 72 px rim ── */}
      {mobileOpen && (
        <div
          className={cn(
            "md:hidden border-t",
            dark ? "border-rule-inv bg-bg-ink" : "border-rule bg-bg",
          )}
        >
          <ul className="container-page flex list-none flex-col py-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMobile}
                  className={cn(
                    "block border-b py-3 font-mono text-[11px] uppercase tracking-[0.18em]",
                    dark
                      ? "border-rule-inv text-inv hover:text-inv-hi"
                      : "border-rule text-mute hover:text-ink",
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
