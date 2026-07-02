import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SmoothScroll from "@/components/animations/smooth-scroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fathiryudh.com"),
  title: "Muhammad Fathir Yudhistira | Software Builder",
  description:
    "Portfolio of Muhammad Fathir Yudhistira — practical web apps, Telegram bots, dashboards, and mobile ideas. Software Engineering student at SIT, based in Singapore.",
  keywords: ["Muhammad Fathir Yudhistira", "software engineer", "portfolio", "Singapore", "Next.js", "React", "Telegram bots", "web developer"],
  authors: [{ name: "Muhammad Fathir Yudhistira" }],
  openGraph: {
    title: "Muhammad Fathir Yudhistira | Software Builder",
    description:
      "Selected projects, Telegram bots, dashboards, and practical software work by Muhammad Fathir Yudhistira.",
    url: "https://fathiryudh.com",
    siteName: "Fathir Yudhistira Portfolio",
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@fathiryudh",
    title: "Muhammad Fathir Yudhistira | Software Builder",
    description:
      "Practical web apps, Telegram bots, dashboards, and mobile ideas by Fathir Yudhistira.",
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
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
