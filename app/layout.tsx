import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono, Permanent_Marker } from "next/font/google";
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

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fathiryudh.com"),
  title: "Muhammad Fathir Yudhistira | Software Builder",
  description:
    "Fathir Yudhistira builds useful software for the web and mobile. Software engineering student at SIT in Singapore.",
  keywords: ["Muhammad Fathir Yudhistira", "software engineer", "portfolio", "Singapore", "Next.js", "React", "Telegram bots", "web developer"],
  authors: [{ name: "Muhammad Fathir Yudhistira" }],
  openGraph: {
    title: "Muhammad Fathir Yudhistira | Software Builder",
    description: "Useful software for the web and mobile, by Fathir Yudhistira.",
    url: "https://fathiryudh.com",
    siteName: "Fathir Yudhistira Portfolio",
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@fathiryudh",
    title: "Muhammad Fathir Yudhistira | Software Builder",
    description: "Useful software for the web and mobile, by Fathir Yudhistira.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${marker.variable}`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
