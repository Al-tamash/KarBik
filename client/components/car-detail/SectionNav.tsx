"use client";

/**
 * Sticky anchor bar under the summary (Cars24 and Spinny both use one on a long
 * detail page). Highlights the section in view; tapping scrolls to it.
 */

import React, { useEffect, useRef, useState } from "react";

export type SectionLink = { id: string; label: string };

export default function SectionNav({ items, className = "" }: { items: SectionLink[]; className?: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const links = useRef<Record<string, HTMLAnchorElement | null>>({});

  /* Keep the active pill visible when the bar scrolls sideways (phones). */
  useEffect(() => {
    const el = links.current[active];
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ inline: "nearest", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActive(id);
  }

  return (
    <nav
      aria-label="On this page"
      className={`sticky top-16 z-30 -mx-4 border-b border-border bg-surface px-4 sm:mx-0 sm:px-0 ${className}`}
    >
      <ul className="flex gap-1 overflow-x-auto py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const on = item.id === active;
          return (
            <li key={item.id} className="shrink-0">
              <a
                ref={(node) => {
                  links.current[item.id] = node;
                }}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.id);
                }}
                aria-current={on ? "true" : undefined}
                className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
                  on ? "bg-ink-strong text-surface" : "text-ink-muted hover:bg-surface-alt hover:text-ink"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
