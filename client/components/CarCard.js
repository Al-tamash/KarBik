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
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border border-neutral-200/50 hover:border-primary-200/60 transition-all duration-300 translate-y-0 hover:-translate-y-1 cursor-pointer">
      {/* Compare Toggle */}
      <button 
        onClick={toggleCompare}
        className={`absolute top-3 right-3 z-20 h-8 w-8 flex items-center justify-center rounded-full backdrop-blur-md transition-all border ${
          isComparing 
            ? "bg-primary-600 text-white border-primary-600 shadow-lg" 
            : "bg-white/90 text-neutral-400 border-neutral-200 hover:bg-white hover:text-primary-600 shadow-sm"
        }`}
        title={isComparing ? "Remove from comparison" : "Add to comparison"}
      >
        <SlidersHorizontal className="h-3.5 w-3.5 animate-scale-in" />
      </button>

      <Link href={`/cars/${car._id}`} className="block">
        {/* ─── Image Area ─── */}
        <div className="relative aspect-video overflow-hidden bg-neutral-100">
          {hasImage ? (
            <Image
              loader={cloudinaryLoader}
              // Safeguard the main listing index image url
              src={car.images[0]?.url || ""}
              alt={car.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-neutral-50 via-primary-50/40 to-neutral-100">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-white/80 text-neutral-400 shadow-sm">
                <CarIcon className="h-9 w-9" />
              </div>
              <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-neutral-400">Image coming soon</span>
            </div>
          )}

          {/* Available badge — top left */}
          <span className="absolute top-3 left-3 badge badge-success shadow-xs font-bold select-none">
            Available
          </span>

          {/* Featured badge — top right (only if boosted) */}
          {car.isBoosted && (
            <span className="absolute top-3 left-24 badge badge-accent shadow-xs font-bold select-none">
              <Award className="h-3 w-3 mr-0.5" /> Featured
            </span>
          )}
        </div>

        {/* ─── Content Area ─── */}
        <div className="p-5">
          {/* Title - Change to h2 to respect proper outline hierarchy after main page h1 */}
          <h2 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-primary-600 transition-colors tracking-tight">
            {title}
          </h2>
          {variant && (
            <p className="mt-0.5 text-[11px] font-semibold text-neutral-500 line-clamp-1">
              {variant}
            </p>
          )}

          {/* Location + verified status */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-500 font-medium">
            {car.dealerProfile?.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border border-primary-100">
                <ShieldCheck className="h-3 w-3" /> VERIFIED
              </span>
            )}
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-neutral-400" />
              <span className="truncate">{location}</span>
            </span>
          </div>

          {/* ─── Specs Grid (Responsive columns prevent wrapping issues) ─── */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-neutral-500 py-3 border-y border-neutral-100/80 my-3.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              {car.year}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              {formatKm(car)}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              <Fuel className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              {toTitleCase(car.fuelType) || "Petrol"}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              <Settings className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              {toTitleCase(car.transmission) || "Manual"}
            </span>
          </div>

          {/* ─── Price + EMI + Value Assurance ─── */}
          <div className="flex items-baseline justify-between mt-1">
            <div>
              <p className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                ₹{car.price.toLocaleString("en-IN")}
              </p>
              {/* Change label to text-neutral-500 for accessible WCAG contrast */}
              <p className="text-[10px] font-semibold text-neutral-500 mt-0.5 uppercase tracking-wider">
                EMI from <span className="text-neutral-700 font-bold">₹{emi.toLocaleString("en-IN")}/mo</span>
              </p>
            </div>
            <span className="text-[10px] font-extrabold text-success-600 bg-success-50 border border-success-100 px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
              Fixed Price
            </span>
          </div>

          {/* ─── Action Buttons ─── */}
          <div className="flex items-center gap-2 mt-4.5">
            <span className="flex-1 bg-primary-600 text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs hover:bg-primary-700 hover:shadow-md active:scale-98">
              View Details
            </span>
            <span className="border border-neutral-200 text-neutral-600 hover:text-primary-600 hover:border-primary-600 p-2.5 rounded-xl transition-all bg-white hover:bg-neutral-50 active:scale-98">
              <Phone className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
