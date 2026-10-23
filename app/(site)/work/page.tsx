import type { Metadata } from "next";
import { MaskText, Reveal } from "@/components/site/reveal";
import WorkRows from "@/components/site/work-rows";
import { projects } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Work | Muhammad Fathir Yudhistira",
  description: "Websites, bots, products, mini projects and automation by Fathir Yudhistira.",
};

export default function WorkPage() {
  return (
    <div data-page className="page">
      <section className="page-head grid">
        <Reveal className="page-head__label label">
          Work <span className="muted">({String(projects.length).padStart(2, "0")})</span>
        </Reveal>
        <MaskText as="h1" className="page-head__title display" text="Things I've built." />
        <MaskText
          className="page-head__lede lead"
          delay={3}
          text="Websites, bots, products, mini projects, and automation in progress."
        />
      </section>
      <section className="section" aria-label="Projects">
        <WorkRows projects={projects} filterable />
      </section>
    </div>
  );
}
