"use client";

// Each HeroBackdrop runs its own rAF loop with O(N²) edge computation
// (~225 particles across the three panes).

import { HeroBackdrop } from "./HeroBackdrop";

const HABITATS = [
  { id: "hospital" as const },
  { id: "farm"     as const },
  { id: "ship"     as const },
];

export function SceneBlueprints() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--color-bg-ink)]">
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3">
        {HABITATS.map((hab, i) => (
          <div
            key={hab.id}
            className="relative isolate overflow-hidden"
            style={{
              borderLeft:
                i > 0
                  ? "1px solid var(--color-rule-inv)"
                  : undefined,
            }}
          >
            <HeroBackdrop scene={hab.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
