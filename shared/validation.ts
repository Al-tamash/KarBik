import { z } from "zod";
import {
  BODY_TYPES,
  FUEL_TYPES,
  OWNER_OPTIONS,
  TRANSMISSIONS,
  emptyCarFeatures,
  type CarFeatures,
} from "./types";

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function normalizeFeatures(value: unknown): CarFeatures {
  const base = emptyCarFeatures();
  const obj = parseMaybeJson(value);
  if (!obj || typeof obj !== "object") return base;
  const record = obj as Record<string, unknown>;
  for (const key of ["comfort", "safety", "interior", "exterior"] as const) {
    const val = record[key];
    if (Array.isArray(val)) {
      base[key] = val.filter((v): v is string => typeof v === "string");
    }
  }
  return base;
}

const boolLike = z
  .union([z.boolean(), z.string()])
  .transform((val) => val === true || val === "true");

// --- Contact details in dealer-written text ---

/**
 * A phone number, email or link typed into a listing lets a buyer skip KarBik (PRODUCT.md), so
 * these are refused when the text is saved, not just hidden when it is shown (the display-time
 * scrub in lib/buyer-car.ts stays as a second line). Returns what was found, or null.
 *
 * The phone patterns are a mobile number (10 digits starting 6 to 9, with an optional +91, 91 or 0)
 * in the usual groupings. Lists of years ("2019 2020 2021"), prices and specs do not match.
 */
export function findContactDetails(text: string | null | undefined): "phone number" | "email" | "link" | null {
  // Fullwidth and other lookalike digits become ASCII, and zero-width characters (used to break a
  // number up) are dropped, before anything is matched.
  const value = String(text ?? "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
  if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(value)) return "email";
  if (/https?:\/\/\S+|www\.\S+|\bwa\.me\b|\b[a-z0-9-]+\.(?:com|in|co|net|org|me|ly|io)\b/i.test(value)) return "link";
  if (/(?<![\w])@[a-z0-9_.]{3,}/i.test(value)) return "link";
  const SEP = "[\\s.-]";
  const phone = [
    // 9876543210, 98765 43210, +919876543210, 919876543210, 09876543210, +91-98765-43210
    new RegExp(`(?<!\\d)(?:(?:\\+?91|0)${SEP}?)?[6-9]\\d{4}${SEP}?\\d{5}(?!\\d)`),
    // groups that need their separators, so a price followed by a year ("950000 2019") never matches
    new RegExp(`(?<!\\d)[6-9]\\d{2}${SEP}\\d{3}${SEP}\\d{4}(?!\\d)`), // 987-654-3210
    new RegExp(`(?<!\\d)[6-9]\\d{3}${SEP}\\d{3}${SEP}\\d{3}(?!\\d)`), // 9876 543 210
    new RegExp(`(?<!\\d)[6-9]\\d${SEP}\\d{2}${SEP}\\d{2}${SEP}\\d{2}${SEP}\\d{2}(?!\\d)`), // 98 76 54 32 10
  ];
  if (phone.some((re) => re.test(value))) return "phone number";
  return null;
}

export const CONTACT_DETAILS_MESSAGE =
  "Remove phone numbers, emails and links. Buyers reach you through KarBik support.";

/** A zod string check for fields a buyer reads. */
const noContactDetails = (value: string) => findContactDetails(value) === null;

// --- Car Validation ---

export const searchCarsSchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  fuelType: z.enum(FUEL_TYPES).optional(),
  transmission: z.enum(TRANSMISSIONS).optional(),
  bodyType: z.enum(BODY_TYPES).optional(),
  owners: z.enum(OWNER_OPTIONS).optional(),
  minYear: z.coerce.number().min(1900).optional(),
  maxYear: z.coerce.number().max(new Date().getFullYear() + 1).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  maxMileage: z.coerce.number().min(0).optional(),
  sort: z.enum(["price_asc", "price_desc", "year_desc", "newest"]).optional(),
  location: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export const createCarSchema = z.object({
  title: z.string().min(1).max(120).refine(noContactDetails, CONTACT_DETAILS_MESSAGE),
  brand: z.string().min(1).refine(noContactDetails, CONTACT_DETAILS_MESSAGE),
  model: z.string().min(1).refine(noContactDetails, CONTACT_DETAILS_MESSAGE),
  variant: z.string().refine(noContactDetails, CONTACT_DETAILS_MESSAGE).optional().default(""),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(0),
  fuelType: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSIONS),
  bodyType: z.enum(BODY_TYPES),
  mileage: z.coerce.number().min(0),
  color: z.string().min(1).refine(noContactDetails, CONTACT_DETAILS_MESSAGE),
  owners: z.enum(OWNER_OPTIONS),
  city: z.string().min(1).refine(noContactDetails, CONTACT_DETAILS_MESSAGE),
  registrationNumber: z.string().optional().default(""),
  insuranceValid: z.string().optional().default(""),
  rcVerified: boolLike.optional().default(false),
  accidentHistory: boolLike.optional().default(false),
  serviceHistory: boolLike.optional().default(false),
  description: z.string().max(2000).refine(noContactDetails, CONTACT_DETAILS_MESSAGE).optional().default(""),

  engineCC: z.coerce.number().nullable().optional().default(null),
  power: z.string().refine(noContactDetails, CONTACT_DETAILS_MESSAGE).optional().default(""),
  groundClearance: z.string().refine(noContactDetails, CONTACT_DETAILS_MESSAGE).optional().default(""),
  certifiedMileage: z.string().refine(noContactDetails, CONTACT_DETAILS_MESSAGE).optional().default(""),

  features: z
    .unknown()
    .optional()
    .transform((value) => (value === undefined ? undefined : normalizeFeatures(value)))
    .refine(
      (f) => f === undefined || Object.values(f).flat().every((item) => noContactDetails(item)),
      CONTACT_DETAILS_MESSAGE
    ),
});

export const updateCarSchema = createCarSchema.partial();

export function stripUndefined<T extends Record<string, unknown>>(
  input: T
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}

export type SearchCarsInput = z.infer<typeof searchCarsSchema>;
export type CreateCarInput = z.infer<typeof createCarSchema>;
export type UpdateCarInput = z.infer<typeof updateCarSchema>;
