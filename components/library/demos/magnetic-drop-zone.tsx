"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useReducedMotion, useSpring } from "framer-motion";
import { PiFileBold, PiFileImageBold, PiFilePdfBold, PiFileZipBold, PiUploadSimpleBold } from "react-icons/pi";
import styles from "./magnetic-drop-zone.module.css";

// A file drop target that notices a file being dragged anywhere on the page and, as it comes within
// 180px, leans toward it, scales up and glows under the cursor. Copy follows proximity. After dqnamo's
// Magnetic Drop Zone (Design References/dqnamo.com/Magnetic Drop Zone). Proximity is measured from the
// zone's edge, not its centre, and it settles back to centre once the file is over it.

const MAGNET_DISTANCE = 180;
const MAX_OFFSET = 10;
const SPRING = { stiffness: 280, damping: 24, mass: 0.65 };

type Near = "idle" | "near" | "over";

const formatSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

const iconFor = (file: File) =>
  file.type.startsWith("image/") ? (
    <PiFileImageBold />
  ) : file.type === "application/pdf" ? (
    <PiFilePdfBold />
  ) : /zip/.test(file.type) ? (
    <PiFileZipBold />
  ) : (
    <PiFileBold />
  );

export function MagneticDropZone({ onFilesChange }: { onFilesChange?: (files: File[]) => void }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [near, setNear] = useState<Near>("idle");
  const [file, setFile] = useState<File | null>(null);
  const reduced = useReducedMotion();
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const scale = useSpring(1, SPRING);
  const glowX = useSpring(0, SPRING);
  const glowY = useSpring(0, SPRING);
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  const glow = useMotionTemplate`translate(${glowX}px, ${glowY}px)`;

  useEffect(() => {
    const reset = () => {
      setNear("idle");
      x.set(0);
      y.set(0);
      scale.set(1);
    };
    const onDragOver = (event: DragEvent) => {
      const zone = zoneRef.current;
      if (!zone || !event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      const r = zone.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = Math.max(Math.abs(event.clientX - cx) - r.width / 2, 0);
      const dy = Math.max(Math.abs(event.clientY - cy) - r.height / 2, 0);
      const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / MAGNET_DISTANCE);
      if (!proximity) return reset();
      const over = dx === 0 && dy === 0;
      const length = Math.max(Math.hypot(event.clientX - cx, event.clientY - cy), 1);
      const offset = over || reduced ? 0 : proximity * MAX_OFFSET;
      setNear(over ? "over" : "near");
      x.set(((event.clientX - cx) / length) * offset);
      y.set(((event.clientY - cy) / length) * offset);
      scale.set(reduced ? 1 : over ? 1.025 : 1.01);
      glowX.set(event.clientX - cx);
      glowY.set(event.clientY - cy);
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragend", reset);
    window.addEventListener("drop", reset);
    const onLeave = (event: DragEvent) => {
      if (!event.relatedTarget) reset();
    };
    window.addEventListener("dragleave", onLeave);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragend", reset);
      window.removeEventListener("drop", reset);
      window.removeEventListener("dragleave", onLeave);
    };
  }, [x, y, scale, glowX, glowY, reduced]);

  const take = (files: FileList | null) => {
    const next = files?.[0];
    if (!next) return;
    setFile(next);
    onFilesChange?.([next]);
  };

  return (
    <motion.div
      ref={zoneRef}
      className={styles.zone}
      data-near={near}
      style={{ transform }}
      onDrop={(event) => {
        event.preventDefault();
        take(event.dataTransfer.files);
      }}
    >
      <motion.span className={styles.glow} style={{ transform: glow }} aria-hidden="true" />
      <input ref={inputRef} type="file" hidden onChange={(event) => take(event.target.files)} />
      {file ? (
        <div className={styles.file}>
          <span className={styles.tile}>{iconFor(file)}</span>
          <p className={styles.name}>{file.name}</p>
          <p className={styles.size}>{formatSize(file.size)}</p>
          <div className={styles.row}>
            <button type="button" className={styles.small} onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            <button type="button" className={styles.small} aria-label={`Remove ${file.name}`} onClick={() => setFile(null)}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={styles.empty} onClick={() => inputRef.current?.click()}>
          <span className={styles.tile}>
            <PiUploadSimpleBold />
          </span>
          <span className={styles.name} aria-live="polite">
            {near === "over" ? "Let go to add it" : near === "near" ? "Bring it closer" : "Drop a file here"}
          </span>
          <span className={styles.size}>or click to browse</span>
        </button>
      )}
    </motion.div>
  );
}

export default function MagneticDropZoneDemo() {
  return (
    <div className={styles.stage}>
      <MagneticDropZone />
      <p className={styles.hint}>Drag any file from your desktop toward it</p>
    </div>
  );
}
