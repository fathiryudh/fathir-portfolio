"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PiArrowCounterClockwiseBold, PiCheckBold, PiCheckCircleFill, PiTrashBold } from "react-icons/pi";
import styles from "./hold-to-confirm.module.css";

// A destructive button you have to press and hold: a red fill wipes across over `duration` and
// confirms when full; let go early and it snaps back. Pair it with an Undo notice that visibly
// drains. After dqnamo's Hold to Confirm (Design References/dqnamo.com/Hold to Confirm). The fill
// is a clip-path overlay that repeats the label, so the text flips colour exactly at the edge.

type Input = "pointer" | "keyboard";

const ESCAPE_MARGIN = 8; // px the pointer may wobble outside before the hold cancels
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function HoldToConfirmButton({
  duration = 1600,
  onConfirm,
  children,
}: {
  duration?: number;
  onConfirm: (input: Input) => void;
  children: ReactNode;
}) {
  const [holding, setHolding] = useState(false);
  const [input, setInput] = useState<Input>("pointer");
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const start = (mode: Input) => {
    setInput(mode);
    setHolding(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onConfirm(mode);
    }, duration);
  };
  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };

  const instant = input === "keyboard" || (typeof window !== "undefined" && reducedMotion());

  return (
    <button
      type="button"
      className={styles.hold}
      data-input={input}
      aria-busy={holding}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        start("pointer");
      }}
      onPointerMove={(event) => {
        if (!holding) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const out =
          event.clientX < rect.left - ESCAPE_MARGIN ||
          event.clientX > rect.right + ESCAPE_MARGIN ||
          event.clientY < rect.top - ESCAPE_MARGIN ||
          event.clientY > rect.bottom + ESCAPE_MARGIN;
        if (out) cancel();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
      onBlur={cancel}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
          event.preventDefault();
          start("keyboard");
        }
      }}
      onKeyUp={(event) => {
        if (event.key === "Enter" || event.key === " ") cancel();
      }}
    >
      <span className={styles.label}>{children}</span>
      <span
        aria-hidden="true"
        className={styles.fill}
        style={{
          clipPath: holding ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transitionDuration: instant ? "0ms" : holding ? `${duration}ms` : "180ms",
          transitionTimingFunction: holding ? "linear" : "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {children}
      </span>
    </button>
  );
}

export function UndoNotice({
  message,
  duration = 5000,
  onUndo,
  onExpire,
}: {
  message: string;
  duration?: number;
  onUndo: () => void;
  onExpire: () => void;
}) {
  const [counting, setCounting] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCounting(true));
    const timer = window.setTimeout(onExpire, duration);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [duration, onExpire]);

  return (
    <div className={styles.notice} role="status" aria-live="polite">
      <PiCheckCircleFill className={styles.ok} />
      <p>{message}</p>
      <button type="button" className={styles.undo} onClick={onUndo}>
        <PiArrowCounterClockwiseBold /> Undo
        <span
          aria-hidden="true"
          className={styles.drain}
          style={{
            clipPath: counting ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
            transition: counting ? `clip-path ${duration}ms linear` : "none",
          }}
        >
          <PiArrowCounterClockwiseBold /> Undo
        </span>
      </button>
    </div>
  );
}

export default function HoldToConfirmDemo() {
  const [state, setState] = useState<"idle" | "undo" | "gone">("idle");
  const expire = useCallback(() => setState("gone"), []);

  return (
    <div className={styles.stage}>
      <div className={styles.card}>
        <div className={styles.project}>
          <span className={styles.thumb} />
          <div>
            <p className={styles.name}>portfolio-v3</p>
            <p className={styles.meta}>{state === "gone" ? "Deleted" : "Updated 2 days ago"}</p>
          </div>
        </div>
        {state === "idle" && (
          <HoldToConfirmButton onConfirm={() => setState("undo")}>
            <PiTrashBold /> Hold to delete
          </HoldToConfirmButton>
        )}
        {state === "undo" && <UndoNotice message="Project deleted" onUndo={() => setState("idle")} onExpire={expire} />}
        {state === "gone" && (
          <button type="button" className={styles.reset} onClick={() => setState("idle")}>
            <PiCheckBold /> Gone for good. Reset demo
          </button>
        )}
      </div>
    </div>
  );
}
