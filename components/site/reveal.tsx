"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { onVeilClear } from "@/components/site/veil";

// Scroll-in reveals in the style of Balky Studio's split text (Design References/balky.studio/
// Text Reveals): words rise from behind an overflow mask with a stagger, blocks fade up. The motion
// itself is CSS (site.css `.rv` / `.mask`); this only decides when to add `is-in`.

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancel = () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        cancel = onVeilClear(() => element.classList.add("is-in"));
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancel();
    };
  }, []);

  return ref;
}

type RevealProps = {
  as?: ElementType;
  className?: string;
  delay?: number;
  children: ReactNode;
};

export function Reveal({ as: Tag = "div", className = "", delay = 0, children }: RevealProps) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={`rv ${className}`} style={{ "--d": delay } as CSSProperties}>
      {children}
    </Tag>
  );
}

type MaskTextProps = {
  as?: ElementType;
  text: string;
  className?: string;
  delay?: number;
};

export function MaskText({ as: Tag = "p", text, className = "", delay = 0 }: MaskTextProps) {
  const ref = useReveal<HTMLElement>();
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={`mask ${className}`} aria-label={text}>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="mask__w" aria-hidden="true">
            <span className="mask__i" style={{ "--i": index + delay } as CSSProperties}>
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
