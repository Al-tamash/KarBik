"use client";

/**
 * Homepage — CarDekho/Spinny-grade landing page
 *
 * WHAT: The main landing page that buyers see first.
 * WHY: First impressions matter. This page must immediately build trust
 *      and help buyers find cars fast — just like CarDekho's homepage.
 *
 * Sections:
 * 1. Hero — big heading + search bar with dropdowns
 * 2. Quick filter pills (SUV, Sedan, Under ₹5L, etc.)
 * 3. Browse by brand (logo grid)
 * 4. Car listing grid (fetched from API)
 * 5. Trust stats bar (verified cars, dealers, etc.)
 * 6. Footer
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ChevronRight, Shield, Star, Users, Eye, Car } from "lucide-react";
import CarCard from "@/components/CarCard";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const router = useRouter();

  // Hero search state
  const [searchBrand, setSearchBrand] = useState("");
  const [searchBudget, setSearchBudget] = useState("");

  // Quick filter pills state
  const [activeFilter, setActiveFilter] = useState("All");

  // Car listings state (fetched from API)
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);

  // Quick filter options
  const quickFilters = [
    { label: "All", query: {} },
    { label: "Under ₹3L", query: { maxPrice: 300000 } },
    { label: "Under ₹5L", query: { maxPrice: 500000 } },
    { label: "Under ₹10L", query: { maxPrice: 1000000 } },
    { label: "SUV", query: { bodyType: "suv" } },
    { label: "Sedan", query: { bodyType: "sedan" } },
    { label: "Hatchback", query: { bodyType: "hatchback" } },
  ];

  // Brand grid — popular makes
  const popularBrands = [
    { name: "Maruti", emoji: "🚗" },
    { name: "Hyundai", emoji: "🚘" },
    { name: "Tata", emoji: "🚙" },
    { name: "Honda", emoji: "🏎️" },
    { name: "Toyota", emoji: "🚐" },
    { name: "Ford", emoji: "🚕" },
  ];

  // Fetch brands list for hero dropdown
  useEffect(() => {
    fetch(`${API}/api/cars/brands`)
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(() => {});
  }, []);

  // Fetch cars based on active quick filter
  const fetchCars = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    // Apply active quick filter
    const filter = quickFilters.find(f => f.label === activeFilter);
    if (filter && filter.query) {
      Object.entries(filter.query).forEach(([key, value]) => {
        params.set(key, value);
      });
    }

    params.set("limit", 8);

    try {
      const res = await fetch(`${API}/api/cars?${params.toString()}`);
      const data = await res.json();
      setCars(data.cars || []);
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCars();
  }, [fetchCars]);

  // Handle hero search
  const handleHeroSearch = () => {
    const params = new URLSearchParams();
    if (searchBrand) params.set("brand", searchBrand);
    if (searchBudget) params.set("maxPrice", searchBudget);
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="bg-neutral-50 min-h-screen">

      {/* ═══════════════════════════════════════════════
          SECTION 1 — Hero
          Large heading + search bar with dropdowns
          Matches CarDekho's hero with gradient background
      ═══════════════════════════════════════════════ */}
      <section className="relative bg-linear-to-br from-[#1e3a8a] via-[#1e40af] to-[#1d4ed8] overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight"
            >
              Find Your Perfect Car
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto"
            >
              Lakhon verified cars from trusted dealers across India
            </motion.p>

            {/* ─── Search Bar ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 mx-auto max-w-3xl bg-white rounded-2xl shadow-xl p-2"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Brand dropdown */}
                <select
                  value={searchBrand}
                  onChange={(e) => setSearchBrand(e.target.value)}
                  className="flex-1 border-b sm:border-b-0 sm:border-r border-gray-200 px-4 py-3 text-sm text-gray-700 bg-transparent outline-none cursor-pointer appearance-none"
                >
                  <option value="">All Brands</option>
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                {/* Budget dropdown */}
                <select
                  value={searchBudget}
                  onChange={(e) => setSearchBudget(e.target.value)}
                  className="flex-1 border-b sm:border-b-0 sm:border-r border-gray-200 px-4 py-3 text-sm text-gray-700 bg-transparent outline-none cursor-pointer appearance-none"
                >
                  <option value="">Any Budget</option>
                  <option value="300000">Under ₹3 Lakh</option>
                  <option value="500000">Under ₹5 Lakh</option>
                  <option value="1000000">Under ₹10 Lakh</option>
                  <option value="2000000">Under ₹20 Lakh</option>
                  <option value="5000000">Under ₹50 Lakh</option>
                </select>

                {/* Search button */}
                <button
                  onClick={handleHeroSearch}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2 — Quick Filter Pills
          Horizontal scrollable pills that filter the car grid
      ═══════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setActiveFilter(filter.label)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  activeFilter === filter.label
                    ? "bg-primary-600 text-white border-primary-600"
                    : "border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-primary-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3 — Browse by Brand (Logo Grid)
          6 popular brands in a row, clickable
      ═══════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-semibold text-xl text-gray-800 mb-6">Browse by Brand</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {popularBrands.map((brand) => (
              <Link
                key={brand.name}
                href={`/cars?brand=${brand.name}`}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-100 py-5 px-4 bg-white hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{brand.emoji}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4 — Car Listing Grid
          The MOST IMPORTANT section. Shows car cards.
      ═══════════════════════════════════════════════ */}
      <section className="py-12 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeFilter === "All" ? "Latest Cars" : activeFilter}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Certified cars from trusted dealers
              </p>
            </div>
            <Link
              href="/cars"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:gap-2 transition-all"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🔍</span>
              <p className="text-lg font-semibold text-gray-900">No cars found for this filter</p>
              <p className="text-sm text-gray-500 mt-1">Try a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}

          {/* View all link for mobile */}
          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/cars"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600"
            >
              View All Cars <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 5 — Trust Stats Bar
          Numbers that build confidence (like CarDekho)
      ═══════════════════════════════════════════════ */}
      <section className="bg-[#1e3a8a] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-1">50,000+</div>
              <div className="text-blue-200 text-sm">Verified Cars</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">2,000+</div>
              <div className="text-blue-200 text-sm">Trusted Dealers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">200-Point</div>
              <div className="text-blue-200 text-sm">Inspection</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">Easy EMI</div>
              <div className="text-blue-200 text-sm">Starting ₹4,999/mo</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
