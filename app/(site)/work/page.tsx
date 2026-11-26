import type { Metadata } from "next";
import { MaskText, Reveal } from "@/components/site/reveal";
import WorkRows from "@/components/site/work-rows";
import { pageMetadata, projects } from "@/lib/site-content";

export const metadata: Metadata = pageMetadata("/work", "Work | Muhammad Fathir Yudhistira", "Websites, bots, products, mini projects and automation by Fathir Yudhistira.");

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
          text="Websites, bots, apps, small experiments, and some automation that’s still half done."
        />
      </section>
      <section className="section work-panel" aria-label="Projects">
        <div className="work-panel__heat" aria-hidden="true">
          <span />
        </div>
        <WorkRows projects={projects} filterable />
      </section>
    </div>
  );
}
