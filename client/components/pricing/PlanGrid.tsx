"use client";

/**
 * The three plan cards plus the one thing only the browser knows: which plan the signed-in
 * dealer is on. Everything else on the page is rendered on the server.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PlanCard from "@/components/pricing/PlanCard";
import { useAppSession } from "@/lib/auth-client";
import type { ApiPlan } from "@/lib/api-types";

export default function PlanGrid({ plans }: { plans: ApiPlan[] }) {
  const router = useRouter();
  const { data: session } = useAppSession();
  const [currentSlug, setCurrentSlug] = useState("free");

  const isDealer = session?.user?.role === "dealer";

  const loadMyPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/subscriptions/my-plan", { credentials: "include" });
      const data = (await res.json()) as { plan?: { slug?: string } | null };
      if (data.plan?.slug) setCurrentSlug(data.plan.slug);
    } catch {
      // The cards still render; only the "Your current plan" marker is missing.
    }
  }, []);

  useEffect(() => {
    if (isDealer) void loadMyPlan();
  }, [isDealer, loadMyPlan]);

  const viewer = session?.user
    ? { role: session.user.role, name: session.user.name, email: session.user.email }
    : null;

  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrent={isDealer && plan.slug === currentSlug}
          viewer={viewer}
          onSubscribed={() => {
            void loadMyPlan();
            router.push("/dashboard/billing?success=true");
          }}
        />
      ))}
    </ul>
  );
}
