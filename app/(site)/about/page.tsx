import type { Metadata } from "next";
import { MaskText, Reveal } from "@/components/site/reveal";
import PhysicsTags from "@/components/site/physics-tags";
import { TransitionLink } from "@/components/site/veil";
import { education, experience, sideNotes, skillGroups, skills, type TimelineItem } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About | Muhammad Fathir Yudhistira",
  description: "Software engineering student at SIT in Singapore, building web and mobile software.",
};

function Timeline({ title, items }: { title: string; items: TimelineItem[] }) {
  return (
    <section className="timeline grid" aria-label={title}>
      <h2 className="label timeline__label">{title}</h2>
      <ol className="timeline__list">
        {items.map((item, index) => (
          <Reveal as="li" key={item.title} className="timeline__item" delay={index}>
            <span className="timeline__period label muted">{item.period}</span>
            <h3 className="timeline__title h4">{item.title}</h3>
            <p className="timeline__detail">{item.detail}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div data-page className="page">
      <section className="page-head grid">
        <Reveal className="page-head__label label">About</Reveal>
        <MaskText as="h1" className="page-head__title display" text="Hi, I'm Fathir." />
        <MaskText
          className="page-head__lede lead"
          delay={3}
          text="Web, mobile, the backend behind it. If it runs on a screen, I can probably build it."
        />
      </section>

      <section className="about-bio grid">
        <MaskText
          className="about-bio__text h3"
          text="I’m studying Software Engineering at SIT in Singapore, and I keep coming back to making software: websites, mobile apps, useful tools, and automations. On normal days, I just larp it till I make it, but I’d like to start a startup of my own."
        />
        <Reveal className="about-bio__notes" delay={2}>
          <p className="label muted">From</p>
          <p>Cirebon, Indonesia. Grew up in Singapore.</p>
          <p className="label muted">Off the clock</p>
          <p>{sideNotes.join(" · ")}</p>
          <p className="label muted">Open to</p>
          <p>Building custom websites, mobile apps, SaaS, software, and automation.</p>
          <TransitionLink href="/contact" className="u-link">
            Have an idea? Let’s talk →
          </TransitionLink>
        </Reveal>
      </section>

      <section className="section" aria-labelledby="stack-title">
        <div className="section__head">
          <h2 id="stack-title" className="label">
            What I use <span className="muted">({skills.length})</span>
          </h2>
          <p className="label muted stack-hint">Grab one</p>
        </div>
        <PhysicsTags items={skills} />
        <ul className="tags-legend label" aria-label="Skill categories">
          {skillGroups.map((group) => (
            <li key={group.id} data-group={group.id}>
              {group.label}
            </li>
          ))}
        </ul>
      </section>

      <Timeline title="Experience" items={experience} />
      <Timeline title="Education" items={education} />
    </div>
  );
}
