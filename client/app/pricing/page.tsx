import Link from "next/link";
import type { Metadata } from "next";

import InfoPage, { InfoSection } from "@/components/info/InfoPage";
import PlanGrid from "@/components/pricing/PlanGrid";
import type { ApiPlan } from "@/lib/api-types";
import { API_BASE } from "@/lib/api-base";
import { BOOST_PLANS } from "@/lib/boosts";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { UNVERIFIED_LIVE_LISTING_QUOTA } from "@/lib/limits";

/**
 * Dealer plans. Server component: the plan rows come from the database, the sentences come from
 * what the product really does (see .impeccable/surfaces/app-pricing-page-tsx.md).
 */
export const metadata: Metadata = {
  title: "Dealer plans",
  description: "Plans for dealers on KarBik: car limits, boost credits, prices and how billing works.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "KarBik dealer plans",
    description: "Plans for dealers on KarBik: car limits, boost credits, prices and how billing works.",
    url: "/pricing",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "KarBik" }],
  },
};

// Plans come from the database on every request.
export const dynamic = "force-dynamic";

async function getPlans(): Promise<ApiPlan[]> {
  try {
    const res = await fetch(`${API_BASE}/api/subscriptions/plans`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as ApiPlan[];
  } catch {
    return [];
  }
}

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <InfoPage
      wide
      title="Dealer plans"
      intro={
        PAYMENTS_ENABLED
          ? "List your cars on KarBik. Buyer enquiries reach you after KarBik support has spoken to the buyer."
          : "Every dealer starts on Free. Paid plans open soon: message KarBik support and we will tell you when they start."
      }
    >
      {/* The one rule that changes what a plan is worth, read before the numbers. */}
      <p className="mt-4 max-w-2xl text-base text-ink">
        Until KarBik has verified your KYC documents, only {UNVERIFIED_LIVE_LISTING_QUOTA} of your cars are shown to
        buyers; the rest wait for approval. A plan does not buy verification.
      </p>

      {plans.length > 0 ? (
        <>
          <h2 className="sr-only">Plans</h2>
          <PlanGrid plans={plans} />
        </>
      ) : (
        <p className="mt-8 max-w-2xl text-base text-ink-muted">
          The plans did not load. Try again in a moment, or{" "}
          <Link href="/contact" className="font-semibold text-primary-600 underline underline-offset-2">
            message KarBik support
          </Link>
          .
        </p>
      )}

      <InfoSection title="Before you pay">
        <ul className="max-w-2xl list-disc space-y-3 pl-5">
          <li>
            <strong className="font-semibold text-ink-strong">The car limit counts every car you list,</strong> including
            cars still waiting for approval.
          </li>
          <li>
            <strong className="font-semibold text-ink-strong">Each payment gives 30 days.</strong> Nothing renews by
            itself, so there is nothing to cancel. When a plan ends you move to Free. Cars already listed stay, and you
            can add more once you have fewer cars listed than the Free limit. To go back to a paid plan, pay again.
          </li>
          <li>
            <strong className="font-semibold text-ink-strong">Prices are plus GST.</strong> Invoices are issued by Edone
            Solutions, the operator of KarBik, on request through the{" "}
            <Link href="/contact" className="font-semibold text-primary-600 underline underline-offset-2">
              contact page
            </Link>
            .
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Boosts">
        <p className="max-w-2xl">
          A boosted car is shown at the top of browse results with a Featured badge. Plan credits are 3-day boosts. You can
          also pay per boost
          {PAYMENTS_ENABLED ? "" : " once payments open"}:
        </p>
        <ul className="max-w-2xl divide-y divide-border border-y border-border tabular-nums">
          {Object.values(BOOST_PLANS).map((boost) => (
            <li key={boost.label} className="flex items-center justify-between py-3">
              <span>{boost.label}</span>
              <span className="font-semibold text-ink-strong">{rupees(boost.amount)} + GST</span>
            </li>
          ))}
        </ul>
      </InfoSection>

      <p className="mt-12 max-w-2xl border-t border-border pt-8 text-base text-ink">
        Questions about plans?{" "}
        <Link href="/faq#dealers" className="font-semibold text-primary-600 underline underline-offset-2">
          Read the dealer FAQ
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="font-semibold text-primary-600 underline underline-offset-2">
          message support
        </Link>
        .
      </p>
    </InfoPage>
  );
}
