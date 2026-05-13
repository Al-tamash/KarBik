"use client";

/**
 * Cars Browse Page — Public listing with search, filters, sort, and pagination
 *
 * This is the main marketplace page where anyone can browse car listings.
 * Filters are stored in the URL query string so users can share filtered views.
 *
 * useSearchParams() must be wrapped in <Suspense> for Next.js production builds.
 * So we split into: CarsPage (wrapper with Suspense) → CarsPageContent (actual UI).
 */
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CarCard from "@/components/CarCard";

const API = process.env.NEXT_PUBLIC_API_URL;

// Outer wrapper — provides the Suspense boundary Next.js requires
export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <p className="text-sm font-medium text-muted">Loading listings...</p>
          </div>
        </div>
      }
    >
      <CarsPageContent />
    </Suspense>
  );
}

// Inner component — uses useSearchParams() safely inside Suspense
function CarsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filter values from URL (enables shareable filter URLs)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Data state
  const [cars, setCars] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch available brands for the dropdown filter
  useEffect(() => {
    fetch(`${API}/api/cars/brands`)
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch(() => {});
  }, []);

  // Build query string from current filter state and fetch cars
  const fetchCars = useCallback(async () => {
    setLoading(true);

    // Build URL query parameters — only add non-empty values
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (brand) params.set("brand", brand);
    if (sort && sort !== "newest") params.set("sort", sort);
    params.set("page", page);
    params.set("limit", 12);

    try {
      const res = await fetch(`${API}/api/cars?${params.toString()}`);
      const data = await res.json();
      setCars(data.cars || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    }

    setLoading(false);
  }, [search, brand, sort, page]);

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Update URL query string when filters change (for shareable URLs)
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (brand) params.set("brand", brand);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", page);

    const queryStr = params.toString();
    router.replace(`/cars${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
  }, [search, brand, sort, page, router]);

  // Reset to page 1 when filters change
  function handleFilterChange(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  // Handle search form submission
  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    fetchCars();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* ─── Page Header ─── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Browse Cars
          </h1>
          <p className="text-sm text-muted mt-1">
            {total} {total === 1 ? "listing" : "listings"} available
          </p>
        </div>

        {/* ─── Search + Filters Bar ─── */}
        <div className="mb-6 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title or brand..."
                className="w-full rounded-lg border border-border bg-white pl-9 pr-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>

            {/* Brand filter dropdown */}
            <select
              value={brand}
              onChange={(e) => handleFilterChange(setBrand)(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Sort dropdown */}
            <select
              value={sort}
              onChange={(e) => handleFilterChange(setSort)(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="year_desc">Year: Newest</option>
            </select>
          </form>

          {/* Active filters summary — only shows when filters are applied */}
          {(search || brand) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted">Active filters:</span>
              {search && (
                <button
                  onClick={() => { setSearch(""); setPage(1); }}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  &quot;{search}&quot; ✕
                </button>
              )}
              {brand && (
                <button
                  onClick={() => { setBrand(""); setPage(1); }}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  {brand} ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Car Grid ─── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium text-muted">Loading listings...</p>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-3">🚗</span>
            <h3 className="text-lg font-bold text-foreground mb-1">No cars found</h3>
            <p className="text-sm text-muted max-w-sm">
              {search || brand
                ? "Try adjusting your search or filters."
                : "No listings yet. Check back soon!"}
            </p>
            {(search || brand) && (
              <button
                onClick={() => { setSearch(""); setBrand(""); setSort("newest"); setPage(1); }}
                className="mt-4 text-sm font-semibold text-primary hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-sm text-muted px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
