import type { Metadata } from "next";
import Library from "@/components/library/library";
import { library } from "@/lib/library";

export const metadata: Metadata = {
  title: "Library | Muhammad Fathir Yudhistira",
  description: "Reusable interface components from this site, each with a live preview and its source code.",
};

export default function LibraryPage() {
  return (
    <div data-page className="page">
      <Library entries={library} />
    </div>
  );
}
