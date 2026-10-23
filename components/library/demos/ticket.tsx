"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./ticket.module.css";

// A tall event ticket with a tear-off stub: V notches where the stub meets the body, a dashed
// perforation, a diagonal sheen, and a gentle tilt toward the cursor on fine pointers. After dqnamo's
// Ticket (Design References/dqnamo.com/Ticket). The whole silhouette is one clip-path polygon driven
// by CSS variables; the shadow is a drop-shadow on a wrapper because clipping would cut a box-shadow.

const MAX_TILT = 6;
const PALETTES = {
  signal: { paper: "#ff6542", ink: "#181713" },
  cobalt: { paper: "#2645dc", ink: "#f7f2df" },
  acid: { paper: "#c9e54b", ink: "#1a1b17" },
};

export function Ticket({
  body,
  stub,
  paper,
  ink,
  stubHeight = "24%",
  notch = 13,
  corner = 0,
  label,
}: {
  body: ReactNode;
  stub: ReactNode;
  paper: string;
  ink: string;
  stubHeight?: string;
  notch?: number;
  corner?: number;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  const canTilt = () =>
    window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;

  return (
    <div
      ref={ref}
      className={styles.shadow}
      style={{
        transform: `perspective(1100px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${tilt.active ? 1.018 : 1})`,
      }}
      onPointerMove={(event) => {
        if (!canTilt()) return;
        const r = ref.current!.getBoundingClientRect();
        const px = (event.clientX - r.left) / r.width - 0.5;
        const py = (event.clientY - r.top) / r.height - 0.5;
        setTilt({ x: px * MAX_TILT * 2, y: -py * MAX_TILT * 2, active: true });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0, active: false })}
    >
      <article
        aria-label={label}
        className={styles.ticket}
        style={
          {
            "--paper": paper,
            "--ink": ink,
            "--stub": stubHeight,
            "--notch": `${notch}px`,
            "--c": `${corner}px`,
          } as CSSProperties
        }
      >
        <div className={styles.body}>
          {body}
          <span className={styles.perforation} aria-hidden="true" />
        </div>
        <div className={styles.stub}>{stub}</div>
      </article>
    </div>
  );
}

export default function TicketDemo() {
  const [palette, setPalette] = useState<keyof typeof PALETTES>("signal");
  const { paper, ink } = PALETTES[palette];

  return (
    <div className={styles.stage} style={{ "--wash": paper } as CSSProperties}>
      <Ticket
        label="Ticket: Fathir's portfolio launch"
        paper={paper}
        ink={ink}
        corner={palette === "acid" ? 14 : 0}
        body={
          <div className={styles.content}>
            <p className={styles.micro}>Admit one · Gate 04</p>
            <h3 className={styles.title}>
              Port
              <br />
              folio
              <br />
              Launch
            </h3>
            <span className={styles.dots} aria-hidden="true" />
            <dl className={styles.meta}>
              <div>
                <dt>Date</dt>
                <dd>24.10.26</dd>
              </div>
              <div>
                <dt>Doors</dt>
                <dd>19:00</dd>
              </div>
              <div>
                <dt>Seat</dt>
                <dd>GA</dd>
              </div>
            </dl>
          </div>
        }
        stub={
          <div className={styles.stubContent}>
            <p className={styles.micro}>No. 000417</p>
            <span className={styles.barcode} aria-hidden="true" />
          </div>
        }
      />
      <div className={styles.palettes} role="radiogroup" aria-label="Palette">
        {(Object.keys(PALETTES) as (keyof typeof PALETTES)[]).map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={palette === key}
            aria-label={key}
            className={styles.swatch}
            style={{ background: PALETTES[key].paper }}
            onClick={() => setPalette(key)}
          />
        ))}
      </div>
    </div>
  );
}
