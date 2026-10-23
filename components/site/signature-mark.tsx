"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Signature from "@/components/animations/signature";
import { MY_SIGNATURE } from "@/components/animations/my-signature";
import { onVeilClear } from "@/components/site/veil";

// The header logo: your signature. It draws itself stroke by stroke only when the site is first
// opened on the home page (once the loader lifts) and when hovered; otherwise it stays still.

const DRAW_SECONDS = 1.6;
const STILL_SECONDS = 0.001;

export default function SignatureMark() {
  const pathname = usePathname();
  const [{ run, seconds }, setDraw] = useState({ run: 0, seconds: STILL_SECONDS });

  useEffect(() => {
    if (pathname !== "/" || !document.documentElement.dataset.veil) return;
    return onVeilClear(() => setDraw((current) => ({ run: current.run + 1, seconds: DRAW_SECONDS })), 0.3);
    // First mount only: later navigations keep the signature still.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      className="signature-mark"
      onPointerEnter={() => setDraw((current) => ({ run: current.run + 1, seconds: DRAW_SECONDS }))}
    >
      <Signature
        key={run}
        viewBox={MY_SIGNATURE?.viewBox}
        strokes={MY_SIGNATURE?.strokes}
        strokeWidth={18}
        duration={seconds}
        ariaLabel="Fathir Yudhistira signature"
      />
    </span>
  );
}
