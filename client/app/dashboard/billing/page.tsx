"use client";

/**
 * Plan and billing for the signed-in dealer. Shows only what is recorded: the plan and its
 * expiry, cars listed against the plan limit, how many of them buyers can see, boost credits
 * left. There is no payment history or invoice list yet, so none is promised. Each block says
 * so when its own data did not load, instead of showing a plausible default. Dealers only;
 * buyers go to the dashboard and signed-out visitors to login.
 *
 * The plan limit counts every car that is not archived (live or waiting for approval), as
 * POST /api/cars does. KYC only decides how many of them buyers can see (lib/limits.ts).
 */

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useAppSession } from "@/lib/auth-client";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { UNVERIFIED_LIVE_LISTING_QUOTA } from "@/lib/limits";
import type { ApiMyPlanResponse } from "@/lib/api-types";

type Credits = { total: number; used: number; remaining: number };
type MyCar = { id: string; pendingApproval?: boolean };

function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-surface">
      <p role="status" className="text-sm text-ink-muted">
        Loading your plan…
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-8 border-t border-border pt-6">
      <h2 id={id} className="font-display text-xl font-bold text-ink-strong sm:text-2xl">
        {title}
      </h2>
      <div className="mt-2 space-y-2 text-base">{children}</div>
    </section>
  );
}

const NOT_LOADED = (
  <p role="alert" className="max-w-2xl text-base text-ink-muted">
    This did not load. Refresh the page.
  </p>
);

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useAppSession();

  const [planData, setPlanData] = useState<ApiMyPlanResponse | null>(null);
  // null means "did not load", which is shown as such and never as zero.
  const [cars, setCars] = useState<MyCar[] | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // Read once when the data arrives, so the render stays pure.
  const [loadedAt, setLoadedAt] = useState(0);

  const isDealer = session?.user?.role === "dealer";

  useEffect(() => {
    if (isPending) return;
    if (!session) router.push("/login?next=/dashboard/billing");
    else if (!isDealer) router.push("/dashboard");
  }, [isPending, session, isDealer, router]);

  useEffect(() => {
    if (!isDealer) return;
    let cancelled = false;
    async function load() {
      try {
        const opts = { credentials: "include" as const };
        const [planRes, carsRes, profileRes, creditsRes] = await Promise.all([
          fetch("/api/subscriptions/my-plan", opts),
          fetch("/api/cars/mine", opts),
          fetch("/api/dealers/profile", opts),
          fetch("/api/boosts/credits", opts),
        ]);
        if (!planRes.ok) throw new Error("plan");
        const plan = (await planRes.json()) as ApiMyPlanResponse;
        const mine = carsRes.ok ? ((await carsRes.json()) as unknown) : null;
        const profile = profileRes.ok ? ((await profileRes.json()) as { isVerified?: boolean }) : null;
        const credit = creditsRes.ok ? ((await creditsRes.json()) as Credits) : null;
        if (cancelled) return;
        setPlanData(plan);
        setCars(Array.isArray(mine) ? (mine as MyCar[]) : null);
        setVerified(profile ? Boolean(profile.isVerified) : null);
        setCredits(credit);
        setLoadedAt(Date.now());
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isDealer]);

  if (isPending || !session || !isDealer || loading) return <Loading />;

  const plan = planData?.plan ?? null;
  const subscription = planData?.subscription ?? null;
  const isFree = planData?.isFreeTier ?? true;

  const planLimit = plan ? plan.listingLimit : 5;
  const unlimited = planLimit >= 9999;
  const listed = cars ? cars.length : 0;
  const waiting = cars ? cars.filter((c) => c.pendingApproval).length : 0;
  const shown = listed - waiting;
  const atLimit = !unlimited && listed >= planLimit;
  const percent = unlimited ? 0 : Math.min(100, Math.round((listed / Math.max(1, planLimit)) * 100));

  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - loadedAt) / 86_400_000))
    : null;

  const priceLine = isFree || !plan ? "No charge" : `₹${(plan.priceMonthly / 100).toLocaleString("en-IN")} + GST a month`;

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Dashboard
        </Link>

        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-strong sm:text-5xl">
          Plan and billing
        </h1>

        {searchParams.get("success") === "true" && !isFree && (
          <p role="status" className="mt-4 text-base text-ink">
            Your plan is active.
          </p>
        )}

        {failed ? (
          <p role="alert" className="mt-6 text-base text-danger-700">
            Your plan did not load. Refresh the page, or{" "}
            <Link href="/contact" className="font-semibold underline underline-offset-2">
              message KarBik support
            </Link>
            .
          </p>
        ) : (
          <>
            <Section id="plan-heading" title={`${plan?.name ?? "Free"} plan`}>
              <p className="text-ink-muted tabular-nums">{priceLine}</p>
              {subscription && daysLeft !== null && (
                <p className="text-ink tabular-nums">
                  Active until {formatDate(subscription.endDate)} · {daysLeft} {daysLeft === 1 ? "day" : "days"} left.
                  Nothing renews by itself.
                </p>
              )}
            </Section>

            <Section id="cars-heading" title="Your cars">
              {cars === null ? (
                NOT_LOADED
              ) : (
                <>
                  <p className="text-ink tabular-nums">
                    {unlimited ? `${listed} cars listed` : `${listed} of ${planLimit} cars listed`}
                    {atLimit ? ". You have reached your limit." : ""}
                  </p>
                  {!unlimited && (
                    <div
                      role="meter"
                      aria-label="Cars listed against your plan limit"
                      aria-valuemin={0}
                      aria-valuemax={planLimit}
                      aria-valuenow={Math.min(listed, planLimit)}
                      aria-valuetext={`${listed} of ${planLimit} cars listed`}
                      className="h-2 w-full max-w-md overflow-hidden rounded-full bg-border"
                    >
                      <div className="h-full rounded-full bg-primary-600" style={{ width: `${percent}%` }} />
                    </div>
                  )}
                  <p className="text-ink-muted tabular-nums">
                    {shown} shown to buyers
                    {waiting > 0 ? `, ${waiting} waiting for KarBik approval` : ""}.
                  </p>
                  {verified === false && (
                    <p className="max-w-2xl text-ink-muted">
                      KarBik has not verified your KYC documents yet. Until it does, at most{" "}
                      {UNVERIFIED_LIVE_LISTING_QUOTA} cars are shown to buyers and the rest wait for approval. A plan does
                      not buy verification.
                    </p>
                  )}
                  {verified === null && (
                    <p className="max-w-2xl text-ink-muted">Your KYC status did not load. Refresh the page.</p>
                  )}
                </>
              )}
            </Section>

            <Section id="boost-heading" title="Boosts">
              {credits === null ? (
                NOT_LOADED
              ) : (
                <p className="max-w-2xl text-ink tabular-nums">
                  {credits.total > 0
                    ? `${credits.remaining} of ${credits.total} plan boosts left${
                        subscription ? ` until ${formatDate(subscription.endDate)}` : ""
                      } (3 days each).`
                    : "Your plan has no boost credits."}
                </p>
              )}
            </Section>

            <Section id="pay-heading" title="Payments">
              <p className="max-w-2xl text-ink">
                {PAYMENTS_ENABLED
                  ? "Each payment gives 30 days of the plan."
                  : "Online payments open soon. To start a paid plan, message KarBik support."}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                <Link href="/pricing" className="btn btn-outline btn-md">
                  See plans
                </Link>
                {!PAYMENTS_ENABLED && (
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 items-center font-semibold text-primary-600 underline underline-offset-2"
                  >
                    Message support
                  </Link>
                )}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BillingContent />
    </Suspense>
  );
}
