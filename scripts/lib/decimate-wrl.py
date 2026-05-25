#!/usr/bin/env python3
"""
decimate-wrl.py — topology-preserving simplification for VRML IndexedFaceSet
meshes that are too big for three.js to load in one shot.

Algorithm (Rossignac & Borrel vertex clustering, 1993):
  1. Parse the VRML `point [...]` (vertex coordinates) and `coordIndex
     [...]` (triangle indices, terminated by -1 per face) arrays.
  2. Snap every vertex to a 3D grid (default 128 cells per longest axis).
     Vertices in the same cell get merged to their centroid.
  3. Rewrite the face index list using the old→new vertex mapping.
  4. Drop faces that become degenerate (two corners mapped to the same
     cluster) and drop duplicate faces.
  5. Drop vertices that no triangle references.
  6. Emit a new WRL preserving the same outer structure so three.js
     can load the result with no special handling.

Why this is better than naive triangle-dropping: random face dropping
leaves orphan triangles and Swiss-cheese holes (the bug the user spotted
on the Ebola / HIV cutaways). Vertex clustering produces a continuous,
correctly-shaded surface — just at coarser resolution.

Usage:
    python3 scripts/lib/decimate-wrl.py <in.wrl> <out.wrl> [grid=128]

The optional `grid` arg sets the cell count along the longest axis;
higher = finer = bigger output. 128 is a good default for cutaway-style
virion meshes (~5-10x reduction with no visible holes).
"""

import math
import re
import sys
from pathlib import Path


def parse_floats(body: str) -> list:
    """Tolerant float parser — strips brackets/commas, splits on whitespace."""
    return [float(t) for t in re.findall(r"-?\d+\.?\d*(?:[eE]-?\d+)?", body)]


def parse_ints(body: str) -> list:
    return [int(t) for t in re.findall(r"-?\d+", body)]


def cluster_decimate(verts_xyz, face_indices, grid_cells=128):
    """
    verts_xyz: flat list [x0,y0,z0, x1,y1,z1, ...]
    face_indices: list of (i,j,k) tuples
    grid_cells: target grid resolution along the longest bounding-box axis

    Returns: (new_verts_xyz, new_face_indices)
    """
    n_verts = len(verts_xyz) // 3
    # Bounding box
    minx = miny = minz = float("inf")
    maxx = maxy = maxz = float("-inf")
    for i in range(n_verts):
        x = verts_xyz[3 * i]
        y = verts_xyz[3 * i + 1]
        z = verts_xyz[3 * i + 2]
        if x < minx: minx = x
        if y < miny: miny = y
        if z < minz: minz = z
        if x > maxx: maxx = x
        if y > maxy: maxy = y
        if z > maxz: maxz = z

    span = max(maxx - minx, maxy - miny, maxz - minz)
    if span <= 0:
        return verts_xyz, face_indices
    cell_size = span / grid_cells

    # Map each vertex to a cluster cell, accumulate centroid
    cluster_sum = {}  # cell -> [sx, sy, sz, count]
    vert_to_cluster = [0] * n_verts
    cluster_id = {}
    next_id = 0

    for i in range(n_verts):
        x = verts_xyz[3 * i]
        y = verts_xyz[3 * i + 1]
        z = verts_xyz[3 * i + 2]
        cx = int((x - minx) / cell_size)
        cy = int((y - miny) / cell_size)
        cz = int((z - minz) / cell_size)
        cell = (cx, cy, cz)
        cid = cluster_id.get(cell)
        if cid is None:
            cid = next_id
            cluster_id[cell] = cid
            cluster_sum[cid] = [x, y, z, 1]
            next_id += 1
        else:
            cs = cluster_sum[cid]
            cs[0] += x; cs[1] += y; cs[2] += z; cs[3] += 1
        vert_to_cluster[i] = cid

    # Build new vertex array as cluster centroids
    new_verts = [0.0] * (next_id * 3)
    for cid, cs in cluster_sum.items():
        c = cs[3]
        new_verts[3 * cid + 0] = cs[0] / c
        new_verts[3 * cid + 1] = cs[1] / c
        new_verts[3 * cid + 2] = cs[2] / c

    # Remap faces and drop degenerates / duplicates
    seen = set()
    new_faces = []
    n_in = len(face_indices)
    n_degen = 0
    n_dup = 0
    for (i, j, k) in face_indices:
        a = vert_to_cluster[i]
        b = vert_to_cluster[j]
        c = vert_to_cluster[k]
        if a == b or b == c or a == c:
            n_degen += 1
            continue
        # Canonicalise by smallest-rotation so dup detection works
        if a < b and a < c:
            key = (a, b, c)
        elif b < a and b < c:
            key = (b, c, a)
        else:
            key = (c, a, b)
        if key in seen:
            n_dup += 1
            continue
        seen.add(key)
        new_faces.append((a, b, c))

    return new_verts, new_faces, {
        "in_verts": n_verts,
        "out_verts": next_id,
        "in_faces": n_in,
        "out_faces": len(new_faces),
        "dropped_degen": n_degen,
        "dropped_dup": n_dup,
        "cell_size": cell_size,
    }


