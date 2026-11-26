import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Archivo, Geist_Mono, Permanent_Marker, Unbounded } from "next/font/google";
import SmoothScroll from "@/components/animations/smooth-scroll";
import { VeilProvider } from "@/components/site/veil";

const BOOT_SCRIPT = `(() => {
  const root = document.documentElement;
  root.classList.add("js");
  try {
    root.dataset.theme = localStorage.getItem("theme") || "dark";
  } catch {}
  try {
    // Lite mode (components/site/lite.ts): weak hardware, reduced motion, or an earlier slow page this visit.
    const n = navigator;
    if ((n.hardwareConcurrency || 8) <= 4 || (n.deviceMemory || 8) <= 4 || sessionStorage.getItem("lite")
        || matchMedia("(prefers-reduced-motion: reduce)").matches) root.dataset.lite = "";
  } catch {}
  try {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.dataset.veil = sessionStorage.getItem("veil:seen") ? "fast" : "boot";
      sessionStorage.setItem("veil:seen", "1");
    }
  } catch {}
})();`;
import "./globals.css";

const archivo = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
  axes: ["wdth"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-heavy",
  subsets: ["latin"],
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fathiryudh.com"),
  title: "Muhammad Fathir Yudhistira | Software engineering student",
  description:
    "Fathir Yudhistira makes useful software for the web and mobile. Software engineering student at SIT, based in Singapore.",
  keywords: ["Muhammad Fathir Yudhistira", "software engineer", "portfolio", "Singapore", "Next.js", "React", "Telegram bots", "web developer"],
  authors: [{ name: "Muhammad Fathir Yudhistira" }],
  openGraph: {
    title: "Muhammad Fathir Yudhistira | Software engineering student",
    description: "Useful software for the web and mobile, made by Fathir Yudhistira in Singapore.",
    url: "https://fathiryudh.com",
    siteName: "Fathir Yudhistira Portfolio",
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@fathiryudh",
    title: "Muhammad Fathir Yudhistira | Software engineering student",
    description: "Useful software for the web and mobile, made by Fathir Yudhistira in Singapore.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Before first paint: mark JS as running (reveals only hide content when they can run), apply the
            saved or OS colour theme, and arm the page-load veil (counter loader on a session's first visit). */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className={`${archivo.variable} ${geistMono.variable} ${unbounded.variable} ${marker.variable}`}>
        <VeilProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </VeilProvider>
        <Analytics />
      </body>
    </html>
  );
}
