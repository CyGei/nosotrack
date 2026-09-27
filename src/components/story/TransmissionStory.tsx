"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { TREE_STYLE } from "./treeDesign";
import styles from "./TransmissionStory.module.css";

type Point = { x: number; y: number };
type Edge = {
  element: SVGPathElement;
  start: number;
  end: number;
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function TransmissionStory({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const svg = svgRef.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let edges: Edge[] = [];
    let nodes: { element: SVGGElement; y: number }[] = [];
    let reveals: { element: HTMLElement; y: number }[] = [];
    let frame = 0;
    let layoutFrame = 0;
    let layer: SVGElement = svg;

    function add<K extends keyof SVGElementTagNameMap>(
      tag: K,
      attrs: Record<string, string | number>,
      parent = layer,
    ) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attrs).forEach(([key, value]) =>
        el.setAttribute(key, String(value)),
      );
      parent.appendChild(el);
      return el;
    }

    function edge(d: string, main = false) {
      add("path", { d, class: styles.ghost });
      const element = add("path", {
        d,
        pathLength: 1,
        class: `${styles.edge} ${main ? styles.trunk : ""}`,
      });
      const length = element.getTotalLength();
      const item = {
        element,
        start: element.getPointAtLength(0).y - (main ? 0 : 64),
        end: element.getPointAtLength(length).y,
      };
      edges.push(item);
    }

    // Leave the trunk with one rounded elbow; no intermediate zigzag.
    function offshoot(x: number, point: Point, clearance: number) {
      const endX = point.x - Math.sign(point.x - x) * clearance;
      const direction = Math.sign(endX - x);
      const r = Math.min(TREE_STYLE.corner, Math.abs(endX - x));
      edge(
        `M ${x} ${point.y - r} Q ${x} ${point.y} ${x + direction * r} ${point.y} H ${endX}`,
      );
    }

    function node(point: Point, radius: number, major = false) {
      const group = add("g", {
        transform: `translate(${point.x} ${point.y})`,
        class: major ? styles.major : styles.minor,
      });
      add("circle", { r: radius }, group);
      nodes.push({ element: group, y: point.y });
    }

    function update() {
      frame = 0;
      const front = innerHeight * 0.64 - root.getBoundingClientRect().top;
      edges.forEach((e) => {
        const progress =
          motion.matches || front >= e.end
            ? 1
            : front <= e.start
              ? 0
              : clamp((front - e.start) / (e.end - e.start));
        e.element.style.strokeDashoffset = String(1 - progress);
      });
      const current = nodes.filter((n) => n.y <= front).at(-1);
      nodes.forEach((n) => {
        n.element.dataset.state =
          !motion.matches && n === current
            ? "current"
            : motion.matches || n.y <= front
              ? "past"
              : "future";
      });
      reveals.forEach(({ element, y }) =>
        element.style.setProperty(
          "--story-reveal",
          String(motion.matches ? 1 : clamp((front - y + 30) / 130)),
        ),
      );
    }

    function measure() {
      layoutFrame = 0;
      svg.replaceChildren();
      edges = [];
      nodes = [];
      reveals = [];
      const box = root.getBoundingClientRect();
      const small = box.width < 600;
      const nodeRadius = small ? 7 : TREE_STYLE.radius;
      const titleRadius = small ? TREE_STYLE.radius : TREE_STYLE.largeRadius;
      svg.setAttribute("viewBox", `0 0 ${box.width} ${root.offsetHeight}`);
      // Layout coordinates keep connections stable while content animates into place.
      const bounds = (el: HTMLElement) => {
        let x = 0,
          y = 0;
        for (
          let current: HTMLElement | null = el;
          current && current !== root;
          current = current.offsetParent as HTMLElement | null
        ) {
          x += current.offsetLeft;
          y += current.offsetTop;
        }
        return { x, y, width: el.offsetWidth, height: el.offsetHeight };
      };
      const chapters = Array.from(
        root.querySelectorAll<HTMLElement>("[data-story-chapter]"),
      );
      let previousX: number | undefined;
      chapters.forEach((chapter, index) => {
        const title = chapter.querySelector<HTMLElement>("[data-story-title]")!;
        const rect = bounds(chapter);
        const titleBox = bounds(title);
        const y =
          titleBox.y + parseFloat(getComputedStyle(title).lineHeight) / 2;
        const team = chapter.id === "team";
        const gap = team && !small ? (box.width < 900 ? 48 : 64) : 36;
        let center = small
          ? index % 2 === 0
            ? 22
            : 34
          : chapter.dataset.storySide === "left"
            ? titleBox.x + titleBox.width + gap
            : titleBox.x - gap;
        const branches = Array.from(
          chapter.querySelectorAll<HTMLElement>("[data-story-branch]"),
        );
        if (team && box.width >= 900) {
          const first = bounds(branches[0]);
          center = first.x + first.width + 32;
        } else if (team && !small) {
          center = bounds(branches[0]).x + 14;
        }
        let lastConnection = y;
        layer = add(
          "g",
          {
            class: chapter.classList.contains("on-dark")
              ? styles.dark
              : styles.light,
          },
          svg,
        );
        // Cross between chapters above the next title, never through the copy.
        const fromX = previousX ?? center;
        const turnY = titleBox.y - (small ? 28 : 48);
        const direction = Math.sign(center - fromX);
        const radius = Math.min(
          TREE_STYLE.corner,
          Math.abs(center - fromX) / 2,
        );
        edge(
          direction === 0
            ? `M ${center} ${rect.y} V ${y - (titleRadius + TREE_STYLE.clearance)}`
            : `M ${fromX} ${rect.y} V ${turnY - radius}
           Q ${fromX} ${turnY} ${fromX + direction * radius} ${turnY}
           H ${center - direction * radius}
           Q ${center} ${turnY} ${center} ${turnY + radius} V ${y - (titleRadius + TREE_STYLE.clearance)}`,
          true,
        );
        node({ x: center, y }, titleRadius, true);
        previousX = center;

        if (team && box.width >= 900) {
          const portraits = branches.map((branch) =>
            bounds(branch.querySelector<HTMLElement>("[data-story-anchor]")!),
          );
          const forkY = portraits[0].y - 72;
          const first = portraits[0],
            last = portraits[portraits.length - 1];
          offshoot(
            center,
            { x: first.x + first.width / 2 + TREE_STYLE.corner, y: forkY },
            0,
          );
          offshoot(
            center,
            { x: last.x + last.width / 2 - TREE_STYLE.corner, y: forkY },
            0,
          );
        }

        branches.forEach((branch, branchIndex) => {
          const b = bounds(branch);
          const leaves = Array.from(
            branch.querySelectorAll<HTMLElement>("[data-story-leaf]"),
          );
          const tabs = branch.querySelector('[role="tablist"]');
          const visual = tabs?.nextElementSibling as HTMLElement | null;
          const subtree =
            leaves.length > 1 && !branch.querySelector("form") && !tabs;
          const targets = subtree ? leaves : [visual ?? branch];
          // Each offshoot ends beside actual content, never in the space above it.
          const connection = branch.querySelector<HTMLElement>(
            "[data-story-connect]",
          );
          if (connection) {
            const point = bounds(connection);
            offshoot(center, point, 4);
          } else if (
            branch.dataset.storyBranch !== "quiet" &&
            (branchIndex > 0 || leaves.length > 0)
          ) {
            targets.forEach((target) => {
              const t = bounds(target);
              const anchor = target.querySelector<HTMLElement>(
                "[data-story-anchor]",
              );
              const anchorBox = anchor ? bounds(anchor) : t;
              const anchorOffset = anchor
                ? anchor.dataset.storyAnchor === "center"
                  ? anchorBox.height / 2
                  : parseFloat(getComputedStyle(anchor).lineHeight) / 2
                : 24;
              const peers = team && box.width >= 900;
              const right = team || small || t.x >= center;
              const point = {
                x: peers
                  ? anchorBox.x + anchorBox.width / 2
                  : right
                    ? (team ? anchorBox.x : t.x) - 18
                    : t.x + t.width + 18,
                y: peers ? anchorBox.y - 24 : anchorBox.y + anchorOffset,
              };
              if (peers) {
                const forkY = point.y - 48;
                const direction = Math.sign(point.x - center);
                const r = TREE_STYLE.corner;
                edge(`M ${point.x - direction * r} ${forkY}
                  Q ${point.x} ${forkY} ${point.x} ${forkY + r}
                  V ${point.y - nodeRadius - TREE_STYLE.clearance}`);
              } else {
                offshoot(center, point, nodeRadius + TREE_STYLE.clearance);
              }
              node(point, nodeRadius);
              lastConnection = Math.max(lastConnection, point.y);
            });
          }
          reveals.push({ element: branch, y: b.y });
          leaves.forEach((leaf) =>
            reveals.push({ element: leaf, y: bounds(leaf).y }),
          );
        });
        const bottom =
          index === chapters.length - 1
            ? lastConnection
            : bounds(chapters[index + 1]).y;
        edge(`M ${center} ${y + titleRadius} V ${bottom}`, true);
        // Nodes sit above connections, retaining the product's crisp outlined circles.
        nodes.forEach(({ element }) => {
          if (element.parentNode === layer) layer.appendChild(element);
        });
      });
      update();
      root.dataset.ready = "true";
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const layout = () => {
      if (!layoutFrame) layoutFrame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(layout);
    resize.observe(root);
    root
      .querySelectorAll("[data-story-chapter], [data-story-branch]")
      .forEach((el) => resize.observe(el));
    // Tabs replace subtrees. Ignore animated SVGs and text counters inside the content.
    const mutations = new MutationObserver((records) => {
      if (
        records.some(
          (r) =>
            !svg.contains(r.target) &&
            [...r.addedNodes, ...r.removedNodes].some(
              (n) =>
                n instanceof Element &&
                (n.matches("[data-story-branch], [data-story-leaf]") ||
                  n.querySelector("[data-story-branch], [data-story-leaf]")),
            ),
        )
      )
        layout();
    });
    mutations.observe(root, { childList: true, subtree: true });
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", layout);
    motion.addEventListener("change", schedule);
    measure();
    return () => {
      resize.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(layoutFrame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", layout);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.story}
      style={
        {
          "--tree-edge-width": TREE_STYLE.edge,
          "--tree-strong-width": TREE_STYLE.strongEdge,
          "--tree-outline-width": TREE_STYLE.outline,
        } as CSSProperties
      }
    >
      <svg ref={svgRef} className={styles.tree} aria-hidden="true" />
      {children}
    </div>
  );
}