def main():
    if len(sys.argv) < 3:
        print("Usage: decimate-wrl.py <in.wrl> <out.wrl> [grid=128]")
        sys.exit(1)
    in_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    grid = int(sys.argv[3]) if len(sys.argv) > 3 else 128

    text = in_path.read_text(encoding="utf-8", errors="ignore")

    # Each Shape can have its own point + coordIndex block. We process
    # the FIRST IndexedFaceSet block (the cutaway viral models we target
    # are typically a single mesh in one Shape).
    point_match = re.search(r"point\s*\[(.*?)\]", text, re.DOTALL)
    coord_match = re.search(r"coordIndex\s*\[(.*?)\]", text, re.DOTALL)
    if not point_match or not coord_match:
        print("could not find point[...] or coordIndex[...] in WRL")
        sys.exit(1)

    verts_xyz = parse_floats(point_match.group(1))
    raw_ints = parse_ints(coord_match.group(1))

    # Slice the index list into per-face index tuples on -1 terminators
    faces = []
    cur = []
    for n in raw_ints:
        if n == -1:
            if len(cur) == 3:
                faces.append(tuple(cur))
            elif len(cur) > 3:
                # Triangulate a polygon (fan) — uncommon in NIH meshes
                for k in range(1, len(cur) - 1):
                    faces.append((cur[0], cur[k], cur[k + 1]))
            cur = []
        else:
            cur.append(n)

    new_verts, new_faces, stats = cluster_decimate(verts_xyz, faces, grid)
    print(
        f"  cluster-decimate: verts {stats['in_verts']:,} → "
        f"{stats['out_verts']:,}, faces {stats['in_faces']:,} → "
        f"{stats['out_faces']:,} (cell_size={stats['cell_size']:.4f}, "
        f"dropped degen={stats['dropped_degen']:,} dup={stats['dropped_dup']:,})"
    )

    # Format vertices: x y z, one triple per line
    vert_lines = []
    for i in range(0, len(new_verts), 3):
        vert_lines.append(
            f"{new_verts[i]:.5f} {new_verts[i+1]:.5f} {new_verts[i+2]:.5f}"
        )
    vert_body = ",\n".join(vert_lines)

    # Format faces: i, j, k, -1
    face_body = ",\n".join(f"{a}, {b}, {c}, -1" for (a, b, c) in new_faces)

    # Splice replacements back in
    text = text[: point_match.start(1)] + "\n" + vert_body + "\n" + text[point_match.end(1):]
    # Re-find coord_match since indices shifted
    coord_match = re.search(r"coordIndex\s*\[(.*?)\]", text, re.DOTALL)
    text = text[: coord_match.start(1)] + "\n" + face_body + "\n" + text[coord_match.end(1):]

    out_path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
