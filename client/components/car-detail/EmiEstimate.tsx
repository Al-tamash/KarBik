"use client";

import React, { useState } from "react";
import {
  EMI_DEFAULT_DOWN_PERCENT,
  EMI_DEFAULT_MONTHS,
  EMI_DISCLAIMER,
  EMI_RATE_PERCENT,
  calculateEmi,
} from "@/lib/emi";

/**
 * EMI estimate. Starts from the same assumptions as the "Est. EMI" on the cards
 * (20% down, 5 years, 10.8% a year) so the numbers always agree, and lets the
 * buyer move down payment and tenure. An estimate, never an offer.
 */
export default function EmiEstimate({ price }: { price: number }) {
  const [down, setDown] = useState(EMI_DEFAULT_DOWN_PERCENT);
  const [months, setMonths] = useState(EMI_DEFAULT_MONTHS);

  const emi = calculateEmi(price, down, months);
  const downAmount = price * (down / 100);
  const loan = Math.max(0, price - downAmount);
  const lakh = (n: number) => `₹${(n / 100000).toFixed(2)} Lakh`;

  return (
    <div className="grid gap-8 sm:grid-cols-[1fr_1.2fr] sm:items-start">
      <div>
        <p className="text-sm text-ink-muted">Estimated monthly EMI</p>
        <p className="mt-1 text-4xl font-extrabold leading-none tracking-tight text-ink-strong tabular-nums">
          ₹{emi.toLocaleString("en-IN")}
          <span className="ml-1 text-base font-semibold text-ink-muted">/month</span>
        </p>
        <p className="mt-3 text-sm text-ink-muted tabular-nums">
          Loan {lakh(loan)} at {EMI_RATE_PERCENT}% a year for {months / 12} {months / 12 === 1 ? "year" : "years"}.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <label htmlFor="emi-down" className="font-semibold text-ink-strong">
              Down payment
            </label>
            <span className="text-ink tabular-nums">
              {lakh(downAmount)} ({down}%)
            </span>
          </div>
          <div className="flex min-h-11 items-center">
            <input
              id="emi-down"
              type="range"
              min={10}
              max={60}
              step={5}
              value={down}
              onChange={(e) => setDown(Number(e.target.value))}
              className="h-11 w-full cursor-pointer accent-primary-600"
            />
          </div>
          <div className="flex justify-between text-xs text-ink-subtle">
            <span>10%</span>
            <span>60%</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between text-sm">
            <label htmlFor="emi-tenure" className="font-semibold text-ink-strong">
              Loan tenure
            </label>
            <span className="text-ink tabular-nums">
              {months / 12} {months / 12 === 1 ? "year" : "years"}
            </span>
          </div>
          <div className="flex min-h-11 items-center">
            <input
              id="emi-tenure"
              type="range"
              min={12}
              max={84}
              step={12}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="h-11 w-full cursor-pointer accent-primary-600"
            />
          </div>
          <div className="flex justify-between text-xs text-ink-subtle">
            <span>1 year</span>
            <span>7 years</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-muted sm:col-span-2">{EMI_DISCLAIMER}</p>
    </div>
  );
}
