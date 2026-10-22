"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { torn } from "@/components/zine/paper";

const row1 = [
  { label: "Websites", tone: "red" },
  { label: "Mobile apps", tone: "blue" },
  { label: "Backends", tone: "yellow" },
  { label: "Automations", tone: "paper" },
];

const row2 = [
  { label: "Internal tools", tone: "pink" },
  { label: "APIs", tone: "yellow" },
  { label: "Prototypes", tone: "red" },
  { label: "Whatever's next", tone: "blue" },
];

export default function SlidingImages() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <div ref={containerRef} className="sliding-images">
      <motion.div className="sliding-images__row" style={{ x: x1 }}>
        {row1.map((item, index) => (
          <div
            key={item.label}
            className={`sliding-images__card sliding-images__card--${item.tone}`}
            style={{ clipPath: torn(800 + index, 14) }}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </motion.div>
      <motion.div className="sliding-images__row" style={{ x: x2 }}>
        {row2.map((item, index) => (
          <div
            key={item.label}
            className={`sliding-images__card sliding-images__card--${item.tone}`}
            style={{ clipPath: torn(820 + index, 14) }}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
