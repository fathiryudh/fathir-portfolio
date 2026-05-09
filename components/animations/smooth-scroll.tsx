"use client";

import { useEffect } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let instance: { destroy: () => void } | undefined;

    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      instance = new LocomotiveScroll();
    })();

    return () => {
      instance?.destroy();
    };
  }, []);

  return <>{children}</>;
}
