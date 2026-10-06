import { add, sub, mul, dot, cross, norm } from "../geometry/math.js";
import {
  activePart,
  visiblePart,
  opacityFor,
  separationOffset,
  guideParts,
  hasSelection,
} from "./visibility.js";
export function createRenderer(state, scene) {
  const $ = (id) => document.getElementById(id);
  const gl = new URLSearchParams(location.search).has("canvas")
    ? null
    : $("gl").getContext("webgl", {
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
      });
  const ctx2d = gl ? null : $("gl").getContext("2d");
  let fallbackFaces = [];
  let program = null,
    u = {},
    pickBuffer = null,
    pickTexture = null,
    pickDepth = null,
    meshes = [],
    yaw = 0.62,
    pitch = 0.37;
  function matMul(a, b) {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col++)
      for (let row = 0; row < 4; row++)
        for (let k = 0; k < 4; k++)
          out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
    return out;
  }
  const ident = () =>
    new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  function translate(x, y, z) {
    const m = ident();
    m[12] = x;
    m[13] = y;
    m[14] = z;
    return m;
  }
  function rotateY(a) {
    const c = Math.cos(a),
      s = Math.sin(a);
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  }
  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2),
      m = new Float32Array(16);
    m[0] = f / aspect;
    m[5] = f;
    m[10] = (far + near) / (near - far);
    m[11] = -1;
    m[14] = (2 * far * near) / (near - far);
    return m;
  }
  function lookAt(eye, target, up) {
    const z = norm(sub(eye, target)),
      x = norm(cross(up, z)),
      y = cross(z, x);
    const m = ident();
    m[0] = x[0];
    m[1] = y[0];
    m[2] = z[0];
    m[4] = x[1];
    m[5] = y[1];
    m[6] = z[1];
    m[8] = x[2];
    m[9] = y[2];
    m[10] = z[2];
    m[12] = -dot(x, eye);
    m[13] = -dot(y, eye);
    m[14] = -dot(z, eye);
    return m;
  }
  function createShader(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  function initGL() {
    if (!gl) {
      document.querySelector(".stage-help").innerHTML =
        "სარეზერვო 3D ხედი (Canvas)<br>↔ დატრიალება · R: საწყისი ხედი";
      return;
    }
    const vs = createShader(
      gl.VERTEX_SHADER,
      `attribute vec3 aPos;attribute vec3 aNormal;uniform mat4 uMVP;uniform mat4 uModel;varying vec3 vNormal;void main(){gl_Position=uMVP*vec4(aPos,1.);vNormal=mat3(uModel)*aNormal;}`,
    );
    const fs = createShader(
      gl.FRAGMENT_SHADER,
      `precision mediump float;uniform vec3 uColor;uniform float uAlpha;uniform bool uPick;varying vec3 vNormal;void main(){if(uPick){gl_FragColor=vec4(uColor,1.);return;}vec3 n=normalize(vNormal);vec3 key=normalize(vec3(-.55,.82,1.0));vec3 fill=normalize(vec3(.75,.25,-.65));float a=max(dot(n,key),0.0);float b=max(dot(n,fill),0.0);float rim=pow(1.0-abs(n.z),2.0);float lighting=.43+.44*a+.16*b+.08*rim;vec3 c=uColor*lighting+vec3(.025,.035,.05)*rim;gl_FragColor=vec4(c,uAlpha);}`,
    );
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    u = {
      pos: gl.getAttribLocation(program, "aPos"),
      normal: gl.getAttribLocation(program, "aNormal"),
      mvp: gl.getUniformLocation(program, "uMVP"),
      model: gl.getUniformLocation(program, "uModel"),
      color: gl.getUniformLocation(program, "uColor"),
      alpha: gl.getUniformLocation(program, "uAlpha"),
      pick: gl.getUniformLocation(program, "uPick"),
    };
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.06, 0.11, 0.18, 1);
  }
  function compileMeshes() {
    if (!gl) return;
    for (const m of meshes) {
      gl.deleteBuffer(m.posBuffer);
      gl.deleteBuffer(m.normBuffer);
    }
    meshes = [];
    const smooth = new Map();
    for (const tris of scene.grouped.values())
      for (const tri of tris) {
        const n = cross(sub(tri[1], tri[0]), sub(tri[2], tri[0]));
        for (const p of tri) {
          const key = p.join(",");
          smooth.set(key, add(smooth.get(key) || [0, 0, 0], n));
        }
      }
    for (const [key, tris] of scene.grouped) {
      if (!tris.length) continue;
      const [owner, part] = key.split("|"),
        pos = [],
        normal = [];
      for (const tri of tris) {
        const n = norm(cross(sub(tri[1], tri[0]), sub(tri[2], tri[0])));
        for (const p of tri) {
          pos.push(...p);
          normal.push(...norm(smooth.get(p.join(",")) || n));
        }
      }
      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
      const normBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
      meshes.push({
        owner,
        part,
        posBuffer,
        normBuffer,
        count: pos.length / 3,
        pick: meshes.length + 1,
      });
    }
  }
  function modelFor(owner, part) {
    const p = scene.poses.find((x) => x.owner === owner),
      cy = p?.y || 0;
    let m = translate(0, cy, 0);
    if (
      p?.id === "C1" &&
      scene.poses.some((x) => x.id === "C2") &&
      state.rotation !== 0
    ) {
      const turn = matMul(
        translate(0, 0, -0.63),
        matMul(
          rotateY((state.rotation * Math.PI) / 180),
          translate(0, 0, 0.63),
        ),
      );
      m = matMul(m, turn);
    }
    return matMul(m, translate(...separationOffset(state, { owner, part })));
  }
  function cameraMats() {
    const width = $("gl").width,
      height = $("gl").height,
      base = Math.max(
        scene.bounds.height * 1.5,
        scene.bounds.width * 1.33,
        6.1,
      ),
      dist = base / state.zoom,
      eye = [
        Math.sin(yaw) * Math.cos(pitch) * dist,
        scene.bounds.center[1] + Math.sin(pitch) * dist,
        Math.cos(yaw) * Math.cos(pitch) * dist,
      ];
    return {
      vp: matMul(
        perspective(Math.PI / 4, width / height, 0.05, 150),
        lookAt(eye, scene.bounds.center, [0, 1, 0]),
      ),
    };
  }
  const isActive = (m) => activePart(state, m);
  function colorFor(m) {
    if (isActive(m)) return [1.0, 0.78, 0.31];
    if (m.part === "disc") return [0.66, 0.57, 0.9];
    if (m.part === "facetLink" || m.part === "ligament")
      return [0.34, 0.79, 0.65];
    if (
      m.part === "interforamen" ||
      m.part === "transForamen" ||
      m.part === "atlasTransForamen" ||
      m.part === "sacForamina" ||
      m.part === "sacCanal" ||
      m.part === "foramen" ||
      m.part === "canal"
    )
      return [0.31, 0.76, 0.88];
    if (m.owner === "target") return [0.9, 0.78, 0.6];
    return [0.42, 0.63, 0.76];
  }
  const isGuide = (m) => guideParts.has(m.part);
  const meshVisible = (m) => visiblePart(state, m);
  function drawMesh(m, vp, picking = false, alpha = 1) {
    const model = modelFor(m.owner, m.part),
      mvp = matMul(vp, model);
    gl.uniformMatrix4fv(u.mvp, false, mvp);
    gl.uniformMatrix4fv(u.model, false, model);
    gl.uniform3fv(
      u.color,
      picking
        ? [
            (m.pick & 255) / 255,
            ((m.pick >> 8) & 255) / 255,
            ((m.pick >> 16) & 255) / 255,
          ]
        : colorFor(m),
    );
    gl.uniform1f(u.alpha, alpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.posBuffer);
    gl.enableVertexAttribArray(u.pos);
    gl.vertexAttribPointer(u.pos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.normBuffer);
    gl.enableVertexAttribArray(u.normal);
    gl.vertexAttribPointer(u.normal, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, m.count);
  }
  function draw() {
    if (!gl) {
      drawFallback();
      return;
    }
    const dpr = Math.min(2, window.devicePixelRatio || 1),
      r = cvsRect(),
      width = Math.max(1, Math.round(r.width * dpr)),
      height = Math.max(1, Math.round(r.height * dpr));
    if ($("gl").width !== width || $("gl").height !== height) {
      $("gl").width = width;
      $("gl").height = height;
      gl.viewport(0, 0, width, height);
      rebuildPickBuffer();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform1i(u.pick, false);
    const { vp } = cameraMats();
    const active = meshes.filter((m) => meshVisible(m) && isActive(m)),
      others = meshes.filter((m) => meshVisible(m) && !isActive(m));
    // Render transparent inactive parts without depth writes, then active parts in front.
    const faded =
      hasSelection(state) && state.dim && state.contextOpacity < 100;
    if (faded) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      for (const m of others) drawMesh(m, vp, false, opacityFor(state, m));
      gl.depthMask(true);
      gl.disable(gl.BLEND);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      for (const m of active) drawMesh(m, vp, false, 1);
    } else for (const m of [...others, ...active]) drawMesh(m, vp, false, 1);
  }

  // Offline Canvas software renderer: preserves orbit, highlights and geometry picking when WebGL is disabled.
  function softwareTransform(point, owner, part) {
    const pose = scene.poses.find((p) => p.owner === owner);
    let [x, y, z] = add(point, separationOffset(state, { owner, part }));
    if (
      pose?.id === "C1" &&
      scene.poses.some((p) => p.id === "C2") &&
      state.rotation
    ) {
      const a = (state.rotation * Math.PI) / 180,
        t = z + 0.63;
      const nx = x * Math.cos(a) + t * Math.sin(a);
      z = -x * Math.sin(a) + t * Math.cos(a) - 0.63;
      x = nx;
    }
    return [x, y + (pose?.y || 0) - scene.bounds.center[1], z];
  }
  function projectFallback(point) {
    const [x, y, z] = point,
      ca = Math.cos(yaw),
      sa = Math.sin(yaw),
      xx = x * ca + z * sa,
      zz = -x * sa + z * ca,
      cp = Math.cos(pitch),
      sp = Math.sin(pitch),
      yy = y * cp - zz * sp,
      depth = y * sp + zz * cp,
      base = Math.max(
        scene.bounds.height * 1.5,
        scene.bounds.width * 1.33,
        6.1,
      ),
      dist = base / state.zoom,
      px =
        ((Math.min($("gl").width, $("gl").height) * 0.82) / 4.0) * (6.1 / dist),
      p = dist / (dist - depth * 0.6);
    return {
      x: $("gl").width * 0.5 + xx * px * p,
      y: $("gl").height * 0.52 - yy * px * p,
      depth,
    };
  }
  function drawFallback() {
    const canvas = $("gl"),
      rect = cvsRect(),
      dpr = Math.min(2, window.devicePixelRatio || 1),
      width = Math.max(1, Math.round(rect.width * dpr)),
      height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const grad = ctx2d.createRadialGradient(
      width * 0.5,
      height * 0.38,
      5,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.7,
    );
    grad.addColorStop(0, "#24435a");
    grad.addColorStop(0.55, "#132b3d");
    grad.addColorStop(1, "#091522");
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, width, height);
    const all = [];
    for (const [key, tris] of scene.grouped) {
      const [owner, part] = key.split("|"),
        m = { owner, part };
      if (!meshVisible(m)) continue;
      const highlight = isActive(m);
      const base = isGuide(m)
        ? [86, 216, 237]
        : highlight
          ? [255, 215, 108]
          : part === "disc"
            ? [185, 166, 235]
            : part === "facetLink" || part === "ligament"
              ? [130, 232, 176]
              : owner === "target"
                ? [240, 207, 164]
                : [141, 194, 225];
      for (const tri of tris) {
        const pts = tri.map((v) => softwareTransform(v, owner, part)),
          p = pts.map(projectFallback),
          normal = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0]))),
          light = 0.47 + 0.51 * Math.abs(dot(normal, norm([-0.45, 0.8, 1]))),
          rgb = base.map((n) =>
            Math.round(n * (highlight ? Math.min(1.1, light + 0.17) : light)),
          );
        all.push({
          p,
          depth: p.reduce((s, v) => s + v.depth, 0) / 3,
          owner,
          part,
          highlight,
          rgb,
        });
      }
    }
    all.sort((a, b) => a.depth - b.depth);
    fallbackFaces = all
      .slice()
      .reverse()
      .filter((m) => opacityFor(state, m) > 0);
    if (hasSelection(state) && state.dim && state.contextOpacity < 100)
      fallbackFaces.sort((a, b) => Number(b.highlight) - Number(a.highlight));
    function paint(t) {
      const v = t.p,
        c = t.rgb;
      ctx2d.beginPath();
      ctx2d.moveTo(v[0].x, v[0].y);
      ctx2d.lineTo(v[1].x, v[1].y);
      ctx2d.lineTo(v[2].x, v[2].y);
      ctx2d.closePath();
      ctx2d.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${opacityFor(state, t)})`;
      ctx2d.fill();
    }
    if (hasSelection(state) && state.dim && state.contextOpacity < 100) {
      all.filter((p) => !p.highlight).forEach(paint);
      all.filter((p) => p.highlight).forEach(paint);
    } else all.forEach(paint);
  }
  function pickFallback(e) {
    const r = cvsRect(),
      point = {
        x: ((e.clientX - r.left) * $("gl").width) / r.width,
        y: ((e.clientY - r.top) * $("gl").height) / r.height,
      };
    const side = (p, q, z) =>
      (p.x - z.x) * (q.y - z.y) - (q.x - z.x) * (p.y - z.y);
    for (const m of fallbackFaces) {
      const [a, b, c] = m.p,
        v1 = side(point, a, b),
        v2 = side(point, b, c),
        v3 = side(point, c, a);
      if (!((v1 < 0 || v2 < 0 || v3 < 0) && (v1 > 0 || v2 > 0 || v3 > 0)))
        return m;
    }
    return null;
  }

  function cvsRect() {
    return $("gl").getBoundingClientRect();
  }
  function rebuildPickBuffer() {
    if (!gl) return;
    if (pickBuffer) {
      gl.deleteFramebuffer(pickBuffer);
      gl.deleteTexture(pickTexture);
      gl.deleteRenderbuffer(pickDepth);
    }
    pickBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuffer);
    pickTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, pickTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      $("gl").width,
      $("gl").height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      pickTexture,
      0,
    );
    pickDepth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, pickDepth);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      $("gl").width,
      $("gl").height,
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      pickDepth,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  function pick(e) {
    if (!gl) return pickFallback(e);
    const rect = cvsRect(),
      px = Math.floor(((e.clientX - rect.left) * $("gl").width) / rect.width),
      py = Math.floor(
        ((rect.bottom - e.clientY) * $("gl").height) / rect.height,
      );
    if (px < 0 || py < 0 || px >= $("gl").width || py >= $("gl").height)
      return null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuffer);
    gl.viewport(0, 0, $("gl").width, $("gl").height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1i(u.pick, true);
    const { vp } = cameraMats();
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    for (const m of meshes) {
      if (!meshVisible(m) || opacityFor(state, m) === 0) continue;
      if (
        hasSelection(state) &&
        state.dim &&
        state.contextOpacity < 100 &&
        isActive(m)
      )
        continue;
      drawMesh(m, vp, true);
    }
    if (hasSelection(state) && state.dim && state.contextOpacity < 100) {
      gl.clear(gl.DEPTH_BUFFER_BIT);
      for (const m of meshes)
        if (meshVisible(m) && isActive(m)) drawMesh(m, vp, true);
    }
    const pixel = new Uint8Array(4);
    gl.readPixels(px, py, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.uniform1i(u.pick, false);
    gl.clearColor(0.06, 0.11, 0.18, 1);
    draw();
    const n = pixel[0] + pixel[1] * 256 + pixel[2] * 65536;
    return meshes.find((m) => m.pick === n) || null;
  }
  function setView(v) {
    if (v === "bottom") {
      yaw = 0.11;
      pitch = -1.48;
    }
    if (v === "top") {
      yaw = 0.11;
      pitch = 1.48;
    }
    if (v === "front") {
      yaw = Math.PI;
      pitch = 0.02;
    }
    if (v === "back") {
      yaw = 0;
      pitch = 0.02;
    }
    if (v === "side") {
      yaw = 1.57;
      pitch = 0.06;
    }
    if (v === "reset") {
      yaw = 0.62;
      pitch = 0.37;
      state.zoom = 1;
      $("zoom").value = 100;
      $("zoomVal").textContent = "100%";
    }
    draw();
  }

  function orbit(dx, dy) {
    yaw += dx * 0.01;
    pitch = Math.max(-1.43, Math.min(1.49, pitch - dy * 0.01));
    draw();
  }
  return { init: initGL, compileMeshes, draw, pick, setView, orbit };
}
