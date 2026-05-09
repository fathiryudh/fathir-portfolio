"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  FileCode,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Radio,
  UserRound,
} from "lucide-react";

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
      "A practical attendance surface for daily visibility, handovers, and quick status checks. Public visuals stay anonymized with demo rows only.",
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
      "A booking website for checking haircut availability, sending requests, and keeping appointment updates close to Telegram.",
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

const technicalSkills = {
  stack: [
    "JavaScript",
    "TypeScript",
    "Dart",
    "React",
    "Next.js",
    "Vite",
    "Flutter",
    "Tailwind CSS",
  ],
  backend: ["Express", "Prisma", "Postgres", "Supabase", "Hive", "Provider", "Vercel"],
  workflow: ["Telegram Bot API", "Telegram workflows", "Local Notifications", "Geolocation", "REST APIs"],
};

function TappdVisual() {
  const rows = [
    ["Demo officer 01", "In", "Alpha"],
    ["Demo officer 02", "Out", "Medical"],
    ["Demo officer 03", "WFH", "Admin"],
    ["Demo officer 04", "In", "Ops"],
  ];

  return (
    <div className="preview preview--tappd" aria-label="Anonymized Tappd attendance preview">
      <div className="mini-window">
        <div className="mini-window__bar">
          <span />
          <span />
          <span />
        </div>
        <div className="tappd-table">
          <div className="tappd-table__head">
            <span>Name</span>
            <span>Status</span>
            <span>Team</span>
          </div>
          {rows.map(([name, status, team]) => (
            <div className="tappd-table__row" key={name}>
              <strong>{name}</strong>
              <span>{status}</span>
              <span>{team}</span>
            </div>
          ))}
        </div>
      </div>
      <p>Demo data only</p>
    </div>
  );
}

function DraaqutzVisual() {
  return (
    <div className="preview preview--draaqutz" aria-label="Draaqutz website and Telegram booking preview">
      <div className="site-screenshot">
        <Image
          src="/draaqutz-site.png"
          alt="Draaqutz haircut booking website screenshot"
          width={1280}
          height={900}
          sizes="(max-width: 760px) 88vw, 390px"
        />
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

  const active = useMemo(
    () => projects.find((project) => project.tone === activeProject) ?? projects[0],
    [activeProject],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      root.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
      return undefined;
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
        <a href="#top" className="nav-mark" aria-label="Muhammad Fathir Yudhistira home">
          FY
        </a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a className="nav-icon-link" href="https://github.com/fathiryudh" target="_blank" rel="noreferrer" aria-label="GitHub profile" title="GitHub">
            <FileCode size={18} aria-hidden="true" />
          </a>
          <a className="nav-icon-link" href="https://linkedin.com/in/fathiryudhistira" target="_blank" rel="noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
            <BriefcaseBusiness size={18} aria-hidden="true" />
          </a>
          <a className="nav-icon-link" href="mailto:fathiryudh03@gmail.com" aria-label="Email Fathir" title="Email">
            <Mail size={18} aria-hidden="true" />
          </a>
        </div>
      </nav>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow reveal">Portfolio / Singapore</p>
          <h1 className="typing-line reveal" aria-label="Muhammad Fathir Yudhistira">
            <span className="typing-content">
              Muhammad Fathir
              <br />
              Yudhistira
            </span>
          </h1>
          <p className="hero-subtitle reveal">Software builder · Incoming SIT Software Engineering student</p>
          <p className="hero-intro reveal">
            I build practical web apps, Telegram bots, dashboards, and mobile ideas. The work is usually small enough
            to ship, useful enough to keep around, and polished enough that people actually want to use it.
          </p>
          <div className="hero-actions reveal">
            <a className="button button--primary" href="#projects">
              View projects
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a className="button button--ghost" href="mailto:fathiryudh03@gmail.com">
              Contact
              <Mail size={17} aria-hidden="true" />
            </a>
          </div>
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

      <section id="content" className="content-shell">
        <section id="about" className="section about-section">
          <div className="section-heading reveal">
            <p className="eyebrow">About</p>
            <h2>Practical software with a little personality.</h2>
          </div>
          <div className="about-grid">
            <div className="about-copy reveal">
              <p>
                I like building tools that reduce small daily friction: attendance views, booking flows, bot commands,
                admin screens, and app sketches that can grow into something real.
              </p>
              <p>
                Outside the code, I have a competitive thread from gaming, youth golf tournaments, softball, and time
                with Singapore national baseball. These days, I am serving NS in SCDF and preparing for Software
                Engineering at SIT in August 2026.
              </p>
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

          <div className="skills-grid">
            <article className="skills-panel reveal">
              <div className="skills-panel__title">
                <span>Core stack</span>
                <strong>Frontend and app foundations</strong>
              </div>
              <div className="skill-chips">
                {technicalSkills.stack.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </article>

            <article className="skills-panel reveal">
              <div className="skills-panel__title">
                <span>Backend and data</span>
                <strong>Storage, APIs, and deployment</strong>
              </div>
              <div className="skill-chips">
                {technicalSkills.backend.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </article>

            <article className="skills-panel reveal">
              <div className="skills-panel__title">
                <span>Workflow layer</span>
                <strong>Automation and product plumbing</strong>
              </div>
              <div className="skill-chips">
                {technicalSkills.workflow.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </article>
          </div>
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
          <a href="mailto:fathiryudh03@gmail.com">
            <Mail size={18} aria-hidden="true" />
            Email
          </a>
          <a href="https://github.com/fathiryudh" target="_blank" rel="noreferrer">
            <FileCode size={18} aria-hidden="true" />
            GitHub
          </a>
          <a href="https://linkedin.com/in/fathiryudhistira" target="_blank" rel="noreferrer">
            <BriefcaseBusiness size={18} aria-hidden="true" />
            LinkedIn
          </a>
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
