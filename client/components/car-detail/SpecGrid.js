import React from "react";

// toTitleCase converts strings like "PETROL" to "Petrol" for consistent, human-crafted aesthetics
function toTitleCase(str) {
  if (str === null || str === undefined || str === "") return "";
  return String(str)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SpecGrid({ car }) {
  // Define standard key specs
  const standardSpecs = [
    {
      label: "KM Driven",
      value: `${(car.mileage || car.kmsDriven || 0).toLocaleString("en-IN")}`,
      unit: "km",
    },
    {
      label: "Fuel Type",
      value: toTitleCase(car.fuelType) || "N/A",
      unit: "",
    },
    {
      label: "Transmission",
      value: toTitleCase(car.transmission) || "N/A",
      unit: "",
    },
    {
      label: "Registration",
      value: car.registrationNumber?.split("-")?.[0]?.toUpperCase() || "N/A",
      unit: "",
    },
    {
      label: "Make Year",
      value: car.year ? String(car.year) : "N/A",
      unit: "",
    },
    {
      label: "Ownership",
      value: toTitleCase(car.owners) || "N/A",
      unit: "",
    },
    {
      label: "Colour",
      value: toTitleCase(car.color) || "N/A",
      unit: "",
    },
    {
      label: "Body Type",
      value: toTitleCase(car.bodyType) || "N/A",
      unit: "",
    },
  ];

  // Define new technical specs populated by AI/RTO
  const techSpecs = [
    {
      label: "Engine Displacement",
      value: car.engineCC ? String(car.engineCC) : "N/A",
      unit: car.engineCC ? "cc" : "",
    },
    {
      label: "Max Power",
      value: car.power || "N/A",
      unit: "",
    },
    {
      label: "Ground Clearance",
      value: car.groundClearance || "N/A",
      unit: "",
    },
    {
      label: "Certified Mileage",
      value: car.certifiedMileage || "N/A",
      unit: "",
    },
  ];

  // Check if advanced technical specs exist to determine our grid rendering
  const hasTechSpecs = car.engineCC || car.power || car.groundClearance || car.certifiedMileage;
  
  // Combine lists cleanly for one single card grid
  const allSpecs = hasTechSpecs ? [...standardSpecs, ...techSpecs] : standardSpecs;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm">
      {/* Unified Card Header using our official website typography and primary brand indicator line */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
        {/* Subtle left-side border indicator in our website's primary brand color (primary-600) */}
        <div className="w-1 h-5 bg-primary-600 rounded-full shrink-0" />
        <h2 className="text-lg font-bold text-neutral-900 font-display">
          Key Specifications & Technical Details
        </h2>
      </div>

      {/* 
        A clean typographic spec sheet grid. 
        It renders in a 2-column grid on mobile and dynamically scales to 4 columns on larger screens.
        We have removed all individual cell icons to eliminate the visual clutter and maintain a 
        100% professional, authentic, brochure-style editorial look.
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
        {allSpecs.map((spec) => (
          <div 
            key={spec.label} 
            className="flex flex-col justify-between py-1 border-b border-neutral-100/50 pb-2 md:border-b-0 md:pb-0"
          >
            {/* Small uppercase label for premium structure and clean scannability */}
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              {spec.label}
            </span>
            {/* Dark, crisp values using our design system's text properties */}
            <span className="text-base font-bold text-neutral-900 mt-1">
              {spec.value}
              {spec.unit && (
                <span className="text-xs font-semibold text-neutral-500 ml-1">
                  {spec.unit}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
What you just learned:
- brochure-style typography layouts: removing icons and using clean uppercase labels with heavy value fonts replicates the premium editorial design of high-end car catalogs.
- Unified Card Containers: consolidating 12 separate floating cards into a single cohesive panel reduces cognitive load for buyers and improves layout balance.
- Pure brand indicators: using a single vertical line colored with the primary brand theme (`bg-primary-600`) links the component directly to the site identity without cluttering cells with unaligned colors.
*/
