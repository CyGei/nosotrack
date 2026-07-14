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

type TeamPerson = {
  name: string;
  role: string;
  photo: string;
  bio: string;
};

const FOUNDER: TeamPerson = {
  name: "Dr Cyril Geismar",
  role: "Johns Hopkins University",
  photo: "images/cyril.jpg",
  bio: 'Postdoctoral research fellow. PhD in mathematical modelling of infectious diseases at Imperial College London, focused on SARS-CoV-2 outbreak forensics. Executive board member and developer for the <a href="https://www.repidemicsconsortium.org/" target="_blank">R Epidemics Consortium</a>. Teaches outbreak analytics at <a href="https://sismid.sph.emory.edu/online-modules/recon-tools/index.html" target="_blank">Emory University</a> and <a href="https://data.org/our-work/epiverse/training-africa/course/" target="_blank">LSHTM</a>.',
};

const ADVISORS: TeamPerson[] = [
  {
    name: "Dr Anne Cori",
    role: "Imperial College London",
    photo: "images/anne.jpg",
    bio: 'Associate Professor specialising in real-time outbreak analysis and epidemiological parameters. Lead author of <a href="https://academic.oup.com/aje/article/178/9/1505/89262" target="_blank">EpiEstim</a> and co-author of <a href="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003457" target="_blank">outbreaker</a>. Develops statistical methods for outbreak forensics and rapid transmissibility assessment.',
  },
  {
    name: "Dr Thibaut Jombart",
    role: "Imperial College London",
    photo: "images/thibaut.jpg",
    bio: 'Associate Professor specialising in outbreak response analytics, biostatistics, population genetics, and R programming. Lead author of <a href="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003457" target="_blank">outbreaker</a> and founder of the <a href="https://www.repidemicsconsortium.org/" target="_blank">R Epidemics Consortium</a>. Field experience in Ebola deployments in the Democratic Republic of the Congo.',
  },
];

export function Team() {
  return (
    <section
      id="team"
      className="section-pad border-t border-rule bg-bg"
      aria-label="Team"
    >
      <div className="container-page">
        {/* Section heading — matches Research §"Pathogen agnostic…" */}
        <h2 className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
          A team of experts.
        </h2>

        {/* Founder | divider | Advisors */}
        <div className="mt-10 grid grid-cols-1 gap-y-10 md:grid-cols-[1fr_1px_2fr] md:gap-x-12 md:gap-y-0 md:items-start">
          {/* FOUNDER column */}
          <div>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
              Founder
            </p>
            <TeamCard person={FOUNDER} />
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
              Advisors
            </p>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
              {ADVISORS.map((person, i) => (
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
  const src = `/${person.photo}`;
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
          className="team-bio mt-3 text-[17px] leading-[1.55] tracking-[-0.005em] text-mute"
          dangerouslySetInnerHTML={{ __html: person.bio }}
        />
      </div>
    </article>
  );
}
