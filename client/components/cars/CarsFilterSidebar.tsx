"use client";

/**
 * CarsFilterSidebar — Desktop faceted filter aside
 *
 * WHAT: Clean, structured sidebar filters calibrated to actual Hyderabad inventory.
 * WHY: Buyers need to quickly drill down by Budget, Body Type, Brand, Transmission,
 *      and Fuel Type without encountering clipped controls or scroll traps.
 */

import React from "react";
import { IndianRupee, Car, Settings, Fuel, BadgeCheck, X } from "lucide-react";

export type FilterState = {
  search: string;
  brand: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  owners: string;
  minPrice: string;
  maxPrice: string;
  maxMileage: string;
  sort: string;
  page: number;
};

interface CarsFilterSidebarProps {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string | number) => void;
  onReset: () => void;
  brands: string[];
  totalMatches?: number;
  onCloseMobile?: () => void;
}

const BUDGET_PRESETS = [
  { label: "Under ₹10 L", min: "", max: "1000000" },
  { label: "₹10–15 L", min: "1000000", max: "1500000" },
  { label: "₹15–20 L", min: "1500000", max: "2000000" },
  { label: "Above ₹20 L", min: "2000000", max: "" },
];

const BODY_TYPES = [
  { label: "SUV", value: "suv" },
  { label: "Sedan", value: "sedan" },
  { label: "Hatchback", value: "hatchback" },
  { label: "MUV", value: "muv" },
];

const TRANSMISSIONS = [
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
];

const FUEL_TYPES = [
  { label: "Petrol", value: "petrol" },
  { label: "Diesel", value: "diesel" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Electric", value: "electric" },
];

export default function CarsFilterSidebar({
  filters,
  onChange,
  onReset,
  brands,
  totalMatches,
  onCloseMobile,
}: CarsFilterSidebarProps) {
  const isBudgetActive = (min: string, max: string) =>
    filters.minPrice === min && filters.maxPrice === max;

  return (
    <div className="flex h-full flex-col bg-surface overflow-hidden">
      {/* ─── Sidebar Header (Fixed at top) ─── */}
      <div className="shrink-0 flex items-center justify-between border-b border-border p-4 sm:p-5">
        <div>
          <h2 className="text-base font-bold text-ink-strong">Filters</h2>
          {typeof totalMatches === "number" && (
            <p className="text-xs text-ink-muted">{totalMatches} cars available</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Reset All
          </button>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-ink-muted hover:bg-surface-alt lg:hidden"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Scrollable Filter Body ─── */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-6 pb-10">
        {/* ─── 1. Budget Section ─── */}
        <section>
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
            <IndianRupee className="h-3.5 w-3.5" /> Budget
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {BUDGET_PRESETS.map((preset) => {
              const active = isBudgetActive(preset.min, preset.max);
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (active) {
                      onChange("minPrice", "");
                      onChange("maxPrice", "");
                    } else {
                      onChange("minPrice", preset.min);
                      onChange("maxPrice", preset.max);
                    }
                  }}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold tabular-nums transition-colors ${
                    active
                      ? "border border-primary-600 bg-primary-50 text-primary-700"
                      : "border border-border bg-surface text-ink hover:border-border-strong"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          {/* Custom Min / Max Price Inputs */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="min-price-input" className="sr-only">Min Price</label>
              <input
                id="min-price-input"
                type="number"
                placeholder="Min ₹"
                value={filters.minPrice}
                onChange={(e) => onChange("minPrice", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink placeholder:text-ink-subtle focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="max-price-input" className="sr-only">Max Price</label>
              <input
                id="max-price-input"
                type="number"
                placeholder="Max ₹"
                value={filters.maxPrice}
                onChange={(e) => onChange("maxPrice", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink placeholder:text-ink-subtle focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* ─── 2. Body Type Section (Promoted right below Budget for instant visibility) ─── */}
        <section className="border-t border-border pt-5">
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
            <Car className="h-3.5 w-3.5" /> Body Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {BODY_TYPES.map((b) => {
              const active = filters.bodyType.toLowerCase() === b.value;
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => onChange("bodyType", active ? "" : b.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? "border border-primary-600 bg-primary-50 text-primary-700"
                      : "border border-border bg-surface text-ink hover:border-border-strong"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── 3. Make / Brand Section (Using authentic BadgeCheck icon) ─── */}
        {brands.length > 0 && (
          <section className="border-t border-border pt-5">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
              <BadgeCheck className="h-3.5 w-3.5 text-primary-600" /> Make / Brand
            </h3>
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {brands.map((brandName) => {
                const active = filters.brand.toLowerCase() === brandName.toLowerCase();
                return (
                  <button
                    key={brandName}
                    type="button"
                    onClick={() => onChange("brand", active ? "" : brandName)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary-50 text-primary-700 font-semibold"
                        : "text-ink hover:bg-surface-alt"
                    }`}
                  >
                    <span>{brandName}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── 4. Transmission Section ─── */}
        <section className="border-t border-border pt-5">
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
            <Settings className="h-3.5 w-3.5" /> Transmission
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TRANSMISSIONS.map((t) => {
              const active = filters.transmission.toLowerCase() === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onChange("transmission", active ? "" : t.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? "border border-primary-600 bg-primary-50 text-primary-700"
                      : "border border-border bg-surface text-ink hover:border-border-strong"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── 5. Fuel Type Section ─── */}
        <section className="border-t border-border pt-5">
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
            <Fuel className="h-3.5 w-3.5" /> Fuel Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {FUEL_TYPES.map((f) => {
              const active = filters.fuelType.toLowerCase() === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => onChange("fuelType", active ? "" : f.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? "border border-primary-600 bg-primary-50 text-primary-700"
                      : "border border-border bg-surface text-ink hover:border-border-strong"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
