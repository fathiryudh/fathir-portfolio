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
      "Built for my SCDF division. Officers key in their status through a Telegram bot, and the website is the dashboard where you can see where everyone is.",
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
      "A site for a barber: past clients, prices, portfolio and an about page. You don't book on the site though. Bookings go through a Telegram bot I built.",
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
      "A Flutter app for sticking to a daily routine, with guided steps and local reminders. I'm still testing the idea, so the code keeps changing.",
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
      "Looks for other ways to fly by routing through different hubs and splitting tickets, then marks which routes are actually doable. Live searches pull Google Flights data through SerpAPI. Without an API key it runs on fixed demo results.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "SerpAPI", "Zod"],
  },
  {
    slug: "therapist-website",
    title: "Therapist Website",
    categories: ["Websites"],
    category: "Clinical psychology practice website",
    kind: "Professional site",
    role: "Website build",
    status: "Live",
    summary:
      "Website for a clinical psychologist who works with children, teens and adults. It covers what she helps with, her qualifications and how to reach her. Her approach is evidence based, collaborative and neuroaffirmative.",
    stack: ["React", "Vite", "React Router", "Framer Motion"],
    image: {
      src: "/therapist-website.jpg", // cropped so the client's name in the nav isn't shown
      width: 1420,
      height: 890,
      alt: "Therapist website section titled Support for different ages and stages, with cards for children and adults",
      position: "top",
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
      "Portfolio for a Singapore photographer and filmmaker. Commercial, event, portrait and film work up front, with a merch shop on the side.",
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
      "A UiPath bot for HR's pile of resumes. It sends each PDF to the OpenAI API to pull out personal details and anything that stands out, adds that to an Excel tracker next to the application details, files the resume in Google Drive by role, year and month, then sends HR the finished sheet.",
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
    summary: "Figuring out how to get agents through multi-step work without them falling over halfway.",
    stack: [],
  },
];

export type TimelineItem = { period: string; title: string; detail: string };

export const experience: TimelineItem[] = [
  {
    period: "Completed",
    title: "SCDF National Service",
    detail:
      "Did my NS in SCDF and kept building on the side the whole time: Telegram bots, dashboards, booking flows, small web apps.",
  },
  {
    period: "Mar - Aug 2023",
    title: "Sembcorp Industries",
    detail:
      "Built an internal dashboard for the engineering teams on Jurong Island. It pulled data from REST APIs into the reports they used to run operations.",
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
      "Diploma in Infocomm and Media Engineering. Web, mobile, databases, networking, software engineering and security.",
  },
  {
    period: "2025",
    title: "Blockchain Developer Bootcamp",
    detail:
      "Solidity, smart contracts, dApps, Ethereum, DeFi, gas optimisation and Web3.js, run by Pelita Bangsa Academy.",
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

// Child pages replace the root openGraph/twitter objects wholesale, so each page restates them with its own title and URL.
export function pageMetadata(path: string, title: string, description: string) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: "/opengraph-image", siteName: "Fathir Yudhistira Portfolio", locale: "en_SG", type: "website" as const },
    twitter: { card: "summary_large_image" as const, creator: "@fathiryudh", title, description, images: "/opengraph-image" },
  };
}
