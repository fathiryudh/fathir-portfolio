"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dial, { type DialControl } from "@/components/library/dial";
import { demos } from "@/components/library/demos";
import type { LibraryEntry } from "@/lib/library";

// The library: a dial of components on the left, the one on the axis previewed live on the right.
// The name and notes follow the dial instantly; the demo itself mounts once the dial has rested on
// an item for a moment, so spinning past heavy previews doesn't build and tear each one down.

const MOUNT_DELAY = 180;

type SourceFile = { path: string; code: string; html: string };

const sourceCache = new Map<string, Promise<SourceFile[]>>();
const loadSource = (slug: string) => {
  if (!sourceCache.has(slug)) {
    sourceCache.set(
      slug,
      fetch(`/api/library/${slug}`)
        .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
        .then((data: { files: SourceFile[] }) => data.files)
        .catch((error) => {
          sourceCache.delete(slug);
          throw error;
        }),
    );
  }
  return sourceCache.get(slug)!;
};

function Code({ slug }: { slug: string }) {
  const [state, setState] = useState<{ slug: string; files: SourceFile[] | null; failed: boolean }>({
    slug,
    files: null,
    failed: false,
  });
  const [fileIndex, setFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let live = true;
    loadSource(slug).then(
      (files) => live && setState({ slug, files, failed: false }),
      () => live && setState({ slug, files: null, failed: true }),
    );
    return () => {
      live = false;
    };
  }, [slug]);

  const files = state.slug === slug ? state.files : null;
  const file = files?.[Math.min(fileIndex, files.length - 1)];

  if (state.slug === slug && state.failed) return <p className="lib-code__status label muted">Couldn’t load the source.</p>;
  if (!files || !file) return <p className="lib-code__status label muted">Loading source…</p>;

  return (
    <div className="lib-code">
      <div className="lib-code__bar">
        <div className="lib-code__files" role="tablist" aria-label="Files">
          {files.map((item, i) => (
            <button
              key={item.path}
              type="button"
              role="tab"
              aria-selected={item === file}
              className="lib-code__file label"
              onClick={() => setFileIndex(i)}
            >
              {item.path.split("/").pop()}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="lib-code__copy label"
          onClick={() => {
            navigator.clipboard?.writeText(file.code).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            });
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="lib-code__path label muted">{file.path}</p>
      <div className="lib-code__body" data-lenis-prevent dangerouslySetInnerHTML={{ __html: file.html }} />
    </div>
  );
}

export default function Library({ entries }: { entries: LibraryEntry[] }) {
  const items = useMemo(() => entries.map((entry) => ({ id: entry.slug, label: entry.name })), [entries]);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(0);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const timer = useRef(0);
  const dial = useRef<DialControl | null>(null);

  // A shared link (#slug) spins the dial to that component after load.
  useEffect(() => {
    const index = entries.findIndex((entry) => entry.slug === window.location.hash.slice(1));
    if (index > 0) dial.current?.settleTo(index);
  }, [entries]);

  const onChange = useCallback(
    (index: number) => {
      setActive(index);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setMounted(index);
        history.replaceState(null, "", `#${entries[index].slug}`);
      }, MOUNT_DELAY);
    },
    [entries],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const entry = entries[active];
  const shown = entries[mounted];
  const Demo = demos[shown.slug];

  return (
    <section className="library" aria-label="Component library">
      <div className="library__dial">
        <p className="library__count label">
          Library <span className="muted">({String(entries.length).padStart(2, "0")})</span>
        </p>
        <Dial items={items} label="Components" onChange={onChange} controlRef={dial} />
        <p className="library__help label muted">Drag · Scroll · ↑↓</p>
      </div>

      <div className="library__panel">
        <header className="library__head">
          <div className="library__title">
            <span className="label muted">{String(active + 1).padStart(2, "0")}</span>
            <h1 key={entry.slug} className="library__name">
              {entry.name}
            </h1>
          </div>
          <div className="library__tabs" role="tablist" aria-label="View">
            {(["preview", "code"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                className="library__tab label"
                onClick={() => setTab(value)}
              >
                {value === "preview" ? "Preview" : "Code"}
              </button>
            ))}
          </div>
        </header>

        <div className={`library__stage${mounted !== active ? " is-switching" : ""}`}>
          {tab === "preview" ? (
            <div key={shown.slug} className="library__demo">
              {Demo ? <Demo /> : null}
            </div>
          ) : (
            <Code key={shown.slug} slug={shown.slug} />
          )}
        </div>

        <footer className="library__meta">
          <p className="library__summary">{entry.summary}</p>
          <dl className="library__facts label">
            <div>
              <dt className="muted">After</dt>
              <dd>{entry.reference}</dd>
            </div>
            <div>
              <dt className="muted">Built with</dt>
              <dd>{entry.tags.join(" · ")}</dd>
            </div>
          </dl>
        </footer>
      </div>
    </section>
  );
}
