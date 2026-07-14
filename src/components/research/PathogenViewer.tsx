"use client";

/**
 * PathogenViewer — generic 3D specimen renderer.
 *
 * Takes a `PathogenSpec` (see ./pathogens/types.ts) and renders the
 * model using raw three.js. The classifier on the spec decides how
 * vertices get remapped to the brand palette (grey body, red projections).
 *
 * This is the only WebGL-touching component in the Research section.
 * Everything pathogen-specific lives in the registry under
 * ./pathogens/ — to add a new one you write a config file, never edit
 * this component.
 *
 * Raw three.js (NOT @react-three/fiber — R3F 8.x crashes under Next 15
 * + React 18.3 in this app; see project memory). Loader / decoder
 * imports use the JS examples paths shipped inside the `three` package.
 *
 * Behaviour:
 *   - IntersectionObserver pauses the RAF loop when off-screen
 *   - prefers-reduced-motion renders a single static frame
 *   - ResizeObserver keeps the canvas in sync with its container
 *   - Full dispose on unmount; safe to swap specimens via React `key`
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { paintRedShading } from "./pathogens/classify";
import type { PathogenSpec } from "./pathogens/types";

type Props = {
  pathogen: PathogenSpec;
  className?: string;
  /**
   * If true, the viewer starts at a boosted rotation speed (×SPIN_BURST_MULT)
   * and exponentially decays back to the spec's base speed over
   * SPIN_BURST_MS milliseconds. Used by the dossier modal to give the
   * specimen a "scan accelerating" beat when it opens.
   */
  initialSpinBurst?: boolean;
};

/** Multiplier applied to base rotationSpeed at t=0 of the burst. */
const SPIN_BURST_MULT = 6;
/** Time to decay from SPIN_BURST_MULT × base back to 1 × base. */
const SPIN_BURST_MS = 1200;

