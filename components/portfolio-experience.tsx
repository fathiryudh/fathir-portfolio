"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  FileCode,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Radio,
  UserRound,
  X,
} from "lucide-react";

import { SiGithub, SiX } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import Magnetic from "@/components/animations/magnetic";
import LetterCollision from "@/components/animations/letter-collision";
import WordSlideUp from "@/components/animations/word-slide-up";
import SlidingImages from "@/components/animations/sliding-images";
import OrbitIcons from "@/components/animations/orbit-icons";

type Project = {
  title: string;
  category: string;
  role: string;
  status: string;
  summary: string;
  stack: string[];
  tone: "tappd" | "draaqutz" | "khutwa";
  href?: string;
  repoHref: string;
};

const projects: Project[] = [
  {
    title: "Tappd",
    category: "Attendance website + Telegram bot",
    role: "Full-stack build",
    status: "Private operational tool",
    summary:
      "Built for my SCDF division. The website provides a dashboard to view officer statuses, while Telegram is where officers key in their statuses using the bot.",
    stack: ["JavaScript", "React", "Vite", "Express", "Prisma", "Postgres", "Telegram Bot"],
    tone: "tappd",
    repoHref: "https://github.com/fathiryudh/tappd",
  },
  {
    title: "Draaqutz",
    category: "Haircut booking website + Telegram workflow",
    role: "Product and engineering",
    status: "Live site",
    summary:
      "The website showcases clients, pricing, about, and portfolio. Booking is handled entirely on Telegram through a booking bot I built.",
    stack: ["TypeScript", "Next.js", "Supabase", "Tailwind CSS", "Telegram", "Vercel"],
    tone: "draaqutz",
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
    tone: "khutwa",
    repoHref: "https://github.com/fathiryudh/khutwa",
  },
];

const experience = [
  {
    period: "Now",
    title: "SCDF National Service",
    detail:
      "Serving NS while keeping practical side projects moving: Telegram bots, dashboards, booking flows, and small web apps.",
    icon: Radio,
  },
  {
    period: "Mar - Aug 2023",
    title: "Sembcorp Industries",
    detail:
      "Built an internal dashboard for Jurong Island engineering teams, connecting front-end views with REST data and operational reporting needs.",
    icon: BriefcaseBusiness,
  },
];

