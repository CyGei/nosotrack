import * as THREE from "three";
import { VRMLLoader } from "three/examples/jsm/loaders/VRMLLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { readFileSync, writeFileSync } from "node:fs";

// GLTFExporter insists on browser Blob/FileReader, but only as byte containers.
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

// mergeVertices is required: gltfpack's simplifier is a no-op on non-indexed geometry.
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

export async function exportGroupToGlb(group, outPath) {
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(group, { binary: true });
  writeFileSync(outPath, Buffer.from(result));
  return result.byteLength;
}

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
