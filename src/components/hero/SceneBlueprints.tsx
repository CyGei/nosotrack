"use client";

/**
 * Scene "Blueprints" — three habitats side-by-side, all live.
 *
 * Hospital | Cruise Ship | Farm — each rendered through a `scene`-locked
 * HeroBackdrop instance with its own particle network running. The
 * grid is three equal columns on desktop and stacks vertically on
 * mobile (where space is the bottleneck, not GPU).
 *
 * Faint vertical rules separate the three panes. No labels — the
 * blueprints speak for themselves; explicit captions felt overcooked.
 *
 * GPU/CPU note: each instance runs its own rAF loop with O(N²) edge
 * computation. N is ~50–80 particles per habitat → ~225 nodes total
 * across all three. Modern hardware handles this comfortably; on the
 * iPhone and any reduced-motion users, HeroBackdrop pauses its
 * simulation automatically (see HeroBackdrop's `reduce` handling).
 */

import { HeroBackdrop } from "./HeroBackdrop";

const HABITATS = [
  { id: "hospital" as const },
  { id: "farm"     as const },
  { id: "ship"     as const },
];

export function SceneBlueprints() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--color-bg-ink)]">
      {/* Desktop: 3 equal columns. Mobile: stack vertically. */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3">
        {HABITATS.map((hab, i) => (
          <div
            key={hab.id}
            className="relative isolate overflow-hidden"
            style={{
              // Vertical hairlines between panes — only between, not
              // outside. We use the inner cells' left border so the
              // outermost column has no leading rule.
              borderLeft:
                i > 0
                  ? "1px solid var(--color-rule-inv)"
                  : undefined,
            }}
          >
            {/* The backdrop renders absolute inset-0; we just need to
                give it a positioned ancestor, which this cell is. */}
            <HeroBackdrop scene={hab.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
