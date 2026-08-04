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
const FOOTER_COPY = "2025 Cyril Geismar. All rights reserved";

export function Footer() {
  return (
    <footer className="border-t border-rule-inv bg-bg-ink text-inv-mute">
      <div
        className="container-page"
        style={{ paddingTop: "40px", paddingBottom: "32px" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="footer-brand flex items-center gap-[10px]">
            <span
              aria-hidden
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-inv-hi"
            >
              <BrandMark className="block h-full w-full" />
            </span>
            <div className="text-[16px] leading-none text-inv-hi">
              <BrandWordmark />
            </div>
          </div>

          <ul className="flex list-none flex-wrap items-center gap-6">
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

        <div className="mt-16 border-t border-rule-inv pt-8">
          <p className="font-mono text-[11px] tracking-[0.1em] text-inv-mute">
            © {FOOTER_COPY}
          </p>
        </div>
      </div>
    </footer>
  );
}
