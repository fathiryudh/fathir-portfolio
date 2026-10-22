"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, FileCode, Mail, MapPin, Menu, X } from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import Signature from "@/components/animations/signature";
import { MY_SIGNATURE } from "@/components/animations/my-signature";
import Magnetic from "@/components/animations/magnetic";
import LetterCollision from "@/components/animations/letter-collision";
import WordSlideUp from "@/components/animations/word-slide-up";
import SlidingImages from "@/components/animations/sliding-images";
import SkillSheet from "@/components/zine/skill-sheet";
import { Ticket } from "@/components/zine/ticket";
import { Barcode, Starburst, tilt, torn } from "@/components/zine/paper";

type Project = {
  title: string;
  category: string;
  role: string;
  status: string;
  summary: string;
  stack: string[];
  paper: string;
  ink: string;
  image?: { src: string; width: number; height: number; alt: string; blur?: boolean };
  href?: string;
  repoHref: string;
};

const projects: Project[] = [
  {
    title: "Tappd",
    category: "Attendance website + Telegram bot",
    role: "Full-stack build",
    status: "Private tool",
    summary:
      "Built for my SCDF division. The website provides a dashboard to view officer statuses, while Telegram is where officers key in their statuses using the bot.",
    stack: ["JavaScript", "React", "Vite", "Express", "Prisma", "Postgres", "Telegram Bot"],
    paper: "var(--z-red)",
    ink: "var(--z-white)",
    image: { src: "/Dashboard.png", width: 1440, height: 900, alt: "Tappd attendance dashboard", blur: true },
    repoHref: "https://github.com/fathiryudh/tappd",
  },
  {
    title: "Draaqutz",
    category: "Haircut booking website + Telegram workflow",
    role: "Product and engineering",
    status: "Live",
    summary:
      "The website showcases clients, pricing, about, and portfolio. Booking is handled entirely on Telegram through a booking bot I built.",
    stack: ["TypeScript", "Next.js", "Supabase", "Tailwind CSS", "Telegram", "Vercel"],
    paper: "var(--z-blue)",
    ink: "var(--z-white)",
    image: { src: "/draaqutz-site.jpeg", width: 2880, height: 9774, alt: "Draaqutz haircut booking website" },
    href: "https://draaqutz.vercel.app/",
    repoHref: "https://github.com/fathiryudh/draaqutz",
  },
  {
    title: "Khutwa",
    category: "Mobile app concept",
    role: "App architecture and UX",
    status: "In development",
    summary:
      "A Flutter app direction around guided progress, local reminders, and daily rhythm. The code is still being shaped while the product idea gets tested.",
    stack: ["Dart", "Flutter", "Hive", "Provider", "Local Notifications", "Geolocation"],
    paper: "var(--z-yellow)",
    ink: "var(--z-black)",
    repoHref: "https://github.com/fathiryudh/khutwa",
  },
];

const experience = [
  {
    period: "Completed",
    title: "SCDF National Service",
    detail:
      "Served NS in SCDF. Kept side projects running throughout — Telegram bots, dashboards, booking flows, and small web apps.",
  },
  {
    period: "Mar - Aug 2023",
    title: "Sembcorp Industries",
    detail:
      "Built an internal dashboard for Jurong Island engineering teams, connecting front-end views with REST data and operational reporting needs.",
  },
];

const education = [
  {
    period: "Aug 2026",
    title: "Singapore Institute of Technology",
    detail:
      "Bachelor of Engineering with Honours in Information and Communications Technology, majoring in Software Engineering.",
  },
  {
    period: "2021 - 2024",
    title: "Nanyang Polytechnic",
    detail:
      "Diploma in Infocomm and Media Engineering, covering web, mobile, databases, networking, software engineering, and security.",
  },
  {
    period: "2025",
    title: "Blockchain Developer Bootcamp",
    detail:
      "Studied Solidity, smart contracts, dApps, Ethereum, DeFi, gas optimisation, and Web3.js through Pelita Bangsa Academy.",
  },
];

