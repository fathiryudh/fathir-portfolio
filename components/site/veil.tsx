"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { VeilPaper } from "@/components/site/veil-paper";

// Page transition + first-visit loader, after Carter Ogunsola's veil (Design References/
// carterogunsola.com/Page Transition — Torn Paper Veil). A paper sheet sweeps up over the page with a
// torn, fibrous leading edge while the old page recedes; the route swaps only once the screen is
// covered; the same sheet keeps travelling up and off, its torn trailing edge uncovering the new page.
// The header rides above the sheet during navigation. On the first visit of a session the sheet starts
// down and a counter climbs to 100 before the first reveal.
//
// <html data-veil> (set before paint by the inline script in app/layout.tsx, then by this module):
//   boot | fast          page load, sheet covering, waiting to reveal
//   covering | covered  navigation in progress
//   revealing           sheet leaving
//   (absent)            idle

const COVER = 1.3;
const REVEAL = 1.1;
const BOOT_REVEAL = 1.3;
const ARRIVAL_TIMEOUT = 8000;
const PENDING = new Set(["boot", "fast", "covering", "covered"]);
const COUNTER = [0, 6, 13, 21, 34, 47, 58, 69, 81, 92, 100];
const COUNTER_RESTS = [2, 4, 6, 8];

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLSpanElement>(null);
  const travelRef = useRef<HTMLDivElement>(null);
  const paper = useRef<VeilPaper | null>(null);
  const edges = useRef({ top: 0, bottom: 0 });
  const target = useRef<string | null>(null);
  const watchdog = useRef(0);
  const busy = useRef(false);

  // One source of truth for the sheet's shape: the clip-path straight edges and the shader's tears.
  const draw = useCallback(() => {
    const veil = veilRef.current;
    if (!veil) return;
    const { top, bottom } = edges.current;
    veil.style.clipPath = `inset(${(top * 100).toFixed(3)}% 0% ${(bottom * 100).toFixed(3)}% 0%)`;
    paper.current?.render(top, bottom);
  }, []);

  const hide = useCallback(() => {
    const veil = veilRef.current;
    if (veil) veil.style.visibility = "hidden";
    scrimRef.current?.style.setProperty("opacity", "0");
    setState(null);
    busy.current = false;
  }, []);

  const reveal = useCallback(
    (duration: number, exitCounter = false) => {
      const veil = veilRef.current;
      if (!veil) return;
      clearTimeout(watchdog.current);
      target.current = null;
      setState("revealing");
      veil.classList.add("is-js");
      document.querySelector("main")?.removeAttribute("inert");
      document.dispatchEvent(new CustomEvent("veil:reveal", { detail: { duration } }));
      edges.current = { top: 0, bottom: 0 };
      const tl = gsap.timeline({ onComplete: hide });
      tl.to(scrimRef.current, { opacity: 0, duration: 0.3 }, 0);
      tl.to(edges.current, { bottom: 1, duration, ease: "expo.inOut", onUpdate: draw }, 0);
      if (exitCounter && travelRef.current) {
        tl.to(travelRef.current, { y: -window.innerHeight, duration: 0.8, ease: "expo.inOut" }, 0);
      }
    },
    [draw, hide],
  );

  // First visit: climb the counter while fonts and the page finish loading, then reveal.
  const boot = useCallback(async () => {
    const strip = stripRef.current;
    const travel = travelRef.current;
    const climb = { index: 0 };
    const rise = Math.max(0, window.innerHeight - 220);
    const set = () => {
      if (strip) strip.style.transform = `translateY(${-climb.index}em)`;
      const low = Math.floor(climb.index);
      const value = COUNTER[low] + (COUNTER[Math.min(low + 1, COUNTER.length - 1)] - COUNTER[low]) * (climb.index - low);
      if (travel) travel.style.transform = `translateY(${(-rise * value) / 100}px)`;
    };
    const ready = Promise.all([
      capped(document.fonts.ready, 2500),
      capped(
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise((resolve) => window.addEventListener("load", resolve, { once: true })),
        4000,
      ),
    ]);
    const hops = gsap.timeline({ onUpdate: set });
    let from = 0;
    for (const rest of COUNTER_RESTS) {
      hops.to(climb, { index: rest, duration: 0.18 + (COUNTER[rest] - COUNTER[from]) * 0.012, ease: "power3.inOut" });
      hops.to({}, { duration: 0.12 });
      from = rest;
    }
    await Promise.all([ready, new Promise((resolve) => hops.eventCallback("onComplete", resolve))]);
    await new Promise((resolve) =>
      gsap.to(climb, { index: COUNTER.length - 1, duration: 0.6, ease: "power2.out", onUpdate: set, onComplete: resolve }),
    );
    await new Promise((resolve) => setTimeout(resolve, 180));
    reveal(BOOT_REVEAL, true);
  }, [reveal]);

  useEffect(() => {
    const veil = veilRef.current;
    const canvas = canvasRef.current;
    if (!veil || !canvas) return;

    paper.current = VeilPaper.create(canvas);
    if (paper.current) {
      paper.current.resize();
      veil.classList.add("is-gl");
    }
    const onResize = () => {
      paper.current?.resize();
      if (veil.style.visibility !== "hidden") draw();
    };
    window.addEventListener("resize", onResize);
    const themeObserver = new MutationObserver(() => {
      paper.current?.readTheme();
      if (veil.style.visibility !== "hidden") draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const initial = document.documentElement.dataset.veil;
    if (initial === "boot" || initial === "fast") {
      busy.current = true;
      veil.style.visibility = "visible";
      edges.current = { top: 0, bottom: 0 };
      draw();
      if (initial === "boot") {
        boot();
      } else {
        capped(document.fonts.ready, 1500).then(() => setTimeout(() => reveal(REVEAL), 120));
      }
    } else {
      hide();
    }

    return () => {
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
    };
  }, [boot, draw, hide, reveal]);

  // The route has swapped once the pathname matches; give the new page two frames to paint.
  useEffect(() => {
    if (!target.current || pathname !== target.current) return;
    requestAnimationFrame(() => requestAnimationFrame(() => reveal(REVEAL)));
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
      edges.current = { top: 1, bottom: 0 };
      draw();

      const tl = gsap.timeline({
        onComplete: () => {
          setState("covered");
          document.querySelector("main")?.setAttribute("inert", "");
          router.push(url.pathname + url.search + url.hash);
          // If the route never arrives, fall back to a hard navigation instead of leaving the sheet up.
          watchdog.current = window.setTimeout(() => window.location.assign(url.href), ARRIVAL_TIMEOUT);
        },
      });
      tl.to(edges.current, { top: 0, duration: COVER, ease: "expo.inOut", onUpdate: draw }, 0);
      tl.to(scrimRef.current, { opacity: 0.55, duration: COVER * 0.7, ease: "power2.out" }, 0);
      const page = document.querySelector<HTMLElement>("[data-page]");
      if (page) {
        // Recede toward the centre of what's on screen, not the top of the document.
        gsap.set(page, { transformOrigin: `50% ${window.scrollY + window.innerHeight / 2}px` });
        tl.to(page, { scale: 0.96, y: 10, duration: COVER, ease: "power2.inOut" }, 0);
      }
      return true;
    },
    [draw, router],
  );

  return (
    <VeilContext.Provider value={{ go }}>
      {children}
      <div ref={scrimRef} className="veil-scrim" aria-hidden="true" />
      <div ref={veilRef} className="veil" aria-hidden="true">
        <canvas ref={canvasRef} className="veil__paper" />
        <div className="veil__boot">
          <div className="veil__word">
            <span>Fathir Yudhistira</span>
            <span>Portfolio · Singapore</span>
          </div>
          <div ref={travelRef} className="veil__travel">
            <span className="veil__count">
              <span ref={stripRef} className="veil__strip">
                {COUNTER.map((value) => (
                  <span key={value} className="veil__cell">
                    {value}
                  </span>
                ))}
              </span>
            </span>
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
