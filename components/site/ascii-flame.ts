// ASCII fire for the loader and the page transition: red, orange, yellow and white-hot flames around a
// black core (Getsuga Tensho). It is a cellular fire (the classic "Doom fire" spread) drawn as characters on a canvas: heat is
// fed in along the bottom row, each cell takes the heat of a cell below it (pushed sideways by gusting
// wind) minus an uneven decay, and the heat picks the glyph and the colour.
//
// The fire is also the loading bar. `progress` (0 to 1) is how far across the bottom it has caught,
// hottest at the burning front like a lit fuse. `level` above 1 is the release: the whole width
// erupts and the flames climb to the top of the screen.

const GLYPHS = " .'`;!|iIl1*#%@"; // vertical strokes read as licks, not bands
// Cold to hot: dark ember, red, orange, yellow, white-hot, and the very hottest core burns black,
// so each flame is a black heart ringed in white, yellow, orange and red.
const COLORS = [
  "#2a0303", "#6b0808", "#c0110a", "#ff2a14", "#ff5a0a", "#ff8c00",
  "#ffb800", "#ffe14a", "#fff6d8", "#ffffff", "#3a0d06", "#0a0000",
];
const FPS = 30;
const LITE_FPS = 20;
const STEPS = 3; // simulation steps per drawn frame, so heat climbs ~90 rows a second

import { isLite } from "@/components/site/lite";

export type FlameState = { progress: number; level: number };

// One simulation step. Exported so the rule stays a plain function of its inputs.
export function stepFire(
  heat: Float32Array,
  cols: number,
  rows: number,
  source: (x: number) => number,
  decay: number,
  wind = 0,
  rand = Math.random,
) {
  const bottom = (rows - 1) * cols;
  for (let x = 0; x < cols; x++) heat[bottom + x] = source(x);
  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = Math.round(rand() * 4 - 2 + wind);
      const from = heat[(y + 1) * cols + Math.min(cols - 1, Math.max(0, x + dx))];
      // Either keep the heat or drop a big step: the uneven decay is what makes separate tongues.
      heat[y * cols + x] = Math.max(0, from - (rand() < 0.45 ? 0 : rand() * decay * 2.2));
    }
  }
}

export function startFlame(canvas: HTMLCanvasElement, state: () => FlameState) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  // Lite: bigger characters (a quarter of the cells), 1x pixels and a lower frame rate.
  const lite = isLite();
  const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  const fps = lite ? LITE_FPS : FPS;
  // Sized to the canvas box: the loader's is full screen, the transition wall's is a strip above it.
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  const size = (width < 700 ? 10 : 13) * (lite ? 1.6 : 1);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.scale(dpr, dpr);
  ctx.font = `600 ${size}px ${getComputedStyle(document.body).getPropertyValue("--font-mono") || "monospace"}`;
  ctx.textBaseline = "top";

  // Cells are the font's own advance width, so a whole row can be drawn as one string and still line up.
  const cellW = ctx.measureText("0").width || size * 0.62;
  const cellH = size * 1.05;
  const cols = Math.ceil(width / cellW);
  const rows = Math.ceil(height / cellH);
  const heat = new Float32Array(cols * rows);
  const shade = new Uint8Array(cols * rows); // colour index per cell this frame, 255 = empty
  const line: string[] = new Array(cols).fill(" ");

  let frame = 0;
  let last = 0;
  let warm = 40; // the first frame runs this many extra steps, so a fire lit mid-move is already tall
  let raf = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (now - last < 1000 / fps) return;
    last = now;
    frame++;

    const { progress, level } = state();
    const erupt = Math.max(0, level - 1); // 0 while loading, 1 at the peak of the release
    const reach = 0.42 + erupt * 1.25; // share of the screen the flames can climb
    const decay = 1.6 / (rows * reach);
    const t = frame * 0.09;
    const wind = Math.sin(t * 0.7) * Math.sin(t * 0.23 + 1) * 1.6; // gusts that bend the whole fire
    const source = (x: number) => {
      const u = x / cols;
      if (u > progress && erupt === 0) return 0; // not caught yet
      const front = Math.exp(-(((progress - u) / 0.05) ** 2)); // the burning edge of the bar
      const flicker = 0.62 + 0.25 * Math.sin(u * 31 + t * 1.3) * Math.sin(u * 9 - t * 2.1);
      const spurt = Math.random() < 0.035 ? 0.45 : 0;
      return Math.min(1, flicker + front * 0.5 + spurt + erupt);
    };
    for (let i = 0; i < STEPS + warm; i++) stepFire(heat, cols, rows, source, decay, wind);
    warm = 0;

    for (let i = 0; i < heat.length; i++) {
      const h = heat[i];
      // A random nudge of up to ~1.5 steps either way, so neighbouring colours bleed into each other
      // instead of stacking in flat stripes.
      shade[i] = h > 0.05 ? Math.max(0, Math.min(COLORS.length - 1, (h * COLORS.length + (Math.random() - 0.5) * 3) | 0)) : 255;
    }

    // One fillText per colour per row (about rows x colours calls) instead of one per character.
    ctx.clearRect(0, 0, width, height);
    for (let y = 0; y < rows; y++) {
      const start = y * cols;
      for (let b = 0; b < COLORS.length; b++) {
        let any = false;
        for (let x = 0; x < cols; x++) {
          if (shade[start + x] === b) {
            line[x] = GLYPHS[Math.min(GLYPHS.length - 1, (heat[start + x] * GLYPHS.length) | 0)];
            any = true;
          } else line[x] = " ";
        }
        if (!any) continue;
        ctx.fillStyle = COLORS[b];
        ctx.fillText(line.join(""), 0, y * cellH);
      }
    }
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
