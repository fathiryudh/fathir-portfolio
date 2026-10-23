"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { TransitionLink } from "@/components/site/veil";
import { MaskText, Reveal } from "@/components/site/reveal";
import { Fps, SgClock } from "@/components/site/live-readouts";
import { projects, skills } from "@/lib/site-content";

// Live previews for the library, one per entry slug. Heavier pieces load only when picked.

const LiquidGradient = dynamic(() => import("@/components/site/liquid-gradient"));
const IconTrail = dynamic(() => import("@/components/site/icon-trail"));
const PhysicsTags = dynamic(() => import("@/components/site/physics-tags"));
const WorkRows = dynamic(() => import("@/components/site/work-rows"));
const CommandMenu = dynamic(() => import("@/components/site/command-menu"));
const Letter = dynamic(() => import("@/components/contact/letter"));

function Hint({ children }: { children: ReactNode }) {
  return <p className="lib-demo__hint label muted">{children}</p>;
}

function Replay({ children }: { children: (run: number) => ReactNode }) {
  const [run, setRun] = useState(0);
  return (
    <>
      {children(run)}
      <button type="button" className="lib-demo__btn label" onClick={() => setRun((value) => value + 1)}>
        Replay
      </button>
    </>
  );
}

function CommandMenuDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lib-demo lib-demo--center">
      <button type="button" className="lib-demo__btn lib-demo__btn--big label" onClick={() => setOpen(true)}>
        Open ⌘K
      </button>
      <Hint>Also on every page with ⌘K / Ctrl K</Hint>
      <CommandMenu open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

// New entries: one self-contained file per component under ./demos, default export = the demo.
export const demos: Record<string, ComponentType> = {
  "receipt-printer": dynamic(() => import("./demos/receipt-printer")),
  "hold-to-confirm": dynamic(() => import("./demos/hold-to-confirm")),
  "tactile-button": dynamic(() => import("./demos/tactile-button")),
  "dynamic-button": dynamic(() => import("./demos/dynamic-button")),
  "scramble-text": dynamic(() => import("./demos/scramble-text")),
  "logo-trace-loader": dynamic(() => import("./demos/logo-trace-loader")),
  "magnetic-drop-zone": dynamic(() => import("./demos/magnetic-drop-zone")),
  "scroll-fade-list": dynamic(() => import("./demos/scroll-fade-list")),
  "ticket": dynamic(() => import("./demos/ticket")),
  "stamp": dynamic(() => import("./demos/stamp")),
  "iridescent-foil": dynamic(() => import("./demos/iridescent-foil")),
  dial: () => (
    <div className="lib-demo lib-demo--center">
      <p className="lib-demo__big">You’re spinning it.</p>
      <Hint>Drag, scroll or use the arrow keys on the left</Hint>
    </div>
  ),
  "liquid-gradient": () => (
    <div className="lib-demo lib-demo--liquid">
      <LiquidGradient className="site-footer__liquid" />
      <p className="lib-demo__big">Stir it.</p>
    </div>
  ),
  "icon-trail": () => (
    <IconTrail className="lib-demo lib-demo--trail">
      <div className="lib-demo lib-demo--center">
        <p className="lib-demo__big">Move your cursor here.</p>
        <Hint>Desktop, with motion allowed</Hint>
      </div>
    </IconTrail>
  ),
  "physics-tags": () => (
    <div className="lib-demo lib-demo--tags">
      <PhysicsTags items={skills} />
    </div>
  ),
  "hover-rows": () => (
    <div className="lib-demo lib-demo--rows">
      <WorkRows projects={projects.slice(0, 4)} />
    </div>
  ),
  "text-reveal": () => (
    <div className="lib-demo lib-demo--center">
      <Replay>
        {(run) => (
          <div key={run} className="lib-demo__reveal">
            <MaskText as="p" className="lib-demo__big" text="Words rise from behind a mask." />
            <Reveal className="lead muted" delay={4}>
              Blocks fade up after.
            </Reveal>
          </div>
        )}
      </Replay>
    </div>
  ),
  signature: dynamic(() => import("./demos/signature-draw")),
  "live-readouts": () => (
    <div className="lib-demo lib-demo--center lib-demo--readouts">
      <p className="lib-demo__big">
        <SgClock /> <span className="muted">SGT</span>
      </p>
      <p className="lib-demo__big">
        <Fps /> <span className="muted">FPS</span>
      </p>
    </div>
  ),
  "command-menu": () => <CommandMenuDemo />,
  "contact-letter": () => (
    <div className="lib-demo lib-demo--scroll" data-lenis-prevent>
      <Letter />
    </div>
  ),
  "paper-veil": () => (
    <div className="lib-demo lib-demo--center">
      <p className="lib-demo__big">Every page change.</p>
      <TransitionLink href="/work" className="lib-demo__btn lib-demo__btn--big label">
        Play it: go to Work
      </TransitionLink>
      <Hint>Come back with the browser’s back button</Hint>
    </div>
  ),
};
