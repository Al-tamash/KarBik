/** Display helpers for a single car, shared by the detail page components. */

// Codes a buyer reads as letters ("CVT", not "Cvt").
const ACRONYMS = new Set(["CVT", "AMT", "DCT", "DSG", "AT", "MT", "IMT", "CNG", "LPG", "EV", "SUV", "MUV"]);

export function toTitleCase(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
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

/** Lakh / crore, the way Indian buyers read car prices ("₹7.80 Lakh"). */
export function formatPrice(price: number | null | undefined): string {
  if (!price) return "Price on request";
  if (price >= 1_00_00_000) return `₹${(price / 1_00_00_000).toFixed(2)} Cr`;
  if (price >= 1_00_000) return `₹${(price / 1_00_000).toFixed(2)} Lakh`;
  return `₹${price.toLocaleString("en-IN")}`;
}

/** "27,000 km"; empty string when the odometer was not entered. */
export function formatKm(km: number | null | undefined): string {
  if (km === null || km === undefined) return "";
  const n = Number(km);
  if (Number.isNaN(n)) return "";
  return `${n.toLocaleString("en-IN")} km`;
}

/** First 10-digit Indian mobile in `phone`, or null. */
export function normalizeIndianMobile(phone: string | null | undefined): string | null {
  const digits = String(phone || "").replace(/\D/g, "");
  const without = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(without)) return null;
  return without;
}
