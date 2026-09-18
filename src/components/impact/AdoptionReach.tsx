import Image from "next/image";
import { AdoptionGlobe } from "./AdoptionGlobe";
import { FOUNDER, ADVISORS, type TeamPerson } from "@/components/Team";

const POSITION: Record<string, string> = {
  "Dr Cyril Geismar": "Postdoctoral Research Fellow",
  "Dr Anne Cori": "Associate Professor",
  "Dr Thibaut Jombart": "Associate Professor",
};

export function AdoptionReach() {
  return <section className="w-full" aria-label="Adoption and team">
    <div className="grid items-center gap-7 min-[901px]:grid-cols-[minmax(0,4.6fr)_minmax(0,7fr)] min-[901px]:gap-[clamp(28px,4vw,56px)]">
      <div className="grid grid-cols-3 items-start gap-x-3 sm:gap-x-6">
        {[FOUNDER, ...ADVISORS].map(person => <Person key={person.name} person={person} position={POSITION[person.name]} />)}
      </div>
      <AdoptionGlobe />
    </div>
  </section>;
}

function Person({
  person,
  position,
}: {
  person: TeamPerson;
  position: string;
}) {
  return (
    <article>
      <div className="relative aspect-square w-full overflow-hidden bg-bg-tint">
        <Image
          src={`/${person.photo}`}
          alt={person.name}
          width={320}
          height={320}
          className="h-full w-full object-cover grayscale"
          style={{ objectPosition: person.focus }}
        />
      </div>
      <h3 className="mt-3 font-display text-[16px] font-medium leading-tight tracking-[-0.015em] text-ink">
        {person.name}
      </h3>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mute [text-wrap:balance]">
        {position}
      </p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-mute [text-wrap:balance]">
        {person.role}
      </p>
    </article>
  );
}
