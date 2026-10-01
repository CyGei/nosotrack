"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { AnimatedTitle } from "../about/AnimatedTitle";
import { Scene1Field } from "./Scene1Field";
import { IntroTree } from "./IntroTree";
import styles from "./Hero.module.css";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const openingRef = useRef<HTMLDivElement>(null);
  const reconstructRef = useRef<HTMLHeadingElement>(null);
  const [reconstructReady, setReconstructReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    const opening = openingRef.current!;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, bottom, height } = opening.getBoundingClientRect();
      const fade = Math.max(0, Math.min(1, -top / (height * 0.75)));
      opening.style.setProperty("--media-opacity", String(reduce ? 1 : 1 - fade));
      setInView(bottom > 0 && top < innerHeight && fade < 1);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    onVisibility();
    update();
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [reduce]);

  useEffect(() => {
    const heading = reconstructRef.current!;
    let lastY = Math.max(0, window.scrollY);
    // A restored scroll position already represents progress into the page.
    let movedDown = lastY > 0;
    let frame = 0;
    let revealed = false;
    const check = () => {
      frame = 0;
      const { top, bottom } = heading.getBoundingClientRect();
      if (movedDown && window.scrollY > 0 && top < innerHeight * 0.82 && bottom > 0) {
        revealed = true;
        setReconstructReady(true);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", schedule);
      }
    };
    const schedule = () => { if (!revealed && !frame) frame = requestAnimationFrame(check); };
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      if (y > lastY) movedDown = true;
      lastY = y;
      schedule();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    check();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={heroRef} id="hero" className={`on-dark ${styles.hero}`} aria-labelledby="hero-title">
      <div ref={openingRef} data-intro-opening className={styles.opening}>
        <div className={styles.media} aria-hidden="true">
          <Scene1Field active={inView && pageVisible && !reduce} />
        </div>
        <div className={styles.shade} aria-hidden="true" />
        <div className={`container-page ${styles.inner}`}>
          <h1 id="hero-title" className={styles.title} aria-label="Outbreak forensics for infection prevention and control.">
            <span>Outbreak forensics</span>
            <span>for infection prevention</span>
            <span>and control<span className="sr-only">.</span><span data-intro-period className={styles.period} aria-hidden="true" /></span>
          </h1>
          <p className={styles.description}>
            Nosotrack integrates clinical, genomic and mobility data to identify how infections spread and devise targeted interventions.
          </p>
        </div>
      </div>
      <div className={`container-page ${styles.reconstruct}`}>
        <h2 ref={reconstructRef} data-intro-reconstruct className={styles.chapterTitle}>
          <AnimatedTitle text="Nosotrack reconstructs the chain of transmission." enabled={reconstructReady} rootMargin="0px" />
        </h2>
        <div data-intro-branches className={styles.branchSpace} aria-hidden="true" />
      </div>
      <div className={`container-page ${styles.stop}`}>
        <h2 data-intro-stop className={styles.chapterTitle}>
          <AnimatedTitle text="To stop outbreaks before they escalate." />
        </h2>
      </div>
      <IntroTree rootRef={heroRef} />
      <div data-hero-connection className={styles.connection} aria-hidden="true" />
    </section>
  );
}
