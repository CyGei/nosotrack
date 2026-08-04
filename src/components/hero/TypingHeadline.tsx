"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

export type TypingHeadlineProps = {
  lines: string[];
  active: boolean;
  forceImmediate?: boolean;
  charDelayMs?: number;
  lineDelayMs?: number;
  className?: string;
  haloLastLine?: boolean;
  /** Reveal every line's first letter first, hold, then type the rest. */
  initialsFirst?: boolean;
  initialStaggerMs?: number;
  initialHoldMs?: number;
};

export function TypingHeadline({
  lines,
  active,
  forceImmediate = false,
  charDelayMs = 26,
  lineDelayMs = 140,
  className = "",
  haloLastLine = false,
  initialsFirst = false,
  initialStaggerMs = 200,
  initialHoldMs = 550,
}: TypingHeadlineProps) {
  const [typed, setTyped] = useState(0);
  const [byLine, setByLine] = useState<number[]>(() => lines.map(() => 0));
  const reduce = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalChars = lines.reduce((acc, line) => acc + line.length, 0);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!active) {
      setTyped(0);
      setByLine(lines.map(() => 0));
      return;
    }

    if (forceImmediate || reduce) {
      setTyped(totalChars);
      setByLine(lines.map((line) => line.length));
      return;
    }

    if (initialsFirst) {
      const steps: { line: number; count: number; delay: number }[] = [];
      lines.forEach((line, i) => {
        if (line.length === 0) return;
        steps.push({
          line: i,
          count: 1,
          delay: i === 0 ? charDelayMs : initialStaggerMs,
        });
      });
      let holdDone = false;
      lines.forEach((line, i) => {
        for (let c = 2; c <= line.length; c++) {
          let delay = charDelayMs;
          if (c === 2) {
            if (!holdDone) {
              delay = initialHoldMs;
              holdDone = true;
            } else {
              delay = lineDelayMs;
            }
          }
          steps.push({ line: i, count: c, delay });
        }
      });

      setByLine(lines.map(() => 0));
      let idx = 0;
      const run = () => {
        const s = steps[idx];
        setByLine((prev) => {
          const arr = prev.slice();
          arr[s.line] = s.count;
          return arr;
        });
        idx += 1;
        if (idx < steps.length) {
          timerRef.current = setTimeout(run, steps[idx].delay);
        }
      };
      if (steps.length) timerRef.current = setTimeout(run, steps[0].delay);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    setTyped(0);
    let next = 0;

    const step = () => {
      next += 1;
      setTyped(next);
      if (next >= totalChars) return;
      let chars = 0;
      let isLineStart = false;
      for (let i = 0; i < lines.length; i++) {
        chars += lines[i].length;
        if (next === chars && i < lines.length - 1) {
          isLineStart = true;
          break;
        }
      }
      const delay = isLineStart ? lineDelayMs : charDelayMs;
      timerRef.current = setTimeout(step, delay);
    };

    timerRef.current = setTimeout(step, charDelayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    active,
    forceImmediate,
    reduce,
    lines,
    totalChars,
    charDelayMs,
    lineDelayMs,
    initialsFirst,
    initialStaggerMs,
    initialHoldMs,
  ]);

  let rendered: string[];
  if (initialsFirst) {
    rendered = lines.map((line, i) => line.slice(0, byLine[i] ?? 0));
  } else {
    let remaining = typed;
    rendered = lines.map((line) => {
      if (remaining <= 0) return "";
      if (remaining >= line.length) {
        remaining -= line.length;
        return line;
      }
      const slice = line.slice(0, remaining);
      remaining = 0;
      return slice;
    });
  }

  return (
    <h1 className={className}>
      {rendered.map((line, i) => {
        const isFinalLine = i === lines.length - 1;
        const haloClass = haloLastLine && isFinalLine ? "block hero-accent" : "block";
        return (
          <span key={i} className={haloClass}>
            {line || " "}
          </span>
        );
      })}
    </h1>
  );
}
