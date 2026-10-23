"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PiCheckCircleFill, PiCopyBold, PiFloppyDiskBold, PiSpinnerGapBold } from "react-icons/pi";
import styles from "./dynamic-button.module.css";

// A button whose label and icon roll to the new state while its width springs to fit, instead of
// snapping. After dqnamo's Dynamic Button (Design References/dqnamo.com/Dynamic Button). `width:
// auto` can't be tweened, so an invisible twin is measured and the button animates to that pixel width.

const EASE = [0.23, 1, 0.32, 1] as const;

export function DynamicButton({
  icon,
  stateKey,
  variant = "primary",
  children,
  ...props
}: {
  icon: ReactNode;
  stateKey: string;
  variant?: "primary" | "secondary";
  children: string;
} & Omit<React.ComponentPropsWithoutRef<"button">, "children" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd">) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const measure = measureRef.current;
    if (!button || !measure) return;
    const sync = () => {
      const s = getComputedStyle(button);
      const chrome =
        parseFloat(s.paddingLeft) + parseFloat(s.paddingRight) + parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth);
      setWidth(Math.ceil(measure.scrollWidth + chrome));
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [children, stateKey]);

  const roll = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className={styles.button}
      data-variant={variant}
      initial={false}
      animate={{ width: width ?? "auto" }}
      transition={{ width: reduced ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.26 } }}
      {...props}
    >
      <span ref={measureRef} aria-hidden="true" className={styles.measure}>
        <span className={styles.icon}>{icon}</span>
        {children}
      </span>
      <span className={styles.cell}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={stateKey} className={styles.icon} {...roll} transition={{ duration: 0.18, ease: EASE }}>
            {icon}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className={styles.cell}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={children} {...roll} transition={{ duration: 0.18, ease: EASE }}>
            {children}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

export default function DynamicButtonDemo() {
  const [copied, setCopied] = useState(false);
  const [save, setSave] = useState<"idle" | "saving" | "saved">("idle");

  return (
    <div className={styles.stage}>
      <DynamicButton
        stateKey={copied ? "copied" : "copy"}
        icon={copied ? <PiCheckCircleFill className={styles.ok} /> : <PiCopyBold />}
        onClick={() => {
          navigator.clipboard?.writeText("https://fathiryudh.com/library").catch(() => {});
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? "Copied" : "Copy invite link"}
      </DynamicButton>
      <DynamicButton
        variant="secondary"
        stateKey={save}
        icon={
          save === "saving" ? (
            <PiSpinnerGapBold className={styles.spin} />
          ) : save === "saved" ? (
            <PiCheckCircleFill className={styles.ok} />
          ) : (
            <PiFloppyDiskBold />
          )
        }
        onClick={() => {
          if (save !== "idle") return;
          setSave("saving");
          window.setTimeout(() => setSave("saved"), 1100);
          window.setTimeout(() => setSave("idle"), 2600);
        }}
      >
        {save === "saving" ? "Saving changes…" : save === "saved" ? "Saved" : "Save"}
      </DynamicButton>
    </div>
  );
}
