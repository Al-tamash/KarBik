"use client";

/**
 * CarsQuickFilters — One-tap horizontal filter pills
 *
 * WHAT: A thumb-friendly horizontal scrolling pill bar for popular searches.
 * WHY: Buyers on mobile and desktop want instant one-click access to top segments
 *      (SUVs, Sedans, Automatics, Budget bands) without digging into deep filter menus.
 */

import React from "react";

export type QuickPill = {
  label: string;
  key: string;
  value: string;
};

const QUICK_PILLS: QuickPill[] = [
  { label: "SUVs", key: "bodyType", value: "suv" },
  { label: "Sedans", key: "bodyType", value: "sedan" },
  { label: "Automatic", key: "transmission", value: "automatic" },
  { label: "Under ₹10 L", key: "maxPrice", value: "1000000" },
  { label: "₹10–15 L", key: "priceRange", value: "1000000-1500000" },
  { label: "Petrol", key: "fuelType", value: "petrol" },
  { label: "Diesel", key: "fuelType", value: "diesel" },
  { label: "Electric", key: "fuelType", value: "electric" },
];

interface CarsQuickFiltersProps {
  activeFilters: Record<string, string>;
  onTogglePill: (pill: QuickPill) => void;
}

export default function CarsQuickFilters({ activeFilters, onTogglePill }: CarsQuickFiltersProps) {
  // Check if a pill is currently active based on filter state
  const isPillActive = (pill: QuickPill): boolean => {
    if (pill.key === "priceRange") {
      return activeFilters.minPrice === "1000000" && activeFilters.maxPrice === "1500000";
    }
    return activeFilters[pill.key]?.toLowerCase() === pill.value.toLowerCase();
  };

  return (
    <div className="w-full border-b border-border bg-surface py-3">
      <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 scrollbar-hide">
        {QUICK_PILLS.map((pill) => {
          const active = isPillActive(pill);
          return (
            <button
              key={pill.label}
              type="button"
              onClick={() => onTogglePill(pill)}
              aria-pressed={active}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all select-none ${
                active
                  ? "bg-primary-600 text-white shadow-xs"
                  : "bg-surface-alt text-ink border border-border hover:border-border-strong hover:bg-neutral-200/50"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

