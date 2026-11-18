"use client";

/**
 * The three facts a dealer states about a car, as the car page shows them under "Checks on this
 * car": accident history, service records, insurance. Used by the add-car wizard and the edit page.
 *
 * - Accident history is a required choice with NO default. It used to be a checkbox labelled
 *   "No accident history" that saved `true`, which the car page reads as "Accident reported",
 *   and an unanswered box meant "No accident reported". Now the dealer picks one, and the value
 *   saved is true only for "An accident was reported".
 * - Insurance is a month and a year (two selects, so it works in every browser and on every
 *   phone). It is stored as "Valid till March 2026", the format the car page reads to tell when a
 *   policy has passed (lib/car-format.ts).
 * - RC is not a field: KarBik checks it and adds the RC Verified mark itself.
 */

import React, { useState } from "react";
import { insuranceFromMonth, insuranceHasLapsed, monthFromInsurance } from "@/lib/car-format";

export type AccidentChoice = "" | "none" | "reported";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const THIS_YEAR = new Date().getFullYear();

export default function CarChecksFields({
  accident,
  onAccident,
  serviceHistory,
  onServiceHistory,
  insuranceValid,
  onInsuranceValid,
  accidentError,
}: {
  accident: AccidentChoice;
  onAccident: (value: AccidentChoice) => void;
  serviceHistory: boolean;
  onServiceHistory: (value: boolean) => void;
  insuranceValid: string;
  onInsuranceValid: (value: string) => void;
  accidentError?: string;
}) {
  const parsed = monthFromInsurance(insuranceValid);
  // Until both a month and a year are chosen nothing is stored; the half-chosen value lives here.
  const [partial, setPartial] = useState({ m: "", y: "" });
  const m = parsed ? parsed.slice(5, 7) : partial.m;
  const y = parsed ? parsed.slice(0, 4) : partial.y;

  const hasUnreadableText = insuranceValid.trim() !== "" && parsed === "";
  const passed = insuranceValid.trim() !== "" && insuranceHasLapsed(insuranceValid);

  const years: number[] = [];
  for (let yr = THIS_YEAR - 3; yr <= THIS_YEAR + 7; yr++) years.push(yr);
  if (y && !years.includes(Number(y))) years.push(Number(y));
  years.sort((a, b) => a - b);

  function change(nextM: string, nextY: string) {
    if (nextM && nextY) {
      setPartial({ m: "", y: "" });
      onInsuranceValid(insuranceFromMonth(`${nextY}-${nextM}`));
    } else {
      setPartial({ m: nextM, y: nextY });
      if (parsed) onInsuranceValid("");
    }
  }

  return (
    <div className="space-y-6">
      <fieldset aria-describedby={accidentError ? "accident-hint accident-error" : "accident-hint"}>
        <legend className="label">Accident history</legend>
        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:gap-6">
          {(
            [
              ["none", "No accident reported"],
              ["reported", "An accident was reported"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
              <input
                type="radio"
                name="accident"
                value={value}
                checked={accident === value}
                onChange={() => onAccident(value)}
                className="h-5 w-5 accent-primary-600"
              />
              {label}
            </label>
          ))}
        </div>
        <p id="accident-hint" className="helper-text">
          Buyers see this on the car page as reported by you. Choose what is true.
        </p>
        {accidentError && (
          <p id="accident-error" role="alert" className="error-text">
            {accidentError}
          </p>
        )}
      </fieldset>

      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={serviceHistory}
          onChange={(e) => onServiceHistory(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary-600"
        />
        <span>
          Service records are available
          <span className="block text-ink-muted">Left unticked, the car page says &quot;Not provided&quot;.</span>
        </span>
      </label>

      <fieldset>
        <legend className="label">Insurance valid till</legend>
        <div className="mt-1 flex gap-3">
          <div className="flex-1">
            <label htmlFor="insurance-month" className="sr-only">
              Month
            </label>
            <select id="insurance-month" className="select" value={m} onChange={(e) => change(e.target.value, y)}>
              <option value="">Month</option>
              {MONTHS.map((name, i) => (
                <option key={name} value={String(i + 1).padStart(2, "0")}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label htmlFor="insurance-year" className="sr-only">
              Year
            </label>
            <select id="insurance-year" className="select" value={y} onChange={(e) => change(m, e.target.value)}>
              <option value="">Year</option>
              {years.map((yr) => (
                <option key={yr} value={String(yr)}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
        {hasUnreadableText && (
          <p className="helper-text">Saved as &quot;{insuranceValid}&quot;. Pick a month and year to replace it.</p>
        )}
        {passed && <p className="helper-text">This month has passed. The car page will show it as passed.</p>}
        {!hasUnreadableText && !passed && <p className="helper-text">Leave both empty if you do not know.</p>}
      </fieldset>

      <p className="text-sm text-ink-muted">
        RC: KarBik checks the registration certificate itself. The RC Verified mark is added after that check.
      </p>
    </div>
  );
}
