"use client";

import { useEffect } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let instance: { destroy: () => void } | undefined;
    let dead = false; // cleanup can run before the import resolves (Strict Mode remounts)

    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      if (!dead) instance = new LocomotiveScroll();
    })();

    return () => {
      dead = true;
      instance?.destroy();
    };
  }, []);

  return <>{children}</>;
}
