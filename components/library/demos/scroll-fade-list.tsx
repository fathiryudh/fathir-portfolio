"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./scroll-fade-list.module.css";

// A scrolling list whose top and bottom fades are exactly as tall as the distance you can still
// scroll that way (capped), so there's never a fade over content you've already reached. After
// dqnamo's Scroll Fade List (Design References/dqnamo.com/Scroll Fade List). Scroll writes CSS
// variables, not React state.

export function ScrollFadeList<T>({
  items,
  getKey,
  renderItem,
  maxFade = 76,
}: {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  maxFade?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const scroller = scrollRef.current;
    if (!frame || !scroller) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = scroller.scrollHeight - scroller.clientHeight;
      frame.style.setProperty("--top-fade", `${Math.min(maxFade, Math.max(0, scroller.scrollTop))}px`);
      frame.style.setProperty("--bottom-fade", `${Math.min(maxFade, Math.max(0, max - scroller.scrollTop))}px`);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", schedule);
      observer.disconnect();
    };
  }, [maxFade]);

  return (
    <div ref={frameRef} className={styles.frame}>
      <div ref={scrollRef} className={styles.scroller} data-lenis-prevent>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={getKey(item)} className={styles.item}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const COUNTRIES = [
  ["SG", "Singapore"], ["ID", "Indonesia"], ["MY", "Malaysia"], ["JP", "Japan"], ["KR", "South Korea"],
  ["TH", "Thailand"], ["VN", "Vietnam"], ["PH", "Philippines"], ["AU", "Australia"], ["NZ", "New Zealand"],
  ["IN", "India"], ["AE", "United Arab Emirates"], ["GB", "United Kingdom"], ["FR", "France"], ["DE", "Germany"],
  ["NL", "Netherlands"], ["SE", "Sweden"], ["US", "United States"], ["CA", "Canada"], ["BR", "Brazil"],
  ["MX", "Mexico"], ["ZA", "South Africa"],
];

const flag = (code: string) => String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));

export default function ScrollFadeListDemo() {
  return (
    <div className={styles.stage}>
      <ScrollFadeList
        items={COUNTRIES}
        getKey={([code]) => code}
        renderItem={([code, name]) => (
          <>
            <span>{flag(code)}</span>
            <span>{name}</span>
            <span className={styles.code}>{code}</span>
          </>
        )}
      />
    </div>
  );
}
