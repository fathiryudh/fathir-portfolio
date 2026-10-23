"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Signature, { round, strokeLength, toPathData, type SignatureData } from "@/components/animations/signature";

type Point = { x: number; y: number };

const PAD_WIDTH = 900;
const PAD_HEIGHT = 420;
const STROKE_WIDTH = 14;
const MIN_POINT_DISTANCE = 2;

function toSignatureData(strokes: Point[][]): SignatureData {
  const all = strokes.flat();
  const minX = Math.min(...all.map((p) => p.x)) - STROKE_WIDTH;
  const minY = Math.min(...all.map((p) => p.y)) - STROKE_WIDTH;
  const maxX = Math.max(...all.map((p) => p.x)) + STROKE_WIDTH;
  const maxY = Math.max(...all.map((p) => p.y)) + STROKE_WIDTH;

  return {
    viewBox: [minX, minY, maxX - minX, maxY - minY].map(round).join(" "),
    strokes: strokes.map((points) => ({ d: toPathData(points), length: round(strokeLength(points)) })),
  };
}

export default function SignaturePad() {
  const padRef = useRef<SVGSVGElement | null>(null);
  // Pointer events can arrive faster than React re-renders, so the live stroke is
  // tracked in a ref and mirrored into state for drawing.
  const currentRef = useRef<Point[] | null>(null);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [current, setCurrent] = useState<Point[] | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [status, setStatus] = useState("");

  const data = strokes.length ? toSignatureData(strokes) : null;

  function toPoint(event: React.PointerEvent<SVGSVGElement>): Point {
    const rect = padRef.current!.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * PAD_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * PAD_HEIGHT,
    };
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    currentRef.current = [toPoint(event)];
    setCurrent(currentRef.current);
    setStatus("");
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const points = currentRef.current;
    if (!points) return;
    const point = toPoint(event);
    const last = points[points.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < MIN_POINT_DISTANCE) return;
    currentRef.current = [...points, point];
    setCurrent(currentRef.current);
  }

  function handlePointerUp() {
    const points = currentRef.current;
    if (!points) return;
    currentRef.current = null;
    setStrokes((previous) => [...previous, points]);
    setCurrent(null);
    setPreviewKey((key) => key + 1);
  }

  function clear() {
    setStrokes([]);
    setStatus("");
  }

  function undo() {
    setStrokes(strokes.slice(0, -1));
    setPreviewKey((key) => key + 1);
    setStatus("");
  }

  async function save() {
    if (!data) return;
    setStatus("Saving…");
    const response = await fetch("/signature-pad/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setStatus(response.ok ? "Saved. The homepage now uses this signature." : "Save failed. Check the dev server logs.");
  }

  return (
    <main style={{ width: "min(960px, calc(100% - 2rem))", margin: "0 auto", padding: "3rem 0" }}>
      <p className="eyebrow">Dev tool / Signature pad</p>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "clamp(2rem, 5vw, 3rem)" }}>Sign below</h1>
      <p style={{ margin: "0 0 1.5rem" }}>
        Draw with your mouse, trackpad, or finger. Each time you lift the pen starts a new stroke, and the homepage
        replays them in the order you drew them.
      </p>

      <svg
        ref={padRef}
        viewBox={`0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          background: "#fff",
          border: "2px solid var(--ink)",
          cursor: "crosshair",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <line x1="60" x2={PAD_WIDTH - 60} y1="320" y2="320" stroke="var(--ink)" strokeOpacity="0.15" strokeWidth="2" />
        {[...strokes, ...(current ? [current] : [])].map((points, index) => (
          <path
            key={index}
            d={toPathData(points)}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      <div className="hero-actions" style={{ marginTop: "1.25rem", flexWrap: "wrap" }}>
        <button type="button" className="button button--primary" onClick={save} disabled={!data}>
          Save to homepage
        </button>
        <button type="button" className="button button--ghost" onClick={undo} disabled={!strokes.length}>
          Undo stroke
        </button>
        <button type="button" className="button button--ghost" onClick={clear} disabled={!strokes.length}>
          Clear
        </button>
        <Link className="button button--ghost" href="/">
          View homepage
        </Link>
      </div>
      {status && <p style={{ marginTop: "1rem", fontWeight: 700 }}>{status}</p>}

      {data && (
        <section style={{ marginTop: "2.5rem" }}>
          <p className="eyebrow">Preview at homepage size</p>
          <button
            type="button"
            onClick={() => setPreviewKey((key) => key + 1)}
            aria-label="Replay preview"
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "var(--accent)" }}
          >
            <span style={{ display: "block", width: "11.5rem" }}>
              <Signature key={previewKey} viewBox={data.viewBox} strokes={data.strokes} strokeWidth={STROKE_WIDTH} duration={2.4} />
            </span>
          </button>
          <p style={{ fontSize: "0.85rem" }}>Click the preview to replay it.</p>
        </section>
      )}
    </main>
  );
}
