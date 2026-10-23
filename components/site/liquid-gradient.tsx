"use client";

import { useEffect, useRef } from "react";

// A living gradient behind the footer panel, adapted from Balky's footer atmosphere band
// (Design References/balky.studio/Footer): their Unicorn Studio stack of gradient + flow field +
// grain, hand-built here. Domain-warped noise gives the slow drift. On top of that a small
// low-res fluid sim (ping-ponged between two textures) stores velocity and accumulated
// displacement: the cursor stirs the velocity, the velocity carries itself forward and coasts,
// and the displacement it leaves behind keeps the colours smeared for a few seconds before they
// settle. The gradient is painted, blurred, into a low-res buffer and scaled up with nearest
// sampling for a soft pixel-mosaic look. The CSS gradient underneath stays as the no-WebGL /
// reduced-motion fallback.

const SIM_SCALE = 0.25; // sim resolution relative to the canvas
const FORCE = 1.1; // fluid speed near the cursor, relative to cursor speed
const RADIUS = 0.016; // brush size (gaussian, panel-height units squared)
const VELOCITY_KEEP = 0.95; // per 60fps frame: how long the liquid coasts (lower = thicker)
const DISPLACEMENT_KEEP = 0.985; // per 60fps frame: how long the smear lingers before easing back
const PIXEL_SIZE = 7; // CSS px per mosaic cell
const BLUR = 0.035; // blur radius, panel-height units
const FLOW_SPEED = 2.5; // idle drift speed multiplier
const MAX_DPR = 1.5;

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// RGBA = velocity.xy, displacement.xy (uv units). Packed into 0..1 when float targets aren't
// available.
const SIM_FRAG = `
precision highp float;
uniform sampler2D u_prev;
uniform vec2 u_aspect;
uniform vec2 u_from;
uniform vec2 u_to;
uniform vec2 u_force;
uniform float u_active;
uniform float u_radius;
uniform float u_step;
uniform float u_velKeep;
uniform float u_dispKeep;
uniform float u_packed;
varying vec2 v_uv;

vec4 unpack(vec4 c) { return u_packed > 0.5 ? c * 2.0 - 1.0 : c; }
vec4 pack(vec4 v) { return u_packed > 0.5 ? clamp(v * 0.5 + 0.5, 0.0, 1.0) : v; }

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  // Self-advection: pull the state from where the liquid came from.
  vec2 vel = unpack(texture2D(u_prev, v_uv)).xy;
  vec4 a = unpack(texture2D(u_prev, v_uv - vel * u_step));
  vel = a.xy * u_velKeep;

  // Stir along the cursor's path this frame.
  float d = segment(v_uv * u_aspect, u_from * u_aspect, u_to * u_aspect);
  vel = mix(vel, u_force, exp(-d * d / u_radius) * u_active);

  vec2 disp = clamp(a.zw * u_dispKeep + vel * u_step, -1.0, 1.0);
  gl_FragColor = pack(vec4(vel, disp));
}
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform sampler2D u_sim;
uniform float u_packed;
uniform float u_blur;

const vec3 ORANGE = vec3(0.957, 0.490, 0.333);
const vec3 PINK = vec3(0.898, 0.541, 0.698);
const vec3 LAVENDER = vec3(0.620, 0.655, 0.973);
const vec3 GOLD = vec3(1.0, 0.745, 0.290);
const vec3 BLUE = vec3(0.294, 0.455, 1.0);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.0 + 17.0;
    a *= 0.5;
  }
  return v;
}

vec3 shade(vec2 uv, float t) {
  vec4 s = texture2D(u_sim, uv);
  vec2 disp = u_packed > 0.5 ? s.zw * 2.0 - 1.0 : s.zw;
  vec2 p = (uv - disp) * vec2(u_res.x / u_res.y, 1.0);

  // Domain-warped flow field.
  vec2 q = vec2(fbm(p * 0.85 + vec2(0.0, t * 0.05)), fbm(p * 0.85 + vec2(5.2, 1.3) - t * 0.04));
  vec2 r = vec2(fbm(p * 0.85 + 3.0 * q + vec2(1.7, 9.2) + t * 0.07),
                fbm(p * 0.85 + 3.0 * q + vec2(8.3, 2.8) - t * 0.06));
  float n = fbm(p * 0.8 + 2.5 * r);

  vec3 c = mix(ORANGE, PINK, smoothstep(0.25, 0.75, n));
  c = mix(c, LAVENDER, smoothstep(0.35, 0.85, r.x));
  c = mix(c, GOLD, smoothstep(0.55, 0.9, q.y) * 0.85);
  c = mix(c, BLUE, smoothstep(0.62, 0.95, r.y) * 0.55);
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 k = vec2(u_res.y / u_res.x, 1.0) * u_blur;

  // Centre plus a ring of six taps: a cheap soft blur at mosaic resolution.
  vec3 c = shade(uv, u_time) * 2.0;
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.0472;
    c += shade(uv + vec2(cos(a), sin(a)) * k, u_time);
  }
  c /= 8.0;

  c += (hash(gl_FragCoord.xy + fract(u_time) * 100.0) - 0.5) * 0.035;
  gl_FragColor = vec4(c, 1.0);
}
`;

