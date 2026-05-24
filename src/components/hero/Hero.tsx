/**
 * Hero — DESIGN_BRIEF §7.2 (rev. 5).
 *
 * Two-column dark canvas.
 *   - LEFT: headline + subtitle, vertically centred in the column so it
 *     sits in the visual middle of the hero (not under the nav, not at
 *     the foot of the page).
 *   - RIGHT: defence-tech blueprint with live particle network.
 *
 * The headline never overlaps the blueprint — they live in separate
 * columns. Mobile collapses to a stacked layout with the blueprint
 * below the headline.
 */

import { hero } from "@/lib/content";
import { HeroBackdrop } from "./HeroBackdrop";

export function Hero() {
  return (
    <section
      id="hero"
      className="on-dark relative isolate min-h-[100svh] overflow-hidden"
    >
      <div className="container-page relative z-10 grid min-h-[100svh] grid-cols-12 gap-6 pb-16 pt-32 md:pb-20 md:pt-28">
        {/* LEFT — headline, vertically centred */}
        <div className="col-span-12 flex flex-col justify-center md:col-span-7 lg:col-span-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-inv-hi">
            {hero.eyebrow}
          </p>

          {/* Hero title — JetBrains Mono per main branch legacy/styles.css §8.
              "Protect." picks up the breathing cream halo via .hero-accent. */}
          <h1 className="mt-12 font-mono font-normal leading-[1.02] tracking-[-0.025em] text-inv-hi text-[clamp(2.6rem,7vw,6.4rem)] max-w-[20ch]">
            {hero.title.map((line, i) => {
              const isLast = i === hero.title.length - 1;
              return (
                <span key={i} className={isLast ? "block hero-accent" : "block"}>
                  {line}
                </span>
              );
            })}
          </h1>

          <p className="mt-14 max-w-[680px] text-[17px] leading-[1.6] tracking-[-0.005em] text-inv">
            {hero.subtitle}
          </p>
        </div>

        {/* RIGHT — blueprint, square-ish so the whole drawing reads */}
        <div className="col-span-12 md:col-span-5 lg:col-span-6 relative">
          <div className="relative mx-auto aspect-square h-auto w-full max-w-[680px] md:absolute md:inset-0 md:h-full md:max-w-none md:aspect-auto">
            <HeroBackdrop />
          </div>
        </div>
      </div>
    </section>
  );
}
