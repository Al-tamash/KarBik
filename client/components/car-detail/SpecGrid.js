import React from "react";
import { Gauge, Fuel, Settings, MapPin, Calendar, Users, Paintbrush, Car } from "lucide-react";

function toTitleCase(str) {
  if (str === null || str === undefined || str === "") return "";
  return String(str)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SpecGrid({ car }) {
  const specTiles = [
    {
      icon: <Gauge className="h-5 w-5" />,
      // We change the label from "Mileage" to "KM Driven" to be perfectly accurate for buyers.
      // In the database, the 'mileage' field actually tracks the odometer (how many kilometers the vehicle has run),
      // rather than the fuel efficiency rating (e.g. km/l).
      label: "KM Driven",
      value: `${(car.mileage || car.kmsDriven || 0).toLocaleString("en-IN")}`,
      unit: "km",
    },
    {
      icon: <Fuel className="h-5 w-5" />,
      label: "Fuel Type",
      value: toTitleCase(car.fuelType),
      unit: "",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Transmission",
      value: toTitleCase(car.transmission),
      unit: "",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Registration",
      value: car.registrationNumber?.split("-")?.[0]?.toUpperCase() || "N/A",
      unit: "",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Make Year",
      value: String(car.year),
      unit: "",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Ownership",
      value: toTitleCase(car.owners),
      unit: "",
    },
    {
      icon: <Paintbrush className="h-5 w-5" />,
      label: "Colour",
      value: toTitleCase(car.color) || "N/A",
      unit: "",
    },
    {
      icon: <Car className="h-5 w-5" />,
      label: "Body Type",
      value: toTitleCase(car.bodyType),
      unit: "",
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-[#1b1b24] mb-5 font-display">
        Key Specifications
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {specTiles.slice(0, 4).map((s) => (
          <div
            key={s.label}
            // Use solid bg-white instead of bg-white/80 and backdrop-blur-sm for clean contrast and professional feel
            className="flex flex-col gap-2 p-4 rounded-xl border border-neutral-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="p-2 bg-[#3525cd]/10 rounded-lg text-[#3525cd] w-fit">
              {s.icon}
            </div>
            <span className="text-[10px] font-semibold text-[#777587] uppercase tracking-wider">
              {s.label}
            </span>
            <span className="text-base font-bold text-[#1b1b24]">
              {s.value}
              {s.unit && (
                <span className="text-sm font-medium text-[#777587] ml-1">
                  {s.unit}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        {specTiles.slice(4, 8).map((s) => (
          <div
            key={s.label}
            // Use solid bg-white and custom border-neutral-200/80 to ensure excellent readability and modern minimalist card look
            className="flex flex-col gap-2 p-4 rounded-xl border border-neutral-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="p-2 bg-[#3525cd]/10 rounded-lg text-[#3525cd] w-fit">
              {s.icon}
            </div>
            <span className="text-[10px] font-semibold text-[#777587] uppercase tracking-wider">
              {s.label}
            </span>
            <span className="text-base font-bold text-[#1b1b24]">
              {s.value}
              {s.unit && (
                <span className="text-sm font-medium text-[#777587] ml-1">
                  {s.unit}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
