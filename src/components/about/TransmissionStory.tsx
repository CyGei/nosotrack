"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";
import styles from "./TransmissionStory.module.css";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Geometry follows the actual chapter heights, including tab and chart changes. */
export function TransmissionStory({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const svg = svgRef.current!;
    const steps = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.step}`));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let paths: { element: SVGPathElement; length: number; start: number; end: number }[] = [];
    let nodes: { element: SVGCircleElement; y: number }[] = [];
    let frame = 0;

    function element<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
      svg.appendChild(el);
      return el;
    }

    function node(x: number, y: number, major = false) {
      if (major) element("circle", { cx: x, cy: y, r: 13, class: styles.halo });
      nodes.push({ element: element("circle", { cx: x, cy: y, r: major ? 5 : 3, class: styles.node }), y });
    }

    function path(d: string) {
      element("path", { d, class: styles.ghost });
      const el = element("path", { d, class: styles.path, pathLength: 1 });
      const length = el.getTotalLength();
      paths.push({ element: el, length, start: el.getPointAtLength(0).y, end: el.getPointAtLength(length).y });
    }

    function update() {
      frame = 0;
      const top = root.getBoundingClientRect().top;
      const front = window.innerHeight * 0.7 - top;
      for (const { element: el, length, start, end } of paths) {
        if (motion.matches || front >= end || front <= start) {
          el.style.strokeDashoffset = motion.matches || front >= end ? "0" : "1";
          continue;
        }
        // All curves run downwards. Locate the scroll frontier along their arc length.
        let low = 0;
        let high = length;
        for (let i = 0; i < 12; i++) {
          const middle = (low + high) / 2;
          if (el.getPointAtLength(middle).y < front) low = middle;
          else high = middle;
        }
        el.style.strokeDashoffset = String(1 - low / length);
      }
      nodes.forEach(({ element: el, y }) => {
        el.dataset.active = String(motion.matches || front >= y);
      });
      steps.forEach((step) => {
        const progress = motion.matches ? 1 : clamp((front - step.offsetTop - 60) / 160);
        step.style.setProperty("--reveal", String(progress));
        step.dataset.active = String(motion.matches || front >= step.offsetTop + 60);
      });
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function measure() {
      svg.replaceChildren();
      paths = [];
      nodes = [];
      const width = root.clientWidth;
      const mobile = width < 768;
      const inset = mobile ? 14 : 30;
      svg.setAttribute("viewBox", `0 0 ${width} ${root.scrollHeight}`);
      let previous = { x: inset, y: 0 };
      steps.forEach((step, index) => {
        const x = mobile ? inset + (index % 2) * 10 : index % 2 === 0 ? inset : width - inset;
        const y = step.offsetTop + 60;
        const bend = y - (mobile ? 95 : 125);
        path(index === 0
          ? `M ${x} 0 L ${x} ${y}`
          : `M ${previous.x} ${previous.y} L ${previous.x} ${bend - 40} C ${previous.x} ${bend + 30}, ${x} ${bend + 30}, ${x} ${y}`);
        if (index > 0) {
          const branchX = mobile ? inset + 17 : width * (index % 2 === 0 ? 0.7 : 0.3);
          const startY = bend - 50;
          const endY = y - (mobile ? 28 : 125);
          path(`M ${previous.x} ${startY} C ${previous.x} ${bend - 40}, ${branchX} ${bend - 40}, ${branchX} ${endY}`);
          node(previous.x, startY);
          node(branchX, endY);
        }
        node(x, y, true);
        previous = { x, y };
      });
      const end = root.scrollHeight - 20;
      path(`M ${previous.x} ${previous.y} L ${previous.x} ${end - 70} C ${previous.x} ${end - 25}, ${inset} ${end - 25}, ${inset} ${end}`);
      node(inset, end);
      update();
    }

    const resize = new ResizeObserver(measure);
    resize.observe(root);
    steps.forEach((step) => resize.observe(step));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    measure();
    root.dataset.ready = "true";
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.story}>
      <svg ref={svgRef} className={styles.tree} aria-hidden="true" />
      {Children.toArray(children).map((child, index) => (
        <div className={styles.step} key={index}>
          <span className={styles.label} aria-hidden="true">0.{index + 1}</span>
          {child}
        </div>
      ))}
    </div>
  );
}
