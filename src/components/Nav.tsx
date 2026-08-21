"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/BrandWordmark";
import { BrandMark } from "@/components/BrandMark";
import { requestHeroNav } from "@/components/hero/heroNav";

const NAV_LOGO = "Nosotrack";
const NAV_TAGLINE = "Outbreak forensics and control";
const NAV_LINKS: { label: string; href: string; newTab?: boolean }[] = [
  { label: "Platform", href: "https://nosotrack.onrender.com", newTab: true },
  { label: "About", href: "#about" },
  { label: "Research", href: "#research" },
  { label: "Team", href: "#team" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "News", href: "/news/" },
  { label: "Contact", href: "#contact" },
];

const PAST_HERO_PAD = 80;

export function Nav({ standalone = false }: { standalone?: boolean }) {
  const [overHero, setOverHero] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      const heroH = hero?.offsetHeight ?? 0;
      if (heroH > 0) {
        const past = window.scrollY > heroH - PAST_HERO_PAD;
        setOverHero(!past);
      } else {
        // Hero not measurable yet (pre-layout hydration) — assume on-hero near the top.
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

  const dark = !standalone && overHero;
  const showScrolledStyle = standalone || !overHero;
  const closeMobile = () => setMobileOpen(false);

  const resolvedHref = (href: string) =>
    standalone && href.startsWith("#") ? `/${href}` : href;

  const isCurrentPage = (href: string) =>
    standalone && href === "/news/";

  const opensNewTab = (link: (typeof NAV_LINKS)[number]) =>
    Boolean(link.newTab && !isCurrentPage(link.href));

  // Hero must collapse its cinematic first, else its completion-lock strands the first click.
  const onSectionLink = (
    e: MouseEvent<HTMLAnchorElement>,
    link: (typeof NAV_LINKS)[number],
  ) => {
    if (!standalone && link.href.startsWith("#") && requestHeroNav(link.href)) {
      e.preventDefault();
    }
  };

  return (
    <nav
      className={cn(
        "main-nav fixed inset-x-0 top-0 z-[1000] border-b",
        "transition-[background-color,border-color] duration-[var(--transition-duration-base)] ease-[var(--ease-nt)]",
        showScrolledStyle
          ? "border-rule bg-[rgba(239,238,239,0.92)] backdrop-blur-[8px] backdrop-saturate-[140%]"
          : "border-transparent bg-transparent",
      )}
      data-theme={dark ? "dark" : "light"}
      aria-label="Primary"
    >
      <div className="nav-inner container-page flex h-[72px] items-center justify-between">
        <div className="nav-brand flex items-center gap-[12px]">
          <a
            href={standalone ? "/" : "#top"}
            aria-hidden
            tabIndex={-1}
            className="nav-mark inline-flex h-10 w-10 shrink-0 items-center justify-center transition-colors duration-[var(--transition-duration-fast)]"
          >
            <BrandMark className="block h-full w-full" />
          </a>
          <div className="flex flex-col">
            <a
              href={standalone ? "/" : "#top"}
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

        <ul
          className="nav-links hidden list-none items-center gap-6 lg:flex xl:gap-9"
          role="list"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={resolvedHref(link.href)}
                onClick={(e) => onSectionLink(e, link)}
                {...(opensNewTab(link)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                aria-current={isCurrentPage(link.href) ? "page" : undefined}
                className="nav-link-underline relative font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-[var(--transition-duration-fast)]"
              >
                {link.label}
                {opensNewTab(link) && (
                  <span aria-hidden className="ml-[0.35em]">
                    ↗
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          className="nav-hamburger flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
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

      {mobileOpen && (
        <div
          className={cn(
            "border-t lg:hidden",
            dark ? "border-rule-inv bg-bg-ink" : "border-rule bg-bg",
          )}
        >
          <ul className="container-page flex list-none flex-col py-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={resolvedHref(link.href)}
                  onClick={(e) => {
                    onSectionLink(e, link);
                    closeMobile();
                  }}
                  {...(opensNewTab(link)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  aria-current={isCurrentPage(link.href) ? "page" : undefined}
                  className={cn(
                    "block border-b py-3 font-mono text-[11px] uppercase tracking-[0.18em]",
                    dark
                      ? "border-rule-inv text-inv hover:text-inv-hi"
                      : "border-rule text-mute hover:text-ink",
                  )}
                >
                  {link.label}
                  {opensNewTab(link) && (
                    <span aria-hidden className="ml-[0.35em]">
                      ↗
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
