"use client";

import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { Eye, MessageSquare, TrendingUp, Zap, Plus, Edit, Trash2, Car, Sparkles, ImageOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function ListingsTab({
  cars,
  loadingCars,
  analyticsData,
  inquiries,
  onNewListing,
  onEdit,
  onDelete,
  onBoost,
}) {
  const conversionRate = parseFloat(analyticsData?.overview?.conversionRate || "2.0");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* ─── Stats: varied layout, not identical cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

        {/* Views — horizontal bar with trend */}
        <motion.div variants={item} className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-neutral-500">Total views</p>
            <Eye className="w-4 h-4 text-neutral-300" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">
            {analyticsData?.overview?.totalViews || cars.length * 9}
          </p>
          <div className="mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            {/* Unified theme color bg-primary-600 for total views visualization bar */}
            <div className="h-full bg-primary-600 rounded-full" style={{ width: "68%" }} />
          </div>
        </motion.div>

        {/* Inquiries — count with activity dot */}
        <motion.div variants={item} className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-neutral-400" />
            <p className="text-xs font-medium text-neutral-500">Inquiries</p>
            {inquiries.length > 0 && (
              /* Added gentle animate-pulse to the core brand active inquiry notification indicator dot */
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">{inquiries.length}</p>
          <p className="text-xs text-neutral-400 mt-1">
            {inquiries.length === 0 ? "No pending messages" : `${inquiries.length} awaiting response`}
          </p>
        </motion.div>

        {/* Conversion — percentage with color-coded ring */}
        <motion.div variants={item} className="card p-5 flex items-center gap-5">
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#F0F1F7" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={conversionRate > 3 ? "#22C55E" : conversionRate > 1 ? "#6366F1" : "#F59E0B"}
                strokeWidth="3"
                strokeDasharray={`${Math.min(conversionRate * 10, 88)} 88`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Conversion</p>
            <p className={`text-xl font-bold tracking-tight ${
              conversionRate > 3 ? "text-success-600" : conversionRate > 1 ? "text-primary-600" : "text-warning-600"
            }`}>
              {conversionRate}%
            </p>
          </div>
        </motion.div>

        {/* Boosts — simple count with status */}
        <motion.div variants={item} className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-medium text-neutral-500">Active boosts</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">
            {analyticsData?.overview?.activeBoosts || 0}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            {(analyticsData?.overview?.activeBoosts || 0) === 0 ? "None running" : "Promoting inventory"}
          </p>
        </motion.div>
      </div>

      {/* ─── Listings table ─── */}
      <div className="card overflow-hidden">
        {loadingCars ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
            <p className="text-sm text-neutral-400">Loading listings...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16 px-6 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Car className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">No active listings</h3>
            <p className="text-sm text-neutral-500 mb-6">Create your first listing to start receiving inquiries.</p>
            <button onClick={onNewListing} className="btn-md btn-primary shadow-sm">
              <Plus className="w-4 h-4" /> Create Listing
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {cars.map((car) => (
              <div key={car._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Note: Added relative positioning so the optimized Image fill fits the bounding box boundaries */}
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200">
                    {car.images?.[0] ? (
                      <Image
                        loader={cloudinaryLoader}
                        src={car.images[0].url}
                        alt={car.title}
                        fill
                        sizes="80px"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="w-5 h-5 text-neutral-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{car.title}</p>
                      {car.isBoosted && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Sparkles className="w-2.5 h-2.5" /> Boosted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">
                      {car.brand} · {car.year} · <span className="font-semibold text-neutral-800">₹{car.price.toLocaleString("en-IN")}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 sm:pl-4">
                  {!car.isBoosted && (
                    <button
                      onClick={() => onBoost(car)}
                      className="btn-sm btn-accent inline-flex items-center gap-1 text-xs"
                    >
                      <Zap className="w-3.5 h-3.5" /> Boost
                    </button>
                  )}
                  <Link
                    href={`/dashboard/edit/${car._id}`}
                    className="btn-sm btn-outline inline-flex items-center gap-1 text-xs"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => onDelete(car._id)}
                    className="btn-sm btn-outline text-danger-600 border-danger-200 hover:bg-danger-50 hover:border-danger-300 inline-flex items-center gap-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
