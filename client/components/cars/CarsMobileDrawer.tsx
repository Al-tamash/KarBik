"use client";

/**
 * CarsMobileDrawer — Slide-over filter sheet for mobile
 *
 * WHAT: Full-screen/slide-over filter sheet with sticky bottom action bar.
 * WHY: Competitor benchmark (Spinny/Cars24) proves that mobile users convert best
 *      when they can see a dynamic "Show X Cars" button directly inside the drawer.
 */

import React, { useEffect } from "react";
import { X } from "lucide-react";
import CarsFilterSidebar, { FilterState } from "./CarsFilterSidebar";

interface CarsMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string | number) => void;
  onReset: () => void;
  brands: string[];
  totalMatches: number;
}

export default function CarsMobileDrawer({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  brands,
  totalMatches,
}: CarsMobileDrawerProps) {
  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl">
        <div className="flex-1 overflow-y-auto">
          <CarsFilterSidebar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            brands={brands}
            totalMatches={totalMatches}
            onCloseMobile={onClose}
          />
        </div>

        {/* Sticky Mobile Footer Action */}
        <div className="border-t border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="btn btn-outline flex-1 rounded-xl py-3 text-xs font-bold"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-cta flex-[2] rounded-xl py-3 text-sm font-bold"
            >
              Show {totalMatches} {totalMatches === 1 ? "Car" : "Cars"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

