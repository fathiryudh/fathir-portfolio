"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// A tuner dial for picking one of N, after Carter Ogunsola's Lab dial (Design References/
// carterogunsola.com/Lab — Dial, Lab Source — Dial). The items sit on a ring whose hub is off to the
// left; only its right cap shows, the rest is painted back over by one conic gradient in the page
// colour. Whichever item crosses the horizontal axis is live. Your hand sets a target, the dial damps
// toward it a beat behind so it has weight, and on release it settles into the nearest detent with
// an elastic overshoot. The list is endless: past the last item it comes round to the first.

const SLICE = 15; // degrees between items; 24 per turn keeps the tick ruler aligned
const TICKS_PER_SLICE = 5;
const DAMP_DRAG = 15; // follow while dragging: laggy, has weight
const DAMP_IDLE = 25; // follow at rest: settles quicker
const STEP_PX = 62; // pointer travel per detent
const SNAP = { ease: "elastic.out(2, 0.6)", duration: 0.8 };
const KNOB_R = 0.55; // knob and tick ruler radii as a fraction of the ring radius
const TICK_R = 0.72;
const FADE_FROM = 38; // items fade out between these angles off the axis
const FADE_TO = 64;

export type DialItem = { id: string; label: string };
export type DialControl = { settleTo: (index: number) => void };

// A detent click you can feel on phones. Android: the Vibration API. iOS Safari has no Vibration
// API, but iOS 18+ plays its native haptic tick when a switch-style checkbox is toggled, so a hidden
// one is toggled instead (older iOS: nothing happens). Both only fire inside an input event handler,
// never from an animation frame, so detents are counted off the pointer, not the rendered dial.
function createHaptics() {
  if (!window.matchMedia("(pointer: coarse)").matches) return () => {};
  if ("vibrate" in navigator) return () => navigator.vibrate(8);
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.append(input);
  label.setAttribute("aria-hidden", "true");
  label.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden";
  document.body.append(label);
  const tick = () => label.click();
  tick.dispose = () => label.remove();
  return tick;
}

