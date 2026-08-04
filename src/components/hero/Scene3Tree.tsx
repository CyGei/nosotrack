"use client";

import { useDrawProgress } from "@/lib/hooks";
import { TreeStage, TreeStageDefs } from "./TreeStage";

const DRAW_DURATION_MS = 2_500;

export type Scene3TreeProps = {
  active: boolean;
};

export function Scene3Tree({ active }: Scene3TreeProps) {
  const p = useDrawProgress(active, DRAW_DURATION_MS);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--color-bg-ink)]">
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full text-alert"
        aria-hidden
      >
        <TreeStageDefs />
        <TreeStage progress={p} />
      </svg>
    </div>
  );
}
