"use client";

/**
 * HeroBackdrop — blueprint + live particle simulation.
 *
 * Two scenes alternate (hospital ↔ cruise ship). Each scene shows the
 * blueprint behind a canvas that draws a population of nodes:
 *
 *   - Each particle belongs to a habitat (room / cabin / dining hall /
 *     corridor) and bounces softly off its walls.
 *   - Contact edges are restricted to SAME or NEIGHBOUR habitats only —
 *     no edges fly across the whole floor. Plus a per-particle cap of
 *     MAX_EDGES_PER_NODE so the graph reads as small chains, not a web.
 *   - Particles come in three shapes (circle / square / triangle) for
 *     population heterogeneity.
 *   - Corridor habitats (those with motion: "corridor-h" | "corridor-v")
 *     get DIRECTIONAL walkers — particles maintain a steady speed along
 *     the long axis, reversing at the short ends. This is what gives the
 *     "live digital twin" feel: nodes pass by room doors, occasionally
 *     transmitting into a room as they pass.
 *
 * Respects prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { HospitalBlueprint } from "./blueprints/Hospital";
import { CruiseShipBlueprint } from "./blueprints/CruiseShip";
import { FarmBlueprint } from "./blueprints/Farm";
import {
  HOSPITAL_HABITATS,
  SHIP_HABITATS,
  FARM_HABITATS,
  FARM_IDS,
  type Habitat,
  type HabitatMotion,
  type HabitatShape,
} from "./blueprints/habitats";

const SCENE_MS = 14_000;
const FADE_MS = 1_200;
const VIEW_W = 1000;
const VIEW_H = 1000;

const CONTACT_R = 36;
const INFECT_R = 26;
const INFECT_P = 0.08;
const MAX_EDGES_PER_NODE = 2;
const SEED_AFTER_MS = 800;
const CROSS_HAB_EVERY_MS = 2200;
const CORRIDOR_SPEED = 0.55; // viewBox units / frame — gentle walking pace

/** Maximum fraction of the population that can ever be infected in a
 *  given scene. Cy locked at 20% on 2026-05-27 — previously the seed
 *  clusters + cross-habitat dynamics could push toward 40–50%, which
 *  read as "everything's on fire." 20% reads as "outbreak in progress,
 *  intervention possible." All three infection paths (initial seed,
 *  cross-habitat timer, edge transmission) honour this cap. */
const MAX_INFECTED_RATIO = 0.2;

/** Initial-seed target for pre-seeded clusters (hospital, farm). We
 *  start at ~12% so the cross-habitat dynamics have headroom to grow
 *  toward the 20% steady state. */
const SEED_CLUSTER_RATIO = 0.12;

type Shape = HabitatShape;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  infected: boolean;
  habitat: Habitat;
  habitatId: string;
  shape: Shape;
  corridor?: HabitatMotion; // copied from habitat for fast tick lookup
};

const COLOR_SUSCEPT = "rgba(220,220,224,0.92)";
const COLOR_INFECT = "rgba(255,7,58,0.98)";
const COLOR_EDGE = "rgba(239,238,239,0.22)";
const COLOR_EDGE_HOT = "rgba(255,7,58,0.78)";

export type SceneId = "hospital" | "ship" | "farm";
const SCENES: SceneId[] = ["hospital", "ship", "farm"];

export type HeroBackdropProps = {
  /** If provided, pin the backdrop to a single scene and disable the
   *  hospital→ship→farm rotation. Used by hero-v2's blueprints frame,
   *  which renders three locked instances side-by-side. */
  lockedScene?: SceneId;
};

const HABITATS_BY_SCENE: Record<SceneId, Habitat[]> = {
  hospital: HOSPITAL_HABITATS,
  ship: SHIP_HABITATS,
  farm: FARM_HABITATS,
};

