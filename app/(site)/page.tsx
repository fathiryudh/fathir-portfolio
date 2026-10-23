import Image from "next/image";
import { TransitionLink } from "@/components/site/veil";
import { MaskText, Reveal } from "@/components/site/reveal";
import WorkRows from "@/components/site/work-rows";
import IconTrail from "@/components/site/icon-trail";
import { projects } from "@/lib/site-content";

export default function Home() {
  return (
    <div data-page className="page">
      <IconTrail className="hero-trail">
        <section className="hero grid">
          <Reveal className="hero__meta label">
            <span>Singapore</span>
            <span>Open to custom builds</span>
            <span>Web · Mobile · Software · Automation</span>
          </Reveal>
          <Reveal as="h1" className="hero__title hero__title--name">
            <Image
              src="/fathir-yudhistira-black.png"
              alt="Fathir Yudhistira"
              width={2120}
              height={363}
              priority
              className="hero__wordmark hero__wordmark--black"
            />
            <Image
              src="/fathir-yudhistira-white.png"
              alt=""
              aria-hidden="true"
              width={2120}
              height={363}
              className="hero__wordmark hero__wordmark--white"
            />
          </Reveal>
          <MaskText
            className="hero__lede lead"
            delay={4}
            text="Full-time Software Engineering student at SIT. Part-time professional larper."
          />
        </section>
      </IconTrail>

      <section className="section" aria-labelledby="selected-work">
        <div className="section__head">
          <h2 id="selected-work" className="label">
            Selected work <span className="muted">({String(projects.length).padStart(2, "0")})</span>
          </h2>
          <TransitionLink href="/work" className="u-link label">
            All work
          </TransitionLink>
        </div>
        <WorkRows projects={projects} filterable />
      </section>

      <section className="section intro grid" aria-labelledby="intro-title">
        <h2 id="intro-title" className="label intro__label">
          About
        </h2>
        <div className="intro__body">
          <MaskText
            className="h3"
            text="One day I’d like to start a startup of my own. For now, I’m learning by building ideas that catch my interest."
          />
          <Reveal delay={2}>
            <TransitionLink href="/about" className="u-link">
              More about me
            </TransitionLink>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
