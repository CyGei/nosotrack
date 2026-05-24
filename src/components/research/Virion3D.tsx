"use client";

/**
 * Virion3D — SARS-CoV-2 specimen, NIAID model loaded via GLTFLoader.
 *
 * Asset: /public/models/sars-cov-2-virion.glb
 *   - Source: NIH 3D entry 3DPX-013323 (NIAID Visual & Medical Arts),
 *     "SARSCOV2_Thick" variant. Licensed CC-BY 4.0.
 *   - Pipeline: NIH source GLB → gltfpack -si 0.30 -cc (meshoptimizer
 *     simplification + meshopt compression) → 635 KB, 170K triangles.
 *   - Decoded at runtime via three's MeshoptDecoder.
 *
 * The source GLB has no materials, just per-vertex RGBA. Three clusters:
 *   - Peach (~#fbcdb6) — lipid membrane / envelope    → palette grey
 *   - Orange (~#f46b2b) — open / active S-protein     → alert red
 *   - Cyan (~#28b6ef) — closed / inactive S-protein   → oxblood red
 * We classify each vertex by nearest cluster and rewrite the colour
 * attribute, so the on-brand grey-and-red palette ships through.
 *
 * Behaviour: smooth Y-rotation with fixed forward tilt for depth.
 * IntersectionObserver pauses rendering off-screen, reduced-motion
 * gets a single static frame, ResizeObserver keeps the canvas in
 * sync, full dispose on unmount.
 *
 * Raw three (NOT @react-three/fiber — R3F 8.x crashes under Next 15
 * + React 18.3 here). Loader / decoder imports use the JS examples
 * paths shipped inside the `three` package.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const MODEL_URL = "/models/sars-cov-2-virion.glb";

/**
 * Palette replacement colours.
 *
 * NosoTrack pathogen rule (see feedback memory):
 *   - Body / envelope → grey (single hue)
 *   - Surface proteins → red (shade variation is OK, but RED only)
 *
 * For SARS-CoV-2 we keep two red shades because the source distinguishes
 * the two S-protein conformations and the variation reads as depth:
 *   - Open / active spike   → alert red `#ff073a`
 *   - Closed / inactive spike → oxblood `#9c0a26`
 */
const PAL_GREY = new THREE.Color(0x7a7d83);
const PAL_RED_BRIGHT = new THREE.Color(0xff073a); // open spike
const PAL_RED_DEEP = new THREE.Color(0x9c0a26); // closed spike

/**
 * Position-based classification (rev. 5, 2026-05-24).
 *
 * Earlier revs tried to classify vertices by their source RGB values,
 * but `gltfpack`'s `EXT_meshopt_compression` + `KHR_mesh_quantization`
 * change the runtime encoding of the colour attribute so the threshold
 * logic mis-fires. Cy's screenshot showed the envelope rendering RED
 * — exactly the inversion you'd expect when the colour reads are off
 * by orders of magnitude or in the wrong space.
 *
 * The robust approach is geometric: the NIAID model's envelope is a
 * compact blob at the centre, and the spikes are thin protrusions that
 * extend ~30–40% beyond the envelope surface. So we classify by **radial
 * distance from the bounding-sphere centre**:
 *   - r < cutoff       → envelope (grey)
 *   - r ≥ cutoff       → spike    (red — open or closed)
 *
 * The cutoff is a fraction of the bounding-sphere radius (78%), which
 * cleanly slices the envelope from the spike heads on the canonical
 * NIAID virion. Spike *stems* sit right at the boundary; they end up
 * red, which reads correctly (the protein extends from base to tip).
 *
 * Open vs closed conformation is then inferred from the source colour
 * signal: the NIAID model encodes open spikes with high red, closed
 * with high blue. We compare R vs B to pick the shade.
 *
 * All distances are computed in local-quantized space; the ratio
 * (vertex_r / max_r) is invariant under linear quantization so this
 * works the same whether positions are Float32 or Uint16.
 */
