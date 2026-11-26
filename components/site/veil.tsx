"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { startFlame } from "@/components/site/ascii-flame";
import { isLite } from "@/components/site/lite";

// Page transition + first-visit loader: a wall of ASCII fire (Getsuga colours, components/site/
// ascii-flame.ts). The wall rises from the bottom with flames licking its top edge while the old page
// recedes; the route swaps only once the screen is covered; then the wall drops back down with the
// flames riding its edge, uncovering the new page. The header rides above it during navigation. On the
// first visit of a session the fire is the loading bar, erupts at 100%, then the wall burns down.
//
// <html data-veil> (set before paint by the inline script in app/layout.tsx, then by this module):
//   boot | fast          page load, sheet covering, waiting to reveal
//   covering | covered  navigation in progress
//   revealing           sheet leaving
//   (absent)            idle

// Slow on purpose: the fire is the show.
const COVER = 1.6;
const REVEAL = 1.7;
const BOOT_REVEAL = 1.9;
const WALL_FIRE = { progress: 1, level: 1.5 }; // the wall's edge: lit full width, a little past a full plume
const ARRIVAL_TIMEOUT = 8000;
const PENDING = new Set(["boot", "fast", "covering", "covered"]);
// Phones and lite devices run everything at double speed: a long loader that eats every touch feels
// like a frozen page there. Desktop keeps the slow, showy pacing.
const pace = () => (window.matchMedia("(pointer: coarse)").matches || isLite() ? 2 : 1);
// The first-visit loader runs this much faster than the base timings below (transitions are unaffected).
const BOOT_SPEED = 1.5;
// Loading progress (%) with rests, so the fire burns across in bursts rather than at a constant crawl.
const PROGRESS = [0, 6, 13, 21, 34, 47, 58, 69, 81, 92, 100];
const PROGRESS_RESTS = [2, 4, 6, 8];

type Veil = { go: (href: string) => boolean };

const VeilContext = createContext<Veil>({ go: () => false });

export const useVeil = () => useContext(VeilContext);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const setState = (state: string | null) => {
  if (state) document.documentElement.dataset.veil = state;
  else delete document.documentElement.dataset.veil;
};

// Runs `callback` now, or once the sheet starts leaving if it is covering the page, so entrance
// animations play as content is uncovered rather than underneath the sheet.
export function onVeilClear(callback: () => void, lead = 0.4) {
  if (!PENDING.has(document.documentElement.dataset.veil ?? "")) {
    callback();
    return () => {};
  }
  let timer = 0;
  const onReveal = (event: Event) => {
    const duration = (event as CustomEvent<{ duration: number }>).detail?.duration ?? REVEAL;
    timer = window.setTimeout(callback, duration * lead * 1000);
  };
  document.addEventListener("veil:reveal", onReveal, { once: true });
  return () => {
    document.removeEventListener("veil:reveal", onReveal);
    clearTimeout(timer);
  };
}

const capped = (promise: Promise<unknown>, ms: number) =>
  Promise.race([promise.catch(() => {}), new Promise((resolve) => setTimeout(resolve, ms))]);