export function HeroBackdrop({ lockedScene }: HeroBackdropProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const neighbourSetRef = useRef<Map<string, Set<string>>>(new Map());
  const [scene, setScene] = useState<SceneId>(lockedScene ?? "hospital");
  const reduce = useReducedMotion();

  // If the caller pinned us to a single scene, keep state in sync if
  // they ever change it (shouldn't happen in our usage, but cheap to
  // support) and skip the cycling timer entirely.
  useEffect(() => {
    if (lockedScene) setScene(lockedScene);
  }, [lockedScene]);

  useEffect(() => {
    if (reduce || lockedScene) return;
    const id = setInterval(() => {
      setScene((s) => SCENES[(SCENES.indexOf(s) + 1) % SCENES.length]);
    }, SCENE_MS);
    return () => clearInterval(id);
  }, [reduce, lockedScene]);

  // Build particle population + neighbour lookup when scene changes.
  useEffect(() => {
    const habitats = HABITATS_BY_SCENE[scene];
    const neighSet = new Map<string, Set<string>>();
    for (const h of habitats) {
      neighSet.set(h.id, new Set([h.id, ...h.neighbours]));
    }
    neighbourSetRef.current = neighSet;
    const ps = makeParticles(habitats);

    // Pre-seed a visible outbreak cluster so every scene opens on a
    // recognisable hotspot rather than a vague single dot.
    if (scene === "hospital") {
      seedHospitalCluster(ps);
    } else if (scene === "farm") {
      seedFarmCluster(ps);
    }

    particlesRef.current = ps;
  }, [scene]);

  // Seed initial infection + recurring cross-habitat jumps (to neighbours).
  useEffect(() => {
    if (reduce) return;
    const seedTimer = setTimeout(() => {
      const ps = particlesRef.current;
      if (ps.length === 0) return;
      // If the scene was pre-seeded (e.g. hospital cluster), skip the
      // random initial infection so we don't double-seed.
      if (ps.some((p) => p.infected)) return;
      const roomSeeds = ps.filter((p) => !p.corridor);
      const pool = roomSeeds.length ? roomSeeds : ps;
      pool[Math.floor(Math.random() * pool.length)].infected = true;
    }, SEED_AFTER_MS);

    const crossTimer = setInterval(() => {
      const ps = particlesRef.current;
      const infected = ps.filter((p) => p.infected);
      if (infected.length === 0) return;
      // Hard cap — stop jumping once we hit the steady-state ceiling.
      if (infected.length >= ps.length * MAX_INFECTED_RATIO) return;
      const a = infected[Math.floor(Math.random() * infected.length)];
      const targetIds = a.habitat.neighbours;
      if (targetIds.length === 0) return;
      const targetHabId = targetIds[Math.floor(Math.random() * targetIds.length)];
      const susceptInTarget = ps.filter(
        (p) => !p.infected && p.habitatId === targetHabId,
      );
      if (susceptInTarget.length > 0) {
        const t = susceptInTarget[Math.floor(Math.random() * susceptInTarget.length)];
        t.infected = true;
      }
    }, CROSS_HAB_EVERY_MS);

    return () => {
      clearTimeout(seedTimer);
      clearInterval(crossTimer);
    };
  }, [scene, reduce]);

  // Render loop.
  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const tick = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const scale = Math.min(w / VIEW_W, h / VIEW_H);
      const offsetX = (w - VIEW_W * scale) / 2;
      const offsetY = (h - VIEW_H * scale) / 2;

      ctx.clearRect(0, 0, w, h);
      const ps = particlesRef.current;
      const neighSet = neighbourSetRef.current;

      // ── Update positions ──
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;

        const m = 2;
        const minX = p.habitat.x + m;
        const maxX = p.habitat.x + p.habitat.w - m;
        const minY = p.habitat.y + m;
        const maxY = p.habitat.y + p.habitat.h - m;

        if (p.corridor === "corridor-h") {
          // Walker — steady left/right travel, almost no vertical drift.
          p.vy *= 0.82;
          p.vy += (Math.random() - 0.5) * 0.02;
          // Reseed forward speed if damping slowed it
          const sign = p.vx >= 0 ? 1 : -1;
          if (Math.abs(p.vx) < CORRIDOR_SPEED * 0.6) {
            p.vx = sign * CORRIDOR_SPEED;
          }
          // Hard reverse at corridor ends so they walk back
          if (p.x < minX) { p.x = minX; p.vx = CORRIDOR_SPEED; }
          if (p.x > maxX) { p.x = maxX; p.vx = -CORRIDOR_SPEED; }
          if (p.y < minY) { p.y = minY; p.vy = 0; }
          if (p.y > maxY) { p.y = maxY; p.vy = 0; }
        } else if (p.corridor === "corridor-v") {
          // Vertical walker
          p.vx *= 0.82;
          p.vx += (Math.random() - 0.5) * 0.02;
          const sign = p.vy >= 0 ? 1 : -1;
          if (Math.abs(p.vy) < CORRIDOR_SPEED * 0.6) {
            p.vy = sign * CORRIDOR_SPEED;
          }
          if (p.y < minY) { p.y = minY; p.vy = CORRIDOR_SPEED; }
          if (p.y > maxY) { p.y = maxY; p.vy = -CORRIDOR_SPEED; }
          if (p.x < minX) { p.x = minX; p.vx = 0; }
          if (p.x > maxX) { p.x = maxX; p.vx = 0; }
        } else {
          // Room particle — gentle Brownian drift bounded to habitat.
          const jitter = p.infected ? 0.10 : 0.045;
          p.vx += (Math.random() - 0.5) * jitter;
          p.vy += (Math.random() - 0.5) * jitter;
          const damp = p.infected ? 0.985 : 0.97;
          p.vx *= damp;
          p.vy *= damp;
          if (p.x < minX) { p.x = minX; p.vx = Math.abs(p.vx) * 0.6; }
          if (p.x > maxX) { p.x = maxX; p.vx = -Math.abs(p.vx) * 0.6; }
          if (p.y < minY) { p.y = minY; p.vy = Math.abs(p.vy) * 0.6; }
          if (p.y > maxY) { p.y = maxY; p.vy = -Math.abs(p.vy) * 0.6; }
        }
      }

      // ── Compute edges (nearest-K, restricted to same/neighbour habitat) ──
      const drawn = new Set<string>();
      type Pair = { i: number; j: number; d: number; hot: boolean };
      const pairs: Pair[] = [];

      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        const okSet = neighSet.get(a.habitatId);
        if (!okSet) continue;
        const local: Pair[] = [];
        for (let j = 0; j < ps.length; j++) {
          if (i === j) continue;
          const b = ps[j];
          if (!okSet.has(b.habitatId)) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < CONTACT_R) {
            const eitherInfected = a.infected || b.infected;
            local.push({ i, j, d, hot: eitherInfected && d < INFECT_R });
          }
        }
        local.sort((p, q) => p.d - q.d);
        for (const pair of local.slice(0, MAX_EDGES_PER_NODE)) {
          const key = pair.i < pair.j ? `${pair.i}-${pair.j}` : `${pair.j}-${pair.i}`;
          if (drawn.has(key)) continue;
          drawn.add(key);
          pairs.push(pair);
        }
      }

      // ── Draw edges + handle transmission ──
      // Track infected count for this frame so the 20% cap is honoured
      // by edge transmission too. We count once up front and increment
      // locally on each new infection — cheap and avoids an O(N) scan
      // per transmission event.
      const infectionCap = ps.length * MAX_INFECTED_RATIO;
      let infectedNow = 0;
      for (const p of ps) if (p.infected) infectedNow++;

      for (const { i, j, d, hot } of pairs) {
        const a = ps[i];
        const b = ps[j];
        const proximity = 1 - d / CONTACT_R;
        const eitherInfected = a.infected || b.infected;
        const bothInfected = a.infected && b.infected;

        ctx.strokeStyle = eitherInfected ? COLOR_EDGE_HOT : COLOR_EDGE;
        ctx.lineWidth = bothInfected ? 1.4 : eitherInfected ? 1.1 : 0.75;
        ctx.globalAlpha = eitherInfected
          ? Math.max(0.8, proximity)
          : Math.max(0.45, proximity);
        ctx.beginPath();
        ctx.moveTo(offsetX + a.x * scale, offsetY + a.y * scale);
        ctx.lineTo(offsetX + b.x * scale, offsetY + b.y * scale);
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (
          hot &&
          a.infected !== b.infected &&
          Math.random() < INFECT_P &&
          infectedNow < infectionCap
        ) {
          a.infected = true;
          b.infected = true;
          infectedNow++;
        }
      }

      // ── Draw particles (with shape variety) ──
      const now = performance.now();
      for (const p of ps) {
        const cx = offsetX + p.x * scale;
        const cy = offsetY + p.y * scale;
        const r = p.infected ? 4.4 : 3.6;
        ctx.fillStyle = p.infected ? COLOR_INFECT : COLOR_SUSCEPT;
        drawShape(ctx, p.shape, cx, cy, r);
        if (p.infected) {
          ctx.strokeStyle = "rgba(255,7,58,0.32)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, 8 + Math.sin(now / 380) * 1.6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [reduce]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 transition-opacity ease-[var(--ease-nt)]"
        style={{
          opacity: scene === "hospital" ? 1 : 0,
          transitionDuration: `${FADE_MS}ms`,
        }}
      >
        <HospitalBlueprint className="h-full w-full" />
      </div>
      <div
        className="absolute inset-0 transition-opacity ease-[var(--ease-nt)]"
        style={{
          opacity: scene === "ship" ? 1 : 0,
          transitionDuration: `${FADE_MS}ms`,
        }}
      >
        <CruiseShipBlueprint className="h-full w-full" />
      </div>
      <div
        className="absolute inset-0 transition-opacity ease-[var(--ease-nt)]"
        style={{
          opacity: scene === "farm" ? 1 : 0,
          transitionDuration: `${FADE_MS}ms`,
        }}
      >
        <FarmBlueprint className="h-full w-full" />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}

/* ─────────────────────  helpers  ───────────────────── */

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath();
  if (shape === "circle") {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (shape === "square") {
    const s = r * 1.75;
    ctx.rect(cx - s / 2, cy - s / 2, s, s);
  } else {
    const h = r * 1.95;
    ctx.moveTo(cx, cy - h * 0.6);
    ctx.lineTo(cx + h * 0.58, cy + h * 0.4);
    ctx.lineTo(cx - h * 0.58, cy + h * 0.4);
    ctx.closePath();
  }
  ctx.fill();
}

function pickShape(seed: number): Shape {
  const m = seed % 4;
  if (m === 0) return "square";
  if (m === 1) return "triangle";
  return "circle";
}

/**
 * Pre-seed a small but visible outbreak cluster in the hospital scene.
 * Strategy:
 *   - Fill priority rooms (S3 first — densest centre of the cluster —
 *     then S2 to its left, S4 to its right) until ~SEED_CLUSTER_RATIO
 *     of the population is infected.
 *   - Always infect the E-W corridor walker nearest the cluster — they
 *     carried it through the corridor. Counts toward the budget.
 *
 * Cap of SEED_CLUSTER_RATIO (12%) keeps the opening composition under
 * the global 20% ceiling so the cross-habitat dynamics can still grow.
 */
function seedHospitalCluster(ps: Particle[]) {
  const budget = Math.max(2, Math.floor(ps.length * SEED_CLUSTER_RATIO));
  const ROOM_ORDER = ["hosp-S3", "hosp-S2", "hosp-S4"];
  let count = 0;

  // Always seed the corridor walker first — they're the index case who
  // ferried the pathogen along the corridor. Always counts.
  const walkers = ps.filter((p) => p.habitatId === "hosp-corr-EW");
  if (walkers.length > 0) {
    const targetX = 444;
    let nearest = walkers[0];
    let best = Math.abs(nearest.x - targetX);
    for (const w of walkers) {
      const d = Math.abs(w.x - targetX);
      if (d < best) {
        nearest = w;
        best = d;
      }
    }
    nearest.infected = true;
    count++;
  }

  // Fill the priority rooms in order until we exhaust the budget.
  for (const roomId of ROOM_ORDER) {
    if (count >= budget) break;
    for (const p of ps) {
      if (count >= budget) break;
      if (p.habitatId === roomId && !p.infected) {
        p.infected = true;
        count++;
      }
    }
  }
}

function makeParticles(habitats: Habitat[]): Particle[] {
  const out: Particle[] = [];
  let seed = 0;
  for (const hab of habitats) {
    const isCorrH = hab.motion === "corridor-h";
    const isCorrV = hab.motion === "corridor-v";
    for (let i = 0; i < hab.count; i++) {
      // Initial position — spread along the long axis for corridors so
      // walkers aren't all bunched up at one end.
      const x = isCorrH
        ? hab.x + (i + 0.5) * (hab.w / hab.count)
        : hab.x + Math.random() * hab.w;
      const y = isCorrV
        ? hab.y + (i + 0.5) * (hab.h / hab.count)
        : hab.y + Math.random() * hab.h;
      // Initial velocity — walkers get a strong push along their axis;
      // every other walker starts heading the opposite way so they pass.
      const dir = i % 2 === 0 ? 1 : -1;
      const vx = isCorrH ? dir * CORRIDOR_SPEED : (Math.random() - 0.5) * 0.35;
      const vy = isCorrV ? dir * CORRIDOR_SPEED : (Math.random() - 0.5) * 0.35;
      // Shape: respect habitat-level override (e.g. farm staff are
      // always triangles); otherwise fall back to the rotating pool.
      const shape: Shape = hab.forceShape ?? pickShape(seed++);
      out.push({
        x,
        y,
        vx,
        vy,
        infected: false,
        habitat: hab,
        habitatId: hab.id,
        shape,
        corridor: hab.motion,
      });
    }
  }
  return out;
}

/**
 * Pre-seed a small outbreak in the dairy scene.
 * Strategy:
 *   - Always seed the staff walker nearest the holding pen (index case
 *     ferrying between paddock and barn).
 *   - Fill the holding pen first, then the parlor, until
 *     SEED_CLUSTER_RATIO of the population is infected.
 *
 * Cap of SEED_CLUSTER_RATIO (12%) keeps the opening under the global
 * 20% ceiling.
 */
function seedFarmCluster(ps: Particle[]) {
  const budget = Math.max(2, Math.floor(ps.length * SEED_CLUSTER_RATIO));
  const ROOM_ORDER: string[] = [FARM_IDS.HOLDING, FARM_IDS.PARLOR];
  let count = 0;

  // Always seed the staff walker first.
  const staff = ps.filter((p) => p.habitatId === FARM_IDS.ALLEY);
  if (staff.length > 0) {
    const targetX = 640;
    let nearest = staff[0];
    let best = Math.abs(nearest.x - targetX);
    for (const s of staff) {
      const d = Math.abs(s.x - targetX);
      if (d < best) {
        nearest = s;
        best = d;
      }
    }
    nearest.infected = true;
    count++;
  }

  for (const roomId of ROOM_ORDER) {
    if (count >= budget) break;
    for (const p of ps) {
      if (count >= budget) break;
      if (p.habitatId === roomId && !p.infected) {
        p.infected = true;
        count++;
      }
    }
  }
}
