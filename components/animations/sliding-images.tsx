"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const row1 = [
  { label: "Tappd", bg: "var(--panel)" },
  { label: "Draaqutz", bg: "var(--mist)" },
  { label: "Khutwa", bg: "var(--accent)" },
  { label: "Dashboards", bg: "var(--panel)" },
];

const row2 = [
  { label: "Telegram Bots", bg: "var(--accent)" },
  { label: "Web Apps", bg: "var(--panel)" },
  { label: "Mobile Ideas", bg: "var(--mist)" },
  { label: "Booking Flows", bg: "var(--panel)" },
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
        {row1.map((item) => (
          <div
            key={item.label}
            className="sliding-images__card"
            style={{ background: item.bg }}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </motion.div>
      <motion.div className="sliding-images__row" style={{ x: x2 }}>
        {row2.map((item) => (
          <div
            key={item.label}
            className="sliding-images__card"
            style={{ background: item.bg }}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
