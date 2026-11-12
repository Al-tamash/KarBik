"use client";

/**
 * HeroSearchWidget: the homepage's primary action.
 * Tabs (budget / brand / body type) with one-tap chips, then "Show cars".
 * Every chip maps to a filter the /cars page and /api/cars actually support.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Tab = "budget" | "brand" | "body";

type Chip = { label: string; params: Record<string, string> };

const BUDGET_CHIPS: Chip[] = [
  // Bands follow the live inventory (nothing listed under ₹5 L yet), so no chip opens an empty page.
  { label: "Under ₹10 L", params: { maxPrice: "1000000" } },
  { label: "₹10–15 L", params: { minPrice: "1000000", maxPrice: "1500000" } },
  { label: "₹15–20 L", params: { minPrice: "1500000", maxPrice: "2000000" } },
  { label: "Above ₹20 L", params: { minPrice: "2000000" } },
];

const BODY_CHIPS: Chip[] = [
  { label: "Hatchback", params: { bodyType: "hatchback" } },
  { label: "Sedan", params: { bodyType: "sedan" } },
  { label: "SUV", params: { bodyType: "suv" } },
  { label: "MUV", params: { bodyType: "muv" } },
];

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "budget", label: "By budget" },
  { id: "brand", label: "By brand" },
  { id: "body", label: "By body type" },
];

interface HeroSearchWidgetProps {
  initialBrands?: string[];
}

export default function HeroSearchWidget({ initialBrands }: HeroSearchWidgetProps = {}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("budget");
  const [selected, setSelected] = useState<Chip | null>(null);
  // Pre-seed brands from server props if available, eliminating the "Loading brands…" delay
  const [brands, setBrands] = useState<string[]>(
    initialBrands && initialBrands.length > 0 ? initialBrands.slice(0, 10) : []
  );

  useEffect(() => {
    // Skip client fetch if server component already populated initialBrands
    if (initialBrands && initialBrands.length > 0) return;

    fetch(`/api/cars/brands`)
      .then((res) => res.json())
      .then((data) => setBrands(Array.isArray(data) ? data.slice(0, 10) : []))
      .catch(() => {});
  }, [initialBrands]);

  const brandChips: Chip[] = brands.map((b) => ({ label: b, params: { brand: b } }));
  const chips = tab === "budget" ? BUDGET_CHIPS : tab === "brand" ? brandChips : BODY_CHIPS;

  const showCars = () => {
    const params = new URLSearchParams(selected?.params ?? {});
    const qs = params.toString();
    router.push(qs ? `/cars?${qs}` : "/cars");
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-card">
      <div role="tablist" aria-label="Search cars" className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTab(t.id);
                setSelected(null);
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active ? "bg-ink-strong text-surface" : "text-ink-muted hover:bg-surface-alt hover:text-ink-strong"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-4 flex min-h-[3rem] flex-wrap gap-2">
        {chips.length === 0 ? (
          <span className="self-center text-sm text-ink-muted">Loading brands…</span>
        ) : (
          chips.map((chip) => {
            const on = selected?.label === chip.label;
            return (
              <button
                key={chip.label}
                type="button"
                aria-pressed={on}
                onClick={() => setSelected(on ? null : chip)}
                className={`min-h-11 rounded-xl border px-4 text-sm font-semibold tabular-nums transition-colors ${
                  on
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-border-strong bg-surface text-ink hover:border-primary-400"
                }`}
              >
                {chip.label}
              </button>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={showCars}
        className="btn btn-cta btn-full mt-4 rounded-xl py-3.5 text-base font-bold"
      >
        <Search className="h-4 w-4" aria-hidden />
        {selected ? `Show ${selected.label} cars` : "Show all cars"}
      </button>
    </div>
  );
}
