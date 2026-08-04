import type { ReactNode } from "react";

export type ProblemStat = {
  figure: string;
  phrase: string;
  desc: ReactNode;
};

export function ProblemStats({
  stats,
  thesis,
}: {
  stats: ProblemStat[];
  thesis: { title: string; desc: string };
}) {
  return (
    <div>
      <div className="grid gap-x-10 gap-y-10 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.figure}>
            <div className="font-display text-[clamp(36px,3.6vw,50px)] font-normal leading-[0.95] tracking-[-0.03em] tabular-nums text-ink">
              {s.figure}
            </div>
            <p className="mt-2.5 font-display text-[17px] leading-[1.3] tracking-[-0.01em] text-ink">
              {s.phrase}
            </p>
            <p className="mt-2 text-[15px] leading-[1.55] text-mute">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <p className="font-display text-[clamp(20px,1.9vw,24px)] font-normal leading-[1.3] tracking-[-0.02em] text-ink max-w-[40ch]">
          {thesis.title}
        </p>
        <p className="mt-2.5 text-[15px] leading-[1.55] text-mute max-w-[62ch]">
          {thesis.desc}
        </p>
      </div>
    </div>
  );
}
