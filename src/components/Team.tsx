import Image from "next/image";

export type TeamPerson = {
  name: string;
  role: string;
  photo: string;
  bio: string;
  // CSS object-position, tuned per photo so every eye-line lands at the same height.
  focus?: string;
};

export const FOUNDER: TeamPerson = {
  name: "Dr Cyril Geismar",
  role: "Johns Hopkins University",
  photo: "images/cyril.jpg",
  focus: "50% 33%",
  bio: 'Research Fellow in epidemic forecasting at the Johns Hopkins Bloomberg School of Public Health, working with the US CDC Center for Forecasting and Outbreak Analytics. PhD in mathematical modelling of infectious diseases from Imperial College London, specialising in Bayesian reconstruction of transmission chains. Executive board member and developer for the <a href="https://www.repidemicsconsortium.org/" target="_blank">R Epidemics Consortium</a>.'
};

export const ADVISORS: TeamPerson[] = [
  {
    name: "Dr Anne Cori",
    role: "Imperial College London",
    photo: "images/anne.jpg",
    focus: "50% 20%",
    bio: 'Associate Professor specialising in real-time outbreak analysis and epidemiological modelling. Lead author of <a href="https://academic.oup.com/aje/article/178/9/1505/89262" target="_blank">EpiEstim</a>, widely used by public health agencies worldwide to monitor pathogen transmission, and co-author of <a href="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003457" target="_blank">outbreaker</a>. A member of the Imperial College COVID-19 Response Team whose modelling informed the UK government\'s Scientific Advisory Group for Emergencies.'
  },
  {
    name: "Dr Thibaut Jombart",
    role: "Imperial College London",
    photo: "images/thibaut.jpg",
    focus: "50% 80%",
    bio: 'Associate Professor specialising in outbreak response analytics and infectious disease modelling. Lead author of <a href="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003457" target="_blank">outbreaker</a> and founder of the <a href="https://www.repidemicsconsortium.org/" target="_blank">R Epidemics Consortium</a>. A World Health Organization (WHO) consultant and member of its COVID-19 analytics team, and a member of the UK Public Health Rapid Support Team, he has contributed to major field responses including Ebola in the Democratic Republic of the Congo.'
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
        <h2 className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)]">
          A team of experts.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-y-0 md:grid-cols-[1fr_48px_1fr_1fr] md:grid-rows-[auto_auto] md:gap-x-6 md:items-start">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-mute md:col-start-1 md:row-start-1">
            Founder
          </p>
          <div className="mb-10 md:col-start-1 md:row-start-2 md:mb-0">
            <TeamCard person={FOUNDER} />
          </div>

          <div
            aria-hidden
            className="hidden bg-rule md:col-start-2 md:row-start-1 md:row-span-2 md:mx-auto md:block md:h-full md:w-px md:self-stretch"
          />
          <div aria-hidden className="mb-10 block h-px bg-rule md:hidden" />

          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-mute md:col-start-3 md:col-span-2 md:row-start-1">
            Advisors
          </p>
          <div className="mb-10 md:col-start-3 md:row-start-2 md:mb-0">
            <TeamCard person={ADVISORS[0]} />
          </div>
          <div className="md:col-start-4 md:row-start-2">
            <TeamCard person={ADVISORS[1]} />
          </div>
        </div>
      </div>

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
          style={{ objectPosition: person.focus }}
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
          className="team-bio mt-3 text-[17px] leading-[1.55] tracking-[-0.005em] text-mute text-justify hyphens-auto [text-wrap:pretty]"
          dangerouslySetInnerHTML={{ __html: person.bio }}
        />
      </div>
    </article>
  );
}
