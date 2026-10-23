"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink, onVeilClear } from "@/components/site/veil";
import { Fps, SgClock } from "@/components/site/live-readouts";
import SignatureMark from "@/components/site/signature-mark";
import CommandMenu from "@/components/site/command-menu";
import { projects } from "@/lib/site-content";

// Header after Carter Ogunsola's (Design References/carterogunsola.com/Header, HUD & Nav Pill):
// a HUD strip of live readouts; the logo with a capsule whose word rolls to the current page; a
// centred nav pill whose highlight slides to the hovered link and settles on the active one, with
// letters that roll on hover; a ⌘K command menu and a light/dark toggle on the right.

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/library", label: "Library" },
  { href: "/contact", label: "Contact" },
];

function pageName(pathname: string) {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/work/")) {
    return projects.find((project) => `/work/${project.slug}` === pathname)?.title ?? "Work";
  }
  if (pathname.startsWith("/work")) return "Work";
  if (pathname.startsWith("/about")) return "About";
  return "Fathir";
}

// Letters that roll up on hover; the second copy is a text-shadow one line below (no duplicate DOM).
function RollText({ text }: { text: string }) {
  return (
    <span className="roll" aria-hidden="true">
      {[...text].map((char, index) => (
        <span key={index} style={{ "--index": index } as CSSProperties}>
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

// The capsule beside the logo: its word odometer-rolls to the current page name as each new page is
// revealed, and its width eases to fit the new word.
function PageCapsule({ pathname }: { pathname: string }) {
  const [state, setState] = useState(() => ({ word: pageName(pathname), previous: "", run: 0 }));
  const capsuleRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const next = pageName(pathname);
    return onVeilClear(() => {
      setState((current) => (current.word === next ? current : { word: next, previous: current.word, run: current.run + 1 }));
    }, 0.5);
  }, [pathname]);

  useLayoutEffect(() => {
    const capsule = capsuleRef.current;
    const measure = measureRef.current;
    if (capsule && measure) capsule.style.width = `${measure.offsetWidth}px`;
  }, [state.word]);

  return (
    <span ref={capsuleRef} className="capsule" aria-hidden="true">
      <span ref={measureRef} className="capsule__measure">
        {state.word}
      </span>
      {state.previous ? (
        <span key={`out-${state.run}`} className="capsule__word capsule__word--out">
          {[...state.previous].map((char, index) => (
            <span key={index} style={{ "--index": index } as CSSProperties}>
              {char}
            </span>
          ))}
        </span>
      ) : null}
      <span key={`in-${state.run}`} className={`capsule__word${state.run ? " capsule__word--in" : ""}`}>
        {[...state.word].map((char, index) => (
          <span key={index} style={{ "--index": index } as CSSProperties}>
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}

function subscribeTheme(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function setTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.dataset.theme ?? "light",
    () => "light",
  );
  return (
    <div className="themetoggle" role="group" aria-label="Colour theme" data-theme-state={theme}>
      <span className="themetoggle__bg" aria-hidden="true" />
      <button type="button" aria-label="Light theme" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
        </svg>
      </button>
      <button type="button" aria-label="Dark theme" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      </button>
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const destination = useRef<string | null>(null);

  const activeIndex = useCallback((path: string) => {
    return LINKS.findIndex((link) => path === link.href || path.startsWith(`${link.href}/`));
  }, []);

  // Move the pill under a link. Without animation (first placement), skip the transition.
  const place = useCallback((index: number, animate: boolean, hovering = false) => {
    const nav = navRef.current;
    const pill = pillRef.current;
    const link = linkRefs.current[index];
    if (!nav || !pill) return;
    if (!link) {
      pill.style.opacity = "0";
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    pill.classList.toggle("is-hover", hovering);
    if (!animate) pill.style.transition = "none";
    pill.style.transform = `translate(${rect.left - navRect.left - nav.clientLeft}px, ${rect.top - navRect.top - nav.clientTop}px)`;
    pill.style.width = `${rect.width}px`;
    pill.style.height = `${rect.height}px`;
    pill.style.opacity = "1";
    if (!animate) {
      void pill.offsetWidth;
      pill.style.transition = "";
    }
  }, []);

  const settle = useCallback(
    (animate: boolean) => place(activeIndex(destination.current ?? pathname), animate),
    [activeIndex, pathname, place],
  );

  useEffect(() => {
    destination.current = null;
    settle(true);
  }, [pathname, settle]);

  useEffect(() => {
    let first = true;
    const observer = new ResizeObserver(() => {
      settle(!first);
      first = false;
    });
    if (navRef.current) observer.observe(navRef.current);
    document.fonts?.ready.then(() => settle(false));
    return () => observer.disconnect();
  }, [settle]);

  // Hide on scroll down past the fold, show again on any scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 140 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  return (
    <header className={`site-header${hidden && !open && !commandOpen ? " is-hidden" : ""}${open ? " is-open" : ""}`}>
      <div className="hud" aria-hidden="true">
        <span className="hud__chip">
          <span className="hud__k">SGT::</span>
          <SgClock className="hud__v" />
        </span>
        <span className="hud__chip">
          <span className="hud__k">FPS::</span>
          <Fps className="hud__v" />
        </span>
        <span className="hud__chip hud__chip--wide">
          <span className="hud__k">BASED::</span>
          <span className="hud__v">SINGAPORE</span>
        </span>
        <span className="hud__chip hud__chip--wide">
          <span className="hud__k">STUDYING::</span>
          <span className="hud__v">SIT &apos;26</span>
        </span>
      </div>

      <div className="site-header__bar">
        <div className="site-header__lead">
          <TransitionLink href="/" className="site-header__logo" aria-label="Fathir Yudhistira, home" onClick={() => setOpen(false)}>
            <SignatureMark />
            <PageCapsule pathname={pathname} />
          </TransitionLink>
        </div>

        <div className="site-header__center">
          <nav
            ref={navRef}
            id="site-nav"
            className="navpill"
            aria-label="Primary"
            onPointerLeave={() => fine() && settle(true)}
          >
            <span ref={pillRef} className="navpill__pill" aria-hidden="true" />
            <ul className="navpill__list">
              {LINKS.map((link, index) => (
                <li key={link.href}>
                  <TransitionLink
                    ref={(element) => {
                      linkRefs.current[index] = element;
                    }}
                    href={link.href}
                    className="navpill__link"
                    aria-current={activeIndex(pathname) === index ? "page" : undefined}
                    aria-label={link.label}
                    onPointerEnter={() => fine() && place(index, true, true)}
                    onClick={() => {
                      destination.current = link.href;
                      setOpen(false);
                    }}
                  >
                    <RollText text={link.label} />
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            className="cmdk"
            aria-label="Open command menu"
            aria-keyshortcuts="Meta+K Control+K"
            onClick={() => setCommandOpen(true)}
          >
            <RollText text="⌘K" />
          </button>
        </div>

        <div className="site-header__right">
          <ThemeToggle />
          <button
            type="button"
            className="site-header__burger"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <CommandMenu open={commandOpen} onClose={() => setCommandOpen(false)} />
    </header>
  );
}
