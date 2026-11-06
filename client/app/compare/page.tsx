"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Fuel, Settings, Gauge, Calendar, IndianRupee, Search, Car } from "lucide-react";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import type { ApiCar } from "@/lib/api-types";



/**
 * ComparePage — Side-by-side comparison of selected cars
 *
 * Logic:
 * - Reads selected car IDs from localStorage
 * - Fetches details for all IDs
 * - Displays a comparison table
 */
export default function ComparePage() {
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSelectedCars = async () => {
      const selectedIds = JSON.parse(localStorage.getItem("compareCars") || "[]") as string[];
      if (selectedIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all selected cars in parallel
        const promises = selectedIds.map((id: string) => fetch(`/api/cars/${id}`).then(res => res.json()));
        const data = await Promise.all(promises);
        setCars(data.filter((c): c is ApiCar => Boolean(c) && !("message" in c))); // Filter out errors
      } catch (err) {
        console.error("Comparison fetch failed:", err);
      }
      setLoading(false);
    };

    fetchSelectedCars();
  }, []);

  const removeCar = (id: string) => {
    const updated = cars.filter(c => c.id !== id);
    setCars(updated);
    localStorage.setItem("compareCars", JSON.stringify(updated.map(c => c.id)));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-alt">
        <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <Link href="/cars" className="flex items-center gap-2 text-sm font-bold text-ink-subtle hover:text-primary-600 transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Inventory
            </Link>
            <h1 className="text-4xl font-black text-ink-strong tracking-tighter">Compare Listings</h1>
          </div>
          <div className="text-right">
             <p className="text-xs font-black text-ink-subtle uppercase tracking-widest">{cars.length} Cars Selected</p>
          </div>
        </div>

        {cars.length === 0 ? (
          <div className="rounded-2xl bg-surface p-12 md:p-20 text-center border border-border shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-surface-alt flex items-center justify-center mx-auto mb-6">
              <Search className="h-8 w-8 text-ink-subtle" />
            </div>
            <h2 className="text-2xl font-black text-ink-strong mb-4">No cars selected for comparison</h2>
            <p className="text-ink-muted mb-8 max-w-sm mx-auto font-medium">Add some cars from the inventory to see them side-by-side.</p>
            <Link href="/cars" className="inline-block rounded-2xl bg-primary-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-primary-500/10 hover:bg-primary-700 transition-all">
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-64 p-8 text-left bg-surface-alt/60 border-r border-border">
                    <span className="text-xs font-black uppercase tracking-widest text-ink-subtle">Specifications</span>
                  </th>
                  {cars.map((car) => (
                    <th key={car.id} className="p-8 min-w-[300px] relative border-r border-border last:border-r-0">
                      <button 
                        onClick={() => removeCar(car.id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-surface-alt text-ink-subtle hover:bg-danger-50 hover:text-danger-500 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-surface-alt">
                        {car.images?.length > 0 ? (
                          <Image 
                            loader={cloudinaryLoader}
                            src={car.images[0].url}
                            alt={car.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-surface-alt">
                            <Car className="h-10 w-10 text-border-strong" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-ink-strong leading-tight">{car.title}</h3>
                      <p className="text-2xl font-black text-primary-600 mt-2">₹{car.price?.toLocaleString("en-IN")}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm font-bold text-ink-muted">
                {/* Year */}
                <tr className="border-t border-border">
                  <td className="p-6 bg-surface-alt/40 border-r border-border flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-ink-subtle" /> Year
                  </td>
                  {cars.map(car => (
                    <td key={car.id} className="p-6 text-center border-r border-border last:border-r-0 text-ink-strong">
                      {car.year}
                    </td>
                  ))}
                </tr>
                {/* Brand */}
                <tr className="border-t border-border">
                  <td className="p-6 bg-surface-alt/40 border-r border-border flex items-center gap-3">
                    <ArrowLeft className="h-4 w-4 rotate-180 text-ink-subtle" /> Brand
                  </td>
                  {cars.map(car => (
                    <td key={car.id} className="p-6 text-center border-r border-border last:border-r-0 text-ink-strong">
                      {car.brand}
                    </td>
                  ))}
                </tr>
                {/* Fuel Type */}
                <tr className="border-t border-border">
                  <td className="p-6 bg-surface-alt/40 border-r border-border flex items-center gap-3">
                    <Fuel className="h-4 w-4 text-ink-subtle" /> Fuel
                  </td>
                  {cars.map(car => (
                    <td key={car.id} className="p-6 text-center border-r border-border last:border-r-0">
                      <span className="rounded-full bg-surface-alt px-3 py-1 text-xs uppercase font-black text-ink-strong">
                        {car.fuelType || "Petrol"}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* Transmission */}
                <tr className="border-t border-border">
                  <td className="p-6 bg-surface-alt/40 border-r border-border flex items-center gap-3">
                    <Settings className="h-4 w-4 text-ink-subtle" /> Gearbox
                  </td>
                  {cars.map(car => (
                    <td key={car.id} className="p-6 text-center border-r border-border last:border-r-0 text-ink-strong">
                      {car.transmission || "Manual"}
                    </td>
                  ))}
                </tr>
                {/* Mileage/KM */}
                <tr className="border-t border-border">
                  <td className="p-6 bg-surface-alt/40 border-r border-border flex items-center gap-3">
                    <Gauge className="h-4 w-4 text-ink-subtle" /> KM Driven
                  </td>
                  {cars.map(car => (
                    <td key={car.id} className="p-6 text-center border-r border-border last:border-r-0 text-ink-strong">
                      {car.mileage?.toLocaleString() || 0} km
                    </td>
                  ))}
                </tr>
                {/* CTA */}
                <tr className="border-t border-border bg-surface-alt/30">
                  <td className="p-6 border-r border-border"></td>
                  {cars.map(car => (
                    <td key={car.id} className="p-6 text-center border-r border-border last:border-r-0">
                      <Link 
                        href={`/cars/${car.id}`}
                        className="inline-block rounded-xl bg-primary-600 px-6 py-3 text-xs font-black text-white hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
                      >
                        View Details
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
