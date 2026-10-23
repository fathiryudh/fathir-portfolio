"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import { onVeilClear } from "@/components/site/veil";
import type { SkillGroup } from "@/lib/site-content";

// Skill pills that drop into a box and pile up with a slight sideways lean, and can be grabbed and
// thrown — Balky Studio's about-page tags (Design References/balky.studio/About — Physics Tags).
// Unlike the reference (canvas sprites), the pills stay real list items; Matter only positions them.

const GRAVITY = { x: -0.15, y: 1 };
const WALL = 200;

export default function PhysicsTags({ items }: { items: { label: string; group: SkillGroup }[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const list = listRef.current;
    if (!box || !list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pills = [...list.children] as HTMLElement[];
    let teardown = () => {};
    // The pile is frozen while scrolled away, so it costs nothing off-screen.
    let onScreen = true;
    const view = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    view.observe(box);

    const build = () => {
      teardown();
      const width = box.clientWidth;
      const height = box.clientHeight;
      const engine = Matter.Engine.create({ gravity: GRAVITY });
      const walls = [
        Matter.Bodies.rectangle(width / 2, height + WALL / 2, width * 2, WALL, { isStatic: true }),
        Matter.Bodies.rectangle(-WALL / 2, height / 2, WALL, height * 4, { isStatic: true }),
        Matter.Bodies.rectangle(width + WALL / 2, height / 2, WALL, height * 4, { isStatic: true }),
      ];

      // Drop each pill from above the box, staggered so they tumble in rather than spawn in a block.
      const bodies = pills.map((pill, index) => {
        const w = pill.offsetWidth;
        const h = pill.offsetHeight;
        const x = w / 2 + Math.random() * Math.max(1, width - w);
        const y = -h - index * (h * 0.9);
        return Matter.Bodies.rectangle(x, y, w, h, {
          chamfer: { radius: h / 2 },
          restitution: 0.3,
          friction: 0.4,
          angle: (Math.random() - 0.5) * 0.6,
        });
      });
      Matter.Composite.add(engine.world, [...walls, ...bodies]);
      list.classList.add("is-live");

      let constraint: Matter.MouseConstraint | null = null;
      if (window.matchMedia("(pointer: fine)").matches) {
        const mouse = Matter.Mouse.create(box);
        // Matter grabs the wheel by default, which would stop the page scrolling over the box.
        const wheel = (mouse as unknown as { mousewheel: EventListener }).mousewheel;
        box.removeEventListener("wheel", wheel);
        box.removeEventListener("mousewheel", wheel);
        box.removeEventListener("DOMMouseScroll", wheel);
        constraint = Matter.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2 } });
        Matter.Composite.add(engine.world, constraint);
      }

      let raf = 0;
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(now - last, 32);
        last = now;
        raf = requestAnimationFrame(step);
        if (!onScreen) return;
        Matter.Engine.update(engine, dt);
        bodies.forEach((body, index) => {
          const pill = pills[index];
          pill.style.transform = `translate(${body.position.x - pill.offsetWidth / 2}px, ${
            body.position.y - pill.offsetHeight / 2
          }px) rotate(${body.angle}rad)`;
        });
      };
      raf = requestAnimationFrame(step);

      teardown = () => {
        cancelAnimationFrame(raf);
        if (constraint) Matter.Mouse.clearSourceEvents(constraint.mouse);
        Matter.Engine.clear(engine);
        Matter.Composite.clear(engine.world, false);
      };
    };

    let cancelVeil = () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        cancelVeil = onVeilClear(build);
      },
      { threshold: 0.3 },
    );
    observer.observe(box);

    let resizeTimer = 0;
    let lastWidth = box.clientWidth;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!list.classList.contains("is-live") || box.clientWidth === lastWidth) return;
        lastWidth = box.clientWidth;
        build();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      view.disconnect();
      cancelVeil();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      teardown();
    };
  }, []);

  return (
    <div ref={boxRef} className="tags-box">
      <ul ref={listRef} className="tags" aria-label="Tech stack">
        {items.map((item) => (
          <li key={item.label} className="tag-pill" data-group={item.group}>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
