"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { TREE_STYLE, TREE_TARGET } from "../story/treeDesign";
import story from "../story/TransmissionStory.module.css";
import styles from "./Hero.module.css";

type Point = { x: number; y: number };
type Edge = { element: SVGPathElement; start: number; end: number };
type Node = { element: SVGGElement; y: number };
const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function IntroTree({ rootRef }: { rootRef: RefObject<HTMLElement> }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const svg = svgRef.current!;
    const period = root.querySelector<HTMLElement>("[data-intro-period]")!;
    const opening = root.querySelector<HTMLElement>("[data-intro-opening]")!;
    const reconstruct = root.querySelector<HTMLElement>("[data-intro-reconstruct]")!;
    const branches = root.querySelector<HTMLElement>("[data-intro-branches]")!;
    const stop = root.querySelector<HTMLElement>("[data-intro-stop]")!;
    const connection = root.querySelector<HTMLElement>("[data-hero-connection]")!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let edges: Edge[] = [];
    let nodes: Node[] = [];
    let network: SVGGElement;
    let dot: SVGCircleElement;
    let target: SVGGElement;
    let targetCorners: { element: SVGPathElement; x: number; y: number }[] = [];
    let potential: SVGGElement;
    let initialRadius = 0;
    let dotOrigin: Point = { x: 0, y: 0 };
    let nodeRadius: number = TREE_STYLE.radius;
    let spineRadius: number = TREE_STYLE.largeRadius;
    let targetY = 0;
    let frame = 0;
    let layoutFrame = 0;
    let disposed = false;

    function add<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: SVGElement = network) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, String(value)));
      parent.appendChild(el);
      return el;
    }

    function edge(d: string, main = false) {
      // Share the content spine's line weights, outlines and colours.
      add("path", { d, class: story.ghost });
      const element = add("path", { d, pathLength: 1, "data-intro-edge": "", class: `${story.edge} ${main ? story.trunk : ""}` });
      const length = element.getTotalLength();
      const start = element.getPointAtLength(0).y;
      const end = Math.max(start + 40, element.getPointAtLength(length).y);
      edges.push({ element, start, end });
    }

    function node(point: Point, major = false) {
      const element = add("g", { transform: `translate(${point.x} ${point.y})`, class: major ? story.major : story.minor });
      add("circle", { r: major ? spineRadius : nodeRadius }, element);
      nodes.push({ element, y: point.y });
    }

    // The same seven-pixel rounded elbows as the site's main spine.
    function route(a: Point, b: Point, turnY: number, main = false, clearance = nodeRadius + TREE_STYLE.clearance) {
      const direction = Math.sign(b.x - a.x);
      const r = Math.min(TREE_STYLE.corner, Math.abs(b.x - a.x) / 2);
      edge(direction === 0
        ? `M ${a.x} ${a.y} V ${b.y - clearance}`
        : `M ${a.x} ${a.y} V ${turnY - r} Q ${a.x} ${turnY} ${a.x + direction * r} ${turnY} H ${b.x - direction * r} Q ${b.x} ${turnY} ${b.x} ${turnY + r} V ${b.y - clearance}`, main);
    }

    // Each parent gets one stem and a distinct fork. Siblings share a generation,
    // with no crossing connections or doubled strokes on the parent stem.
    function fork(parent: Point, children: Point[], splitY: number, mainChild = -1, parentRadius = nodeRadius) {
      const r = TREE_STYLE.corner;
      edge(`M ${parent.x} ${parent.y + parentRadius} V ${splitY - r}`, mainChild >= 0);
      children.forEach((child, index) => {
        const direction = Math.sign(child.x - parent.x);
        edge(direction === 0
          ? `M ${parent.x} ${splitY - r} V ${child.y - nodeRadius - TREE_STYLE.clearance}`
          : `M ${parent.x} ${splitY - r} Q ${parent.x} ${splitY} ${parent.x + direction * r} ${splitY}
             H ${child.x - direction * r} Q ${child.x} ${splitY} ${child.x} ${splitY + r}
             V ${child.y - nodeRadius - TREE_STYLE.clearance}`, index === mainChild);
      });
    }

    function update() {
      frame = 0;
      const top = root.getBoundingClientRect().top;
      const scrolled = Math.max(0, -top);
      const front = innerHeight * 0.64 - top;
      // Hide even the faint guide paths at rest; the punctuation is the only mark.
      network.style.opacity = String(motion.matches ? Number(scrolled > 0) : clamp((scrolled - 72) / 32));
      edges.forEach(({ element, start, end }) => {
        const progress = motion.matches ? 1 : clamp((front - start) / (end - start));
        element.style.strokeDashoffset = String(1 - progress);
      });
      const current = nodes.filter(n => n.y <= front).at(-1);
      nodes.forEach(n => {
        n.element.dataset.state = motion.matches || n.y <= front ? (n === current ? "current" : "past") : "future";
      });
      const grow = motion.matches ? Number(scrolled > 0) : clamp(scrolled / 72);
      // Grow outward from the punctuation's upper-left corner so the larger
      // circle clears the final letter instead of growing over it.
      const expansion = (spineRadius - initialRadius) * grow;
      dot.setAttribute("cx", String(dotOrigin.x + expansion));
      dot.setAttribute("cy", String(dotOrigin.y + expansion));
      dot.setAttribute("r", String(initialRadius + (spineRadius - initialRadius) * grow));
      dot.setAttribute("stroke-width", String(TREE_STYLE.outline * grow));
      // Let visitors see the threatened onward cases before the intervention.
      const containment = motion.matches ? 1 : clamp((front - targetY - 50) / 120);
      const eased = containment * containment * (3 - 2 * containment);
      target.style.opacity = String(TREE_TARGET.opacity * (motion.matches ? 1 : clamp((front - targetY + 24) / 24)));
      targetCorners.forEach(({ element, x, y }) => {
        const travel = 8 * (1 - eased);
        element.setAttribute("transform", `translate(${x * travel} ${y * travel})`);
      });
      // Possible future transmission disappears; established cases stay visible.
      const reveal = clamp((front - targetY + 40) / 40);
      potential.style.opacity = String(motion.matches ? 0 : 0.55 * reveal * (1 - eased));
    }

    function measure() {
      layoutFrame = 0;
      if (disposed) return;
      svg.replaceChildren();
      network = add("g", { "data-intro-network": "" }, svg);
      edges = [];
      nodes = [];
      const box = root.getBoundingClientRect();
      const small = box.width < 900;
      nodeRadius = small ? 7 : TREE_STYLE.radius;
      spineRadius = small ? TREE_STYLE.radius : TREE_STYLE.largeRadius;
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      const bounds = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.left - box.left, y: rect.top - box.top, width: rect.width, height: rect.height };
      };
      const punctuation = bounds(period);
      const origin = { x: punctuation.x + punctuation.width / 2, y: punctuation.y + punctuation.height / 2 };
      dotOrigin = origin;
      initialRadius = punctuation.width / 2;
      const expandedOrigin = { x: origin.x + spineRadius - initialRadius, y: origin.y + spineRadius - initialRadius };
      const heading = bounds(reconstruct);
      const closing = bounds(stop);
      const closingLineHeight = parseFloat(getComputedStyle(stop).lineHeight);
      const treeBox = bounds(branches);
      const entry = bounds(connection);
      const trunkX = entry.x + entry.width / 2;
      const first = { x: trunkX, y: heading.y + parseFloat(getComputedStyle(reconstruct).lineHeight) / 2 };
      const rowY = treeBox.y + treeBox.height * 0.30;
      const leafY = treeBox.y + treeBox.height * 0.72;
      const leftX = small ? 32 : trunkX - Math.min(300, box.width * 0.23);
      const rightX = small ? box.width - 32 : trunkX + Math.min(400, box.width * 0.30);
      const leaves = Array.from({ length: 5 }, (_, i) => ({ x: leftX + (rightX - leftX) * i / 4, y: leafY }));
      // Contain an existing second-generation case, not an extra generation.
      const risk = leaves[1];
      targetY = risk.y;
      const left = { x: (leaves[0].x + leaves[1].x) / 2, y: rowY };
      const right = { x: leaves[3].x, y: rowY };

      route({ x: expandedOrigin.x, y: expandedOrigin.y + spineRadius }, first, opening.offsetHeight - 28, true, spineRadius + TREE_STYLE.clearance);
      fork(first, [left, right], treeBox.y + 28, 0, spineRadius);
      fork(left, leaves.slice(0, 2), rowY + 36, 1);
      fork(right, leaves.slice(2), rowY + 36);
      // Show two possible onward cases in the existing tree's visual language.
      // Use the same shared stem and mirrored rounded forks as established cases.
      const frameRadius = nodeRadius + TREE_TARGET.clearance;
      potential = add("g", { "data-intro-potential": "", stroke: "var(--tree-ink)", "stroke-width": TREE_STYLE.edge, fill: "none" });
      // Align the desktop endpoints with the closing statement's second line.
      // Mobile keeps the branch above the copy, where they share horizontal space.
      const futureY = small
        ? risk.y + 68
        : Math.max(risk.y + 84, closing.y + Math.min(closing.height - closingLineHeight / 2, closingLineHeight * 1.5));
      const splitY = risk.y + Math.max(34, (futureY - risk.y) * 0.42);
      const spread = small ? 28 : 48;
      const futureXs = [risk.x - spread, risk.x + spread];
      const r = TREE_STYLE.corner;
      add("path", { d: `M ${risk.x} ${risk.y + nodeRadius} V ${splitY - r}` }, potential);
      futureXs.forEach(x => {
        const direction = Math.sign(x - risk.x);
        add("path", { d: `M ${risk.x} ${splitY - r} Q ${risk.x} ${splitY} ${risk.x + direction * r} ${splitY} H ${x - direction * r} Q ${x} ${splitY} ${x} ${splitY + r} V ${futureY - nodeRadius - TREE_STYLE.clearance}` }, potential);
      });
      futureXs.forEach(x => add("circle", { cx: x, cy: futureY, r: nodeRadius, fill: "var(--tree-bg)", "stroke-width": TREE_STYLE.outline }, potential));
      // The editorial spine resumes at the section boundary after a clear gap.
      // It is not an onward transmission edge from the contained node.
      add("path", { d: `M ${trunkX} ${box.height - 20} V ${box.height}`, class: story.ghost, "data-intro-editorial": "" });
      node(first, true);
      [left, right, ...leaves].forEach(point => node(point));
      nodes.sort((a, b) => a.y - b.y);
      dot = add("circle", { cx: origin.x, cy: origin.y, r: initialRadius, fill: "var(--color-inv-hi)", stroke: "var(--color-inv-hi)", "data-intro-root": "" }, svg);
      // Exact corner geometry and proportions from BrandMark's 32px viewBox.
      // The four brackets settle inward as the onward transmission disappears.
      target = add("g", { fill: "none", stroke: "var(--color-alert)", "stroke-width": TREE_TARGET.outline, "stroke-linecap": "square", transform: `translate(${risk.x} ${risk.y}) scale(${frameRadius / 13}) translate(-16 -16)`, "data-intro-target": "" });
      targetCorners = [
        { d: "M3 8 L3 3 L8 3", x: -1, y: -1 },
        { d: "M24 3 L29 3 L29 8", x: 1, y: -1 },
        { d: "M29 24 L29 29 L24 29", x: 1, y: 1 },
        { d: "M8 29 L3 29 L3 24", x: -1, y: 1 },
      ].map(({ d, x, y }) => ({ element: add("path", { d }, target), x, y }));
      root.dataset.treeReady = "true";
      update();
    }

    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const layout = () => { if (!layoutFrame) layoutFrame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(layout);
    [root, opening, reconstruct, stop, period].forEach(el => resize.observe(el));
    const alignment = new MutationObserver(layout);
    alignment.observe(connection, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", layout);
    motion.addEventListener("change", schedule);
    document.fonts.ready.then(() => { if (!disposed) layout(); });
    measure();
    return () => {
      disposed = true;
      resize.disconnect();
      alignment.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", layout);
      motion.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(layoutFrame);
      delete root.dataset.treeReady;
    };
  }, [rootRef]);

  return <svg ref={svgRef} className={`${styles.tree} ${story.dark}`} aria-hidden="true" style={{
    "--tree-edge-width": TREE_STYLE.edge,
    "--tree-strong-width": TREE_STYLE.strongEdge,
    "--tree-outline-width": TREE_STYLE.outline,
  } as CSSProperties} />;
}
