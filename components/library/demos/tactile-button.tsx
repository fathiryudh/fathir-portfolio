"use client";

import type { CSSProperties, ReactNode } from "react";
import { PiArrowRightBold, PiHeartFill, PiPlayFill } from "react-icons/pi";
import styles from "./tactile-button.module.css";

// A keycap button: a face sitting on a darker base that peeks out by `depth`. Hover nudges the face
// 2px, pressing pushes it flush onto the base. After dqnamo's Tactile Button (Design References/
// dqnamo.com/Tactile Button). Depth lives in one variable that drives the padding, the base offset
// and the press distance, so layout never moves when pressed.

const DEPTHS = { shallow: "3px", medium: "6px", deep: "8px" };
const TONES = {
  dark: { face: "#4a4a46", highlight: "#64645e", content: "#eeeeec", base: "#292926", baseShadow: "#141412" },
  light: { face: "#e8e8e8", highlight: "#fcfcfc", content: "#202020", base: "#d9d9d9", baseShadow: "#8d8d8d" },
  signal: { face: "#ff6542", highlight: "#ff9a80", content: "#1a0f0a", base: "#b33a1f", baseShadow: "#6e1f0e" },
};

export function TactileButton({
  size = "md",
  depth = "medium",
  tone = "dark",
  children,
  ...props
}: {
  size?: "sm" | "md" | "lg";
  depth?: keyof typeof DEPTHS;
  tone?: keyof typeof TONES;
  children: ReactNode;
} & React.ComponentPropsWithoutRef<"button">) {
  const t = TONES[tone];
  const style = {
    "--depth": DEPTHS[depth],
    "--face": t.face,
    "--face-highlight": t.highlight,
    "--content": t.content,
    "--base": t.base,
    "--base-shadow": t.baseShadow,
  } as CSSProperties;

  return (
    <button type="button" className={styles.button} data-size={size} style={style} {...props}>
      <span className={styles.base} aria-hidden="true" />
      <span className={styles.face}>{children}</span>
    </button>
  );
}

export default function TactileButtonDemo() {
  return (
    <div className={styles.stage}>
      <div className={styles.row}>
        <TactileButton size="sm" depth="shallow">
          Small
        </TactileButton>
        <TactileButton>
          Continue <PiArrowRightBold />
        </TactileButton>
        <TactileButton size="lg" depth="deep" tone="signal">
          <PiPlayFill /> Play
        </TactileButton>
      </div>
      <div className={styles.row}>
        <TactileButton tone="light" depth="deep">
          <PiHeartFill /> Light, deep
        </TactileButton>
        <TactileButton tone="light" size="sm" depth="shallow">
          Shallow
        </TactileButton>
      </div>
    </div>
  );
}