export function PathogenViewer({
  pathogen,
  className,
  initialSpinBurst = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset the loaded flag every time the spec changes — the parent
    // typically swaps specimens via `key`, which would unmount/remount
    // and reset state anyway, but this keeps the component robust if
    // someone passes a new `pathogen` prop without a key.
    setLoaded(false);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /* ─────────────────────────── scene / camera / renderer ─────── */
    const framing = pathogen.framing ?? {};
    const targetRadius = framing.targetRadius ?? 1.35;
    const cameraZ = framing.cameraZ ?? 6.0;
    const fov = framing.fov ?? 34;
    const tiltX = framing.tiltX ?? 0.32;
    const tiltY = framing.tiltY ?? 0;
    const tiltZ = framing.tiltZ ?? -0.1;
    const rotSpeed = framing.rotationSpeed ?? 0.175;
    const rotAxis = framing.rotationAxis ?? "y";

    const scene = new THREE.Scene();
    const w0 = container.clientWidth || 1;
    const h0 = container.clientHeight || 1;

    const camera = new THREE.PerspectiveCamera(fov, w0 / h0, 0.1, 100);
    camera.position.set(0, 0, cameraZ);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w0, h0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    /* ─────────────────────────────────────────────────── lights ── */
    // Three-point setup: warm key from upper-right, cool fill from
    // front-left, warm rim from behind. Plus a hemisphere wash so the
    // global colour stays balanced.
    const key = new THREE.DirectionalLight(0xfff4e6, 2.2);
    key.position.set(3.5, 4.2, 4.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc4d4e0, 0.6);
    fill.position.set(-3.5, -0.6, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffd0c0, 0.5);
    rim.position.set(-1, -3, -3.5);
    scene.add(rim);
    const hemi = new THREE.HemisphereLight(0xefeeef, 0x6d6d72, 0.4);
    scene.add(hemi);

    /* ───────────────────────────────────────────── model load ── */
    const root = new THREE.Group();
    root.rotation.set(tiltX, tiltY, tiltZ);
    scene.add(root);

    const disposables: { dispose: () => void }[] = [];
    let cancelled = false;

    /** Normalise + add a built/loaded model group to the scene. */
    const mount = (modelRoot: THREE.Object3D) => {
      // Centre + uniform scale to a unit bounding sphere so the
      // camera framing is consistent across specimens.
      const box = new THREE.Box3().setFromObject(modelRoot);
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      const scale = sphere.radius > 0 ? targetRadius / sphere.radius : 1;
      modelRoot.position.sub(sphere.center.multiplyScalar(scale));
      modelRoot.scale.setScalar(scale);
      root.add(modelRoot);
      setLoaded(true);
      renderer.render(scene, camera);
    };

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      pathogen.modelUrl,
      (gltf) => {
        if (cancelled) return;
        const modelRoot = gltf.scene;

        // For every mesh: run the universal red-shading algorithm
        // (Taubin smooth → outward displacement → Otsu → CC filter →
        // grey/red per-vertex colours), compute normals if absent, then
        // attach a vertex-colour MeshStandardMaterial. See ./pathogens/
        // classify.ts for the algorithm's design rationale.
        modelRoot.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const geom = obj.geometry as THREE.BufferGeometry;
          paintRedShading(obj);
          if (!geom.getAttribute("normal")) {
            geom.computeVertexNormals();
          }
          const mat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.55,
            metalness: 0.04,
            flatShading: false,
          });
          obj.material = mat;
          disposables.push(mat);
          disposables.push(geom);
        });

        mount(modelRoot);
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error(
          `[PathogenViewer] GLB load failed (${pathogen.id}):`,
          err
        );
      }
    );

    /* ──────────────────────────────── animation + observers ── */
    let raf = 0;
    let isVisible = true;
    let lastT = performance.now();
    const burstStart = initialSpinBurst ? performance.now() : 0;

    /**
     * Multiplier applied to rotSpeed at time `now` — exponential decay
     * from SPIN_BURST_MULT back to 1 across SPIN_BURST_MS. Returns 1
     * (no boost) when the burst is disabled or already expired.
     */
    const burstMult = (now: number) => {
      if (!initialSpinBurst) return 1;
      const elapsed = now - burstStart;
      if (elapsed >= SPIN_BURST_MS) return 1;
      // Ease-out cubic from MULT → 1.
      const p = elapsed / SPIN_BURST_MS;
      const ease = 1 - Math.pow(1 - p, 3);
      return SPIN_BURST_MULT - (SPIN_BURST_MULT - 1) * ease;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - lastT) / 1000, 0.1);
      lastT = now;
      if (!isVisible) return;
      const delta = rotSpeed * burstMult(now) * dt;
      if (rotAxis === "x") root.rotation.x += delta;
      else if (rotAxis === "z") root.rotation.z += delta;
      else root.rotation.y += delta;
      renderer.render(scene, camera);
    };

    if (!reduceMotion) {
      raf = requestAnimationFrame(tick);
    }

    const intObs = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) lastT = performance.now();
      },
      { threshold: 0.02 }
    );
    intObs.observe(container);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    const resObs = new ResizeObserver(onResize);
    resObs.observe(container);

    /* ─────────────────────────────────────────────── cleanup ── */
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      intObs.disconnect();
      resObs.disconnect();
      for (const d of disposables) {
        try {
          d.dispose();
        } catch {
          /* noop */
        }
      }
      renderer.dispose();
      // Explicitly drop the WebGL context — browsers cap live contexts
      // (~16), and the ticker/spotlight mount many specimens, so relying on
      // GC to reclaim them can blank later canvases.
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
    // `initialSpinBurst` is captured once at mount — re-running the effect
    // on burst toggle would tear down the whole renderer, which is what
    // we want when the parent swaps specimens (handled via React `key`),
    // but is unnecessary cost for a flag that's typically only set once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathogen]);

  return (
    <div
      className={
        className ??
        "relative mx-auto aspect-square w-full max-w-[680px] min-h-[380px]"
      }
    >
      <div ref={containerRef} className="absolute inset-0" aria-hidden />
      {/* Subtle loading state — fades out the moment the GLB resolves. */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">
          Loading specimen…
        </span>
      </div>
    </div>
  );
}