const education = [
  {
    period: "Aug 2026",
    title: "Singapore Institute of Technology",
    detail:
      "Incoming Bachelor of Engineering with Honours in Information and Communications Technology, majoring in Software Engineering.",
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
  "Serving NS in SCDF",
  "Incoming SIT Software Engineering student, August 2026",
  "Grew up gaming, then started building things",
  "Played youth golf tournaments internationally",
  "Softball in secondary school",
  "Spent time with Singapore national baseball",
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

function useTypingEffect(text: string, speed = 55) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveSpeed = reduceMotion ? 0 : speed;
    let i = 0;

    const timer = setInterval(() => {
      i = reduceMotion ? text.length : i + 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, effectiveSpeed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayed, done };
}

function TappdVisual() {
  return (
    <div className="preview preview--tappd" aria-label="Tappd attendance dashboard preview">
      <div className="mini-window">
        <div className="mini-window__bar">
          <span />
          <span />
          <span />
        </div>
        <Image
          src="/Dashboard.png"
          alt="Tappd attendance dashboard"
          width={1440}
          height={900}
          sizes="(max-width: 760px) 88vw, 350px"
          quality={75}
          style={{ display: "block", width: "100%", height: "auto", filter: "blur(2px)" }}
        />
      </div>
      <p>Private operational tool</p>
    </div>
  );
}

function DraaqutzVisual() {
  return (
    <div className="preview preview--draaqutz" aria-label="Draaqutz website and Telegram booking preview">
      <div className="site-screenshot site-screenshot--scrollable">
        <div className="site-screenshot__scroll">
          <Image
            src="/draaqutz-site.jpeg"
            alt="Draaqutz haircut booking website screenshot"
            width={2880}
            height={9774}
            sizes="(max-width: 760px) 88vw, 390px"
            quality={75}
          />
        </div>
      </div>
      <div className="telegram-card" aria-label="Telegram bot slot preview">
        <div className="telegram-card__top">
          <MessageCircle size={16} aria-hidden="true" />
          <span>Draaqutz Bot</span>
        </div>
        <div className="chat-bubble">Available slots today</div>
        <div className="slot-row">
          <span>4:30 PM</span>
          <strong>Open</strong>
        </div>
        <div className="slot-row">
          <span>6:00 PM</span>
          <strong>Open</strong>
        </div>
      </div>
    </div>
  );
}

function KhutwaVisual() {
  return (
    <div className="preview preview--khutwa" aria-label="Khutwa mobile app preview">
      <div className="phone-preview">
        <span className="phone-preview__notch" />
        <div className="progress-ring">
          <span>62%</span>
        </div>
        <div className="phone-lines">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}

function ProjectVisual({ tone }: { tone: Project["tone"] }) {
  if (tone === "tappd") return <TappdVisual />;
  if (tone === "draaqutz") return <DraaqutzVisual />;
  return <KhutwaVisual />;
}

export default function PortfolioExperience() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [activeProject, setActiveProject] = useState(projects[0].tone);
  const [menuOpen, setMenuOpen] = useState(false);
  const { displayed, done } = useTypingEffect(FULL_NAME);

  const active = useMemo(
    () => projects.find((project) => project.tone === activeProject) ?? projects[0],
    [activeProject],
  );

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

  return (
    <main ref={rootRef} className="portfolio-root">
      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <nav className="nav-shell" aria-label="Primary navigation">
        <div className="nav-bar">
          <a href="#top" className="nav-mark" aria-label="Muhammad Fathir Yudhistira home">
            FY
          </a>
          <button
            className="nav-burger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <div className={`nav-links${menuOpen ? " nav-links--open" : ""}`}>
          <div className="nav-text-links">
            <Magnetic><a href="#about" onClick={() => setMenuOpen(false)}>About</a></Magnetic>
            <Magnetic><a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a></Magnetic>
            <Magnetic><a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a></Magnetic>
            <Magnetic><Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></Magnetic>
          </div>
          <div className="nav-icon-row">
            <Magnetic>
              <a className="nav-icon-link" href="https://github.com/fathiryudh" target="_blank" rel="noreferrer" aria-label="GitHub profile" title="GitHub">
                <SiGithub size={18} />
              </a>
            </Magnetic>
            <Magnetic>
              <a className="nav-icon-link" href="https://linkedin.com/in/fathiryudhistira" target="_blank" rel="noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
                <FaLinkedinIn size={18} />
              </a>
            </Magnetic>
            <Magnetic>
              <a className="nav-icon-link" href="https://x.com/fathiryudh" target="_blank" rel="noreferrer" aria-label="X profile" title="X / Twitter">
                <SiX size={16} />
              </a>
            </Magnetic>
            <Magnetic>
              <a className="nav-icon-link" href="mailto:fathiryudh03@gmail.com" aria-label="Email Fathir" title="Email">
                <Mail size={18} aria-hidden="true" />
              </a>
            </Magnetic>
          </div>
        </div>
      </nav>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow reveal">Portfolio / Singapore</p>
          <h1 className="typing-line reveal" aria-label="Muhammad Fathir Yudhistira">
            <span className="typing-content typing-content--js">
              {displayed}
              <span className={`typing-cursor ${done ? "typing-cursor--blink" : ""}`}>|</span>
            </span>
          </h1>
          <p className="hero-subtitle reveal">Software builder · Incoming SIT Software Engineering student</p>
          <p className="hero-intro reveal">
            I build practical web apps, Telegram bots, dashboards, and mobile ideas. The work is usually small enough
            to ship, useful enough to keep around, and polished enough that people actually want to use it.
          </p>
          <div className="hero-actions reveal">
            <Magnetic>
              <a className="button button--primary" href="#projects">
                View projects
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </Magnetic>
            <Magnetic>
              <Link className="button button--ghost" href="/contact">
                Contact
                <Mail size={17} aria-hidden="true" />
              </Link>
            </Magnetic>
          </div>
          <svg
            className="hero-doodle-arrow reveal"
            width="54"
            height="36"
            viewBox="0 0 54 36"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M48,30 C38,18 22,6 8,12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M14,6 L8,12 L15,17"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="48" cy="30" r="3" fill="currentColor" />
          </svg>
        </div>

        <aside className="hero-panel reveal" aria-label="Quick profile">
          <div className="profile-card">
            <div className="profile-card__icon">
              <UserRound size={22} aria-hidden="true" />
            </div>
            <div>
              <span>Current lane</span>
              <strong>NS, software side projects, SIT next</strong>
            </div>
          </div>
          <div className="quiet-list">
            <span>Web apps</span>
            <span>Telegram bots</span>
            <span>Dashboards</span>
            <span>Mobile concepts</span>
          </div>
        </aside>
      </section>

      <LetterCollision />

      <section id="content" className="content-shell">
        <section id="about" className="section about-section">
          <div className="section-heading reveal">
            <p className="eyebrow">About</p>
            <h2>Practical software with a little personality.</h2>
          </div>
          <div className="about-grid">
            <div className="about-copy">
              <WordSlideUp text="I like building tools that reduce small daily friction: attendance views, booking flows, bot commands, admin screens, and app sketches that can grow into something real." />
              <WordSlideUp text="Outside the code, I have a competitive thread from gaming, youth golf tournaments, softball, and time with Singapore national baseball. These days, I am serving NS in SCDF and preparing for Software Engineering at SIT in August 2026." />
            </div>
            <div className="side-notes reveal" aria-label="Personal side notes">
              {sideNotes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="section skills-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Tech stack</p>
            <h2>Technical skills, grouped by how I actually use them.</h2>
          </div>

          <OrbitIcons groups={technicalSkills} />
        </section>

        <section id="projects" className="section projects-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Projects</p>
            <h2>Selected builds, indexed without the guesswork.</h2>
          </div>

          <div className="project-index">
            <div className="project-rows" onMouseLeave={() => setActiveProject(projects[0].tone)}>
              {projects.map((project, index) => (
                <article
                  className={`project-row project-row--${project.tone} reveal`}
                  key={project.title}
                  onFocus={() => setActiveProject(project.tone)}
                  onMouseEnter={() => setActiveProject(project.tone)}
                  tabIndex={0}
                >
                  <div className="project-row__number">{String(index + 1).padStart(2, "0")}</div>
                  <div className="project-row__main">
                    <p className="project-category">{project.category}</p>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    <div className="project-links">
                      {project.href ? (
                        <a className="text-link" href={project.href} target="_blank" rel="noreferrer">
                          Live site
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </a>
                      ) : null}
                      <a className="text-link" href={project.repoHref} target="_blank" rel="noreferrer">
                        Repo
                        <FileCode size={16} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                  <dl className="project-meta">
                    <div>
                      <dt>Stack</dt>
                      <dd>{project.stack.join(" / ")}</dd>
                    </div>
                    <div>
                      <dt>Role</dt>
                      <dd>{project.role}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{project.status}</dd>
                    </div>
                  </dl>
                  <div className="project-row__inline-preview">
                    <ProjectVisual tone={project.tone} />
                  </div>
                </article>
              ))}
            </div>

            <aside className="project-preview-rail reveal" aria-live="polite" aria-label={`${active.title} project preview`}>
              <div className={`project-preview-frame project-preview-frame--${active.tone}`}>
                <ProjectVisual tone={active.tone} />
              </div>
              <div className="preview-caption">
                <span>{active.title}</span>
                <span>{active.status}</span>
              </div>
            </aside>
          </div>
        </section>

        <SlidingImages />

        <section id="experience" className="section experience-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Experience</p>
            <h2>The official timeline, kept direct.</h2>
          </div>

          <div className="timeline-grid">
            <div className="timeline-column reveal">
              <div className="column-title">
                <BriefcaseBusiness size={18} aria-hidden="true" />
                <span>Experience</span>
              </div>
              {experience.map((item) => (
                <article className="timeline-card" key={item.title}>
                  <item.icon size={18} aria-hidden="true" />
                  <span>{item.period}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>

            <div className="timeline-column reveal">
              <div className="column-title">
                <GraduationCap size={18} aria-hidden="true" />
                <span>Education</span>
              </div>
              {education.map((item) => (
                <article className="timeline-card" key={item.title}>
                  <CalendarDays size={18} aria-hidden="true" />
                  <span>{item.period}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>

      <footer className="footer-section">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Open to useful builds, clean dashboards, and practical app ideas.</h2>
        </div>
        <div className="footer-actions">
          <Magnetic>
            <Link href="/contact">
              <Mail size={18} aria-hidden="true" />
              Get in touch
            </Link>
          </Magnetic>
          <Magnetic>
            <a href="https://github.com/fathiryudh" target="_blank" rel="noreferrer">
              <SiGithub size={18} />
              GitHub
            </a>
          </Magnetic>
          <Magnetic>
            <a href="https://linkedin.com/in/fathiryudhistira" target="_blank" rel="noreferrer">
              <FaLinkedinIn size={18} />
              LinkedIn
            </a>
          </Magnetic>
          <Magnetic>
            <a href="https://x.com/fathiryudh" target="_blank" rel="noreferrer">
              <SiX size={16} />
              X / Twitter
            </a>
          </Magnetic>
        </div>
        <div className="footer-meta">
          <span>Muhammad Fathir Yudhistira</span>
          <span>
            <MapPin size={15} aria-hidden="true" />
            Singapore
          </span>
        </div>
      </footer>
    </main>
  );
}
