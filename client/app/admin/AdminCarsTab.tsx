"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Search,
  ExternalLink,
  ShieldCheck,
  Award,
  Trash2,
  MapPin,
} from "lucide-react";
import cloudinaryLoader from "@/lib/cloudinary-loader";

export interface AdminCar {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  city: string;
  registrationNumber: string;
  isBoosted: boolean;
  rcVerified: boolean;
  pendingApproval?: boolean;
  isInspected: boolean;
  images: Array<{ url: string }> | null;
  createdAt: string;
  dealerId: string;
  dealerBusinessName: string | null;
}

interface AdminCarsTabProps {
  cars: AdminCar[];
  loading: boolean;
  onToggleBoost: (carId: string, currentBoosted: boolean) => Promise<void>;
  onToggleRcVerified: (carId: string, currentVerified: boolean) => Promise<void>;
  onDeleteCar: (carId: string) => Promise<void>;
  onApproveCar?: (carId: string) => Promise<void>;
}

export default function AdminCarsTab({
  cars,
  loading,
  onToggleBoost,
  onToggleRcVerified,
  onDeleteCar,
  onApproveCar,
}: AdminCarsTabProps) {
  const [search, setSearch] = useState("");
  const [operatingId, setOperatingId] = useState<string | null>(null);

  const filteredCars = cars.filter((car) => {
    const term = search.toLowerCase();
    return (
      car.title.toLowerCase().includes(term) ||
      car.brand.toLowerCase().includes(term) ||
      car.model.toLowerCase().includes(term) ||
      car.registrationNumber.toLowerCase().includes(term) ||
      (car.dealerBusinessName && car.dealerBusinessName.toLowerCase().includes(term))
    );
  });

  const handleBoost = async (carId: string, current: boolean) => {
    setOperatingId(carId);
    try {
      await onToggleBoost(carId, current);
    } finally {
      setOperatingId(null);
    }
  };

  const handleRc = async (carId: string, current: boolean) => {
    setOperatingId(carId);
    try {
      await onToggleRcVerified(carId, current);
    } finally {
      setOperatingId(null);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this vehicle listing?")) {
      return;
    }
    setOperatingId(carId);
    try {
      await onDeleteCar(carId);
    } finally {
      setOperatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search cars by brand, model, title, plate, or dealer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-alt/60 border border-border rounded-xl text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="text-xs font-semibold text-ink-muted select-none flex items-center gap-3">
          <span>Total Listed: <strong className="text-ink">{cars.length}</strong></span>
          <span>Featured: <strong className="text-accent-600">{cars.filter(c => c.isBoosted).length}</strong></span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-surface rounded-2xl border border-border">
          <div className="h-7 w-7 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <Car className="h-10 w-10 text-ink-subtle mx-auto mb-3" />
          <p className="text-sm font-semibold text-ink-strong">No vehicles match your search</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-alt/40 text-xs font-bold text-ink-subtle uppercase tracking-wider select-none">
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-4">Dealership / City</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-center">Status Badges</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCars.map((car) => {
                  const isBusy = operatingId === car.id;
                  const thumb = car.images?.[0]?.url;
                  const priceLakh = (car.price / 100000).toFixed(2);

                  return (
                    <tr key={car.id} className="hover:bg-surface-alt/40 transition-colors">
                      {/* Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-18 rounded-lg overflow-hidden bg-surface-alt shrink-0 border border-border">
                            {thumb ? (
                              <Image
                                loader={cloudinaryLoader}
                                src={thumb}
                                alt={car.title}
                                fill
                                sizes="72px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-ink-subtle">
                                <Car className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-ink-strong block leading-snug">
                              {car.title}
                            </span>
                            <span className="text-xs text-ink-muted block mt-0.5">
                              {car.year} • {car.fuelType} • {car.transmission} • {Number(car.mileage).toLocaleString("en-IN")} km
                            </span>
                            {car.registrationNumber && (
                              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-subtle block mt-0.5">
                                {car.registrationNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Showroom & Location */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-semibold text-xs text-ink block">
                            {car.dealerBusinessName || "Independent Showroom"}
                          </span>
                          <span className="text-xs text-ink-muted inline-flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {car.city || "Hyderabad"}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-ink text-sm">
                        ₹{priceLakh} L
                      </td>

                      {/* Status Badges */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
                          {car.rcVerified && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100">
                              <ShieldCheck className="h-3 w-3" /> RC OK
                            </span>
                          )}
                          {car.isBoosted && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-accent-700 bg-accent-50 border border-accent-200">
                              <Award className="h-3 w-3" /> Featured
                            </span>
                          )}
                          {car.pendingApproval && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-warning-700 bg-warning-50 border border-warning-200">
                              Pending approval
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {car.pendingApproval && onApproveCar && (
                            <button
                              onClick={() => void onApproveCar(car.id)}
                              disabled={isBusy}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 cursor-pointer disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleRc(car.id, car.rcVerified)}
                            disabled={isBusy}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              car.rcVerified
                                ? "border border-border text-ink-muted hover:bg-surface-alt"
                                : "bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100"
                            } disabled:opacity-50`}
                            title="Toggle RC paper verification"
                          >
                            {car.rcVerified ? "Unverify RC" : "Verify RC"}
                          </button>

                          <button
                            onClick={() => handleBoost(car.id, car.isBoosted)}
                            disabled={isBusy}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              car.isBoosted
                                ? "border border-accent-300 text-accent-700 bg-accent-50"
                                : "border border-border text-ink-muted hover:text-accent-600 hover:border-accent-300"
                            } disabled:opacity-50`}
                            title="Feature this car on homepage & search top"
                          >
                            {car.isBoosted ? "Unboost" : "Boost"}
                          </button>

                          <Link
                            href={`/cars/${car.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-border text-ink-muted hover:text-primary-600 transition-colors"
                            title="Open car listing"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(car.id)}
                            disabled={isBusy}
                            className="p-1.5 rounded-lg border border-danger-200 text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
                            title="Delete listing"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

