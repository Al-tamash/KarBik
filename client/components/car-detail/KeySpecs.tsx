import React from "react";
import type { ApiCar } from "@/lib/api-types";
import { formatKm, toTitleCase } from "@/lib/car-format";

/**
 * Key facts as plain label / value rows. Only fields the dealer filled in;
 * never the registration number.
 */
export default function KeySpecs({ car }: { car: ApiCar }) {
  const rows: Array<[string, string]> = [
    ["Year", car.year ? String(car.year) : ""],
    ["Kilometres driven", formatKm(car.mileage)],
    ["Fuel", toTitleCase(car.fuelType)],
    ["Transmission", toTitleCase(car.transmission)],
    ["Owners", toTitleCase(car.owners)],
    ["Body type", toTitleCase(car.bodyType)],
    ["Colour", car.color ?? ""],
    ["Engine", car.engineCC && car.engineCC > 0 ? `${car.engineCC.toLocaleString("en-IN")} cc` : ""],
    ["Power", car.power ?? ""],
    ["Ground clearance", car.groundClearance ?? ""],
    ["Mileage (rated)", car.certifiedMileage ?? ""],
  ];
  const filled = rows.filter(([, v]) => v);

  return (
    <dl className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
      {filled.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-4 border-b border-border py-3">
          <dt className="text-sm text-ink-muted">{label}</dt>
          <dd className="text-right text-sm font-semibold text-ink-strong tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
