"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TextDisperse from "@/components/animations/text-disperse";
import Letter from "@/components/contact/letter";
import SiteHeader from "@/components/site/site-header";
import { EMAIL, socials } from "@/lib/site-content";

const social = (label: string) => socials.find((item) => item.label === label)!.href;

export default function ContactPage() {
  // The scroll cue steps aside once the visitor has started scrolling toward the letter.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* The editorial header lives under .site; .site--chrome borrows it without the page styles. */}
      <div className="site site--chrome">
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <SiteHeader />
      </div>

      <main id="content" className="contact-page">
        <h1 className="sr-only">Contact Muhammad Fathir Yudhistira</h1>
        <div className="contact-hero-wrapper">
          <div className="contact-hero">
            <div className="contact-hero__row">
              <p>Muhammad</p>
              <p>Fathir</p>
            </div>
            <div className="contact-hero__row">
              <p>Yudhistira</p>
            </div>
            <div className="contact-hero__row">
              <p>Software</p>
              <p>&</p>
            </div>
            <div className="contact-hero__row">
              <p>Builder</p>
              <p>Singapore</p>
            </div>
            <div className="contact-hero__row">
              <Link href={social("LinkedIn")} target="_blank" rel="noopener noreferrer">
                <TextDisperse>
                  <p>{"→LinkedIn"}</p>
                </TextDisperse>
              </Link>
              <Link href={social("GitHub")} target="_blank" rel="noopener noreferrer">
                <TextDisperse>
                  <p>{"→Github"}</p>
                </TextDisperse>
              </Link>
            </div>
            <div className="contact-hero__row">
              <a href={`mailto:${EMAIL}`}>
                <TextDisperse>
                  <p>{"→Email"}</p>
                </TextDisperse>
              </a>
            </div>
          </div>
  
          <a href="#letter" className={`scroll-cue${scrolled ? " is-gone" : ""}`}>
            <span className="scroll-cue__track" aria-hidden="true">
              <span className="scroll-cue__dot" />
              <span className="scroll-cue__dot" />
              <span className="scroll-cue__dot" />
            </span>
            <span className="scroll-cue__text">
              <span className="scroll-cue__title">Scroll down to write me a letter</span>
              <span className="scroll-cue__sub">Fill it in, sign it, post it. It opens in your mail app, ready to send.</span>
            </span>
          </a>
        </div>
  
        <div id="letter">
          <Letter />
        </div>
      </main>
    </>
  );
}
