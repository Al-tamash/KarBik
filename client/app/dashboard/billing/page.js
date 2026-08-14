"use client";

/**
 * Billing Dashboard — Shows the dealer's subscription status
 *
 * What this page shows:
 * 1. Current plan name + badge
 * 2. Expiry date with days remaining
 * 3. Usage bar (X of Y listings used)
 * 4. Payment history table
 * 5. "Upgrade Plan" button → links to /pricing
 *
 * Only accessible to logged-in dealers.
 * Buyers are redirected to the main dashboard.
 */
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Sparkles } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

import { Suspense } from "react";

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const [planData, setPlanData] = useState(null);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success toast if redirected from payment
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSuccess(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Redirect non-dealers
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session?.user?.role !== "dealer") {
      router.push("/dashboard");
    }
  }, [isPending, session, router]);

  // Fetch subscription + listing count
  useEffect(() => {
    if (session?.user?.role === "dealer") {
      // eslint-disable-next-line react-hooks/immutability
      fetchBillingData();
    }
  }, [session]);

  async function fetchBillingData() {
    try {
      // Fetch both in parallel for faster loading
      const [planRes, carsRes] = await Promise.all([
        fetch(`${API}/api/subscriptions/my-plan`, { credentials: "include" }),
        fetch(`${API}/api/cars/mine`, { credentials: "include" }),
      ]);

      const planInfo = await planRes.json();
      const cars = await carsRes.json();

      setPlanData(planInfo);
      setListingCount(Array.isArray(cars) ? cars.length : 0);
    } catch (err) {
      console.error("Failed to fetch billing data:", err);
    }
    setLoading(false);
  }

  // Calculate days remaining until subscription expires
  function getDaysRemaining(endDate) {
    if (!endDate) return null;
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  if (isPending || loading || !session) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
          <p className="text-sm font-medium text-neutral-500">Loading billing...</p>
        </div>
      </div>
    );
  }

  const plan = planData?.plan;
  const subscription = planData?.subscription;
  const isFreeTier = planData?.isFreeTier;
  const daysLeft = subscription ? getDaysRemaining(subscription.endDate) : null;
  const listingLimit = plan?.listingLimit >= 9999 ? "Unlimited" : plan?.listingLimit || 5;
  const usagePercent = listingLimit === "Unlimited" ? 0 : Math.round((listingCount / plan?.listingLimit) * 100);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Success Toast */}
        {showSuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-3 animate-fade-in">
            {/* Styled vector sparkles instead of cheap unstyled celebration emoji */}
            <Sparkles className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">Subscription activated!</p>
              <p className="text-xs text-green-700">Your plan has been upgraded successfully.</p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Billing & Subscription</p>
            <h1 className="text-2xl font-bold text-neutral-900">Your Plan</h1>
          </div>
          <Link
            href="/pricing"
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 hover:shadow-md transition-all"
          >
            {isFreeTier ? "Upgrade Plan" : "Change Plan"}
          </Link>
        </div>

        {/* Current Plan Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-neutral-900">{plan?.name || "Free"} Plan</h2>
                {plan?.features?.dealerBadge && (
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                    {plan.features.dealerBadge}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500">
                {isFreeTier
                  ? "You're on the free tier. Upgrade for more listings and features."
                  : `${plan?.priceLabel} — renews monthly`}
              </p>
            </div>
            {!isFreeTier && (
              <div className="text-right">
                <p className="text-2xl font-extrabold text-neutral-900">
                  {daysLeft}<span className="text-sm font-normal text-neutral-500 ml-1">days left</span>
                </p>
                <p className="text-xs text-neutral-500">
                  Expires {new Date(subscription.endDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Usage Bar */}
          <div className="rounded-xl bg-neutral-50 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Listing Usage
              </p>
              <p className="text-sm font-bold text-neutral-900">
                {listingCount} / {listingLimit}
              </p>
            </div>
            {listingLimit !== "Unlimited" && (
              <div className="h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-amber-500" : "bg-primary-600"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            )}
            {listingLimit === "Unlimited" && (
              <p className="text-xs text-neutral-500 mt-1">Unlimited listings with your Pro plan</p>
            )}
          </div>
        </div>

        {/* Plan Features */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Plan Features</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Dealer Dashboard", active: plan?.features?.dashboard },
              { label: "Analytics", active: plan?.features?.analytics },
              { label: "WhatsApp Integration", active: plan?.features?.whatsappIntegration },
              { label: "Priority Support", active: plan?.features?.prioritySupport },
              { label: `${plan?.boostsPerMonth || 0} Boosts/month`, active: (plan?.boostsPerMonth || 0) > 0 },
              { label: plan?.features?.dealerBadge || "Dealer Badge", active: !!plan?.features?.dealerBadge },
            ].map((feat, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                  feat.active
                    ? "bg-green-50 text-green-800 font-medium"
                    : "bg-neutral-50 text-neutral-500 line-through"
                }`}
              >
                <span className="text-xs">{feat.active ? "✓" : "✗"}</span>
                {feat.label}
              </div>
            ))}
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link href="/dashboard" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
          <p className="text-sm font-medium text-neutral-500">Loading billing...</p>
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
