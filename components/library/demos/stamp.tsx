"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import styles from "./stamp.module.css";

// A postage-stamp frame with perforated edges on all four sides, around any content. After dqnamo's
// Stamp (Design References/dqnamo.com/Stamp). The perforations are one generated clip-path polygon:
// each hole is four points (flat, dip, flat, flat); counts and depth are clamped props.

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function perforations(horizontal: number, vertical: number, depth: number) {
  const H = clamp(Math.round(horizontal), 4, 32);
  const V = clamp(Math.round(vertical), 4, 40);
  const d = clamp(depth, 0, 10);
  const h = 100 / H;
  const v = 100 / V;
  const pts: [number, number][] = [[0, 0]];
  for (let i = 0; i < H; i++) {
    const s = i * h;
    pts.push([s + 0.25 * h, 0], [s + 0.5 * h, d], [s + 0.75 * h, 0], [s + h, 0]);
  }
  for (let i = 0; i < V; i++) {
    const s = i * v;
    pts.push([100, s + 0.25 * v], [100 - d, s + 0.5 * v], [100, s + 0.75 * v], [100, s + v]);
  }
  for (let i = 0; i < H; i++) {
    const s = 100 - i * h;
    pts.push([s - 0.25 * h, 100], [s - 0.5 * h, 100 - d], [s - 0.75 * h, 100], [s - h, 100]);
  }
  for (let i = 0; i < V; i++) {
    const s = 100 - i * v;
    pts.push([0, s - 0.25 * v], [d, s - 0.5 * v], [0, s - 0.75 * v], [0, s - v]);
  }
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(3)}% ${y.toFixed(3)}%`).join(", ")})`;
}

export function Stamp({
  paper = "#ffffff",
  ink = "#181713",
  padding = 13,
  horizontal = 12,
  vertical = 15,
  depth = 2.4,
  label,
  children,
}: {
  paper?: string;
  ink?: string;
  padding?: number;
  horizontal?: number;
  vertical?: number;
  depth?: number;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.shadow}>
      <div
        role="img"
        aria-label={label}
        className={styles.stamp}
        style={
          {
            "--paper": paper,
            "--ink": ink,
            padding,
            clipPath: perforations(horizontal, vertical, depth),
          } as CSSProperties
        }
      >
        <div className={styles.inner}>{children}</div>
      </div>
    </div>
  );
}

// A tiny pixel landscape: rows of palette indices, drawn as SVG rects.
const PALETTE = ["#8fd3ff", "#ffe08a", "#ff9a5c", "#6f8f4e", "#3f5f34", "#2f3a5f", "#ffffff"];
const ART = [
  "0000000000000000",
  "0000000000011000",
  "0000000000111100",
  "0066000000111100",
  "0666600000011000",
  "0000000000000000",
  "0000000000000000",
  "0000055000000000",
  "0000555500000000",
  "0005555550050000",
  "0055555555555000",
  "0555555555555500",
  "3333333333333333",
  "3334333333433333",
  "4444444444444444",
  "2222222222222222",
  "2222222222222222",
  "4444444444444444",
  "4444444444444444",
  "4444444444444444",
];

function PixelLandscape() {
  return (
    <svg viewBox="0 0 16 20" className={styles.art} shapeRendering="crispEdges">
      {ART.flatMap((row, y) => [...row].map((c, x) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PALETTE[+c]} />))}
    </svg>
  );
}

export default function StampDemo() {
  const [holes, setHoles] = useState(12);
  return (
    <div className={styles.stage}>
      <div className={styles.tilt}>
        <Stamp label="Stamp: pixel landscape, 50 cents" horizontal={holes} vertical={Math.round(holes * 1.25)}>
          <PixelLandscape />
          <p className={styles.caption}>
            <span>Singapore</span>
            <span>50¢</span>
          </p>
        </Stamp>
      </div>
      <label className={styles.control}>
        <span>Perforations</span>
        <input type="range" min={4} max={24} value={holes} onChange={(event) => setHoles(+event.target.value)} />
      </label>
    </div>
  );
}
