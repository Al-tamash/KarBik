"use client";
import type { ApiPlan, ApiSubscription } from "@/lib/api-types";

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
import { authClient, useAppSession } from "@/lib/auth-client";
import { Sparkles, Check, X } from "lucide-react";



import { Suspense } from "react";

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useAppSession();

  const [planData, setPlanData] = useState<{ plan: ApiPlan | null; subscription: ApiSubscription | null; isFreeTier: boolean } | null>(null);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success toast if redirected from payment
  useEffect(() => {
    if (searchParams.get("success") === "true") {
       
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
        fetch(`/api/subscriptions/my-plan`, { credentials: "include" }),
        fetch(`/api/cars/mine`, { credentials: "include" }),
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
  function getDaysRemaining(endDate: string | null | undefined): number | null {
    if (!endDate) return null;
    // eslint-disable-next-line react-hooks/purity
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  if (isPending || loading || !session) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-surface-alt">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
          <p className="text-sm font-medium text-ink-muted">Loading billing...</p>
        </div>
      </div>
    );
  }

  const plan = planData?.plan;
  const subscription = planData?.subscription;
  const isFreeTier = planData?.isFreeTier;
   
  const daysLeft = subscription ? getDaysRemaining(subscription.endDate) : null;
  const listingLimit = (plan?.listingLimit ?? 0) >= 9999 ? "Unlimited" : plan?.listingLimit || 5;
  const usagePercent = listingLimit === "Unlimited" ? 0 : Math.round((listingCount / (plan?.listingLimit ?? 1)) * 100);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-surface-alt">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Success Toast */}
        {showSuccess && (
          <div className="mb-6 rounded-xl border border-success-200 bg-success-50 px-5 py-4 flex items-center gap-3 animate-fade-in">
            {/* Styled vector sparkles instead of cheap unstyled celebration emoji */}
            <Sparkles className="w-5 h-5 text-success-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-success-800">Subscription activated!</p>
              <p className="text-xs text-success-700">Your plan has been upgraded successfully.</p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-ink-muted mb-1">Billing & Subscription</p>
            <h1 className="text-2xl font-display font-bold text-ink-strong">Your Plan</h1>
          </div>
          <Link
            href="/pricing"
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 hover:shadow-md transition-all"
          >
            {isFreeTier ? "Upgrade Plan" : "Change Plan"}
          </Link>
        </div>

        {/* Current Plan Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-ink-strong">{plan?.name || "Free"} Plan</h2>
                {!isFreeTier && plan?.name && (
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                    {plan.name} Dealer
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-muted">
                {isFreeTier
                  ? "You're on the free tier. Upgrade for more listings and features."
                  : `${plan?.priceLabel} — each payment gives 30 days, no auto-renewal`}
              </p>
            </div>
            {!isFreeTier && (
              <div className="text-right">
                <p className="text-2xl font-extrabold text-ink-strong">
                  {daysLeft}<span className="text-sm font-normal text-ink-muted ml-1">days left</span>
                </p>
                <p className="text-xs text-ink-muted">
                  Expires {subscription && new Date(subscription.endDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Usage Bar */}
          <div className="rounded-xl bg-surface-alt p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Listing Usage
              </p>
              <p className="text-sm font-bold text-ink-strong">
                {listingCount} / {listingLimit}
              </p>
            </div>
            {listingLimit !== "Unlimited" && (
              <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent >= 90 ? "bg-danger-500" : usagePercent >= 70 ? "bg-warning-500" : "bg-primary-600"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            )}
            {listingLimit === "Unlimited" && (
              <p className="text-xs text-ink-muted mt-1">Unlimited listings with your Pro plan</p>
            )}
          </div>
        </div>

        {/* Plan Features */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-ink-strong mb-4">Plan Features</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Dealer Dashboard", active: plan?.features?.dashboard },
              { label: `${plan?.boostsPerMonth || 0} × 3-day boosts/month`, active: (plan?.boostsPerMonth || 0) > 0 },
              { label: `${plan?.name || "Plan"} dealer badge`, active: !isFreeTier },
            ].map((feat, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                  feat.active
                    ? "bg-success-50 text-success-800 font-medium"
                    : "bg-surface-alt text-ink-muted line-through"
                }`}
              >
                {feat.active ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <X className="h-3.5 w-3.5" aria-hidden />
                )}
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
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-surface-alt">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
          <p className="text-sm font-medium text-ink-muted">Loading billing...</p>
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
