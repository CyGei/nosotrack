"use client";

// Raw three.js, NOT @react-three/fiber — R3F 8.x crashes under Next 15 + React 18.3 here.

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { paintRedShading } from "./pathogens/classify";
import type { PathogenSpec } from "./pathogens/types";

type Props = {
  pathogen: PathogenSpec;
  className?: string;
  initialSpinBurst?: boolean;
};

const SPIN_BURST_MULT = 6;
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

    setLoaded(false);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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

    const root = new THREE.Group();
    root.rotation.set(tiltX, tiltY, tiltZ);
    scene.add(root);

    const disposables: { dispose: () => void }[] = [];
    let cancelled = false;

    const mount = (modelRoot: THREE.Object3D) => {
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

    let raf = 0;
    let isVisible = true;
    let lastT = performance.now();
    const burstStart = initialSpinBurst ? performance.now() : 0;

    const burstMult = (now: number) => {
      if (!initialSpinBurst) return 1;
      const elapsed = now - burstStart;
      if (elapsed >= SPIN_BURST_MS) return 1;
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
      // Browsers cap live WebGL contexts (~16); GC alone is too late and blanks later canvases.
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
    // `initialSpinBurst` is captured once at mount; re-running would tear down the renderer.
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
