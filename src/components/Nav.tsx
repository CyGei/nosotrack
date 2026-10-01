"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/BrandWordmark";
import { BrandMark } from "@/components/BrandMark";

const NAV_LOGO = "Nosotrack";
const NAV_TAGLINE = "Outbreak forensics and control";
const NAV_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "About", href: "#about" },
  { label: "For partners", href: "/for-partners/" },
  { label: "Research", href: "#impact" },
  { label: "Team", href: "#team" },
  { label: "News", href: "/news/" },
  { label: "Platform", href: "https://nosotrack.onrender.com", external: true },
  { label: "Contact", href: "#contact" },
];

const PAST_HERO_PAD = 80;

export function Nav({ standalone = false }: { standalone?: boolean }) {
  const pathname = usePathname();
  const [overHero, setOverHero] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => {
      setHasScrolled(window.scrollY > 24);
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
    standalone && href.replace(/\/$/, "") === pathname.replace(/\/$/, "");

  return (
    <nav
      className={cn(
        "main-nav fixed inset-x-0 top-0 z-[1000] border-b",
        "transition-[background-color,border-color] duration-[var(--transition-duration-base)] ease-[var(--ease-nt)]",
        showScrolledStyle
          ? "border-rule bg-[rgba(239,238,239,0.92)] backdrop-blur-[8px] backdrop-saturate-[140%]"
          : hasScrolled
            ? "border-transparent bg-[rgba(33,35,38,0.88)] backdrop-blur-[8px]"
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
          className="nav-links hidden list-none items-center gap-5 lg:flex xl:gap-7"
          role="list"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={resolvedHref(link.href)}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-current={isCurrentPage(link.href) ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center whitespace-nowrap text-[14px] transition-colors duration-[var(--transition-duration-fast)]",
                  link.href === "#contact" ? "nav-cta px-5" : "nav-link-underline",
                )}
              >
                {link.label}
                {link.external && <><span aria-hidden className="ml-1.5">↗</span><span className="sr-only"> (opens in a new tab)</span></>}
              </a>
            </li>
          ))}
        </ul>

        <button
          ref={menuButton}
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          className="nav-hamburger flex h-11 w-11 flex-col items-center justify-center gap-[5px] lg:hidden"
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
          id="mobile-navigation"
          className={cn(
            "max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-t lg:hidden",
            dark ? "border-rule-inv bg-bg-ink" : "border-rule bg-bg",
          )}
        >
          <ul className="container-page flex list-none flex-col py-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={resolvedHref(link.href)}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={closeMobile}
                  aria-current={isCurrentPage(link.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center border-b py-3 text-[16px]",
                    dark
                      ? "border-rule-inv text-inv hover:text-inv-hi"
                      : "border-rule text-mute hover:text-ink",
                  )}
                >
                  {link.label}
                  {link.external && <><span aria-hidden className="ml-1.5">↗</span><span className="sr-only"> (opens in a new tab)</span></>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
