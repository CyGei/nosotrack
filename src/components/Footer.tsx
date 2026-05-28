/**
 * Footer — two-band layout ported from main branch legacy/styles.css §17,
 * restructured for clarity:
 *
 *   <footer>                                    ← border-top hairline (separates from prev section)
 *     <div class="container">
 *       ── BAND 1 (brand + nav links) ──
 *       <div class="footer-inner">              ← flex justify-between, 64 px tall band
 *         <div class="footer-brand">SVG + wordmark</div>
 *         <ul class="footer-links">…</ul>
 *       </div>
 *       ── DIVIDER (hairline) ──
 *       <div class="footer-bottom">             ← border-top, then 32 px above copy
 *         <p class="footer-copy">© …</p>
 *         <p class="footer-credit">…</p>
 *       </div>
 *     </div>
 *   </footer>
 *
 * Outer padding is generous (pt-16 / pb-12 = 64 / 48 px) so the top
 * hairline sits well clear of the logo — main's flex-wrap layout
 * compressed too tightly when the credit row was empty.
 */

import { BrandWordmark } from "@/components/BrandWordmark";
import { BrandMark } from "@/components/BrandMark";

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research" },
  { label: "Team", href: "#team" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Contact", href: "#contact" },
  { label: "Pitch", href: "/pitch/" },
  { label: "Privacy", href: "/privacy/" },
  { label: "Terms", href: "/terms/" },
];
const FOOTER_COPY = "2026 Cyril Geismar. All rights reserved";

export function Footer() {
  return (
    <footer className="border-t border-rule-inv bg-bg-ink text-inv-mute">
      <div
        className="container-page"
        style={{ paddingTop: "40px", paddingBottom: "32px" }}
      >
        {/* BAND 1 — brand on the left, link list on the right. */}
        <div className="footer-inner flex flex-wrap items-center justify-between gap-6">
          <div className="footer-brand flex items-center gap-[10px]">
            <span
              aria-hidden
              className="footer-mark inline-flex h-10 w-10 shrink-0 items-center justify-center text-inv-hi"
            >
              <BrandMark className="block h-full w-full" />
            </span>
            <div className="footer-logo text-[16px] leading-none text-inv-hi">
              <BrandWordmark />
            </div>
          </div>

          <ul className="footer-links flex list-none flex-wrap items-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-mono text-[11px] uppercase tracking-[0.16em] text-inv-mute transition-colors duration-[var(--transition-duration-fast)] hover:text-inv-hi"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* DIVIDER + BAND 2 — copyright / credit. The hairline sits 64 px
            below the brand band and 32 px above the copy. */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-rule-inv pt-8">
          <p className="footer-copy font-mono text-[11px] tracking-[0.1em] text-inv-mute">
            © {FOOTER_COPY}
          </p>
        </div>
      </div>
    </footer>
  );
}
