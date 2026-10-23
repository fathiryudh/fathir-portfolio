import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SignaturePad from "@/components/signature-pad";

export const metadata: Metadata = {
  title: "Signature pad",
  robots: { index: false },
};

// Dev-only tool for drawing the homepage signature; it 404s in production.
export default function SignaturePadPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <SignaturePad />;
}
