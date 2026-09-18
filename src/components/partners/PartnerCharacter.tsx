"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Kind = "doctor" | "pig";

// Small, nearest-filtered textures keep every face in the farm deck's voxel style.
function pixelMaterial(color: string, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 16;
  const context = canvas.getContext("2d")!;
  const base = new THREE.Color(color);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      context.fillStyle = base.clone().multiplyScalar(.90 + (seed / 4294967296) * .16).getStyle();
      context.fillRect(x, y, 1, 1);
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.magFilter = THREE.NearestFilter;
  // Mipmaps smooth distant/angled texels while keeping the close-up pixel style.
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshLambertMaterial({ map });
}

function makeCharacter(kind: Kind) {
  const model = new THREE.Group();
  const materials: THREE.MeshLambertMaterial[] = [];
  const material = (color: string, textured = false) => {
    const result = textured ? pixelMaterial(color, materials.length + 17) : new THREE.MeshLambertMaterial({ color });
    materials.push(result);
    return result;
  };
  const box = (size: [number, number, number], position: [number, number, number], paint: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), paint);
    mesh.position.set(...position);
    model.add(mesh);
    return mesh;
  };
  if (kind === "doctor") {
    const skin = material("#ba9273", true);
    const coat = material("#ffffff", true);
    const seam = material("#d4d8dd");
    const boots = material("#514b48", true);
    const dark = material("#47372d");
    const eyes = material("#47775e");
    const white = material("#f7f6ee");
    const mask = material("#72c7ea", true);
    const pleat = material("#a6def1");
    box([.82, 1.30, .53], [0, 1.12, 0], coat);
    box([.025, 1.1, .016], [0, 1.07, .272], seam);
    for (const x of [-.22, .22]) box([.32, .46, .39], [x, .26, 0], boots);
    box([.76, .83, .69], [0, 2.11, 0], skin);
    for (const x of [-.22, .22]) {
      box([.19, .12, .025], [x, 2.15, .355], white);
      box([.075, .11, .035], [x + (x < 0 ? .04 : -.04), 2.15, .372], eyes);
    }
    box([.64, .075, .05], [0, 2.27, .365], dark);
    box([.18, .23, .22], [0, 1.99, .40], skin);
    // Mask covers the lower face and the villager's projecting nose; straps wrap both sides.
    box([.67, .30, .13], [0, 1.91, .49], mask);
    for (const y of [1.84, 1.93]) box([.58, .018, .008], [0, y, .56], pleat);
    for (const x of [-.389, .389]) {
      box([.018, .034, .65], [x, 2.00, .04], pleat);
      box([.018, .034, .65], [x, 1.83, .04], pleat);
    }
    // Folded arms preserve the villager silhouette.
    box([.29, .61, .36], [-.53, 1.42, .07], coat);
    box([.29, .61, .36], [.53, 1.42, .07], coat);
    box([1.03, .27, .34], [0, 1.22, .38], coat);
    box([.25, .24, .355], [0, 1.23, .40], skin);
    box([.18, .20, .025], [.22, 1.56, .28], seam);
    box([.13, .15, .027], [.22, 1.57, .295], coat);
  } else {
    // Cuboid proportions and pink pixel shading match pig-sketchfab.png in the farm pitch.
    const pink = material("#c58caa", true);
    const snout = material("#d49eb5", true);
    const hoof = material("#80596b", true);
    const white = material("#f1edec");
    const black = material("#30252d");
    const nostril = material("#865769");
    box([.90, .87, 1.44], [0, .91, -.19], pink);
    box([.88, .83, .80], [0, 1.06, .75], pink);
    box([.48, .30, .19], [0, .94, 1.24], snout);
    for (const x of [-.16, .16]) box([.085, .105, .016], [x, .94, 1.342], nostril);
    for (const x of [-.30, .30]) {
      box([.17, .145, .015], [x, 1.15, 1.159], white);
      box([.075, .135, .02], [x + (x < 0 ? -.044 : .044), 1.15, 1.173], black);
      for (const z of [-.67, .44]) {
        // Meet the hoof at y=.115 instead of overlapping its side faces.
        box([.29, .42, .30], [x, .325, z], pink);
        box([.29, .10, .30], [x, .065, z], hoof);
      }
    }
    box([.13, .12, .23], [0, 1.00, -1.0], snout);
    box([.13, .23, .11], [.10, 1.05, -1.10], snout);
  }
  const bounds = new THREE.Box3().setFromObject(model);
  model.position.y = -(bounds.max.y + bounds.min.y) / 2;
  const pivot = new THREE.Group();
  pivot.add(model);
  pivot.rotation.y = -.45;
  return { pivot, materials };
}

export function PartnerCharacter({ kind }: { kind: Kind }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // The link and accessible character description remain usable without WebGL.
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 1, 30);
    camera.position.set(0, 1.2, 6.8);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(-3, 5, 6);
    scene.add(light);
    const { pivot, materials } = makeCharacter(kind);
    for (const paint of materials) {
      if (paint.map) paint.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }
    scene.add(pivot);
    const render = () => renderer.render(scene, camera);
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      // CSS owns the canvas size; changing its inline dimensions can retrigger layout.
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Keep the full rotating silhouette in frame even at narrow or zoomed widths.
      camera.position.set(0, 1.2, 6.8 / Math.min(1, camera.aspect));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      render();
    });
    resize.observe(container);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let previous = 0;
    const animate = (time: number) => {
      if (previous) pivot.rotation.y += Math.min(time - previous, 50) * .00038;
      previous = time;
      render();
    };
    const updateAnimation = () => {
      previous = 0;
      renderer.setAnimationLoop(!motion.matches && visible && !document.hidden ? animate : null);
      render();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateAnimation();
    });
    observer.observe(container);
    motion.addEventListener("change", updateAnimation);
    document.addEventListener("visibilitychange", updateAnimation);
    updateAnimation();
    return () => {
      renderer.setAnimationLoop(null);
      resize.disconnect();
      observer.disconnect();
      motion.removeEventListener("change", updateAnimation);
      document.removeEventListener("visibilitychange", updateAnimation);
      pivot.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      materials.forEach((paint) => { paint.map?.dispose(); paint.dispose(); });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind]);

  return <div ref={host} style={{ width: "100%", height: "100%" }} role="img" aria-label={kind === "doctor" ? "3D pixel villager doctor in a white cloak and blue face mask" : "3D pink pixel pig"} />;
}