export function VeilProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const veilRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<HTMLCanvasElement>(null);
  const flame = useRef({ progress: 0, level: 1, stop: () => {} });
  const wallRef = useRef<HTMLDivElement>(null);
  const wallFlameRef = useRef<HTMLCanvasElement>(null);
  const wallStop = useRef(() => {});
  const target = useRef<string | null>(null);
  const watchdog = useRef(0);
  const busy = useRef(false);

  // Far enough down that the panel and the flames above it are both off screen.
  const parked = () => window.innerHeight * 1.7;

  const lightWall = useCallback(() => {
    wallStop.current();
    if (wallFlameRef.current) wallStop.current = startFlame(wallFlameRef.current, () => WALL_FIRE);
  }, []);

  const hide = useCallback(() => {
    const veil = veilRef.current;
    if (veil) veil.style.visibility = "hidden";
    gsap.set(wallRef.current, { y: parked() });
    flame.current.stop();
    wallStop.current();
    scrimRef.current?.style.setProperty("opacity", "0");
    setState(null);
    busy.current = false;
  }, []);

  const reveal = useCallback(
    (duration: number) => {
      const veil = veilRef.current;
      if (!veil) return;
      clearTimeout(watchdog.current);
      target.current = null;
      setState("revealing");
      veil.classList.add("is-js");
      document.querySelector("main")?.removeAttribute("inert");
      document.dispatchEvent(new CustomEvent("veil:reveal", { detail: { duration } }));
      const tl = gsap.timeline({ onComplete: hide });
      tl.to(scrimRef.current, { opacity: 0, duration: 0.3 }, 0);
      lightWall();
      tl.fromTo(wallRef.current, { y: 0 }, { y: parked(), duration, ease: "power3.inOut" }, 0);
    },
    [hide, lightWall],
  );

  // First visit: the fire is the loading bar. It burns across the bottom from left to right while fonts
  // and the page finish loading, and at 100% it erupts up the whole screen before the stripes wipe it.
  const boot = useCallback(async () => {
    const speed = pace() * BOOT_SPEED;
    const climb = { index: 0 };
    let skipped = false;
    const set = () => {
      const low = Math.floor(climb.index);
      const value = PROGRESS[low] + (PROGRESS[Math.min(low + 1, PROGRESS.length - 1)] - PROGRESS[low]) * (climb.index - low);
      flame.current.progress = value / 100;
    };
    if (flameRef.current) flame.current.stop = startFlame(flameRef.current, () => flame.current);
    const ready = Promise.all([
      capped(document.fonts.ready, 2500),
      capped(
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise((resolve) => window.addEventListener("load", resolve, { once: true })),
        4000,
      ),
    ]);
    const hops = gsap.timeline({ onUpdate: set }).timeScale(speed);
    // Tap, click or any key skips to the release (still after fonts and the page are ready).
    const skip = () => {
      skipped = true;
      hops.progress(1);
    };
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    let from = 0;
    for (const rest of PROGRESS_RESTS) {
      hops.to(climb, { index: rest, duration: 0.3 + (PROGRESS[rest] - PROGRESS[from]) * 0.024, ease: "power3.inOut" });
      hops.to({}, { duration: 0.28 });
      from = rest;
    }
    await Promise.all([ready, new Promise((resolve) => hops.eventCallback("onComplete", resolve))]);
    const rush = skipped ? 4 : speed; // a skip still shows the eruption, just quickly
    await new Promise((resolve) =>
      gsap.to(climb, { index: PROGRESS.length - 1, duration: 1 / rush, ease: "power2.out", onUpdate: set, onComplete: resolve }),
    );
    // 100%: the release. The fire surges to the top of the screen, holds, then the wall burns down.
    await new Promise((resolve) => gsap.to(flame.current, { level: 2, duration: 1.3 / rush, ease: "power2.in", onComplete: resolve }));
    await new Promise((resolve) => setTimeout(resolve, 650 / rush));
    window.removeEventListener("pointerdown", skip);
    window.removeEventListener("keydown", skip);
    reveal(BOOT_REVEAL / speed);
  }, [reveal]);

  useEffect(() => {
    const veil = veilRef.current;
    if (!veil) return;

    const initial = document.documentElement.dataset.veil;
    if (initial === "boot" || initial === "fast") {
      busy.current = true;
      veil.classList.add("is-js"); // JS owns it now: cancels the CSS failsafe, which would fade a slow loader at 4s
      veil.style.visibility = "visible";
      gsap.set(wallRef.current, { y: 0 });
      if (initial === "boot") {
        boot();
      } else {
        capped(document.fonts.ready, 1500).then(() => setTimeout(() => reveal(REVEAL / pace()), 120));
      }
    } else {
      hide();
    }
  }, [boot, hide, reveal]);

  // The route has swapped once the pathname matches; give the new page two frames to paint.
  useEffect(() => {
    if (!target.current || pathname !== target.current) return;
    requestAnimationFrame(() => requestAnimationFrame(() => reveal(REVEAL / pace())));
  }, [pathname, reveal]);

  useEffect(() => () => clearTimeout(watchdog.current), []);

  const go = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (busy.current || reducedMotion() || url.origin !== window.location.origin) return false;
      if (url.pathname === window.location.pathname) return false;
      const veil = veilRef.current;
      if (!veil) return false;

      busy.current = true;
      target.current = url.pathname;
      setState("covering");
      veil.classList.add("is-js");
      veil.style.visibility = "visible";
      lightWall();

      const tl = gsap.timeline({
        onComplete: () => {
          setState("covered");
          document.querySelector("main")?.setAttribute("inert", "");
          router.push(url.pathname + url.search + url.hash);
          // If the route never arrives, fall back to a hard navigation instead of leaving the sheet up.
          watchdog.current = window.setTimeout(() => window.location.assign(url.href), ARRIVAL_TIMEOUT);
        },
      });
      const cover = COVER / pace();
      tl.fromTo(wallRef.current, { y: parked() }, { y: 0, duration: cover, ease: "power3.inOut" }, 0);
      tl.to(scrimRef.current, { opacity: 0.55, duration: cover * 0.7, ease: "power2.out" }, 0);
      const page = document.querySelector<HTMLElement>("[data-page]");
      if (page) {
        // Recede toward the centre of what's on screen, not the top of the document.
        gsap.set(page, { transformOrigin: `50% ${window.scrollY + window.innerHeight / 2}px` });
        tl.to(page, { scale: 0.96, y: 10, duration: cover, ease: "power2.inOut" }, 0);
      }
      return true;
    },
    [lightWall, router],
  );

  return (
    <VeilContext.Provider value={{ go }}>
      {children}
      <div ref={scrimRef} className="veil-scrim" aria-hidden="true" />
      <div ref={veilRef} className="veil" aria-hidden="true">
        <div ref={wallRef} className="veil__wall">
          <canvas ref={wallFlameRef} className="veil__wall-fire" />
        </div>
        <div className="veil__boot">
          <canvas ref={flameRef} className="veil__flame" />
          <div className="veil__word">
            <span>Fathir Yudhistira</span>
            <span>Portfolio · Singapore</span>
          </div>
        </div>
      </div>
    </VeilContext.Provider>
  );
}

// A next/link that hands same-origin client navigations to the veil. Modifier-key clicks and
// new-tab links never reach onNavigate, so they behave normally.
export function TransitionLink({ href, onNavigate, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const { go } = useVeil();
  return (
    <Link
      href={href}
      onNavigate={(event) => {
        onNavigate?.(event);
        if (go(href)) event.preventDefault();
      }}
      {...props}
    />
  );
}
