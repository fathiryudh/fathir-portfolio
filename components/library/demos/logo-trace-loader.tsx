"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "./logo-trace-loader.module.css";

// A loader that is your logo: a bright comet chases round the outline over a faint ghost; when
// loading finishes it finishes its lap, closes the outline at the same speed, traces an inner line,
// then the filled mark fades in. After dqnamo's Logo Trace Loader (Design References/dqnamo.com/Logo
// Trace Loader). Comet = dasharray "0.16 0.84" on a pathLength=1 path, looping dashoffset to -1.

type Phase = "loop" | "closingOuter" | "closingInner" | "fadingFill" | "done";

// A rounded "F" mark: one continuous outer contour to trace, an inner stroke, and the filled shapes.
const TRACE =
  "M40 0 H260 Q300 0 300 40 V60 Q300 100 260 100 H140 V120 H220 Q260 120 260 160 V170 Q260 210 220 210 H140 V250 Q140 290 100 290 H40 Q0 290 0 250 V40 Q0 0 40 0 Z";
const INNER = "M70 60 V230";
const FILL = (
  <>
    <path d={TRACE} />
  </>
);

export function LogoTraceLoader({
  loading = true,
  size = 64,
  strokeWidth = 12,
  loop = 0.62,
  fillFade = 0.2,
  onDone,
}: {
  loading?: boolean;
  size?: number;
  strokeWidth?: number;
  loop?: number;
  fillFade?: number;
  onDone?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("loop");
  const doneRef = useRef(false);
  const shouldFinish = useRef(!loading);

  useEffect(() => {
    shouldFinish.current = !loading;
    if (loading) {
      doneRef.current = false;
      const frame = requestAnimationFrame(() => setPhase("loop"));
      return () => cancelAnimationFrame(frame);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(frame);
    }
  }, [loading]);

  // Each phase also has a timer fallback in case an animation event never fires.
  useEffect(() => {
    let timer = 0;
    if (phase === "loop" && !loading) timer = window.setTimeout(() => setPhase("closingOuter"), loop * 1000 + 50);
    if (phase === "closingOuter") timer = window.setTimeout(() => setPhase("closingInner"), loop * 840);
    if (phase === "closingInner") timer = window.setTimeout(() => setPhase("fadingFill"), 240);
    if (phase === "fadingFill") timer = window.setTimeout(() => setPhase("done"), fillFade * 1000);
    if (phase === "done" && !doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }
    return () => clearTimeout(timer);
  }, [phase, loading, loop, fillFade, onDone]);

  const filled = phase === "fadingFill" || phase === "done";

  return (
    <svg
      role="status"
      aria-label={loading ? "Loading" : "Loaded"}
      viewBox="-8 -8 316 306"
      width={size}
      height={size}
      className={styles.svg}
      data-filled={filled}
    >
      <g opacity="0.18" fill="none" stroke="currentColor" strokeWidth={Math.max(1, strokeWidth / 2)}>
        <path d={TRACE} />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {phase === "loop" && (
          <path
            d={TRACE}
            pathLength={1}
            strokeDasharray="0.16 0.84"
            className={styles.comet}
            style={{ animationDuration: `${loop}s` }}
            onAnimationIteration={() => shouldFinish.current && setPhase("closingOuter")}
          />
        )}
        {phase !== "loop" && (
          <motion.path
            d={TRACE}
            initial={{ pathLength: phase === "closingOuter" ? 0.16 : 1 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: loop * 0.84, ease: "linear" }}
          />
        )}
        {(phase === "closingInner" || filled) && (
          <motion.path
            d={INNER}
            initial={{ pathLength: phase === "closingInner" ? 0 : 1 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.24, ease: "linear" }}
          />
        )}
      </g>
      {filled && (
        <motion.g
          fill="currentColor"
          initial={{ opacity: phase === "fadingFill" ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: fillFade, ease: "easeOut" }}
        >
          {FILL}
        </motion.g>
      )}
    </svg>
  );
}

export default function LogoTraceLoaderDemo() {
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, [run]);

  return (
    <div className={styles.stage}>
      <div className={styles.mark} data-done={done}>
        <LogoTraceLoader key={run} loading={loading} size={88} loop={0.5} onDone={() => setDone(true)} />
      </div>
      <div className={styles.panel} data-done={done}>
        <p className={styles.title}>Welcome back</p>
        <p className={styles.sub}>Everything loaded.</p>
      </div>
      <button
        type="button"
        className={styles.again}
        onClick={() => {
          setDone(false);
          setLoading(true);
          setRun((value) => value + 1);
        }}
      >
        Load again
      </button>
    </div>
  );
}
