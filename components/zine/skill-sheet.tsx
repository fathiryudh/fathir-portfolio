import {
  SiDart,
  SiExpress,
  SiFlutter,
  SiJavascript,
  SiNextdotjs,
  SiPhp,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTelegram,
  SiTypescript,
  SiVercel,
  SiVite,
} from "react-icons/si";
import { Bell, Box, Globe, Layers, MapPin } from "lucide-react";
import { tilt, torn } from "@/components/zine/paper";

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

const STICKER_TONES = ["yellow", "paper", "pink", "blue", "red"] as const;

export default function SkillSheet({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="skill-sheets">
      {groups.map((group, groupIndex) => (
        <div
          key={group.label}
          className="skill-sheet reveal reveal--slide"
          style={{ clipPath: torn(200 + groupIndex, 2.5), rotate: `${tilt(210 + groupIndex, 1.5)}deg` }}
        >
          <p className="skill-sheet__label">
            <span>{String(groupIndex + 1).padStart(2, "0")}</span>
            {group.label}
          </p>
          <p className="skill-sheet__description">{group.description}</p>
          <ul className="skill-sheet__stickers">
            {group.items.map((skill, index) => {
              const Icon = ICON_MAP[skill];
              return (
                <li
                  key={skill}
                  className={`sticker sticker--${STICKER_TONES[(index + groupIndex) % STICKER_TONES.length]} reveal reveal--drop`}
                  style={{ rotate: `${tilt(300 + groupIndex * 20 + index, 5)}deg`, "--i": index } as React.CSSProperties}
                >
                  {Icon ? <Icon size={16} /> : null}
                  {skill}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
