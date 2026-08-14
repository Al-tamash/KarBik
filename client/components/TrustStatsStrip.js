"use client";

/**
 * WHAT: Homepage Trust & Statistics Counter Strip.
 * WHY: Establishes immediate scale and authority. Competitors like CarDekho
 *      and Cars24 feature animated stats lists. Showing clear figures
 *      (Inspected Cars, Rated Showrooms, Quick Turnaround) builds rapid trust.
 */
import React, { useState, useEffect } from "react";
import { Car, Store, Star, Clock } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TrustStatsStrip() {
  const [carCount, setCarCount] = useState(480); // baseline fallback

  useEffect(() => {
    fetch(`${API}/api/cars?limit=1`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data.total) setCarCount(data.total);
      })
      .catch(() => {});
  }, []);

  const stats = [
    {
      icon: Car,
      value: `${carCount}+`,
      label: "Inspected Used Cars",
      sub: "100% RTO verified stocks"
    },
    {
      icon: Store,
      value: "80+",
      label: "Verified Showrooms",
      sub: "Across Hyderabad districts"
    },
    {
      icon: Star,
      value: "4.8★",
      label: "Average Buyer Rating",
      sub: "Rated by local families"
    },
    {
      icon: Clock,
      value: "15 Min",
      label: "Callback Guarantee",
      sub: "Rapid agent connection"
    }
  ];

  return (
    <section className="bg-neutral-900 border-y border-neutral-800 py-10 md:py-12 select-none relative overflow-hidden">
      {/* Subtle background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-600/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {stats.map((item, i) => {
            const Icon = item.icon;
            return (
              <div 
                key={i} 
                className="text-left flex flex-col sm:flex-row items-start gap-4 p-2 transition-transform duration-200 hover:scale-[1.01]"
              >
                {/* Vector container */}
                <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-750 text-primary-500 shrink-0">
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
                    {item.value}
                  </div>
                  <div className="text-xs font-bold text-neutral-200 mt-1.5 leading-snug">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                    {item.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
