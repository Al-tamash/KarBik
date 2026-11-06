"use client";

import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { Eye, MessageSquare, TrendingUp, Zap, Plus, Edit, Trash2, Car, Sparkles, ImageOff } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { ApiAnalyticsResponse, ApiCar, ApiInquiry } from "@/lib/api-types";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
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
}: {
  cars: ApiCar[];
  loadingCars: boolean;
  analyticsData: ApiAnalyticsResponse | null;
  inquiries: ApiInquiry[];
  onNewListing: () => void;
  onEdit: (carId: string) => void;
  onDelete: (carId: string) => void;
  onBoost: (carId: string) => void;
}) {
  const conversionRate = parseFloat(String(analyticsData?.overview?.conversionRate ?? "2.0"));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* ─── Stats: varied layout, not identical cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

        {/* Views — horizontal bar with trend */}
        <motion.div variants={item} className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-ink-muted">Total views</p>
            <Eye className="w-4 h-4 text-ink-subtle" />
          </div>
          <p className="text-2xl font-bold text-ink-strong tracking-tight">
            {analyticsData?.overview?.totalViews || cars.length * 9}
          </p>
          <div className="mt-3 h-1.5 bg-surface-alt rounded-full overflow-hidden">
            {/* Unified theme color bg-primary-600 for total views visualization bar */}
            <div className="h-full bg-primary-600 rounded-full" style={{ width: "68%" }} />
          </div>
        </motion.div>

        {/* Inquiries — count with activity dot */}
        <motion.div variants={item} className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-ink-subtle" />
            <p className="text-xs font-medium text-ink-muted">Inquiries</p>
            {inquiries.length > 0 && (
              /* Added gentle animate-pulse to the core brand active inquiry notification indicator dot */
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-bold text-ink-strong tracking-tight">{inquiries.length}</p>
          <p className="text-xs text-ink-subtle mt-1">
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
                stroke={conversionRate > 3 ? "#22C55E" : conversionRate > 1 ? "#1B6EF3" : "#F59E0B"}
                strokeWidth="3"
                strokeDasharray={`${Math.min(conversionRate * 10, 88)} 88`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted">Conversion</p>
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
            <Zap className="w-4 h-4 text-warning-500" />
            <p className="text-xs font-medium text-ink-muted">Active boosts</p>
          </div>
          <p className="text-2xl font-bold text-ink-strong tracking-tight">
            {analyticsData?.overview?.activeBoosts || 0}
          </p>
          <p className="text-xs text-ink-subtle mt-1">
            {(analyticsData?.overview?.activeBoosts || 0) === 0 ? "None running" : "Promoting inventory"}
          </p>
        </motion.div>
      </div>

      {/* ─── Listings table ─── */}
      <div className="card overflow-hidden">
        {loadingCars ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
            <p className="text-sm text-ink-subtle">Loading listings...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16 px-6 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center mx-auto mb-4">
              <Car className="w-6 h-6 text-ink-subtle" />
            </div>
            <h3 className="text-base font-bold text-ink-strong mb-1">No active listings</h3>
            <p className="text-sm text-ink-muted mb-6">Create your first listing to start receiving inquiries.</p>
            <button onClick={onNewListing} className="btn-md btn-primary shadow-sm">
              <Plus className="w-4 h-4" /> Create Listing
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {cars.map((car: ApiCar) => (
              <div key={car.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-surface-alt transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Note: Added relative positioning so the optimized Image fill fits the bounding box boundaries */}
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-alt border border-border">
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
                        <ImageOff className="w-5 h-5 text-ink-subtle" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-ink-strong truncate">{car.title}</p>
                      {car.isBoosted && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold bg-warning-50 text-warning-700 border border-warning-200">
                          <Sparkles className="w-2.5 h-2.5" /> Boosted
                        </span>
                      )}
                      {car.pendingApproval && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold bg-surface-alt text-ink-muted border border-border"
                          title="Not public yet. It goes live once your dealership is verified."
                        >
                          Awaiting approval
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">
                      {car.brand} · {car.year} · <span className="font-semibold text-ink">₹{car.price.toLocaleString("en-IN")}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 sm:pl-4">
                  {!car.isBoosted && (
                    <button
                      onClick={() => onBoost(car.id)}
                      className="btn-sm btn-accent inline-flex items-center gap-1 text-xs"
                    >
                      <Zap className="w-3.5 h-3.5" /> Boost
                    </button>
                  )}
                  <Link
                    href={`/dashboard/edit/${car.id}`}
                    className="btn-sm btn-outline inline-flex items-center gap-1 text-xs"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => onDelete(car.id)}
                    aria-label={`Remove listing ${car.title}`}
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
