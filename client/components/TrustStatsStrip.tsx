"use client";

/**
 * WHAT: Homepage trust strip (dark band).
 * WHY: Establishes trust fast — but ONLY with claims the platform can back:
 *      the live listing count comes from the API; everything else describes
 *      real features (RC checks, downloadable inspection reports, dealer
 *      ratings). No invented showroom counts, average ratings, or callback
 *      promises — those erode exactly the trust they're meant to build.
 */
import { useState, useEffect } from "react";
import { Car, ShieldCheck, FileText, Star } from "lucide-react";

export default function TrustStatsStrip({
  initialCount = null,
}: {
  /** Listing total rendered by the server so the first paint is never a placeholder. */
  initialCount?: number | null;
}) {
  const [carCount, setCarCount] = useState<number | null>(initialCount);

  useEffect(() => {
    fetch(`/api/cars?limit=1`)
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
      value: carCount === null ? "—" : `${carCount}+`,
      label: "Live Listings",
      sub: "Added by local dealers",
    },
    {
      icon: ShieldCheck,
      value: "RC badge",
      label: "Registration Papers",
      sub: "Shown on cars KarBik has checked",
    },
    {
      icon: FileText,
      value: "Reports",
      label: "Inspection Documents",
      sub: "Downloadable on inspected cars",
    },
    {
      icon: Star,
      value: "Rated",
      label: "Local Showrooms",
      sub: "Real buyer reviews, public profiles",
    },
  ];

  return (
    <section className="bg-neutral-900 border-y border-neutral-800 py-10 md:py-12 select-none relative overflow-hidden">
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
                <div className="p-3 rounded-xl bg-neutral-800/80 border border-white/10 text-primary-500 shrink-0">
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">
                    {item.value}
                  </div>
                  <div className="text-xs font-bold text-neutral-200 mt-1.5 leading-snug">
                    {item.label}
                  </div>
                  <div className="text-xs text-neutral-400 font-semibold mt-0.5">
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
