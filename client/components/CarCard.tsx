"use client";

/**
 * CarCard — Listing card with human trust signals
 *
 * WHAT: A single car card displayed in listing grids across the site.
 * WHY: The most important UI element in the marketplace. Every signal shown
 *      here is backed by real data (no decorative chips):
 *      - Real listing photography, with a photo-count chip (completeness
 *        builds trust — AutoTrader flags <10-photo listings as low quality)
 *      - Data-backed status: Inspected / RC Verified / Accident-Free / Boosted
 *      - The DEALER LINE: business name + star rating + review count +
 *        verified tick — pulled from dealerProfiles via the list API
 *      - Freshness & social proof: "Listed 3d ago", view count
 *      - Price + EMI estimate
 *
 * Design system notes:
 * - Surfaces/text use semantic tokens (dark-mode safe by default)
 * - This is a LISTING card, so .card-hover lift physics apply here
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal, Calendar, Gauge, Fuel, Settings, ShieldCheck, BadgeCheck, Award, Star, Car as CarIcon, MapPin, Eye, Camera, Heart } from "lucide-react";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import type { ApiCar } from "@/lib/api-types";

/**
 * EMI calculation formula (approximate):
 * 80% loan amount, 10.8% annual interest rate, 5-year tenure (60 months)
 * Monthly rate = 10.8 / 12 / 100 = 0.009
 */
function calculateEMI(price: number): number {
  const loanAmount = price * 0.8;
  const monthlyRate = 0.009;
  const months = 60;
  return Math.round((loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)));
}

function formatKm(car: ApiCar): string {
  const kmValue = car.mileage;
  if (kmValue === undefined || kmValue === null) return "N/A";
  const kmNumber = Number(kmValue);
  if (Number.isNaN(kmNumber)) return "N/A";
  if (kmNumber === 0) return "0 km";
  if (kmNumber >= 1000) return `${Math.round(kmNumber / 1000)}k km`;
  return `${kmNumber.toLocaleString("en-IN")} km`;
}

