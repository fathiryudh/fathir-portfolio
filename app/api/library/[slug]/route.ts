import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeToHtml } from "shiki";
import { library } from "@/lib/library";

// Source for one library entry, highlighted at build time. The library page fetches this only when
// its Code tab is opened, so the highlighted markup never weighs down the first load.

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return library.map((entry) => ({ slug: entry.slug }));
}

const LANGS: Record<string, string> = { tsx: "tsx", ts: "ts", css: "css" };

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = library.find((item) => item.slug === slug);
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });

  const files = await Promise.all(
    entry.files.map(async (path) => {
      const code = readFileSync(join(/* turbopackIgnore: true */ process.cwd(), path), "utf8");
      const html = await codeToHtml(code, {
        lang: LANGS[path.split(".").pop() ?? ""] ?? "text",
        themes: { light: "github-light", dark: "github-dark-dimmed" },
        defaultColor: false,
      });
      return { path, code, html };
    }),
  );

  return Response.json({ files });
}
