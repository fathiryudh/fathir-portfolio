"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./iridescent-foil.module.css";

// A holographic sticker surface made only of layered gradients: a silver base with a faint rainbow
// band, oil-slick blobs, a pearly sheen, a shine band and a cursor glare. Scroll slides the rainbow,
// the pointer moves the shine and glare. After dqnamo's Iridescent Foil (Design References/dqnamo.com/
// Iridescent Foil). One rAF-batched writer of CSS variables; layers overscan so edges never show.

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function IridescentFoil({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let px = 0.5;
    let py = 0.5;
    const write = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const p = clamp((innerHeight - rect.top) / (innerHeight + rect.height), 0, 1);
      el.style.setProperty("--foil-shift", `${(p * 0.82 + (px - 0.5) * 0.18) * 100}%`);
      el.style.setProperty("--foil-y-shift", `${(p * 0.28 + (py - 0.5) * 0.12) * 100}%`);
      el.style.setProperty("--pointer-x", `${px * 100}%`);
      el.style.setProperty("--pointer-y", `${py * 100}%`);
      el.style.setProperty("--shine-angle", `${105 + p * 80 + (px - 0.5) * 28}deg`);
      el.style.setProperty("--shine-opacity", `${0.56 + Math.abs(px - 0.5) * 0.24 + p * 0.12}`);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      px = clamp((event.clientX - rect.left) / rect.width, 0.08, 0.92);
      py = clamp((event.clientY - rect.top) / rect.height, 0.08, 0.92);
      schedule();
    };
    write();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={ref} className={`${styles.surface} ${className}`}>
      <span className={styles.foil} aria-hidden="true" />
      <span className={styles.film} aria-hidden="true" />
      <span className={styles.pearl} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
      <span className={styles.shine} aria-hidden="true" />
      <span className={styles.glare} aria-hidden="true" />
    </div>
  );
}

export default function IridescentFoilDemo() {
  return (
    <div className={styles.stage}>
      <IridescentFoil className={styles.card}>
        <div className={styles.cardContent}>
          <p className={styles.micro}>Member · No. 0417</p>
          <p className={styles.big}>FY</p>
          <div className={styles.row}>
            <span>Fathir Yudhistira</span>
            <span>2026</span>
          </div>
        </div>
      </IridescentFoil>
      <p className={styles.hint}>Move your cursor or finger over the card</p>
    </div>
  );
}