function toTitleCase(value: unknown): string {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getDisplayTitle(car: ApiCar): string {
  if (car.model) {
    return [car.year, car.brand, car.model].filter(Boolean).join(" ");
  }
  return car.title || [car.year, car.brand].filter(Boolean).join(" ");
}

function formatListedAgo(createdAt: string): string | null {
  const ms = Date.now() - new Date(createdAt).getTime();
  if (Number.isNaN(ms)) return null;
  const days = Math.floor(ms / 86_400_000);
  if (days <= 0) return "Listed today";
  if (days === 1) return "Listed yesterday";
  if (days < 7) return `Listed ${days}d ago`;
  if (days < 30) return `Listed ${Math.floor(days / 7)}w ago`;
  if (days < 365) return `Listed ${Math.floor(days / 30)}mo ago`;
  return `Listed ${Math.floor(days / 365)}y ago`;
}

function formatViews(views: number): string | null {
  if (!views || views <= 0) return null;
  if (views >= 1000) return `${(views / 1000).toFixed(1).replace(/\.0$/, "")}k views`;
  return `${views} ${views === 1 ? "view" : "views"}`;
}

export default function CarCard({ car }: { car: ApiCar }) {
  const images = car.images ?? [];
  const hasImage = images.length > 0;
  const [isComparing, setIsComparing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Check localStorage on mount to see if this car is already in comparison
  useEffect(() => {
    const selected = JSON.parse(localStorage.getItem("compareCars") || "[]") as string[];

    setIsComparing(selected.includes(car.id));
  }, [car.id]);

  // Check localStorage on mount to see if this car is saved
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedCars") || "[]") as string[];
    setIsSaved(saved.includes(car.id));
  }, [car.id]);

  // Toggle car in/out of comparison list
  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let selected = JSON.parse(localStorage.getItem("compareCars") || "[]") as string[];

    if (isComparing) {
      selected = selected.filter(id => id !== car.id);
      setIsComparing(false);
    } else {
      if (selected.length >= 3) {
        alert("You can only compare up to 3 cars at a time.");
        return;
      }
      selected.push(car.id);
      setIsComparing(true);
    }

    localStorage.setItem("compareCars", JSON.stringify(selected));
    window.dispatchEvent(new Event("compareChanged"));
  };

  // Toggle car in/out of saved list
  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let saved = JSON.parse(localStorage.getItem("savedCars") || "[]") as string[];

    if (isSaved) {
      saved = saved.filter(id => id !== car.id);
      setIsSaved(false);
    } else {
      saved.push(car.id);
      setIsSaved(true);
    }

    localStorage.setItem("savedCars", JSON.stringify(saved));
  };

  const emi = calculateEMI(car.price);
  const location = car.city || "India";
  const title = getDisplayTitle(car);
  const variant = car.variant && !car.title?.toLowerCase().includes(car.variant.toLowerCase()) ? car.variant : "";

  // ─── Human signals (all data-backed) ───
  const dealer = car.dealerProfile ?? null;
  const rating = dealer?.averageRating ?? 0;
  const reviewCount = dealer?.totalReviews ?? 0;
  const listedAgo = formatListedAgo(car.createdAt);
  const viewsLabel = formatViews(car.views);

  // Status chips — every one maps to a real field, nothing decorative.
  const chips: Array<{ label: string; icon?: React.ReactNode; tone: string }> = [];
  if (car.dealerProfile?.isSample) {
    chips.unshift({ label: "Sample listing", icon: <ShieldCheck className="h-3 w-3" />, tone: "text-ink bg-surface-alt border border-border-strong" });
  }
  if (car.isBoosted) {
    chips.push({ label: "Featured", icon: <Award className="h-3 w-3" />, tone: "text-accent-700 bg-accent-50" });
  }
  if (car.isInspected) {
    chips.push({ label: "Inspected", icon: <ShieldCheck className="h-3 w-3" />, tone: "text-success-700 bg-success-50" });
  }
  if (car.rcVerified) {
    chips.push({ label: "RC Verified", icon: <ShieldCheck className="h-3 w-3" />, tone: "text-primary-700 bg-primary-50" });
  }
  if (car.accidentHistory === false) {
    chips.push({ label: "Accident-Free", tone: "text-ink-muted bg-surface-alt" });
  }

  return (
    <div className="group relative bg-surface rounded-2xl overflow-hidden shadow-card border border-border hover:border-primary-200 transition-all duration-300 translate-y-0 hover:-translate-y-0.5 hover:shadow-card-hover">
      {/* Wishlist Heart Toggle */}
      <button
        onClick={toggleSave}
        aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
        className={`absolute top-3 left-3 z-20 h-8 w-8 flex items-center justify-center rounded-full transition-all ${
          isSaved
            ? "bg-danger-50 text-danger-600 shadow-xs scale-105"
            : "bg-surface-alt/90 text-ink-muted hover:bg-danger-50 hover:text-danger-600"
        }`}
        title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart className={`h-3.5 w-3.5 transition-all ${isSaved ? "fill-danger-600" : ""}`} />
      </button>

      {/* Compare Toggle (outside main link) */}
      <button
        onClick={toggleCompare}
        aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
        className={`absolute top-3 right-3 z-20 h-8 w-8 flex items-center justify-center rounded-full transition-all ${
          isComparing
            ? "bg-primary-600 text-white shadow-xs"
            : "bg-surface-alt/90 text-ink-muted hover:bg-primary-50"
        }`}
        title={isComparing ? "Remove from comparison" : "Add to comparison"}
      >
        <SlidersHorizontal className="h-3.5 w-3.5 animate-scale-in" />
      </button>

      {/* Main card info area wrapped in Details Link */}
      <Link href={`/cars/${car.id}`} className="block">
        {/* ─── Image Area ─── */}
        <div className="relative aspect-video overflow-hidden bg-surface-alt">
          {hasImage ? (
            <Image
              loader={cloudinaryLoader}
              src={images[0]?.url || ""}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-surface-alt text-ink-subtle">
              <CarIcon className="h-10 w-10 text-border-strong" />
              <span className="mt-2 text-xs font-bold uppercase tracking-wider text-ink-subtle">Image coming soon</span>
            </div>
          )}

          {/* Photo-count chip — completeness is a trust signal */}
          {hasImage && (
            <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-md bg-neutral-900/70 px-2 py-1 text-xs font-bold text-white select-none">
              <Camera className="h-3 w-3" />
              {images.length} {images.length === 1 ? "photo" : "photos"}
            </span>
          )}
        </div>

        {/* ─── Content Area ─── */}
        <div className="p-5 pb-0">
          {/* Data-backed status chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-xs font-black uppercase tracking-wider select-none">
              {chips.map((chip) => (
                <span key={chip.label} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md ${chip.tone}`}>
                  {chip.icon}
                  {chip.label}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="font-bold text-ink-strong text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-primary-600 transition-colors tracking-tight">
            {title}
          </h2>
          {variant && (
            <p className="mt-0.5 text-xs font-semibold text-ink-muted line-clamp-1">
              {variant}
            </p>
          )}

          {/* ─── Dealer line — the human behind the listing ─── */}
          {dealer?.businessName && (
            <div className="flex items-center gap-1.5 mt-2 min-w-0 text-xs">
              <span className="font-semibold text-ink truncate">
                {dealer.businessName}
              </span>
              {dealer.isVerified && (
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary-600" aria-label="Verified dealer" />
              )}
              {rating > 0 && (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 pl-2">
                  <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                  <span className="font-bold text-ink">{rating.toFixed(1)}</span>
                  {reviewCount > 0 && (
                    <span className="text-ink-subtle">({reviewCount})</span>
                  )}
                </span>
              )}
            </div>
          )}

          {/* Location + freshness + social proof */}
          <div className="flex items-center gap-x-2 gap-y-1 flex-wrap mt-2 text-xs text-ink-muted font-medium">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
              <span className="truncate">{location}</span>
            </span>
            {listedAgo && (
              <>
                <span className="text-border-strong" aria-hidden>·</span>
                <span className="whitespace-nowrap">{listedAgo}</span>
              </>
            )}
            {viewsLabel && (
              <>
                <span className="text-border-strong" aria-hidden>·</span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Eye className="h-3.5 w-3.5 text-ink-subtle" />
                  {viewsLabel}
                </span>
              </>
            )}
          </div>

          {/* ─── Specs Grid ─── */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-ink py-3 border-y border-border my-3.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-ink-muted shrink-0" />
              {car.year}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="h-3.5 w-3.5 text-ink-muted shrink-0" />
              {formatKm(car)}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              <Fuel className="h-3.5 w-3.5 text-ink-muted shrink-0" />
              {toTitleCase(car.fuelType) || "Petrol"}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              <Settings className="h-3.5 w-3.5 text-ink-muted shrink-0" />
              {toTitleCase(car.transmission) || "Manual"}
            </span>
          </div>

          {/* ─── Price + EMI ─── */}
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-lg sm:text-xl font-black text-ink-strong tracking-tight">
              ₹{car.price.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              EMI from <span className="text-ink font-bold">₹{emi.toLocaleString("en-IN")}/mo</span>
            </p>
          </div>
        </div>
      </Link>

      {/* ─── Bottom Action (outside main Link) ─── */}
      <div className="p-5 pt-0">
        <Link
          href={`/cars/${car.id}`}
          className="btn btn-primary btn-full mt-4 rounded-xl text-xs py-2.5 active:scale-98"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
