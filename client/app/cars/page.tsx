/**
 * Cars Listing Page — Server Component (RSC)
 *
 * WHAT: Category standard used car search engine for Hyderabad buyers.
 * WHY: Renders initial listings on the server (SSR) for instant first paint and SEO,
 *      passing hydrated data to CarsCatalogClient for instant interactivity.
 */

import React, { Suspense } from "react";
import type { Metadata } from "next";
import type { ApiCar } from "@/lib/api-types";
import { API_BASE } from "@/lib/api-base";
import CarsCatalogClient from "@/components/cars/CarsCatalogClient";
import type { FilterState } from "@/components/cars/CarsFilterSidebar";

interface CarsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function generateMetadata({ searchParams }: CarsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const brand = typeof params.brand === "string" ? params.brand : "";
  const bodyType = typeof params.bodyType === "string" ? params.bodyType.toUpperCase() : "";

  let title = "Used Cars in Hyderabad | Verified Hyderabad Dealers | KarBik";
  if (brand && bodyType) {
    title = `Used ${brand} ${bodyType}s in Hyderabad | KarBik`;
  } else if (brand) {
    title = `Used ${brand} Cars in Hyderabad | KarBik`;
  } else if (bodyType) {
    title = `Used ${bodyType}s in Hyderabad | KarBik`;
  }

  return {
    title,
    description:
      "Browse certified pre-owned cars from verified dealers in Hyderabad. Real photos, RC verified papers, and direct support.",
  };
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  // In Next.js 16, searchParams is a Promise that must be awaited
  const resolvedParams = await searchParams;

  const getParam = (key: string): string => {
    const val = resolvedParams[key];
    if (Array.isArray(val)) return val[0] || "";
    return typeof val === "string" ? val : "";
  };

  const initialFilters: FilterState = {
    search: getParam("search"),
    brand: getParam("brand"),
    fuelType: getParam("fuelType"),
    transmission: getParam("transmission"),
    bodyType: getParam("bodyType"),
    owners: getParam("owners"),
    minPrice: getParam("minPrice"),
    maxPrice: getParam("maxPrice"),
    maxMileage: getParam("maxMileage"),
    sort: getParam("sort") || "newest",
    page: Number(getParam("page")) || 1,
  };

  // Build query string for initial server-side fetch
  const query = new URLSearchParams();
  Object.entries(initialFilters).forEach(([k, v]) => {
    if (v && String(v).trim() !== "" && v !== "newest") {
      query.set(k, String(v));
    }
  });
  query.set("limit", "12");

  const [carsData, brandList] = await Promise.all([
    getJson<{ cars?: ApiCar[]; total?: number }>((`/api/cars?${query.toString()}`), {}),
    getJson<string[]>("/api/cars/brands", []),
  ]);

  const initialCars: ApiCar[] = carsData.cars ?? [];
  const initialTotal: number = carsData.total ?? initialCars.length;
  const initialTotalPages = Math.ceil(initialTotal / 12) || 1;
  const initialBrands = Array.isArray(brandList) ? brandList : [];

  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <CarsCatalogClient
        initialCars={initialCars}
        initialTotal={initialTotal}
        initialTotalPages={initialTotalPages}
        initialBrands={initialBrands}
        initialFilters={initialFilters}
      />
    </Suspense>
  );
}
