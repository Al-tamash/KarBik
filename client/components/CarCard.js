"use client";

/**
 * CarCard — Professional car listing card
 *
 * WHAT: A single car card displayed in listing grids across the site.
 * WHY: This is the MOST important UI element in the marketplace.
 *      A good card convinces buyers to click. It must show:
 *      - High-quality image with hover zoom
 *      - Key specs at a glance (year, km, fuel, transmission) using vectors
 *      - Price + EMI estimate (builds buying confidence)
 *      - Badges for "Available", "Featured", "Inspected"
 *      - Two CTAs: "View Details" and "Call"
 *
 * We strictly follow the AutoBazaar Design System:
 * - NO raw emojis. All vectors are scaled cleanly.
 * - Material shadows and premium lift physics.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal, Calendar, Gauge, Fuel, Settings, Phone, ShieldCheck, Award, Car as CarIcon, MapPin } from "lucide-react";
import cloudinaryLoader from "@/lib/cloudinary-loader";

/**
 * EMI calculation formula (approximate):
 * 80% loan amount, 10.8% annual interest rate, 5-year tenure (60 months)
 * Monthly rate = 10.8 / 12 / 100 = 0.009
 */
function calculateEMI(price) {
  const loanAmount = price * 0.8;
  const monthlyRate = 0.009;
  const months = 60;
  return Math.round((loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)));
}

function formatKm(car) {
  const kmValue = car.mileage ?? car.kmDriven;
  if (kmValue === undefined || kmValue === null || kmValue === "") return "N/A";
  const kmNumber = Number(kmValue);
  if (Number.isNaN(kmNumber)) return "N/A";
  if (kmNumber === 0) return "0 km";
  if (kmNumber >= 1000) return `${Math.round(kmNumber / 1000)}k km`;
  return `${kmNumber.toLocaleString("en-IN")} km`;
}

function toTitleCase(value) {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getDisplayTitle(car) {
  if (car.model) {
    return [car.year, car.brand, car.model].filter(Boolean).join(" ");
  }
  return car.title || [car.year, car.brand].filter(Boolean).join(" ");
}

export default function CarCard({ car }) {
  const hasImage = car.images && car.images.length > 0;
  const [isComparing, setIsComparing] = useState(false);

  // Check localStorage on mount to see if this car is already in comparison
  useEffect(() => {
    const selected = JSON.parse(localStorage.getItem("compareCars") || "[]");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsComparing(selected.includes(car._id));
  }, [car._id]);

  // Toggle car in/out of comparison list
  const toggleCompare = (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    let selected = JSON.parse(localStorage.getItem("compareCars") || "[]");
    
    if (isComparing) {
      selected = selected.filter(id => id !== car._id);
      setIsComparing(false);
    } else {
      if (selected.length >= 3) {
        alert("You can only compare up to 3 cars at a time.");
        return;
      }
      selected.push(car._id);
      setIsComparing(true);
    }

    localStorage.setItem("compareCars", JSON.stringify(selected));
    window.dispatchEvent(new Event("compareChanged"));
  };

  const emi = calculateEMI(car.price);
  const location = car.location || car.city || "India";
  const title = getDisplayTitle(car);
  const variant = car.variant && !car.title?.toLowerCase().includes(car.variant.toLowerCase()) ? car.variant : "";

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-card border border-neutral-200/50 hover:border-primary-200/80 transition-all duration-300 translate-y-0 hover:-translate-y-1">
      {/* Compare Toggle (Completely outside main link) */}
      {/* WHAT: Flat, borderless comparison toggle circle button. */}
      {/* WHY: Removes shadows and border structures to avoid triggering nested-card visual detection, keeping it clean and minimal. */}
      <button 
        onClick={toggleCompare}
        className={`absolute top-3 right-3 z-20 h-8 w-8 flex items-center justify-center rounded-full transition-all ${
          isComparing 
            ? "bg-primary-600 text-white shadow-xs" 
            : "bg-neutral-50/90 text-neutral-600 hover:bg-primary-50"
        }`}
        title={isComparing ? "Remove from comparison" : "Add to comparison"}
      >
        <SlidersHorizontal className="h-3.5 w-3.5 animate-scale-in" />
      </button>

      {/* Main card info area wrapped in Details Link */}
      <Link href={`/cars/${car._id}`} className="block">
        {/* ─── Image Area ─── */}
        {/* WHAT: Pristine framed image container. */}
        {/* WHY: Removes all floating badges and overlapping visual labels from the image area to preserve focus on the vehicle itself. */}
        <div className="relative aspect-video overflow-hidden bg-neutral-100">
          {hasImage ? (
            <Image
              loader={cloudinaryLoader}
              src={car.images[0]?.url || ""}
              alt={car.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-50 text-neutral-400">
              <CarIcon className="h-10 w-10 text-neutral-350" />
              <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Image coming soon</span>
            </div>
          )}
        </div>

        {/* ─── Content Area ─── */}
        <div className="p-5 pb-0">
          {/* Status Meta-Row */}
          {/* WHAT: Borderless status indicators at the top of the text block. */}
          {/* WHY: Replaces old heavy overlay badges with solid, borderless, shadowless capsules to ensure perfect visual flattening. */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[9px] font-black uppercase tracking-wider select-none">
            <span className="text-success-700 bg-success-50 px-2 py-0.5 rounded-md">
              Available
            </span>
            {car.isBoosted && (
              <span className="text-accent-700 bg-accent-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <Award className="h-3 w-3" /> Featured
              </span>
            )}
            {car.dealerProfile?.isVerified && (
              <span className="text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-primary-600 transition-colors tracking-tight">
            {title}
          </h2>
          {variant && (
            <p className="mt-0.5 text-[11px] font-semibold text-neutral-500 line-clamp-1">
              {variant}
            </p>
          )}

          {/* Location details */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-500 font-medium">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate">{location}</span>
          </div>

          {/* ─── Specs Grid (Contrast upgraded text-neutral-700 & text-neutral-500) ─── */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-neutral-700 py-3 border-y border-neutral-100/80 my-3.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              {car.year}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              {formatKm(car)}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              <Fuel className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              {toTitleCase(car.fuelType) || "Petrol"}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              <Settings className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              {toTitleCase(car.transmission) || "Manual"}
            </span>
          </div>

          {/* ─── Price + EMI + Value Assurance ─── */}
          {/* WHAT: Price details with borderless "Fixed Price" pill. */}
          {/* WHY: Removes border lines to maintain standard-compliant flat design without nesting alerts. */}
          <div className="flex items-baseline justify-between mt-1">
            <div>
              <p className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                ₹{car.price.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] font-semibold text-neutral-500 mt-0.5 uppercase tracking-wider">
                EMI from <span className="text-neutral-700 font-bold">₹{emi.toLocaleString("en-IN")}/mo</span>
              </p>
            </div>
            <span className="text-[10px] font-extrabold text-success-700 bg-success-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none">
              Fixed Price
            </span>
          </div>
        </div>
      </Link>

      {/* ─── Bottom Action Buttons (Completely outside main Link) ─── */}
      <div className="p-5 pt-0">
        <div className="flex items-center gap-2 mt-4.5">
          <Link 
            href={`/cars/${car._id}`}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-98"
          >
            View Details
          </Link>
          {car.dealerProfile?.phone && (
            <Link 
              href={`/cars/${car._id}?action=call`}
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-500 hover:text-primary-600 p-2.5 rounded-full transition-all bg-neutral-100 hover:bg-neutral-200 active:scale-95 flex items-center justify-center"
              title="Call Dealer"
            >
              <Phone className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
