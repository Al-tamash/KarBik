import React from "react";
import { ChevronDown } from "lucide-react";

export type Faq = { q: string; a: string };

/** Native <details> rows: keyboard and screen-reader behaviour for free, no JS. */
export default function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {faqs.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-base font-semibold text-ink-strong marker:hidden [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown
              className="h-5 w-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="max-w-prose pb-4 text-sm leading-relaxed text-ink-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
