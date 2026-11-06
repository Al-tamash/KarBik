"use client";

/**
 * FilterSidebar — Advanced filtering for car inventory
 * 
 * WHAT: Left-hand filter drawer/aside.
 * WHY: Lets users quickly filter thousands of cars down to their precise budget, 
 *      fuel preference, gearbox, or body shape.
 *      To look premium, we use:
   *      - Clean Inter labels
 *      - Smooth transitions on active state buttons
 *      - Clear, high-contrast inputs with primary color outline rings
 *      - Coordinated Lucide icons for visual scanability
 */
import React, { type Dispatch, type SetStateAction } from "react";
import { X, Fuel, Settings, Gauge, Calendar, IndianRupee, Car as CarIcon, ShieldAlert } from "lucide-react";

type FilterState = {
  search: string; brand: string; fuelType: string; transmission: string;
  bodyType: string; owners: string; minPrice: string; maxPrice: string;
  maxMileage: string; sort: string; page: number;
};

export default function FilterSidebar({
  filters,
  setFilters,
  onClose,
  brands = []
}: {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  onClose?: () => void;
  brands?: string[];
}) {
  const bodyTypes = [
    { label: "Hatchback", value: "hatchback" },
    { label: "Sedan", value: "sedan" },
    { label: "SUV", value: "suv" },
    { label: "MUV", value: "muv" },
  ];
  const ownershipOptions = [
    { label: "1st", value: "1st owner" },
    { label: "2nd", value: "2nd owner" },
    { label: "3rd+", value: "3rd owner" },
  ];
  const fuelTypes = [
    { label: "Petrol", value: "petrol" },
    { label: "Diesel", value: "diesel" },
    { label: "EV", value: "electric" },
    { label: "CNG", value: "cng" },
    { label: "Hybrid", value: "hybrid" },
  ];
  const transmissions = [
    { label: "Manual", value: "manual" },
    { label: "Automatic", value: "automatic" },
  ];

  const handleChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      brand: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      owners: "",
      minPrice: "",
      maxPrice: "",
      maxMileage: "",
      sort: "newest",
      page: 1
    });
  };

  return (
    <div className="flex h-full flex-col bg-surface overflow-y-auto pb-20">
      {/* ─── Header area ─── */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-xl font-black text-ink-strong tracking-tight">Filters</h2>
        <button 
          onClick={clearFilters}
          className="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors"
        >
          Reset All
        </button>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-2 rounded-lg text-ink-muted hover:bg-surface-alt hover:text-ink-strong transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-9">
        {/* ─── Price Section ─── */}
        <section>
          {/* Change text-ink-subtle to text-ink-muted for high-contrast accessibility */}
          <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2 select-none">
            <IndianRupee className="h-3.5 w-3.5" /> Budget (₹)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleChange("minPrice", e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleChange("maxPrice", e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>
        </section>

        {/* ─── Body Type Section ─── */}
        <section>
          {/* Change text-ink-subtle to text-ink-muted for high-contrast accessibility */}
          <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2 select-none">
            <CarIcon className="h-3.5 w-3.5" /> Body Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {bodyTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleChange("bodyType", filters.bodyType === type.value ? "" : type.value)}
                className={`rounded-xl px-3 py-2.5 text-xs font-black transition-all border select-none ${
                  filters.bodyType === type.value 
                    ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100" 
                    : "bg-surface text-ink-muted border-border hover:border-border-strong hover:text-ink-strong active:scale-98"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Ownership Section ─── */}
        <section>
          {/* Change text-ink-subtle to text-ink-muted for high-contrast accessibility */}
          <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2 select-none">
            <ShieldAlert className="h-3.5 w-3.5" /> Ownership
          </h3>
          <div className="flex gap-2">
            {ownershipOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleChange("owners", filters.owners === option.value ? "" : option.value)}
                className={`flex-1 rounded-xl py-3 text-xs font-black transition-all border select-none ${
                  filters.owners === option.value 
                    ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100" 
                    : "bg-surface text-ink-muted border-border hover:border-border-strong hover:text-ink-strong active:scale-98"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Fuel Type Section ─── */}
        <section>
          {/* Change text-ink-subtle to text-ink-muted for high-contrast accessibility */}
          <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2 select-none">
            <Fuel className="h-3.5 w-3.5" /> Fuel Type
          </h3>
          <div className="flex flex-wrap gap-2">
            {fuelTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleChange("fuelType", filters.fuelType === type.value ? "" : type.value)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border select-none ${
                  filters.fuelType === type.value 
                    ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100" 
                    : "bg-surface text-ink-muted border-border hover:border-border-strong hover:text-ink-strong active:scale-98"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Transmission Section ─── */}
        <section>
          {/* Change text-ink-subtle to text-ink-muted for high-contrast accessibility */}
          <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2 select-none">
            <Settings className="h-3.5 w-3.5" /> Transmission
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {transmissions.map((t) => (
              <button
                key={t.value}
                onClick={() => handleChange("transmission", filters.transmission === t.value ? "" : t.value)}
                className={`rounded-xl px-4 py-3 text-xs font-bold transition-all border select-none ${
                  filters.transmission === t.value 
                    ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100" 
                    : "bg-surface text-ink-muted border-border hover:border-border-strong hover:text-ink-strong active:scale-98"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Kilometers Section ─── */}
        <section>
          {/* Change text-ink-subtle to text-ink-muted for high-contrast accessibility */}
          <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2 select-none">
            <Gauge className="h-3.5 w-3.5" /> Max KM Driven
          </h3>
          <input
            type="range"
            min="0"
            max="200000"
            step="10000"
            value={filters.maxMileage || 200000}
            onChange={(e) => handleChange("maxMileage", e.target.value === "200000" ? "" : e.target.value)}
            className="w-full accent-primary-600 h-1.5 bg-surface-alt rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-2 select-none">
            {/* Change range extreme markers to text-ink-muted for legibility */}
            <span className="text-xs font-bold text-ink-muted">0</span>
            <span className="text-xs font-black text-ink-strong">
              {filters.maxMileage ? `${Number(filters.maxMileage).toLocaleString()} km` : "Any mileage"}
            </span>
            <span className="text-xs font-bold text-ink-muted">200k+</span>
          </div>
        </section>
      </div>
    </div>
  );
}
