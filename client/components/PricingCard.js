"use client";

/**
 * PricingCard — Displays a single subscription tier
 *
 * WHAT: Custom-designed card incorporating design system variables (globals.css),
 *       Lucide icons for professional badges, dynamic visual yearly discounts,
 *       and tactile spring animations.
 * WHY:
 * 1. Elevates visual layout beyond the generic "flat-boxes" style.
 * 2. Uses pure CSS-first tokens to keep colors and shadows completely consistent.
 * 3. Incorporates clean spring motion hover transitions.
 */
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import RazorpayCheckout from "./RazorpayCheckout";

// Animated entry variant matching our PricingContent orchestration
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 16,
    },
  },
};

export default function PricingCard({
  plan,
  index,
  isRecommended,
  isCurrentPlan,
  isYearly,
  user,
  onSubscribe,
}) {
  // Convert paise from database to standard rupees
  const baseMonthlyPrice = plan.priceMonthly / 100;
  
  // Calculate visual yearly rate with a 20% discount if toggle is active
  const discountedMonthlyPrice = Math.round(baseMonthlyPrice * 0.8);
  const annualTotalBill = discountedMonthlyPrice * 12;

  // Visual text description per plan
  const planDescriptions = {
    free: "Essential features for individual sellers listing their first few vehicles.",
    starter: "Perfect for growing dealerships looking to dominate search results and track leads.",
    pro: "Full suite CRM, complete dealer analytics, and massive listings for large agencies.",
  };

  // Build high-end visual features list
  const featuresList = [
    {
      label: `${plan.listingLimit >= 9999 ? "Unlimited" : plan.listingLimit} car listings`,
      included: true,
    },
    {
      label: "Dealer dashboard access",
      included: plan.features?.dashboard,
    },
    {
      label: `${plan.boostsPerMonth} priority boosts / month`,
      included: plan.boostsPerMonth > 0,
    },
    {
      label: "Advanced analytics dashboard",
      included: plan.features?.analytics,
    },
    {
      label: "Direct WhatsApp buyer CRM",
      included: plan.features?.whatsappIntegration,
    },
    {
      label: "24/7 Priority support",
      included: plan.features?.prioritySupport,
    },
    {
      label: plan.features?.dealerBadge
        ? `"${plan.features.dealerBadge}" verification badge`
        : "Dealer verification badge",
      included: !!plan.features?.dealerBadge,
    },
  ];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 bg-white border-2 transition-shadow duration-300 h-full ${
        isRecommended
          ? "border-primary-500 shadow-[0_20px_40px_rgba(79,70,229,0.08)] ring-2 ring-primary-100/50"
          : "border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-primary-200 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
      }`}
    >
      {/* Recommended Pill Badge */}
      {isRecommended && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md border border-primary-400/20 flex items-center gap-1">
          <Sparkles className="h-3 w-3 animate-pulse" /> Recommended
        </span>
      )}

      {/* Plan Info */}
      <div className="grow">
        {/* Name */}
        <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight mb-2">
          {plan.name}
        </h3>

        {/* Short description */}
        <p className="text-xs text-neutral-500 leading-relaxed mb-6">
          {planDescriptions[plan.slug] || "Professional subscription plans for dealers."}
        </p>

        {/* Price Display Block */}
        <div className="mb-6 pb-6 border-b border-neutral-100">
          {plan.priceMonthly === 0 ? (
            <div>
              <p className="text-4xl font-black text-neutral-900 tracking-tight">
                Free
              </p>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mt-1">
                forever tier
              </span>
            </div>
          ) : isYearly ? (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-neutral-900 tracking-tight">
                  ₹{discountedMonthlyPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-semibold text-neutral-500">/mo</span>
              </div>
              <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider mt-1 bg-primary-50 px-2 py-0.5 rounded inline-block">
                Billed annually (₹{annualTotalBill.toLocaleString("en-IN")}/yr)
              </span>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-neutral-900 tracking-tight">
                  ₹{baseMonthlyPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-semibold text-neutral-500">/mo</span>
              </div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mt-1">
                billed monthly
              </span>
            </div>
          )}
        </div>

        {/* Included Features header */}
        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 block">
          What is included:
        </span>

        {/* Features list */}
        <ul className="space-y-3.5 mb-8">
          {featuresList.map((feature, i) => (
            <li
              key={i}
              className={`flex items-start gap-3 text-xs leading-tight ${
                feature.included ? "text-neutral-800 font-medium" : "text-neutral-400 line-through decoration-neutral-300"
              }`}
            >
              {/* Check / Cross custom indicators */}
              {feature.included ? (
                <span className="p-0.5 bg-success-50 text-success-600 rounded-full border border-success-100 shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </span>
              ) : (
                <span className="p-0.5 bg-neutral-50 text-neutral-300 rounded-full border border-neutral-100 shrink-0 mt-0.5">
                  <X className="h-3.5 w-3.5 stroke-[2.5]" />
                </span>
              )}
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button Action Zone */}
      <div className="mt-auto">
        {isCurrentPlan ? (
          <div className="w-full py-3 rounded-xl border border-success-200 bg-success-50/50 text-center text-xs font-black uppercase tracking-wider text-success-700 flex items-center justify-center gap-1.5 shadow-sm">
            <Check className="h-3.5 w-3.5 bg-success-600 text-white rounded-full p-0.5 stroke-3" /> Current active plan
          </div>
        ) : plan.priceMonthly === 0 ? (
          <div className="w-full py-3 rounded-xl border border-neutral-200 bg-neutral-100/50 text-center text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Default Plan
          </div>
        ) : user ? (
          <RazorpayCheckout
            plan={plan}
            user={user}
            isRecommended={isRecommended}
            onSuccess={onSubscribe}
          />
        ) : (
          <a
            href="/login"
            className="btn btn-md btn-outline btn-full shadow-xs hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50/30 text-xs tracking-wider uppercase font-bold py-3 rounded-xl transition-all block text-center"
          >
            Login to subscribe
          </a>
        )}
      </div>
    </motion.div>
  );
}
