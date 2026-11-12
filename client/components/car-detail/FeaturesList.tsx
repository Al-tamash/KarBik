"use client";

import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { CarFeatures } from "@/lib/api-types";

const GROUPS: Array<{ key: keyof CarFeatures; label: string }> = [
  { key: "comfort", label: "Comfort and convenience" },
  { key: "safety", label: "Safety" },
  { key: "interior", label: "Interior" },
  { key: "exterior", label: "Exterior" },
];

const COLLAPSED = 6;

/** Feature groups as plain lists. Long groups are cut at six items until expanded. */
export default function FeaturesList({ features }: { features?: Partial<CarFeatures> | null }) {
  const [open, setOpen] = useState(false);
  const data = (features ?? {}) as Record<string, string[] | undefined>;
  const groups = GROUPS.map((g) => ({ ...g, items: (data[g.key] ?? []).filter(Boolean) })).filter(
    (g) => g.items.length > 0,
  );
  const hasMore = groups.some((g) => g.items.length > COLLAPSED);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  if (groups.length === 0) return null;

  return (
    <div>
      <div className="grid gap-x-12 gap-y-7 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.key}>
            <h3 className="text-base font-bold text-ink-strong">{g.label}</h3>
            <ul className="mt-3 space-y-2.5">
              {(open ? g.items : g.items.slice(0, COLLAPSED)).map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
        >
          {open ? "Show fewer features" : `Show all ${total} features`}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      )}
    </div>
  );
}
