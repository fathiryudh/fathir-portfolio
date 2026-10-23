"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVeil } from "@/components/site/veil";
import { setTheme } from "@/components/site/site-header";
import { EMAIL, projects, socials } from "@/lib/site-content";

// ⌘K command menu after Carter Ogunsola's (Design References/carterogunsola.com/Small UI Atoms):
// a search field over grouped results, arrow keys to move, Enter to run, Esc to close.

type Item = { group: string; label: string; hint?: string; run: () => void };

export default function CommandMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { go } = useVeil();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const items = useMemo<Item[]>(() => {
    const visit = (href: string) => () => {
      if (!go(href)) router.push(href);
    };
    const external = (href: string) => () => window.open(href, "_blank", "noopener,noreferrer");
    const toggleTheme = () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    return [
      { group: "Pages", label: "Home", hint: "/", run: visit("/") },
      { group: "Pages", label: "Work", hint: "/work", run: visit("/work") },
      { group: "Pages", label: "About", hint: "/about", run: visit("/about") },
      { group: "Pages", label: "Library", hint: "/library", run: visit("/library") },
      { group: "Pages", label: "Contact", hint: "/contact", run: visit("/contact") },
      ...projects.map((project) => ({
        group: "Projects",
        label: project.title,
        hint: project.categories.join(" · "),
        run: visit(`/work/${project.slug}`),
      })),
      ...socials.map((social) => ({ group: "Links", label: social.label, hint: "↗", run: external(social.href) })),
      {
        group: "Links",
        label: "Copy email",
        hint: EMAIL,
        run: () => {
          navigator.clipboard?.writeText(EMAIL).catch(() => {});
        },
      },
      { group: "Actions", label: "Toggle light / dark", hint: "Theme", run: toggleTheme },
    ];
  }, [go, router]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.group} ${item.label} ${item.hint ?? ""}`.toLowerCase().includes(needle));
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => {
      returnFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const close = () => {
    setQuery("");
    setActive(0);
    onClose();
  };

  const run = (item: Item | undefined) => {
    if (!item) return;
    close();
    item.run();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(results[active]);
    }
  };

  let lastGroup = "";

  return (
    <div className="cmd" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div className="cmd__panel" role="dialog" aria-modal="true" aria-label="Command menu" onKeyDown={onKeyDown}>
        <div className="cmd__search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            ref={inputRef}
            className="cmd__input"
            placeholder="Jump to a page, project or link…"
            value={query}
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-results"
            aria-activedescendant={results[active] ? `cmd-item-${active}` : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
          />
        </div>
        <ul ref={listRef} id="cmd-results" className="cmd__list" role="listbox" aria-label="Results">
          {results.length === 0 ? <li className="cmd__empty">No matches</li> : null}
          {results.map((item, index) => {
            const heading = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={`${item.group}-${item.label}`} role="presentation">
                {heading ? <p className="cmd__heading">{heading}</p> : null}
                <div
                  id={`cmd-item-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={index === active}
                  className={`cmd__item${index === active ? " is-active" : ""}`}
                  onMouseMove={() => setActive(index)}
                  onClick={() => run(item)}
                >
                  <span>{item.label}</span>
                  {item.hint ? <span className="cmd__hint">{item.hint}</span> : null}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="cmd__footer" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>↵</kbd> to open
          </span>
          <span>
            <kbd>esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
