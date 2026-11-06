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
  title: z.string().min(1).max(120),
  brand: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().optional().default(""),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(0),
  fuelType: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSIONS),
  bodyType: z.enum(BODY_TYPES),
  mileage: z.coerce.number().min(0),
  color: z.string().min(1),
  owners: z.enum(OWNER_OPTIONS),
  city: z.string().min(1),
  registrationNumber: z.string().optional().default(""),
  insuranceValid: z.string().optional().default(""),
  rcVerified: boolLike.optional().default(false),
  accidentHistory: boolLike.optional().default(false),
  serviceHistory: boolLike.optional().default(false),
  description: z.string().max(2000).optional().default(""),

  engineCC: z.coerce.number().nullable().optional().default(null),
  power: z.string().optional().default(""),
  groundClearance: z.string().optional().default(""),
  certifiedMileage: z.string().optional().default(""),

  features: z.unknown().optional().transform((value) =>
    value === undefined ? undefined : normalizeFeatures(value)
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