function remapVertexColors(geom: THREE.BufferGeometry) {
  const colorAttr = geom.getAttribute("color") as
    | THREE.BufferAttribute
    | undefined;
  const posAttr = geom.getAttribute("position") as
    | THREE.BufferAttribute
    | undefined;
  if (!colorAttr || !posAttr) return;

  geom.computeBoundingSphere();
  const sphere = geom.boundingSphere;
  if (!sphere) return;
  const cx = sphere.center.x;
  const cy = sphere.center.y;
  const cz = sphere.center.z;
  const cutoff = sphere.radius * 0.78;

  const count = posAttr.count;
  let nEnvelope = 0;
  let nBright = 0;
  let nDeep = 0;

  for (let i = 0; i < count; i++) {
    const dx = posAttr.getX(i) - cx;
    const dy = posAttr.getY(i) - cy;
    const dz = posAttr.getZ(i) - cz;
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);

    let c: THREE.Color;
    if (r < cutoff) {
      c = PAL_GREY;
      nEnvelope++;
    } else {
      // Spike region — disambiguate open vs closed by source colour
      // signal. Open S-protein has high R / low B; closed is the
      // opposite. If the encoding is degenerate we still get a clean
      // red, just biased to one shade.
      const sR = colorAttr.getX(i);
      const sB = colorAttr.getZ(i);
      if (sR >= sB) {
        c = PAL_RED_BRIGHT;
        nBright++;
      } else {
        c = PAL_RED_DEEP;
        nDeep++;
      }
    }
    colorAttr.setXYZ(i, c.r, c.g, c.b);
  }
  colorAttr.needsUpdate = true;

  // eslint-disable-next-line no-console
  console.log(
    `[Virion3D] classified ${count} verts → envelope=${nEnvelope} ` +
      `open-spike=${nBright} closed-spike=${nDeep}  ` +
      `cutoff=${cutoff.toFixed(3)}  r_max=${sphere.radius.toFixed(3)}`
  );
}

export function Virion3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ─────────────────────────────────── scene / camera / renderer ─────
    const scene = new THREE.Scene();
    const w0 = container.clientWidth || 1;
    const h0 = container.clientHeight || 1;

    const camera = new THREE.PerspectiveCamera(34, w0 / h0, 0.1, 100);
    camera.position.set(0, 0, 6.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w0, h0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ───────────────────────────────────────────────────────── lights ─
    // Three-point setup: warm key from upper-right, cool fill from front-
    // left, warm rim from behind. Plus a hemisphere wash so global colour
    // stays balanced.
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

    // ─────────────────────────────────────────────────────── model load ─
    const virion = new THREE.Group();
    virion.rotation.x = 0.32;
    virion.rotation.z = -0.1;
    scene.add(virion);

    // Track resources to dispose
    const disposables: { dispose: () => void }[] = [];
    let cancelled = false;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (cancelled) return;

        // The NIAID source is one mesh under a root node. Walk the scene
        // graph defensively in case future revisions add more nodes.
        const root = gltf.scene;

        // Centre + scale to fit a unit sphere of radius ~1.0 so we can
        // reuse the existing camera framing.
        const box = new THREE.Box3().setFromObject(root);
        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);
        const targetRadius = 1.05;
        const scale = sphere.radius > 0 ? targetRadius / sphere.radius : 1;
        root.position.sub(sphere.center.multiplyScalar(scale));
        root.scale.setScalar(scale);

        // For every mesh: remap vertex colours, compute normals, attach
        // a palette-aware MeshStandardMaterial.
        root.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const geom = obj.geometry as THREE.BufferGeometry;
          if (geom.getAttribute("color")) {
            remapVertexColors(geom);
          }
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

        virion.add(root);
        setLoaded(true);
        renderer.render(scene, camera);
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error("[Virion3D] GLB load failed:", err);
      }
    );

    // ──────────────────────────────────────────── animation + observers ─
    let raf = 0;
    let isVisible = true;
    let lastT = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - lastT) / 1000, 0.1);
      lastT = now;
      if (!isVisible) return;
      // ~10°/s on Y → full revolution every ~36 s.
      virion.rotation.y += 0.175 * dt;
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

    // ────────────────────────────────────────────────────────── cleanup ─
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
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[680px] min-h-[380px]">
      <div ref={containerRef} className="absolute inset-0" aria-hidden />
      {/* Subtle loading state — gone the moment the GLB resolves. */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-faint">
          Loading specimen…
        </span>
      </div>
    </div>
  );
}
