"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

// Live readouts for the header HUD and footer: Singapore time with colons that blink out of phase
// (Balky Studio's studio clock) and a frames-per-second counter (Carter Ogunsola's HUD).

const formatter = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export function SgClock({ className }: { className?: string }) {
  const [parts, setParts] = useState<string[] | null>(null);

  useEffect(() => {
    const format = formatter();
    const tick = () => setParts(format.format(new Date()).split(":"));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!parts) return <span className={className}>--:--:--</span>;
  return (
    <span className={className}>
      {parts[0]}
      <span className="clock-colon">:</span>
      {parts[1]}
      <span className="clock-colon clock-colon--late">:</span>
      {parts[2]}
    </span>
  );
}

export function Fps({ className }: { className?: string }) {
  const [fps, setFps] = useState<number | null>(null);

  useEffect(() => {
    let frames = 0;
    let since = performance.now();
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - since >= 1000) {
        setFps(Math.round((frames * 1000) / (now - since)));
        frames = 0;
        since = now;
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return <span className={className}>{fps ?? "--"}</span>;
}
