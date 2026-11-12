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

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** "Comprehensive till Aug 2026" → true when that month has already ended. */
export function insuranceHasLapsed(text: string, now: Date = new Date()): boolean {
  const m = text.match(/till\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/i);
  if (!m) return false;
  const month = MONTHS[m[1].toLowerCase()];
  if (month === undefined) return false;
  const endOfMonth = new Date(Number(m[2]), month + 1, 0, 23, 59, 59);
  return endOfMonth < now;
}

/**
 * What a mobile-number field keeps as the buyer types or pastes. A pasted "+91 98765 43210"
 * or an autofilled "098765 43210" must become 9876543210; cutting it to 10 digits first
 * would turn the former into a different, valid-looking number (9198765432).
 */
export function cleanMobileInput(raw: string): string {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}
