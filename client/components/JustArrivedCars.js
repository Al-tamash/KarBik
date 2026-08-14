"use client";

/**
 * WHAT: "Just Arrived" / recently listed cars section.
 * WHY: Displays fresh inventory that recently arrived in Hyderabad.
 *      Google and users love fresh content; this increases browse time
 *      and conversion rate by showcasing active inventory.
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, Car as CarIcon, Search } from "lucide-react";
import CarCard from "@/components/CarCard";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function JustArrivedCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchRecentCars = useCallback(async () => {
    setLoading(true);
    try {
      // By default, the /api/cars endpoint returns listings sorted by createdAt: -1 (newest first)
      const res = await fetch(`${API}/api/cars?limit=4`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Unable to load recent cars");
      }
      const data = await res.json();
      setCars(data.cars || []);
      setFetchError("");
    } catch (err) {
      setCars([]);
      setFetchError(err.message || "Unable to load recent cars");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecentCars();
  }, [fetchRecentCars]);

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

  return (
    <section className="py-20 bg-white border-t border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3 select-none">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              <span>Just Arrived</span>
            </div>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Recently Listed Vehicles
            </h2>
            <p className="text-sm text-neutral-500 mt-1 max-w-md">
              Be the first to inspect and book the latest additions to the AutoBazaar family.
            </p>
          </div>

          <Link 
            href="/cars"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-primary-600 tracking-wider uppercase hover:gap-2 transition-all"
          >
            Explore Directory <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(null).map((_, i) => (
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
          <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-200/60 p-8 max-w-xl mx-auto flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-danger-50 flex items-center justify-center text-danger-500 mb-4 border border-danger-100">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">Error loading cars</h3>
            <p className="text-xs text-neutral-500 mt-1">{fetchError}</p>
            <button onClick={fetchRecentCars} className="mt-4 px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-xl text-xs font-bold transition-all active:scale-[0.98]">
              Try Again
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-200/60 p-8 max-w-xl mx-auto flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4 border border-primary-100">
              <CarIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">No cars found</h3>
            <p className="text-xs text-neutral-500 mt-1">There are no recently listed cars available at the moment.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
