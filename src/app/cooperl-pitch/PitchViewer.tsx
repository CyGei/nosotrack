"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./viewer.module.css";

// Give the unmodified deck its desktop canvas, then scale only the viewer.
const WIDTH = 1440;
const HEIGHT = 900;

export function PitchViewer() {
  const viewport = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [size, setSize] = useState({ width: WIDTH, height: HEIGHT });
  const [mobile, setMobile] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [slide, setSlide] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const query = matchMedia("(max-width: 900px), (pointer: coarse) and (max-height: 600px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(viewport.current!);
    return () => { query.removeEventListener("change", update); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const doc = frame.current?.contentDocument;
    const deck = doc?.getElementById("deck");
    if (!deck) return;
    setCount(doc!.querySelectorAll(".slide").length);
    const update = () => setSlide(Math.round(deck.scrollTop / deck.clientHeight));
    deck.addEventListener("scroll", update, { passive: true });
    update();
    return () => deck.removeEventListener("scroll", update);
  }, [loaded]);

  const go = (index: number) => {
    const buttons = frame.current?.contentDocument?.querySelectorAll<HTMLButtonElement>(".nav-dots button");
    buttons?.[index]?.click();
  };
  const scale = mobile ? (zoomed ? 1 : Math.min(size.width / WIDTH, size.height / HEIGHT)) : 1;

  return (
    <main className={styles.viewer} lang="fr" data-lenis-prevent>
      <div className={styles.viewport} ref={viewport}>
        <div className={styles.canvas} style={mobile ? { width: WIDTH * scale, height: HEIGHT * scale } : { width: "100%", height: "100%" }}>
          <iframe
            ref={frame}
            src="/cooperl-pitch/deck.html"
            title="Pitch Nosotrack pour Cooperl"
            allowFullScreen
            onLoad={() => setLoaded(value => value + 1)}
            style={{ width: mobile ? WIDTH : "100%", height: mobile ? HEIGHT : "100%", transform: `scale(${scale})` }}
          />
          {mobile && zoomed && <div aria-hidden="true" style={{ position: "absolute", inset: 0 }} />}
        </div>
      </div>
      <div className={styles.controls}>
        <p>{zoomed ? "Faites défiler pour explorer la diapositive." : "Tournez le téléphone pour une vue plus grande."}</p>
        <nav aria-label="Navigation des diapositives">
          <button onClick={() => go(slide - 1)} disabled={slide === 0 || !count} aria-label="Diapositive précédente">←</button>
          <span aria-live="polite">{count ? `${slide + 1} / ${count}` : "Chargement…"}</span>
          <button onClick={() => go(slide + 1)} disabled={!count || slide >= count - 1} aria-label="Diapositive suivante">→</button>
          <button aria-pressed={zoomed} onClick={() => { setZoomed(!zoomed); viewport.current?.scrollTo(0, 0); }}>{zoomed ? "Vue entière" : "Zoom +"}</button>
        </nav>
      </div>
    </main>
  );
}
