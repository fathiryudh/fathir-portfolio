"use client";

import {
  SiJavascript,
  SiTypescript,
  SiDart,
  SiReact,
  SiNextdotjs,
  SiVite,
  SiFlutter,
  SiTailwindcss,
  SiExpress,
  SiPrisma,
  SiPostgresql,
  SiSupabase,
  SiVercel,
  SiTelegram,
  SiPhp,
} from "react-icons/si";
import { Bell, MapPin, Globe, Box, Layers } from "lucide-react";

type SkillGroup = {
  label: string;
  description: string;
  items: string[];
};

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  JavaScript: SiJavascript,
  TypeScript: SiTypescript,
  Dart: SiDart,
  React: SiReact,
  "Next.js": SiNextdotjs,
  Vite: SiVite,
  Flutter: SiFlutter,
  "Tailwind CSS": SiTailwindcss,
  Express: SiExpress,
  Prisma: SiPrisma,
  Postgres: SiPostgresql,
  Supabase: SiSupabase,
  Vercel: SiVercel,
  PHP: SiPhp,
  Hive: Box,
  Provider: Layers,
  "Telegram Bot API": SiTelegram,
  "Telegram workflows": SiTelegram,
  "Local Notifications": Bell,
  Geolocation: MapPin,
  "REST APIs": Globe,
};

const ICON_COLOR_MAP: Record<string, string> = {
  JavaScript: "#F7DF1E",
  TypeScript: "#3178C6",
  Dart: "#0175C2",
  React: "#61DAFB",
  "Next.js": "#111111",
  Vite: "#646CFF",
  Flutter: "#02569B",
  "Tailwind CSS": "#38BDF8",
  Express: "#111111",
  Prisma: "#2D3748",
  Postgres: "#4169E1",
  Supabase: "#3ECF8E",
  Vercel: "#111111",
  PHP: "#777BB4",
  Hive: "#F7C948",
  Provider: "#8B5E34",
  "Telegram Bot API": "#26A5E4",
  "Telegram workflows": "#26A5E4",
  "Local Notifications": "#545863",
  Geolocation: "#D95F43",
  "REST APIs": "#00E8FC",
};

export default function OrbitIcons({ groups }: { groups: SkillGroup[] }) {
  return (
    <div
      className="orbit-container reveal"
      role="img"
      aria-label={`Tech stack: ${groups.map((g) => g.items.join(", ")).join("; ")}`}
    >
      {groups.map((group, i) => (
        <div key={`trace-${i}`} className={`orbit-trace orbit-trace--${i}`}>
          <span className="orbit-trace__label">{group.label}</span>
        </div>
      ))}

      <div className="orbit-center">FY</div>

      {groups.map((group, ringIndex) => (
        <div key={group.label} className={`orbit-ring orbit-ring--${ringIndex}`}>
          {group.items.map((skill, i) => {
            const angle = (360 / group.items.length) * i;
            const counterAngle = -angle;
            const Icon = ICON_MAP[skill];
            return (
              <div
                key={skill}
                className={`orbit-icon orbit-icon--ring-${ringIndex}`}
                style={
                  {
                    "--angle": `${angle}deg`,
                    "--counter-angle": `${counterAngle}deg`,
                    "--icon-color": ICON_COLOR_MAP[skill] ?? "var(--ink)",
                  } as React.CSSProperties
                }
              >
                <div className="orbit-icon__face">
                  {Icon ? <Icon size={20} /> : <span className="orbit-icon__text">{skill[0]}</span>}
                  <span className="orbit-icon__label">{skill}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

    </div>
  );
}
