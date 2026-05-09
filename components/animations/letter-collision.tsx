"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const phrases = ["Software builder", "practical tools", "real products"];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getSpeed(phraseIndex: number, charIndex: number) {
  return (seededRandom(phraseIndex * 100 + charIndex + 1) * 0.8 + 0.2).toFixed(2);
}

export default function LetterCollision() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pin = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      pin: inner,
    });

    const letters = inner.querySelectorAll<HTMLSpanElement>("[data-speed]");

    const animations = Array.from(letters).map((letter, idx) => {
      const speed = parseFloat(letter.dataset.speed || "0");
      const r1 = seededRandom(idx * 3 + 100);
      const r2 = seededRandom(idx * 3 + 200);
      const r3 = seededRandom(idx * 3 + 300);
      const direction = r1 > 0.5 ? 1 : -1;
      const rotation = (r2 - 0.5) * 120;

      return gsap.to(letter, {
        y: speed * 400 * direction,
        x: (r3 - 0.5) * 200,
        rotation,
        opacity: 0,
        scrollTrigger: {
          trigger: container,
          start: "25% top",
          end: "75% top",
          scrub: 1,
        },
      });
    });

    return () => {
      pin.kill();
      animations.forEach((a) => a.scrollTrigger?.kill());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="letter-collision"
      aria-label="Decorative animated text"
    >
      <div ref={innerRef} className="letter-collision__inner">
        {phrases.map((phrase, pi) => (
          <div key={pi} className="letter-collision__line">
            {phrase.split("").map((char, ci) => (
              <span
                key={`${pi}-${ci}`}
                data-speed={getSpeed(pi, ci)}
                className={`letter-collision__char${char === " " ? " letter-collision__space" : ""}`}
              >
                {char === " " ? " " : char}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
