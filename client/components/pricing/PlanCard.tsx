"use client";

/**
 * One dealer plan. Flat and equal to its neighbours: name, price (+ GST), what the plan really
 * gives, one action. Only facts from the plan row (car limit, boost credits) and the dashboard
 * are listed: no analytics, WhatsApp, badge or "recommended" (see
 * .impeccable/surfaces/app-pricing-page-tsx.md).
 */

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import RazorpayCheckout from "@/components/RazorpayCheckout";
import type { ApiPlan } from "@/lib/api-types";
import { BOOST_PLANS } from "@/lib/boosts";
import { PAYMENTS_ENABLED } from "@/lib/flags";

export type PlanViewer = { role?: string; name?: string; email?: string } | null;

export function carLimitLabel(plan: ApiPlan): string {
  return plan.listingLimit >= 9999 ? "Unlimited cars" : `Up to ${plan.listingLimit} cars`;
}

function Action({
  plan,
  viewer,
  onSubscribed,
}: {
  plan: ApiPlan;
  viewer: PlanViewer;
  onSubscribed: () => void;
}) {
  // RazorpayCheckout renders the "paid plans open soon" link itself while payments are off.
  if (!PAYMENTS_ENABLED) return <RazorpayCheckout plan={plan} user={viewer} onSuccess={onSubscribed} />;
  if (!viewer) {
    return (
      <Link href="/login?next=/pricing" className="btn btn-md btn-outline btn-full">
        Log in to subscribe
      </Link>
    );
  }
  if (viewer.role !== "dealer") {
    return (
      <Link href="/register?role=dealer" className="btn btn-md btn-outline btn-full">
        Register as a dealer
      </Link>
    );
  }
  return <RazorpayCheckout plan={plan} user={viewer} onSuccess={onSubscribed} />;
}

export default function PlanCard({
  plan,
  isCurrent,
  viewer,
  onSubscribed,
}: {
  plan: ApiPlan;
  isCurrent: boolean;
  viewer: PlanViewer;
  onSubscribed: () => void;
}) {
  const isFree = plan.priceMonthly === 0;
  const price = plan.priceMonthly / 100;

  const items = [
    carLimitLabel(plan),
    plan.boostsPerMonth > 0
      ? `${plan.boostsPerMonth} Spotlight boost${plan.boostsPerMonth > 1 ? "s" : ""} a month (3 days each)`
      : `Pay per boost, from ₹${BOOST_PLANS["1day"].amount / 100}${PAYMENTS_ENABLED ? "" : " once payments open"}`,
    "Dashboard with your listings and leads",
  ];

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-surface p-6">
      <h3 className="font-display text-xl font-bold text-ink-strong">{plan.name}</h3>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
        <span className="text-4xl font-extrabold tracking-tight text-ink-strong">
          ₹{price.toLocaleString("en-IN")}
        </span>
        <span className="text-sm text-ink-muted">{isFree ? "a month" : "+ GST a month"}</span>
      </p>

      <ul className="mt-5 space-y-3 text-base text-ink">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check className="mt-1 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        {isCurrent ? (
          <p className="flex min-h-11 items-center justify-center rounded-[0.625rem] border border-border-strong text-sm font-semibold text-ink">
            Your current plan
          </p>
        ) : isFree ? (
          <p className="text-sm text-ink-muted">Every dealer starts here.</p>
        ) : (
          <Action plan={plan} viewer={viewer} onSubscribed={onSubscribed} />
        )}
      </div>
    </li>
  );
}
