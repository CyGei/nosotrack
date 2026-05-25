/**
 * convert-to-glb.mjs — turn a WRL / STL source mesh into a GLB.
 *
 * Used by `scripts/fetch-pathogen.mjs` when an NIH 3D entry doesn't
 * ship a native GLB (most of the older NIAID virion cutaways are WRL).
 *
 * Strategy: load the mesh with the right three.js loader, weld dup
 * vertices (so meshoptimizer can actually simplify later), recolour to
 * mid-grey, then export via GLTFExporter. The companion fetch script
 * then runs `gltfpack` on the result.
 *
 * Browser API shims (Blob, FileReader) are mocked here — GLTFExporter
 * insists on them but only uses them as byte containers.
 */

import * as THREE from "three";
import { VRMLLoader } from "three/examples/jsm/loaders/VRMLLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { readFileSync, writeFileSync } from "node:fs";

/* ──────────────────────────────────────── browser API shims ── */

globalThis.self = globalThis;
globalThis.window = globalThis;
globalThis.document = {
  createElementNS: () => ({}),
  createElement: () => ({}),
};

class FakeBlob {
  constructor(parts) {
    const bufs = parts.map((p) => {
      if (p instanceof FakeBlob) return p._buf;
      if (p instanceof ArrayBuffer) return Buffer.from(new Uint8Array(p));
      if (ArrayBuffer.isView(p))
        return Buffer.from(p.buffer, p.byteOffset, p.byteLength);
      return Buffer.from(p);
    });
    this._buf = Buffer.concat(bufs);
  }
  arrayBuffer() {
    const b = this._buf;
    return Promise.resolve(
      b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
    );
  }
  get size() {
    return this._buf.length;
  }
}
globalThis.Blob = FakeBlob;

class FakeFileReader {
  constructor() {
    this.onload = null;
    this.onloadend = null;
    this.onerror = null;
    this.result = null;
  }
  _settle(r, e) {
    if (e) {
      this.onerror && this.onerror(e);
      return;
    }
    this.result = r;
    const ev = { target: this };
    this.onload && this.onload(ev);
    this.onloadend && this.onloadend(ev);
  }
  readAsArrayBuffer(b) {
    Promise.resolve(b.arrayBuffer())
      .then((x) => this._settle(x))
      .catch((e) => this._settle(null, e));
  }
  readAsDataURL(b) {
    Promise.resolve(b.arrayBuffer())
      .then((x) =>
        this._settle(
          "data:application/octet-stream;base64," +
            Buffer.from(x).toString("base64")
        )
      )
      .catch((e) => this._settle(null, e));
  }
}
globalThis.FileReader = FakeFileReader;

/* ───────────────────────────────────────────────── pipeline ── */

/**
 * Read a WRL/STL source from disk, convert to an in-memory THREE.Group.
 *
 * - WRL: handled by three's VRMLLoader (full VRML97 support).
 * - STL: handled by STLLoader; output is a single un-named mesh.
 *
 * After loading we run `mergeVertices` on every geometry so gltfpack's
 * simplifier has indexed geometry to chew on. Without this step the
 * downstream simplification is a no-op.
 */
export function loadMesh(srcPath, format) {
  const fmt = (format ?? srcPath.split(".").pop()).toLowerCase();
  if (fmt === "wrl" || fmt === "vrml") {
    const text = readFileSync(srcPath, "utf8");
    const group = new VRMLLoader().parse(text);
    weldGroup(group, 1e-2);
    return group;
  }
  if (fmt === "stl") {
    const buf = readFileSync(srcPath);
    const geom = new STLLoader().parse(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    );
    const welded = mergeVertices(geom, 1e-2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.6,
    });
    const mesh = new THREE.Mesh(welded, mat);
    const group = new THREE.Group();
    group.add(mesh);
    return group;
  }
  throw new Error(`Unsupported source format: ${fmt}`);
}

function weldGroup(group, tolerance) {
  group.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry = mergeVertices(o.geometry, tolerance);
    o.material = new THREE.MeshStandardMaterial({
      color: o.material?.color ?? 0x808080,
      roughness: 0.6,
      metalness: 0.0,
    });
  });
}

/**
 * Serialize a THREE.Group / scene to a binary GLB file on disk.
 * Uses GLTFExporter; browser API shims at the top of this file make it
 * work in Node.
 */
export async function exportGroupToGlb(group, outPath) {
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(group, { binary: true });
  writeFileSync(outPath, Buffer.from(result));
  return result.byteLength;
}

/**
 * One-call convenience: src on disk → GLB on disk.
 */
export async function convertToGlb(srcPath, outPath, format) {
  const group = loadMesh(srcPath, format);
  let meshes = 0;
  let verts = 0;
  group.traverse((o) => {
    if (o.isMesh) {
      meshes++;
      verts += o.geometry.attributes.position?.count ?? 0;
    }
  });
  const bytes = await exportGroupToGlb(group, outPath);
  return { meshes, verts, bytes };
}
