"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Fuel, Settings, Gauge, Calendar, IndianRupee } from "lucide-react";
import cloudinaryLoader from "@/lib/cloudinary-loader";

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * ComparePage — Side-by-side comparison of selected cars
 * 
 * Logic:
 * - Reads selected car IDs from localStorage
 * - Fetches details for all IDs
 * - Displays a comparison table
 */
export default function ComparePage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSelectedCars = async () => {
      const selectedIds = JSON.parse(localStorage.getItem("compareCars") || "[]");
      if (selectedIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all selected cars in parallel
        const promises = selectedIds.map(id => fetch(`${API}/api/cars/${id}`).then(res => res.json()));
        const data = await Promise.all(promises);
        setCars(data.filter(c => c && !c.message)); // Filter out errors
      } catch (err) {
        console.error("Comparison fetch failed:", err);
      }
      setLoading(false);
    };

    fetchSelectedCars();
  }, []);

  const removeCar = (id) => {
    const updated = cars.filter(c => c._id !== id);
    setCars(updated);
    localStorage.setItem("compareCars", JSON.stringify(updated.map(c => c._id)));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <Link href="/cars" className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-primary transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Inventory
            </Link>
            <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">Compare Listings</h1>
          </div>
          <div className="text-right">
             <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">{cars.length} Cars Selected</p>
          </div>
        </div>

        {cars.length === 0 ? (
          <div className="rounded-[3rem] bg-white p-20 text-center border border-neutral-200 shadow-xl">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-black text-neutral-900 mb-4">No cars selected for comparison</h2>
            <p className="text-neutral-500 mb-8 max-w-sm mx-auto font-medium">Add some cars from the inventory to see them side-by-side.</p>
            <Link href="/cars" className="inline-block rounded-2xl bg-neutral-900 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-neutral-900/20">
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2.5rem] border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/50">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-64 p-8 text-left bg-neutral-50/50 border-r border-neutral-100">
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Specifications</span>
                  </th>
                  {cars.map((car) => (
                    <th key={car._id} className="p-8 min-w-[300px] relative border-r border-neutral-100 last:border-r-0">
                      <button 
                        onClick={() => removeCar(car._id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-neutral-100">
                        {car.images?.length > 0 ? (
                          <Image 
                            loader={cloudinaryLoader}
                            src={car.images[0].url}
                            alt={car.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl">🚗</div>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-neutral-900 leading-tight">{car.title}</h3>
                      <p className="text-2xl font-black text-primary mt-2">₹{car.price?.toLocaleString("en-IN")}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm font-bold text-neutral-600">
                {/* Year */}
                <tr className="border-t border-neutral-100">
                  <td className="p-6 bg-neutral-50/30 border-r border-neutral-100 flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-neutral-400" /> Year
                  </td>
                  {cars.map(car => (
                    <td key={car._id} className="p-6 text-center border-r border-neutral-100 last:border-r-0 text-neutral-900">
                      {car.year}
                    </td>
                  ))}
                </tr>
                {/* Brand */}
                <tr className="border-t border-neutral-100">
                  <td className="p-6 bg-neutral-50/30 border-r border-neutral-100 flex items-center gap-3">
                    <ArrowLeft className="h-4 w-4 rotate-180 text-neutral-400" /> Brand
                  </td>
                  {cars.map(car => (
                    <td key={car._id} className="p-6 text-center border-r border-neutral-100 last:border-r-0 text-neutral-900">
                      {car.brand}
                    </td>
                  ))}
                </tr>
                {/* Fuel Type */}
                <tr className="border-t border-neutral-100">
                  <td className="p-6 bg-neutral-50/30 border-r border-neutral-100 flex items-center gap-3">
                    <Fuel className="h-4 w-4 text-neutral-400" /> Fuel
                  </td>
                  {cars.map(car => (
                    <td key={car._id} className="p-6 text-center border-r border-neutral-100 last:border-r-0">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] uppercase font-black text-neutral-900">
                        {car.fuelType || "Petrol"}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* Transmission */}
                <tr className="border-t border-neutral-100">
                  <td className="p-6 bg-neutral-50/30 border-r border-neutral-100 flex items-center gap-3">
                    <Settings className="h-4 w-4 text-neutral-400" /> Gearbox
                  </td>
                  {cars.map(car => (
                    <td key={car._id} className="p-6 text-center border-r border-neutral-100 last:border-r-0 text-neutral-900">
                      {car.transmission || "Manual"}
                    </td>
                  ))}
                </tr>
                {/* Mileage/KM */}
                <tr className="border-t border-neutral-100">
                  <td className="p-6 bg-neutral-50/30 border-r border-neutral-100 flex items-center gap-3">
                    <Gauge className="h-4 w-4 text-neutral-400" /> KM Driven
                  </td>
                  {cars.map(car => (
                    <td key={car._id} className="p-6 text-center border-r border-neutral-100 last:border-r-0 text-neutral-900">
                      {car.kmDriven?.toLocaleString() || 0} km
                    </td>
                  ))}
                </tr>
                {/* CTA */}
                <tr className="border-t border-neutral-100 bg-neutral-50/20">
                  <td className="p-6 border-r border-neutral-100"></td>
                  {cars.map(car => (
                    <td key={car._id} className="p-6 text-center border-r border-neutral-100 last:border-r-0">
                      <Link 
                        href={`/cars/${car._id}`}
                        className="inline-block rounded-xl bg-neutral-900 px-6 py-3 text-xs font-black text-white hover:bg-primary transition-all shadow-lg"
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
