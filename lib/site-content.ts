// Single source of truth for the editorial site's copy: home, work, case studies and about all read from here.

export type Project = {
  slug: string;
  title: string;
  categories: string[];
  category: string;
  kind: string;
  role: string;
  status: string;
  summary: string;
  stack: string[];
  image?: { src: string; width: number; height: number; alt: string; position?: string; blur?: boolean };
  href?: string;
  repoHref?: string;
};

export const projectCategories = ["Websites", "Bots", "Products", "Mini Projects", "Automation"];

export const projects: Project[] = [
  {
    slug: "tappd",
    title: "Tappd",
    categories: ["Products", "Bots"],
    category: "Attendance website + Telegram bot",
    kind: "Web + Bot",
    role: "Full-stack build",
    status: "Private tool",
    summary:
      "Built for my SCDF division. The website provides a dashboard to view officer statuses, while Telegram is where officers key in their statuses using the bot.",
    stack: ["JavaScript", "React", "Vite", "Express", "Prisma", "Postgres", "Telegram Bot"],
    image: { src: "/Dashboard.png", width: 1440, height: 900, alt: "Tappd attendance dashboard", blur: true },
    repoHref: "https://github.com/fathiryudh/tappd",
  },
  {
    slug: "draaqutz",
    title: "Draaqutz",
    categories: ["Websites", "Bots"],
    category: "Haircut booking website + Telegram workflow",
    kind: "Web",
    role: "Product and engineering",
    status: "Live",
    summary:
      "The website showcases clients, pricing, about, and portfolio. Booking is handled entirely on Telegram through a booking bot I built.",
    stack: ["TypeScript", "Next.js", "Supabase", "Tailwind CSS", "Telegram", "Vercel"],
    image: {
      src: "/draaqutz-site.jpeg",
      width: 2880,
      height: 9774,
      alt: "Draaqutz haircut booking website",
      position: "top",
    },
    href: "https://draaqutz.vercel.app/",
    repoHref: "https://github.com/fathiryudh/draaqutz",
  },
  {
    slug: "khutwa",
    title: "Khutwa",
    categories: ["Products"],
    category: "Mobile app concept",
    kind: "Mobile",
    role: "App architecture and UX",
    status: "In development",
    summary:
      "A Flutter app direction around guided progress, local reminders, and daily rhythm. The code is still being shaped while the product idea gets tested.",
    stack: ["Dart", "Flutter", "Hive", "Provider", "Local Notifications", "Geolocation"],
    repoHref: "https://github.com/fathiryudh/khutwa",
  },
  {
    slug: "smartflight-hunter",
    title: "SmartFlight Hunter",
    categories: ["Mini Projects"],
    category: "Reverse-hub flight discovery MVP",
    kind: "Flight discovery",
    role: "Product and engineering",
    status: "MVP",
    summary:
      "Explores alternate hub routes and split-ticket combinations, labels route feasibility, and reports flight options. Live searches use SerpAPI’s Google Flights and Explore data; without an API key, the app falls back to deterministic demo results.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "SerpAPI", "Zod"],
  },
  {
    slug: "dr-sarah-angullia",
    title: "Dr Sarah Angullia",
    categories: ["Websites"],
    category: "Clinical psychology practice website",
    kind: "Professional site",
    role: "Website build",
    status: "Live",
    summary:
      "A practice website for a clinical psychologist, presenting therapy for children, adolescents, and adults, areas of support, qualifications, and enquiry steps. The site describes the approach as evidence-based, collaborative, and neuroaffirmative.",
    stack: ["React", "Vite", "React Router", "Framer Motion"],
    image: {
      src: "/dr-sarah-angullia.jpg",
      width: 1920,
      height: 1200,
      alt: "Homepage of Dr Sarah Angullia’s clinical psychology practice website",
    },
    href: "https://drsarahangullia.com/",
  },
  {
    slug: "sghustle",
    title: "SGHustle",
    categories: ["Websites"],
    category: "Filmmaker portfolio and merchandise shop",
    kind: "Portfolio + shop",
    role: "Website build",
    status: "Live",
    summary:
      "A photography and filmmaking portfolio for a Singapore-based creator, with commercial, event, portrait, and film work alongside a merchandise shop.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Motion", "Zustand"],
    image: {
      src: "/sghustle.jpg",
      width: 1920,
      height: 1200,
      alt: "SGHustle photography portfolio homepage with its image grid and yellow headline",
    },
    href: "https://sghustlewebsite.vercel.app/",
  },
  {
    slug: "hr-resume-rpa",
    title: "HR Resume RPA",
    categories: ["Automation"],
    category: "HR resume intake automation",
    kind: "RPA workflow",
    role: "Workflow automation",
    status: "Built",
    summary:
      "A UiPath workflow automates HR resume intake, using OpenAI API calls to read PDF resumes and extract personal details and standout points. It combines those with job application details in an Excel tracker, files resumes in Google Drive by role, year, and month, then sends the completed spreadsheet to HR.",
    stack: ["UiPath", "Visual Basic", "OpenAI API", "PDF Processing", "Excel", "Google Drive"],
  },
  {
    slug: "agentic-workflows",
    title: "Agentic automation",
    categories: ["Automation"],
    category: "Agentic automation and workflows",
    kind: "Agentic workflows",
    role: "Exploration",
    status: "Work in progress",
    summary: "Exploring how agents can handle useful, multi-step workflows reliably.",
    stack: [],
  },
];

export type TimelineItem = { period: string; title: string; detail: string };

export const experience: TimelineItem[] = [
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

export const education: TimelineItem[] = [
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

export type SkillGroup = "language" | "framework" | "data" | "infra";

export const skillGroups: { id: SkillGroup; label: string }[] = [
  { id: "language", label: "Languages" },
  { id: "framework", label: "Frameworks" },
  { id: "data", label: "Data" },
  { id: "infra", label: "Infra & practice" },
];

export const skills: { label: string; group: SkillGroup }[] = [
  { label: "Python", group: "language" },
  { label: "C", group: "language" },
  { label: "JavaScript", group: "language" },
  { label: "TypeScript", group: "language" },
  { label: "Dart", group: "language" },
  { label: "PHP", group: "language" },
  { label: "React", group: "framework" },
  { label: "Next.js", group: "framework" },
  { label: "Flutter", group: "framework" },
  { label: "Express", group: "framework" },
  { label: "Tailwind CSS", group: "framework" },
  { label: "PostgreSQL", group: "data" },
  { label: "MySQL", group: "data" },
  { label: "MongoDB", group: "data" },
  { label: "Prisma", group: "data" },
  { label: "Supabase", group: "data" },
  { label: "Firebase", group: "data" },
  { label: "REST APIs", group: "infra" },
  { label: "Docker", group: "infra" },
  { label: "DevOps", group: "infra" },
  { label: "Vercel", group: "infra" },
];

export const sideNotes = ["Singapore", "SIT", "Golf", "Baseball", "Softball", "Gamer"];

export const socials = [
  { label: "GitHub", href: "https://github.com/fathiryudh" },
  { label: "LinkedIn", href: "https://linkedin.com/in/fathiryudhistira" },
  { label: "X", href: "https://x.com/fathiryudh" },
];

export const EMAIL = "fathiryudh03@gmail.com";
export const FULL_NAME = "Muhammad Fathir Yudhistira";
