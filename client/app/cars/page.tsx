"use client";

/**
 * Browse Cars Page — Spinny-grade vehicle search engine
 *
 * WHAT: The main browse/search page where buyers explore the entire inventory.
 * WHY: High-traffic page. We overhaul it to break visual scroll fatigue.
 *      - Implements an editorial breadcrumb nav and bold Archivo headings.
 *      - Redesigns search panels to feel premium with frosted material.
 *      - Incorporates "Bento Grid Breaks" to inject Assured warranties and Callbacks.
 *
 * Key details:
 * - Suspense boundaries handled properly for useSearchParams.
 * - Dynamic inline banners inserted inside the search results map flow.
 */
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Car as CarIcon, X, ChevronLeft, ChevronRight,
  ShieldCheck, FileText, Star, MessageSquare
} from "lucide-react";
import CarCard from "@/components/CarCard";
import { CarCardSkeleton } from "@/components/Skeleton";
import FilterSidebar from "@/components/FilterSidebar";
import RecentlyViewedCars from "@/components/RecentlyViewedCars";
import type { ApiCar } from "@/lib/api-types";
import { displayCarName } from "@/lib/car-name";



const EMPTY_FILTERS = {
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
};

const FILTER_LABELS = {
  bodyType: {
    hatchback: "Hatchback",
    sedan: "Sedan",
    suv: "SUV",
    muv: "MUV",
    coupe: "Coupe",
    convertible: "Convertible",
    pickup: "Pickup",
    van: "Van",
    luxury: "Luxury"
  },
  fuelType: {
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "EV",
    cng: "CNG",
    hybrid: "Hybrid",
    lpg: "LPG"
  },
  transmission: {
    manual: "Manual",
    automatic: "Automatic",
    cvt: "CVT",
    amt: "AMT"
  },
  owners: {
    "1st owner": "1st owner",
    "2nd owner": "2nd owner",
    "3rd owner": "3rd+ owner",
    "4th owner or more": "3rd+ owner"
  }
};

type Filters = typeof EMPTY_FILTERS;

function getInitialFilters(searchParams: URLSearchParams): Filters {
  const legacyOwnerCount = searchParams.get("ownerCount");
  const legacyMaxKm = searchParams.get("maxKm");

  return {
    ...EMPTY_FILTERS,
    search: searchParams.get("search") || "",
    brand: searchParams.get("brand") || "",
    fuelType: searchParams.get("fuelType") || "",
    transmission: searchParams.get("transmission") || "",
    bodyType: searchParams.get("bodyType") || "",
    owners: searchParams.get("owners") || (legacyOwnerCount ? `${legacyOwnerCount}${legacyOwnerCount === "1" ? "st" : legacyOwnerCount === "2" ? "nd" : "rd"} owner` : ""),
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    maxMileage: searchParams.get("maxMileage") || legacyMaxKm || "",
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page")) || 1
  };
}

/**
 * CallbackForm was removed: it collected phone numbers and faked a
 * "we'll call you back" success state without any API behind it.
 * A dishonest widget is worse than no widget — if lead-gen callbacks
 * return, wire them to a real endpoint first.
 */

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="h-10 w-48 bg-surface-alt animate-pulse rounded-lg mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <CarCardSkeleton key={i} />)}
          </div>
        </div>
      }
    >
      <CarsPageContent />
    </Suspense>
  );
}

function CarsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));

  const [cars, setCars] = useState<ApiCar[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetch(`/api/cars/brands`)
      .then((res) => res.json())
      .then((data: unknown) => setBrands(Array.isArray(data) ? (data as string[]) : []))
      .catch(() => {});
  }, []);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/cars?${params.toString()}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || "Unable to load cars");
      }
      const data = (await res.json()) as { cars?: ApiCar[]; pages?: number; total?: number };
      setCars(data.cars || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setCars([]);
      setTotalPages(1);
      setTotal(0);
      setLoadError((err as Error).message || "Unable to load cars");
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
     
    fetchCars();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && (key !== "page" || Number(value) > 1)) params.set(key, String(value));
    });
    router.replace(`/cars${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [fetchCars, filters, router]);

  const activeFilterCount = [
    filters.brand, filters.fuelType, filters.transmission, filters.bodyType,
    filters.owners, filters.minPrice, filters.maxPrice, filters.maxMileage
  ].filter(Boolean).length;

  const activeFilterKeys = Object.entries(filters).filter(([key, value]) => {
    if (!value || key === "page") return false;
    if (key === "sort" || key === "page") return false;
    return true;
  });

  const handleRemoveFilter = (key: keyof Filters) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === "page" ? 1 : "",
      page: 1
    }));
  };

  const handleClearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
  };

  /**
   * renderGridItems — Injects Trust Pillars, Callback Widgets, and delivery promos
   * to create an asymmetrical bento-grid experience that breaks scroll fatigue.
   */
  const renderGridItems = () => {
    const items: React.ReactNode[] = [];
    cars.forEach((car, index) => {
      if (index === 3) {
        items.push(
          <motion.div
            key="trust-strip-injection"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full"
          >
            {/* WHAT: Platform promises — every claim maps to a real feature. */}
            {/* WHY: Trust strips with unverifiable claims ("200-point", "refund policy") erode trust. These four are backed by actual platform behaviour. */}
            <div className="my-2 rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm select-none">
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {[
                  { icon: ShieldCheck, title: "RTO & RC verified", text: "Registration papers checked before a listing goes live" },
                  { icon: FileText, title: "Inspection reports", text: "Downloadable condition reports on inspected cars" },
                  { icon: Star, title: "Rated local dealers", text: "Read real buyer reviews before you inquire" },
                  { icon: MessageSquare, title: "Direct dealer contact", text: "Your inquiry reaches the dealer instantly — no middlemen" }
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-ink">{title}</span>
                      <span className="mt-1 block text-xs font-medium leading-normal text-ink-muted">{text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      }



      items.push(
        <motion.div
          key={car.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <CarCard car={car} />
        </motion.div>
      );
    });

    return items;
  };

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": cars.length,
    "itemListElement": cars.map((car, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/cars/${car.id}`,
      "name": displayCarName(car),
      "image": car.images?.[0]?.url || "",
      "description": car.description || "",
      "offers": {
        "@type": "Offer",
        "price": car.price,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    }))
  };

  return (
    <div className="min-h-screen bg-surface-alt/50">
      {/* Dynamic ItemList Structured Schema for Catalog Search Listings */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      {/* ─── Mobile Filter Drawer Overlay ─── */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="h-full w-80 bg-surface shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters} 
                onClose={() => setShowMobileFilters(false)}
                brands={brands}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ─── Sidebar (Desktop Only) ─── */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            {/* 
              CONCEPT: Viewport-Constrained Scroll Containers & Scroll Chaining Prevention
              WHAT: We set the sticky parent sidebar container to a maximum height of calc(100vh - 120px) 
                    and style it with flex-col + overscroll-contain.
              WHY: Constraining the height allows the child FilterSidebar component's overflow-y-auto 
                   to trigger correctly when filters overflow. The overscroll-contain utility stops the 
                   scroll events from bubbling/chaining to the outer window, ensuring only the sidebar 
                   scrolls while the car listing column remains perfectly stable.
            */}
            <div className="sticky top-24 max-h-[calc(100vh-120px)] flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden overscroll-contain">
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters} 
                brands={brands}
              />
            </div>
          </aside>

          {/* ─── Main Content Area ─── */}
          <main className="flex-1 min-w-0">

            {/* Editorial Breadcrumbs & Page Header */}
            <div className="mb-6">
              {/* Breadcrumb Path */}
              <nav className="flex items-center gap-1.5 text-xs font-black text-ink-subtle mb-2 uppercase tracking-widest select-none">
                <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-ink-muted">Used Cars</span>
                <span>/</span>
                <span className="text-ink-strong font-extrabold">Hyderabad</span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink-strong tracking-tight leading-none">
                    Verified Used Cars
                  </h1>
                  {/* Change text-ink-subtle to text-ink-muted for accessible visual contrast */}
                  <p className="text-xs text-ink-muted font-bold uppercase tracking-wider mt-1.5">
                    {total} {total === 1 ? "car" : "cars"} available
                  </p>
                </div>

                {/* Mobile Filter Button */}
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center justify-center gap-2 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm font-semibold text-ink-strong shadow-xs hover:border-primary-600 hover:text-primary-600 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ─── Search & Sort Bar (Glassmatic Panel) ─── */}
            <div className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-md">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                    placeholder="Search by brand, model, or keyword..."
                    className="w-full rounded-xl border border-border bg-surface-alt/50 pl-11 pr-4 py-3.5 text-sm text-ink-strong placeholder:text-ink-subtle focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-medium"
                  />
                </div>
                {/* Sort Dropdown */}
                <div className="relative sm:w-48 select">
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({...filters, sort: e.target.value, page: 1})}
                    className="w-full rounded-xl border border-border bg-surface-alt/50 px-4 py-3.5 text-sm font-bold text-ink focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 cursor-pointer appearance-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="year_desc">Year: Newest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ─── Active Filters Tag Bar ─── */}
            {activeFilterKeys.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in select-none">
                <span className="text-xs font-bold text-ink-subtle uppercase tracking-wider mr-1">Active Filters:</span>
                {activeFilterKeys.map(([key, value]) => {
                  const filterKey = key as keyof Filters;
                  let displayLabel: string = String(value);
                  if (key === "minPrice") displayLabel = `Min: ₹${(Number(value) / 100000).toFixed(1)} Lakh`;
                  if (key === "maxPrice") displayLabel = `Max: ₹${(Number(value) / 100000).toFixed(1)} Lakh`;
                  if (key === "maxMileage") displayLabel = `Under ${Number(value).toLocaleString('en-IN')} km`;
                  if (key === "brand") displayLabel = `${value}`;
                  if (key === "bodyType") displayLabel = FILTER_LABELS.bodyType[value as keyof typeof FILTER_LABELS.bodyType] || String(value);
                  if (key === "owners") displayLabel = FILTER_LABELS.owners[value as keyof typeof FILTER_LABELS.owners] || String(value);
                  if (key === "transmission") displayLabel = FILTER_LABELS.transmission[value as keyof typeof FILTER_LABELS.transmission] || String(value);
                  if (key === "fuelType") displayLabel = FILTER_LABELS.fuelType[value as keyof typeof FILTER_LABELS.fuelType] || String(value);
                  if (key === "search") displayLabel = `"${value}"`;

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-100 px-3.5 py-1.5 text-xs font-bold text-primary-700 shadow-xs transition-all hover:bg-primary-100"
                    >
                      {displayLabel}
                      <button
                        onClick={() => handleRemoveFilter(filterKey)}
                        className="p-0.5 rounded-full hover:bg-primary-200 text-primary-500 hover:text-primary-800 transition-colors cursor-pointer"
                        title={`Remove ${key}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs font-black text-danger-600 hover:text-danger-700 hover:underline px-2.5 py-1.5 transition-all cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* ─── Results Grid ─── */}
            <AnimatePresence mode="wait">
              {loading ? (
                /* Loading skeleton grid */
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {[...Array(6)].map((_, i) => <CarCardSkeleton key={i} />)}
                </motion.div>
              ) : loadError ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center border border-danger-100 rounded-2xl bg-surface shadow-sm"
                >
                  <div className="h-20 w-20 rounded-full bg-danger-50 flex items-center justify-center mb-6 border border-danger-100">
                    <CarIcon className="h-9 w-9 text-danger-400" />
                  </div>
                  <h3 className="text-xl font-black text-ink-strong mb-2 tracking-tight">Unable to load cars</h3>
                  <p className="text-sm text-ink-muted max-w-sm mb-6 leading-relaxed">
                    {loadError}. Please check that the API server is running and try again.
                  </p>
                  <button
                    onClick={fetchCars}
                    className="btn btn-primary px-6 py-3 rounded-xl shadow-xs"
                  >
                    Try Again
                  </button>
                </motion.div>
              ) : cars.length === 0 ? (
                /* Empty state — no cars match the current filters */
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center border border-border rounded-2xl bg-surface shadow-sm"
                >
                  <div className="h-20 w-20 rounded-full bg-surface-alt flex items-center justify-center mb-6 border border-border">
                    <CarIcon className="h-9 w-9 text-ink-subtle animate-shimmer" />
                  </div>
                  <h3 className="text-xl font-black text-ink-strong mb-2 tracking-tight">No cars found</h3>
                  <p className="text-sm text-ink-muted max-w-sm mb-6 leading-relaxed">
                    We couldn&apos;t find any cars matching your filters. Try adjusting or clearing them.
                  </p>
                  <button
                    onClick={() => setFilters(EMPTY_FILTERS)}
                    className="btn btn-primary px-6 py-3 rounded-xl shadow-xs"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              ) : (
                /* Car grid + pagination */
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {renderGridItems()}
                  </div>

                  {/* ─── Pagination ─── */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6 select-none">
                      {/* Previous button */}
                      <button
                        onClick={() => setFilters({...filters, page: Math.max(1, filters.page - 1)})}
                        disabled={filters.page === 1}
                        className="flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-ink-muted bg-surface hover:bg-surface-alt hover:border-primary-600 hover:text-primary-600 disabled:opacity-30 disabled:hover:bg-surface disabled:hover:border-border disabled:hover:text-ink-muted transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (filters.page <= 3) {
                            pageNum = i + 1;
                          } else if (filters.page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = filters.page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setFilters({...filters, page: pageNum})}
                              className={`h-10 w-10 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                filters.page === pageNum
                                  ? "bg-primary-600 text-white shadow-md shadow-primary-100"
                                  : "text-ink-muted bg-surface hover:bg-surface-alt border border-border"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next button */}
                      <button
                        onClick={() => setFilters({...filters, page: Math.min(totalPages, filters.page + 1)})}
                        disabled={filters.page === totalPages}
                        className="flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-ink-muted bg-surface hover:bg-surface-alt hover:border-primary-600 hover:text-primary-600 disabled:opacity-30 disabled:hover:bg-surface disabled:hover:border-border disabled:hover:text-ink-muted transition-colors cursor-pointer"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
        <RecentlyViewedCars />
      </div>
    </div>
  );
}
