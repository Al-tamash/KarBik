"use client";

/**
 * CarsCatalogClient — Interactive catalog container
 *
 * WHAT: Coordinates faceted search, quick-pills, sorting, URL state, and mobile drawers.
 * WHY: Category standard search page (Cars24/Spinny level) with immediate visual feedback,
 *      solid white cards, accessible contrast, and zero artificial delays.
 */

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Car as CarIcon,
  Sparkles,
} from "lucide-react";
import type { ApiCar } from "@/lib/api-types";
import { SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "@/lib/lead-routing";
import CarCard from "@/components/CarCard";
import { CarCardSkeleton } from "@/components/Skeleton";
import CarsQuickFilters, { QuickPill } from "./CarsQuickFilters";
import CarsFilterSidebar, { FilterState } from "./CarsFilterSidebar";
import CarsMobileDrawer from "./CarsMobileDrawer";

interface CarsCatalogClientProps {
  initialCars: ApiCar[];
  initialTotal: number;
  initialTotalPages: number;
  initialBrands: string[];
  initialFilters: FilterState;
}

export default function CarsCatalogClient({
  initialCars,
  initialTotal,
  initialTotalPages,
  initialBrands,
  initialFilters,
}: CarsCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [cars, setCars] = useState<ApiCar[]>(initialCars);
  const [total, setTotal] = useState<number>(initialTotal);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Sync state to URL without reloading the page
  const updateUrl = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, val]) => {
        if (val && String(val).trim() !== "" && val !== "newest") {
          params.set(key, String(val));
        }
      });
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `/cars?${qs}` : "/cars", { scroll: false });
      });
    },
    [router]
  );

  // Fetch cars when filter state updates
  const fetchFilteredCars = useCallback(async (activeFilters: FilterState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v && String(v).trim() !== "") {
          params.set(k, String(v));
        }
      });
      params.set("limit", "12");

      const res = await fetch(`/api/cars?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCars(data.cars ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(Math.ceil((data.total ?? 0) / 12) || 1);
      }
    } catch {
      // Keep previous cars on network error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const updated: FilterState = {
      ...filters,
      [key]: value,
      page: key === "page" ? Number(value) : 1,
    };
    setFilters(updated);
    updateUrl(updated);
    fetchFilteredCars(updated);
  };

  const handleResetFilters = () => {
    const resetState: FilterState = {
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
      page: 1,
    };
    setFilters(resetState);
    updateUrl(resetState);
    fetchFilteredCars(resetState);
  };

  // Toggle quick pill filter from top horizontal strip
  const handleToggleQuickPill = (pill: QuickPill) => {
    if (pill.key === "priceRange") {
      const isActive = filters.minPrice === "1000000" && filters.maxPrice === "1500000";
      const updated = {
        ...filters,
        minPrice: isActive ? "" : "1000000",
        maxPrice: isActive ? "" : "1500000",
        page: 1,
      };
      setFilters(updated);
      updateUrl(updated);
      fetchFilteredCars(updated);
      return;
    }

    const currentVal = filters[pill.key as keyof FilterState];
    const isAlreadyActive = String(currentVal).toLowerCase() === pill.value.toLowerCase();
    handleFilterChange(pill.key as keyof FilterState, isAlreadyActive ? "" : pill.value);
  };

  // Active filter tags calculation
  const activeTags: Array<{ key: keyof FilterState; label: string }> = [];
  if (filters.brand) activeTags.push({ key: "brand", label: filters.brand });
  if (filters.bodyType) activeTags.push({ key: "bodyType", label: filters.bodyType.toUpperCase() });
  if (filters.transmission) activeTags.push({ key: "transmission", label: filters.transmission });
  if (filters.fuelType) activeTags.push({ key: "fuelType", label: filters.fuelType });
  if (filters.minPrice && filters.maxPrice) {
    activeTags.push({
      key: "minPrice",
      label: `₹${Number(filters.minPrice) / 100000}L–₹${Number(filters.maxPrice) / 100000}L`,
    });
  } else if (filters.minPrice) {
    activeTags.push({ key: "minPrice", label: `Above ₹${Number(filters.minPrice) / 100000}L` });
  } else if (filters.maxPrice) {
    activeTags.push({ key: "maxPrice", label: `Under ₹${Number(filters.maxPrice) / 100000}L` });
  }
  if (filters.search) activeTags.push({ key: "search", label: `"${filters.search}"` });

  const activeFilterCount = activeTags.length;

  // WhatsApp concierge pre-filled text
  const waHelpText = encodeURIComponent(
    `Hi KarBik, I am looking for a used car in Hyderabad (${activeTags.map((t) => t.label).join(", ") || "specific model"}). Can you help me find matching stock?`
  );
  const waHelpUrl = `https://wa.me/91${SUPPORT_PHONE}?text=${waHelpText}`;

  return (
    <div className="min-h-screen bg-bg">
      {/* ─── Breadcrumb Path & Page Title Area ─── */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-ink-muted">
            <Link href="/" className="hover:text-primary-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-ink-strong font-medium">Used Cars in Hyderabad</span>
          </nav>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-strong">
              Used Cars in Hyderabad
            </h1>
            <span className="text-sm font-medium text-ink-muted tabular-nums">
              {total} {total === 1 ? "car" : "cars"} available
            </span>
          </div>
        </div>

        {/* ─── Quick Category Pills Strip ─── */}
        <div className="mx-auto max-w-7xl sm:px-6">
          <CarsQuickFilters
            activeFilters={{
              brand: filters.brand,
              bodyType: filters.bodyType,
              transmission: filters.transmission,
              fuelType: filters.fuelType,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
            }}
            onTogglePill={handleToggleQuickPill}
          />
        </div>
      </div>

      {/* ─── Main Catalog Layout ─── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Desktop Sticky Left Sidebar (280px) ─── */}
          <aside className="hidden w-[280px] shrink-0 lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-100px)] flex flex-col rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
              <CarsFilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                brands={initialBrands}
                totalMatches={total}
              />
            </div>
          </aside>

          {/* ─── Search, Sort & Listings Column ─── */}
          <main className="flex-1 min-w-0">
            {/* Top Toolbar: Search Input & Sort Dropdown */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search by model, brand, or keyword..."
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => handleFilterChange("search", "")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-strong"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Sort Control */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-dropdown" className="whitespace-nowrap text-xs font-semibold text-ink-muted">
                  Sort:
                </label>
                <select
                  id="sort-dropdown"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink focus:border-primary-500 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Recently Listed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="year_desc">Model: Newest First</option>
                </select>

                {/* Mobile Filter Trigger Button */}
                <button
                  type="button"
                  onClick={() => setShowMobileDrawer(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-ink lg:hidden hover:bg-surface-alt"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-primary-600" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary-600 px-1 text-xs font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ─── Active Filter Pills ─── */}
            {activeTags.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-ink-muted mr-1">Active:</span>
                {activeTags.map((tag) => (
                  <span
                    key={`${tag.key}-${tag.label}`}
                    className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                  >
                    {tag.label}
                    <button
                      type="button"
                      onClick={() => {
                        if (tag.key === "minPrice" || tag.key === "maxPrice") {
                          handleFilterChange("minPrice", "");
                          handleFilterChange("maxPrice", "");
                        } else {
                          handleFilterChange(tag.key, "");
                        }
                      }}
                      className="rounded-full p-0.5 hover:bg-primary-100"
                      aria-label={`Remove filter ${tag.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="ml-2 text-xs font-semibold text-danger-600 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* ─── Cars Grid / Loading / Empty States ─── */}
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt text-ink-muted mb-4">
                  <CarIcon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold text-ink-strong">
                  No matching cars found
                </h3>
                <p className="mt-1.5 max-w-sm text-sm text-ink-muted leading-relaxed">
                  We couldn&apos;t find any verified cars matching your current filters. Try relaxing or resetting your filters.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn btn-outline rounded-xl px-5 py-2.5 text-xs font-semibold"
                  >
                    Reset all filters
                  </button>
                  <a
                    href={waHelpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp rounded-xl px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="h-4 w-4" /> Ask KarBik on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {cars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>

                {/* ─── Pagination Controls ─── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      type="button"
                      disabled={filters.page <= 1}
                      onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
                      className="btn btn-outline rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </button>
                    <span className="px-3 text-xs font-semibold text-ink-muted tabular-nums">
                      Page {filters.page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={filters.page >= totalPages}
                      onClick={() => handleFilterChange("page", filters.page + 1)}
                      className="btn btn-outline rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-40"
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ─── Mobile Slide-over Drawer ─── */}
      <CarsMobileDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        brands={initialBrands}
        totalMatches={total}
      />
    </div>
  );
}
