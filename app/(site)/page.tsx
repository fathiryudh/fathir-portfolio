import Image from "next/image";
import { TransitionLink } from "@/components/site/veil";
import { MaskText, Reveal } from "@/components/site/reveal";
import WorkRows from "@/components/site/work-rows";
import IconTrail from "@/components/site/icon-trail";
import type { Metadata } from "next";
import { FULL_NAME, projects, socials } from "@/lib/site-content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Tells Google who the site is about, so name searches can link the profiles below.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: FULL_NAME,
  alternateName: "Fathir Yudhistira",
  url: "https://fathiryudh.com",
  jobTitle: "Software engineering student",
  affiliation: { "@type": "CollegeOrUniversity", name: "Singapore Institute of Technology" },
  address: { "@type": "PostalAddress", addressCountry: "SG" },
  sameAs: socials.map((item) => item.href),
};

export default function Home() {
  return (
    <div data-page className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }} />
      <IconTrail className="hero-trail">
        <section className="hero grid">
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
          <div className="hero__foot">
            <MaskText
              className="hero__lede lead"
              delay={4}
              text="Full-time Software Engineering student at SIT. Part-time professional larper."
            />
          </div>
        </section>
      </IconTrail>

      <section className="section work-panel" aria-labelledby="selected-work">
        <div className="work-panel__heat" aria-hidden="true">
          <span />
        </div>
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
            text="One day I want to start my own company. For now I build whatever idea won’t leave me alone and learn as I go."
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
