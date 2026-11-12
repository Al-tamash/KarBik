"use client";
import type { ApiCar } from "@/lib/api-types";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import CarCard from "@/components/CarCard";



export default function FeaturedCars({ initialCars }: { initialCars?: ApiCar[] }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [cars, setCars] = useState<ApiCar[]>(initialCars ?? []);
  const [loading, setLoading] = useState(!initialCars);
  // The server already rendered the unfiltered list; only fetch on filter change.
  const skipInitialFetch = useRef(Boolean(initialCars));
  const [fetchError, setFetchError] = useState("");

  const quickFilters = [
    { label: "All", query: {} },
    { label: "SUV", query: { bodyType: "suv" } },
    { label: "Sedan", query: { bodyType: "sedan" } },
    { label: "Hatchback", query: { bodyType: "hatchback" } },
    { label: "Automatic", query: { transmission: "automatic" } },
    { label: "Electric", query: { fuelType: "electric" } },
    { label: "Under ₹10 L", query: { maxPrice: 1000000 } },
  ];

  const fetchCars = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    const filter = quickFilters.find(f => f.label === activeFilter);
    if (filter && filter.query) {
      Object.entries(filter.query).forEach(([key, value]) => {
        params.set(key, String(value));
      });
    }

    params.set("limit", "8");

    try {
      const res = await fetch(`/api/cars?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Unable to load cars");
      }
      const data = await res.json();
      setCars(data.cars || []);
      setFetchError("");
    } catch (err) {
      setCars([]);
      setFetchError((err as Error).message || "Unable to load cars");
    }
    setLoading(false);
    // quickFilters is a module-level constant — stable across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  useEffect(() => {
    if (skipInitialFetch.current && activeFilter === "All") {
      skipInitialFetch.current = false;
      return;
    }
    skipInitialFetch.current = false;
    fetchCars();
  }, [fetchCars, activeFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  const skeletonCards = Array(8).fill(null);
  const activeQuery = quickFilters.find((f) => f.label === activeFilter)?.query ?? {};
  const activeQs = new URLSearchParams(
    Object.entries(activeQuery).map(([k, v]) => [k, String(v)]),
  ).toString();
  const activeHref = activeQs ? `/cars?${activeQs}` : "/cars";

  return (
    <section className="pt-6 pb-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-3 mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-ink-strong tracking-tight">
            Cars for sale in Hyderabad
          </h2>
          <Link
            href={activeHref}
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-primary-700 hover:underline underline-offset-4"
          >
            View all<span className="hidden sm:inline">&nbsp;cars</span> <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* Quick filters */}
        <div role="tablist" aria-label="Filter cars" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 mb-4 scrollbar-hide sm:mx-0 sm:mb-6 sm:px-0">
          {quickFilters.map((filter) => {
            const isSelected = activeFilter === filter.label;
            return (
              <button
                key={filter.label}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveFilter(filter.label)}
                className={`min-h-10 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${
                  isSelected
                    ? "border-ink-strong bg-ink-strong text-surface"
                    : "border-border-strong bg-surface text-ink hover:border-primary-400"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Interactive listing grid with stagger reveals and skeleton system */}
        {loading ? (
          <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4">
            {skeletonCards.map((_, i) => (
              <div key={i} className="w-[80%] shrink-0 snap-start sm:w-auto bg-surface rounded-2xl border border-border/50 overflow-hidden animate-pulse shadow-xs">
                <div className="aspect-[4/3] bg-surface-alt" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-surface-alt rounded w-3/4" />
                  <div className="h-3.5 bg-surface-alt rounded w-1/2" />
                  <div className="h-px bg-surface-alt my-2" />
                  <div className="h-6 bg-surface-alt rounded w-1/3 mt-2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-surface-alt rounded-lg flex-1" />
                    <div className="h-8 bg-surface-alt rounded-lg w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8 max-w-xl mx-auto flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-danger-50 flex items-center justify-center text-danger-500 mb-4 border border-danger-100">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-ink">Error loading cars</h3>
            <p className="text-xs text-ink-muted mt-1">
              {fetchError}
            </p>
            <button onClick={fetchCars} className="mt-4 px-4 py-2 bg-surface-alt hover:bg-border text-ink rounded-xl text-xs font-bold transition-all active:scale-[0.98]">
              Try Again
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8 max-w-xl mx-auto flex flex-col items-center">
            {/* Unified icon color text-primary-600 to align with standard brand design tokens */}
            <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4 border border-primary-100">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-ink">No cars match this filter</h3>
            <p className="text-xs text-ink-muted mt-1">
              Pick another filter above, or see every car on KarBik.
            </p>
            <Link href="/cars" className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]">
              See all cars
            </Link>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial={false}
            animate="show"
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4"
          >
            {cars.map((car) => (
              <motion.div key={car.id} variants={itemVariants} className="w-[80%] shrink-0 snap-start sm:w-auto">
                <CarCard car={car} />
              </motion.div>
            ))}
            {/* Phones: the rail ends in a way out instead of a dead stop */}
            <Link
              href={activeHref}
              className="flex w-[60%] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface p-6 text-center sm:hidden"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <ChevronRight className="h-6 w-6" aria-hidden />
              </span>
              <span className="text-base font-bold text-ink-strong">
                {activeFilter === "All" ? "See all cars" : `See all ${activeFilter} cars`}
              </span>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
