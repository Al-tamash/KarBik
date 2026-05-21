/**
 * Data Validation Schemas (Zod)
 *
 * We use Zod to define "contracts" for our data.
 * If a request comes in with wrong types or missing fields,
 * Zod catches it before we even talk to MongoDB.
 */
import { z } from "zod";

// --- Car Validation ---

// Schema for searching cars (Query Parameters)
export const searchCarsSchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'cng', 'hybrid', 'lpg']).optional(),
  transmission: z.enum(['manual', 'automatic', 'cvt', 'amt']).optional(),
  bodyType: z.enum(['hatchback', 'sedan', 'suv', 'muv', 'coupe', 'convertible', 'pickup', 'van']).optional(),
  owners: z.enum(['1st owner', '2nd owner', '3rd owner', '4th owner or more']).optional(),
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

// Schema for creating a car (Request Body)
export const createCarSchema = z.object({
  title: z.string().min(1).max(120),
  brand: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().optional().default(""),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(0),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'cng', 'hybrid', 'lpg']),
  transmission: z.enum(['manual', 'automatic', 'cvt', 'amt']),
  bodyType: z.enum(['hatchback', 'sedan', 'suv', 'muv', 'coupe', 'convertible', 'pickup', 'van']),
  mileage: z.coerce.number().min(0),
  color: z.string().min(1),
  owners: z.enum(['1st owner', '2nd owner', '3rd owner', '4th owner or more']),
  city: z.string().min(1),
  registrationNumber: z.string().optional().default(""),
  insuranceValid: z.string().optional().default(""),
  rcVerified: z.union([z.boolean(), z.string()]).transform(val => val === true || val === "true"),
  accidentHistory: z.union([z.boolean(), z.string()]).transform(val => val === true || val === "true"),
  serviceHistory: z.union([z.boolean(), z.string()]).transform(val => val === true || val === "true"),
  description: z.string().max(2000).optional().default(""),
  
  // New specification & features fields (Phase 13)
  engineCC: z.coerce.number().nullable().optional().default(null),
  power: z.string().optional().default(""),
  groundClearance: z.string().optional().default(""),
  certifiedMileage: z.string().optional().default(""),
  
  // Custom union handles both parsed objects and JSON string inputs from FormData
  features: z.union([
    z.string().transform(val => {
      try {
        return JSON.parse(val);
      } catch (e) {
        return { comfort: [], safety: [], interior: [], exterior: [] };
      }
    }),
    z.object({
      comfort: z.array(z.string()).optional().default([]),
      safety: z.array(z.string()).optional().default([]),
      interior: z.array(z.string()).optional().default([]),
      exterior: z.array(z.string()).optional().default([]),
    })
  ]).optional().default({}),
});

// Schema for updating a car (Partial body)
export const updateCarSchema = createCarSchema.partial();
