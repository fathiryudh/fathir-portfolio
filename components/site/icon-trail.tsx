"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  SiC,
  SiDart,
  SiDocker,
  SiExpress,
  SiFirebase,
  SiFlutter,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiPhp,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

// A trail of tech-stack badges left behind the cursor, adapted from Deji Ajetomobi's footer
// (Design References/dejiajetomobi.com/Cursor Icon Trail): spawn by distance travelled, pop in with a
// random tilt, retire oldest-first with a throttle, never repeat a colour back to back.

const SPAWN_DISTANCE = 35;
const LIFESPAN = 750;
const REMOVAL_DELAY = 50;
const ENTER = "750ms cubic-bezier(.07,.5,.5,1)";
const EXIT_MS = 1000;
const EXIT = `${EXIT_MS}ms cubic-bezier(.87,0,.13,1)`;
const ROTATION_RANGE = 50;
const SCROLL_INTERVAL = 50;
const MEDIA = "(min-width: 801px) and (any-hover: hover)";

const COLORS = ["a", "b", "c", "d", "e"] as const;

const BADGES: { icon: ReactNode; label: string }[] = [
  { icon: <SiReact />, label: "React" },
  { icon: <SiNextdotjs />, label: "Next.js" },
  { icon: <SiTypescript />, label: "TypeScript" },
  { icon: <SiFlutter />, label: "Flutter" },
  { icon: <SiPython />, label: "Python" },
  { icon: <SiMongodb />, label: "MongoDB" },
  { icon: <SiDart />, label: "Dart" },
  { icon: <SiPostgresql />, label: "PostgreSQL" },
  { icon: <SiJavascript />, label: "JavaScript" },
  { icon: <SiFirebase />, label: "Firebase" },
  { icon: <SiTailwindcss />, label: "Tailwind CSS" },
  { icon: <SiMysql />, label: "MySQL" },
  { icon: <SiExpress />, label: "Express" },
  { icon: <SiSupabase />, label: "Supabase" },
  { icon: <SiDocker />, label: "Docker" },
  { icon: <SiC />, label: "C" },
  { icon: <SiPrisma />, label: "Prisma" },
  { icon: <SiPhp />, label: "PHP" },
  { icon: <SiVercel />, label: "Vercel" },
];

type Live = { element: HTMLElement; rotation: number; removeAt: number };

export default function IconTrail({ className, children }: { className?: string; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    const templates = templatesRef.current;
    if (!root || !layer || !templates) return;
    const media = window.matchMedia(MEDIA);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let stop = () => {};
    const start = () => {
      stop();
      if (!media.matches || reduce.matches) return;

      const sources = [...templates.children] as HTMLElement[];
      const live: Live[] = [];
      const timers = new Set<number>();
      const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, inside: false, moving: false };
      let movingTimer = 0;
      let lastRemoval = 0;
      let lastScroll = 0;
      let raf = 0;
      let queue: HTMLElement[] = [];
      let lastColor = "";
      let iconIndex = 0;

      // Cycle colours in a fresh shuffle each round, rotating the first if it would repeat the last shown.
      const nextColor = () => {
        if (queue.length === 0) {
          const order = [...COLORS].sort(() => Math.random() - 0.5);
          if (order[0] === lastColor) order.push(order.shift()!);
          queue = order.map((color) => {
            const element = sources[iconIndex++ % sources.length];
            const clone = element.cloneNode(true) as HTMLElement;
            clone.dataset.color = color;
            return clone;
          });
        }
        const next = queue.shift()!;
        lastColor = next.dataset.color ?? "";
        return next;
      };

      const inside = () => {
        const rect = root.getBoundingClientRect();
        return pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom;
      };

      const spawn = () => {
        const element = nextColor();
        const rect = root.getBoundingClientRect();
        const rotation = (Math.random() - 0.5) * ROTATION_RANGE;
        element.style.left = `${pointer.x - rect.left}px`;
        element.style.top = `${pointer.y - rect.top}px`;
        element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`;
        element.style.transition = `transform ${ENTER}`;
        layer.append(element);
        const timer = window.setTimeout(() => {
          element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
          timers.delete(timer);
        }, 10);
        timers.add(timer);
        live.push({ element, rotation, removeAt: Date.now() + LIFESPAN });
      };

      const retire = () => {
        const now = Date.now();
        if (now - lastRemoval < REMOVAL_DELAY || live.length === 0 || now < live[0].removeAt) return;
        const oldest = live.shift()!;
        oldest.element.style.transition = `transform ${EXIT}`;
        oldest.element.style.transform = `translate(-50%, -50%) rotate(${oldest.rotation}deg) scale(0)`;
        lastRemoval = now;
        const timer = window.setTimeout(() => {
          oldest.element.remove();
          timers.delete(timer);
        }, EXIT_MS);
        timers.add(timer);
      };

      const loop = () => {
        if (pointer.inside && pointer.moving && Math.hypot(pointer.x - pointer.lastX, pointer.y - pointer.lastY) > SPAWN_DISTANCE) {
          pointer.lastX = pointer.x;
          pointer.lastY = pointer.y;
          spawn();
        }
        retire();
        raf = requestAnimationFrame(loop);
      };

      const onMove = (event: MouseEvent) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.inside = inside();
        if (!pointer.inside) return;
        pointer.moving = true;
        clearTimeout(movingTimer);
        movingTimer = window.setTimeout(() => (pointer.moving = false), 100);
      };

      // Content scrolling under a resting cursor still leaves a trail.
      const onScroll = () => {
        pointer.inside = inside();
        const now = Date.now();
        if (!pointer.inside || now - lastScroll < SCROLL_INTERVAL) return;
        lastScroll = now;
        spawn();
      };

      document.addEventListener("mousemove", onMove);
      window.addEventListener("scroll", onScroll, { passive: true });
      raf = requestAnimationFrame(loop);

      stop = () => {
        document.removeEventListener("mousemove", onMove);
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(raf);
        clearTimeout(movingTimer);
        timers.forEach((timer) => clearTimeout(timer));
        layer.replaceChildren();
      };
    };

    start();
    media.addEventListener("change", start);
    reduce.addEventListener("change", start);
    return () => {
      media.removeEventListener("change", start);
      reduce.removeEventListener("change", start);
      stop();
    };
  }, []);

  return (
    <div ref={rootRef} className={`trail ${className ?? ""}`}>
      <div ref={layerRef} className="trail__layer" aria-hidden="true" />
      <div ref={templatesRef} hidden>
        {BADGES.map((badge) => (
          <span key={badge.label} className="trail__badge">
            {badge.icon}
          </span>
        ))}
      </div>
      <div className="trail__content">{children}</div>
    </div>
  );
}
