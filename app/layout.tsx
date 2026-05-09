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
  title: "Muhammad Fathir Yudhistira | Portfolio",
  description:
    "Portfolio for Muhammad Fathir Yudhistira, a software builder focused on practical web apps, Telegram bots, dashboards, and mobile ideas.",
  openGraph: {
    title: "Muhammad Fathir Yudhistira | Portfolio",
    description:
      "Selected projects, Telegram bots, dashboards, and practical software work by Muhammad Fathir Yudhistira.",
    type: "website",
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