const sideNotes = [
  { text: "Singapore", tone: "paper" },
  { text: "SIT", tone: "blue" },
  { text: "Golf", tone: "yellow" },
  { text: "Baseball", tone: "red" },
  { text: "Softball", tone: "pink" },
  { text: "Gamer", tone: "paper" },
];

const technicalSkills = [
  {
    label: "Core stack",
    description: "Frontend and app foundations",
    items: ["JavaScript", "TypeScript", "Dart", "React", "Next.js", "Vite", "Flutter", "Tailwind CSS"],
  },
  {
    label: "Backend and data",
    description: "Storage, APIs, and deployment",
    items: ["Express", "PHP", "Prisma", "Postgres", "Supabase", "Hive", "Provider", "Vercel"],
  },
  {
    label: "Workflow layer",
    description: "Automation and product plumbing",
    items: ["Telegram Bot API", "Telegram workflows", "Local Notifications", "Geolocation", "REST APIs"],
  },
];

const FULL_NAME = "Muhammad Fathir Yudhistira";
const SIGNATURE_DURATION = 2.4;
const MASTHEAD = "FATHIR";

function useTypingEffect(text: string, speed = 55, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveSpeed = reduceMotion ? 0 : speed;
    let i = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = setTimeout(
      () => {
        timer = setInterval(() => {
          i = reduceMotion ? text.length : i + 1;
          setDisplayed(text.slice(0, i));
          if (i >= text.length) {
            clearInterval(timer);
            setDone(true);
          }
        }, effectiveSpeed);
      },
      reduceMotion ? 0 : startDelay,
    );

    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

function ProjectTicket({ project, index }: { project: Project; index: number }) {
  return (
    <Ticket
      aria-label={`${project.title} project ticket`}
      paper={project.paper}
      ink={project.ink}
      notchSize={14}
      stubHeight="23%"
      className="w-[min(100%,18rem)]"
      body={
        <div className="ticket-body">
          <div className="ticket-body__head">
            <span>No. {String(index + 1).padStart(2, "0")}</span>
            <span className="ticket-stamp">{project.status}</span>
          </div>
          <h3>{project.title}</h3>
          <p className="ticket-body__category">{project.category}</p>
          {project.image ? (
            <div className="halftone ticket-body__shot" style={{ clipPath: torn(400 + index, 4) }}>
              <Image
                src={project.image.src}
                alt={project.image.alt}
                width={project.image.width}
                height={project.image.height}
                sizes="260px"
                quality={75}
                className={project.image.blur ? "is-blurred" : undefined}
              />
            </div>
          ) : (
            <Starburst seed={410 + index} className="ticket-body__burst">
              Coming soon
            </Starburst>
          )}
          <p className="ticket-body__summary">{project.summary}</p>
        </div>
      }
      stub={
        <div className="ticket-stub">
          <p className="ticket-stub__role">{project.role}</p>
          <p className="ticket-stub__stack">{project.stack.join(" · ")}</p>
          <div className="ticket-stub__links">
            {project.href ? (
              <a href={project.href} target="_blank" rel="noreferrer">
                Live site
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            ) : null}
            <a href={project.repoHref} target="_blank" rel="noreferrer">
              Repo
              <FileCode size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      }
    />
  );
}

function Clipping({ item, seed, index }: { item: { period: string; title: string; detail: string }; seed: number; index: number }) {
  return (
    <article
      className="clipping reveal reveal--drop"
      style={{ clipPath: torn(seed, 3), rotate: `${tilt(seed, 1.8)}deg`, "--i": index } as React.CSSProperties}
    >
      <span className="clipping__date">{item.period}</span>
      <h3>{item.title}</h3>
      <p>{item.detail}</p>
    </article>
  );
}

export default function PortfolioExperience() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { displayed, done } = useTypingEffect(FULL_NAME, 55, SIGNATURE_DURATION * 1000);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      root.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
      return;
    }

    root.classList.add("is-enhanced");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );

    root.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main ref={rootRef} className="zine-root">
      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <nav className="zine-nav" aria-label="Primary navigation">
        <a href="#top" className="zine-nav__mark" aria-label="Muhammad Fathir Yudhistira home">
          FY
        </a>
        <button
          className="zine-nav__burger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className={`zine-nav__menu${menuOpen ? " is-open" : ""}`}>
          <div className="zine-nav__links">
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#skills" onClick={closeMenu}>Skills</a>
            <a href="#projects" onClick={closeMenu}>Projects</a>
            <a href="#experience" onClick={closeMenu}>Experience</a>
            <Link href="/contact" onClick={closeMenu}>Contact</Link>
          </div>
          <div className="zine-nav__icons">
            <a href="https://github.com/fathiryudh" target="_blank" rel="noreferrer" aria-label="GitHub profile" title="GitHub">
              <SiGithub size={17} />
            </a>
            <a href="https://linkedin.com/in/fathiryudhistira" target="_blank" rel="noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
              <FaLinkedinIn size={17} />
            </a>
            <a href="https://x.com/fathiryudh" target="_blank" rel="noreferrer" aria-label="X profile" title="X / Twitter">
              <SiX size={15} />
            </a>
            <a href="mailto:fathiryudh03@gmail.com" aria-label="Email Fathir" title="Email">
              <Mail size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </nav>

      <section id="top" className="cover">
        <span className="cover__vertical cover__vertical--left">Portfolio · Vol. 01 · Singapore</span>
        <span className="cover__vertical cover__vertical--right">Web · Mobile · Whatever you need</span>

        <p className="cover__masthead" aria-hidden="true">
          {MASTHEAD.split("").map((letter, index) => (
            <span key={index} style={{ rotate: `${tilt(500 + index, 5)}deg` }}>
              {letter}
            </span>
          ))}
        </p>

        <div className="cover__collage">
          <div className="cover__sheet cover__sheet--blue" style={{ clipPath: torn(21, 4) }}>
            <span className="cover__signature" aria-hidden="true">
              <Signature
                viewBox={MY_SIGNATURE?.viewBox ?? "110 130 480 345"}
                strokes={MY_SIGNATURE?.strokes}
                strokeWidth={16}
                duration={SIGNATURE_DURATION}
              />
            </span>
          </div>
          <div className="cover__sheet cover__sheet--red" style={{ clipPath: torn(22, 5) }} aria-hidden="true">
            <span className="cover__issue-label">Issue</span>
            <span className="cover__issue">No.01</span>
          </div>

          <svg className="cover__doodle cover__doodle--arrow" viewBox="0 0 120 80" aria-hidden="true">
            <path pathLength={1} d="M8 64 C 30 30, 62 14, 106 26" />
            <path pathLength={1} d="M88 12 L107 26 L90 42" />
          </svg>
          <svg className="cover__doodle cover__doodle--star" viewBox="0 0 64 64" aria-hidden="true">
            <path pathLength={1} d="M32 5 L38 25 L59 27 L42 39 L49 59 L32 47 L15 59 L22 39 L5 27 L26 25 Z" />
          </svg>

          <h1 className="strip strip--yellow cover__name" aria-label={FULL_NAME} style={{ clipPath: torn(31, 14) }}>
            <span aria-hidden="true">
              {displayed}
              <span className={`typing-cursor${done || !displayed ? " typing-cursor--blink" : ""}`}>|</span>
            </span>
          </h1>
          <p className="strip strip--paper cover__role" style={{ clipPath: torn(32, 16) }}>
            I build useful things.
          </p>
          <Starburst seed={41} className="cover__burst">
            3 builds inside
          </Starburst>
        </div>

        <ul className="cover__lines">
          {projects.map((project) => (
            <li key={project.title}>
              <a href="#projects">
                <strong>{project.title}</strong>
                {project.category}
              </a>
            </li>
          ))}
        </ul>

        <Barcode seed={51} digits="4 018170 098265" className="cover__barcode" />
      </section>

      <LetterCollision />

      <div id="content">
        <section id="about" className="spread">
          <p className="tag reveal">01 / About</p>
          <h2 className="headline reveal">
            Hi, I&apos;m{" "}
            <span className="tape" style={{ clipPath: torn(61, 12) }}>
              Fathir
            </span>
          </h2>
          <div className="spread__body">
            <WordSlideUp
              className="spread__lede"
              text="Web, mobile, the backend behind it. If it runs on a screen, I can probably build it."
            />
            <WordSlideUp text="I study software engineering at SIT. I also play golf and baseball, and too many video games." />
          </div>
          <blockquote className="scrap reveal reveal--slide" style={{ clipPath: torn(71, 6) }}>
            <p>Still figuring it out.</p>
          </blockquote>
          <ul className="stickers" aria-label="Personal side notes">
            {sideNotes.map((note, index) => (
              <li
                key={note.text}
                className={`sticker sticker--${note.tone} reveal reveal--drop`}
                style={{ rotate: `${tilt(600 + index, 4)}deg`, "--i": index } as React.CSSProperties}
              >
                {note.text}
              </li>
            ))}
          </ul>
        </section>

        <section id="skills" className="skills">
          <p className="tag tag--yellow reveal">02 / Tech stack</p>
          <h2 className="headline headline--light reveal">What I use.</h2>
          <SkillSheet groups={technicalSkills} />
        </section>

        <section id="projects" className="projects">
          <p className="tag reveal">03 / Projects</p>
          <h2 className="headline reveal">
            Things I&apos;ve{" "}
            <span className="tape tape--red" style={{ clipPath: torn(62, 12) }}>
              built
            </span>
          </h2>
          <div className="tickets">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className="tickets__slot reveal reveal--drop"
                style={{ rotate: `${[-3, 2, -1.5][index]}deg`, "--i": index } as React.CSSProperties}
              >
                <ProjectTicket project={project} index={index} />
              </div>
            ))}
          </div>
        </section>

        <SlidingImages />

        <section id="experience" className="clippings">
          <p className="tag reveal">04 / Experience</p>
          <h2 className="headline reveal">Where I&apos;ve been.</h2>
          <div className="clippings__columns">
            <div className="clippings__column">
              <p className="clippings__label">Work</p>
              {experience.map((item, index) => (
                <Clipping key={item.title} item={item} seed={700 + index} index={index} />
              ))}
            </div>
            <div className="clippings__column">
              <p className="clippings__label">School</p>
              {education.map((item, index) => (
                <Clipping key={item.title} item={item} seed={720 + index} index={index} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="zine-footer">
        <p className="tag tag--yellow">05 / Contact</p>
        <h2 className="zine-footer__headline">
          Got an
          <br />
          idea?
        </h2>
        <Link href="/contact" className="zine-footer__burst" aria-label="Get in touch">
          <Starburst seed={101}>Say hi</Starburst>
        </Link>
        <nav className="zine-footer__links" aria-label="Contact links">
          {[
            { label: "Get in touch", href: "/contact", icon: <Mail size={20} aria-hidden="true" /> },
            { label: "GitHub", href: "https://github.com/fathiryudh", icon: <SiGithub size={20} /> },
            { label: "LinkedIn", href: "https://linkedin.com/in/fathiryudhistira", icon: <FaLinkedinIn size={20} /> },
            { label: "X / Twitter", href: "https://x.com/fathiryudh", icon: <SiX size={18} /> },
          ].map((link, index) => (
            <Magnetic key={link.label}>
              {link.href.startsWith("/") ? (
                <Link href={link.href} style={{ clipPath: torn(111 + index, 10), rotate: `${index % 2 ? 2 : -2}deg` }}>
                  {link.icon}
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ clipPath: torn(111 + index, 10), rotate: `${index % 2 ? 2 : -2}deg` }}
                >
                  {link.icon}
                  {link.label}
                </a>
              )}
            </Magnetic>
          ))}
        </nav>
        <div className="zine-footer__meta">
          <Barcode seed={121} digits="Muhammad Fathir Yudhistira" />
          <span>
            <MapPin size={15} aria-hidden="true" />
            Singapore
          </span>
        </div>
      </footer>
    </main>
  );
}
