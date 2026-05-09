"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const transforms = [
  { x: -0.8, y: -0.6, rotateZ: -29 },
  { x: -0.2, y: -0.4, rotateZ: -6 },
  { x: -0.05, y: 0.1, rotateZ: 12 },
  { x: -0.05, y: -0.1, rotateZ: -9 },
  { x: -0.1, y: 0.55, rotateZ: 3 },
  { x: 0, y: -0.1, rotateZ: 9 },
  { x: 0, y: 0.15, rotateZ: -12 },
  { x: 0, y: 0.15, rotateZ: -17 },
  { x: 0, y: -0.65, rotateZ: 9 },
  { x: 0.1, y: 0.4, rotateZ: 12 },
  { x: 0, y: -0.15, rotateZ: -9 },
  { x: 0.2, y: 0.15, rotateZ: 12 },
  { x: 0.8, y: 0.6, rotateZ: 20 },
];

const EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];

const disperse = {
  open: (i: number) => {
    const t = transforms[i % transforms.length];
    return {
      x: (t?.x ?? 0) + "em",
      y: (t?.y ?? 0) + "em",
      rotateZ: t?.rotateZ ?? 0,
      transition: { duration: 0.75, ease: EASE },
    };
  },
  closed: {
    x: 0,
    y: 0,
    rotateZ: 0,
    transition: { duration: 0.75, ease: EASE },
  },
};

export default function TextDisperse({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAnimated, setIsAnimated] = useState(false);

  const text = typeof children === "string"
    ? children
    : (children as React.ReactElement<{ children: string }>)?.props?.children ?? "";

  const chars = text.split("").map((char: string, i: number) => (
    <motion.span
      key={char + i}
      custom={i}
      variants={disperse}
      animate={isAnimated ? "open" : "closed"}
      style={{ display: "inline-block", whiteSpace: "pre" }}
    >
      {char}
    </motion.span>
  ));

  return (
    <div
      className="text-disperse"
      onMouseEnter={() => setIsAnimated(true)}
      onMouseLeave={() => setIsAnimated(false)}
    >
      {chars}
    </div>
  );
}
