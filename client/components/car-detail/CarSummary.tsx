/**
 * The first thing under the gallery: what the car is, what it costs, and who
 * stands behind it. Title, one spec line, price in lakh with its Est. EMI, the
 * badges that are true, and the dealer-behind-KarBik line. No dealer name.
 */

import React from "react";
import { Award, MessageCircle, ShieldCheck } from "lucide-react";
import type { ApiCar, BuyerDealerSummary } from "@/lib/api-types";
import { displayCarName } from "@/lib/car-name";
import { formatKm, formatPrice, toTitleCase } from "@/lib/car-format";
import { calculateEmi, emiAssumption } from "@/lib/emi";

export default function CarSummary({
  car,
  dealer,
  showPrice = true,
}: {
  car: ApiCar;
  dealer: BuyerDealerSummary | null;
  showPrice?: boolean;
}) {
  const name = displayCarName(car);
  const variant =
    car.variant && !name.toLowerCase().includes(car.variant.toLowerCase()) ? car.variant : "";
  const specs = [formatKm(car.mileage), toTitleCase(car.fuelType), toTitleCase(car.transmission), toTitleCase(car.owners)].filter(Boolean);
  const emi = calculateEmi(car.price);
  const city = dealer?.city || car.city || "Hyderabad";
  const dealerLine = dealer?.isVerified ? `Verified dealer · ${city}` : `Hyderabad dealer · ${city}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {car.rcVerified && (
          <span className="inline-flex items-center gap-1 rounded-md bg-success-700 px-2 py-1 text-xs font-bold text-white">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            RC Verified
          </span>
        )}
        {car.isBoosted && (
          <span className="inline-flex items-center gap-1 rounded-md border border-border-strong bg-surface px-2 py-1 text-xs font-bold text-ink">
            <Award className="h-3.5 w-3.5 text-accent-700" aria-hidden />
            Featured
          </span>
        )}
        {dealer?.isSample && (
          <span className="rounded-md border border-border-strong bg-surface px-2 py-1 text-xs font-bold text-ink">
            Sample listing
          </span>
        )}
      </div>

      <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-ink-strong text-balance sm:text-3xl">
        {name}
      </h1>
      {variant && <p className="mt-1 text-sm text-ink-muted">{variant}</p>}
      {specs.length > 0 && (
        <p className="mt-2 text-sm font-semibold text-ink tabular-nums">{specs.join(" · ")}</p>
      )}

      {showPrice && (
        <div className="mt-4">
          <p className="text-3xl font-extrabold leading-none tracking-tight text-ink-strong tabular-nums">
            {formatPrice(car.price)}
          </p>
          {emi > 0 && (
            <p className="mt-1.5 text-xs text-ink-muted tabular-nums" title={emiAssumption()}>
              Est. EMI ₹{emi.toLocaleString("en-IN")}/mo ·{" "}
              <a href="#emi" className="font-semibold text-primary-600 underline-offset-2 hover:underline">
                How it&apos;s worked out
              </a>
            </p>
          )}
        </div>
      )}

      <div className="mt-5 flex items-start gap-3 border-y border-border py-3">
        <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden />
        <p className="text-sm text-ink">
          <span className="font-semibold text-ink-strong">{dealerLine}.</span>{" "}
          KarBik support talks to you first, then connects you with the dealer.
        </p>
      </div>
    </div>
  );
}
