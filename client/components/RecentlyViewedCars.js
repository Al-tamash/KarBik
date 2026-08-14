"use client";

/**
 * WHAT: "Recently Viewed Cars" carousel.
 * WHY: High conversion driver. Buyers love returning to cars they previously opened.
 *      By pulling directly from localStorage, we provide a lightning-fast,
 *      no-login-required history strip exactly like Spinny and OLX Autos.
 */
import { useState, useEffect } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import CarCard from "@/components/CarCard";

export default function RecentlyViewedCars() {
  const [viewedCars, setViewedCars] = useState([]);

  useEffect(() => {
    // Read list on mount
    const saved = JSON.parse(localStorage.getItem("recentlyViewedCars") || "[]");
    setViewedCars(saved);
  }, []);

  if (viewedCars.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <section className="py-12 border-t border-neutral-200/80 bg-neutral-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-8 text-left">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight font-display">
              Recently Viewed by You
            </h2>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
              Your quick browsing history
            </p>
          </div>
        </div>

        {/* Snapping horizontal carousel */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 gap-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent"
        >
          {viewedCars.map((car) => (
            <motion.div 
              key={car._id} 
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
