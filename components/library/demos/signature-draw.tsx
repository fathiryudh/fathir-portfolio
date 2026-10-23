"use client";

import { useEffect, useRef, useState } from "react";
import Signature, { type SignatureData } from "@/components/animations/signature";
import { MY_SIGNATURE } from "@/components/animations/my-signature";
import styles from "./signature-draw.module.css";

// Sign, then watch it write itself back. Pointer samples become smoothed quadratic strokes; the
// playback is the line-draw from dqnamo's Animated Signature (Design References/dqnamo.com/Animated
// Signature): pathLength=1 + dashoffset 1 → 0, one stroke after another, each timed by its length.

type Point = { x: number; y: number };

// Wide pad on desktop, a taller one on phones so there's room to sign.
const WIDE = { width: 900, height: 420 };
const TALL = { width: 600, height: 560 };
const STROKE_WIDTH = 14;
const MIN_POINT_DISTANCE = 2;
const AUTOPLAY_AFTER = 900; // ms after the pen lifts with no new stroke
const SECONDS_PER_1000 = 1.1; // playback speed: seconds per 1000 units of ink

const round = (value: number) => Math.round(value * 10) / 10;

// Quadratic curves through each sample's midpoints: smooth, and still passes near every point.
function toPathData(points: Point[]) {
  const [first] = points;
  if (points.length === 1) return `M${round(first.x)} ${round(first.y)} L${round(first.x + 0.1)} ${round(first.y)}`;
  let d = `M${round(first.x)} ${round(first.y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q${round(points[i].x)} ${round(points[i].y)} ${round(midX)} ${round(midY)}`;
  }
  const last = points[points.length - 1];
  return `${d} L${round(last.x)} ${round(last.y)}`;
}

function strokeLength(points: Point[]) {
  let length = 0;
  for (let i = 1; i < points.length; i++) length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  return Math.max(length, 1);
}

function toSignatureData(strokes: Point[][], pad: typeof WIDE): SignatureData {
  return {
    viewBox: `0 0 ${pad.width} ${pad.height}`,
    strokes: strokes.map((points) => ({ d: toPathData(points), length: round(strokeLength(points)) })),
  };
}

export default function SignatureDrawDemo() {
  const padRef = useRef<SVGSVGElement>(null);
  const currentRef = useRef<Point[] | null>(null);
  const timer = useRef(0);
  const [pad, setPad] = useState(WIDE);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [current, setCurrent] = useState<Point[] | null>(null);
  const [playing, setPlaying] = useState<{ data: SignatureData; run: number } | null>(
    MY_SIGNATURE ? { data: MY_SIGNATURE, run: 0 } : null,
  );

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 600px)");
    const pick = () => {
      setPad(narrow.matches ? TALL : WIDE);
      setStrokes([]);
    };
    pick();
    narrow.addEventListener("change", pick);
    return () => {
      narrow.removeEventListener("change", pick);
      clearTimeout(timer.current);
    };
  }, []);

  const play = (data: SignatureData) => setPlaying((previous) => ({ data, run: (previous?.run ?? 0) + 1 }));

  // Map through the SVG's own screen transform, so the ink lands exactly under the pointer.
  const toPoint = (event: React.PointerEvent<SVGSVGElement>): Point => {
    const svg = padRef.current!;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: point.x, y: point.y };
  };

  const onDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    clearTimeout(timer.current);
    // Drawing over the sample signature starts fresh; drawing over your own replay adds to it.
    if (playing) {
      if (playing.data === MY_SIGNATURE) setStrokes([]);
      setPlaying(null);
    }
    currentRef.current = [toPoint(event)];
    setCurrent(currentRef.current);
  };

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const points = currentRef.current;
    if (!points) return;
    const point = toPoint(event);
    const last = points[points.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < MIN_POINT_DISTANCE) return;
    currentRef.current = [...points, point];
    setCurrent(currentRef.current);
  };

  const onUp = () => {
    const points = currentRef.current;
    if (!points) return;
    currentRef.current = null;
    const next = [...strokes, points];
    setStrokes(next);
    setCurrent(null);
    timer.current = window.setTimeout(() => play(toSignatureData(next, pad)), AUTOPLAY_AFTER);
  };

  const total = playing ? playing.data.strokes.reduce((sum, stroke) => sum + stroke.length, 0) : 0;
  const duration = Math.min(4, Math.max(1.2, (total / 1000) * SECONDS_PER_1000));

  return (
    <div className={styles.stage}>
      <div className={styles.pad} style={{ "--pad-ratio": `${pad.width} / ${pad.height}`, "--pad-w": pad.width, "--pad-h": pad.height } as React.CSSProperties}>
        <svg
          ref={padRef}
          className={styles.surface}
          viewBox={`0 0 ${pad.width} ${pad.height}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label="Signature pad: draw with your mouse, trackpad or finger"
          role="img"
        >
          <line className={styles.baseline} x1="60" x2={pad.width - 60} y1={pad.height * 0.76} y2={pad.height * 0.76} />
          {!playing &&
            [...strokes, ...(current ? [current] : [])].map((points, index) => (
              <path key={index} className={styles.ink} d={toPathData(points)} strokeWidth={STROKE_WIDTH} />
            ))}
        </svg>
        {playing && (
          <div className={styles.playback} aria-hidden="true">
            <Signature
              key={playing.run}
              viewBox={playing.data.viewBox}
              strokes={playing.data.strokes}
              strokeWidth={STROKE_WIDTH}
              duration={duration}
            />
          </div>
        )}
        {!playing && !strokes.length && !current && <p className={styles.prompt}>Sign here</p>}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          disabled={!strokes.length && !playing}
          onClick={() => {
            clearTimeout(timer.current);
            play(strokes.length ? toSignatureData(strokes, pad) : playing!.data);
          }}
        >
          Play
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!strokes.length && !playing}
          onClick={() => {
            clearTimeout(timer.current);
            setStrokes([]);
            setPlaying(null);
          }}
        >
          Clear
        </button>
      </div>
      <p className={styles.hint}>Draw a signature, lift the pen, and it writes itself back</p>
    </div>
  );
}
