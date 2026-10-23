"use client";

import { useEffect, useState } from "react";
import { PiArrowsClockwiseBold } from "react-icons/pi";
import styles from "./scramble-text.module.css";

// Text that arrives as symbols and resolves left to right, like a secret being generated. After
// dqnamo's Scramble Text (Design References/dqnamo.com/Scramble Text). The step count is capped (not
// the speed per character), so any length finishes in about 1.5s. The first frame is a deterministic
// scramble so server and client markup match.

const CHARS = "-_~`!@#$%^&*()+=[]{}|;:,.<>?";
const MAX_STEPS = 48;

const segment = (text: string) =>
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map((s) => s.segment)
    : Array.from(text);

const stable = (text: string) =>
  segment(text)
    .map((c, i) => (c.trim() === "" ? c : CHARS[(c.charCodeAt(0) * 31 + i * 7) % CHARS.length]))
    .join("");

export function ScrambleText({ children, intervalMs = 32 }: { children: string; intervalMs?: number }) {
  const [display, setDisplay] = useState(() => stable(children));

  useEffect(() => {
    if (intervalMs <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setDisplay(children));
      return () => cancelAnimationFrame(frame);
    }
    const chars = segment(children);
    const step = Math.max(1, Math.ceil(chars.length / MAX_STEPS));
    let revealed = 0;
    const timer = window.setInterval(() => {
      revealed = Math.min(chars.length, revealed + step);
      setDisplay(
        chars
          .map((c, i) => (c.trim() === "" || i < revealed ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join(""),
      );
      if (revealed >= chars.length) clearInterval(timer);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [children, intervalMs]);

  return (
    <span className={styles.wrap}>
      <span aria-hidden="true">{display}</span>
      <span className={styles.sr} aria-live="polite" aria-atomic="true">
        {children}
      </span>
    </span>
  );
}

const code = () =>
  Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 6).toUpperCase()).join("-");

export default function ScrambleTextDemo() {
  const [invite, setInvite] = useState("K7QD-2MXA-91ZT");

  return (
    <div className={styles.stage}>
      <div className={styles.card}>
        <p className={styles.label}>Invite code</p>
        <div className={styles.field}>
          <code className={styles.code}>
            <ScrambleText>{invite}</ScrambleText>
          </code>
          <button type="button" className={styles.button} onClick={() => setInvite(code())}>
            <PiArrowsClockwiseBold /> Regenerate
          </button>
        </div>
        <p className={styles.headline}>
          <ScrambleText>{`fathiryudh.com/invite/${invite.toLowerCase()}`}</ScrambleText>
        </p>
      </div>
    </div>
  );
}
