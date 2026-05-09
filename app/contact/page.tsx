"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TextDisperse from "@/components/animations/text-disperse";

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mailto = `mailto:fathiryudh03@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${email}\n\n${message}`)}`;
    window.location.href = mailto;
  }

  return (
    <div className="contact-page">
      <nav className="contact-nav">
        <Link href="/" className="contact-nav__back">
          FY
        </Link>
      </nav>

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
            <Link href="https://linkedin.com/in/fathiryudhistira" target="_blank" rel="noreferrer">
              <TextDisperse>
                <p>{"→LinkedIn"}</p>
              </TextDisperse>
            </Link>
            <Link href="https://github.com/fathiryudh" target="_blank" rel="noreferrer">
              <TextDisperse>
                <p>{"→Github"}</p>
              </TextDisperse>
            </Link>
          </div>
          <div className="contact-hero__row">
            <a href="mailto:fathiryudh03@gmail.com">
              <TextDisperse>
                <p>{"→Email"}</p>
              </TextDisperse>
            </a>
          </div>
        </div>
      </div>

      <section className="contact-form-section">
        <h2 className="contact-form__title">Send a message</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form__field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="contact-form__field">
            <label htmlFor="email">Your email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="contact-form__field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="contact-form__submit">
            Open in mail client
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </form>
      </section>
    </div>
  );
}
