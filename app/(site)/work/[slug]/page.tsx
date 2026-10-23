import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TransitionLink } from "@/components/site/veil";
import { MaskText, Reveal } from "@/components/site/reveal";
import { projects } from "@/lib/site-content";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return { title: `${project.title} | Muhammad Fathir Yudhistira`, description: project.summary };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <div data-page className="page">
      <section className="case-head grid">
        <Reveal className="case-head__back label">
          <TransitionLink href="/work" className="u-link">
            ← All work
          </TransitionLink>
          <span className="muted">{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
        </Reveal>
        <MaskText as="h1" className="case-head__title display" text={project.title} />
        <MaskText className="case-head__lede lead" delay={2} text={project.category} />
      </section>

      <section className="case-meta grid" aria-label="Project details">
        <Reveal className="case-meta__item">
          <p className="label muted">Role</p>
          <p>{project.role}</p>
        </Reveal>
        <Reveal className="case-meta__item" delay={1}>
          <p className="label muted">Status</p>
          <p>{project.status}</p>
        </Reveal>
        {project.stack.length ? (
          <Reveal className="case-meta__item case-meta__item--wide" delay={2}>
            <p className="label muted">Stack</p>
            <p>{project.stack.join(", ")}</p>
          </Reveal>
        ) : null}
        {project.href || project.repoHref ? (
          <Reveal className="case-meta__item" delay={3}>
            <p className="label muted">Links</p>
            <p className="case-meta__links">
              {project.href ? (
                <a className="u-link" href={project.href} target="_blank" rel="noreferrer">
                  Live site
                </a>
              ) : null}
              {project.repoHref ? (
                <a className="u-link" href={project.repoHref} target="_blank" rel="noreferrer">
                  Repository
                </a>
              ) : null}
            </p>
          </Reveal>
        ) : null}
      </section>

      <section className="case-body grid">
        <h2 className="label case-body__label">Overview</h2>
        <MaskText className="case-body__text h3" text={project.summary} />
      </section>

      <Reveal as="figure" className={`case-shot${project.image ? "" : " case-shot--empty"}`}>
        {project.image ? (
          <Image
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            sizes="(min-width: 1024px) 90vw, 100vw"
            className={project.image.blur ? "is-blurred" : undefined}
            style={{ objectPosition: project.image.position ?? "center" }}
          />
        ) : (
          <span className="case-shot__placeholder">Screens coming soon</span>
        )}
      </Reveal>

      <TransitionLink href={`/work/${next.slug}`} className="next-project">
        <span className="label muted">Next project</span>
        <span className="next-project__title display">{next.title}</span>
        <span className="next-project__arrow" aria-hidden="true">
          →
        </span>
      </TransitionLink>
    </div>
  );
}
