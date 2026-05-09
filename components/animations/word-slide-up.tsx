"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const slideUp = {
  initial: { y: "100%" },
  open: (i: number) => ({
    y: "0%",
    transition: { duration: 0.5, delay: 0.01 * i },
  }),
  closed: { y: "100%" },
};

export default function WordSlideUp({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });

  const words = text.split(" ");

  return (
    <p ref={ref} className={className} style={{ lineHeight: 1.84 }}>
      {words.map((word, index) => (
        <span
          key={index}
          style={{ overflow: "hidden", display: "inline-flex" }}
        >
          <motion.span
            variants={slideUp}
            custom={index}
            animate={isInView ? "open" : "closed"}
            initial="initial"
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
