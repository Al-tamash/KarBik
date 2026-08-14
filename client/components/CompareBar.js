"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ArrowRight } from "lucide-react";

/**
 * CompareBar — Floating notification at bottom of screen
 * 
 * Shows when 1+ cars are selected for comparison.
 */
export default function CompareBar() {
  const [count, setCount] = useState(0);

  const updateCount = () => {
    const selected = JSON.parse(localStorage.getItem("compareCars") || "[]");
    setCount(selected.length);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateCount();
    // Listen for the custom event we dispatch in CarCard.js
    window.addEventListener("compareChanged", updateCount);
    return () => window.removeEventListener("compareChanged", updateCount);
  }, []);

  const clearAll = () => {
    localStorage.setItem("compareCars", "[]");
    updateCount();
    window.dispatchEvent(new Event("compareChanged"));
  };

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg"
        >
          <div className="bg-neutral-900 text-white rounded-[2rem] p-4 flex items-center justify-between shadow-2xl shadow-neutral-900/40 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-4 pl-4">
              <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-primary-500/20">
                {count}
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">Cars Selected</p>
                <button 
                  onClick={clearAll}
                  className="text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <Link 
              href="/compare"
              className="group flex items-center gap-3 bg-white text-neutral-900 rounded-2xl px-6 py-3 text-xs font-black hover:bg-primary-600 hover:text-white transition-all shadow-xl"
            >
              Compare Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
