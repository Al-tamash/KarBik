import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, plans, subscriptions } from "@/lib/db/schema";
import { apiHandler, requireDealer } from "@/lib/guards";
import { isValidRazorpaySignature } from "@/lib/razorpay-signature";

// A paid payment whose subscription is still missing after this long is treated
// as a half-finished activation and completed on the next verify call.
const ACTIVATION_RECOVERY_MS = 30_000;

type SubscriptionRow = typeof subscriptions.$inferSelect;

async function activateSubscription(payment: {
  id: string;
  dealer: string;
  plan: string;
}): Promise<SubscriptionRow> {
  // One active subscription at a time.
  await db
    .update(subscriptions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(subscriptions.dealer, payment.dealer),
        eq(subscriptions.status, "active")
      )
    );

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      dealer: payment.dealer,
      plan: payment.plan,
      status: "active",
      startDate,
      endDate,
      payment: payment.id,
    })
    .returning();
  return subscription;
}

async function respond(subscription: SubscriptionRow, planId: string, message: string) {
  const [plan] = await db
    .select({ name: plans.name })
    .from(plans)
    .where(eq(plans.id, planId))
    .limit(1);

  return Response.json({
    message,
    subscription: {
      plan: plan?.name ?? "",
      startDate: subscription.startDate,
      endDate: subscription.endDate,
    },
  });
}

// POST /api/payments/verify — step 2: verify signature + activate subscription.
//
// Safe to call more than once: a payment can activate a subscription exactly
// once, so replaying a valid signature never buys extra months.
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireDealer();
    const body =
      (await request.json()) as Record<"razorpay_order_id" | "razorpay_payment_id" | "razorpay_signature", string | undefined>;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { message: "Missing payment verification details" },
        { status: 400 }
      );
    }

    // The order must exist and belong to the caller. A single generic 404 avoids
    // revealing whether someone else's order id is real.
    const [existing] = await db
      .select()
      .from(payments)
      .where(eq(payments.razorpayOrderId, razorpay_order_id))
      .limit(1);
    if (!existing || existing.dealer !== user.id) {
      return Response.json({ message: "Payment record not found" }, { status: 404 });
    }

    // A bad signature is rejected without touching the order, so it cannot be
    // used to mark someone's genuine payment as failed.
    if (
      !isValidRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )
    ) {
      return Response.json(
        { message: "Payment verification failed — invalid signature" },
        { status: 400 }
      );
    }

    // Atomically claim the order: only one request can flip created → paid.
    const [claimed] = await db
      .update(payments)
      .set({
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(payments.id, existing.id),
          eq(payments.status, "created")
        )
      )
      .returning();

    if (claimed) {
      const subscription = await activateSubscription(claimed);
      return respond(
        subscription,
        claimed.plan,
        "Payment verified! Subscription activated."
      );
    }

    // Already processed (replay, double-click, retry). Report the existing result.
    const [current] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, existing.id))
      .limit(1);

    if (!current || current.status !== "paid") {
      return Response.json(
        { message: "This payment cannot be verified" },
        { status: 409 }
      );
    }

    // Replays must present the same payment id that was originally accepted.
    if (current.razorpayPaymentId !== razorpay_payment_id) {
      return Response.json(
        { message: "This order was already paid with a different payment" },
        { status: 409 }
      );
    }

    const [linked] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.payment, current.id))
      .limit(1);

    if (linked) {
      return respond(linked, current.plan, "Payment already verified.");
    }

    // Paid but no subscription: either another request is mid-activation, or a
    // previous one failed half way. Give a running request a moment, then finish it.
    if (Date.now() - current.updatedAt.getTime() < ACTIVATION_RECOVERY_MS) {
      return Response.json(
        { message: "Activation is in progress. Please refresh in a few seconds." },
        { status: 409 }
      );
    }

    const recovered = await activateSubscription(current);
    return respond(recovered, current.plan, "Subscription activated.");
  });
}
