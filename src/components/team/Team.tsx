/**
 * Team — ported from main branch (legacy/styles.css §14 .team-grid).
 *
 * Two-column layout:
 *   ┌────────────────┬┬───────────────────────────────┐
 *   │ FOUNDER         ││ ADVISORS                       │
 *   │ [square photo]  ││ [photo]   [photo]              │
 *   │ Name            ││ Name      Name                 │
 *   │ Role            ││ Role      Role                 │
 *   │ Bio             ││ Bio       Bio                  │
 *   └────────────────┴┴───────────────────────────────┘
 *      1fr        1px       2fr (split into 2 columns)
 *
 * Photos are square, grayscale 100% by default, lifting to 40% on hover.
 * Bios contain anchor tags — rendered via dangerouslySetInnerHTML.
 */

import Image from "next/image";
import { team } from "@/lib/content";
import type { TeamPerson } from "@/types/content";

export function Team() {
  return (
    <section
      id="team"
      className="section-pad border-t border-rule bg-bg"
      aria-label={team.tag}
    >
      <div className="container-page">
        {/* Section tag */}
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">
          {team.tag}
        </p>

        {/* Founder | divider | Advisors */}
        <div className="mt-12 grid grid-cols-1 gap-y-10 md:grid-cols-[1fr_1px_2fr] md:gap-x-12 md:gap-y-0 md:items-start">
          {/* FOUNDER column */}
          <div>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
              Founder
            </p>
            <TeamCard person={team.founder} />
          </div>

          {/* Divider — vertical on md+, horizontal on mobile */}
          <div
            aria-hidden
            className="hidden self-stretch bg-rule md:block"
          />
          <div aria-hidden className="block h-px bg-rule md:hidden" />

          {/* ADVISORS column — 2-up grid inside */}
          <div>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
              {team.advisorsLabel}
            </p>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
              {team.advisors.map((person, i) => (
                <li key={i}>
                  <TeamCard person={person} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bio link styling — bios contain external anchors. */}
      <style>{`
        .team-bio a {
          color: var(--color-ink);
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-thickness: 1px;
          transition: color var(--transition-duration-fast) ease;
        }
        .team-bio a:hover { color: var(--color-text); }
        .team-photo {
          filter: grayscale(100%) contrast(1.02);
          transition: filter var(--transition-duration-base) ease;
        }
        .team-card:hover .team-photo { filter: grayscale(40%) contrast(1.02); }
      `}</style>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function TeamCard({ person }: { person: TeamPerson }) {
  const src = person.photo.startsWith("/") ? person.photo : `/${person.photo}`;
  return (
    <article className="team-card">
      <div className="relative aspect-square w-full overflow-hidden bg-bg-tint">
        <Image
          src={src}
          alt={person.name}
          width={600}
          height={600}
          className="team-photo h-full w-full object-cover"
        />
      </div>
      <div className="pt-4">
        <h3 className="font-display text-[16px] font-medium leading-tight tracking-[-0.015em] text-ink">
          {person.name}
        </h3>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
          {person.role}
        </p>
        <p
          className="team-bio mt-3 text-[14px] leading-[1.7] text-text"
          dangerouslySetInnerHTML={{ __html: person.bio }}
        />
      </div>
    </article>
  );
}
