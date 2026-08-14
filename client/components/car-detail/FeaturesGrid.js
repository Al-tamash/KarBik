"use client";

import React, { useState } from "react";
import { Wind, Shield, Compass, Car, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeaturesGrid({ features = {} }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group our feature categories using the primary website brand color theme (primary-600)
  const categories = [
    {
      key: "comfort",
      label: "Comfort & Convenience",
      icon: <Wind className="h-5 w-5 text-primary-600" />,
      bg: "bg-primary-50",
      items: features.comfort || [],
    },
    {
      key: "safety",
      label: "Safety & Security",
      icon: <Shield className="h-5 w-5 text-primary-600" />,
      bg: "bg-primary-50",
      items: features.safety || [],
    },
    {
      key: "interior",
      label: "Interior Features",
      icon: <Compass className="h-5 w-5 text-primary-600" />,
      bg: "bg-primary-50",
      items: features.interior || [],
    },
    {
      key: "exterior",
      label: "Exterior Features",
      icon: <Car className="h-5 w-5 text-primary-600" />,
      bg: "bg-primary-50",
      items: features.exterior || [],
    },
  ];

  // Calculate the total number of populated features to decide if we show this block
  const totalFeaturesCount = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  if (totalFeaturesCount === 0) return null;

  return (
    <div className="mt-8 border-t border-neutral-200/60 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-display">
            Features & Equipment
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Verified equipment checklist for this vehicle.
          </p>
        </div>
        
        {/* Toggle button using the official website outline-primary style */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-sm btn-outline-primary inline-flex items-center gap-1.5 font-bold transition-all duration-200"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              View All {totalFeaturesCount} Features <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Grid of categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          // If category has no items, don't render it to avoid empty slots
          if (category.items.length === 0) return null;

          // Limit displayed items when collapsed to keep the UI clean and calm
          const displayedItems = isExpanded ? category.items : category.items.slice(0, 4);
          const hasHiddenItems = category.items.length > 4;

          return (
            <div
              key={category.key}
              className="rounded-xl border border-neutral-200/80 bg-white p-5 hover:shadow-md transition-shadow duration-200"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neutral-100">
                <div className={`p-2 rounded-lg ${category.bg}`}>
                  {category.icon}
                </div>
                <h3 className="text-base font-bold text-neutral-800 font-display">
                  {category.label}
                </h3>
              </div>

              {/* Checklist */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <AnimatePresence initial={false}>
                  {displayedItems.map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, delay: index * 0.03 }}
                      className="flex items-start gap-2.5 text-sm text-neutral-600 font-medium"
                    >
                      {/* Check icon colored in official brand style (text-primary-600) with clean stroke-3 width */}
                      <div className="mt-0.5 p-0.5 rounded-full bg-primary-50 text-primary-600 shrink-0">
                        <Check className="h-3 w-3 stroke-3" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {/* Muted feedback for hidden items */}
              {!isExpanded && hasHiddenItems && (
                <p className="text-xs text-primary-600 mt-4 font-semibold italic">
                  + {category.items.length - 4} more items in this category
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*
What you just learned:
- Brand integration constraints: aligning active indicators, badges, and icons to a single main brand tone (`primary-600` / `bg-primary-50`) makes interfaces feel handcrafted and completely professional.
- Balanced design scaling: having the exact same accent coloring across all categories builds strong visual unity and structure compared to uncoordinated multicolored grids.
*/
