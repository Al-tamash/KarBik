import { and, count, eq, like } from "drizzle-orm";
import { db } from "@/lib/db";
import { boosts } from "@/lib/db/schema";
import { getActiveSubscription } from "@/lib/guards";

/** A plan credit buys this boost. The pricing page says "3-day spotlight". */
export const CREDIT_BOOST_TYPE = "3day" as const;
export const CREDIT_BOOST_DAYS = 3;

/**
 * Credit boosts are stored with a razorpayOrderId of "credit:<subscriptionId>:…"
 * so they can be counted per subscription period (each paid month is a new
 * subscription, so credits reset automatically) and are never mistaken for an
 * admin grant (amount 0 with NO order id) or a Razorpay order.
 */
export function creditOrderPrefix(subscriptionId: string): string {
  return `credit:${subscriptionId}:`;
}

export async function getBoostCredits(dealerId: string): Promise<{
  total: number;
  used: number;
  remaining: number;
  subscriptionId: string | null;
}> {
  const subscription = await getActiveSubscription(dealerId);
  if (!subscription || subscription.boostsPerMonth <= 0) {
    return { total: 0, used: 0, remaining: 0, subscriptionId: null };
  }

  const [row] = await db
    .select({ value: count() })
    .from(boosts)
    .where(
      and(
        eq(boosts.dealer, dealerId),
        like(boosts.razorpayOrderId, `${creditOrderPrefix(subscription.subscriptionId)}%`)
      )
    );

  const used = row?.value ?? 0;
  return {
    total: subscription.boostsPerMonth,
    used,
    remaining: Math.max(0, subscription.boostsPerMonth - used),
    subscriptionId: subscription.subscriptionId,
  };
}
