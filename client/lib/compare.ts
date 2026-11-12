/**
 * Turns up to three cars into the rows of the compare table.
 *
 * Pure functions, no React: what each cell says, which rows differ between the
 * cars, and which features only some of them have. Missing data reads
 * "Not provided"; nothing is filled in with a guess (PRODUCT.md truth rules).
 * There is no "best" or "winner": a difference is shown, never judged.
 */

import type { ApiCar } from "@/lib/api-types";
import { formatKm, insuranceHasLapsed, toTitleCase } from "@/lib/car-format";
import { calculateEmi, emiAssumption } from "@/lib/emi";

export const MAX_COMPARE = 3;
export const NOT_PROVIDED = "Not provided";

export type CompareCell = {
  text: string;
  /** Short second line, e.g. "Date has passed". */
  note?: string;
  /** Nothing was recorded for this car. */
  missing?: boolean;
  /** KarBik itself checked this (RC only). The only green in the table. */
  verified?: boolean;
  /** Something the buyer should look at twice (accident reported, lapsed insurance). */
  warn?: boolean;
};

export type CompareRow = {
  key: string;
  label: string;
  cells: CompareCell[];
  /** The cars do not all say the same thing here. */
  differs: boolean;
};

export type CompareGroup = {
  key: string;
  title: string;
  /** One honest line under the group, e.g. the EMI assumptions. */
  note?: string;
  rows: CompareRow[];
};

export type FeatureRow = { key: string; label: string; has: boolean[]; differs: boolean };
export type FeatureGroup = { key: string; title: string; rows: FeatureRow[] };

const text = (value: string | number | null | undefined): CompareCell =>
  value === null || value === undefined || String(value).trim() === ""
    ? { text: NOT_PROVIDED, missing: true }
    : { text: String(value).trim() };

function row(key: string, label: string, cells: CompareCell[]): CompareRow {
  const distinct = new Set(cells.map((c) => c.text.toLowerCase()));
  return { key, label, cells, differs: distinct.size > 1 };
}

/** A row nobody recorded anything for says nothing, so it is left out. */
const hasInfo = (r: CompareRow) => r.cells.some((c) => !c.missing);

export function buildCompareGroups(cars: ApiCar[]): CompareGroup[] {
  const each = (fn: (car: ApiCar) => CompareCell) => cars.map(fn);

  const hasReportFor = (car: ApiCar) => Boolean(car.isInspected && car.inspectionReport?.url);
  const anyReport = cars.some(hasReportFor);

  const groups: CompareGroup[] = [
    {
      key: "price",
      title: "EMI estimate",
      note: emiAssumption(),
      rows: [
        row(
          "emi",
          "Est. EMI",
          each((c) => {
            const emi = calculateEmi(c.price);
            return emi > 0 ? { text: `₹${emi.toLocaleString("en-IN")}/mo` } : { text: NOT_PROVIDED, missing: true };
          }),
        ),
      ],
    },
    {
      key: "basics",
      title: "Basics",
      rows: [
        row("year", "Year", each((c) => text(c.year))),
        row("km", "Driven", each((c) => text(formatKm(c.mileage)))),
        row("owners", "Owners", each((c) => text(toTitleCase(c.owners)))),
        row("fuel", "Fuel", each((c) => text(toTitleCase(c.fuelType)))),
        row("gearbox", "Gearbox", each((c) => text(toTitleCase(c.transmission)))),
        row("body", "Body type", each((c) => text(toTitleCase(c.bodyType)))),
        row("colour", "Colour", each((c) => text(toTitleCase(c.color)))),
      ],
    },
    {
      key: "engine",
      title: "Engine",
      rows: [
        row("cc", "Displacement", each((c) => text(c.engineCC && c.engineCC > 0 ? `${c.engineCC.toLocaleString("en-IN")} cc` : ""))),
        row("power", "Power", each((c) => text(c.power))),
        row("clearance", "Ground clearance", each((c) => text(c.groundClearance))),
      ],
    },
    {
      key: "checks",
      title: "Checks on the car",
      note: "KarBik checks the RC. The other items are reported by the dealer.",
      rows: [
        row(
          "rc",
          "Registration (RC)",
          each((c) => (c.rcVerified ? { text: "RC Verified", verified: true } : { text: "Not checked yet", missing: true })),
        ),
        row(
          "accident",
          "Accident history",
          each((c) => (c.accidentHistory ? { text: "Accident reported", warn: true } : { text: "No accident reported" })),
        ),
        row(
          "service",
          "Service history",
          each((c) => (c.serviceHistory ? { text: "Record available" } : { text: NOT_PROVIDED, missing: true })),
        ),
        row(
          "insurance",
          "Insurance",
          each((c) => {
            const insurance = (c.insuranceValid ?? "").trim();
            if (!insurance) return { text: NOT_PROVIDED, missing: true };
            return insuranceHasLapsed(insurance)
              ? { text: insurance, note: "Date has passed", warn: true }
              : { text: insurance };
          }),
        ),
        ...(anyReport
          ? [
              row(
                "report",
                "Inspection report",
                each((c) => (hasReportFor(c) ? { text: "Report available" } : { text: NOT_PROVIDED, missing: true })),
              ),
            ]
          : []),
      ],
    },
  ];

  return groups
    .map((g) => ({ ...g, rows: g.rows.filter(hasInfo) }))
    .filter((g) => g.rows.length > 0);
}

const FEATURE_ORDER: Array<[keyof ApiCar["features"], string]> = [
  ["safety", "Safety"],
  ["comfort", "Comfort"],
  ["exterior", "Exterior"],
  ["interior", "Interior"],
];

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Features by category. A feature is matched across cars by its normalised name, so
 * "Cruise Control" and "cruise  control" are one row. A row says which cars have it.
 */
export function buildFeatureGroups(cars: ApiCar[]): FeatureGroup[] {
  const groups: FeatureGroup[] = [];
  for (const [category, title] of FEATURE_ORDER) {
    const seen = new Map<string, { label: string; has: boolean[] }>();
    cars.forEach((car, i) => {
      for (const raw of car.features?.[category] ?? []) {
        const key = norm(raw);
        if (!key) continue;
        const entry = seen.get(key) ?? { label: raw.trim(), has: cars.map(() => false) };
        entry.has[i] = true;
        seen.set(key, entry);
      }
    });
    if (seen.size === 0) continue;
    const rows: FeatureRow[] = [...seen.entries()].map(([key, v]) => ({
      key: `${category}:${key}`,
      label: v.label,
      has: v.has,
      differs: v.has.some((h) => h !== v.has[0]),
    }));
    groups.push({ key: category, title, rows });
  }
  return groups;
}
