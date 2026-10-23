// WebGL2 renderer for the page-transition sheet's torn edges. The sheet element is clipped with
// clip-path (the straight edge, also the no-WebGL fallback); this shader eats into that edge to make
// it look torn. Technique after Carter Ogunsola's veil (Design References/carterogunsola.com/
// Page Transition — Torn Paper Veil): edges deform only mid-flight (a sin(progress·π) envelope keeps
// rest states flat), two decorrelated limits per edge leave a strip of fibrous pulp between sheet and
// page, and the torn sheet casts a soft shadow. Written independently; simplified.

const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 uRes;       // drawing buffer px
uniform float uTop;      // clip top inset, device px (cover: vh → 0)
uniform float uBot;      // clip bottom inset, device px (reveal: 0 → vh)
uniform float uTime;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uPulp;
uniform float uDot;      // halftone pitch, device px
uniform sampler2D uFiber;

out vec4 outColor;

const float PI = 3.14159265;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
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
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += (noise(p) - 0.5) * a;
    p = r * p * 2.02;
    a *= 0.5;
  }
  return v;
}

// How far (px) a torn limit sits behind its straight clip line at horizontal position u.
float tear(float u, float env, float travel, float seed, float vh) {
  float belly = 0.16 * sin(travel * PI);
  float rip = fbm(vec2(u * 3.2 + uTime * 0.1, seed + uTime * 0.25)) * 0.11;
  float roll = (noise(vec2(u * 1.3 - uTime * 0.2, seed + 5.0)) - 0.5) * 0.16;
  return max((belly + rip + roll) * env, 0.0) * vh;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float vh = uRes.y;
  float y = vh - px.y;           // top-down to match the clip insets
  float u = px.x / vh;

  float pTop = clamp(1.0 - uTop / vh, 0.0, 1.0);
  float pBot = clamp(uBot / vh, 0.0, 1.0);
  float envTop = sin(pTop * PI);
  float envBot = pow(sin(pBot * PI), 0.6);
  float stripTop = 0.06 * envTop * vh;
  float stripBot = 0.075 * envBot * vh;

  // Leading (top) edge of a cover and trailing (bottom) edge of a reveal: sheet limit + pulp limit.
  float sheetTop = tear(u, envTop, uTop / vh, 3.7, vh) + stripTop;
  float pulpTop = min(tear(u + 1.7, envTop, uTop / vh, 11.3, vh), sheetTop - 1.0);
  float bottomLine = vh - uBot;
  float sheetBot = tear(u, envBot, 1.0 - uBot / vh, 23.1, vh) * 1.1 + stripBot;
  float pulpBot = min(tear(u + 1.7, envBot, 1.0 - uBot / vh, 31.9, vh) * 1.1, sheetBot - 1.0);

  float inSheet = min((y - uTop) - sheetTop, (bottomLine - y) - sheetBot);
  float inPulp = min((y - uTop) - pulpTop, (bottomLine - y) - pulpBot);

  if (inPulp < 0.0) {
    // Beyond the tear: the page shows through, with the sheet's soft cast shadow.
    float shade = exp(inPulp / (vh * 0.018)) * 0.09;
    outColor = vec4(0.0, 0.0, 0.0, shade);
    return;
  }

  if (inSheet < 0.0) {
    // Torn pulp: fibre texture luminance, tinted toward a lighter stock, darker lip at the sheet.
    float lum = dot(texture(uFiber, vec2(u * 1.3 + uTime * 0.015, y / vh * 1.3 - uTime * 0.01)).rgb, vec3(0.3333));
    float t = 0.45 + clamp((lum - 0.55) * 1.5, 0.0, 1.0) * 0.5;
    vec3 col = mix(uPaper, uPulp, t);
    col *= mix(1.0, 0.9, smoothstep(-3.0, 0.0, inSheet));
    outColor = vec4(col, 1.0);
    return;
  }

  // Solid sheet: texture fixed to the viewport so the curtain unrolls in place rather than sliding.
  vec2 sp = vec2(u, y / vh);
  float grain = (noise(sp * 820.0) - 0.5) * 0.03 + (hash(px) - 0.5) * 0.02;
  float crumple = fbm(sp * 4.0);
  // A faint 45° halftone screen carries the crumple tone, so the sheet reads as printed stock.
  vec2 hp = mat2(0.7071, 0.7071, -0.7071, 0.7071) * px / uDot;
  float cell = length(fract(hp) - 0.5);
  float radius = mix(0.12, 0.5, clamp(0.5 + crumple * 2.2, 0.0, 1.0));
  float dots = smoothstep(radius + 0.12, radius - 0.12, cell);
  vec3 col = mix(uPaper, uInk, 0.06 + grain + dots * 0.035);
  col = mix(col, uInk, (1.0 - smoothstep(0.0, 2.5, inSheet)) * 0.05);   // hairline rim at the tear
  outColor = vec4(col, 1.0);
}`;

function fiberTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e9e6de";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 140; i++) {
    const shade = 210 + Math.floor(Math.random() * 30);
    ctx.fillStyle = `rgba(${shade},${shade - 3},${shade - 9},0.12)`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * size, Math.random() * size, 4 + Math.random() * 22, 2 + Math.random() * 8, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = 180 + Math.floor(Math.random() * 70);
    ctx.strokeStyle = `rgba(${shade},${shade - 4},${shade - 12},${0.12 + Math.random() * 0.25})`;
    ctx.lineWidth = Math.random() < 0.85 ? 1 : 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3 + Math.random() * 18, y + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }
  return canvas;
}

function toRgb(color: string): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.color = color;
  probe.style.display = "none";
  document.body.append(probe);
  const parts = getComputedStyle(probe).color.match(/[\d.]+/g)?.map(Number) ?? [230, 230, 230];
  probe.remove();
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

export class VeilPaper {
  private gl: WebGL2RenderingContext;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private canvas: HTMLCanvasElement;
  private start = performance.now();
  private dpr = 1;

  private constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
  }

  static create(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, depth: false, premultipliedAlpha: false });
    if (!gl) return null;
    const paper = new VeilPaper(canvas, gl);
    return paper.compile() ? paper : null;
  }

  private compile() {
    const { gl } = this;
    const shader = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = shader(gl.VERTEX_SHADER, VERTEX);
    const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return false;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);
    for (const name of ["uRes", "uTop", "uBot", "uTime", "uPaper", "uInk", "uPulp", "uDot", "uFiber"]) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fiberTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(this.uniforms.uFiber, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.readTheme();
    return true;
  }

  // Colours come from the CSS tokens, so the sheet follows the light/dark theme.
  readTheme() {
    const styles = getComputedStyle(document.documentElement);
    const paper = toRgb(styles.getPropertyValue("--veil-paper").trim() || "#e7e5df");
    const ink = toRgb(styles.getPropertyValue("--c-ink").trim() || "#161614");
    const light = paper[0] + paper[1] + paper[2] > ink[0] + ink[1] + ink[2];
    // Light stock tears a touch whiter; dark stock tears pale and loud.
    const pulp = light ? paper.map((c) => Math.min(1, c + 0.08)) : paper.map((c, i) => c + (ink[i] - c) * 0.55);
    const { gl, uniforms } = this;
    gl.uniform3fv(uniforms.uPaper, paper);
    gl.uniform3fv(uniforms.uInk, ink);
    gl.uniform3fv(uniforms.uPulp, pulp);
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.round(window.innerWidth * this.dpr);
    const height = Math.round(window.innerHeight * this.dpr);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  // top / bottom are the clip-path insets as fractions of the viewport height (0–1).
  render(top: number, bottom: number) {
    const { gl, uniforms, canvas } = this;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.uRes, canvas.width, canvas.height);
    gl.uniform1f(uniforms.uTop, top * canvas.height);
    gl.uniform1f(uniforms.uBot, bottom * canvas.height);
    gl.uniform1f(uniforms.uTime, (performance.now() - this.start) / 1000);
    gl.uniform1f(uniforms.uDot, 6 * this.dpr);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
