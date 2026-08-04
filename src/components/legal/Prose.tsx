import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 text-[15px] leading-[1.7] text-text [&_strong]:font-medium [&_strong]:text-ink">
      {children}
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 font-display text-[18px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink">
      {children}
    </h2>
  );
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="underline underline-offset-[3px] transition-colors hover:text-alert"
    >
      {children}
    </a>
  );
}
