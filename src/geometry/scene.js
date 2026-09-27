import { above, below, jointType } from "../data/anatomy.js";
import { V, add, sub, mul, dot, cross, norm } from "./math.js";
export function createScene(state) {
  function ellipsoid(c, r, lat = 10, lon = 18) {
    const out = [];
    const at = (a, t) => [
      c[0] + r[0] * Math.sin(a) * Math.cos(t),
      c[1] + r[1] * Math.cos(a),
      c[2] + r[2] * Math.sin(a) * Math.sin(t),
    ];
    for (let i = 0; i < lat; i++)
      for (let j = 0; j < lon; j++) {
        const a = (i * Math.PI) / lat,
          b = ((i + 1) * Math.PI) / lat,
          s = (j * 2 * Math.PI) / lon,
          t = ((j + 1) * 2 * Math.PI) / lon,
          p = at(a, s),
          q = at(b, s),
          r0 = at(b, t),
          r1 = at(a, t);
        out.push([p, q, r0], [p, r0, r1]);
      }
    return out;
  }
  function tube(a, b, r0, r1 = r0, N = 12) {
    let u = norm(cross(norm(sub(b, a)), [0, 1, 0]));
    if (Math.hypot(...u) < 0.1) u = norm(cross(norm(sub(b, a)), [0, 0, 1]));
    const v = norm(cross(norm(sub(b, a)), u)),
      out = [];
    const at = (p, r, t) =>
      add(p, add(mul(u, r * Math.cos(t)), mul(v, r * Math.sin(t))));
    for (let i = 0; i < N; i++) {
      const t = (i * 2 * Math.PI) / N,
        q = ((i + 1) * 2 * Math.PI) / N,
        p = at(a, r0, t),
        p1 = at(a, r0, q),
        p2 = at(b, r1, q),
        p3 = at(b, r1, t);
      out.push([p, p1, p2], [p, p2, p3]);
    }
    return out;
  }
  function plate(a, b, width, thick) {
    const d = norm(sub(b, a)),
      side = norm([-d[2], 0, d[0]]),
      v = mul(side, width / 2),
      h = [0, thick / 2, 0],
      p = [add(a, v), sub(a, v), add(b, mul(v, 0.8)), sub(b, mul(v, 0.8))],
      c = p.map((x) => add(x, h)).concat(p.map((x) => sub(x, h)));
    return [
      [c[0], c[1], c[3]],
      [c[0], c[3], c[2]],
      [c[4], c[7], c[5]],
      [c[4], c[6], c[7]],
      [c[0], c[2], c[6]],
      [c[0], c[6], c[4]],
      [c[1], c[5], c[7]],
      [c[1], c[7], c[3]],
      [c[2], c[3], c[7]],
      [c[2], c[7], c[6]],
    ];
  }
  let grouped = new Map(),
    poses = [],
    bounds = { center: [0, 0, 0], height: 3.5, width: 4 };
  const emit = (owner, part, tri) => {
    const key = owner + "|" + part;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(...tri);
  };
  const path = (owner, part, pts, r) => {
    for (let i = 0; i < pts.length - 1; i++) {
      emit(owner, part, tube(pts[i], pts[i + 1], r, r * 0.96));
      if (i) emit(owner, part, ellipsoid(pts[i], [r, r, r], 6, 10));
    }
  };
  function ring(owner, part, c, rx, rz, r = 0.073) {
    const pts = [];
    for (let i = 0; i <= 25; i++) {
      let a = (i * 2 * Math.PI) / 25;
      pts.push([c[0] + rx * Math.cos(a), c[1], c[2] + rz * Math.sin(a)]);
    }
    path(owner, part, pts, r);
  }
  function typical(id, owner) {
    const c = id.startsWith("C"),
      t = id.startsWith("T"),
      l = id.startsWith("L"),
      n = +id.slice(1),
      axis = id === "C2";
    const bx = l
        ? id === "L5"
          ? 1.21
          : 1.11
        : t
          ? 0.86
          : id === "C7"
            ? 0.77
            : 0.69,
      by = l ? 0.48 : t ? 0.39 : 0.33,
      bz = l ? 0.68 : t ? 0.57 : 0.49,
      px = bx * 0.84,
      back = l ? 1.4 : t ? 1.32 : 1.2;
    emit(owner, "body", ellipsoid([0, 0, -0.62], [bx, by, bz], 13, 26));
    for (const s of [-1, 1]) {
      emit(
        owner,
        "pedicle",
        tube([s * bx * 0.78, 0, -0.18], [s * px, 0, 0.46], l ? 0.23 : 0.18),
      );
      emit(
        owner,
        "lamina",
        plate(
          [s * px, 0, 0.46],
          [s * 0.08, 0, back],
          l ? 0.35 : 0.25,
          l ? 0.28 : 0.21,
        ),
      );
      if (c) {
        const tip = px + 0.85;
        path(
          owner,
          "transverse",
          [
            [s * px, 0, 0.14],
            [s * (px + 0.48), 0, 0.13],
            [s * tip, 0, 0.44],
          ],
          0.105,
        );
        path(
          owner,
          "transverse",
          [
            [s * px, 0, 0.72],
            [s * (px + 0.48), 0, 0.73],
            [s * tip, 0, 0.44],
          ],
          0.1,
        );
        ring(
          owner,
          "transForamen",
          [s * (px + 0.47), 0, 0.43],
          0.16,
          0.21,
          0.045,
        );
        if (id === "C6")
          emit(
            owner,
            "carotidTubercle",
            ellipsoid([s * (px + 0.62), 0.06, 0.15], [0.13, 0.18, 0.13]),
          );
      } else
        emit(
          owner,
          "transverse",
          tube(
            [s * px, 0, 0.57],
            [s * (px + (t ? 0.95 : 1.05)), t ? 0.08 : 0, 0.69],
            t ? 0.16 : 0.2,
            0.11,
          ),
        );
      let fx = px * 0.96;
      emit(
        owner,
        "supProcess",
        tube([s * fx, 0.04, 0.61], [s * fx, by + 0.14, 0.71], 0.17, 0.155),
      );
      emit(
        owner,
        "infProcess",
        tube([s * fx, -0.05, 0.65], [s * fx, -by - 0.14, 0.74], 0.16, 0.145),
      );
      emit(
        owner,
        "supSurface",
        ellipsoid([s * fx, by + 0.15, 0.71], [0.195, 0.045, 0.16]),
      );
      emit(
        owner,
        "infSurface",
        ellipsoid([s * fx, -by - 0.15, 0.74], [0.19, 0.045, 0.17]),
      );
      if (t) {
        if (n <= 9) {
          emit(
            owner,
            "costSup",
            ellipsoid([s * bx * 0.95, by * 0.74, -0.62], [0.057, 0.13, 0.16]),
          );
          emit(
            owner,
            "costInf",
            ellipsoid([s * bx * 0.95, -by * 0.74, -0.62], [0.057, 0.12, 0.16]),
          );
        } else
          emit(
            owner,
            "costSingle",
            ellipsoid([s * bx * 0.94, by * 0.43, -0.62], [0.061, 0.14, 0.18]),
          );
        if (n <= 10)
          emit(
            owner,
            "costTrans",
            ellipsoid([s * (px + 0.86), 0.08, 0.69], [0.07, 0.11, 0.12]),
          );
      }
      if (l) {
        emit(
          owner,
          "mammillary",
          tube(
            [s * fx, by * 0.82, 0.8],
            [s * fx, by + 0.25, 0.97],
            0.09,
            0.065,
          ),
        );
        emit(
          owner,
          "accessory",
          tube(
            [s * (px + 0.18), -0.02, 0.68],
            [s * (px + 0.23), -0.06, 0.94],
            0.085,
            0.06,
          ),
        );
      }
    }
    if (c && n < 7) {
      emit(
        owner,
        "spinous",
        plate([0, 0, back], [0, 0, back + 0.38], 0.23, 0.18),
      );
      for (const s of [-1, 1])
        emit(
          owner,
          "spinous",
          tube([0, 0, back + 0.35], [s * 0.19, 0, back + 0.61], 0.105, 0.07),
        );
    } else if (c)
      emit(
        owner,
        "spinous",
        tube([0, 0, back], [0, 0, back + 0.84], 0.175, 0.085),
      );
    else if (t)
      emit(
        owner,
        "spinous",
        tube(
          [0, 0, back],
          [0, -0.31, back + (n >= 11 ? 0.59 : 0.86)],
          0.18,
          0.08,
        ),
      );
    else
      emit(
        owner,
        "spinous",
        plate([0, 0, back], [0, 0, back + 0.54], 0.46, 0.34),
      );
    if (axis) {
      for (const s of [-1, 1])
        emit(
          owner,
          "axisSup",
          ellipsoid([s * px * 0.96, by + 0.19, 0.71], [0.2, 0.052, 0.18]),
        );
      emit(
        owner,
        "dens",
        tube([0, by * 0.73, -0.63], [0, 0.99, -0.63], 0.21, 0.14, 16),
      );
      emit(owner, "dens", ellipsoid([0, 1.005, -0.63], [0.14, 0.14, 0.14]));
      emit(
        owner,
        "densAnterior",
        ellipsoid([0, 0.76, -0.797], [0.105, 0.15, 0.025]),
      );
      emit(
        owner,
        "densPosterior",
        ellipsoid([0, 0.73, -0.457], [0.1, 0.12, 0.025]),
      );
    }
  }
  function atlas(owner) {
    path(
      owner,
      "antArch",
      [
        [-0.87, 0, -0.05],
        [-0.76, 0, -0.53],
        [-0.42, 0, -1.0],
        [0, 0, -1.12],
        [0.42, 0, -1.0],
        [0.76, 0, -0.53],
        [0.87, 0, -0.05],
      ],
      0.14,
    );
    path(
      owner,
      "postArch",
      [
        [-0.87, 0, 0.14],
        [-0.74, 0, 0.63],
        [-0.4, 0, 1.14],
        [0, 0, 1.33],
        [0.4, 0, 1.14],
        [0.74, 0, 0.63],
        [0.87, 0, 0.14],
      ],
      0.12,
    );
    emit(owner, "atlasTubAnt", ellipsoid([0, 0, -1.19], [0.13, 0.14, 0.11]));
    emit(owner, "atlasTubPost", ellipsoid([0, 0, 1.38], [0.1, 0.12, 0.11]));
    emit(owner, "foveaDentis", ellipsoid([0, 0.02, -0.99], [0.16, 0.16, 0.05]));
    for (const s of [-1, 1]) {
      emit(owner, "mass", ellipsoid([s * 0.85, 0, 0.04], [0.27, 0.3, 0.33]));
      emit(
        owner,
        "atlasSup",
        ellipsoid([s * 0.85, 0.29, 0.04], [0.22, 0.047, 0.3]),
      );
      emit(
        owner,
        "atlasInf",
        ellipsoid([s * 0.85, -0.29, 0.04], [0.22, 0.048, 0.28]),
      );
      path(
        owner,
        "atlasTrans",
        [
          [s * 0.88, 0, -0.24],
          [s * 1.18, 0, -0.28],
          [s * 1.55, 0, -0.27],
          [s * 1.78, 0, -0.01],
        ],
        0.09,
      );
      path(
        owner,
        "atlasTrans",
        [
          [s * 0.89, 0, 0.25],
          [s * 1.19, 0, 0.29],
          [s * 1.55, 0, 0.26],
          [s * 1.78, 0, -0.01],
        ],
        0.088,
      );
      ring(owner, "atlasTransForamen", [s * 1.41, 0, 0], 0.18, 0.18, 0.047);
    }
  }
  function sacrum(owner) {
    for (const [y, r, d] of [
      [0.85, 0.92, 0.42],
      [0.42, 0.89, 0.41],
      [-0.01, 0.78, 0.38],
      [-0.45, 0.63, 0.32],
      [-0.86, 0.43, 0.25],
    ]) {
      emit(owner, "sacBase", ellipsoid([0, y, -0.12], [r * 0.62, 0.235, d]));
      for (const s of [-1, 1])
        emit(
          owner,
          "sacAla",
          ellipsoid([s * r * 0.72, y, -0.08], [r * 0.33, 0.225, d * 0.79]),
        );
    }
    emit(owner, "sacBase", ellipsoid([0, 1.08, -0.12], [1.05, 0.15, 0.44]));
    for (const s of [-1, 1]) {
      emit(
        owner,
        "sacAla",
        ellipsoid([s * 1.12, 0.81, -0.13], [0.39, 0.18, 0.37]),
      );
    }
    emit(owner, "sacApex", ellipsoid([0, -1.2, -0.08], [0.31, 0.17, 0.19]));
    path(
      owner,
      "sacCrest",
      [
        [0, 0.64, 0.35],
        [0, 0.15, 0.39],
        [0, -0.25, 0.32],
        [0, -0.73, 0.23],
      ],
      0.105,
    );
    for (const s of [-1, 1])
      for (const [i, y] of [0.53, 0.12, -0.3, -0.71].entries())
        ring(
          owner,
          "sacForamina",
          [s * (1.06 - i * 0.1), y, -0.44],
          0.065,
          0.075,
          0.027,
        );
    ring(owner, "sacCanal", [0, 1.12, 0.3], 0.28, 0.2, 0.036);
  }
  function coccyx(owner) {
    for (const [y, r] of [
      [0.53, 0.46],
      [0.1, 0.35],
      [-0.28, 0.24],
      [-0.64, 0.15],
    ])
      emit(owner, "cocBase", ellipsoid([0, y, 0.02], [r, 0.23, r * 0.6]));
    for (const s of [-1, 1])
      emit(
        owner,
        "cocCornu",
        tube([s * 0.33, 0.58, 0.11], [s * 0.4, 0.96, 0.16], 0.1, 0.065),
      );
    emit(owner, "cocApex", ellipsoid([0, -0.84, 0.02], [0.13, 0.14, 0.14]));
  }
  function occiput(owner) {
    emit(owner, "occBase", ellipsoid([0, 0, -0.08], [1.12, 0.2, 0.73]));
    for (const s of [-1, 1])
      emit(
        owner,
        "occCondyle",
        ellipsoid([s * 0.83, -0.2, -0.02], [0.22, 0.13, 0.29]),
      );
  }
  const half = (id) =>
    id.startsWith("L")
      ? 0.48
      : id.startsWith("T")
        ? 0.39
        : id.startsWith("C")
          ? 0.33
          : 0.42;
  function distance(a, b) {
    const t = jointType(a, b);
    if (t === "occipital") return 0.63;
    if (t === "atlantoaxial") return 0.77;
    if (t === "sacrococcygeal") return 2.04;
    if (b === "SAC") return half(a) + 1.16 + 0.17;
    return half(a) + half(b) + 0.18;
  }
  function makePoses() {
    const id = state.vertebra,
      items = [{ id, owner: "target", y: 0 }],
      a = above(id),
      b = below(id),
      e = (state.explode / 100) * 0.72;
    if (a && ["above", "both"].includes(state.assembly))
      items.push({ id: a, owner: "above", y: distance(a, id) + e });
    if (b && ["below", "both"].includes(state.assembly))
      items.push({ id: b, owner: "below", y: -distance(id, b) - e });
    return items;
  }
  function drawConnections() {
    const get = (owner) => poses.find((p) => p.owner === owner),
      pairs = [];
    if (get("above")) pairs.push([get("above"), get("target")]);
    if (get("below")) pairs.push([get("target"), get("below")]);
    for (const [a, b] of pairs) {
      const kind = jointType(a.id, b.id),
        mid = (a.y + b.y) / 2;
      if (kind === "occipital") {
        for (const s of [-1, 1])
          emit(
            "link",
            "facetLink",
            ellipsoid(
              [s * 0.84, (a.y - 0.3 + b.y + 0.29) / 2, 0.03],
              [0.2, 0.055, 0.24],
            ),
          );
        continue;
      }
      if (kind === "atlantoaxial") {
        for (const s of [-1, 1])
          emit(
            "link",
            "facetLink",
            ellipsoid(
              [s * 0.84, (a.y - 0.29 + b.y + 0.35) / 2, 0.08],
              [0.19, 0.05, 0.23],
            ),
          );
        path(
          "link",
          "ligament",
          [
            [-0.65, a.y - 0.02, -0.22],
            [-0.32, a.y - 0.02, -0.36],
            [0, a.y - 0.02, -0.37],
            [0.32, a.y - 0.02, -0.36],
            [0.65, a.y - 0.02, -0.22],
          ],
          0.048,
        );
        continue;
      }
      if (kind === "sacrococcygeal") {
        emit(
          "link",
          "disc",
          ellipsoid(
            [0, (a.y - 1.2 + b.y + 0.76) / 2, -0.08],
            [0.27, 0.055, 0.18],
          ),
        );
        continue;
      }
      const upperBottom = half(a.id),
        lowerTop = b.id === "SAC" ? 1.16 : half(b.id),
        y = (a.y - upperBottom + b.y + lowerTop) / 2,
        rx =
          Math.min(
            a.id.startsWith("L") ? 1.13 : a.id.startsWith("T") ? 0.84 : 0.69,
            b.id === "SAC"
              ? 0.92
              : b.id.startsWith("L")
                ? 1.13
                : b.id.startsWith("T")
                  ? 0.84
                  : 0.69,
          ) * 0.83;
      emit(
        "link",
        "disc",
        ellipsoid([0, y, -0.62], [rx, 0.087, rx * 0.63], 9, 23),
      );
      for (const s of [-1, 1]) {
        emit(
          "link",
          "facetLink",
          ellipsoid([s * rx * 0.94, y + 0.035, 0.7], [0.17, 0.058, 0.18]),
        );
        ring(
          "link",
          "interforamen",
          [s * (rx + 0.13), y, 0.25],
          0.15,
          0.22,
          0.034,
        );
      }
    }
  }
  function renderGuides() {
    // Guide meshes for empty spaces appear only when specifically selected.
    const owner = "target",
      id = state.vertebra,
      c = id.startsWith("L") ? 0.55 : 0.48;
    if (!["C1", "SAC", "COC"].includes(id)) {
      ring(owner, "foramen", [0, 0.07, 0.46], c, 0.43, 0.042);
      ring(owner, "canal", [0, 0.07, 0.46], c * 0.78, 0.32, 0.033);
      for (const s of [-1, 1]) {
        emit(
          owner,
          "incSup",
          ellipsoid([s * c * 0.91, 0.26, 0.12], [0.05, 0.05, 0.06]),
        );
        emit(
          owner,
          "incInf",
          ellipsoid([s * c * 0.91, -0.26, 0.12], [0.05, 0.05, 0.06]),
        );
      }
    }
    if (id === "C1")
      ring(owner, "atlasForamen", [0, 0.06, 0.23], 0.57, 0.75, 0.039);
  }
  function updateScale() {
    const worldY = poses.map((p) => p.y),
      min = Math.min(...worldY),
      max = Math.max(...worldY);
    bounds.center = [0, (min + max) / 2, 0];
    let spread = max - min;
    const sac = poses.some((p) => p.id === "SAC");
    let size = Math.max(spread + (sac ? 3.3 : 1.9), 3.3);
    bounds.height = size;
    bounds.width = sac ? 4.7 : 4.4;
  }

  function build() {
    grouped.clear();
    poses = makePoses();
    for (const p of poses) {
      if (p.id === "OCC") occiput(p.owner);
      else if (p.id === "C1") atlas(p.owner);
      else if (p.id === "SAC") sacrum(p.owner);
      else if (p.id === "COC") coccyx(p.owner);
      else typical(p.id, p.owner);
    }
    drawConnections();
    renderGuides();
    updateScale();
  }
  return {
    build,
    get grouped() {
      return grouped;
    },
    get poses() {
      return poses;
    },
    get bounds() {
      return bounds;
    },
  };
}
