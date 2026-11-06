"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSession } from "@/lib/auth-client";
import { Sparkles, ArrowLeft, ShieldAlert } from "lucide-react";
import AddCarWizard from "../AddCarWizard";
import type { ApiPlan } from "@/lib/api-types";

export default function NewListingPage() {
  const router = useRouter();
  const { data: session, isPending } = useAppSession();
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{
    currentCount: number;
    listingLimit: number;
    planName: string;
  }>({ currentCount: 0, listingLimit: 5, planName: "Free" });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session?.user?.role !== "dealer") {
      router.push("/dashboard");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session?.user?.role === "dealer") {
      async function checkQuota() {
        try {
          const [planRes, carsRes] = await Promise.all([
            fetch("/api/subscriptions/my-plan", { credentials: "include" }),
            fetch("/api/cars/mine", { credentials: "include" }),
          ]);

          if (planRes.ok && carsRes.ok) {
            const planData = (await planRes.json()) as { plan?: ApiPlan };
            const carsData = (await carsRes.json()) as unknown[];

            const limit = planData?.plan?.listingLimit ?? 5;
            const planName = planData?.plan?.name ?? "Free";
            const currentCount = Array.isArray(carsData) ? carsData.length : 0;

            if (currentCount >= limit) {
              setLimitReached(true);
              setLimitInfo({
                currentCount,
                listingLimit: limit,
                planName,
              });
            }
          }
        } catch (err) {
          console.warn("Failed to check dealer listing limit upfront:", err);
        } finally {
          setCheckingLimit(false);
        }
      }
      void checkQuota();
    }
  }, [session]);

  if (isPending || !session || session.user.role !== "dealer" || checkingLimit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-alt">
        <div className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="min-h-screen bg-surface-alt flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-warning-50 text-warning-700 flex items-center justify-center mx-auto border border-warning-200">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold font-display text-ink-strong">
            Listing Limit Reached
          </h2>

          <p className="text-sm text-ink-muted leading-relaxed">
            You have active listings on the{" "}
            <strong className="text-ink">{limitInfo.planName} Plan</strong> (
            {limitInfo.currentCount} / {limitInfo.listingLimit} cars listed).
          </p>

          <div className="p-4 rounded-xl bg-surface-alt border border-border text-xs text-ink-muted leading-relaxed">
            Upgrade your dealer subscription to <strong>Starter (25 cars)</strong> or{" "}
            <strong>Pro (Unlimited cars)</strong> to continue publishing inventory.
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              href="/dashboard/billing"
              className="btn btn-primary btn-md rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade Dealer Subscription
            </Link>

            <Link
              href="/dashboard"
              className="btn btn-outline btn-md rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Showroom Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AddCarWizard />;
}
