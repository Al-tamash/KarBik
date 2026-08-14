"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import CarCard from "@/components/CarCard";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function FeaturedCars() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const quickFilters = [
    { label: "All", query: {} },
    { label: "Under ₹3L", query: { maxPrice: 300000 } },
    { label: "Under ₹5L", query: { maxPrice: 500000 } },
    { label: "Under ₹10L", query: { maxPrice: 1000000 } },
    { label: "SUV", query: { bodyType: "suv" } },
    { label: "Sedan", query: { bodyType: "sedan" } },
    { label: "Hatchback", query: { bodyType: "hatchback" } },
  ];

  const fetchCars = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    const filter = quickFilters.find(f => f.label === activeFilter);
    if (filter && filter.query) {
      Object.entries(filter.query).forEach(([key, value]) => {
        params.set(key, value);
      });
    }

    params.set("limit", 6);

    try {
      const res = await fetch(`${API}/api/cars?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Unable to load cars");
      }
      const data = await res.json();
      setCars(data.cars || []);
      setFetchError("");
    } catch (err) {
      setCars([]);
      setFetchError(err.message || "Unable to load cars");
    }
    setLoading(false);
  }, [activeFilter]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  const skeletonCards = Array(6).fill(null);

  return (
    <section className="py-20 bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
              {activeFilter === "All" ? "Featured Collection" : `${activeFilter} Vehicles`}
            </h2>
            <p className="text-sm text-neutral-500 mt-1 max-w-md">
              Freshly listed pre-owned vehicles. Handpicked, inspected, and ready in Hyderabad.
            </p>
          </div>
          
          <Link 
            href="/cars"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-primary-600 tracking-wider uppercase hover:gap-2 transition-all"
          >
            View All Listings <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Quick filter selection pills */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-hide border-b border-neutral-200/50">
          {quickFilters.map((filter) => {
            const isSelected = activeFilter === filter.label;
            return (
              <button
                key={filter.label}
                onClick={() => setActiveFilter(filter.label)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                  isSelected 
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm scale-[1.02]"
                    : "border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-100 hover:text-primary-600"
                } active:scale-[0.98]`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Interactive listing grid with stagger reveals and skeleton system */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skeletonCards.map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200/50 overflow-hidden animate-pulse shadow-xs">
                <div className="aspect-video bg-neutral-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3.5 bg-neutral-100 rounded w-1/2" />
                  <div className="h-px bg-neutral-100 my-2" />
                  <div className="h-6 bg-neutral-200 rounded w-1/3 mt-2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-neutral-200 rounded-lg flex-1" />
                    <div className="h-8 bg-neutral-200 rounded-lg w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/60 p-8 max-w-xl mx-auto flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-danger-50 flex items-center justify-center text-danger-500 mb-4 border border-danger-100">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">Error loading cars</h3>
            <p className="text-xs text-neutral-500 mt-1">
              {fetchError}
            </p>
            <button onClick={fetchCars} className="mt-4 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all active:scale-[0.98]">
              Try Again
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/60 p-8 max-w-xl mx-auto flex flex-col items-center">
            {/* Unified icon color text-primary-600 to align with standard brand design tokens */}
            <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4 border border-primary-100">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">No cars match this filter</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try selecting a different filter pill above or browse the complete directory.
            </p>
            <Link href="/cars" className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]">
              Browse All Cars
            </Link>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {cars.map((car) => (
              <motion.div key={car._id} variants={itemVariants}>
                <CarCard car={car} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
