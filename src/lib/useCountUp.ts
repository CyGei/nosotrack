"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function useCountUp(
  target: number,
  run: boolean,
  duration = 1700,
  startDelay = 0,
) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setValue(target);
      return;
    }
    let raf = 0;
    const startAt = performance.now() + startDelay;
    const tick = (now: number) => {
      if (now < startAt) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min((now - startAt) / duration, 1);
      setValue(target * easeOutExpo(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, reduce, target, duration, startDelay]);

  return value;
}

export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
