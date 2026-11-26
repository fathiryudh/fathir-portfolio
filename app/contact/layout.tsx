import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-content";
import "../(site)/site.css";

// The contact page is a client component, so its metadata lives here.
export const metadata: Metadata = pageMetadata(
  "/contact",
  "Contact | Muhammad Fathir Yudhistira",
  "Get in touch with Fathir Yudhistira about a project, a role or anything you're building.",
);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
