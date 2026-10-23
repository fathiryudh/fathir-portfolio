"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import gsap from "gsap";
import { TransitionLink } from "@/components/site/veil";
import { Reveal } from "@/components/site/reveal";
import { projectCategories, type Project } from "@/lib/site-content";

// Project list as editorial rows (Balky Studio's typographic lists) with an image that follows the
// cursor while a row is hovered and leans with its velocity — a DOM take on Balky's WebGL hover
// reveal (Design References/balky.studio/Hover Image Reveals). Fine pointers only.

const FOLLOW_MEDIA = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribeFollow(listener: () => void) {
  const media = window.matchMedia(FOLLOW_MEDIA);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export default function WorkRows({ projects, filterable = false }: { projects: Project[]; filterable?: boolean }) {
  const followerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const visibleProjects = category ? projects.filter((project) => project.categories.includes(category)) : projects;
  const enabled = useSyncExternalStore(
    subscribeFollow,
    () => window.matchMedia(FOLLOW_MEDIA).matches,
    () => false,
  );

  useEffect(() => {
    const follower = followerRef.current;
    if (!enabled || !follower) return;
    const toX = gsap.quickTo(follower, "x", { duration: 0.6, ease: "power3.out" });
    const toY = gsap.quickTo(follower, "y", { duration: 0.6, ease: "power3.out" });
    const toRotate = gsap.quickTo(follower, "rotation", { duration: 0.8, ease: "power3.out" });
    let lastX = 0;
    const onMove = (event: PointerEvent) => {
      toX(event.clientX);
      toY(event.clientY);
      toRotate(gsap.utils.clamp(-8, 8, (event.clientX - lastX) * 0.4));
      lastX = event.clientX;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  useEffect(() => {
    const follower = followerRef.current;
    if (!enabled || !follower) return;
    gsap.to(follower, {
      scale: active === null ? 0.6 : 1,
      autoAlpha: active === null ? 0 : 1,
      duration: active === null ? 0.35 : 0.6,
      ease: "expo.out",
      overwrite: "auto",
    });
  }, [active, enabled]);

  return (
    <div className="work-rows" onPointerLeave={() => setActive(null)}>
      {filterable ? (
        <div className="work-filters" role="group" aria-label="Filter projects by category">
          {["All", ...projectCategories].map((item) => (
            <button
              key={item}
              type="button"
              className="work-filter label"
              aria-pressed={category === (item === "All" ? null : item)}
              onClick={() => {
                setActive(null);
                setCategory(item === "All" ? null : item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <div className="work-rows__head label" aria-hidden="true">
        <span>No.</span>
        <span>Project</span>
        <span className="work-rows__hide-sm">Categories</span>
        <span className="work-rows__hide-sm">Status</span>
      </div>
      <ul>
        {visibleProjects.map((project, index) => (
          <Reveal as="li" key={project.slug} delay={index}>
            <TransitionLink
              href={`/work/${project.slug}`}
              className={`work-row${active !== null && active !== index ? " is-dim" : ""}`}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
            >
              <span className="work-row__no">{String(index + 1).padStart(2, "0")}</span>
              <span className="work-row__title">{project.title}</span>
              <span className="work-row__categories">{project.categories.join(" · ")}</span>
              <span className="work-row__status work-rows__hide-sm">{project.status}</span>
              <span className="work-row__arrow" aria-hidden="true">
                <span>→</span>
                <span>→</span>
              </span>
            </TransitionLink>
          </Reveal>
        ))}
      </ul>

      {enabled ? (
        <div ref={followerRef} className="work-follower" aria-hidden="true">
          {visibleProjects.map((project, index) => (
            <div key={project.slug} className={`work-follower__card${active === index ? " is-active" : ""}`}>
              {project.image ? (
                <Image
                  src={project.image.src}
                  alt=""
                  width={project.image.width}
                  height={project.image.height}
                  sizes="360px"
                  className={project.image.blur ? "is-blurred" : undefined}
                  style={{ objectPosition: project.image.position ?? "center" }}
                />
              ) : (
                <span className="work-follower__placeholder">{project.title}</span>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
