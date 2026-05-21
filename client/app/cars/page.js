"use client";

/**
 * Browse Cars Page — Spinny-grade vehicle search engine
 *
 * WHAT: The main browse/search page where buyers explore the entire inventory.
 * WHY: High-traffic page. We overhaul it to break visual scroll fatigue.
 *      - Implements an editorial breadcrumb nav and bold Plus Jakarta Sans headings.
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
  ShieldCheck, RotateCcw, BadgeCheck, Heart, Sparkles, Clock, Truck, Percent
} from "lucide-react";
import CarCard from "@/components/CarCard";
import { CarCardSkeleton } from "@/components/Skeleton";
import FilterSidebar from "@/components/FilterSidebar";

const API = process.env.NEXT_PUBLIC_API_URL;

const API_BASE = API || "http://localhost:5000";

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

function getInitialFilters(searchParams) {
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
 * CallbackForm — Integrated lead-gen widget inside the grid
 * 
 * Concept introduction: State Management (useState)
 * A plain-English explanation: We use useState to hold the buyer's phone number 
 * and track whether they have submitted the form. When they submit, we show
 * an immediate confirmation, keeping the interface feeling reactive and alive.
 */
function CallbackForm() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl p-4 text-center border border-success-100 shadow-sm animate-scale-in">
        <div className="h-10 w-10 bg-success-50 text-success-600 border border-success-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
          ✓
        </div>
        <p className="text-xs font-black text-neutral-900">Request Received!</p>
        <p className="text-[10px] text-neutral-400 mt-0.5">We will call you back in 15 minutes.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <input
        type="tel"
        placeholder="Enter 10-digit Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all font-semibold placeholder:text-neutral-400 text-neutral-800"
        required
      />
      <button
        type="submit"
        className="w-full btn bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider active:scale-98 shadow-xs hover:shadow-md transition-all select-none cursor-pointer"
      >
        Request Call Back
      </button>
    </form>
  );
}

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg mb-8" />
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

  const [cars, setCars] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/cars/brands`)
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch(() => {});
  }, []);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("limit", 12);

    try {
      const res = await fetch(`${API_BASE}/api/cars?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to load cars");
      }
      const data = await res.json();
      setCars(data.cars || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setCars([]);
      setTotalPages(1);
      setTotal(0);
      setLoadError(err.message || "Unable to load cars");
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCars();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && (key !== "page" || value > 1)) params.set(key, value);
    });
    router.replace(`/cars${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [fetchCars, filters, router]);

  const activeFilterCount = [
    filters.brand, filters.fuelType, filters.transmission, filters.bodyType,
    filters.owners, filters.minPrice, filters.maxPrice, filters.maxMileage
  ].filter(Boolean).length;

  const activeFilterKeys = Object.entries(filters).filter(([key, value]) => {
    if (!value) return false;
    if (key === "sort" || key === "page") return false;
    return true;
  });

  const handleRemoveFilter = (key) => {
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
    const items = [];
    cars.forEach((car, index) => {
      if (index === 3) {
        items.push(
          <motion.div
            key="trust-strip-injection"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full"
          >
            {/* WHAT: Flat and clean trust pillars strip wrapper. */}
            {/* WHY: Removes inner nested gray cards (bg-neutral-50 rounded-xl) to prevent card-nesting warnings, opting for a clean borderless visual layout. */}
            <div className="my-2 rounded-2xl border border-neutral-200 bg-white px-5 py-6 shadow-sm select-none">
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {[
                  { icon: ShieldCheck, title: "200-point inspected", text: "Engine, body, and papers checked" },
                  { icon: RotateCcw, title: "Refund policy", text: "Simple return support" },
                  { icon: Heart, title: "Warranty", text: "Coverage on eligible cars" },
                  { icon: BadgeCheck, title: "Fixed pricing", text: "Clear, no-surprise quotes" }
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-neutral-800">{title}</span>
                      <span className="mt-1 block text-[11px] font-medium leading-normal text-neutral-500">{text}</span>
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
          key={car._id}
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

  return (
    <div className="min-h-screen bg-neutral-50/50">

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
              className="h-full w-80 bg-white shadow-2xl"
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
            <div className="sticky top-24 max-h-[calc(100vh-120px)] flex flex-col rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden overscroll-contain">
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
              <nav className="flex items-center gap-1.5 text-[10px] font-black text-neutral-400 mb-2 uppercase tracking-widest select-none">
                <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-neutral-500">Used Cars</span>
                <span>/</span>
                <span className="text-neutral-900 font-extrabold">Hyderabad</span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-none font-display">
                    Verified Used Cars
                  </h1>
                  {/* Change text-neutral-400 to text-neutral-500 for accessible visual contrast */}
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1.5">
                    {total} {total === 1 ? "car" : "cars"} available
                  </p>
                </div>

                {/* Mobile Filter Button */}
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center justify-center gap-2 rounded-xl bg-white border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-xs hover:border-primary-600 hover:text-primary-600 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ─── Search & Sort Bar (Glassmatic Panel) ─── */}
            <div className="mb-8 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-md">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                    placeholder="Search by brand, model, or keyword..."
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-11 pr-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-medium"
                  />
                </div>
                {/* Sort Dropdown */}
                <div className="relative sm:w-48 select">
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({...filters, sort: e.target.value, page: 1})}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3.5 text-sm font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 cursor-pointer appearance-none"
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
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1">Active Filters:</span>
                {activeFilterKeys.map(([key, value]) => {
                  let displayLabel = value;
                  if (key === "minPrice") displayLabel = `Min: ₹${(Number(value) / 100000).toFixed(1)} Lakh`;
                  if (key === "maxPrice") displayLabel = `Max: ₹${(Number(value) / 100000).toFixed(1)} Lakh`;
                  if (key === "maxMileage") displayLabel = `Under ${Number(value).toLocaleString('en-IN')} km`;
                  if (key === "brand") displayLabel = `${value}`;
                  if (key === "bodyType") displayLabel = FILTER_LABELS.bodyType[value] || value;
                  if (key === "owners") displayLabel = FILTER_LABELS.owners[value] || value;
                  if (key === "transmission") displayLabel = FILTER_LABELS.transmission[value] || value;
                  if (key === "fuelType") displayLabel = FILTER_LABELS.fuelType[value] || value;
                  if (key === "search") displayLabel = `"${value}"`;

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-100 px-3.5 py-1.5 text-xs font-bold text-primary-700 shadow-xs transition-all hover:bg-primary-100"
                    >
                      {displayLabel}
                      <button
                        onClick={() => handleRemoveFilter(key)}
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
                  className="flex flex-col items-center justify-center py-24 text-center border border-danger-100 rounded-3xl bg-white shadow-sm"
                >
                  <div className="h-20 w-20 rounded-full bg-danger-50 flex items-center justify-center mb-6 border border-danger-100">
                    <CarIcon className="h-9 w-9 text-danger-400" />
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 mb-2 tracking-tight">Unable to load cars</h3>
                  <p className="text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">
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
                  className="flex flex-col items-center justify-center py-24 text-center border border-neutral-200/60 rounded-3xl bg-white shadow-sm"
                >
                  <div className="h-20 w-20 rounded-full bg-neutral-50 flex items-center justify-center mb-6 border border-neutral-100">
                    <CarIcon className="h-9 w-9 text-neutral-300 animate-shimmer" />
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 mb-2 tracking-tight">No cars found</h3>
                  <p className="text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">
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
                        className="flex items-center gap-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-bold text-neutral-500 bg-white hover:bg-neutral-50 hover:border-primary-600 hover:text-primary-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-neutral-200 disabled:hover:text-neutral-500 transition-colors cursor-pointer"
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
                                  : "text-neutral-500 bg-white hover:bg-neutral-100 border border-neutral-100"
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
                        className="flex items-center gap-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-bold text-neutral-500 bg-white hover:bg-neutral-50 hover:border-primary-600 hover:text-primary-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-neutral-200 disabled:hover:text-neutral-500 transition-colors cursor-pointer"
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
      </div>
    </div>
  );
}