const PRESENT_FRAG = `
precision highp float;
uniform sampler2D u_image;
varying vec2 v_uv;
void main() { gl_FragColor = texture2D(u_image, v_uv); }
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGLRenderingContext, vert: WebGLShader, frag: WebGLShader) {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.bindAttribLocation(program, 0, "a_pos");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer };

export default function LiquidGradient({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const simFrag = compile(gl, gl.FRAGMENT_SHADER, SIM_FRAG);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const presentFrag = compile(gl, gl.FRAGMENT_SHADER, PRESENT_FRAG);
    if (!vert || !simFrag || !frag || !presentFrag) return;
    const sim = link(gl, vert, simFrag);
    const program = link(gl, vert, frag);
    const present = link(gl, vert, presentFrag);
    if (!sim || !program || !present) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const at = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);
    const u = {
      prev: at(sim, "u_prev"),
      aspect: at(sim, "u_aspect"),
      from: at(sim, "u_from"),
      to: at(sim, "u_to"),
      force: at(sim, "u_force"),
      active: at(sim, "u_active"),
      radius: at(sim, "u_radius"),
      step: at(sim, "u_step"),
      velKeep: at(sim, "u_velKeep"),
      dispKeep: at(sim, "u_dispKeep"),
      simPacked: at(sim, "u_packed"),
      res: at(program, "u_res"),
      time: at(program, "u_time"),
      sim: at(program, "u_sim"),
      packed: at(program, "u_packed"),
      blur: at(program, "u_blur"),
      image: at(present, "u_image"),
    };

    // Half-float targets keep the sim smooth; fall back to 8-bit packed values without them.
    const halfFloat = gl.getExtension("OES_texture_half_float");
    const halfFloatLinear = gl.getExtension("OES_texture_half_float_linear");
    let texelType: number = halfFloat && halfFloatLinear ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;

    let targets: Target[] = [];
    let mosaic: Target | null = null;
    let simW = 1;
    let simH = 1;
    let cellsW = 1;
    let cellsH = 1;

    const deleteTarget = (target: Target) => {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    };

    const destroyTargets = () => {
      targets.forEach(deleteTarget);
      targets = [];
      if (mosaic) deleteTarget(mosaic);
      mosaic = null;
    };

    const createTarget = (type: number, w = simW, h = simH, filter: number = gl.LINEAR): Target | null => {
      const texture = gl.createTexture();
      const framebuffer = gl.createFramebuffer();
      if (!texture || !framebuffer) return null;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, type, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      if (ok) {
        const rest = type === gl.UNSIGNED_BYTE ? 0.5 : 0;
        gl.viewport(0, 0, w, h);
        gl.clearColor(rest, rest, rest, rest);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (ok) return { texture, framebuffer };
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(framebuffer);
      return null;
    };

    const buildTargets = () => {
      destroyTargets();
      for (let i = 0; i < 2; i++) {
        const target = createTarget(texelType);
        if (!target && texelType !== gl.UNSIGNED_BYTE) {
          texelType = gl.UNSIGNED_BYTE;
          return buildTargets();
        }
        if (target) targets.push(target);
      }
      mosaic = createTarget(gl.UNSIGNED_BYTE, cellsW, cellsH, gl.NEAREST);
      const packed = texelType === gl.UNSIGNED_BYTE ? 1 : 0;
      gl.useProgram(sim);
      gl.uniform1f(u.simPacked, packed);
      gl.useProgram(program);
      gl.uniform1f(u.packed, packed);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.max(1, Math.round(host.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(host.clientHeight * dpr));
      simW = Math.max(1, Math.round(canvas.width * SIM_SCALE));
      simH = Math.max(1, Math.round(canvas.height * SIM_SCALE));
      cellsW = Math.max(1, Math.ceil(host.clientWidth / PIXEL_SIZE));
      cellsH = Math.max(1, Math.ceil(host.clientHeight / PIXEL_SIZE));
      buildTargets();
      gl.useProgram(sim);
      gl.uniform2f(u.aspect, canvas.width / canvas.height, 1);
      gl.useProgram(program);
      gl.uniform2f(u.res, cellsW, cellsH);
      gl.uniform1f(u.blur, BLUR);
    };

    // Pointer in uv (0..1, origin bottom-left), sampled once per frame.
    const pointer = { x: 0, y: 0, px: 0, py: 0, inside: false, fresh: true };

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (rect.bottom - event.clientY) / rect.height;
      if (!pointer.inside || pointer.fresh) {
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        pointer.fresh = false;
      }
      pointer.inside = true;
    };

    const onLeave = () => {
      pointer.inside = false;
      pointer.fresh = true;
    };

    let raf = 0;
    let visible = false;
    let read = 0;
    let last = performance.now();
    let time = Math.random() * 100;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      time += dt * FLOW_SPEED;
      const step = Math.max(dt * 60, 0.01);

      if (targets.length === 2) {
        const dx = pointer.x - pointer.px;
        const dy = pointer.y - pointer.py;
        const moved = pointer.inside && (dx !== 0 || dy !== 0);

        gl.useProgram(sim);
        gl.bindFramebuffer(gl.FRAMEBUFFER, targets[1 - read].framebuffer);
        gl.viewport(0, 0, simW, simH);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, targets[read].texture);
        gl.uniform1i(u.prev, 0);
        gl.uniform2f(u.from, pointer.px, pointer.py);
        gl.uniform2f(u.to, pointer.x, pointer.y);
        gl.uniform2f(u.force, (dx / step) * FORCE, (dy / step) * FORCE);
        gl.uniform1f(u.active, moved ? 1 : 0);
        gl.uniform1f(u.radius, RADIUS);
        gl.uniform1f(u.step, step);
        gl.uniform1f(u.velKeep, Math.pow(VELOCITY_KEEP, step));
        gl.uniform1f(u.dispKeep, Math.pow(DISPLACEMENT_KEEP, step));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        read = 1 - read;
        pointer.px = pointer.x;
        pointer.py = pointer.y;
      }

      if (!mosaic) return;
      gl.useProgram(program);
      gl.bindFramebuffer(gl.FRAMEBUFFER, mosaic.framebuffer);
      gl.viewport(0, 0, cellsW, cellsH);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targets[read]?.texture ?? null);
      gl.uniform1i(u.sim, 0);
      gl.uniform1f(u.time, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.useProgram(present);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, mosaic.texture);
      gl.uniform1i(u.image, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.ready = "true";
      raf = requestAnimationFrame(frame);
    };

    const play = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });
    const ro = new ResizeObserver(resize);

    resize();
    io.observe(host);
    ro.observe(host);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      destroyTargets();
      gl.deleteProgram(sim);
      gl.deleteProgram(program);
      gl.deleteProgram(present);
      gl.deleteShader(vert);
      gl.deleteShader(simFrag);
      gl.deleteShader(frag);
      gl.deleteShader(presentFrag);
      gl.deleteBuffer(buffer);
      delete canvas.dataset.ready;
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
