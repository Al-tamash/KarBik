"use client";

/**
 * CarCard: the listing card used in every grid and rail.
 * Kept to what a buyer scans in a second (category standard, like CarDekho):
 * photo, title, km / fuel / gearbox, price + EMI. Badges only when true:
 * "RC Verified" (KarBik checked the RC) and "Featured" (paid boost).
 * The dealer is named on the listing page, not here: buyers reach the dealer
 * through KarBik support, so the name adds noise without a next step.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal, ShieldCheck, Award, Car as CarIcon, Camera, Heart } from "lucide-react";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import type { ApiCar } from "@/lib/api-types";
import { useWishlist } from "@/lib/wishlist";

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

/** Lakh / crore, the way Indian buyers read car prices ("₹7.80 Lakh"). */
function formatPrice(price: number): string {
  if (price >= 1_00_00_000) return `₹${(price / 1_00_00_000).toFixed(2)} Cr`;
  if (price >= 1_00_000) return `₹${(price / 1_00_000).toFixed(2)} Lakh`;
  return `₹${price.toLocaleString("en-IN")}`;
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

// Gearbox / fuel codes buyers read as letters ("CVT", not "Cvt").
const ACRONYMS = new Set(["CVT", "AMT", "DCT", "DSG", "AT", "MT", "IMT", "CNG", "LPG", "EV"]);

function toTitleCase(value: unknown): string {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .split(" ")
    .map((word) =>
      ACRONYMS.has(word.toUpperCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

function getDisplayTitle(car: ApiCar): string {
  if (car.model) {
    return [car.year, car.brand, car.model].filter(Boolean).join(" ");
  }
  return car.title || [car.year, car.brand].filter(Boolean).join(" ");
}

export default function CarCard({ car }: { car: ApiCar }) {
  const images = car.images ?? [];
  const hasImage = images.length > 0;
  const [isComparing, setIsComparing] = useState(false);
  const wishlist = useWishlist();
  const isSaved = wishlist.has(car.id);

  // Check localStorage on mount to see if this car is already in comparison
  useEffect(() => {
    const selected = JSON.parse(localStorage.getItem("compareCars") || "[]") as string[];

    setIsComparing(selected.includes(car.id));
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

  // Toggle car in/out of the wishlist (browser list when signed out, account when signed in)
  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void wishlist.toggle(car.id);
  };

  const emi = calculateEMI(car.price);
  const title = getDisplayTitle(car);
  const variant = car.variant && !car.title?.toLowerCase().includes(car.variant.toLowerCase()) ? car.variant : "";

  // One spec line, only from fields the dealer actually filled in.
  const specs = [formatKm(car), toTitleCase(car.fuelType), toTitleCase(car.transmission)]
    .filter((s) => s && s !== "N/A");

  // Photo overlays: at most the two signals that change a buyer's decision.
  // Inspected / accident-free details live on the listing page.
  const isSample = Boolean(car.dealerProfile?.isSample);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-[box-shadow,border-color] duration-300 hover:border-border-strong hover:shadow-card-hover">
      {/* Save + compare (outside the main link) */}
      <div className="absolute right-3 top-3 z-20 flex gap-2">
        <button
          onClick={toggleCompare}
          aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
          aria-pressed={isComparing}
          title={isComparing ? "Remove from comparison" : "Add to comparison"}
          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-colors ${
            isComparing ? "bg-primary-600 text-white" : "bg-surface/95 text-ink hover:text-primary-700"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <button
          onClick={toggleSave}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={isSaved}
          title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-colors ${
            isSaved ? "bg-surface text-danger-600" : "bg-surface/95 text-ink hover:text-danger-600"
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-danger-600" : ""}`} />
        </button>
      </div>

      <Link href={`/cars/${car.id}`} className="flex flex-1 flex-col">
        {/* ─── Image Area ─── */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-alt">
          {hasImage ? (
            <Image
              loader={cloudinaryLoader}
              src={images[0]?.url || ""}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-surface-alt text-ink-muted">
              <CarIcon className="h-10 w-10 text-border-strong" aria-hidden />
              <span className="mt-2 text-xs font-semibold">Photos coming soon</span>
            </div>
          )}

          {/* Top-left: paid boost / sample flag */}
          {(car.isBoosted || isSample) && (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md bg-surface/95 px-2 py-1 text-xs font-bold text-ink shadow-sm">
              {isSample ? (
                "Sample listing"
              ) : (
                <>
                  <Award className="h-3.5 w-3.5 text-accent-700" aria-hidden />
                  Featured
                </>
              )}
            </span>
          )}

          {/* Bottom: RC check (true only when KarBik verified it) + photo count */}
          <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-2">
            {car.rcVerified ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-success-700 px-2 py-1 text-xs font-bold text-white shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                RC Verified
              </span>
            ) : (
              <span />
            )}
            {hasImage && images.length > 1 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-neutral-900/75 px-2 py-1 text-xs font-semibold text-white">
                <Camera className="h-3.5 w-3.5" aria-hidden />
                {images.length}
              </span>
            )}
          </div>
        </div>

        {/* ─── Content Area ─── */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 text-base font-bold leading-snug text-ink-strong transition-colors group-hover:text-primary-700">
            {title}
          </h3>
          {variant && <p className="mt-0.5 line-clamp-1 text-sm text-ink-muted">{variant}</p>}

          {specs.length > 0 && (
            <p className="mt-2 text-sm text-ink tabular-nums">{specs.join(" · ")}</p>
          )}

          {/* ─── Price + EMI ─── */}
          <div className="mt-auto pt-3">
            <p className="whitespace-nowrap text-xl font-extrabold tracking-tight text-ink-strong tabular-nums sm:text-2xl">
              {formatPrice(car.price)}
            </p>
            <p
              className="mt-0.5 text-xs text-ink-muted tabular-nums whitespace-nowrap"
              title="Estimate only: 80% loan at 10.8% a year for 5 years. KarBik does not offer loans."
            >
              Est. EMI ₹{emi.toLocaleString("en-IN")}/mo
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