const DEG = Math.PI / 180;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const mod = (value: number, n: number) => ((value % n) + n) % n;
const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export default function Dial({
  items,
  initial = 0,
  label,
  onChange,
  controlRef,
}: {
  items: DialItem[];
  initial?: number;
  label: string;
  onChange: (index: number) => void;
  controlRef?: React.RefObject<DialControl | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rotorRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const onChangeRef = useRef(onChange);
  const apiRef = useRef<{ settleTo: (index: number) => void; moved: () => boolean } | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const root = rootRef.current;
    const rotor = rotorRef.current;
    const knob = knobRef.current;
    const index = indexRef.current;
    if (!root || !rotor || !knob || !index) return;
    const els = itemRefs.current.slice(0, items.length) as HTMLButtonElement[];
    const count = items.length;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const haptic = createHaptics() as (() => void) & { dispose?: () => void };

    let cx = 0;
    let cy = 0;
    let radius = 320;
    let target = mod(initial, count);
    let current = target;
    let active = -1;
    let dirty = true;
    let dragging = false;
    let moved = false;
    let pressY = 0;
    let pressTarget = 0;
    let snap: gsap.core.Tween | null = null;
    let wheelIdle = 0;
    let felt = Math.round(target); // last detent the hand was buzzed for

    // Call from input handlers only: buzz when the hand drives target across a detent.
    const feel = () => {
      const detent = Math.round(target);
      if (detent === felt) return;
      felt = detent;
      haptic();
    };

    const measure = () => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      cy = height / 2;
      const narrow = width < 600;
      radius = clamp(Math.min(height * 0.38, 340), narrow ? 150 : 200, 340);
      // On phones the axis sits further left so long labels still fit to its right.
      const vertexX = clamp(width * (narrow ? 0.34 : 0.5), radius * 0.62, width - 160);
      cx = vertexX - radius;
      const knobSize = clamp(radius * 0.15, 40, 56);
      knob.style.left = `${cx + radius * KNOB_R}px`;
      knob.style.width = knob.style.height = `${knobSize}px`;
      index.style.left = `${cx + radius * TICK_R - 6}px`;
      rotor.style.left = `${cx}px`;
      rotor.style.top = `${cy}px`;
      root.style.setProperty("--dial-cx", `${cx}px`);
      root.style.setProperty("--dial-cy", `${cy}px`);

      const count = (360 / SLICE) * TICKS_PER_SLICE;
      const fragment = document.createDocumentFragment();
      for (let k = 0; k < count; k++) {
        const major = k % TICKS_PER_SLICE === 0;
        const tick = document.createElement("span");
        tick.className = major ? "dial__tick dial__tick--major" : "dial__tick";
        tick.style.width = `${major ? 18 : 8}px`;
        tick.style.transform = `rotate(${k * (360 / count)}deg) translateX(${radius * TICK_R}px)`;
        fragment.appendChild(tick);
      }
      rotor.replaceChildren(fragment);
      dirty = true;
    };

    const render = () => {
      els.forEach((el, i) => {
        // Shortest way round the loop, so items wrap from one end to the other.
        let offset = mod(i - current, count);
        if (offset > count / 2) offset -= count;
        const angle = offset * SLICE;
        const x = cx + radius * Math.cos(angle * DEG);
        const y = cy + radius * Math.sin(angle * DEG);
        el.style.transform = `translate(${x}px, ${y}px) translateY(-50%) rotate(${angle}deg)`;
        const fade = clamp((Math.abs(angle) - FADE_FROM) / (FADE_TO - FADE_FROM), 0, 1);
        el.style.opacity = String(1 - fade);
        el.style.visibility = fade >= 1 ? "hidden" : "visible";
      });
      rotor.style.transform = `rotate(${-current * SLICE}deg)`;
      knob.style.transform = `translate(-50%, -50%) rotate(${current * SLICE * 2}deg)`;

      const next = mod(Math.round(current), count);
      if (next !== active) {
        els[active]?.classList.remove("is-active");
        els[active]?.setAttribute("aria-selected", "false");
        active = next;
        els[next].classList.add("is-active");
        els[next].setAttribute("aria-selected", "true");
        root.setAttribute("aria-activedescendant", els[next].id);
        onChangeRef.current(next);
      }
    };

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 64) / 1000 || 0.016;
      const next = reduced ? target : damp(current, target, dragging ? DAMP_DRAG : DAMP_IDLE, dt);
      if (Math.abs(next - current) > 5e-5) {
        current = next;
        dirty = true;
      } else if (current !== target) {
        current = target;
        dirty = true;
      }
      if (!dirty) return;
      dirty = false;
      render();
    };

    // `to` is an item index; it settles via whichever direction round the loop is shorter.
    const settleTo = (to: number, absolute = false) => {
      snap?.kill();
      if (absolute) {
        to = Math.round(to);
      } else {
        let delta = mod(to - Math.round(target), count);
        if (delta > count / 2) delta -= count;
        to = Math.round(target) + delta;
      }
      if (reduced) {
        target = to;
        dirty = true;
        return to;
      }
      const from = target;
      const progress = { p: 0 };
      snap = gsap.to(progress, {
        p: 1,
        ...SNAP,
        onUpdate: () => {
          target = from + (to - from) * progress.p;
          dirty = true;
        },
        onComplete: () => {
          snap = null;
        },
      });
      return to;
    };
    // An item tap is one detent jump however far it travels, so it gets one buzz.
    const tapTo = (to: number) => {
      const dest = settleTo(to);
      if (dest !== felt) haptic();
      felt = dest;
    };
    apiRef.current = { settleTo: tapTo, moved: () => moved };
    if (controlRef) controlRef.current = { settleTo };

    const controller = new AbortController();
    const { signal } = controller;

    root.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== 0) return;
        snap?.kill();
        snap = null;
        dragging = true;
        moved = false;
        felt = Math.round(target);
        pressY = event.clientY;
        pressTarget = target;
        root.classList.add("is-dragging");
      },
      { signal },
    );
    window.addEventListener(
      "pointermove",
      (event) => {
        if (!dragging) return;
        const dy = event.clientY - pressY;
        if (!moved && Math.abs(dy) > 4) moved = true;
        target = pressTarget - dy / STEP_PX;
        dirty = true;
        feel();
      },
      { signal },
    );
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("is-dragging");
      settleTo(target, true);
    };
    window.addEventListener("pointerup", endDrag, { signal });
    window.addEventListener("pointercancel", endDrag, { signal });

    root.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        snap?.kill();
        snap = null;
        target += event.deltaY / (STEP_PX * 3);
        dirty = true;
        feel();
        clearTimeout(wheelIdle);
        wheelIdle = window.setTimeout(() => settleTo(target, true), 150);
      },
      { passive: false, signal },
    );

    root.addEventListener(
      "keydown",
      (event) => {
        const step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[event.key];
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          settleTo(event.key === "Home" ? 0 : count - 1);
        } else if (step) {
          event.preventDefault();
          settleTo(Math.round(target) + step, true);
        }
      },
      { signal },
    );

    measure();
    render();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    gsap.ticker.add(tick);

    // Wind in from a couple of detents back.
    if (!reduced) {
      const wind = { p: 1 };
      gsap.to(wind, {
        p: 0,
        duration: 1.4,
        ease: "expo.out",
        delay: 0.1,
        onUpdate: () => {
          current = target - wind.p * 2.5;
          dirty = true;
        },
      });
      gsap.from(knob, { scale: 0.4, rotate: -160, duration: 1, ease: "expo.out", delay: 0.05 });
    }

    return () => {
      controller.abort();
      observer.disconnect();
      gsap.ticker.remove(tick);
      snap?.kill();
      gsap.killTweensOf(knob);
      clearTimeout(wheelIdle);
      apiRef.current = null;
      if (controlRef) controlRef.current = null;
      haptic.dispose?.();
    };
    // The dial owns its position after mount; `initial` only seeds it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <div ref={rootRef} className="dial" role="listbox" tabIndex={0} aria-label={label} data-lenis-prevent>
      <div className="dial__ticks" aria-hidden="true">
        <div ref={rotorRef} className="dial__rotor" />
      </div>
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          id={`dial-${item.id}`}
          type="button"
          role="option"
          aria-selected="false"
          tabIndex={-1}
          className="dial__item"
          onClick={(event) => {
            if (apiRef.current?.moved()) {
              event.preventDefault();
              return;
            }
            apiRef.current?.settleTo(i);
          }}
        >
          <span className="dial__num">{String(i + 1).padStart(2, "0")}</span>
          <span className="dial__label">{item.label}</span>
        </button>
      ))}
      <div className="dial__cover" aria-hidden="true" />
      <span ref={indexRef} className="dial__index" aria-hidden="true" />
      <span ref={knobRef} className="dial__knob" aria-hidden="true">
        <span className="dial__grip" />
      </span>
    </div>
  );
}
