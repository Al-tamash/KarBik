"use client";

/**
 * WHAT: "Recently Viewed Cars" carousel.
 * WHY: High conversion driver. Buyers love returning to cars they previously opened.
 *      By pulling directly from localStorage, we provide a lightning-fast,
 *      no-login-required history strip exactly like Spinny and OLX Autos.
 */
import { useState, useEffect } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import CarCard from "@/components/CarCard";
import type { ApiCar } from "@/lib/api-types";

export default function RecentlyViewedCars() {
  const [viewedCars, setViewedCars] = useState<ApiCar[]>([]);

  useEffect(() => {
    // Safely parse and sanitize recently viewed cars from localStorage
    try {
      const raw = localStorage.getItem("recentlyViewedCars");
      if (!raw) {
        setViewedCars([]);
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setViewedCars([]);
        return;
      }

      // Filter out invalid items and deduplicate by car.id to prevent React key warnings
      const seenIds = new Set<string>();
      const validCars: ApiCar[] = [];

      for (const item of parsed) {
        if (
          item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          item.id.trim().length > 0 &&
          !seenIds.has(item.id)
        ) {
          seenIds.add(item.id);
          validCars.push(item as ApiCar);
        }
      }

      // If corrupt or duplicate entries were purged, sync cleaned list back to storage
      if (validCars.length !== parsed.length) {
        localStorage.setItem("recentlyViewedCars", JSON.stringify(validCars));
      }

      setViewedCars(validCars);
    } catch {
      // In case of corrupt JSON, fall back to empty list gracefully
      setViewedCars([]);
    }
  }, []);

  if (viewedCars.length === 0) return null;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 10 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <section className="py-12 border-t border-border bg-surface-alt/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-8 text-left">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600 border border-primary-100 shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-ink-strong tracking-tight font-display">
              Recently Viewed by You
            </h2>
            <p className="text-xs text-ink-subtle font-bold uppercase tracking-wider mt-0.5">
              Your quick browsing history
            </p>
          </div>
        </div>

        {/* Snapping horizontal carousel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 gap-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border-strong scrollbar-track-transparent"
        >
          {viewedCars.map((car, index) => (
            <motion.div
              key={car.id || `viewed-${index}`}
              variants={itemVariants}
              className="min-w-[285px] sm:min-w-[320px] max-w-[320px] snap-center flex-shrink-0"
            >
              <CarCard car={car} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
